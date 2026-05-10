/**
 * Fleet configuration — 5 drones patrolling Paris CDG Airport.
 *
 * Each drone has:
 *  - A unique ID and callsign
 *  - A distinct color for map rendering
 *  - A starting battery level (%) so drones begin in varied states
 *  - Its own patrol route so aircraft spread across the airport area
 *  - Its own home position (return-to-home waypoint)
 */

import type { Waypoint, DronePosition } from './types'

export interface DroneSimConfig {
  id:           string
  callsign:     string
  color:        string        // hex color for map + selector UI
  startBattery: number        // 0-100
  startWpIndex: number        // which waypoint to start at
  patrolRoute:  Waypoint[]
  home:         DronePosition
  missionName:  string
}

// ─── CDG Airport reference ───────────────────────────────────────────────────
// Center: 49.009°N, 2.548°E
// ~111 km/degree lat, ~72.6 km/degree lng at this latitude

// ─── Patrol routes ───────────────────────────────────────────────────────────

/** DR-001 FALCON-1 — North perimeter loop (primary patrol) */
const routeA: Waypoint[] = [
  { lat: 49.0097, lng: 2.5479, altitude: 120, name: 'HOME'      },
  { lat: 49.0195, lng: 2.5610, altitude: 130, name: 'ALPHA'     },
  { lat: 49.0345, lng: 2.5755, altitude: 140, name: 'BRAVO'     },
  { lat: 49.0455, lng: 2.5620, altitude: 135, name: 'CHARLIE'   },
  { lat: 49.0440, lng: 2.5310, altitude: 145, name: 'DELTA'     },
  { lat: 49.0315, lng: 2.5105, altitude: 130, name: 'ECHO'      },
  { lat: 49.0155, lng: 2.5055, altitude: 120, name: 'FOXTROT'   },
  { lat: 49.0025, lng: 2.5255, altitude: 125, name: 'GOLF'      },
  { lat: 49.0005, lng: 2.5510, altitude: 118, name: 'HOTEL'     },
]

/** DR-002 VIPER-2 — East terminal corridor */
const routeB: Waypoint[] = [
  { lat: 49.0085, lng: 2.5750, altitude: 115, name: 'T2-NORTH'  },
  { lat: 49.0130, lng: 2.5860, altitude: 120, name: 'T2-EAST'   },
  { lat: 49.0090, lng: 2.5960, altitude: 118, name: 'E-PERIMETER'},
  { lat: 49.0020, lng: 2.5890, altitude: 112, name: 'T2-SOUTH'  },
  { lat: 48.9990, lng: 2.5760, altitude: 110, name: 'CARGO-E'   },
  { lat: 49.0040, lng: 2.5670, altitude: 115, name: 'T2-WEST'   },
]

/** DR-003 HAWK-3 — Inner security ring */
const routeC: Waypoint[] = [
  { lat: 49.0058, lng: 2.5540, altitude: 100, name: 'IS-NORTH'  },
  { lat: 49.0108, lng: 2.5625, altitude: 105, name: 'IS-NE'     },
  { lat: 49.0128, lng: 2.5460, altitude: 108, name: 'IS-NW'     },
  { lat: 49.0085, lng: 2.5340, altitude: 100, name: 'IS-WEST'   },
  { lat: 49.0025, lng: 2.5360, altitude: 102, name: 'IS-SW'     },
  { lat: 49.0010, lng: 2.5490, altitude: 100, name: 'IS-SOUTH'  },
]

/** DR-004 GHOST-4 — South cargo zone */
const routeD: Waypoint[] = [
  { lat: 48.9990, lng: 2.5220, altitude: 108, name: 'CARGO-NW'  },
  { lat: 48.9955, lng: 2.5340, altitude: 110, name: 'CARGO-N'   },
  { lat: 48.9930, lng: 2.5510, altitude: 115, name: 'CARGO-NE'  },
  { lat: 48.9945, lng: 2.5660, altitude: 112, name: 'CARGO-E'   },
  { lat: 48.9985, lng: 2.5590, altitude: 108, name: 'CARGO-SE'  },
  { lat: 49.0010, lng: 2.5400, altitude: 105, name: 'CARGO-S'   },
]

/** DR-005 RAVEN-5 — West approach corridor */
const routeE: Waypoint[] = [
  { lat: 49.0050, lng: 2.5040, altitude: 125, name: 'WEST-1'    },
  { lat: 49.0135, lng: 2.5100, altitude: 128, name: 'WEST-2'    },
  { lat: 49.0195, lng: 2.5005, altitude: 132, name: 'WEST-3'    },
  { lat: 49.0175, lng: 2.4875, altitude: 130, name: 'W-APEX'    },
  { lat: 49.0080, lng: 2.4820, altitude: 125, name: 'WEST-4'    },
  { lat: 49.0010, lng: 2.4940, altitude: 120, name: 'WEST-5'    },
]

// ─── Fleet ───────────────────────────────────────────────────────────────────

export const FLEET_CONFIG: DroneSimConfig[] = [
  {
    id:           'DR-001',
    callsign:     'FALCON-1',
    color:        '#06b6d4',   // cyan (matches existing design)
    startBattery: 100,
    startWpIndex: 0,
    patrolRoute:  routeA,
    home:         { lat: 49.0097, lng: 2.5479, altitude: 120 },
    missionName:  'North Perimeter Patrol',
  },
  {
    id:           'DR-002',
    callsign:     'VIPER-2',
    color:        '#22c55e',   // green
    startBattery: 87,
    startWpIndex: 2,
    patrolRoute:  routeB,
    home:         { lat: 49.0085, lng: 2.5750, altitude: 115 },
    missionName:  'East Terminal Surveillance',
  },
  {
    id:           'DR-003',
    callsign:     'HAWK-3',
    color:        '#fbbf24',   // amber/yellow
    startBattery: 74,
    startWpIndex: 1,
    patrolRoute:  routeC,
    home:         { lat: 49.0058, lng: 2.5540, altitude: 100 },
    missionName:  'Inner Security Ring',
  },
  {
    id:           'DR-004',
    callsign:     'GHOST-4',
    color:        '#f97316',   // orange
    startBattery: 62,
    startWpIndex: 3,
    patrolRoute:  routeD,
    home:         { lat: 48.9990, lng: 2.5220, altitude: 108 },
    missionName:  'South Cargo Zone',
  },
  {
    id:           'DR-005',
    callsign:     'RAVEN-5',
    color:        '#a855f7',   // purple
    startBattery: 55,
    startWpIndex: 0,
    patrolRoute:  routeE,
    home:         { lat: 49.0050, lng: 2.5040, altitude: 125 },
    missionName:  'West Approach Corridor',
  },
]

/** Default selected drone ID (backward-compat with existing tests). */
export const DEFAULT_DRONE_ID = 'DR-001'
