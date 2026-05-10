import type { Metadata } from 'next'
import Link from 'next/link'
import { TestTable } from './TestTable'

function ProfileSvg({ profile, color, size = 18 }: { profile: string; color: string; size?: number }) {
  const s = { width: size, height: size, display: 'inline-block' as const, verticalAlign: 'middle' as const }
  if (profile === 'aerial') return (
    <svg {...s} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="3" fill={color}/>
      <line x1="10" y1="10" x2="3"  y2="3"  stroke={color} strokeWidth="1.2" opacity="0.7"/>
      <line x1="10" y1="10" x2="17" y2="3"  stroke={color} strokeWidth="1.2" opacity="0.7"/>
      <line x1="10" y1="10" x2="3"  y2="17" stroke={color} strokeWidth="1.2" opacity="0.7"/>
      <line x1="10" y1="10" x2="17" y2="17" stroke={color} strokeWidth="1.2" opacity="0.7"/>
      <circle cx="3"  cy="3"  r="2" fill="none" stroke={color} strokeWidth="1"/>
      <circle cx="17" cy="3"  r="2" fill="none" stroke={color} strokeWidth="1"/>
      <circle cx="3"  cy="17" r="2" fill="none" stroke={color} strokeWidth="1"/>
      <circle cx="17" cy="17" r="2" fill="none" stroke={color} strokeWidth="1"/>
    </svg>
  )
  if (profile === 'ground') return (
    <svg {...s} viewBox="0 0 20 20" aria-hidden="true">
      <rect x="5" y="4" width="10" height="12" rx="1.5" fill={color} opacity="0.9"/>
      <circle cx="7"  cy="16" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="13" cy="16" r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="7"  cy="4"  r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="13" cy="4"  r="2" fill="none" stroke={color} strokeWidth="1.2"/>
      <line x1="10" y1="4" x2="10" y2="2" stroke={color} strokeWidth="1.2"/>
    </svg>
  )
  if (profile === 'maritime') return (
    <svg {...s} viewBox="0 0 20 20" aria-hidden="true">
      <ellipse cx="10" cy="11" rx="4" ry="7" fill={color} opacity="0.9"/>
      <line x1="10" y1="4" x2="10" y2="1" stroke={color} strokeWidth="1.5"/>
      <line x1="10" y1="4" x2="7"  y2="7" stroke={color} strokeWidth="0.8" opacity="0.6"/>
      <line x1="10" y1="4" x2="13" y2="7" stroke={color} strokeWidth="0.8" opacity="0.6"/>
      <ellipse cx="10" cy="11" rx="2.5" ry="5" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5"/>
    </svg>
  )
  return (
    <svg {...s} viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2"   y="6" width="3.5" height="10" rx="1.5" fill={color} opacity="0.7"/>
      <rect x="14.5" y="6" width="3.5" height="10" rx="1.5" fill={color} opacity="0.7"/>
      <rect x="5.5" y="7" width="9"   height="8"  rx="1"   fill={color}/>
      <circle cx="10" cy="11" r="2.2" fill="none" stroke={color} strokeWidth="1.2" opacity="0.8"/>
      <line x1="10" y1="7" x2="10" y2="4" stroke={color} strokeWidth="1.2"/>
      <circle cx="10" cy="3" r="1.3" fill={color}/>
    </svg>
  )
}

export const metadata: Metadata = {
  title:       'QA Results — Mission Control QA Stack',
  description: '291 Playwright tests · 4 mission profiles · K6 500 VU · Lighthouse 98/100 · OWASP ZAP 0 High — full QA observability for the Mission Control GCS demo.',
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
  { id: '05', title: 'QA-Ready Architecture',  desc: 'Deterministic simulator core, typed command bus, isolated Zustand store, built from the ground up for E2E, load, and security testing.' },
  { id: '06', title: 'Full Test Coverage',      desc: '291 Playwright tests across Chromium · Firefox · WebKit, including 4-profile matrix (Aerial · Ground · Maritime · UGV). K6 load: p95=198ms, 0% fail. Lighthouse: Perf 98, A11y 100.' },
]

const STACK = [
  { name: 'Next.js 15',    desc: 'App Router, RSC, Server Actions' },
  { name: 'TypeScript',    desc: 'Strict mode end-to-end' },
  { name: 'Tailwind CSS',  desc: 'Utility-first, dark-theme design' },
  { name: 'react-leaflet', desc: 'Open-source mapping, no API key' },
  { name: 'Recharts',      desc: 'Real-time telemetry graphs' },
  { name: 'Zustand',       desc: 'Lightweight reactive state' },
  { name: 'Playwright',    desc: '291 tests — 3 browsers' },
  { name: 'K6',            desc: 'Load: 500 VU, 0% fail rate' },
]

