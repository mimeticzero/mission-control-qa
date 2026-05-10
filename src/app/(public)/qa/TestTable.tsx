'use client'

import { useState } from 'react'

const C = {
  cyan:   '#00f5ff',
  green:  '#22c55e',
  pink:   '#ff2d78',
  tSec:   '#c4d0de',
  tDim:   '#64748b',
  border: 'rgba(255,255,255,0.08)',
}

const ALL_TESTS: { suite: string; scenario: string; pass: boolean }[] = [
  // Boot / Initial Load (8)
  { suite: 'Boot',     scenario: 'Page loads and renders GCS HUD within 2s performance budget',                pass: true },
  { suite: 'Boot',     scenario: 'Header displays correct system ID GCS-DEMO-01',                             pass: true },
  { suite: 'Boot',     scenario: 'System boot event appears in mission timeline on load',                     pass: true },
  { suite: 'Boot',     scenario: 'Telemetry panel shows initial values immediately after mount',              pass: true },
  { suite: 'Boot',     scenario: 'Drone selector renders all 5 drones on initial load',                      pass: true },
  { suite: 'Boot',     scenario: 'Map initializes centered on CDG coordinates',                              pass: true },
  { suite: 'Boot',     scenario: 'Datalink status shows NOMINAL on boot',                                    pass: true },
  { suite: 'Boot',     scenario: 'Command console ready to accept input without delay',                       pass: true },
  // Drone Selector (6)
  { suite: 'Selector', scenario: 'All 5 drones listed with correct IDs in selector',                         pass: true },
  { suite: 'Selector', scenario: 'Default selected drone is ALPHA-1 on boot',                                pass: true },
  { suite: 'Selector', scenario: 'Clicking a drone card updates the telemetry panel',                        pass: true },
  { suite: 'Selector', scenario: 'Selecting drone highlights its marker on the map',                         pass: true },
  { suite: 'Selector', scenario: 'Drone status badges reflect live state per drone',                         pass: true },
  { suite: 'Selector', scenario: 'Battery percentage shown per drone in selector tabs',                      pass: true },
  // Map View (10)
  { suite: 'Map',      scenario: 'Map centers on CDG coordinates on initial render',                         pass: true },
  { suite: 'Map',      scenario: 'All 5 drone markers visible on load',                                      pass: true },
  { suite: 'Map',      scenario: 'Drone markers update position every 400ms tick',                           pass: true },
  { suite: 'Map',      scenario: 'Clicking drone marker selects it in the Zustand store',                    pass: true },
  { suite: 'Map',      scenario: 'Patrol route polyline rendered for CDG 9-waypoint loop',                   pass: true },
  { suite: 'Map',      scenario: 'Drone heading indicator rotates with bearing angle',                       pass: true },
  { suite: 'Map',      scenario: 'CRITICAL drone marker pulses red',                                         pass: true },
  { suite: 'Map',      scenario: 'WARNING drone marker displayed in amber',                                  pass: true },
  { suite: 'Map',      scenario: 'NOMINAL drone marker displayed in cyan',                                   pass: true },
  { suite: 'Map',      scenario: 'Map re-renders without layout shift on viewport resize',                   pass: true },
  // Telemetry Panel (10)
  { suite: 'Telemetry', scenario: 'Altitude AGL updates in real-time on each tick',                         pass: true },
  { suite: 'Telemetry', scenario: 'Ground speed displayed in m/s and updates',                               pass: true },
  { suite: 'Telemetry', scenario: 'Heading updates with drone bearing on each tick',                         pass: true },
  { suite: 'Telemetry', scenario: 'Battery percentage decrements and updates every tick',                    pass: true },
  { suite: 'Telemetry', scenario: 'Battery below 20% triggers WARNING status state',                        pass: true },
  { suite: 'Telemetry', scenario: 'Battery below 5% triggers CRITICAL status state',                        pass: true },
  { suite: 'Telemetry', scenario: 'Signal RSSI value updates with datalink events',                          pass: true },
  { suite: 'Telemetry', scenario: 'Satellite count displayed and updates correctly',                         pass: true },
  { suite: 'Telemetry', scenario: 'HDOP value shown and updates on each tick',                               pass: true },
  { suite: 'Telemetry', scenario: 'Flight mode label reflects current mode (MISSION / HOLD / RTH)',          pass: true },
  // Datalink (8)
  { suite: 'Datalink',  scenario: 'Latency bar chart renders on load with history ticks',                    pass: true },
  { suite: 'Datalink',  scenario: 'Latency history updates every 400ms without overflow',                    pass: true },
  { suite: 'Datalink',  scenario: 'Packet loss percentage displayed and updates',                            pass: true },
  { suite: 'Datalink',  scenario: 'RSSI value shown in dBm and updates',                                    pass: true },
  { suite: 'Datalink',  scenario: 'Status NOMINAL shown in cyan',                                           pass: true },
  { suite: 'Datalink',  scenario: 'Status DEGRADED shown in amber',                                         pass: true },
  { suite: 'Datalink',  scenario: 'High latency triggers WARNING state in datalink panel',                   pass: true },
  { suite: 'Datalink',  scenario: 'Packet loss counter increments correctly on simulated drop event',        pass: true },
  // Commands (12)
  { suite: 'Commands',  scenario: 'RTH command dispatches and shows PENDING in console',                     pass: true },
  { suite: 'Commands',  scenario: 'RTH command acknowledged within simulated datalink latency',              pass: true },
  { suite: 'Commands',  scenario: 'HOLD command dispatches successfully',                                    pass: true },
  { suite: 'Commands',  scenario: 'HOLD acknowledged and flight mode label updates to HOLD',                 pass: true },
  { suite: 'Commands',  scenario: 'EMERGENCY_LAND triggers CRITICAL event in mission timeline',              pass: true },
  { suite: 'Commands',  scenario: 'EMERGENCY_LAND disables other command buttons immediately',               pass: true },
  { suite: 'Commands',  scenario: 'GOTO command accepts lat/lng payload correctly',                          pass: true },
  { suite: 'Commands',  scenario: 'Command timeout shows FAILED status after 3s without ACK',               pass: true },
  { suite: 'Commands',  scenario: 'ACK latency displayed in milliseconds in console',                        pass: true },
  { suite: 'Commands',  scenario: 'Command history scrollable in console panel',                             pass: true },
  { suite: 'Commands',  scenario: 'Failed command logged as ALERT in mission timeline',                      pass: true },
  { suite: 'Commands',  scenario: 'Command dispatch event logged immediately in timeline',                   pass: true },
  // Mission Timeline (8)
  { suite: 'Timeline',  scenario: 'Boot event logged on system start',                                      pass: true },
  { suite: 'Timeline',  scenario: 'ACK event logged with RTT in milliseconds',                              pass: true },
  { suite: 'Timeline',  scenario: 'TIMEOUT event logged as CRITICAL severity',                              pass: true },
  { suite: 'Timeline',  scenario: 'Battery warning event logged at 20% threshold',                          pass: true },
  { suite: 'Timeline',  scenario: 'EW mode activation event logged with WARNING severity',                   pass: true },
  { suite: 'Timeline',  scenario: 'Timeline is append-only, no deletion possible',                          pass: true },
  { suite: 'Timeline',  scenario: 'Severity badges colored by level: INFO / WARNING / CRITICAL',            pass: true },
  { suite: 'Timeline',  scenario: 'Timeline scrolls to latest event automatically',                          pass: true },
  // EW Mode (7)
  { suite: 'EW Mode',   scenario: 'EW toggle button activates mode and banner appears',                     pass: true },
  { suite: 'EW Mode',   scenario: 'Latency spikes to 200-800ms range when EW active',                       pass: true },
  { suite: 'EW Mode',   scenario: 'Packet loss increases to 5-10% when EW active',                         pass: true },
  { suite: 'EW Mode',   scenario: 'Deactivating EW restores nominal link conditions within 3s',             pass: true },
  { suite: 'EW Mode',   scenario: 'EW activation and deactivation events logged in timeline',               pass: true },
  { suite: 'EW Mode',   scenario: 'EW mode state persists when switching between drones',                   pass: true },
  { suite: 'EW Mode',   scenario: 'EW mode button shows pulsing red style when active',                     pass: true },
]

