/**
 * ScriptEngine — auto-fires mission events on a looping 3-minute schedule.
 *
 * Gives the demo "live drama": at any point a visitor arrives, something
 * interesting is about to happen or just happened. Events are visible in the
 * Mission Log and drive the C2 Timeline.
 *
 * Timeline (repeats every 180 s):
 *   t+30 s  GHOST-4 battery critical → auto RTH
 *   t+60 s  VIPER-2 datalink loss (8 s) → auto-reconnect
 *   t+90 s  Intrusion alert Zone-B → HAWK-3 redirected
 *   t+120 s FALCON-1 patrol sector complete
 *   t+150 s C2 assigns new tasking to FALCON-1
 *   t+178 s Cleanup + loop restart
 */

import type { FleetSimulator } from './fleet-simulator'
import type { DroneSimConfig } from './fleet-config'
import { FLEET_CONFIG } from './fleet-config'
import { useDroneStore } from '@/store/use-drone-store'

export class ScriptEngine {
  private timeoutIds: ReturnType<typeof setTimeout>[] = []
  private readonly configs: DroneSimConfig[]

  constructor(
    private readonly fleet: FleetSimulator,
    configs: DroneSimConfig[] = FLEET_CONFIG,
  ) {
    this.configs = configs
  }

  start() {
    this.schedule()
  }

  stop() {
    this.timeoutIds.forEach(clearTimeout)
    this.timeoutIds = []
  }

  // ── Private scheduling ────────────────────────────────────────────────────

  private at(delay: number, fn: () => void) {
    this.timeoutIds.push(setTimeout(fn, delay))
  }

  private schedule() {
    const push = useDroneStore.getState().pushEvent

    // Use vehicle indices so the script works with any profile's fleet
    const v1 = this.configs[0]  // primary / lead vehicle
    const v2 = this.configs[1]  // secondary
    const v3 = this.configs[2]  // tertiary
    const v4 = this.configs[3]  // vehicle that runs a battery-critical scenario

    if (!v1 || !v2 || !v3 || !v4) return

    // t+30s — v4 battery critical → auto RTH
    this.at(30_000, () => {
      this.fleet.getSim(v4.id)?.forceSetBattery(19)
      this.fleet.getSim(v4.id)?.forceSetMode('RTH')
      push({
        type:     'ALERT',
        message:  `⚠ ${v4.callsign} [${v4.id}]: Energy CRITICAL 19 % — Auto RTH initiated`,
        severity: 'CRITICAL',
      })
    })

    // t+60s — v2 datalink loss (8 s)
    this.at(60_000, () => {
      this.fleet.getSim(v2.id)?.forceDisconnectDatalink(8_000)
      push({
        type:     'ALERT',
        message:  `✗ ${v2.callsign} [${v2.id}]: Datalink lost — attempting autonomous reconnect`,
        severity: 'CRITICAL',
      })
      this.at(68_000, () => {
        push({
          type:     'STATUS_CHANGE',
          message:  `✓ ${v2.callsign} [${v2.id}]: Datalink restored — resuming ${v2.missionName}`,
          severity: 'INFO',
        })
      })
    })

    // t+90s — zone alert → v3 redirected
    this.at(90_000, () => {
      push({
        type:     'ALERT',
        message:  `⚡ ANOMALY DETECTED — Zone B | ${v3.callsign} [${v3.id}] redirected to investigate`,
        severity: 'WARNING',
      })
    })

    // t+120s — v1 sector complete
    this.at(120_000, () => {
      push({
        type:     'WAYPOINT',
        message:  `✓ ${v1.callsign} [${v1.id}]: ${v1.missionName} complete — 0 anomalies`,
        severity: 'INFO',
      })
    })

    // t+150s — C2 new tasking for v1
    this.at(150_000, () => {
      push({
        type:     'COMMAND',
        message:  `C2 → ${v1.callsign} [${v1.id}]: New tasking assigned — extended sector sweep`,
        severity: 'INFO',
      })
    })

    // t+178s — cleanup and loop
    this.at(178_000, () => {
      push({
        type:     'SYSTEM',
        message:  '↺ Mission cycle complete — operational schedule restarting',
        severity: 'INFO',
      })
      this.fleet.getSim(v4.id)?.forceSetBattery(v4.startBattery)
      this.fleet.getSim(v4.id)?.resetToAuto()
      this.stop()
      this.schedule()
    })
  }
}
