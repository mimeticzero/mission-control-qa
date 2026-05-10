'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  Circle,
} from 'react-leaflet'
import L from 'leaflet'
import { useDroneStore } from '@/store/use-drone-store'
import { MISSION_PROFILES } from '@/lib/mission-profiles'
import type { MissionProfile } from '@/lib/types'

// Fix default marker icon path broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl:     '/leaflet/marker-shadow.png',
})

// ─── Profile-specific vehicle SVG icons ──────────────────────────────────────

function VehicleIcon({
  profile,
  heading,
  color,
}: {
  profile:  MissionProfile
  heading:  number
  color:    string
}) {
  const style = { transform: `rotate(${heading}deg)`, display: 'block' }

  if (profile === 'ground') {
    return (
      <svg width="24" height="24" viewBox="0 0 28 28" style={style}>
        {/* Ground vehicle — top-down truck silhouette */}
        <rect x="9" y="6" width="10" height="16" rx="2" fill={color} opacity="0.9" />
        <rect x="7" y="10" width="14" height="8" rx="1" fill={color} />
        <circle cx="9"  cy="22" r="2.5" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="19" cy="22" r="2.5" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="9"  cy="6"  r="2.5" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="19" cy="6"  r="2.5" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="14" y1="6" x2="14" y2="2" stroke={color} strokeWidth="1.5" opacity="0.7" />
      </svg>
    )
  }

  if (profile === 'maritime') {
    return (
      <svg width="24" height="24" viewBox="0 0 28 28" style={style}>
        {/* Surface vessel — top-down ship hull */}
        <ellipse cx="14" cy="14" rx="5" ry="10" fill={color} opacity="0.9" />
        <line x1="14" y1="4"  x2="14" y2="0"  stroke={color} strokeWidth="2" />
        <line x1="14" y1="4"  x2="10" y2="8"  stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1="14" y1="4"  x2="18" y2="8"  stroke={color} strokeWidth="1" opacity="0.6" />
        <ellipse cx="14" cy="14" rx="3" ry="7" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      </svg>
    )
  }

  if (profile === 'ugv') {
    return (
      <svg width="24" height="24" viewBox="0 0 28 28" style={style}>
        {/* UGV — tracked robot top-down view */}
        <rect x="5"  y="7" width="4" height="14" rx="2" fill={color} opacity="0.7" />
        <rect x="19" y="7" width="4" height="14" rx="2" fill={color} opacity="0.7" />
        <rect x="9"  y="9" width="10" height="10" rx="1" fill={color} />
        <circle cx="14" cy="14" r="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
        <line x1="14" y1="9"  x2="14" y2="5"  stroke={color} strokeWidth="1.5" />
        <circle cx="14" cy="4" r="1.5" fill={color} />
      </svg>
    )
  }

  // AERIAL — original drone SVG
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" style={style}>
      <circle cx="14" cy="14" r="5" fill={color} />
      <polygon points="14,2 17,11 14,9 11,11" fill={color} opacity="0.9" />
      <line x1="14" y1="14" x2="4"  y2="4"  stroke={color} strokeWidth="1.5" opacity="0.6" />
      <line x1="14" y1="14" x2="24" y2="4"  stroke={color} strokeWidth="1.5" opacity="0.6" />
      <line x1="14" y1="14" x2="4"  y2="24" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <line x1="14" y1="14" x2="24" y2="24" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <circle cx="4"  cy="4"  r="3" fill="none" stroke={color} strokeWidth="1" opacity="0.7" />
      <circle cx="24" cy="4"  r="3" fill="none" stroke={color} strokeWidth="1" opacity="0.7" />
      <circle cx="4"  cy="24" r="3" fill="none" stroke={color} strokeWidth="1" opacity="0.7" />
      <circle cx="24" cy="24" r="3" fill="none" stroke={color} strokeWidth="1" opacity="0.7" />
    </svg>
  )
}

interface MapViewProps {
  className?:     string
  onDroneClick?:  (droneId: string) => void
}

