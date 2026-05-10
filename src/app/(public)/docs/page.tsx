import Link from 'next/link'

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12">
      <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-gcs-border">
        <span className="text-gcs-dim text-[9px] tracking-widest">//</span>
        <h2 className="text-gcs-cyan text-sm font-bold tracking-wider uppercase">{title}</h2>
      </div>
      <div className="space-y-4 text-[12px] text-gcs-muted leading-relaxed">{children}</div>
    </section>
  )
}

function Code({ children }: { children: string }) {
  return (
    <code className="px-1.5 py-0.5 bg-gcs-panel border border-gcs-border text-gcs-cyan text-[11px]">
      {children}
    </code>
  )
}

function Block({ children }: { children: string }) {
  return (
    <pre className="bg-gcs-panel border border-gcs-border p-4 overflow-x-auto text-[11px] text-gcs-cyan leading-relaxed">
      {children}
    </pre>
  )
}

const NAV_ITEMS = [
  { href: '#overview',      label: 'Overview'      },
  { href: '#architecture',  label: 'Architecture'  },
  { href: '#simulator',     label: 'Simulator'     },
  { href: '#api',           label: 'API Routes'    },
  { href: '#commands',      label: 'Commands'      },
  { href: '#state',         label: 'State'         },
  { href: '#qa-roadmap',    label: 'QA Roadmap'    },
  { href: '#running',       label: 'Running'       },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gcs-bg flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gcs-border px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-gcs-cyan text-xs font-bold tracking-[0.2em] uppercase hover:text-gcs-text transition-colors">
          ← Mission Control QA
        </Link>
        <Link
          href="/demo"
          className="border border-gcs-cyan text-gcs-cyan text-[10px] tracking-widest uppercase px-3 py-1.5 hover:bg-gcs-cyan/10 transition-colors"
        >
          Launch Demo
        </Link>
      </nav>

      <div className="flex flex-1 max-w-5xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0 border-r border-gcs-border py-8 px-4 sticky top-0 h-screen overflow-y-auto">
          <div className="text-[9px] tracking-[0.3em] uppercase text-gcs-dim mb-4">Contents</div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-[11px] text-gcs-muted hover:text-gcs-cyan transition-colors py-1 tracking-wider"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 px-8 py-8 overflow-y-auto">
          <div className="mb-8">
            <div className="text-[9px] tracking-[0.3em] uppercase text-gcs-dim mb-2">
              Technical Reference
            </div>
            <h1 className="text-xl font-bold text-gcs-cyan tracking-tight">
              Mission Control QA Stack
            </h1>
            <p className="text-gcs-muted text-sm mt-1">
              Architecture, APIs, and QA patterns for a simulated Ground Control System.
            </p>
          </div>

          <Section id="overview" title="Overview">
            <p>
              This project demonstrates quality engineering patterns for a real-time drone Ground Control Station (GCS).
              It is intentionally over-engineered from a QA perspective: the simulation is deterministic,
              the command bus is typed, and every moving part is designed to be testable.
            </p>
            <p>
              The primary goal is a portfolio artefact that answers:{' '}
              <em className="text-gcs-text">"How do you test a system that ingests continuous telemetry, dispatches commands over a lossy link, and must never lose state?"</em>
            </p>
          </Section>

          <Section id="architecture" title="Architecture">
            <p>The system is split into four concerns:</p>
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
  components/ui/        → Shared design primitives
  lib/
    types.ts            → Shared TypeScript types
    drone-simulator.ts  → Client-side simulation engine
  store/
    use-drone-store.ts  → Zustand store (single source of truth)`}
            </Block>
            <p>
              The <Code>DroneSimulator</Code> runs entirely in the browser via{' '}
              <Code>setInterval</Code>. The API routes provide a server-side mirror
              (useful for testing the HTTP layer independently of the UI simulation).
            </p>
          </Section>

          <Section id="simulator" title="Drone Simulator">
            <p>
              The simulator maintains a state machine and advances a drone along a
              pre-defined patrol route around Paris CDG. It is instantiated once on
              mount of the demo page and writes to the Zustand store on each 400 ms tick.
            </p>
            <Block>{`// Instantiate
const sim = new DroneSimulator((telemetry, datalink, event) => {
  store.updateTelemetry(telemetry, datalink)
  if (event) store.pushEvent(event)
})
sim.start()

// Send a command with simulated latency + packet loss
sim.sendCommand(cmd, onAck, onFail)`}
            </Block>
            <p>Key simulation parameters:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                ['Tick rate',        '400 ms'],
                ['Ground speed',     '10 m/s'],
                ['Battery drain',    '0.056 %/s (~30 min)'],
                ['Base latency',     '55–200 ms'],
                ['Packet loss',      '2 % probability'],
                ['Command timeout',  '3 s'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gcs-border pb-1">
                  <span className="text-gcs-dim">{k}</span>
                  <Code>{v}</Code>
                </div>
              ))}
            </div>
          </Section>

          <Section id="api" title="API Routes">
            <p>
              Two supplementary REST endpoints demonstrate the server-side patterns
              used in real GCS backends. They are independent of the client-side simulation.
            </p>
            <div className="space-y-3">
              <div className="border border-gcs-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gcs-green text-[9px] font-bold border border-gcs-green px-1">GET</span>
                  <Code>/api/telemetry</Code>
                </div>
                <p>Server-Sent Events stream. Emits a synthetic telemetry JSON payload every second.</p>
                <Block>{`data: {"id":"DRONE-001","callsign":"FALCON-1","timestamp":...}

// Connect in browser:
const es = new EventSource('/api/telemetry')
es.onmessage = (e) => console.log(JSON.parse(e.data))`}
                </Block>
              </div>
              <div className="border border-gcs-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gcs-cyan text-[9px] font-bold border border-gcs-cyan px-1">POST</span>
                  <Code>/api/commands</Code>
                </div>
                <p>Accepts a command payload, simulates processing delay, returns acknowledgement.</p>
                <Block>{`// Request
POST /api/commands
{ "type": "RTH" }

// Response
{ "id": "uuid", "status": "ACKNOWLEDGED", "latency": 82 }`}
                </Block>
              </div>
            </div>
          </Section>

          <Section id="commands" title="Command Protocol">
            <p>Four commands are supported by the simulator:</p>
            <div className="space-y-2">
              {[
                { cmd: 'RTH',            desc: 'Return To Home. Drone navigates to HOME_POSITION at cruise speed, then enters HOLD.' },
                { cmd: 'HOLD',           desc: 'Stationary hover at current GPS position.' },
                { cmd: 'GOTO <lat> <lng> [alt]', desc: 'Navigate to arbitrary coordinates. Altitude defaults to 120 m AGL.' },
                { cmd: 'EMERGENCY_LAND', desc: 'Immediate 3 m/s descent at current position. Highest priority.' },
              ].map(({ cmd, desc }) => (
                <div key={cmd} className="border border-gcs-border p-2.5 flex gap-3">
                  <Code>{cmd}</Code>
                  <span className="text-gcs-muted">{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="state" title="State Management">
            <p>
              A single Zustand store (<Code>useDroneStore</Code>) is the source of truth.
              All components subscribe to slices; the simulator writes to it via callbacks.
            </p>
            <Block>{`interface DroneStore {
  telemetry:  DroneTelemetry | null
  datalink:   DataLink | null
  commands:   Command[]           // last 50
  events:     MissionEvent[]      // last 200
  history:    TelemetrySnapshot[] // last 180 ticks (~72 s)
  isSimulating: boolean
}`}
            </Block>
            <p>
              The <Code>history</Code> ring-buffer drives the sparkline charts in the
              TelemetryPanel without any additional state.
            </p>
          </Section>

          <Section id="qa-roadmap" title="QA Roadmap (Phase 2)">
            <p>
              The application structure is designed to support the following test layers,
              to be built in Phase 2:
            </p>
            <div className="space-y-2">
              {[
                { tool: 'Playwright',       path: 'tests/e2e/',      desc: 'Full UI automation — simulate user commanding RTH, validate map update and timeline event.' },
                { tool: 'K6',               path: 'tests/load/',     desc: 'Load test the /api/telemetry SSE endpoint and /api/commands at 50 rps.' },
                { tool: 'OWASP ZAP',        path: 'tests/security/', desc: 'Weekly passive + active scan via GitHub Actions. Baseline stored in YAML.' },
                { tool: 'Lighthouse CI',    path: '.github/workflows/lighthouse.yml', desc: 'Performance budget on every PR — LCP < 2.5 s, CLS < 0.1.' },
              ].map(({ tool, path, desc }) => (
                <div key={tool} className="border border-gcs-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gcs-cyan font-bold text-[11px]">{tool}</span>
                    <span className="text-gcs-dim text-[9px] font-mono">{path}</span>
                  </div>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="running" title="Running Locally">
            <Block>{`# 1. Clone and install
git clone <repo-url>
cd mission-control-qa
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# (optional — Supabase only needed if ENABLE_TELEMETRY_PERSISTENCE=true)

# 3. Start dev server
npm run dev

# Open http://localhost:3000`}
            </Block>
            <p>
              The simulation runs entirely in-browser. Supabase credentials are
              optional for the demo — the app works fully offline.
            </p>
          </Section>
        </main>
      </div>
    </div>
  )
}
