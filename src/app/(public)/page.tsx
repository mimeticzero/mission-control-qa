import Link from 'next/link'

const STACK = [
  { name: 'Next.js 15',           desc: 'App Router, RSC, Server Actions',     color: 'text-gcs-cyan'   },
  { name: 'TypeScript',           desc: 'Strict mode end-to-end',               color: 'text-gcs-cyan'   },
  { name: 'Tailwind CSS',         desc: 'Utility-first, dark-theme design',     color: 'text-gcs-cyan'   },
  { name: 'Leaflet + react-leaflet', desc: 'Open-source mapping, no API key',  color: 'text-gcs-cyan'   },
  { name: 'Recharts',             desc: 'Real-time telemetry graphs',           color: 'text-gcs-cyan'   },
  { name: 'Zustand',              desc: 'Lightweight reactive state',           color: 'text-gcs-cyan'   },
  { name: 'Supabase',             desc: 'Optional persistence & auth',          color: 'text-gcs-cyan'   },
  { name: 'Tone.js',              desc: 'Audio alerts (optional)',               color: 'text-gcs-dim'    },
]

const FEATURES = [
  { id: '01', title: 'Live Drone Simulation',   desc: 'Paris CDG patrol route with interpolated GPS, telemetry noise, and battery drain. Runs entirely client-side.' },
  { id: '02', title: 'Command Dispatch',         desc: 'RTH, HOLD, EMERGENCY_LAND, GOTO. Commands traverse a simulated 50–200 ms datalink with 2 % packet-loss probability.' },
  { id: '03', title: 'Datalink Monitoring',      desc: 'Real-time latency, RSSI, packet-loss metrics with visual degradation indicators and history bar chart.' },
  { id: '04', title: 'Mission Timeline',         desc: 'Append-only event log with severity levels. Every waypoint, command, and anomaly is recorded with a timestamp.' },
  { id: '05', title: 'HUD Design Language',      desc: 'Dense monospace UI, terminal aesthetic, zero gradient decoration. Optimised for information density over visual effect.' },
  { id: '06', title: 'QA-Ready Architecture',    desc: 'Deterministic simulator core, typed command bus, isolated store — designed for E2E, load, and security testing in Phase 2.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gcs-bg text-gcs-text flex flex-col animate-flicker">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="border-b border-gcs-border px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 20 20" className="text-gcs-cyan">
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="10" cy="10" r="3"  fill="currentColor"/>
            <line x1="10" y1="2"  x2="10" y2="6"  stroke="currentColor" strokeWidth="1.5"/>
            <line x1="10" y1="14" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="2"  y1="10" x2="6"  y2="10" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="14" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span className="text-gcs-cyan text-xs font-bold tracking-[0.2em] uppercase">
            Mission Control QA
          </span>
        </div>
        <div className="flex gap-4 text-[10px] tracking-widest">
          <Link href="/demo" className="text-gcs-muted hover:text-gcs-cyan transition-colors">DEMO</Link>
          <Link href="/docs" className="text-gcs-muted hover:text-gcs-cyan transition-colors">DOCS</Link>
          <a
            href="https://github.com"
            className="text-gcs-muted hover:text-gcs-cyan transition-colors"
            target="_blank" rel="noopener noreferrer"
          >
            GITHUB
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-b border-gcs-border px-6 py-16 max-w-4xl mx-auto w-full">
        {/* Warning banner */}
        <div className="border border-gcs-yellow/40 bg-gcs-yellow/5 px-3 py-2 mb-10 flex items-start gap-2">
          <span className="text-gcs-yellow text-[9px] font-bold tracking-widest flex-shrink-0 mt-px">
            NOTICE
          </span>
          <p className="text-gcs-yellow text-[10px] leading-relaxed tracking-wide">
            Educational / portfolio project. Simulates patterns applicable to real Ground Control Systems.
            Not used in production defense contexts. All data is synthetic.
          </p>
        </div>

        <div className="text-gcs-dim text-[10px] tracking-[0.3em] uppercase mb-3">
          Ground Control Station · Quality Engineering Demo
        </div>

        <h1 className="text-3xl font-bold text-gcs-cyan leading-tight mb-4 tracking-tight">
          Mission Control<br />
          <span className="text-gcs-text">QA Stack</span>
        </h1>

        <p className="text-sm text-gcs-muted leading-relaxed max-w-xl mb-8">
          A fully simulated drone ground station built to demonstrate quality engineering
          patterns for critical, real-time systems — telemetry ingestion, command dispatch,
          datalink monitoring, and the test infrastructure that validates all of it.
        </p>

        <div className="flex gap-3 items-center">
          <Link
            href="/demo"
            className="
              inline-flex items-center gap-2 px-5 py-2.5
              bg-gcs-cyan/10 border border-gcs-cyan text-gcs-cyan
              text-[11px] font-bold tracking-widest uppercase
              hover:bg-gcs-cyan/20 transition-colors
            "
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gcs-cyan animate-pulse" />
            LAUNCH DEMO
          </Link>
          <Link
            href="/docs"
            className="
              inline-flex items-center px-5 py-2.5
              border border-gcs-border text-gcs-muted
              text-[11px] font-bold tracking-widest uppercase
              hover:border-gcs-cyan hover:text-gcs-cyan transition-colors
            "
          >
            READ DOCS
          </Link>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-gcs-border px-6 py-12 max-w-4xl mx-auto w-full">
        <div className="text-[9px] tracking-[0.3em] uppercase text-gcs-dim mb-6">
          System Capabilities
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gcs-border border border-gcs-border">
          {FEATURES.map((f) => (
            <div key={f.id} className="bg-gcs-panel p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-baseline gap-3 mb-1.5">
                <span className="text-gcs-dim text-[9px] tracking-widest">{f.id}</span>
                <span className="text-gcs-cyan text-[11px] font-bold tracking-wider">{f.title}</span>
              </div>
              <p className="text-gcs-muted text-[11px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stack ────────────────────────────────────────────────────────────── */}
      <section className="border-b border-gcs-border px-6 py-12 max-w-4xl mx-auto w-full">
        <div className="text-[9px] tracking-[0.3em] uppercase text-gcs-dim mb-6">
          Technology Stack
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gcs-border border border-gcs-border">
          {STACK.map((s) => (
            <div key={s.name} className="bg-gcs-panel p-3">
              <div className={`text-[11px] font-bold tracking-wider mb-0.5 ${s.color}`}>
                {s.name}
              </div>
              <div className="text-gcs-dim text-[10px]">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QA roadmap teaser ────────────────────────────────────────────────── */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full">
        <div className="text-[9px] tracking-[0.3em] uppercase text-gcs-dim mb-4">
          QA Phase — Coming Next
        </div>
        <div className="grid grid-cols-3 gap-px bg-gcs-border border border-gcs-border text-[10px]">
          {[
            { label: 'E2E Tests',    tool: 'Playwright', status: 'PLANNED' },
            { label: 'Load Tests',   tool: 'K6',         status: 'PLANNED' },
            { label: 'Sec Scan',     tool: 'OWASP ZAP',  status: 'PLANNED' },
          ].map((item) => (
            <div key={item.label} className="bg-gcs-panel p-3 flex items-center justify-between">
              <div>
                <div className="text-gcs-cyan font-bold tracking-wider">{item.label}</div>
                <div className="text-gcs-dim">{item.tool}</div>
              </div>
              <span className="border border-gcs-border text-gcs-dim text-[9px] tracking-widest px-1.5 py-0.5">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gcs-border px-6 py-4 mt-auto flex items-center justify-between text-[9px] text-gcs-dim tracking-widest">
        <span>MISSION CONTROL QA STACK — EDUCATIONAL PROJECT</span>
        <span>NEXT.JS 15 · TYPESCRIPT · TAILWIND</span>
      </footer>
    </div>
  )
}
