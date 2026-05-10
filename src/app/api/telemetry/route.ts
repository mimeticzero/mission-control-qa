import { NextRequest } from 'next/server'

// ─── Server-side telemetry simulation (independent of client sim) ─────────────

const HOME = { lat: 49.0097, lng: 2.5479, altitude: 120 }

const WAYPOINTS = [
  { lat: 49.0097, lng: 2.5479, altitude: 120 },
  { lat: 49.0195, lng: 2.5610, altitude: 130 },
  { lat: 49.0345, lng: 2.5755, altitude: 140 },
  { lat: 49.0455, lng: 2.5620, altitude: 135 },
  { lat: 49.0440, lng: 2.5310, altitude: 145 },
  { lat: 49.0315, lng: 2.5105, altitude: 130 },
  { lat: 49.0155, lng: 2.5055, altitude: 120 },
  { lat: 49.0025, lng: 2.5255, altitude: 125 },
  { lat: 49.0005, lng: 2.5510, altitude: 118 },
]

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function buildTelemetry(tick: number) {
  const segCount  = WAYPOINTS.length
  const totalTicks = 600 // full patrol in 600 ticks (~10 min)
  const globalProg = (tick % totalTicks) / totalTicks
  const segProg    = globalProg * segCount
  const segIdx     = Math.floor(segProg) % segCount
  const segFrac    = segProg - Math.floor(segProg)

  const curr = WAYPOINTS[segIdx]
  const next = WAYPOINTS[(segIdx + 1) % segCount]

  const lat = lerp(curr.lat, next.lat, segFrac)
  const lng = lerp(curr.lng, next.lng, segFrac)
  const alt = lerp(curr.altitude, next.altitude, segFrac)
  const bat = Math.max(0, 100 - tick * 0.056)

  return {
    id:             'DRONE-001',
    callsign:       'FALCON-1',
    timestamp:      Date.now(),
    position:       { lat, lng, altitude: Math.round(alt) },
    speed:          parseFloat((10 + (Math.random() - 0.5) * 2).toFixed(1)),
    heading:        Math.round(Math.random() * 360),
    battery:        parseFloat(bat.toFixed(1)),
    batteryVoltage: parseFloat((14.8 * (bat / 100) + 10 * (1 - bat / 100)).toFixed(2)),
    signalStrength: Math.round(90 + (Math.random() - 0.5) * 10),
    flightMode:     'AUTO',
    status:         bat < 15 ? 'CRITICAL' : bat < 30 ? 'WARNING' : 'NOMINAL',
    distanceToHome: Math.round(Math.sqrt((lat - HOME.lat) ** 2 + (lng - HOME.lng) ** 2) * 111000),
    flightTime:     tick,
    gpsAccuracy:    parseFloat((0.7 + Math.random() * 0.5).toFixed(1)),
    satellites:     Math.round(13 + Math.random() * 3),
    _source:        'api-sse',
  }
}

// ─── GET /api/telemetry — Server-Sent Events ──────────────────────────────────

export async function GET(req: NextRequest) {
  let tick = 0
  let intervalId: ReturnType<typeof setInterval>

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: {"message":"Stream established","droneId":"DRONE-001"}\n\n`),
      )

      intervalId = setInterval(() => {
        try {
          tick++
          const telemetry = buildTelemetry(tick)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(telemetry)}\n\n`),
          )
        } catch {
          // Client disconnected
          clearInterval(intervalId)
          try { controller.close() } catch { /* already closed */ }
        }
      }, 1000)
    },
    cancel() {
      clearInterval(intervalId)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
