import { NextRequest, NextResponse } from 'next/server'

const VALID_COMMANDS = ['RTH', 'HOLD', 'GOTO', 'EMERGENCY_LAND'] as const
const VALID_COMMANDS_SET = new Set<string>(VALID_COMMANDS)

function randomLatency(): number {
  return 50 + Math.random() * 150
}

function uid(): string {
  return `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── POST /api/commands ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { type, payload } = body as {
    type?: string
    payload?: { lat?: number; lng?: number; altitude?: number }
  }

  // Validate command type
  if (!type || !VALID_COMMANDS_SET.has(String(type))) {
    return NextResponse.json(
      {
        error:    'Invalid command type',
        valid:    VALID_COMMANDS,
        received: type,
      },
      { status: 422 },
    )
  }

  // Validate GOTO payload
  if (type === 'GOTO') {
    if (!payload || typeof payload.lat !== 'number' || typeof payload.lng !== 'number') {
      return NextResponse.json(
        { error: 'GOTO requires payload: { lat: number, lng: number, altitude?: number }' },
        { status: 422 },
      )
    }
  }

  // Simulate 2% packet loss
  if (Math.random() < 0.02) {
    await new Promise((r) => setTimeout(r, 3000))
    return NextResponse.json(
      { error: 'Command timeout — packet loss simulated', type, status: 'TIMEOUT' },
      { status: 504 },
    )
  }

  // Simulate datalink latency
  const latency = randomLatency()
  await new Promise((r) => setTimeout(r, latency))

  return NextResponse.json({
    id:        uid(),
    type,
    status:    'ACKNOWLEDGED',
    latency:   Math.round(latency),
    timestamp: Date.now(),
    payload:   payload ?? null,
    drone:     'DRONE-001',
  })
}

// ─── GET /api/commands — returns accepted command types ───────────────────────

export async function GET() {
  return NextResponse.json({
    commands: [
      { type: 'RTH',            description: 'Return To Home',                          payload: false },
      { type: 'HOLD',           description: 'Hold current position',                   payload: false },
      { type: 'GOTO',           description: 'Navigate to coordinates',                  payload: '{ lat, lng, altitude? }' },
      { type: 'EMERGENCY_LAND', description: 'Immediate descent at current position',    payload: false },
    ],
    drone:   'DRONE-001',
    version: '1.0.0',
  })
}
