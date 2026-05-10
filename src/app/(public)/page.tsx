import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Mission Control QA Stack',
  description: 'Fully simulated drone ground control station demonstrating real-time QA patterns: E2E, load, and security testing for critical systems.',
}

const C = {
  bg:            '#030508',
  surface:       'rgba(255,255,255,0.03)',
  border:        'rgba(255,255,255,0.08)',
  cyan:          '#00f5ff',
  purple:        '#9b30ff',
  green:         '#22c55e',
  amber:         '#f59e0b',
  textPrimary:   '#f1f5f9',
  textSecondary: '#c4d0de',
  textMuted:     '#8496aa',
}

const FEATURES = [
  { id: '01', title: 'Live Drone Simulation',  desc: 'Paris CDG patrol route with interpolated GPS, telemetry noise, and battery drain. Runs entirely client-side via a deterministic state machine.' },
  { id: '02', title: 'Command Dispatch',        desc: 'RTH, HOLD, EMERGENCY_LAND, GOTO. Commands traverse a simulated 50–200 ms datalink with 2% packet-loss probability and ACK/TIMEOUT feedback.' },
  { id: '03', title: 'Datalink Monitoring',     desc: 'Real-time latency, RSSI, and packet-loss metrics with visual degradation indicators, history bar chart, and EW mode stress-test.' },
  { id: '04', title: 'Mission Timeline',        desc: 'Append-only event log with severity levels. Every waypoint, command, and anomaly is timestamped and categorised.' },
  { id: '05', title: 'QA-Ready Architecture',  desc: 'Deterministic simulator core, typed command bus, isolated Zustand store — built from the ground up for E2E, load, and security testing.' },
  { id: '06', title: 'Full Test Coverage',      desc: '207 Playwright tests across Chromium · Firefox · WebKit. K6 load: p95=198ms, 0% fail. Lighthouse: Perf 98, A11y 100.' },
]

