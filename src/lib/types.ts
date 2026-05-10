// ─── Drone State ─────────────────────────────────────────────────────────────

export type FlightMode = 'AUTO' | 'HOLD' | 'RTH' | 'EMERGENCY_LAND' | 'GOTO'
export type DroneStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE'
export type CommandType = 'RTH' | 'HOLD' | 'GOTO' | 'EMERGENCY_LAND'
export type CommandStatus = 'PENDING' | 'SENT' | 'ACKNOWLEDGED' | 'FAILED' | 'TIMEOUT'
export type EventSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type EventType = 'COMMAND' | 'ALERT' | 'STATUS_CHANGE' | 'WAYPOINT' | 'SYSTEM'

export interface DronePosition {
  lat: number
  lng: number
  altitude: number // meters AGL
}

export interface DroneTelemetry {
  id: string
  callsign: string
  timestamp: number
  position: DronePosition
  speed: number          // m/s ground speed
  heading: number        // 0–359 degrees true north
  battery: number        // 0–100 %
  batteryVoltage: number // volts
  signalStrength: number // 0–100 %
  flightMode: FlightMode
  status: DroneStatus
  distanceToHome: number // meters
  flightTime: number     // seconds
  gpsAccuracy: number    // HDOP
  satellites: number
}

export interface GotoPayload {
  lat: number
  lng: number
  altitude: number
}

export interface Command {
  id: string
  type: CommandType
  timestamp: number
  payload?: GotoPayload
  status: CommandStatus
  latency?: number // ms round-trip
}

export interface DataLink {
  connected: boolean
  latency: number    // ms
  packetLoss: number // 0–100 %
  rssi: number       // dBm (negative)
  lastHeartbeat: number
  uptime: number     // seconds
}

export interface MissionEvent {
  id: string
  timestamp: number
  type: EventType
  message: string
  severity: EventSeverity
}

export interface Waypoint {
  lat: number
  lng: number
  altitude: number
  name: string
}

// ─── Telemetry history point (kept in store ring-buffer) ─────────────────────

export interface TelemetrySnapshot {
  timestamp: number
  altitude: number
  speed: number
  battery: number
  latency: number
}
