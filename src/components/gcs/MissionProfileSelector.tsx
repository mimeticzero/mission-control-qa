'use client'

import type { MissionProfile } from '@/lib/types'
import { MISSION_PROFILES, VALID_PROFILES } from '@/lib/mission-profiles'

interface MissionProfileSelectorProps {
  value:    MissionProfile
  onChange: (p: MissionProfile) => void
}

function ProfileIcon({ profile, size = 14 }: { profile: MissionProfile; size?: number }) {
  const s = { width: size, height: size, display: 'block' as const }
  const c = '#94a3b8'
  if (profile === 'aerial') return (
    <svg {...s} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="3" fill={c}/>
      <line x1="10" y1="10" x2="3"  y2="3"  stroke={c} strokeWidth="1.2" opacity="0.7"/>
      <line x1="10" y1="10" x2="17" y2="3"  stroke={c} strokeWidth="1.2" opacity="0.7"/>
      <line x1="10" y1="10" x2="3"  y2="17" stroke={c} strokeWidth="1.2" opacity="0.7"/>
      <line x1="10" y1="10" x2="17" y2="17" stroke={c} strokeWidth="1.2" opacity="0.7"/>
      <circle cx="3"  cy="3"  r="2" fill="none" stroke={c} strokeWidth="1"/>
      <circle cx="17" cy="3"  r="2" fill="none" stroke={c} strokeWidth="1"/>
      <circle cx="3"  cy="17" r="2" fill="none" stroke={c} strokeWidth="1"/>
      <circle cx="17" cy="17" r="2" fill="none" stroke={c} strokeWidth="1"/>
    </svg>
  )
  if (profile === 'ground') return (
    <svg {...s} viewBox="0 0 20 20" aria-hidden="true">
      <rect x="5" y="4" width="10" height="12" rx="1.5" fill={c} opacity="0.9"/>
      <circle cx="7"  cy="16" r="2" fill="none" stroke={c} strokeWidth="1.2"/>
      <circle cx="13" cy="16" r="2" fill="none" stroke={c} strokeWidth="1.2"/>
      <circle cx="7"  cy="4"  r="2" fill="none" stroke={c} strokeWidth="1.2"/>
      <circle cx="13" cy="4"  r="2" fill="none" stroke={c} strokeWidth="1.2"/>
      <line x1="10" y1="4" x2="10" y2="2" stroke={c} strokeWidth="1.2"/>
    </svg>
  )
  if (profile === 'maritime') return (
    <svg {...s} viewBox="0 0 20 20" aria-hidden="true">
      <ellipse cx="10" cy="11" rx="4" ry="7" fill={c} opacity="0.9"/>
      <line x1="10" y1="4" x2="10" y2="1" stroke={c} strokeWidth="1.5"/>
      <line x1="10" y1="4" x2="7"  y2="7" stroke={c} strokeWidth="0.8" opacity="0.6"/>
      <line x1="10" y1="4" x2="13" y2="7" stroke={c} strokeWidth="0.8" opacity="0.6"/>
      <ellipse cx="10" cy="11" rx="2.5" ry="5" fill="none" stroke={c} strokeWidth="0.8" opacity="0.5"/>
    </svg>
  )
  return (
    <svg {...s} viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2"  y="6" width="3.5" height="10" rx="1.5" fill={c} opacity="0.7"/>
      <rect x="14.5" y="6" width="3.5" height="10" rx="1.5" fill={c} opacity="0.7"/>
      <rect x="5.5" y="7" width="9"  height="8"  rx="1"   fill={c}/>
      <circle cx="10" cy="11" r="2.2" fill="none" stroke={c} strokeWidth="1.2" opacity="0.8"/>
      <line x1="10" y1="7" x2="10" y2="4" stroke={c} strokeWidth="1.2"/>
      <circle cx="10" cy="3" r="1.3" fill={c}/>
    </svg>
  )
}

export function MissionProfileSelector({ value, onChange }: MissionProfileSelectorProps) {
  const current = MISSION_PROFILES[value]

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0" title="Switch operational mission profile">
      <span className="text-gcs-dim text-[10px] tracking-widest hidden lg:block" aria-hidden="true">
        PROFILE
      </span>
      <div className="relative">
        <select
          data-testid="mission-profile-select"
          value={value}
          onChange={(e) => onChange(e.target.value as MissionProfile)}
          aria-label="Mission profile selector"
          className="
            appearance-none cursor-pointer
            bg-gcs-bg border border-gcs-border
            text-gcs-cyan text-[11px] tracking-widest font-bold
            pl-1.5 pr-5 py-1
            hover:border-gcs-cyan transition-colors
            focus:outline-none focus:border-gcs-cyan
          "
          style={{ fontFamily: 'monospace' }}
        >
          {VALID_PROFILES.map((p) => {
            const meta = MISSION_PROFILES[p]
            return (
              <option key={p} value={p}>
                {meta.label}
              </option>
            )
          })}
        </select>
        {/* Custom chevron */}
        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gcs-dim text-[8px]">
          ▾
        </span>
      </div>
      {/* Active profile badge — SVG icon */}
      <span
        data-testid="active-profile-badge"
        className="hidden xl:flex items-center"
        aria-label={`Active profile: ${current.description}`}
      >
        <ProfileIcon profile={value} size={14} />
      </span>
    </div>
  )
}