export function MapView({ className = '', onDroneClick }: MapViewProps) {
  const fleet          = useDroneStore((s) => s.fleet)
  const selectedId     = useDroneStore((s) => s.selectedDroneId)
  const telemetry      = useDroneStore((s) => s.telemetry)  // selected vehicle
  const activeProfile  = useDroneStore((s) => s.activeProfile)
  const mapRef         = useRef<L.Map | null>(null)

  const profileMeta    = MISSION_PROFILES[activeProfile]
  const fleetConfigs   = profileMeta.fleet

  const selectedPos    = telemetry?.position ?? { lat: profileMeta.mapCenter[0], lng: profileMeta.mapCenter[1], altitude: 0 }
  const selectedHeading = telemetry?.heading ?? 0

  // Pan map to follow the selected vehicle
  useEffect(() => {
    const map = mapRef.current
    if (!map || !telemetry) return
    const center = map.getCenter()
    const dist   = map.distance(
      [center.lat, center.lng],
      [selectedPos.lat, selectedPos.lng],
    )
    if (dist > 600) {
      map.panTo([selectedPos.lat, selectedPos.lng], { animate: true, duration: 1 })
    }
  }, [selectedPos.lat, selectedPos.lng, telemetry])

  // The `key` prop forces MapContainer to remount when the profile changes,
  // resetting the view to the new operational area's center and zoom.
  const mapKey = activeProfile

  return (
    <div
      data-testid="map-view"
      role="region"
      aria-label="Multi-vehicle map view"
      className={`relative overflow-hidden ${className}`}
    >
      {/* Scan-line CRT overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[400] opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)',
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[401]"
        style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)' }}
      />

      {/* Corner crosshairs */}
      {(['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'] as const).map((pos, i) => (
        <div key={i} className={`pointer-events-none absolute z-[402] w-5 h-5 ${pos}`}>
          <svg viewBox="0 0 20 20" className="w-full h-full text-gcs-cyan opacity-40">
            {i === 0 && <><line x1="0" y1="10" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/><line x1="10" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/></>}
            {i === 1 && <><line x1="20" y1="10" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/><line x1="10" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/></>}
            {i === 2 && <><line x1="0" y1="10" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/><line x1="10" y1="20" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/></>}
            {i === 3 && <><line x1="20" y1="10" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/><line x1="10" y1="20" x2="10" y2="10" stroke="currentColor" strokeWidth="1"/></>}
          </svg>
        </div>
      ))}

      {/* HUD overlay — selected vehicle callsign + coords */}
      {telemetry && (
        <div className="pointer-events-none absolute top-2 left-2 z-[403] text-[10px] font-bold text-gcs-cyan opacity-90 leading-tight">
          <div className="tracking-widest">{telemetry.callsign}</div>
          <div className="text-gcs-dim tracking-wider">
            {selectedPos.lat.toFixed(5)}°&nbsp;{selectedPos.lng.toFixed(5)}°
          </div>
          {activeProfile === 'aerial' && (
            <div className="text-gcs-dim tracking-wider">
              ALT&nbsp;{Math.round(selectedPos.altitude)}m AGL
            </div>
          )}
          {activeProfile === 'maritime' && (
            <div className="text-gcs-dim tracking-wider">
              SPD&nbsp;{(telemetry.speed * 1.944).toFixed(1)}&nbsp;kn
            </div>
          )}
          {activeProfile === 'ground' && (
            <div className="text-gcs-dim tracking-wider">
              SPD&nbsp;{(telemetry.speed * 3.6).toFixed(0)}&nbsp;km/h
            </div>
          )}
          {activeProfile === 'ugv' && (
            <div className="text-gcs-dim tracking-wider">
              SPD&nbsp;{telemetry.speed.toFixed(1)}&nbsp;m/s
            </div>
          )}
        </div>
      )}

      <MapContainer
        key={mapKey}
        center={profileMeta.mapCenter}
        zoom={profileMeta.mapZoom}
        className="w-full h-full"
        zoomControl
        attributionControl
        ref={mapRef}
      >
        {/* CartoDB Dark Matter — free, no API key required */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
          subdomains="abcd"
        />

        {/* ── Per-vehicle layers ───────────────────────────────────────── */}
        {fleetConfigs.map((cfg) => {
          const member     = fleet[cfg.id]
          const isSelected = cfg.id === selectedId
          const routePositions = cfg.patrolRoute.map(
            (wp): [number, number] => [wp.lat, wp.lng],
          )
          // Close the loop
          routePositions.push([cfg.patrolRoute[0].lat, cfg.patrolRoute[0].lng])

          return (
            <div key={cfg.id}>
              {/* Patrol route */}
              <Polyline
                positions={routePositions}
                pathOptions={{
                  color:     cfg.color,
                  weight:    isSelected ? 1.5 : 0.8,
                  opacity:   isSelected ? 0.5 : 0.2,
                  dashArray: '6 4',
                }}
              />

              {/* Position trail */}
              {member && member.trail.length > 1 && (
                <Polyline
                  positions={member.trail}
                  pathOptions={{
                    color:   cfg.color,
                    weight:  isSelected ? 2 : 1,
                    opacity: isSelected ? 0.8 : 0.4,
                  }}
                />
              )}

              {/* Waypoint markers */}
              {cfg.patrolRoute.map((wp, i) => (
                <CircleMarker
                  key={`${cfg.id}-wp-${i}`}
                  center={[wp.lat, wp.lng]}
                  radius={isSelected ? (i === 0 ? 4 : 2.5) : 1.5}
                  pathOptions={{
                    color:       cfg.color,
                    fillColor:   cfg.color,
                    fillOpacity: isSelected ? (i === 0 ? 0.7 : 0.4) : 0.2,
                    weight:      1,
                  }}
                >
                  {isSelected && (
                    <Tooltip
                      permanent={i === 0}
                      direction="right"
                      offset={[6, 0]}
                    >
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        color: cfg.color,
                        background: 'transparent',
                        border: 'none',
                      }}>
                        {wp.name}
                      </span>
                    </Tooltip>
                  )}
                </CircleMarker>
              ))}

              {/* Home radius ring (selected vehicle only) */}
              {isSelected && (
                <Circle
                  center={[cfg.home.lat, cfg.home.lng]}
                  radius={150}
                  pathOptions={{
                    color:       cfg.color,
                    fillColor:   cfg.color,
                    fillOpacity: 0.04,
                    weight:      1,
                    dashArray:   '4 4',
                  }}
                />
              )}

              {/* Live vehicle marker */}
              {member && (
                <>
                  {/* Pulse ring */}
                  <CircleMarker
                    center={[member.telemetry.position.lat, member.telemetry.position.lng]}
                    radius={isSelected ? 14 : 8}
                    pathOptions={{
                      color:       cfg.color,
                      fillColor:   'transparent',
                      weight:      1,
                      opacity:     isSelected ? 0.35 : 0.2,
                    }}
                    eventHandlers={onDroneClick ? {
                      click: () => onDroneClick(cfg.id),
                    } : undefined}
                  />
                  {/* Vehicle body */}
                  <CircleMarker
                    center={[member.telemetry.position.lat, member.telemetry.position.lng]}
                    radius={isSelected ? 6 : 4}
                    pathOptions={{
                      color:       cfg.color,
                      fillColor:   cfg.color,
                      fillOpacity: isSelected ? 1 : 0.7,
                      weight:      2,
                    }}
                    eventHandlers={onDroneClick ? {
                      click: () => onDroneClick(cfg.id),
                    } : undefined}
                  >
                    {isSelected && (
                      <Tooltip permanent direction="top" offset={[0, -14]}>
                        <div style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
                          <VehicleIcon
                            profile={activeProfile}
                            heading={selectedHeading}
                            color={cfg.color}
                          />
                        </div>
                      </Tooltip>
                    )}
                  </CircleMarker>

                  {/* Non-selected vehicle callsign label */}
                  {!isSelected && (
                    <CircleMarker
                      center={[member.telemetry.position.lat, member.telemetry.position.lng]}
                      radius={0}
                      pathOptions={{ opacity: 0 }}
                      eventHandlers={onDroneClick ? {
                        click: () => onDroneClick(cfg.id),
                      } : undefined}
                    >
                      <Tooltip direction="top" offset={[0, -8]}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '9px',
                          color: cfg.color,
                          background: 'transparent',
                          border: 'none',
                        }}>
                          {cfg.callsign}
                        </span>
                      </Tooltip>
                    </CircleMarker>
                  )}
                </>
              )}
            </div>
          )
        })}
      </MapContainer>
    </div>
  )
}
