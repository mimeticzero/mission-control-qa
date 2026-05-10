import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Docs — Mission Control QA Stack',
  description: 'Technical reference for the Mission Control QA stack: architecture, simulator parameters, API routes, command protocol, and QA coverage.',
}

/* ── Design tokens ── */

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

/* ── Helpers ── */

function Code({ children }: { children: string }) {
  return (
    <code style={{
      padding: '2px 8px', background: 'rgba(0,245,255,0.07)',
      border: `1px solid rgba(0,245,255,0.18)`, color: C.cyan,
      fontSize: '11px', fontFamily: 'Courier New, monospace',
    }}>
      {children}
    </code>
  )
}

function Block({ children }: { children: string }) {
  return (
    <pre style={{
      background: C.surface, border: `1px solid ${C.border}`,
      padding: '20px', overflowX: 'auto',
      fontSize: '11px', color: C.cyan, lineHeight: 1.7,
      fontFamily: 'Courier New, monospace',
    }}>
      {children}
    </pre>
  )
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: '10px', letterSpacing: '2px', color: C.textMuted }}>//</span>
      <h2 style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '12px', letterSpacing: '4px', color: C.cyan, fontWeight: 700, textTransform: 'uppercase' as const }}>
        {children}
      </h2>
    </div>
  )
}

const NAV_ITEMS = [
  { href: '#overview',     label: 'Overview'     },
  { href: '#architecture', label: 'Architecture' },
  { href: '#simulator',    label: 'Simulator'    },
  { href: '#api',          label: 'API Routes'   },
  { href: '#commands',     label: 'Commands'     },
  { href: '#state',        label: 'State'        },
  { href: '#qa-roadmap',   label: 'QA Roadmap'   },
  { href: '#running',      label: 'Running'      },
]

/* ── Page ── */

