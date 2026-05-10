/**
 * FleetSimulator — manages 5 DroneSim instances with a single shared 400 ms interval.
 *
 * All 5 drones are ticked synchronously within one setInterval callback, then the
 * results are delivered to the caller as a single batch. This guarantees one React
 * re-render per tick instead of five.
 */

import { v4 as uuidv4 } from 'uuid'
import { DroneSim } from './drone-simulator'
import { FLEET_CONFIG, DEFAULT_DRONE_ID } from './fleet-config'
import type { DroneSimConfig } from './fleet-config'
import type { DroneTelemetry, DataLink, MissionEvent, Command, CommandType, GotoPayload } from './types'
import type { FleetUpdate } from '../store/use-drone-store'

export type FleetBatchCallback = (updates: FleetUpdate[]) => void

export class FleetSimulator {
  private sims     = new Map<string, DroneSim>()
  private intervalId: ReturnType<typeof setInterval> | null = null
  private ewMode   = false
  private readonly TICK_MS = 400

  constructor(private readonly onBatch: FleetBatchCallback) {
    for (const cfg of FLEET_CONFIG) {
      this.sims.set(cfg.id, new DroneSim(cfg))
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Start the fleet. Emits the first batch after one tick delay (400 ms), then
   * every 400 ms thereafter. The delay ensures any UI animations triggered at mount
   * time (e.g., event list fade-in) have completed before telemetry arrives, which
   * in turn lets Playwright's gotoDemo() helper return only after animations settle.
   */
  start() {
    if (this.intervalId) return
    this.intervalId = setInterval(() => this.emitBatch(false), this.TICK_MS)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  // ── EW mode ───────────────────────────────────────────────────────────────

  setEwMode(on: boolean) {
    this.ewMode = on
    this.sims.forEach((sim) => sim.setEwMode(on))
  }

  // ── Command dispatch ───────────────────────────────────────────────────────

  sendCommandTo(
    droneId: string,
    command: Command,
    onAck:   (latency: number) => void,
    onFail:  () => void,
  ) {
    this.sims.get(droneId)?.sendCommand(command, onAck, onFail)
  }

  // ── ScriptEngine access ────────────────────────────────────────────────────

  getSim(droneId: string): DroneSim | undefined {
    return this.sims.get(droneId)
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  private emitBatch(initial: boolean) {
    const updates: FleetUpdate[] = []
    const dtSec = this.TICK_MS / 1000

    for (const [id, sim] of this.sims) {
      const { telemetry, datalink, event } = initial
        ? sim.initialTick()
        : sim.tick(dtSec)

      // EW mode: 7% telemetry dropout for non-selected drones
      // (The demo page reads ewMode from the store; we handle it here
      //  via the sim's own ewMode flag which makes datalink degrade.)

      updates.push({
        id,
        telemetry,
        datalink,
        event: event ? event : undefined,
      })
    }

    this.onBatch(updates)
  }
}
