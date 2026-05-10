'use client'

import { useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useDroneStore } from '@/store/use-drone-store'
import { FleetSimulator } from '@/lib/fleet-simulator'
import { ScriptEngine } from '@/lib/script-engine'
import { TelemetryPanel } from '@/components/gcs/TelemetryPanel'
import { DatalinkStatus } from '@/components/gcs/DatalinkStatus'
import { CommandConsole } from '@/components/gcs/CommandConsole'
import { MissionTimeline } from '@/components/gcs/MissionTimeline'
import { DroneSelector } from '@/components/gcs/DroneSelector'
import { C2Timeline } from '@/components/gcs/C2Timeline'
import { EWModeBanner } from '@/components/gcs/EWModeBanner'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { TestBridge } from '@/components/TestBridge'
import type { CommandType } from '@/lib/types'

// MapView must be loaded client-side only (Leaflet needs window)
const MapView = dynamic(
  () => import('@/components/gcs/MapView').then((m) => m.MapView),
  { ssr: false, loading: () => <MapPlaceholder /> },
)

function MapPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gcs-panel border border-gcs-border">
      <span className="text-gcs-muted text-xs tracking-widest animate-pulse">
        LOADING MAP…
      </span>
    </div>
  )
}

// ─── HUD Header ───────────────────────────────────────────────────────────────

interface HUDHeaderProps {
  isSimulating: boolean
  ewMode:       boolean
  onToggleEw:   () => void
}

