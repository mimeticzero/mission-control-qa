import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type {
  DroneTelemetry,
  DataLink,
  MissionEvent,
  Command,
  CommandType,
  GotoPayload,
  TelemetrySnapshot,
} from '@/lib/types'

// ─── Fleet member (per-drone state held in the store) ─────────────────────────

export interface FleetMemberState {
  telemetry: DroneTelemetry
  datalink:  DataLink
  history:   TelemetrySnapshot[]    // ring-buffer, last 180 snapshots
  commands:  Command[]              // per-drone command queue
  trail:     [number, number][]     // last 30 map positions [lat, lng]
}

// ─── Batch update payload (from FleetSimulator) ───────────────────────────────

export interface FleetUpdate {
  id:        string
  telemetry: DroneTelemetry
  datalink:  DataLink
  event?:    Omit<MissionEvent, 'id' | 'timestamp'>
}

// ─── Store shape ─────────────────────────────────────────────────────────────

interface DroneStore {
  // ── Fleet ─────────────────────────────────────────────────────────────────
  fleet:           Record<string, FleetMemberState>
  selectedDroneId: string

  // ── Selected-drone aliases (kept at top-level for backward compat) ────────
  // All existing components read from these fields via useDroneStore selectors.
  telemetry: DroneTelemetry | null
  datalink:  DataLink | null
  history:   TelemetrySnapshot[]
  commands:  Command[]

  // ── Global ────────────────────────────────────────────────────────────────
  events:       MissionEvent[]
  isSimulating: boolean
  e2eFrozen:    boolean            // blocks simulator updates in E2E tests
  ewMode:       boolean            // Electronic Warfare degraded-environment mode

  // ── Actions (existing, preserved for backward compat) ─────────────────────
  setSimulating:      (v: boolean) => void
  setE2eFrozen:       (v: boolean) => void
  /** Update selected drone's telemetry (legacy single-drone path). */
  updateTelemetry:    (t: DroneTelemetry, d: DataLink) => void
  pushEvent:          (e: Omit<MissionEvent, 'id' | 'timestamp'>) => void
  dispatchCommand:    (type: CommandType, payload?: GotoPayload) => Command
  acknowledgeCommand: (id: string, latency: number) => void
  failCommand:        (id: string) => void
  clearEvents:        () => void

