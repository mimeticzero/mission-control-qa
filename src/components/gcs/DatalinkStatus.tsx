'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer,
} from 'recharts'
import { useDroneStore } from '@/store/use-drone-store'
import { StatusIndicator } from '@/components/ui/StatusIndicator'

function LatencyBar({ value, max = 250 }: { value: number; max?: number }) {
  const pct   = Math.min(100, (value / max) * 100)
  const color = value > 150 ? '#ef4444' : value > 100 ? '#fbbf24' : '#06b6d4'
  return (
    <div className="relative h-1.5 bg-gcs-border w-full mt-1">
      <div
        className="absolute inset-y-0 left-0 transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function SignalStrengthBars({ pct }: { pct: number }) {
  const bars = 5
  const filled = Math.round((pct / 100) * bars)
  return (
    <div className="flex items-end gap-0.5 h-5">
      {Array.from({ length: bars }, (_, i) => {
        const active = i < filled
        const color  = pct < 30 ? '#ef4444' : pct < 60 ? '#fbbf24' : '#06b6d4'
        return (
          <div
            key={i}
            className="w-2 flex-shrink-0 rounded-none"
            style={{
              height:          `${(i + 1) * 20}%`,
              backgroundColor: active ? color : '#1a2332',
            }}
          />
        )
      })}
    </div>
  )
}

export function DatalinkStatus({ className = '' }: { className?: string }) {
  const datalink  = useDroneStore((s) => s.datalink)
  const telemetry = useDroneStore((s) => s.telemetry)
  const history   = useDroneStore((s) => s.history)
  const ewMode    = useDroneStore((s) => s.ewMode)

  const latencyHistory = useMemo(
    () => history.slice(-30).map((h, i) => ({ t: i, v: h.latency })),
    [history],
  )

  if (!datalink) {
    return (
      <div className={`panel flex items-center justify-center ${className}`}>
        <span className="text-gcs-muted text-xs tracking-widest animate-pulse">
          NO DATALINK
        </span>
      </div>
    )
  }

  const { connected, latency, packetLoss, rssi, uptime } = datalink

  const linkState =
    !connected       ? 'offline'  :
    packetLoss > 2   ? 'critical' :
    latency    > 150 ? 'warning'  : 'nominal'

  const latencyState =
    latency > 150 ? 'critical' :
    latency > 100 ? 'warning'  : 'nominal'

  const signalPct = telemetry?.signalStrength ?? 0

  const uptimeStr = (() => {
    const m = Math.floor(uptime / 60)
    const s = Math.floor(uptime % 60)
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  })()

  return (
    <div
      data-testid="datalink-status"
      role="region"
      aria-label="Datalink connection status"
      className={`panel flex flex-col overflow-hidden ${ewMode ? 'ew-active' : ''} ${className}`}
    >
      {/* Header */}
      <div className="panel-header">
        <span>Datalink Status</span>
        <StatusIndicator
          state={linkState as 'nominal' | 'warning' | 'critical' | 'offline'}
          label={connected ? 'CONNECTED' : 'OFFLINE'}
        />
      </div>

      {/* Primary row */}
      <div className="grid grid-cols-2 gap-px bg-gcs-border border-b border-gcs-border">
        {/* Latency */}
        <div className="bg-gcs-panel p-2">
          <div
            data-testid="latency-value"
            aria-label={`Latency ${latency} milliseconds`}
            className={`data-value tabular-nums ${
              latency > 150 ? 'text-gcs-red' :
              latency > 100 ? 'text-gcs-yellow' : 'text-gcs-cyan'
            }`}
          >
            {latency}
            <span className="text-[10px] text-gcs-dim ml-0.5">ms</span>
          </div>
          <div className="data-label">RTT LATENCY</div>
          <LatencyBar value={latency} />
        </div>

        {/* Packet loss */}
        <div className="bg-gcs-panel p-2">
          <div className={`data-value tabular-nums ${
            packetLoss > 2 ? 'text-gcs-red' :
            packetLoss > 0 ? 'text-gcs-yellow' : 'text-gcs-green'
          }`}>
            {packetLoss.toFixed(1)}
            <span className="text-[10px] text-gcs-dim ml-0.5">%</span>
          </div>
          <div className="data-label">PKT LOSS</div>
        </div>
      </div>

      {/* Latency sparkline */}
      <div className="px-2 pt-1 pb-1 border-b border-gcs-border">
        <div className="data-label mb-0.5">LATENCY HISTORY (ms)</div>
        <ResponsiveContainer width="100%" height={36}>
          <BarChart data={latencyHistory} margin={{ top: 2, right: 0, bottom: 0, left: 0 }} barSize={3}>
            <Bar dataKey="v" isAnimationActive={false}>
              {latencyHistory.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.v > 150 ? '#ef4444' : d.v > 100 ? '#fbbf24' : '#06b6d4'}
                />
              ))}
            </Bar>
            <YAxis domain={[0, 250]} hide />
            <XAxis dataKey="t" hide />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RSSI + signal strength */}
      <div className="grid grid-cols-2 gap-px bg-gcs-border border-b border-gcs-border">
        <div className="bg-gcs-panel p-2">
          <div className="data-value text-gcs-cyan tabular-nums">
            {rssi}
            <span className="text-[10px] text-gcs-dim ml-0.5">dBm</span>
          </div>
          <div className="data-label">RSSI</div>
        </div>
        <div className="bg-gcs-panel p-2 flex flex-col justify-between">
          <div>
            <div className="data-value text-gcs-cyan tabular-nums">
              {signalPct}
              <span className="text-[10px] text-gcs-dim ml-0.5">%</span>
            </div>
            <div className="data-label">SIGNAL</div>
          </div>
          <SignalStrengthBars pct={signalPct} />
        </div>
      </div>

      {/* Uptime + status */}
      <div className="grid grid-cols-2 gap-px bg-gcs-border">
        <div className="bg-gcs-panel p-2">
          <div className="data-value text-gcs-dim tabular-nums">{uptimeStr}</div>
          <div className="data-label">LINK UPTIME</div>
        </div>
        <div className="bg-gcs-panel p-2 flex flex-col justify-center">
          <div className="flex flex-col gap-1">
            <StatusIndicator
              state={latencyState as 'nominal' | 'warning' | 'critical'}
              label="LATENCY"
              size="sm"
            />
            <StatusIndicator
              state={packetLoss > 0 ? 'warning' : 'nominal'}
              label="PKT INTEGRITY"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
