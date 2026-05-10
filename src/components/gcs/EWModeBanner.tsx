'use client'

/**
 * EWModeBanner — persistent alert strip shown when Electronic Warfare mode is active.
 *
 * Uses role="alert" + aria-live="assertive" so screen readers announce it immediately.
 * The banner is inserted directly in HUDHeader and has zero height when inactive
 * (conditional render, not CSS visibility) to avoid WCAG hidden-element traps.
 */

export function EWModeBanner() {
  return (
    <div
      data-testid="ew-mode-banner"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="
        w-full bg-gcs-red/10 border-b border-gcs-red
        flex items-center justify-center gap-3 py-0.5
        animate-pulse
      "
    >
      <span className="text-gcs-red text-[10px] font-bold tracking-[0.3em] uppercase">
        ⚡ DEGRADED LINK — Electronic Warfare Environment Active
      </span>
      <span className="text-gcs-red/70 text-[9px] tracking-wider">
        Latency 200–800 ms · PKT Loss 5–10 % · Glitch Mode
      </span>
    </div>
  )
}
