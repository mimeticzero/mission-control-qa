/**
 * FleetSimulator — manages 5 DroneSim instances with a single shared 400 ms interval.
 *
 * All 5 drones are ticked synchronously within one setInterval callback, then the
 * results are delivered to the caller as a single batch. This guarantees one React
 * re-render per tick instead of five.
 */

import { v4 as uuidv4 } from 'uuid'
import { DroneSim } from './drone-simulator'
import { FLEET_CONFIG } from './fleet-config'
import type { DroneSimConfig } from './fleet-config'
import type { DroneTelemetry, DataLink, MissionEvent, Command, CommandType, GotoPayload } from './types'
import type { FleetUpdate } from '../store/use-drone-store'

export type FleetBatchCallback = (updates: FleetUpdate[]) => void

export class FleetSimulator {
  private sims     = new Map<string, DroneSim>()
  private intervalId: ReturnType<typeof setInterval> | null = null
  private ewMode   = false
  private readonly TICK_MS = 400

  /**
   * @param onBatch  Called once per tick with telemetry for all vehicles.
   * @param configs  Fleet configuration. Defaults to the AERIAL fleet (FLEET_CONFIG).
   *                 Pass a different profile's fleet to switch operational context.
   */
  constructor(
    private readonly onBatch: FleetBatchCallback,
    configs: DroneSimConfig[] = FLEET_CONFIG,
  ) {
    for (const cfg of configs) {
      this.sims.set(cfg.id, new DroneSim(cfg))
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Start the fleet. Emits an initial batch synchronously (so TelemetryPanel
   * renders immediately and Playwright's gotoDemo() can detect it), then
   * continues every 400 ms via setInterval.
   */
  start() {
    if (this.intervalId) return
    this.emitBatch(true)
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
