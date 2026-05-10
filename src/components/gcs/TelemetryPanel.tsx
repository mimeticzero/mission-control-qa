'use client'

import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  Tooltip as ReTooltip,
} from 'recharts'
import { useDroneStore } from '@/store/use-drone-store'
import { Badge } from '@/components/ui/Badge'
import { MISSION_PROFILES } from '@/lib/mission-profiles'

// ─── Mini sparkline chart ─────────────────────────────────────────────────────

function Spark({
  data,
  dataKey,
  color,
  domain,
}: {
  data: Record<string, number>[]
  dataKey: string
  color: string
  domain?: [number, number]
}) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        {domain && <YAxis domain={domain} hide />}
        {!domain && <YAxis hide />}
        <XAxis dataKey="t" hide />
        <ReTooltip
          contentStyle={{
            background: '#0f0f0f',
            border: '1px solid #1a2332',
            borderRadius: 2,
            fontFamily: 'monospace',
            fontSize: 10,
            color: color,
            padding: '2px 6px',
          }}
          itemStyle={{ color }}
          labelStyle={{ display: 'none' }}
          formatter={(v: number) => [v.toFixed(1), '']}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Data cell ────────────────────────────────────────────────────────────────

function DataCell({
  label,
  value,
  unit,
  color = 'text-gcs-cyan',
  warning = false,
  critical = false,
}: {
  label: string
  value: string | number
  unit?: string
  color?: string
  warning?: boolean
  critical?: boolean
}) {
  const valueColor = critical ? 'text-gcs-red' : warning ? 'text-gcs-yellow' : color
  return (
    <div className="flex flex-col min-w-0">
      <div className={`data-value ${valueColor} ${critical ? 'animate-pulse' : ''} tabular-nums`}>
        {value}
        {unit && <span className="text-[10px] text-gcs-dim ml-0.5">{unit}</span>}
      </div>
      <div className="data-label">{label}</div>
    </div>
  )
}

// ─── Battery bar ──────────────────────────────────────────────────────────────

