import { v4 as uuidv4 } from 'uuid'
import type {
  DroneTelemetry,
  DataLink,
  MissionEvent,
  Waypoint,
  DronePosition,
  Command,
  CommandType,
} from './types'
import type { DroneSimConfig } from './fleet-config'
import { FLEET_CONFIG } from './fleet-config'

// ─── Paris CDG — kept for MapView backward compat ────────────────────────────

export const HOME_POSITION: DronePosition = {
  lat: 49.0097,
  lng: 2.5479,
  altitude: 120,
}

export const PATROL_WAYPOINTS: Waypoint[] = [
  { lat: 49.0097, lng: 2.5479, altitude: 120, name: 'HOME'      },
  { lat: 49.0195, lng: 2.5610, altitude: 130, name: 'WP-ALPHA'  },
  { lat: 49.0345, lng: 2.5755, altitude: 140, name: 'WP-BRAVO'  },
  { lat: 49.0455, lng: 2.5620, altitude: 135, name: 'WP-CHARLIE'},
  { lat: 49.0440, lng: 2.5310, altitude: 145, name: 'WP-DELTA'  },
  { lat: 49.0315, lng: 2.5105, altitude: 130, name: 'WP-ECHO'   },
  { lat: 49.0155, lng: 2.5055, altitude: 120, name: 'WP-FOXTROT'},
  { lat: 49.0025, lng: 2.5255, altitude: 125, name: 'WP-GOLF'   },
  { lat: 49.0005, lng: 2.5510, altitude: 118, name: 'WP-HOTEL'  },
]

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function haversineMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6_371_000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function trueBearing(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const lat1R = (lat1 * Math.PI) / 180
  const lat2R = (lat2 * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(lat2R)
  const x =
    Math.cos(lat1R) * Math.sin(lat2R) -
    Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ─── Result type returned by DroneSim.tick() ─────────────────────────────────

export interface TickResult {
  telemetry: DroneTelemetry
  datalink:  DataLink
  event?:    Omit<MissionEvent, 'id' | 'timestamp'>
}

// ─── Pending command ──────────────────────────────────────────────────────────

interface PendingCommand {
  command:   Command
  resolveAt: number
  onAck:     (latency: number) => void
  onFail:    () => void
}

// ─── FlightMode local type (avoids circular dep with types.ts) ───────────────

type FlightMode = 'AUTO' | 'HOLD' | 'RTH' | 'EMERGENCY_LAND' | 'GOTO'

// ─── DroneSim — tick-driven, no own interval ─────────────────────────────────
// Managed externally by FleetSimulator (one shared interval drives all drones).

export class DroneSim {
  private wpIndex    = 0
  private progress   = 0        // 0→1 between wpIndex and wpIndex+1
  private battery:   number
  private flightTime = 0
  private lastHeading = 0
  private overrideMode: FlightMode | null = null
  private overridePos:  DronePosition | null = null
  private pendingCmds:  PendingCommand[] = []
  private forcedDisconnectUntil = 0  // timestamp; datalink forced offline until then
  private ewMode = false

  // Profile-driven parameters (resolved from cfg at construction time)
  private readonly SPEED_MS:         number
  private readonly BATTERY_DRAIN_RATE: number

  constructor(private readonly cfg: DroneSimConfig) {
    this.battery           = cfg.startBattery
    this.wpIndex           = cfg.startWpIndex % cfg.patrolRoute.length
    this.SPEED_MS          = cfg.nominalSpeedMs   ?? 10
    this.BATTERY_DRAIN_RATE = cfg.batteryDrainRate ?? 0.056
  }

  // ── Public API (called by FleetSimulator or ScriptEngine) ─────────────────

  /** Called once per 400 ms tick by FleetSimulator. Returns fresh telemetry. */
  tick(dtSec: number): TickResult {
    this.flightTime += dtSec
    this.battery = Math.max(0, this.battery - dtSec * this.BATTERY_DRAIN_RATE)

    this.processPendingCommands()

    let event: Omit<MissionEvent, 'id' | 'timestamp'> | undefined
    let pos: DronePosition

    if (this.overrideMode === 'HOLD') {
      pos = this.overridePos ?? this.interpPosition()

    } else if (this.overrideMode === 'RTH') {
      const curr = this.overridePos ?? this.interpPosition()
      const dist = haversineMeters(
        curr.lat, curr.lng, this.cfg.home.lat, this.cfg.home.lng,
      )
      if (dist < 5) {
        this.overrideMode = 'HOLD'
        this.overridePos  = this.cfg.home
        pos = this.cfg.home
        event = {
          type: 'STATUS_CHANGE',
          message: `${this.cfg.callsign}: RTH complete — holding at home`,
          severity: 'INFO',
        }
      } else {
        const step = Math.min(1, (this.SPEED_MS * dtSec) / dist)
        pos = {
          lat:      lerp(curr.lat,      this.cfg.home.lat,      step),
          lng:      lerp(curr.lng,      this.cfg.home.lng,      step),
          altitude: lerp(curr.altitude, this.cfg.home.altitude, 0.03),
        }
        this.overridePos = pos
        this.lastHeading = trueBearing(
          curr.lat, curr.lng, this.cfg.home.lat, this.cfg.home.lng,
        )
      }

    } else if (this.overrideMode === 'EMERGENCY_LAND') {
      const curr = this.overridePos ?? this.interpPosition()
      pos = { ...curr, altitude: Math.max(0, curr.altitude - 3 * dtSec) }
      this.overridePos = pos
      if (pos.altitude <= 0) {
        event = {
          type: 'STATUS_CHANGE',
          message: `${this.cfg.callsign}: EMERGENCY_LAND complete — motors cut`,
          severity: 'WARNING',
        }
      }

    } else {
      // AUTO — advance along patrol route
      const curr = this.cfg.patrolRoute[this.wpIndex]
      const next = this.cfg.patrolRoute[(this.wpIndex + 1) % this.cfg.patrolRoute.length]
      const segDist = haversineMeters(curr.lat, curr.lng, next.lat, next.lng)
      this.progress += (this.SPEED_MS * dtSec) / segDist

      if (this.progress >= 1) {
        this.progress = 0
        this.wpIndex  = (this.wpIndex + 1) % this.cfg.patrolRoute.length
        const reached   = this.cfg.patrolRoute[this.wpIndex]
        const upcoming  = this.cfg.patrolRoute[(this.wpIndex + 1) % this.cfg.patrolRoute.length]
        event = {
          type:     'WAYPOINT',
          message:  `${this.cfg.callsign}: Reached ${reached.name} — next: ${upcoming.name}`,
          severity: 'INFO',
        }
      }

      pos = this.interpPosition()
      const c = this.cfg.patrolRoute[this.wpIndex]
      const n = this.cfg.patrolRoute[(this.wpIndex + 1) % this.cfg.patrolRoute.length]
      this.lastHeading = trueBearing(c.lat, c.lng, n.lat, n.lng)
    }

    const distHome = haversineMeters(
      pos.lat, pos.lng, this.cfg.home.lat, this.cfg.home.lng,
    )
    return {
      telemetry: this.buildTelemetry(pos, distHome),
      datalink:  this.buildDatalink(distHome),
      event,
    }
  }

  /** Initial snapshot emitted synchronously before the first interval tick. */
  initialTick(): TickResult {
    const pos  = this.cfg.patrolRoute[this.wpIndex]
    const dist = haversineMeters(
      pos.lat, pos.lng, this.cfg.home.lat, this.cfg.home.lng,
    )
    return {
      telemetry: this.buildTelemetry({ ...pos }, dist),
      datalink:  this.buildDatalink(dist),
    }
  }

  sendCommand(
    command: Command,
    onAck: (latency: number) => void,
    onFail: () => void,
  ) {
    const latency = 50 + Math.random() * 150
    command.latency = Math.round(latency)

    // 2% packet loss → 3 s timeout
    if (Math.random() < 0.02) {
      setTimeout(onFail, 3000)
      return
    }

    this.pendingCmds.push({
      command,
      resolveAt: Date.now() + latency,
      onAck,
      onFail,
    })
  }

  // ── ScriptEngine hooks ─────────────────────────────────────────────────────

  forceSetBattery(pct: number) { this.battery = Math.max(0, Math.min(100, pct)) }

  forceSetMode(mode: FlightMode | null) {
    this.overrideMode = mode
    if (mode !== null) this.overridePos = this.interpPosition()
  }

  forceDisconnectDatalink(durationMs: number) {
    this.forcedDisconnectUntil = Date.now() + durationMs
  }

  resetToAuto() {
    this.overrideMode = null
    this.overridePos  = null
  }

  setEwMode(on: boolean) { this.ewMode = on }

  // ── Internals ──────────────────────────────────────────────────────────────

  private interpPosition(): DronePosition {
    const curr = this.cfg.patrolRoute[this.wpIndex]
    const next  = this.cfg.patrolRoute[(this.wpIndex + 1) % this.cfg.patrolRoute.length]
    return {
      lat:      lerp(curr.lat,      next.lat,      this.progress),
      lng:      lerp(curr.lng,      next.lng,      this.progress),
      altitude: lerp(curr.altitude, next.altitude, this.progress),
    }
  }

  private processPendingCommands() {
    const now = Date.now()
    this.pendingCmds = this.pendingCmds.filter((p) => {
      if (now < p.resolveAt) return true
      p.onAck(Math.round(now - p.command.timestamp))
      this.overrideMode = p.command.type as FlightMode
      this.overridePos  = this.interpPosition()
      return false
    })
  }

  private buildTelemetry(pos: DronePosition, distHome: number): DroneTelemetry {
    const noise  = () => (Math.random() - 0.5) * 2
    const status =
      this.battery < 15 ? 'CRITICAL' :
      this.battery < 30 ? 'WARNING'  : 'NOMINAL'

    return {
      id:             this.cfg.id,
      callsign:       this.cfg.callsign,
      timestamp:      Date.now(),
      position:       pos,
      speed:          this.overrideMode === 'HOLD'
                        ? 0
                        : parseFloat((this.SPEED_MS + noise() * 0.5).toFixed(1)),
      heading:        Math.round((this.lastHeading + 360) % 360),
      battery:        parseFloat(this.battery.toFixed(1)),
      batteryVoltage: parseFloat(
        (14.8 * (this.battery / 100) + 10 * (1 - this.battery / 100)).toFixed(2),
      ),
      signalStrength: Math.max(20, Math.round(98 - (distHome / 8000) * 30 + noise() * 5)),
      flightMode:     (this.overrideMode ?? 'AUTO') as DroneTelemetry['flightMode'],
      status:         status as DroneTelemetry['status'],
      distanceToHome: Math.round(distHome),
      flightTime:     Math.round(this.flightTime),
      gpsAccuracy:    parseFloat((0.7 + Math.random() * 0.5).toFixed(1)),
      satellites:     Math.round(13 + Math.random() * 3),
      profileData:    this.buildProfileData(),
    }
  }

  private buildProfileData(): import('./types').ProfileData | undefined {
    const id = this.cfg.id
    // Ground vehicles (GV-*)
    if (id.startsWith('GV-')) {
      return {
        fuelLevel:    parseFloat(this.battery.toFixed(1)),  // fuel mirrors battery drain
        tirePressure: parseFloat((235 + (Math.random() - 0.5) * 8).toFixed(1)),
      }
    }
    // Maritime vessels (MV-*)
    if (id.startsWith('MV-')) {
      return {
        depth:        0,   // surface patrol (all vessels in this demo)
        waveHeight:   parseFloat((0.5 + Math.random() * 1.8).toFixed(1)),
        currentSpeed: parseFloat((0.2 + Math.random() * 0.6).toFixed(2)),
      }
    }
    // UGVs (UGV-*)
    if (id.startsWith('UGV-')) {
      const statuses: Array<'READY' | 'ACTIVE' | 'COOLING'> = ['READY', 'ACTIVE', 'COOLING']
      return {
        clearance:      parseFloat((20 + Math.random() * 25).toFixed(1)),
        armorIntegrity: Math.max(70, Math.round(100 - (100 - this.battery) * 0.1)),
        payloadStatus:  statuses[Math.floor(this.flightTime / 30) % 3],
      }
    }
    return undefined
  }

  private buildDatalink(distHome: number): DataLink {
    // Forced disconnect (ScriptEngine datalink-loss scenario)
    if (Date.now() < this.forcedDisconnectUntil) {
      return {
        connected:     false,
        latency:       9999,
        packetLoss:    100,
        rssi:          -90,
        lastHeartbeat: this.forcedDisconnectUntil - 10_000,
        uptime:        Math.round(this.flightTime),
      }
    }

    // EW mode: high latency + packet loss
    const baseLatency = this.ewMode
      ? 200 + Math.random() * 600
      : 55  + (distHome / 8000) * 40
    const jitter      = Math.random() * (this.ewMode ? 120 : 60)
    const spike       = Math.random() < (this.ewMode ? 0.1 : 0.04) ? 120 : 0
    const baseLoss    = this.ewMode ? 5 + Math.random() * 5 : 0
    const spikeLoss   = !this.ewMode && Math.random() < 0.05 ? Math.random() * 3 : 0

    return {
      connected:     true,
      latency:       Math.round(baseLatency + jitter + spike),
      packetLoss:    parseFloat(Math.max(baseLoss, spikeLoss).toFixed(1)),
      rssi:          Math.round(-58 - (distHome / 8000) * 20 - Math.random() * 8),
      lastHeartbeat: Date.now(),
      uptime:        Math.round(this.flightTime),
    }
  }
}

// ─── Legacy DroneSimulator — thin wrapper for backward compat ─────────────────
// (demo/page.tsx no longer uses this; kept so any direct imports don't break.)

export type SimulatorCallback = (
  telemetry: DroneTelemetry,
  datalink:  DataLink,
  event?:    MissionEvent,
) => void

export class DroneSimulator {
  private sim: DroneSim
  private intervalId: ReturnType<typeof setInterval> | null = null
  private readonly TICK_MS = 400

  constructor(private readonly cb: SimulatorCallback) {
    this.sim = new DroneSim(FLEET_CONFIG[0])
  }

  start() {
    if (this.intervalId) return
    const { telemetry, datalink } = this.sim.initialTick()
    this.cb(telemetry, datalink)
    this.intervalId = setInterval(() => {
      const { telemetry, datalink, event } = this.sim.tick(this.TICK_MS / 1000)
      const fullEvent = event
        ? { ...event, id: uuidv4(), timestamp: Date.now() }
        : undefined
      this.cb(telemetry, datalink, fullEvent)
    }, this.TICK_MS)
  }

  stop() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null }
  }

  reset() {
    this.stop()
    this.sim = new DroneSim(FLEET_CONFIG[0])
  }

  sendCommand(
    command: Command,
    onAck: (latency: number) => void,
    onFail: () => void,
  ) {
    this.sim.sendCommand(command, onAck, onFail)
  }
}