const STACK = [
  { name: 'Next.js 15',   desc: 'App Router, RSC, Server Actions' },
  { name: 'TypeScript',   desc: 'Strict mode end-to-end' },
  { name: 'Tailwind CSS', desc: 'Utility-first, dark-theme design' },
  { name: 'react-leaflet',desc: 'Open-source mapping, no API key' },
  { name: 'Recharts',     desc: 'Real-time telemetry graphs' },
  { name: 'Zustand',      desc: 'Lightweight reactive state' },
  { name: 'Playwright',   desc: '207 tests — 3 browsers' },
  { name: 'K6',           desc: 'Load: 500 VU, 0% fail rate' },
]

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.textPrimary, fontFamily: 'Space Mono, Courier New, monospace' }}>

      {/* ── HIRE BANNER ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(3,5,8,0.96)',
        borderBottom: `1px solid rgba(0,245,255,0.12)`,
        padding: '10px clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}99`, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: C.textPrimary, letterSpacing: '1px' }}>Available for freelance missions · 600–800€/day</span>
          <span style={{ fontSize: '11px', color: C.textMuted, letterSpacing: '1px' }}>SDET / QA Architect · Remote · EN/FR</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="https://sakuranode.com/hire#contact"  style={{ fontSize: '11px', letterSpacing: '2px', textDecoration: 'none', padding: '5px 14px', color: C.cyan,    border: '1px solid rgba(0,245,255,0.3)' }}>→ Start a project</a>
          <a href="https://sakuranode.com/hire#missions" style={{ fontSize: '11px', letterSpacing: '2px', textDecoration: 'none', padding: '5px 14px', color: '#ff2d78', border: '1px solid rgba(255,45,120,0.3)' }}>→ See typical missions</a>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '14px clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="8" stroke={C.cyan} strokeWidth="1.5"/>
            <circle cx="10" cy="10" r="3"  fill={C.cyan}/>
            <line x1="10" y1="2"  x2="10" y2="6"  stroke={C.cyan} strokeWidth="1.5"/>
            <line x1="10" y1="14" x2="10" y2="18" stroke={C.cyan} strokeWidth="1.5"/>
            <line x1="2"  y1="10" x2="6"  y2="10" stroke={C.cyan} strokeWidth="1.5"/>
            <line x1="14" y1="10" x2="18" y2="10" stroke={C.cyan} strokeWidth="1.5"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '13px', letterSpacing: '3px', color: C.cyan, fontWeight: 700 }}>
            MISSION CONTROL QA
          </span>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/demo" style={{ fontSize: '11px', letterSpacing: '3px', color: C.textMuted, textDecoration: 'none' }}>DEMO</Link>
          <Link href="/qa"   style={{ fontSize: '11px', letterSpacing: '3px', color: C.textMuted, textDecoration: 'none' }}>QA RESULTS</Link>
          <a href="https://github.com/mimeticzero/mission-control-qa" target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', letterSpacing: '3px', color: C.textMuted, textDecoration: 'none' }}>GITHUB</a>
          <a href="https://sakuranode.com" style={{ fontSize: '11px', letterSpacing: '3px', color: C.textMuted, textDecoration: 'none' }}>← SAKURANODE</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,4vw,48px) clamp(40px,6vw,72px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>

          <div style={{
            display: 'inline-flex', alignItems: 'flex-start', gap: '10px',
            padding: '10px 16px', marginBottom: '40px',
            background: `${C.amber}08`, border: `1px solid ${C.amber}44`, textAlign: 'left',
          }}>
            <span style={{ fontSize: '10px', letterSpacing: '3px', color: C.amber, fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>NOTICE</span>
            <span style={{ fontSize: '11px', color: C.amber, lineHeight: 1.6, letterSpacing: '0.5px' }}>
              Educational / portfolio project. Simulates patterns applicable to real Ground Control Systems. All data is synthetic.
            </span>
          </div>

          <div style={{ fontSize: '11px', letterSpacing: '5px', color: C.cyan, marginBottom: '20px', opacity: 0.7 }}>
            GROUND CONTROL STATION · QUALITY ENGINEERING DEMO
          </div>

          <h1 style={{
            fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)',
            fontSize: 'clamp(24px, 4vw, 44px)',
            fontWeight: 700, lineHeight: 1.15, letterSpacing: '2px',
            color: C.textPrimary, marginBottom: '20px',
          }}>
            Mission Control<br />
            <span style={{ color: C.cyan }}>QA Stack</span>
          </h1>

          <p style={{ fontSize: 'clamp(13px,2vw,15px)', color: C.textSecondary, lineHeight: 1.75, maxWidth: '540px', margin: '0 auto 40px' }}>
            A fully simulated drone ground station built to demonstrate quality engineering patterns for
            critical, real-time systems — telemetry ingestion, command dispatch, datalink monitoring,
            and the test infrastructure that validates all of it.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/demo" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 26px', background: `${C.green}18`, color: C.green,
              fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '2px', textDecoration: 'none', border: `1px solid ${C.green}66`,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.green, display: 'inline-block' }} />
              LAUNCH DEMO
            </Link>
            <Link href="/docs" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '13px 26px', background: 'transparent', color: C.textMuted,
              fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '2px', textDecoration: 'none', border: `1px solid ${C.border}`,
            }}>
              READ DOCS
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: C.cyan, marginBottom: '32px', opacity: 0.8 }}>SYSTEM CAPABILITIES</div>
          <div className="mc-grid-3">
            {FEATURES.map((f) => (
              <div key={f.id} style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid rgba(155,48,255,0.15)`, borderTop: `2px solid ${C.purple}`, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '2px', color: C.textMuted }}>{f.id}</span>
                  <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '11px', letterSpacing: '2px', color: C.cyan, fontWeight: 700 }}>{f.title}</span>
                </div>
                <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STACK ── */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: C.cyan, marginBottom: '32px', opacity: 0.8 }}>TECHNOLOGY STACK</div>
          <div className="mc-grid-4">
            {STACK.map((s) => (
              <div key={s.name} style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid rgba(0,245,255,0.12)`, borderTop: `2px solid ${C.cyan}`, padding: '16px 20px' }}>
                <div style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '11px', letterSpacing: '2px', color: C.textPrimary, marginBottom: '6px', fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: '11px', color: C.textMuted }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '28px clamp(16px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: '11px', color: C.textMuted, letterSpacing: '2px' }}>MISSION CONTROL QA STACK — EDUCATIONAL PROJECT</span>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <a href="https://sakuranode.com/engineering-dashboard" style={{ fontSize: '11px', letterSpacing: '2px', color: C.cyan, textDecoration: 'none' }}>→ Engineering Dashboard</a>
          <a href="https://sakuranode.com" style={{ fontSize: '11px', letterSpacing: '2px', color: C.textMuted, textDecoration: 'none' }}>← Sakuranode.com</a>
        </div>
      </footer>

      <style>{`
        .mc-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .mc-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 900px) {
          .mc-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .mc-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .mc-grid-3 { grid-template-columns: 1fr; }
          .mc-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        a:hover { opacity: 0.8; }
      `}</style>
    </div>
  )
}
