import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'QA Results — Mission Control QA Stack',
  description: '207 Playwright tests · K6 500 VU · Lighthouse 98/100 · OWASP ZAP 0 High — full QA observability for the Mission Control GCS demo.',
}

const C = {
  bg:      '#030508',
  surface: 'rgba(0,0,0,0.5)',
  border:  'rgba(255,255,255,0.08)',
  pBorder: 'rgba(155,48,255,0.15)',
  cyan:    '#00f5ff',
  purple:  '#9b30ff',
  green:   '#22c55e',
  amber:   '#f59e0b',
  pink:    '#ff2d78',
  tPri:    '#f1f5f9',
  tSec:    '#c4d0de',
  tMut:    '#8496aa',
  tDim:    '#64748b',
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
  { name: 'Next.js 15',    desc: 'App Router, RSC, Server Actions' },
  { name: 'TypeScript',    desc: 'Strict mode end-to-end' },
  { name: 'Tailwind CSS',  desc: 'Utility-first, dark-theme design' },
  { name: 'react-leaflet', desc: 'Open-source mapping, no API key' },
  { name: 'Recharts',      desc: 'Real-time telemetry graphs' },
  { name: 'Zustand',       desc: 'Lightweight reactive state' },
  { name: 'Playwright',    desc: '207 tests — 3 browsers' },
  { name: 'K6',            desc: 'Load: 500 VU, 0% fail rate' },
]

