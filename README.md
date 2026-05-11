# Mission Control QA Stack
## Quality Engineering Patterns for Critical Systems

> **NOTICE — Educational / portfolio project.**
> Simulates patterns applicable to real Ground Control Station (GCS) systems.
> **Not used in production defense contexts.** All data is synthetic.
> No real drones, real operators, or live airspace are involved.

<!-- GIF placeholder — record a 10-12s screen capture of the /demo page and convert with:
     ffmpeg -i demo-capture.mp4 -vf "fps=15,scale=1280:-1:flags=lanczos,palettegen" palette.png
     ffmpeg -i demo-capture.mp4 -i palette.png -vf "fps=15,scale=1280:-1:flags=lanczos,paletteuse" demo.gif
     Keep under 5 MB (reduce fps or scale if needed). Place file as docs/demo.gif.
-->
<!-- ![Mission Control GCS demo, 5-drone fleet, EW mode, C2 timeline](docs/demo.gif) -->

[![CI](https://github.com/mimeticzero/mission-control-qa/actions/workflows/ci.yml/badge.svg)](https://github.com/mimeticzero/mission-control-qa/actions/workflows/ci.yml)
[![Security Scan](https://github.com/mimeticzero/mission-control-qa/actions/workflows/security.yml/badge.svg)](https://github.com/mimeticzero/mission-control-qa/actions/workflows/security.yml) [![ZAP Report](https://img.shields.io/badge/OWASP%20ZAP-0%20High%20%C2%B7%204%20Medium-brightgreen)](https://sakuranode.com/reports/mission-control-zap.html)

---

## What this is

A fully simulated drone Ground Control Station built to demonstrate **quality engineering patterns for real-time, safety-critical systems**. The kind of system where a missed telemetry packet, a dropped command, or a UI freeze is not just a bug: it's a mission failure.

This project is the answer to the question: *"How do you test a system that ingests continuous telemetry, dispatches commands over a lossy datalink, renders a live map, and must never lose state?"*

The simulation runs in the browser: one drone, one patrol route around Paris CDG, a realistic command bus with simulated 50-200 ms latency and 2 % packet loss, and a HUD designed for information density, not decoration.

---

## Why it exists

Real GCS systems are closed, classified, or simply not testable from outside. But the **engineering patterns** they require are teachable:

- Deterministic simulation cores that can be exercised without hardware
- Typed command buses that fail loudly at compile time, not runtime
- State management designed for replay and assertion
- Test infrastructure that validates the *system*, not just the code

This is a portfolio artefact that demonstrates those patterns concretely.

---

## The Stack

| Layer       | Technology              | Why                                             |
|-------------|-------------------------|-------------------------------------------------|
| Framework   | Next.js 15 App Router   | RSC + client components, right tool per layer   |
| Language    | TypeScript (strict)     | Command types caught at compile time            |
| Styling     | Tailwind CSS v3         | Utility-first, dark HUD design in minutes       |
| Map         | Leaflet + react-leaflet | Open-source, no API key, full control           |
| Charts      | Recharts                | Composable, performant for real-time telemetry  |
| State       | Zustand                 | Minimal, reactive, testable store               |
| Persistence | Supabase (optional)     | Telemetry logging for post-mission analysis     |
| Audio       | Tone.js (optional)      | Audio alerts for critical events                |

---

## The QA Approach (Phase 2)

```
tests/
  e2e/          Playwright, UI automation
  load/         K6, telemetry + command endpoint stress tests
  security/     OWASP ZAP baseline configuration

.github/workflows/
  ci.yml              Type-check + lint + build on every PR
  security-scan.yml   Weekly ZAP passive + active scan
  lighthouse.yml      Performance budget on every PR
```

### E2E scenarios (Playwright)

97 scenarios × 3 browsers (Chromium, Firefox, WebKit) on Ubuntu = **291 tests**.

- User dispatches `RTH`: drone heading changes on map within 2 s
- User dispatches `EMERGENCY_LAND`: `CRITICAL` event appears in timeline
- Battery drops below 15 %: status badge turns red, alert logged
- Datalink latency spike: latency bar chart updates, no UI freeze
- Command `TIMEOUT`: console shows error, command status shows `FAILED`

#### Multi-profile matrix (28 new scenarios)

The framework supports four operational profiles switchable at runtime via a dropdown or `?profile=` URL param:

| Profile   | Fleet callsigns                                       | Area               | Extra metrics        |
|-----------|-------------------------------------------------------|--------------------|----------------------|
| `aerial`  | FALCON-1 · VIPER-2 · HAWK-3 · GHOST-4 · RAVEN-5      | Paris CDG, zoom 12 | ALT AGL, GND SPD     |
| `ground`  | SCOUT-1 · GUARDIAN-2 · SENTINEL-3 · RANGER-4 · NOMAD-5 | Satory/Versailles, zoom 14 | SPD OVR GND, FUEL, TIRE PSI |
| `maritime`| POSEIDON-1 · KRAKEN-2 · NEPTUNE-3 · TRITON-4 · NEREIDE-5 | Brest, zoom 12  | DEPTH, WAVE HT, CURRENT |
| `ugv`     | MULE-1 · WOLF-2 · BEAR-3 · FOX-4 · LYNX-5            | Mourmelon, zoom 15 | ARMOR, CLRNCE, PAYLOAD |

Profile switching resets the fleet, updates all telemetry labels, remounts the map at the new area centre, deactivates EW mode, and logs a `SYSTEM` event to the mission timeline. Architecture is unchanged — a single `mission-profiles.ts` registry drives all profile-aware components via the `activeProfile` Zustand key.

### Load scenarios (K6)

- 50 concurrent SSE subscribers to `/api/telemetry` for 5 minutes
- 200 rps burst to `POST /api/commands`, validate p99 < 500 ms
- Memory profile under sustained load, validate no leak in store ring-buffer

### Security (OWASP ZAP)

- Weekly automated baseline scan
- Active scan on staging before any production deploy
- CSP, HSTS, and X-Content-Type-Options headers audited

---

## How to Run

```bash
# Install (note: --legacy-peer-deps if react-leaflet reports peer conflict)
npm install

# Configure (Supabase is optional, app works offline)
cp .env.example .env.local

# Dev server (Turbopack)
npm run dev

# Type-check
npm run type-check

# Production build
npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000) for the landing page.
Open [http://localhost:3000/demo](http://localhost:3000/demo) for the live GCS.

---

## Project Structure

```
src/
  app/
    (public)/
      page.tsx              Landing page
      demo/page.tsx         GCS demo, full HUD
      docs/page.tsx         Technical documentation
    api/
      telemetry/route.ts    GET, SSE telemetry stream
      commands/route.ts     POST, command handler
  components/
    gcs/
      MapView.tsx               Leaflet map, profile-aware vehicle icons
      TelemetryPanel.tsx        Profile-specific metrics + sparklines
      DatalinkStatus.tsx        Latency, packet-loss, RSSI
      CommandConsole.tsx        Terminal, RTH / HOLD / GOTO / EMRG
      MissionTimeline.tsx       Append-only event log
      DroneSelector.tsx         Fleet tab strip, profile-aware callsigns
      MissionProfileSelector.tsx Dropdown — aerial/ground/maritime/ugv
    ui/
      Badge.tsx                 Status badge (nominal/warning/critical)
      StatusIndicator.tsx       Dot + label indicator
  lib/
    types.ts                All TypeScript types + MissionProfile + ProfileData
    mission-profiles.ts     Central registry: fleet configs, map centres, labels
    drone-simulator.ts      Client-side simulation engine (profile-aware)
    fleet-simulator.ts      Multi-vehicle orchestrator (config-injected)
    script-engine.ts        Scripted drama events (config-injected)
  store/
    use-drone-store.ts      Zustand store — activeProfile, resetFleet

tests/
  e2e/                      Playwright (Phase 2)
  load/                     K6 (Phase 2)
  security/                 OWASP ZAP config

.github/workflows/
  ci.yml
  security-scan.yml
  lighthouse.yml
```

---

## Simulation Parameters

| Parameter        | Value                           |
|------------------|---------------------------------|
| Patrol route     | Paris CDG, 9 waypoints, 8 km loop |
| Ground speed     | 10 m/s nominal                  |
| Tick rate        | 400 ms                          |
| Battery drain    | ~30 min endurance               |
| Datalink latency | 55-200 ms (with spikes)         |
| Packet loss      | 2 % probability                 |
| Command timeout  | 3 s                             |

---

## Live Demo

[https://sakuranode.com/mission-control/demo](https://sakuranode.com/mission-control/demo)

---

*Built as a quality engineering portfolio piece. The patterns here (deterministic simulation, typed command buses, layered test infrastructure) apply wherever reliability matters.*