function BatteryBar({ pct }: { pct: number }) {
  const color =
    pct < 15 ? '#ef4444' :
    pct < 30 ? '#fbbf24' : '#22c55e'
  return (
    <div className="relative h-2 bg-gcs-border rounded-none overflow-hidden mt-1">
      <div
        className="absolute inset-y-0 left-0 transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ─── Profile-specific extra row ───────────────────────────────────────────────

function ProfileExtraRow({ telemetry }: { telemetry: NonNullable<ReturnType<typeof useDroneStore.getState>['telemetry']> }) {
  const profile = useDroneStore((s) => s.activeProfile)
  const pd      = telemetry.profileData

  if (profile === 'ground' && pd) {
    return (
      <div className="grid grid-cols-2 gap-px bg-gcs-border border-b border-gcs-border">
        <div className="bg-gcs-panel p-2">
          <DataCell label="TIRE PSI" value={pd.tirePressure?.toFixed(0) ?? '--'} unit="kPa" color="text-gcs-cyan" />
        </div>
        <div className="bg-gcs-panel p-2">
          <DataCell label="FUEL" value={pd.fuelLevel?.toFixed(1) ?? '--'} unit="%" color="text-gcs-green"
            warning={(pd.fuelLevel ?? 100) < 30}
            critical={(pd.fuelLevel ?? 100) < 15}
          />
        </div>
      </div>
    )
  }

  if (profile === 'maritime' && pd) {
    return (
      <div className="grid grid-cols-3 gap-px bg-gcs-border border-b border-gcs-border">
        <div className="bg-gcs-panel p-2">
          <DataCell label="DEPTH" value={pd.depth?.toFixed(0) ?? '0'} unit="m" color="text-gcs-cyan" />
        </div>
        <div className="bg-gcs-panel p-2">
          <DataCell label="WAVE HT" value={pd.waveHeight?.toFixed(1) ?? '--'} unit="m" color="text-gcs-cyan" />
        </div>
        <div className="bg-gcs-panel p-2">
          <DataCell label="CURRENT" value={pd.currentSpeed?.toFixed(2) ?? '--'} unit="m/s" color="text-gcs-cyan" />
        </div>
      </div>
    )
  }

  if (profile === 'ugv' && pd) {
    return (
      <div className="grid grid-cols-3 gap-px bg-gcs-border border-b border-gcs-border">
        <div className="bg-gcs-panel p-2">
          <DataCell label="ARMOR" value={pd.armorIntegrity?.toFixed(0) ?? '--'} unit="%" color="text-gcs-green"
            warning={(pd.armorIntegrity ?? 100) < 80}
            critical={(pd.armorIntegrity ?? 100) < 60}
          />
        </div>
        <div className="bg-gcs-panel p-2">
          <DataCell label="CLRNCE" value={pd.clearance?.toFixed(0) ?? '--'} unit="cm" color="text-gcs-cyan" />
        </div>
        <div className="bg-gcs-panel p-2">
          <div className="flex flex-col min-w-0">
            <div className={`data-value text-[9px] tabular-nums ${
              pd.payloadStatus === 'ACTIVE'  ? 'text-gcs-green' :
              pd.payloadStatus === 'COOLING' ? 'text-gcs-yellow' : 'text-gcs-cyan'
            }`}>
              {pd.payloadStatus ?? 'READY'}
            </div>
            <div className="data-label">PAYLOAD</div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TelemetryPanel({ className = '' }: { className?: string }) {
  const telemetry     = useDroneStore((s) => s.telemetry)
  const history       = useDroneStore((s) => s.history)
  const ewMode        = useDroneStore((s) => s.ewMode)
  const activeProfile = useDroneStore((s) => s.activeProfile)

  const profileMeta = MISSION_PROFILES[activeProfile]

  const chartData = useMemo(() =>
    history.slice(-60).map((h, i) => ({
      t:        i,
      altitude: Math.round(h.altitude),
      speed:    parseFloat((h.speed * profileMeta.speedMultiplier).toFixed(1)),
      battery:  parseFloat(h.battery.toFixed(1)),
    })),
    [history, profileMeta.speedMultiplier],
  )

  if (!telemetry) {
    return (
      <div data-testid="telemetry-panel" className={`panel flex items-center justify-center ${className}`}>
        <span className="text-gcs-muted text-xs tracking-widest animate-pulse">
          AWAITING TELEMETRY…
        </span>
      </div>
    )
  }

  const { position, speed, heading, battery, batteryVoltage,
          signalStrength, flightMode, status, distanceToHome,
          flightTime, gpsAccuracy, satellites } = telemetry

  const modeVariant =
    flightMode === 'EMERGENCY_LAND' ? 'critical' :
    flightMode === 'RTH'            ? 'warning'  :
    flightMode === 'HOLD'           ? 'warning'  : 'nominal'

  const statusVariant =
    status === 'CRITICAL' ? 'critical' :
    status === 'WARNING'  ? 'warning'  :
    status === 'OFFLINE'  ? 'offline'  : 'nominal'

  const ft = Math.floor(flightTime)
  const flightTimeStr = `${String(Math.floor(ft / 3600)).padStart(2, '0')}:${
    String(Math.floor((ft % 3600) / 60)).padStart(2, '0')}:${
    String(ft % 60).padStart(2, '0')}`

  // Profile-specific primary metric 1 (altitude / depth / clearance / speed-over-ground)
  const metric1 = (() => {
    if (activeProfile === 'maritime') {
      const depth = telemetry.profileData?.depth ?? 0
      return { label: 'DEPTH', value: depth.toFixed(0), unit: 'm', testId: 'altitude-value' }
    }
    if (activeProfile === 'ugv') {
      const clr = telemetry.profileData?.clearance ?? 0
      return { label: 'CLRNCE', value: clr.toFixed(0), unit: 'cm', testId: 'altitude-value' }
    }
    // AERIAL: altitude AGL; GROUND: altitude is near 0, show speed in km/h instead
    if (activeProfile === 'ground') {
      return { label: 'SPD OVR GND', value: (speed * 3.6).toFixed(1), unit: 'km/h', testId: 'altitude-value' }
    }
    return { label: 'ALT AGL', value: String(Math.round(position.altitude)), unit: 'm', testId: 'altitude-value' }
  })()

  // Profile-specific primary metric 2 (speed)
  const metric2 = (() => {
    if (activeProfile === 'ground') {
      return { label: 'HEADING', value: String(heading).padStart(3, '0'), unit: '°', testId: 'speed-value' }
    }
    if (activeProfile === 'maritime') {
      return { label: 'SPD OVR WTR', value: (speed * 1.944).toFixed(1), unit: 'kn', testId: 'speed-value' }
    }
    return { label: 'GND SPD', value: speed.toFixed(1), unit: 'm/s', testId: 'speed-value' }
  })()

  // Profile-specific primary metric 3 (heading / extra)
  const metric3 = (() => {
    if (activeProfile === 'ground') {
      const fuel = telemetry.profileData?.fuelLevel ?? battery
      return { label: 'FUEL', value: fuel.toFixed(1), unit: '%', testId: 'heading-value' }
    }
    if (activeProfile === 'maritime') {
      return { label: 'HEADING', value: String(heading).padStart(3, '0'), unit: '°', testId: 'heading-value' }
    }
    if (activeProfile === 'ugv') {
      return { label: 'GND SPD', value: speed.toFixed(1), unit: 'm/s', testId: 'heading-value' }
    }
    return { label: 'HEADING', value: String(heading).padStart(3, '0'), unit: '°', testId: 'heading-value' }
  })()

  return (
    <div
      data-testid="telemetry-panel"
      role="region"
      aria-label="Vehicle telemetry data"
      className={`panel flex flex-col overflow-hidden ${ewMode ? 'ew-active' : ''} ${className}`}
    >
      {/* Header */}
      <div className="panel-header">
        <span>Telemetry // {telemetry.callsign}</span>
        <div className="flex gap-2 items-center">
          <Badge variant={modeVariant}>{flightMode}</Badge>
          <Badge variant={statusVariant} dot>{status}</Badge>
        </div>
      </div>

      {/* Primary data grid */}
      <div className="grid grid-cols-3 gap-px bg-gcs-border border-b border-gcs-border">
        <div className="bg-gcs-panel p-2">
          <div data-testid="altitude-value" aria-label={`${metric1.label} ${metric1.value} ${metric1.unit}`}>
            <DataCell label={metric1.label} value={metric1.value} unit={metric1.unit} color="text-gcs-cyan" />
          </div>
        </div>
        <div className="bg-gcs-panel p-2">
          <div data-testid="speed-value" aria-label={`${metric2.label} ${metric2.value} ${metric2.unit}`}>
            <DataCell label={metric2.label} value={metric2.value} unit={metric2.unit} color="text-gcs-cyan" />
          </div>
        </div>
        <div className="bg-gcs-panel p-2">
          <div data-testid="heading-value">
            <DataCell label={metric3.label} value={metric3.value} unit={metric3.unit} color="text-gcs-cyan" />
          </div>
        </div>
      </div>

      {/* Battery / fuel row */}
      <div className="px-2 pt-2 pb-1 border-b border-gcs-border">
        <div className="flex items-end justify-between mb-1">
          <div
            data-testid="battery-value"
            aria-label={`${profileMeta.energyLabel} ${battery.toFixed(1)} percent${battery < 15 ? ' — CRITICAL' : battery < 30 ? ' — WARNING' : ''}`}
            aria-live={battery < 15 ? 'assertive' : 'off'}
          >
            <DataCell
              label={profileMeta.energyLabel}
              value={battery.toFixed(1)}
              unit="%"
              color="text-gcs-green"
              warning={battery < 30}
              critical={battery < 15}
            />
          </div>
          <div className="text-right">
            <div className="data-value text-sm text-gcs-muted">
              {batteryVoltage.toFixed(1)}
              <span className="text-[10px] text-gcs-dim ml-0.5">V</span>
            </div>
            <div className="data-label">VOLTAGE</div>
          </div>
        </div>
        <BatteryBar pct={battery} />
      </div>

      {/* Profile-specific extra row (tire pressure, wave height, armor, etc.) */}
      <ProfileExtraRow telemetry={telemetry} />

      {/* Altitude / speed sparklines */}
      <div className="grid grid-cols-2 gap-px bg-gcs-border border-b border-gcs-border">
        <div className="bg-gcs-panel px-2 pt-1 pb-1">
          <div className="data-label mb-0.5">
            {activeProfile === 'aerial' ? 'ALTITUDE (m)' :
             activeProfile === 'ground' ? 'SPD (km/h)' :
             activeProfile === 'maritime' ? 'SPD (kn)' : 'SPD (m/s)'}
          </div>
          <Spark data={chartData} dataKey={activeProfile === 'aerial' ? 'altitude' : 'speed'} color="#06b6d4"
            domain={activeProfile === 'aerial' ? [50, 200] : [0, activeProfile === 'ground' ? 100 : 12]} />
        </div>
        <div className="bg-gcs-panel px-2 pt-1 pb-1">
          <div className="data-label mb-0.5">{profileMeta.energyLabel} (%)</div>
          <Spark data={chartData} dataKey="battery" color="#22c55e" domain={[0, 100]} />
        </div>
      </div>

      {/* Secondary grid */}
      <div className="grid grid-cols-3 gap-px bg-gcs-border border-b border-gcs-border">
        <div className="bg-gcs-panel p-2">
          <DataCell label="SIGNAL" value={signalStrength} unit="%" color="text-gcs-cyan" />
        </div>
        <div className="bg-gcs-panel p-2">
          <DataCell label="SATS" value={satellites} color="text-gcs-cyan" />
        </div>
        <div className="bg-gcs-panel p-2">
          <DataCell label="HDOP" value={gpsAccuracy.toFixed(1)} color="text-gcs-cyan" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gcs-border">
        <div className="bg-gcs-panel p-2">
          <DataCell label="DIST HOME" value={distanceToHome} unit="m" color="text-gcs-dim" />
        </div>
        <div className="bg-gcs-panel p-2">
          <div data-testid="flight-time" aria-label={`Mission time ${flightTimeStr}`}>
            <DataCell label="MSN TIME" value={flightTimeStr} color="text-gcs-dim" />
          </div>
        </div>
      </div>
    </div>
  )
}