function HUDHeader({ isSimulating, ewMode, onToggleEw }: HUDHeaderProps) {
  const telemetry = useDroneStore((s) => s.telemetry)
  const now       = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'

  return (
    <div className="flex-shrink-0">
      <header
        data-testid="gcs-header"
        role="banner"
        aria-label="Mission Control header"
        className="
          border-b border-gcs-border bg-gcs-panel
          flex items-center justify-between px-4 py-2 flex-shrink-0
          animate-flicker
        "
      >
        {/* Left: logo + system ID */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <svg width="20" height="20" viewBox="0 0 20 20" className="text-gcs-cyan flex-shrink-0">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="3"  fill="currentColor" />
              <line x1="10" y1="2"  x2="10" y2="6"  stroke="currentColor" strokeWidth="1.5" />
              <line x1="10" y1="14" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2"  y1="10" x2="6"  y2="10" stroke="currentColor" strokeWidth="1.5" />
              <line x1="14" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div>
              <div className="text-gcs-cyan text-xs font-bold tracking-[0.2em] uppercase">
                Mission Control
              </div>
              <div className="text-gcs-dim text-[9px] tracking-widest uppercase">
                QA Demo — Educational
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-gcs-border" />

          <div className="text-[10px] text-gcs-muted tracking-wider">
            SYS-ID&nbsp;<span className="text-gcs-cyan">GCS-DEMO-01</span>
          </div>
        </div>

        {/* Center: current mode + status */}
        {telemetry && (
          <div className="flex items-center gap-4 text-[10px]" aria-live="polite" aria-label="Current drone status">
            <div className="text-center">
              <div data-testid="flight-mode" className="text-gcs-cyan font-bold tracking-widest"
                   aria-label={`Flight mode: ${telemetry.flightMode}`}>
                {telemetry.flightMode}
              </div>
              <div className="text-gcs-dim tracking-widest" aria-hidden="true">FLIGHT MODE</div>
            </div>
            <div className="h-4 w-px bg-gcs-border" aria-hidden="true" />
            <div className="text-center">
              <div
                data-testid="drone-status"
                aria-label={`System status: ${telemetry.status}`}
                className={`font-bold tracking-widest ${
                  telemetry.status === 'CRITICAL' ? 'text-gcs-red animate-pulse' :
                  telemetry.status === 'WARNING'  ? 'text-gcs-yellow' : 'text-gcs-green'
                }`}
              >
                {telemetry.status}
              </div>
              <div className="text-gcs-dim tracking-widest" aria-hidden="true">SYSTEM</div>
            </div>
            <div className="h-4 w-px bg-gcs-border" aria-hidden="true" />
            <div className="text-center">
              <div data-testid="header-battery" className="text-gcs-cyan font-bold tracking-widest tabular-nums">
                {telemetry.battery.toFixed(0)}%
              </div>
              <div className="text-gcs-dim tracking-widest" aria-hidden="true">BATTERY</div>
            </div>
          </div>
        )}

        {/* Right: EW toggle + timestamp + link status */}
        <div className="flex items-center gap-4 text-[10px]">
          {/* EW Mode toggle */}
          <button
            data-testid="ew-mode-toggle"
            onClick={onToggleEw}
            aria-pressed={ewMode}
            aria-label={ewMode ? 'Disable Electronic Warfare mode' : 'Enable Electronic Warfare mode'}
            className={`
              border px-2 py-1 text-[9px] tracking-widest transition-colors
              ${ewMode
                ? 'border-gcs-red text-gcs-red bg-gcs-red/10 animate-pulse'
                : 'border-gcs-border text-gcs-dim hover:border-gcs-yellow hover:text-gcs-yellow'
              }
            `}
          >
            EW MODE
          </button>

          <div className="h-4 w-px bg-gcs-border" />
          <StatusIndicator
            state={isSimulating ? 'nominal' : 'offline'}
            label={isSimulating ? 'SIM RUNNING' : 'SIM PAUSED'}
          />
          <div className="h-4 w-px bg-gcs-border" />
          <div className="text-gcs-dim tabular-nums">{now}</div>
          <a
            href="/mission-control"
            className="ml-2 border border-gcs-border px-2 py-1 text-[9px] text-gcs-muted
                       hover:border-gcs-cyan hover:text-gcs-cyan transition-colors tracking-widest"
          >
            EXIT
          </a>
        </div>
      </header>

      {/* EW mode banner — shown below header when active */}
      {ewMode && <EWModeBanner />}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const fleetRef          = useRef<FleetSimulator | null>(null)
  const batchUpdateFleet  = useDroneStore((s) => s.batchUpdateFleet)
  const dispatchCommandTo = useDroneStore((s) => s.dispatchCommandTo)
  const acknowledgeCommandFor = useDroneStore((s) => s.acknowledgeCommandFor)
  const failCommandFor    = useDroneStore((s) => s.failCommandFor)
  const dispatchCommand   = useDroneStore((s) => s.dispatchCommand)
  const acknowledgeCommand = useDroneStore((s) => s.acknowledgeCommand)
  const failCommand       = useDroneStore((s) => s.failCommand)
  const pushEvent         = useDroneStore((s) => s.pushEvent)
  const setSimulating     = useDroneStore((s) => s.setSimulating)
  const setEwMode         = useDroneStore((s) => s.setEwMode)
  const selectDrone       = useDroneStore((s) => s.selectDrone)
  const isSimulating      = useDroneStore((s) => s.isSimulating)
  const ewMode            = useDroneStore((s) => s.ewMode)

  useEffect(() => {
    const fleet = new FleetSimulator(batchUpdateFleet)
    fleetRef.current = fleet

    const script = new ScriptEngine(fleet)

    fleet.start()
    script.start()
    setSimulating(true)

    pushEvent({
      type:     'SYSTEM',
      message:  'Ground Control System online — 5-drone fleet active. CDG perimeter patrol initiated.',
      severity: 'INFO',
    })

    return () => {
      script.stop()
      fleet.stop()
      setSimulating(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleEw = useCallback(() => {
    const next = !useDroneStore.getState().ewMode
    setEwMode(next)
    fleetRef.current?.setEwMode(next)
    pushEvent({
      type:     'SYSTEM',
      message:  next
        ? '⚡ EW Mode ACTIVATED — Degraded link: latency 200–800 ms, PKT loss 5–10 %'
        : '✓ EW Mode DEACTIVATED — Link conditions restored to nominal',
      severity: next ? 'WARNING' : 'INFO',
    })
  }, [setEwMode, pushEvent])

  const handleDroneClick = useCallback((droneId: string) => {
    selectDrone(droneId)
  }, [selectDrone])

  const handleCommand = useCallback((
    type: CommandType,
    _payload?: Record<string, number>,
  ) => {
    const cmd = dispatchCommand(
      type,
      _payload ? { lat: _payload.lat, lng: _payload.lng, altitude: _payload.altitude } : undefined,
    )

    pushEvent({
      type:     'COMMAND',
      message:  `Command dispatched: ${type}`,
      severity: type === 'EMERGENCY_LAND' ? 'CRITICAL' : type === 'RTH' ? 'WARNING' : 'INFO',
    })

    const selectedId = useDroneStore.getState().selectedDroneId
    fleetRef.current?.sendCommandTo(
      selectedId,
      cmd,
      (latency) => {
        acknowledgeCommand(cmd.id, latency)
        pushEvent({
          type:     'COMMAND',
          message:  `ACK: ${type} — ${latency}ms RTT`,
          severity: 'INFO',
        })
      },
      () => {
        failCommand(cmd.id)
        pushEvent({
          type:     'ALERT',
          message:  `TIMEOUT: ${type} command not acknowledged (3 s). Packet loss?`,
          severity: 'CRITICAL',
        })
      },
    )
  }, [dispatchCommand, acknowledgeCommand, failCommand, pushEvent])

  return (
    <div className="flex flex-col h-screen bg-gcs-bg overflow-hidden">
      <TestBridge />
      <HUDHeader
        isSimulating={isSimulating}
        ewMode={ewMode}
        onToggleEw={handleToggleEw}
      />

      {/* Drone selector tabs */}
      <DroneSelector />

      {/*
        Main grid:
          [Map 60%] [Telemetry + Datalink 40%]
          [Command Console 50%] [Mission Timeline 50%]
      */}
      <div className="flex-1 grid grid-cols-5 grid-rows-[1fr_auto] min-h-0 gap-px bg-gcs-border">

        {/* Map — spans 3 cols, full height */}
        <div className="col-span-3 row-span-2 min-h-0">
          <MapView
            className="w-full h-full"
            onDroneClick={handleDroneClick}
          />
        </div>

        {/* Right column — Telemetry + Datalink stacked */}
        <div className="col-span-2 row-span-1 grid grid-rows-[3fr_2fr] min-h-0 gap-px bg-gcs-border">
          <TelemetryPanel className="min-h-0 overflow-hidden" />
          <DatalinkStatus className="min-h-0 overflow-hidden" />
        </div>

        {/* Bottom row — Command Console + Mission Timeline */}
        <div className="col-span-2 row-span-1 grid grid-cols-2 min-h-0 gap-px bg-gcs-border"
             style={{ height: '280px' }}>
          <CommandConsole
            onCommand={handleCommand}
            className="min-h-0 overflow-hidden"
          />
          <MissionTimeline className="min-h-0 overflow-hidden" />
        </div>
      </div>

      {/* C2 Timeline — full-width strip below main grid */}
      <C2Timeline />
    </div>
  )
}
