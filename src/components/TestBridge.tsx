'use client'

/**
 * E2E Test Bridge — exposed on window.__missionControl when ?__e2e=1 is in the URL.
 *
 * Never set in production (requires an explicit URL param).
 * Enables E2E tests to inject telemetry states without waiting for real-time simulation.
 *
 * Usage in Playwright:
 *   await page.goto('/demo?__e2e=1')
 *   await page.evaluate(() => window.__missionControl.injectLowBattery())
 */

import { useEffect } from 'react'
import { useDroneStore } from '@/store/use-drone-store'

export function TestBridge() {
  useEffect(() => {
    // Only activate via explicit URL param — never in production
    if (typeof window === 'undefined') return
    const isE2E = new URLSearchParams(window.location.search).get('__e2e') === '1'
    if (!isE2E) return

    const store = useDroneStore

    ;(window as Window & { __missionControl?: unknown }).__missionControl = {
      /** Read full store state */
      getState: () => store.getState(),

      /** Inject low battery scenario (battery = 10%, status = CRITICAL).
       *  Also freezes simulator updates so the injected state persists. */
      injectLowBattery: () => {
        const { telemetry } = store.getState()
        if (!telemetry) return
        store.setState({
          e2eFrozen: true,
          telemetry: {
            ...telemetry,
            battery:        10.0,
            batteryVoltage: 10.8,
            status:         'CRITICAL' as const,
          },
        })
      },

      /** Inject datalink loss scenario.
       *  Also freezes simulator updates so the injected state persists. */
      injectDatalinkLoss: () => {
        const { datalink } = store.getState()
        if (!datalink) return
        store.setState({
          e2eFrozen: true,
          datalink: {
            ...datalink,
            connected:     false,
            packetLoss:    100,
            latency:       9999,
            lastHeartbeat: Date.now() - 10_000, // pretend last HB was 10s ago
          },
        })
      },

      /** Restore datalink after simulated loss (also thaws simulator updates). */
      injectDatalinkRestore: () => {
        const { datalink } = store.getState()
        if (!datalink) return
        store.setState({
          e2eFrozen: false,
          datalink: {
            ...datalink,
            connected:     true,
            packetLoss:    0,
            latency:       65,
            lastHeartbeat: Date.now(),
          },
        })
      },

      /** Resume simulator updates (unfreeze injected state). */
      thaw: () => store.setState({ e2eFrozen: false }),

      /** Activate Electronic Warfare mode (degraded link conditions). */
      injectEwMode: () => store.setState({ ewMode: true }),

      /** Deactivate Electronic Warfare mode. */
      clearEwMode: () => store.setState({ ewMode: false }),
    }

    return () => {
      delete (window as Window & { __missionControl?: unknown }).__missionControl
    }
  }, [])

  return null
}

// Extend Window type for TypeScript
declare global {
  interface Window {
    __missionControl?: {
      getState:              () => unknown
      injectLowBattery:     () => void
      injectDatalinkLoss:   () => void
      injectDatalinkRestore: () => void
      thaw:                 () => void
      injectEwMode:         () => void
      clearEwMode:          () => void
    }
  }
}