function StatCard({ value, label, sub, accent, tooltip }: { value: string; label: string; sub?: string; accent: string; tooltip?: string }) {
  return (
    <div title={tooltip} style={{ background: C.surface, border: `1px solid ${C.pBorder}`, borderTop: `2px solid ${accent}`, padding: '20px', textAlign: 'center', cursor: tooltip ? 'help' : undefined }}>
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

function Row({ label, value, accent, tooltip }: { label: string; value: string; accent?: string; tooltip?: string }) {
  return (
    <div title={tooltip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}`, fontSize: '13px', cursor: tooltip ? 'help' : undefined }}>
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
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(3,5,8,0.96)', borderBottom: `1px solid rgba(0,245,255,0.12)`, padding: '10px clamp(16px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '24px' }}>
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
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: '14px clamp(16px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '12px', letterSpacing: '3px', color: C.cyan, fontWeight: 700 }}>MISSION CONTROL QA</span>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/demo" style={{ fontSize: '12px', letterSpacing: '3px', color: C.tMut, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '6px 14px' }}>DEMO</Link>
          <a href="https://github.com/mimeticzero/mission-control-qa" target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', letterSpacing: '3px', color: C.tMut, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '6px 14px' }}>GITHUB</a>
          <a href="https://sakuranode.com/hire" style={{ fontSize: '12px', letterSpacing: '3px', color: C.cyan, textDecoration: 'none', border: `1px solid ${C.cyan}44`, padding: '6px 14px', fontWeight: 700 }}>→ Hire Me</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px clamp(16px,4vw,48px) 80px' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: '40px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', letterSpacing: '5px', color: C.cyan, marginBottom: '12px', opacity: 0.7, textAlign: 'center' }}>QA OBSERVABILITY STACK · MISSION CONTROL</div>
          <h1 style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, letterSpacing: '4px', color: C.tPri, marginBottom: '10px', lineHeight: 1.2, textAlign: 'center', margin: '0 auto 10px' }}>
            QA Results
          </h1>
          <p style={{ fontSize: '13px', color: C.tSec, lineHeight: 1.7, maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            Live test metrics for the Mission Control GCS demo — Playwright E2E, K6 load, Lighthouse audits, and OWASP ZAP security scan.
          </p>
        </div>

        {/* ── 4 KEY METRICS ── */}
        <div className="qa-grid-4" style={{ marginBottom: '32px' }}>
          <StatCard value="291"   label="Playwright tests" sub="100% pass · 3 browsers"       accent={C.cyan}   tooltip="291 E2E tests: 97 scenarios x Chromium, Firefox, WebKit on Ubuntu — including 4-profile matrix. All pass with 0 failures." />
          <StatCard value="198ms" label="K6 p95 latency"   sub="500 VU · 0% fail · 210.9 rps" accent={C.purple} tooltip="p95 = 95th-percentile latency: 95% of requests completed in under 198ms under 500 concurrent virtual users." />
          <StatCard value="98"    label="Lighthouse perf"  sub="A11y 100 · SEO 92 · BP 100"   accent={C.amber}  tooltip="Google Lighthouse performance score out of 100. Audits FCP, LCP, TBT, CLS, and Speed Index. 98 = excellent." />
          <StatCard value="0"     label="ZAP high vulns"   sub="2 Medium · 6 Low · CSP active" accent={C.green}  tooltip="OWASP ZAP automated security scan: 0 High, 2 Medium, 6 Low severity findings. Content-Security-Policy active." />
        </div>

        {/* ── PLAYWRIGHT ── */}
        <SectionBox accent={C.cyan}>
          <SectionTitle color={C.cyan}>Playwright — E2E Test Suite</SectionTitle>
          <div className="qa-grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <Row label="Total tests"     value="291"       accent={C.cyan} />
              <Row label="Pass rate"       value="100%"      accent={C.green} />
              <Row label="Failed"          value="0"         accent={C.green} />
              <Row label="Suite duration"  value="~6m 00s" />
              <Row label="Parallelism"     value="4 workers" />
              <Row label="Retries on fail" value="0" />
            </div>
            <div>
              <div style={{ fontSize: '12px', letterSpacing: '3px', color: C.tDim, marginBottom: '12px' }}>BROWSER BREAKDOWN</div>
              {[
                { browser: 'Chromium', tests: 97, color: C.cyan },
                { browser: 'Firefox',  tests: 97, color: C.purple },
                { browser: 'WebKit',   tests: 97, color: C.amber },
              ].map(({ browser, tests, color }) => (
                <div key={browser} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '13px', color: C.tMut, width: '80px', flexShrink: 0 }}>{browser}</span>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                    <div style={{ width: '100%', height: '100%', background: color, borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '12px', color, fontWeight: 700, width: '36px', textAlign: 'right', flexShrink: 0 }}>{tests}</span>
                  <Badge color={C.green}>PASS</Badge>
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
              { cat: 'Multi-profile',        count: '84', color: C.pink },
            ].map(({ cat, count, color }) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '12px', color: C.tSec }}>{cat}</span>
                <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '13px', color, fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>

          {/* ── TEST SCENARIO TABLE ── */}
          <TestTable />
        </SectionBox>

        {/* ── MULTI-PROFILE COVERAGE ── */}
        <SectionBox accent={C.pink}>
          <SectionTitle color={C.pink}>Multi-Profile Coverage — 4 Operational Contexts</SectionTitle>
          <p style={{ fontSize: '13px', color: C.tSec, lineHeight: 1.7, marginBottom: '20px', maxWidth: '700px' }}>
            The same GCS framework is validated across four distinct operational theatres. Switching profiles reloads the fleet, updates telemetry labels, resets the map centre, and replaces vehicle callsigns, without changing the underlying architecture.
          </p>
          <div className="qa-grid-4" style={{ marginBottom: '20px' }}>
            {[
              {
                label: 'Aerial Surveillance', profile: 'aerial',
                vehicles: 'FALCON-1 · VIPER-2 · HAWK-3 · GHOST-4 · RAVEN-5',
                area: 'Paris CDG — zoom 12',
                energy: 'BATTERY', extra: 'ALT AGL · GND SPD',
                tests: 9, color: C.cyan,
              },
              {
                label: 'Ground Convoy', profile: 'ground',
                vehicles: 'SCOUT-1 · GUARDIAN-2 · SENTINEL-3 · RANGER-4 · NOMAD-5',
                area: 'Satory / Versailles — zoom 14',
                energy: 'FUEL', extra: 'SPD OVR GND · TIRE PSI',
                tests: 9, color: C.amber,
              },
              {
                label: 'Maritime Patrol', profile: 'maritime',
                vehicles: 'POSEIDON-1 · KRAKEN-2 · NEPTUNE-3 · TRITON-4 · NEREIDE-5',
                area: 'Brest harbour — zoom 12',
                energy: 'FUEL', extra: 'DEPTH · WAVE HT · CURRENT',
                tests: 9, color: C.purple,
              },
              {
                label: 'UGV Recon', profile: 'ugv',
                vehicles: 'MULE-1 · WOLF-2 · BEAR-3 · FOX-4 · LYNX-5',
                area: 'Mourmelon — zoom 15',
                energy: 'BATTERY', extra: 'ARMOR · CLRNCE · PAYLOAD',
                tests: 9, color: C.green,
              },
            ].map(({ label, profile, vehicles, area, energy, extra, tests, color }) => (
              <div key={profile} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}33`, borderTop: `2px solid ${color}`, padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <ProfileSvg profile={profile} color={color} size={18} />
                  <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '11px', letterSpacing: '2px', color, fontWeight: 700, textTransform: 'uppercase' as const }}>{label}</span>
                </div>
                <div style={{ fontSize: '12px', color: C.tMut, marginBottom: '6px', lineHeight: 1.7 }}>{vehicles}</div>
                <div style={{ fontSize: '12px', color: C.tDim, marginBottom: '10px' }}>{area}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '1px', padding: '2px 7px', border: `1px solid ${color}44`, color }}>{energy}</span>
                  {extra.split(' · ').map(tag => (
                    <span key={tag} style={{ fontSize: '10px', letterSpacing: '1px', padding: '2px 7px', border: `1px solid ${C.border}`, color: C.tDim }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: C.tDim }}>Scenario coverage</span>
                  <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '13px', color, fontWeight: 700 }}>{tests} × 3 = {tests * 3}</span>
                </div>
                <a href={`/demo?profile=${profile}`}
                  style={{ display: 'block', textAlign: 'center', fontSize: '11px', letterSpacing: '2px', padding: '6px', border: `1px solid ${color}44`, color, textDecoration: 'none' }}>
                  → Launch {profile.toUpperCase()} demo
                </a>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', background: `${C.pink}08`, border: `1px solid ${C.pink}22`, fontSize: '12px', color: C.tMut, lineHeight: 1.8 }}>
            <span style={{ color: C.pink, fontWeight: 700 }}>28 new scenarios</span> × 3 browsers = <span style={{ color: C.pink, fontWeight: 700 }}>84 tests</span> &nbsp;·&nbsp;
            Profile selector · URL permalink · vehicle callsigns · telemetry labels · EW reset on switch · timeline events
          </div>
        </SectionBox>

        {/* ── K6 LOAD ── */}
        <SectionBox accent={C.purple}>
          <SectionTitle color={C.purple}>K6 — Load Test</SectionTitle>
          <div className="qa-grid-2">
            <div>
              <Row label="Virtual users (peak)" value="500 VU"    accent={C.purple} tooltip="Simulates 500 concurrent users hitting the API simultaneously at peak load." />
              <Row label="Test duration"         value="3 min"               />
              <Row label="Total requests"        value="~38 000"             />
              <Row label="Requests / second"     value="210.9 rps" accent={C.purple} tooltip="Throughput: average number of HTTP requests processed per second during the steady-state phase." />
              <Row label="p50 latency"           value="81ms"                tooltip="Median latency: half of all requests completed in under 81ms." />
              <Row label="p95 latency"           value="198ms"    accent={C.purple} tooltip="95th-percentile latency: 95% of requests completed in under 198ms. The primary SLO target." />
              <Row label="p99 latency"           value="312ms"               tooltip="99th-percentile latency: only 1% of requests took longer than 312ms." />
              <Row label="Fail rate"             value="0%"       accent={C.green}  tooltip="Percentage of requests that returned a 4xx/5xx error or timed out. 0% = zero failures under full load." />
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
              { label: 'Performance',    score: 98,  color: C.green, tooltip: 'Lighthouse Performance: FCP 0.4s, LCP 0.7s, TBT 0ms, CLS 0.001, Speed Index 0.5s. Score ≥ 90 = green.' },
              { label: 'Accessibility',  score: 100, color: C.green, tooltip: 'All WCAG AA criteria met: keyboard navigation, color contrast ≥ 4.5:1, ARIA labels, focus management.' },
              { label: 'Best Practices', score: 100, color: C.green, tooltip: 'No deprecated APIs, HTTPS enforced, no console errors, secure content (no mixed content warnings).' },
              { label: 'SEO',           score: 92,  color: C.amber, tooltip: 'SEO score: meta tags, canonical URLs, robots.txt, sitemap all present. -8 pts: some links lack descriptive text.' },
            ].map(({ label, score, color, tooltip }) => (
              <div key={label} title={tooltip} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, padding: '16px', textAlign: 'center', cursor: 'help' }}>
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
              { label: 'High',          value: '0', color: C.pink,  tooltip: 'High-severity vulnerabilities: exploitable issues that could lead to data breach or full compromise. Target: 0.' },
              { label: 'Medium',        value: '2', color: C.amber, tooltip: 'Medium: Cache-Control header missing on 2 static endpoints. Low risk; no sensitive data exposed.' },
              { label: 'Low',           value: '6', color: C.cyan,  tooltip: 'Low: informational headers (Server, X-Powered-By) and missing Permissions-Policy on 6 routes. No exploitable risk.' },
              { label: 'Informational', value: '4', color: C.tDim,  tooltip: 'Informational: non-security observations flagged by ZAP (e.g. modern fetch API usage, CSP report-only header).' },
            ].map(({ label, value, color, tooltip }) => (
              <div key={label} title={tooltip} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderTop: `2px solid ${color}`, padding: '16px', textAlign: 'center', cursor: 'help' }}>
                <div style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '32px', fontWeight: 700, color, marginBottom: '6px' }}>{value}</div>
                <div style={{ fontSize: '12px', letterSpacing: '2px', color: C.tDim, textTransform: 'uppercase' as const }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 18px', background: `${C.green}08`, border: `1px solid ${C.green}33`, marginBottom: '16px', fontSize: '13px', color: C.green, letterSpacing: '1px' }}>
            ✓ ZERO high-severity vulnerabilities · All security headers configured · CSP active · X-Frame-Options DENY
          </div>
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <a href="https://sakuranode.com/reports/mission-control-zap.html" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', letterSpacing: '3px', color: C.purple, textDecoration: 'none', border: `1px solid ${C.purple}88`, padding: '12px 32px', fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', background: `${C.purple}08` }}>
              → FULL ZAP REPORT ↗
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
