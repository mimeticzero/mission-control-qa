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
import { useDroneStore } from '@/store/use-drone-store'

export class ScriptEngine {
  private timeoutIds: ReturnType<typeof setTimeout>[] = []

  constructor(private readonly fleet: FleetSimulator) {}

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

    // t+30s — GHOST-4 battery critical
    this.at(30_000, () => {
      this.fleet.getSim('DR-004')?.forceSetBattery(19)
      this.fleet.getSim('DR-004')?.forceSetMode('RTH')
      push({
        type:     'ALERT',
        message:  '⚠ GHOST-4 [DR-004]: Battery CRITICAL 19 % — Auto RTH initiated',
        severity: 'CRITICAL',
      })
    })

    // t+60s — VIPER-2 datalink loss (8 s)
    this.at(60_000, () => {
      this.fleet.getSim('DR-002')?.forceDisconnectDatalink(8_000)
      push({
        type:     'ALERT',
        message:  '✗ VIPER-2 [DR-002]: Datalink lost — attempting autonomous reconnect',
        severity: 'CRITICAL',
      })
      this.at(68_000, () => {
        // Note: forceDisconnectDatalink expires automatically; just push the event
        push({
          type:     'STATUS_CHANGE',
          message:  '✓ VIPER-2 [DR-002]: Datalink restored — resuming East Terminal patrol',
          severity: 'INFO',
        })
      })
    })

    // t+90s — Intrusion alert → HAWK-3 redirected
    this.at(90_000, () => {
      push({
        type:     'ALERT',
        message:  '⚡ INTRUSION DETECTED — Zone B perimeter breach | HAWK-3 [DR-003] redirected',
        severity: 'WARNING',
      })
    })

    // t+120s — FALCON-1 patrol complete
    this.at(120_000, () => {
      push({
        type:     'WAYPOINT',
        message:  '✓ FALCON-1 [DR-001]: North perimeter sweep complete — 0 anomalies recorded',
        severity: 'INFO',
      })
    })

    // t+150s — C2 new tasking
    this.at(150_000, () => {
      push({
        type:     'COMMAND',
        message:  'C2 → FALCON-1 [DR-001]: New tasking — extended east perimeter sweep (12 nm)',
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
      // Reset GHOST-4 so the battery-critical drama can play again next loop
      this.fleet.getSim('DR-004')?.forceSetBattery(62)
      this.fleet.getSim('DR-004')?.resetToAuto()

      // Restart the loop
      this.stop()
      this.schedule()
    })
  }
}
