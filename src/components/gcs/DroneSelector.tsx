'use client'

/**
 * DroneSelector — horizontal strip of 5 tabs, one per fleet member.
 * Clicking a tab switches the active drone shown in the telemetry / command panels.
 */

import { useDroneStore } from '@/store/use-drone-store'
import { FLEET_CONFIG } from '@/lib/fleet-config'

export function DroneSelector() {
  const selectedId  = useDroneStore((s) => s.selectedDroneId)
  const fleet       = useDroneStore((s) => s.fleet)
  const selectDrone = useDroneStore((s) => s.selectDrone)

  return (
    <div
      data-testid="drone-selector"
      role="tablist"
      aria-label="Select active drone"
      className="
        flex gap-px bg-gcs-border border-b border-gcs-border
        flex-shrink-0 overflow-x-auto
      "
    >
      {FLEET_CONFIG.map((cfg) => {
        const member    = fleet[cfg.id]
        const battery   = member?.telemetry.battery ?? cfg.startBattery
        const isSelected = cfg.id === selectedId
        const status    = member?.telemetry.status ?? 'NOMINAL'

        const batteryColor =
          battery < 15 ? '#ef4444' :
          battery < 30 ? '#fbbf24' : cfg.color

        return (
          <button
            key={cfg.id}
            role="tab"
            aria-selected={isSelected}
            data-testid={`drone-tab-${cfg.id}`}
            onClick={() => selectDrone(cfg.id)}
            className={`
              flex-1 min-w-[120px] flex flex-col items-center gap-0.5
              px-3 py-1.5 text-[9px] tracking-widest uppercase font-bold
              transition-colors duration-150 relative
              focus:outline-none focus:ring-1 focus:ring-offset-0
              ${isSelected
                ? 'bg-gcs-panel border-b-2'
                : 'bg-gcs-bg hover:bg-gcs-panel/60'
              }
            `}
            style={isSelected ? { borderBottomColor: cfg.color } : undefined}
          >
            {/* Status dot */}
            <span
              className={`absolute top-1 right-2 w-1.5 h-1.5 rounded-full ${
                status === 'CRITICAL' ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor:
                  status === 'CRITICAL' ? '#ef4444' :
                  status === 'WARNING'  ? '#fbbf24' : cfg.color,
              }}
              aria-hidden="true"
            />

            {/* Callsign */}
            <span style={{ color: isSelected ? cfg.color : '#718096' }}>
              {cfg.callsign}
            </span>

            {/* Battery */}
            <span
              className="font-mono tabular-nums"
              style={{ color: batteryColor }}
              aria-label={`${battery.toFixed(0)} percent battery`}
            >
              {battery.toFixed(0)}%
            </span>

            {/* ID — use gcs-dim (#718096, 5.1:1 contrast) without opacity reduction */}
            <span className="text-gcs-dim">{cfg.id}</span>
          </button>
        )
      })}
    </div>
  )
}