function StatCard({ value, label, sub, accent }: { value: string; label: string; sub?: string; accent: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.pBorder}`, borderTop: `2px solid ${accent}`, padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: '12px', letterSpacing: '3px', color: C.tDim, marginBottom: '10px', textTransform: 'uppercase' as const }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '30px', fontWeight: 700, color: accent, letterSpacing: '2px' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: C.tMut, marginTop: '6px', letterSpacing: '1px' }}>{sub}</div>}
    </div>
  )
}

function SectionBox({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.pBorder}`, borderTop: `2px solid ${accent}`, padding: '24px', marginBottom: '20px' }}>
      {children}
    </div>
  )
}

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '12px', letterSpacing: '4px', color, marginBottom: '20px', textTransform: 'uppercase' as const }}>{children}</h2>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}`, fontSize: '13px' }}>
      <span style={{ color: C.tMut, letterSpacing: '1px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', color: accent ?? C.tPri, fontWeight: 700, letterSpacing: '1px' }}>{value}</span>
    </div>
  )
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ fontSize: '12px', letterSpacing: '2px', padding: '3px 10px', border: `1px solid ${color}66`, color, fontWeight: 700, whiteSpace: 'nowrap' as const }}>
      {children}
    </span>
  )
}

export default function QAPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.tPri, fontFamily: 'Space Mono, Courier New, monospace' }}>

      {/* ── HIRE BANNER ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(3,5,8,0.96)', borderBottom: `1px solid rgba(0,245,255,0.12)`, padding: '10px clamp(16px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}99`, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: C.tPri, letterSpacing: '1px' }}>Available for freelance missions · 600–800€/day</span>
          <span style={{ fontSize: '12px', color: C.tMut, letterSpacing: '1px' }}>SDET / QA Architect · Remote · EN/FR</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="https://sakuranode.com/hire#contact"  style={{ fontSize: '12px', letterSpacing: '2px', textDecoration: 'none', padding: '5px 14px', color: C.cyan, border: '1px solid rgba(0,245,255,0.3)' }}>→ Start a project</a>
          <a href="https://sakuranode.com/hire#missions" style={{ fontSize: '12px', letterSpacing: '2px', textDecoration: 'none', padding: '5px 14px', color: C.pink, border: '1px solid rgba(255,45,120,0.3)' }}>→ See typical missions</a>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: '14px clamp(16px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '12px', letterSpacing: '3px', color: C.cyan, fontWeight: 700 }}>MISSION CONTROL QA</span>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/demo" style={{ fontSize: '12px', letterSpacing: '3px', color: C.tMut, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '6px 14px' }}>DEMO</Link>
          <a href="https://github.com/mimeticzero/mission-control-qa" target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', letterSpacing: '3px', color: C.tMut, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '6px 14px' }}>GITHUB</a>
          <a href="https://sakuranode.com/hire" style={{ fontSize: '12px', letterSpacing: '3px', color: C.cyan, textDecoration: 'none', border: `1px solid ${C.cyan}44`, padding: '6px 14px', fontWeight: 700 }}>→ Hire Me</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px clamp(16px,4vw,48px) 80px' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', letterSpacing: '5px', color: C.cyan, marginBottom: '12px', opacity: 0.7 }}>QA OBSERVABILITY STACK · MISSION CONTROL</div>
          <h1 style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: 'clamp(20px,3vw,32px)', fontWeight: 700, letterSpacing: '2px', color: C.tPri, marginBottom: '10px' }}>
            QA Results
          </h1>
          <p style={{ fontSize: '13px', color: C.tSec, lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
            Live test metrics for the Mission Control GCS demo — Playwright E2E, K6 load, Lighthouse audits, and OWASP ZAP security scan.
          </p>
        </div>

        {/* ── 4 KEY METRICS ── */}
        <div className="qa-grid-4" style={{ marginBottom: '32px' }}>
          <StatCard value="207"   label="Playwright tests" sub="100% pass · 3 browsers"       accent={C.cyan}   />
          <StatCard value="198ms" label="K6 p95 latency"   sub="500 VU · 0% fail · 210.9 rps" accent={C.purple} />
          <StatCard value="98"    label="Lighthouse perf"  sub="A11y 100 · SEO 92 · BP 100"   accent={C.amber}  />
          <StatCard value="0"     label="ZAP high vulns"   sub="2 Medium · 6 Low · CSP active" accent={C.green}  />
        </div>

        {/* ── PLAYWRIGHT ── */}
        <SectionBox accent={C.cyan}>
          <SectionTitle color={C.cyan}>Playwright — E2E Test Suite</SectionTitle>
          <div className="qa-grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <Row label="Total tests"     value="207"       accent={C.cyan} />
              <Row label="Pass rate"       value="100%"      accent={C.green} />
              <Row label="Failed"          value="0"         accent={C.green} />
              <Row label="Suite duration"  value="2m 34s" />
              <Row label="Parallelism"     value="3 workers" />
              <Row label="Retries on fail" value="1" />
            </div>
            <div>
              <div style={{ fontSize: '12px', letterSpacing: '3px', color: C.tDim, marginBottom: '12px' }}>BROWSER BREAKDOWN</div>
              {[
                { browser: 'Chromium', tests: 69, color: C.cyan },
                { browser: 'Firefox',  tests: 69, color: C.purple },
                { browser: 'WebKit',   tests: 69, color: C.amber },
              ].map(({ browser, tests, color }) => (
                <div key={browser} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '13px', color: C.tMut, width: '80px', flexShrink: 0 }}>{browser}</span>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                    <div style={{ width: '100%', height: '100%', background: color, borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '12px', color, fontWeight: 700, width: '36px', textAlign: 'right', flexShrink: 0 }}>{tests}</span>
                  <Badge color={C.green}>✓ PASS</Badge>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '12px', letterSpacing: '2px', color: C.tDim, marginBottom: '10px' }}>TEST CATEGORIES</div>
          <div className="qa-grid-3">
            {[
              { cat: 'Telemetry ingestion',  count: '48', color: C.cyan },
              { cat: 'Command dispatch',      count: '38', color: C.cyan },
              { cat: 'EW mode',              count: '24', color: C.amber },
              { cat: 'Accessibility (a11y)', count: '32', color: C.purple },
              { cat: 'Datalink monitoring',  count: '36', color: C.cyan },
              { cat: 'Navigation & layout',  count: '29', color: C.tMut },
            ].map(({ cat, count, color }) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '12px', color: C.tSec }}>{cat}</span>
                <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '13px', color, fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </SectionBox>

        {/* ── K6 LOAD ── */}
        <SectionBox accent={C.purple}>
          <SectionTitle color={C.purple}>K6 — Load Test</SectionTitle>
          <div className="qa-grid-2">
            <div>
              <Row label="Virtual users (peak)" value="500 VU"    accent={C.purple} />
              <Row label="Test duration"         value="3 min"               />
              <Row label="Total requests"        value="~38 000"             />
              <Row label="Requests / second"     value="210.9 rps" accent={C.purple} />
              <Row label="p50 latency"           value="81ms"                />
              <Row label="p95 latency"           value="198ms"    accent={C.purple} />
              <Row label="p99 latency"           value="312ms"               />
              <Row label="Fail rate"             value="0%"       accent={C.green} />
            </div>
            <div>
              <div style={{ fontSize: '12px', letterSpacing: '3px', color: C.tDim, marginBottom: '12px' }}>VU RAMP PROFILE</div>
              {[
                { phase: '0 → 1 min', vu: '0 → 500',      width: '100%', color: C.purple },
                { phase: '1 → 2 min', vu: '500 (steady)', width: '100%', color: C.purple },
                { phase: '2 → 3 min', vu: '500 → 0',      width: '100%', color: C.purple },
              ].map(({ phase, vu, width, color }) => (
                <div key={phase} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.tMut, marginBottom: '4px' }}>
                    <span>{phase}</span><span style={{ color }}>{vu}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                    <div style={{ width, height: '100%', background: `${color}88`, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '16px', padding: '12px', background: `${C.purple}08`, border: `1px solid ${C.purple}33` }}>
                <div style={{ fontSize: '12px', letterSpacing: '2px', color: C.tDim, marginBottom: '6px' }}>ENDPOINTS TESTED</div>
                <div style={{ fontSize: '12px', color: C.tSec, lineHeight: 1.8 }}>
                  GET /api/mission-control/telemetry (SSE)<br />
                  POST /api/mission-control/commands
                </div>
              </div>
            </div>
          </div>
        </SectionBox>

        {/* ── LIGHTHOUSE ── */}
        <SectionBox accent={C.amber}>
          <SectionTitle color={C.amber}>Lighthouse — Performance Audit</SectionTitle>
          <div className="qa-grid-4" style={{ marginBottom: '20px' }}>
            {[
              { label: 'Performance',    score: 98,  color: C.green },
              { label: 'Accessibility',  score: 100, color: C.green },
              { label: 'Best Practices', score: 100, color: C.green },
              { label: 'SEO',           score: 92,  color: C.amber },
            ].map(({ label, score, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '36px', fontWeight: 700, color, marginBottom: '8px' }}>{score}</div>
                <div style={{ fontSize: '12px', letterSpacing: '2px', color: C.tDim, textTransform: 'uppercase' as const }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="qa-grid-2">
            <div>
              <Row label="First Contentful Paint"  value="0.4s"  accent={C.green} />
              <Row label="Largest Contentful Paint" value="0.7s"  accent={C.green} />
              <Row label="Total Blocking Time"      value="0ms"   accent={C.green} />
            </div>
            <div>
              <Row label="Cumulative Layout Shift" value="0.001" accent={C.green} />
              <Row label="Speed Index"              value="0.5s"  accent={C.green} />
              <Row label="Time to Interactive"      value="0.7s"  accent={C.green} />
            </div>
          </div>
        </SectionBox>

        {/* ── ZAP SECURITY ── */}
        <SectionBox accent={C.green}>
          <SectionTitle color={C.green}>OWASP ZAP — Security Scan</SectionTitle>
          <div className="qa-grid-4" style={{ marginBottom: '20px' }}>
            {[
              { label: 'High',          value: '0', color: C.pink  },
              { label: 'Medium',        value: '2', color: C.amber },
              { label: 'Low',           value: '6', color: C.cyan  },
              { label: 'Informational', value: '4', color: C.tDim  },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderTop: `2px solid ${color}`, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '32px', fontWeight: 700, color, marginBottom: '6px' }}>{value}</div>
                <div style={{ fontSize: '12px', letterSpacing: '2px', color: C.tDim, textTransform: 'uppercase' as const }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 18px', background: `${C.green}08`, border: `1px solid ${C.green}33`, marginBottom: '16px', fontSize: '13px', color: C.green, letterSpacing: '1px' }}>
            ✓ ZERO high-severity vulnerabilities · All security headers configured · CSP active · X-Frame-Options DENY
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="https://sakuranode.com/reports/mission-control-zap.html" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '12px', letterSpacing: '2px', color: C.purple, textDecoration: 'none', border: `1px solid ${C.purple}55`, padding: '8px 20px' }}>
              → Full ZAP Report ↗
            </a>
          </div>
        </SectionBox>

        {/* ── LINKS ── */}
        <div className="qa-grid-3">
          <a href="https://github.com/mimeticzero/mission-control-qa" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: `${C.green}04`, border: `1px solid ${C.green}33`, textDecoration: 'none', color: C.tPri }}>
            <div>
              <div style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '12px', letterSpacing: '2px', color: C.green, marginBottom: '4px' }}>GITHUB — SOURCE CODE</div>
              <div style={{ fontSize: '12px', color: C.tMut }}>All test suites, CI config, full source</div>
            </div>
            <span style={{ color: C.green, fontSize: '18px', marginLeft: '16px', flexShrink: 0 }}>↗</span>
          </a>
          <Link href="/demo"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: `${C.cyan}04`, border: `1px solid ${C.cyan}33`, textDecoration: 'none', color: C.tPri }}>
            <div>
              <div style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '12px', letterSpacing: '2px', color: C.cyan, marginBottom: '4px' }}>LIVE DEMO</div>
              <div style={{ fontSize: '12px', color: C.tMut }}>5-drone GCS simulator · EW mode · commands</div>
            </div>
            <span style={{ color: C.cyan, fontSize: '18px', marginLeft: '16px', flexShrink: 0 }}>→</span>
          </Link>
          <a href="https://sakuranode.com/hire"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: `${C.pink}04`, border: `1px solid ${C.pink}33`, textDecoration: 'none', color: C.tPri }}>
            <div>
              <div style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '12px', letterSpacing: '2px', color: C.pink, marginBottom: '4px' }}>HIRE ME</div>
              <div style={{ fontSize: '12px', color: C.tMut }}>SDET / QA Architect · 600–800€/day</div>
            </div>
            <span style={{ color: C.pink, fontSize: '18px', marginLeft: '16px', flexShrink: 0 }}>→</span>
          </a>
        </div>

        {/* ── SYSTEM CAPABILITIES ── */}
        <div style={{ marginTop: '48px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '4px', color: C.cyan, marginBottom: '24px', opacity: 0.8 }}>SYSTEM CAPABILITIES</div>
          <div className="mc-grid-3">
            {FEATURES.map((f) => (
              <div key={f.id} style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid rgba(155,48,255,0.15)`, borderTop: `2px solid ${C.purple}`, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', letterSpacing: '2px', color: C.tMut }}>{f.id}</span>
                  <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '12px', letterSpacing: '2px', color: C.cyan, fontWeight: 700 }}>{f.title}</span>
                </div>
                <p style={{ fontSize: '13px', color: C.tSec, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TECHNOLOGY STACK ── */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '4px', color: C.cyan, marginBottom: '24px', opacity: 0.8 }}>TECHNOLOGY STACK</div>
          <div className="mc-grid-4">
            {STACK.map((s) => (
              <div key={s.name} style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid rgba(0,245,255,0.12)`, borderTop: `2px solid ${C.cyan}`, padding: '16px 20px' }}>
                <div style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '12px', letterSpacing: '2px', color: C.tPri, marginBottom: '6px', fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: '12px', color: C.tMut }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .qa-grid-4  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .qa-grid-3  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px; }
        .qa-grid-2  { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .mc-grid-3  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .mc-grid-4  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 900px) {
          .qa-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .qa-grid-3 { grid-template-columns: 1fr; }
          .mc-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .mc-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .qa-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .qa-grid-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .mc-grid-3 { grid-template-columns: 1fr; }
          .mc-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        a:hover { opacity: 0.85; }
      `}</style>
    </div>
  )
}
