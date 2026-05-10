'use client'

import { useMemo } from 'react'
import { useDroneStore } from '@/store/use-drone-store'
import type { MissionEvent } from '@/lib/types'

const SEVERITY_STYLE: Record<MissionEvent['severity'], string> = {
  INFO:     'text-gcs-dim    border-l-gcs-border',
  WARNING:  'text-gcs-yellow border-l-gcs-yellow',
  CRITICAL: 'text-gcs-red   border-l-gcs-red animate-pulse',
}

const TYPE_ICON: Record<MissionEvent['type'], string> = {
  COMMAND:       'CMD',
  ALERT:         'ALT',
  STATUS_CHANGE: 'STS',
  WAYPOINT:      'WPT',
  SYSTEM:        'SYS',
}

function formatEventTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2,'0')}:${
    String(d.getMinutes()).padStart(2,'0')}:${
    String(d.getSeconds()).padStart(2,'0')}`
}

export function MissionTimeline({ className = '' }: { className?: string }) {
  const events   = useDroneStore((s) => s.events)
  const commands = useDroneStore((s) => s.commands)

  const stats = useMemo(() => ({
    total:    events.length,
    warnings: events.filter((e) => e.severity === 'WARNING').length,
    critical: events.filter((e) => e.severity === 'CRITICAL').length,
    cmdsAck:  commands.filter((c) => c.status === 'ACKNOWLEDGED').length,
    cmdsFail: commands.filter((c) => c.status === 'FAILED').length,
  }), [events, commands])

  return (
    <div
      data-testid="mission-timeline"
      role="region"
      aria-label="Mission event timeline"
      className={`panel flex flex-col overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="panel-header">
        <span>Mission Timeline</span>
        <span className="text-gcs-dim text-[9px]">{events.length} EVENTS</span>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-px bg-gcs-border border-b border-gcs-border">
        {[
          { label: 'TOTAL',    value: stats.total,    color: 'text-gcs-dim'    },
          { label: 'WARN',     value: stats.warnings, color: 'text-gcs-yellow' },
          { label: 'CRIT',     value: stats.critical, color: 'text-gcs-red'    },
          { label: 'CMD ACK',  value: stats.cmdsAck,  color: 'text-gcs-green'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gcs-panel p-1.5 text-center">
            <div className={`text-sm font-bold tabular-nums ${color}`}>{value}</div>
            <div className="data-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gcs-dim text-xs tracking-widest">NO EVENTS YET</span>
          </div>
        ) : (
          <div
            data-testid="event-list"
            role="log"
            aria-label="Mission events log"
            aria-live="polite"
            className="divide-y divide-gcs-border"
          >
            {events.map((ev) => (
              <div
                key={ev.id}
                data-testid="event-item"
                className={`
                  flex gap-2 px-2 py-1.5 border-l-2 animate-fade-in
                  hover:bg-white/[0.02] transition-colors
                  ${SEVERITY_STYLE[ev.severity]}
                `}
                style={{ borderLeftColor: ev.severity === 'CRITICAL' ? '#ef4444' :
                                          ev.severity === 'WARNING'  ? '#fbbf24' : '#1a2332' }}
              >
                {/* Time */}
                <span className="text-gcs-dim text-[9px] flex-shrink-0 mt-px tabular-nums">
                  {formatEventTime(ev.timestamp)}
                </span>

                {/* Type badge */}
                <span className={`
                  text-[9px] font-bold tracking-widest px-1 border flex-shrink-0 mt-px self-start
                  ${ev.severity === 'CRITICAL' ? 'border-gcs-red   text-gcs-red'
                  : ev.severity === 'WARNING'  ? 'border-gcs-yellow text-gcs-yellow'
                  : 'border-gcs-border text-gcs-muted'}
                `}>
                  {TYPE_ICON[ev.type]}
                </span>

                {/* Message */}
                <span className="text-[10px] leading-snug break-words min-w-0">
                  {ev.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Command summary strip */}
      {commands.length > 0 && (
        <div className="border-t border-gcs-border">
          <div className="panel-header border-b-0">
            <span>Last Commands</span>
          </div>
          <div className="divide-y divide-gcs-border max-h-24 overflow-y-auto">
            {commands.slice(0, 5).map((cmd) => (
              <div key={cmd.id} className="flex items-center gap-2 px-2 py-1 text-[10px]">
                <span className="text-gcs-dim tabular-nums flex-shrink-0">
                  {formatEventTime(cmd.timestamp)}
                </span>
                <span className="text-gcs-cyan font-bold tracking-wider flex-shrink-0">
                  {cmd.type}
                </span>
                <span className={`
                  ml-auto font-bold text-[9px] tracking-widest
                  ${cmd.status === 'ACKNOWLEDGED' ? 'text-gcs-green'  : ''}
                  ${cmd.status === 'FAILED'       ? 'text-gcs-red'    : ''}
                  ${cmd.status === 'PENDING'       ? 'text-gcs-yellow' : ''}
                  ${cmd.status === 'SENT'          ? 'text-gcs-dim'   : ''}
                `}>
                  {cmd.status}
                  {cmd.latency && cmd.status === 'ACKNOWLEDGED'
                    ? ` ${cmd.latency}ms` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
