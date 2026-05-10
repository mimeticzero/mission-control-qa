'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useDroneStore } from '@/store/use-drone-store'
import type { CommandType } from '@/lib/types'

// ─── EMERGENCY_LAND arms for 3 seconds before it can be confirmed ─────────────
const EMRG_ARM_TIMEOUT_MS = 3000

const COMMAND_HELP: Record<string, string> = {
  RTH:            'Return To Home — navigates back to launch point',
  HOLD:           'Hold position — stationary hover',
  EMERGENCY_LAND: 'Emergency Land — immediate descent at current position',
  GOTO:           'GOTO <lat> <lng> [alt] — navigate to coordinates',
  STATUS:         'Show current drone status',
  CLEAR:          'Clear console log',
  HELP:           'Show available commands',
}

interface LogLine {
  id: string
  ts: string
  type: 'cmd' | 'ack' | 'err' | 'info' | 'sys'
  text: string
}

function formatTs(): string {
  return new Date().toISOString().substring(11, 23)
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

// ─── Quick-action button ──────────────────────────────────────────────────────

function CmdButton({
  label,
  onClick,
  variant = 'default',
  disabled = false,
  testId,
  ariaLabel,
}: {
  label: string
  onClick: () => void
  variant?: 'default' | 'warning' | 'critical'
  disabled?: boolean
  testId?: string
  ariaLabel?: string
}) {
  const colors = {
    default:  'border-gcs-border text-gcs-cyan  hover:border-gcs-cyan  hover:bg-gcs-cyan/10',
    warning:  'border-gcs-yellow text-gcs-yellow hover:bg-gcs-yellow/10',
    critical: 'border-gcs-red   text-gcs-red    hover:bg-gcs-red/10',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      aria-label={ariaLabel ?? label}
      className={`
        px-3 py-1.5 border text-[10px] font-bold tracking-widest uppercase
        transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed
        focus:outline-none focus:ring-1 focus:ring-gcs-cyan focus:ring-offset-1
        focus:ring-offset-gcs-bg
        ${colors[variant]}
      `}
    >
      {label}
    </button>
  )
}

// ─── Emergency confirm dialog ─────────────────────────────────────────────────

function EmergencyConfirmBanner({
  countdown,
  onConfirm,
  onCancel,
}: {
  countdown: number
  onConfirm: () => void
  onCancel:  () => void
}) {
  return (
    <div
      data-testid="emrg-confirm-dialog"
      role="alertdialog"
      aria-modal="false"
      aria-label="Emergency land confirmation required"
      className="
        border border-gcs-red bg-gcs-red/10 p-2 mx-2 mb-1
        animate-alert-pulse
      "
    >
      <p className="text-gcs-red text-[10px] font-bold tracking-wider mb-2">
        EMERGENCY_LAND ARMED — CONFIRM WITHIN {countdown}s
      </p>
      <div className="flex gap-2">
        <button
          data-testid="emrg-confirm-btn"
          onClick={onConfirm}
          aria-label="Confirm emergency land — drone will descend immediately"
          className="
            flex-1 py-1.5 border border-gcs-red bg-gcs-red text-white
            text-[10px] font-bold tracking-widest uppercase
            hover:bg-red-600 transition-colors
            focus:outline-none focus:ring-2 focus:ring-gcs-red focus:ring-offset-1
            focus:ring-offset-gcs-bg
          "
        >
          CONFIRM EMERGENCY_LAND
        </button>
        <button
          data-testid="emrg-cancel-btn"
          onClick={onCancel}
          aria-label="Cancel emergency land"
          className="
            px-3 py-1.5 border border-gcs-border text-gcs-muted
            text-[10px] font-bold tracking-widest uppercase
            hover:border-gcs-cyan hover:text-gcs-cyan transition-colors
            focus:outline-none focus:ring-1 focus:ring-gcs-cyan focus:ring-offset-1
            focus:ring-offset-gcs-bg
          "
        >
          CANCEL
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CommandConsole({
  onCommand,
  className = '',
}: {
  onCommand?: (type: CommandType, payload?: Record<string, number>) => void
  className?: string
}) {
  const [log, setLog]     = useState<LogLine[]>([
    { id: uid(), ts: formatTs(), type: 'sys', text: 'MISSION CONTROL CONSOLE v2.4.1 — ready' },
    { id: uid(), ts: formatTs(), type: 'sys', text: 'Type HELP for available commands.' },
  ])
  const [input, setInput]             = useState('')
  const [cmdHistory, setCmdHistory]   = useState<string[]>([])
  const [histIdx, setHistIdx]         = useState(-1)
  const [emrgArmed, setEmrgArmed]     = useState(false)
  const [emrgCountdown, setEmrgCountdown] = useState(EMRG_ARM_TIMEOUT_MS / 1000)
  const emrgTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const emrgArmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const logEndRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const commands = useDroneStore((s) => s.commands)
  const telemetry = useDroneStore((s) => s.telemetry)

  const addLine = useCallback((type: LogLine['type'], text: string) => {
    setLog((prev) => [...prev.slice(-199), { id: uid(), ts: formatTs(), type, text }])
  }, [])

  // Auto-scroll on new lines
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  // Show ACK/FAIL from store
  useEffect(() => {
    const last = commands[0]
    if (!last) return
    if (last.status === 'ACKNOWLEDGED')
      addLine('ack', `ACK ${last.type} — ${last.latency}ms RTT`)
    else if (last.status === 'FAILED')
      addLine('err', `TIMEOUT ${last.type} — no ACK after 3 s (packet loss?)`)
  }, [commands, addLine])

  // Clean up EMRG arm timers on unmount
  useEffect(() => () => {
    if (emrgTimerRef.current)  clearInterval(emrgTimerRef.current)
    if (emrgArmTimeout.current) clearTimeout(emrgArmTimeout.current)
  }, [])

  const dispatchCmd = useCallback((type: CommandType, payload?: Record<string, number>) => {
    addLine('cmd', `> ${type}${payload ? ` ${JSON.stringify(payload)}` : ''}`)
    addLine('info', `Sending ${type}… awaiting ACK`)
    onCommand?.(type, payload)
  }, [addLine, onCommand])

  // ─── Emergency land arming / confirm flow ────────────────────────────────

  const armEmergency = useCallback(() => {
    setEmrgArmed(true)
    setEmrgCountdown(EMRG_ARM_TIMEOUT_MS / 1000)
    addLine('sys', `⚠ EMERGENCY_LAND armed. Confirm within ${EMRG_ARM_TIMEOUT_MS / 1000}s or it will cancel.`)

    // Countdown ticker
    let remaining = EMRG_ARM_TIMEOUT_MS / 1000
    emrgTimerRef.current = setInterval(() => {
      remaining--
      setEmrgCountdown(remaining)
      if (remaining <= 0 && emrgTimerRef.current) {
        clearInterval(emrgTimerRef.current)
        emrgTimerRef.current = null
      }
    }, 1000)

    // Auto-cancel
    emrgArmTimeout.current = setTimeout(() => {
      setEmrgArmed(false)
      setEmrgCountdown(EMRG_ARM_TIMEOUT_MS / 1000)
      if (emrgTimerRef.current) { clearInterval(emrgTimerRef.current); emrgTimerRef.current = null }
      addLine('sys', 'EMERGENCY_LAND auto-cancelled — timeout expired.')
    }, EMRG_ARM_TIMEOUT_MS)
  }, [addLine])

  const confirmEmergency = useCallback(() => {
    if (emrgTimerRef.current)  { clearInterval(emrgTimerRef.current); emrgTimerRef.current = null }
    if (emrgArmTimeout.current) { clearTimeout(emrgArmTimeout.current); emrgArmTimeout.current = null }
    setEmrgArmed(false)
    setEmrgCountdown(EMRG_ARM_TIMEOUT_MS / 1000)
    dispatchCmd('EMERGENCY_LAND')
  }, [dispatchCmd])

  const cancelEmergency = useCallback(() => {
    if (emrgTimerRef.current)  { clearInterval(emrgTimerRef.current); emrgTimerRef.current = null }
    if (emrgArmTimeout.current) { clearTimeout(emrgArmTimeout.current); emrgArmTimeout.current = null }
    setEmrgArmed(false)
    setEmrgCountdown(EMRG_ARM_TIMEOUT_MS / 1000)
    addLine('info', 'EMERGENCY_LAND cancelled by operator.')
  }, [addLine])

  // ─── CLI input handling ──────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    const raw   = input.trim()
    if (!raw) return
    const parts = raw.toUpperCase().split(/\s+/)
    const cmd   = parts[0]

    setCmdHistory((h) => [raw, ...h.slice(0, 49)])
    setHistIdx(-1)
    setInput('')

    switch (cmd) {
      case 'RTH':
      case 'HOLD':
        dispatchCmd(cmd as CommandType)
        break

      case 'EMERGENCY_LAND':
        armEmergency()
        break

      case 'GOTO': {
        const lat = parseFloat(parts[1])
        const lng = parseFloat(parts[2])
        const alt = parseFloat(parts[3] ?? '120')
        if (isNaN(lat) || isNaN(lng)) {
          addLine('err', 'Usage: GOTO <lat> <lng> [alt=120]')
          return
        }
        dispatchCmd('GOTO', { lat, lng, altitude: alt })
        break
      }

      case 'STATUS':
        if (telemetry) {
          addLine('info', `CALLSIGN: ${telemetry.callsign} | MODE: ${telemetry.flightMode} | STATUS: ${telemetry.status}`)
          addLine('info', `POS: ${telemetry.position.lat.toFixed(5)}N ${telemetry.position.lng.toFixed(5)}E ALT: ${Math.round(telemetry.position.altitude)}m`)
          addLine('info', `BAT: ${telemetry.battery.toFixed(1)}% | SPD: ${telemetry.speed.toFixed(1)}m/s | HDG: ${telemetry.heading}°`)
        } else {
          addLine('err', 'No telemetry received yet')
        }
        break

      case 'CLEAR':
        setLog([{ id: uid(), ts: formatTs(), type: 'sys', text: 'Console cleared.' }])
        break

      case 'HELP':
        Object.entries(COMMAND_HELP).forEach(([k, v]) => addLine('info', `  ${k.padEnd(16, ' ')} ${v}`))
        break

      default:
        addLine('err', `Unknown command: ${raw}. Type HELP for command list.`)
    }
  }, [input, addLine, dispatchCmd, armEmergency, telemetry])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { handleSubmit(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(next)
      setInput(cmdHistory[next] ?? '')
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next)
      setInput(next === -1 ? '' : cmdHistory[next])
    }
  }, [handleSubmit, cmdHistory, histIdx])

  const LINE_COLORS: Record<LogLine['type'], string> = {
    cmd:  'text-gcs-cyan',
    ack:  'text-gcs-green',
    err:  'text-gcs-red',
    info: 'text-gcs-dim',
    sys:  'text-gcs-yellow',
  }

  return (
    <div
      data-testid="command-console"
      className={`panel flex flex-col overflow-hidden ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div className="panel-header">
        <span>Command Console</span>
        <span className="text-gcs-green text-[9px] tracking-widest">SECURE CHANNEL</span>
      </div>

      {/* EMRG confirmation overlay */}
      {emrgArmed && (
        <EmergencyConfirmBanner
          countdown={emrgCountdown}
          onConfirm={confirmEmergency}
          onCancel={cancelEmergency}
        />
      )}

      {/* Log */}
      <div
        data-testid="cmd-log"
        role="log"
        aria-label="Command log"
        aria-live="polite"
        className="flex-1 overflow-y-auto p-2 space-y-px font-mono text-[11px] leading-relaxed"
      >
        {log.map((line) => (
          <div key={line.id} className={`flex gap-2 animate-fade-in ${LINE_COLORS[line.type]}`}>
            <span className="text-gcs-dim flex-shrink-0 select-none" aria-hidden="true">
              {line.ts}
            </span>
            <span className="break-all">{line.text}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gcs-border p-2 flex items-center gap-2">
        <span className="text-gcs-cyan text-[11px] flex-shrink-0 select-none" aria-hidden="true">$</span>
        <input
          ref={inputRef}
          data-testid="cmd-input"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="TYPE COMMAND…"
          aria-label="Command input — type RTH, HOLD, GOTO, EMERGENCY_LAND, HELP"
          className={`
            flex-1 bg-transparent text-gcs-cyan text-[11px] tracking-wider
            placeholder:text-gcs-muted outline-none caret-gcs-cyan
            uppercase font-mono
          `}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Quick-action buttons */}
      <div className="border-t border-gcs-border p-2 flex gap-2 flex-wrap" role="group" aria-label="Quick command buttons">
        <CmdButton
          label="RTH"
          onClick={() => dispatchCmd('RTH')}
          variant="warning"
          testId="cmd-rth"
          ariaLabel="Return to home"
        />
        <CmdButton
          label="HOLD"
          onClick={() => dispatchCmd('HOLD')}
          variant="default"
          testId="cmd-hold"
          ariaLabel="Hold position"
        />
        <CmdButton
          label="AUTO"
          onClick={() => addLine('info', 'AUTO mode resumes on next waypoint.')}
          variant="default"
          testId="cmd-auto"
          ariaLabel="Resume auto patrol"
        />
        <CmdButton
          label="EMRG"
          onClick={emrgArmed ? cancelEmergency : armEmergency}
          variant="critical"
          testId="cmd-emrg"
          ariaLabel={emrgArmed ? 'Cancel emergency land' : 'Arm emergency land — requires confirmation'}
        />
      </div>
    </div>
  )
}