const PER_PAGE = 20
const TOTAL_PAGES = Math.ceil(ALL_TESTS.length / PER_PAGE)

export function TestTable() {
  const [page, setPage] = useState(0)

  const visible = ALL_TESTS.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const start   = page * PER_PAGE + 1
  const end     = Math.min((page + 1) * PER_PAGE, ALL_TESTS.length)

  return (
    <div style={{ marginTop: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '12px', letterSpacing: '2px', color: C.tDim }}>E2E TEST SCENARIOS</div>
        <div style={{ fontSize: '12px', color: C.tDim }}>
          69 scénarios uniques &times; 3 navigateurs = 207 &nbsp;·&nbsp;{' '}
          <a href="https://github.com/mimeticzero/mission-control-qa" target="_blank" rel="noopener noreferrer"
             style={{ color: C.green, textDecoration: 'none' }}>
            GitHub ↗
          </a>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '480px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,245,255,0.2)' }}>
              <th style={{ textAlign: 'left', padding: '8px 14px', letterSpacing: '2px', color: C.tDim, fontWeight: 400, whiteSpace: 'nowrap' }}>SUITE</th>
              <th style={{ textAlign: 'left', padding: '8px 14px', letterSpacing: '2px', color: C.tDim, fontWeight: 400 }}>SCENARIO</th>
              <th style={{ textAlign: 'center', padding: '8px 14px', letterSpacing: '2px', color: C.tDim, fontWeight: 400, width: '80px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ suite, scenario, pass }, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <td style={{ padding: '10px 14px', color: C.cyan, fontFamily: 'Orbitron, sans-serif', fontSize: '11px', letterSpacing: '1px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{suite}</td>
                <td style={{ padding: '10px 14px', color: C.tSec, lineHeight: 1.5, verticalAlign: 'top' }}>{scenario}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', verticalAlign: 'top' }}>
                  <span style={{ fontSize: '12px', letterSpacing: '2px', padding: '3px 8px', border: `1px solid ${pass ? C.green : C.pink}44`, color: pass ? C.green : C.pink, fontWeight: 700 }}>
                    {pass ? 'PASS' : 'FAIL'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{ padding: '6px 14px', fontSize: '12px', letterSpacing: '2px', background: 'transparent', border: `1px solid ${page === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,245,255,0.3)'}`, color: page === 0 ? C.tDim : C.cyan, cursor: page === 0 ? 'default' : 'pointer' }}
        >
          &larr; PREV
        </button>

        {Array.from({ length: TOTAL_PAGES }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            style={{ padding: '6px 12px', fontSize: '12px', letterSpacing: '2px', background: i === page ? 'rgba(0,245,255,0.1)' : 'transparent', border: `1px solid ${i === page ? C.cyan : 'rgba(255,255,255,0.08)'}`, color: i === page ? C.cyan : C.tDim, cursor: 'pointer' }}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setPage(p => Math.min(TOTAL_PAGES - 1, p + 1))}
          disabled={page === TOTAL_PAGES - 1}
          style={{ padding: '6px 14px', fontSize: '12px', letterSpacing: '2px', background: 'transparent', border: `1px solid ${page === TOTAL_PAGES - 1 ? 'rgba(255,255,255,0.08)' : 'rgba(0,245,255,0.3)'}`, color: page === TOTAL_PAGES - 1 ? C.tDim : C.cyan, cursor: page === TOTAL_PAGES - 1 ? 'default' : 'pointer' }}
        >
          NEXT &rarr;
        </button>

        <span style={{ fontSize: '12px', color: C.tDim, marginLeft: '8px' }}>
          {start}&ndash;{end} / {ALL_TESTS.length}
        </span>
      </div>
    </div>
  )
}
