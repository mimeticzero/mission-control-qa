'use client'

import type { MissionProfile } from '@/lib/types'
import { MISSION_PROFILES, VALID_PROFILES } from '@/lib/mission-profiles'

interface MissionProfileSelectorProps {
  value:    MissionProfile
  onChange: (p: MissionProfile) => void
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
                {meta.emoji} {meta.label}
              </option>
            )
          })}
        </select>
        {/* Custom chevron */}
        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gcs-dim text-[8px]">
          ▾
        </span>
      </div>
      {/* Active profile badge */}
      <span
        data-testid="active-profile-badge"
        className="text-[9px] tracking-widest text-gcs-dim hidden xl:block"
        aria-label={`Active profile: ${current.description}`}
      >
        {current.emoji}
      </span>
    </div>
  )
}
