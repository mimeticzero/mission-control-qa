'use client'

/**
 * C2 Timeline — horizontal event strip showing the last 5 minutes of mission events.
 *
 * Events from all drones appear as colored dots on a time axis.
 * Clicking a dot reveals event details and highlights the relevant drone tab.
 */

import { useState, useMemo } from 'react'
import { useDroneStore } from '@/store/use-drone-store'
import type { MissionEvent } from '@/lib/types'

const WINDOW_MS = 5 * 60 * 1_000  // 5-minute display window

const SEVERITY_COLOR: Record<string, string> = {
  INFO:     '#06b6d4',
  WARNING:  '#fbbf24',
  CRITICAL: '#ef4444',
}

function timeLabel(deltaSec: number): string {
  if (deltaSec < 60)  return `${Math.round(deltaSec)}s ago`
  return `${Math.round(deltaSec / 60)}m ago`
}

function formatHms(ts: number): string {
  return new Date(ts).toISOString().substring(11, 19)
}

export function C2Timeline() {
  const events = useDroneStore((s) => s.events)
  const [activeEvent, setActiveEvent] = useState<MissionEvent | null>(null)

  const now = Date.now()

  const visibleEvents = useMemo(() =>
    events
      .filter((e) => now - e.timestamp <= WINDOW_MS)
      .slice(0, 40),  // cap at 40 dots to avoid clutter
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events],
  )

  const windowStart = now - WINDOW_MS

  return (
    <div
      data-testid="c2-timeline"
      role="region"
      aria-label="C2 event timeline — last 5 minutes"
      className="
        flex-shrink-0 border-t border-gcs-border bg-gcs-panel
        flex flex-col select-none
      "
      style={{ height: '70px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-0.5 border-b border-gcs-border">
        <span className="text-[9px] tracking-widest text-gcs-dim uppercase font-bold">
          C2 Timeline — last 5 min
        </span>
        {activeEvent && (
          <button
            onClick={() => setActiveEvent(null)}
            className="text-[9px] text-gcs-dim hover:text-gcs-cyan transition-colors"
            aria-label="Close event detail"
          >
            ✕ close
          </button>
        )}
        {!activeEvent && (
          <span className="text-[9px] text-gcs-dim">
            {visibleEvents.length} events
          </span>
        )}
      </div>

      {/* Timeline bar + event dots */}
      <div className="flex-1 relative mx-3 flex items-center">
        {/* Background rail */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gcs-border" />

        {/* Time labels */}
        <span className="absolute left-0 bottom-0 text-[8px] text-gcs-dim">5m ago</span>
        <span className="absolute right-0 bottom-0 text-[8px] text-gcs-dim">now</span>

        {/* Event dots */}
        {visibleEvents.map((event) => {
          const xPct = ((event.timestamp - windowStart) / WINDOW_MS) * 100
          const color = SEVERITY_COLOR[event.severity] ?? '#718096'
          const isActive = activeEvent?.id === event.id

          return (
            <button
              key={event.id}
              data-testid="c2-event-dot"
              onClick={() => setActiveEvent(isActive ? null : event)}
              aria-label={`Event at ${formatHms(event.timestamp)}: ${event.message.slice(0, 60)}`}
              aria-pressed={isActive}
              className={`
                absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2
                top-1/2 transition-all duration-150
                focus:outline-none focus:ring-1 focus:ring-offset-0
                ${isActive ? 'scale-150 z-10' : 'hover:scale-125'}
              `}
              style={{
                left:            `${xPct}%`,
                backgroundColor: color,
                boxShadow:       isActive ? `0 0 6px ${color}` : undefined,
              }}
            />
          )
        })}

        {/* Active event detail tooltip */}
        {activeEvent && (() => {
          const xPct = ((activeEvent.timestamp - windowStart) / WINDOW_MS) * 100
          const color = SEVERITY_COLOR[activeEvent.severity] ?? '#718096'
          const deltaSec = (now - activeEvent.timestamp) / 1000
          // Flip label to left side if dot is in the right 40%
          const flipLeft = xPct > 60

          return (
            <div
              data-testid="c2-event-detail"
              role="tooltip"
              className="
                absolute bottom-full mb-1 z-20
                bg-gcs-panel border border-gcs-border
                px-2 py-1 text-[10px] font-mono max-w-[280px]
                shadow-lg pointer-events-none
              "
              style={{
                left:      flipLeft ? undefined : `${xPct}%`,
                right:     flipLeft ? `${100 - xPct}%` : undefined,
                borderColor: color,
              }}
            >
              <div className="flex gap-2 items-center mb-0.5">
                <span style={{ color }} className="font-bold">{activeEvent.severity}</span>
                <span className="text-gcs-dim">{formatHms(activeEvent.timestamp)}</span>
                <span className="text-gcs-dim">({timeLabel(deltaSec)})</span>
              </div>
              <div style={{ color }} className="leading-tight break-words">
                {activeEvent.message}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