  // ── Actions (new for fleet / EW) ──────────────────────────────────────────
  /** Switch the active drone; syncs top-level aliases to new drone's state. */
  selectDrone:        (droneId: string) => void
  setEwMode:          (v: boolean) => void
  /** Batch fleet update from FleetSimulator (one call per 400 ms tick). */
  batchUpdateFleet:   (updates: FleetUpdate[]) => void
  /** Acknowledge a command for a specific drone. */
  acknowledgeCommandFor: (droneId: string, id: string, latency: number) => void
  failCommandFor:        (droneId: string, id: string) => void
  /** Dispatch a command to a specific drone (not necessarily the selected one). */
  dispatchCommandTo:  (droneId: string, type: CommandType, payload?: GotoPayload) => Command
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useDroneStore = create<DroneStore>((set, get) => ({
  // Initial state
  fleet:           {},
  selectedDroneId: 'DR-001',

  telemetry:    null,
  datalink:     null,
  history:      [],
  commands:     [],
  events:       [],
  isSimulating: false,
  e2eFrozen:    false,
  ewMode:       false,

  // ── Basic flags ───────────────────────────────────────────────────────────

  setSimulating: (isSimulating) => set({ isSimulating }),

  setE2eFrozen: (e2eFrozen) => set({ e2eFrozen }),

  setEwMode: (ewMode) => set({ ewMode }),

  // ── Drone selection ───────────────────────────────────────────────────────

  selectDrone: (droneId) =>
    set((s) => {
      const member = s.fleet[droneId]
      if (!member) return { selectedDroneId: droneId }
      return {
        selectedDroneId: droneId,
        telemetry:       member.telemetry,
        datalink:        member.datalink,
        history:         member.history,
        commands:        member.commands,
      }
    }),

  // ── Batch fleet update (FleetSimulator → store, one call per tick) ────────

  batchUpdateFleet: (updates) =>
    set((s) => {
      // E2E injection freeze — block simulator updates
      if (s.e2eFrozen) return {}

      const newFleet = { ...s.fleet }
      const newEvents: MissionEvent[] = []

      for (const { id, telemetry, datalink, event } of updates) {
        const prev = newFleet[id]
        const trail: [number, number][] = [
          ...((prev?.trail ?? []).slice(-29)),
          [telemetry.position.lat, telemetry.position.lng],
        ]
        const snapshot: TelemetrySnapshot = {
          timestamp: telemetry.timestamp,
          altitude:  telemetry.position.altitude,
          speed:     telemetry.speed,
          battery:   telemetry.battery,
          latency:   datalink.latency,
        }
        newFleet[id] = {
          telemetry,
          datalink,
          history:  [...(prev?.history ?? []).slice(-179), snapshot],
          commands: prev?.commands ?? [],
          trail,
        }
        if (event) {
          newEvents.push({ id: uuidv4(), timestamp: Date.now(), ...event })
        }
      }

      // Sync selected-drone top-level aliases
      const selected = newFleet[s.selectedDroneId]
      const result: Partial<DroneStore> = { fleet: newFleet }
      if (selected) {
        result.telemetry = selected.telemetry
        result.datalink  = selected.datalink
        result.history   = selected.history
        result.commands  = selected.commands
      }
      if (newEvents.length > 0) {
        result.events = [
          ...newEvents,
          ...s.events.slice(0, 199 - newEvents.length),
        ]
      }
      return result as DroneStore
    }),

  // ── Legacy single-drone update (still works — updates selected drone) ──────

  updateTelemetry: (t, d) =>
    set((s) => {
      if (s.e2eFrozen) return {}
      const snapshot: TelemetrySnapshot = {
        timestamp: t.timestamp,
        altitude:  t.position.altitude,
        speed:     t.speed,
        battery:   t.battery,
        latency:   d.latency,
      }
      const prev = s.fleet[s.selectedDroneId]
      const trail: [number, number][] = [
        ...((prev?.trail ?? []).slice(-29)),
        [t.position.lat, t.position.lng],
      ]
      const newFleet = {
        ...s.fleet,
        [s.selectedDroneId]: {
          telemetry: t,
          datalink:  d,
          history:   [...(prev?.history ?? []).slice(-179), snapshot],
          commands:  prev?.commands ?? [],
          trail,
        },
      }
      return {
        fleet:     newFleet,
        telemetry: t,
        datalink:  d,
        history:   newFleet[s.selectedDroneId].history,
      }
    }),

  // ── Events ────────────────────────────────────────────────────────────────

  pushEvent: (e) =>
    set((s) => ({
      events: [{ id: uuidv4(), timestamp: Date.now(), ...e }, ...s.events.slice(0, 199)],
    })),

  clearEvents: () => set({ events: [] }),

  // ── Commands (selected drone) ─────────────────────────────────────────────

  dispatchCommand: (type, payload) => {
    const cmd: Command = {
      id:        uuidv4(),
      type,
      timestamp: Date.now(),
      payload,
      status:    'PENDING',
    }
    set((s) => {
      const droneId = s.selectedDroneId
      const prev    = s.fleet[droneId]
      const cmds    = [cmd, ...(prev?.commands ?? []).slice(0, 49)]
      return {
        commands: cmds,
        fleet: {
          ...s.fleet,
          [droneId]: prev ? { ...prev, commands: cmds } : prev,
        },
      }
    })
    return cmd
  },

  acknowledgeCommand: (id, latency) =>
    set((s) => {
      const droneId = s.selectedDroneId
      const mapper  = (c: Command) =>
        c.id === id ? { ...c, status: 'ACKNOWLEDGED' as const, latency } : c
      const cmds    = s.commands.map(mapper)
      const prev    = s.fleet[droneId]
      return {
        commands: cmds,
        fleet: {
          ...s.fleet,
          [droneId]: prev ? { ...prev, commands: prev.commands.map(mapper) } : prev,
        },
      }
    }),

  failCommand: (id) =>
    set((s) => {
      const droneId = s.selectedDroneId
      const mapper  = (c: Command) =>
        c.id === id ? { ...c, status: 'FAILED' as const } : c
      const cmds    = s.commands.map(mapper)
      const prev    = s.fleet[droneId]
      return {
        commands: cmds,
        fleet: {
          ...s.fleet,
          [droneId]: prev ? { ...prev, commands: prev.commands.map(mapper) } : prev,
        },
      }
    }),

  // ── Commands (specific drone — used by FleetSimulator ACK callbacks) ───────

  dispatchCommandTo: (droneId, type, payload) => {
    const cmd: Command = {
      id:        uuidv4(),
      type,
      timestamp: Date.now(),
      payload,
      status:    'PENDING',
    }
    set((s) => {
      const prev = s.fleet[droneId]
      const cmds = [cmd, ...(prev?.commands ?? []).slice(0, 49)]
      const update: Partial<DroneStore> = {
        fleet: { ...s.fleet, [droneId]: prev ? { ...prev, commands: cmds } : prev },
      }
      if (droneId === s.selectedDroneId) update.commands = cmds
      return update as DroneStore
    })
    return cmd
  },

  acknowledgeCommandFor: (droneId, id, latency) =>
    set((s) => {
      const mapper = (c: Command) =>
        c.id === id ? { ...c, status: 'ACKNOWLEDGED' as const, latency } : c
      const prev   = s.fleet[droneId]
      const update: Partial<DroneStore> = {
        fleet: {
          ...s.fleet,
          [droneId]: prev ? { ...prev, commands: prev.commands.map(mapper) } : prev,
        },
      }
      if (droneId === s.selectedDroneId) update.commands = s.commands.map(mapper)
      return update as DroneStore
    }),

  failCommandFor: (droneId, id) =>
    set((s) => {
      const mapper = (c: Command) =>
        c.id === id ? { ...c, status: 'FAILED' as const } : c
      const prev   = s.fleet[droneId]
      const update: Partial<DroneStore> = {
        fleet: {
          ...s.fleet,
          [droneId]: prev ? { ...prev, commands: prev.commands.map(mapper) } : prev,
        },
      }
      if (droneId === s.selectedDroneId) update.commands = s.commands.map(mapper)
      return update as DroneStore
    }),
}))