export default function DocsPage() {
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

      {/* ── TOP NAV ── */}
      <nav style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '14px clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <Link href="/" style={{ fontSize: '11px', letterSpacing: '3px', color: C.cyan, textDecoration: 'none', fontWeight: 700 }}>
          ← Mission Control QA
        </Link>
        <Link href="/demo" style={{
          fontSize: '11px', letterSpacing: '2px', color: C.green, textDecoration: 'none',
          border: `1px solid ${C.green}66`, padding: '5px 14px',
        }}>
          LAUNCH DEMO
        </Link>
      </nav>

      <div style={{ display: 'flex', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: '180px', flexShrink: 0, borderRight: `1px solid ${C.border}`,
          padding: '32px 20px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        }}>
          <div style={{ fontSize: '9px', letterSpacing: '4px', color: C.textMuted, marginBottom: '16px', textTransform: 'uppercase' as const }}>
            Contents
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} style={{
                display: 'block', fontSize: '11px', letterSpacing: '2px',
                color: C.textMuted, textDecoration: 'none', padding: '6px 0',
              }}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, padding: '40px 40px 80px', overflowY: 'auto', minWidth: 0 }}>

          {/* Page header */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '4px', color: C.textMuted, marginBottom: '10px' }}>
              TECHNICAL REFERENCE
            </div>
            <h1 style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 700, letterSpacing: '2px', color: C.cyan, marginBottom: '10px' }}>
              Mission Control QA Stack
            </h1>
            <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.7 }}>
              Architecture, APIs, and QA patterns for a simulated Ground Control System.
            </p>
          </div>

          {/* Overview */}
          <section id="overview" style={{ marginBottom: '48px' }}>
            <SectionHeading id="overview-h">Overview</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: C.textSecondary, lineHeight: 1.8 }}>
              <p>
                This project demonstrates quality engineering patterns for a real-time drone Ground Control Station (GCS).
                It is intentionally over-engineered from a QA perspective: the simulation is deterministic,
                the command bus is typed, and every moving part is designed to be testable.
              </p>
              <p>
                The primary goal is a portfolio artefact that answers:{' '}
                <em style={{ color: C.textPrimary }}>&ldquo;How do you test a system that ingests continuous telemetry, dispatches commands over a lossy link, and must never lose state?&rdquo;</em>
              </p>
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture" style={{ marginBottom: '48px' }}>
            <SectionHeading id="architecture-h">Architecture</SectionHeading>
            <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.8, marginBottom: '16px' }}>The system is split into four concerns:</p>
            <Block>{`src/
  app/
    (public)/
      page.tsx          → Landing (Server Component)
      demo/page.tsx     → GCS UI (Client Component)
      docs/page.tsx     → This page (Server Component)
    api/
      telemetry/route   → SSE stream (server-side sim)
      commands/route    → REST command handler
  components/gcs/       → All GCS display components
  lib/
    types.ts            → Shared TypeScript types
    drone-simulator.ts  → Client-side simulation engine
    fleet-simulator.ts  → 5-drone fleet manager
    fleet-config.ts     → Patrol routes + drone configs
    script-engine.ts    → Scripted mission events
  store/
    use-drone-store.ts  → Zustand store (single source of truth)`}
            </Block>
          </section>

          {/* Simulator */}
          <section id="simulator" style={{ marginBottom: '48px' }}>
            <SectionHeading id="simulator-h">Drone Simulator</SectionHeading>
            <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.8, marginBottom: '20px' }}>
              The simulator maintains a state machine and advances 5 drones along pre-defined patrol routes around Paris CDG.
              FleetSimulator runs one shared 400 ms interval for all drones (one React re-render per tick).
            </p>
            <Block>{`// Instantiate
const fleet = new FleetSimulator(batchUpdateFleet)
fleet.start()

// Send a command to a specific drone
fleet.sendCommandTo(droneId, cmd, onAck, onFail)`}
            </Block>
            <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.8, margin: '16px 0' }}>Key simulation parameters:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }}>
              {[
                ['Tick rate',       '400 ms'],
                ['Ground speed',    '10 m/s'],
                ['Battery drain',   '0.056 %/s (~30 min)'],
                ['Base latency',    '55–200 ms'],
                ['Packet loss',     '2 % probability'],
                ['Command timeout', '3 s'],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: `1px solid ${C.border}`, fontSize: '12px',
                }}>
                  <span style={{ color: C.textMuted }}>{k}</span>
                  <Code>{v as string}</Code>
                </div>
              ))}
            </div>
          </section>

          {/* API Routes */}
          <section id="api" style={{ marginBottom: '48px' }}>
            <SectionHeading id="api-h">API Routes</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: C.green, border: `1px solid ${C.green}66`, padding: '2px 8px', letterSpacing: '1px' }}>GET</span>
                  <Code>/api/telemetry</Code>
                </div>
                <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.7, marginBottom: '12px' }}>
                  Server-Sent Events stream. Emits a synthetic telemetry JSON payload every second.
                </p>
                <Block>{`data: {"id":"DRONE-001","callsign":"FALCON-1","timestamp":...}

// Connect in browser:
const es = new EventSource('/api/telemetry')
es.onmessage = (e) => console.log(JSON.parse(e.data))`}
                </Block>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: C.cyan, border: `1px solid ${C.cyan}66`, padding: '2px 8px', letterSpacing: '1px' }}>POST</span>
                  <Code>/api/commands</Code>
                </div>
                <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.7, marginBottom: '12px' }}>
                  Accepts a command payload, simulates processing delay, returns acknowledgement.
                </p>
                <Block>{`// Request
POST /api/commands
{ "type": "RTH" }

// Response
{ "id": "uuid", "status": "ACKNOWLEDGED", "latency": 82 }`}
                </Block>
              </div>
            </div>
          </section>

          {/* Commands */}
          <section id="commands" style={{ marginBottom: '48px' }}>
            <SectionHeading id="commands-h">Command Protocol</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { cmd: 'RTH',                    desc: 'Return To Home. Drone navigates to HOME_POSITION at cruise speed, then enters HOLD.' },
                { cmd: 'HOLD',                   desc: 'Stationary hover at current GPS position.' },
                { cmd: 'GOTO <lat> <lng> [alt]', desc: 'Navigate to arbitrary coordinates. Altitude defaults to 120 m AGL.' },
                { cmd: 'EMERGENCY_LAND',          desc: 'Immediate 3 m/s descent at current position. Highest priority.' },
              ].map(({ cmd, desc }) => (
                <div key={cmd} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0 }}><Code>{cmd}</Code></div>
                  <span style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.7 }}>{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* State */}
          <section id="state" style={{ marginBottom: '48px' }}>
            <SectionHeading id="state-h">State Management</SectionHeading>
            <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.8, marginBottom: '16px' }}>
              A single Zustand store (<Code>useDroneStore</Code>) is the source of truth.
              All components subscribe to slices; the simulator writes to it via callbacks.
            </p>
            <Block>{`interface DroneStore {
  telemetry:    DroneTelemetry | null
  datalink:     DataLink | null
  commands:     Command[]           // last 50
  events:       MissionEvent[]      // last 200
  history:      TelemetrySnapshot[] // last 180 ticks (~72 s)
  isSimulating: boolean
  ewMode:       boolean
}`}
            </Block>
          </section>

          {/* QA Roadmap */}
          <section id="qa-roadmap" style={{ marginBottom: '48px' }}>
            <SectionHeading id="qa-roadmap-h">QA Coverage</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { tool: 'Playwright', path: 'tests/e2e/',  accent: C.cyan,   desc: '207 tests across Chromium, Firefox, WebKit — telemetry, commands, EW mode, accessibility.' },
                { tool: 'K6',        path: 'tests/load/', accent: C.purple, desc: '500 VU load test — p95=198ms, 0% fail rate, 210.9 rps.' },
                { tool: 'OWASP ZAP', path: 'reports/',    accent: C.amber,  desc: '0 High, 2 Medium, 6 Low alerts. All security headers configured.' },
                { tool: 'Lighthouse',path: 'CI',           accent: C.green,  desc: 'Perf 98, A11y 100, SEO 92, Best Practices 100.' },
              ].map(({ tool, path, accent, desc }) => (
                <div key={tool} style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `2px solid ${accent}`, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)', fontSize: '11px', letterSpacing: '2px', color: accent, fontWeight: 700 }}>{tool}</span>
                    <span style={{ fontSize: '10px', color: C.textMuted, fontFamily: 'Courier New, monospace' }}>{path}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Running locally */}
          <section id="running" style={{ marginBottom: '48px' }}>
            <SectionHeading id="running-h">Running Locally</SectionHeading>
            <Block>{`# 1. Clone and install
git clone https://github.com/mimeticzero/mission-control-qa
cd mission-control-qa
npm install

# 2. Start dev server
npm run dev

# Open http://localhost:3000/mission-control`}
            </Block>
            <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.8, marginTop: '16px' }}>
              The simulation runs entirely in-browser. No environment variables required for the demo.
            </p>
          </section>

        </main>
      </div>

      <style>{`a:hover { opacity: 0.8; }`}</style>
    </div>
  )
}
