/**
 * Mission Profiles — 4 operational contexts that run on the same GCS framework.
 *
 * Each profile defines:
 *   - Fleet configuration (5 vehicles, distinct routes)
 *   - Map center / zoom for the operational area
 *   - UI metadata (labels, emoji, datalink label)
 *
 * The simulation engine (DroneSim / FleetSimulator) is reused unchanged;
 * only the configuration parameters change per profile. This demonstrates
 * that the same QA framework is transposable across vehicle domains.
 */

import type { MissionProfile } from './types'
import type { DroneSimConfig } from './fleet-config'
import type { Waypoint, DronePosition } from './types'

// ─── Profile metadata (UI) ─────────────────────────────────────────────────

export interface ProfileMeta {
  id:                   MissionProfile
  label:                string
  emoji:                string
  description:          string
  /** Leaflet map initial center [lat, lng] */
  mapCenter:            [number, number]
  mapZoom:              number
  datalinkLabel:        string
  /** Label for the primary speed metric in TelemetryPanel */
  speedLabel:           string
  /** Unit for speed display */
  speedUnit:            string
  /** Multiplier applied to m/s speed for display */
  speedMultiplier:      number
  /** Label for the primary altitude/depth/clearance metric */
  altLabel:             string
  altUnit:              string
  /** Label for the battery/fuel metric */
  energyLabel:          string
  /** Fleet configs for this profile */
  fleet:                DroneSimConfig[]
  missionStartMessage:  string
}

// ═══════════════════════════════════════════════════════════════════════════
// AERIAL — Paris CDG airport perimeter (existing mode, unchanged)
// ═══════════════════════════════════════════════════════════════════════════

const aerialRouteA: Waypoint[] = [
  { lat: 49.0097, lng: 2.5479, altitude: 120, name: 'HOME'    },
  { lat: 49.0195, lng: 2.5610, altitude: 130, name: 'ALPHA'   },
  { lat: 49.0345, lng: 2.5755, altitude: 140, name: 'BRAVO'   },
  { lat: 49.0455, lng: 2.5620, altitude: 135, name: 'CHARLIE' },
  { lat: 49.0440, lng: 2.5310, altitude: 145, name: 'DELTA'   },
  { lat: 49.0315, lng: 2.5105, altitude: 130, name: 'ECHO'    },
  { lat: 49.0155, lng: 2.5055, altitude: 120, name: 'FOXTROT' },
  { lat: 49.0025, lng: 2.5255, altitude: 125, name: 'GOLF'    },
  { lat: 49.0005, lng: 2.5510, altitude: 118, name: 'HOTEL'   },
]
const aerialRouteB: Waypoint[] = [
  { lat: 49.0085, lng: 2.5750, altitude: 115, name: 'T2-NORTH'   },
  { lat: 49.0130, lng: 2.5860, altitude: 120, name: 'T2-EAST'    },
  { lat: 49.0090, lng: 2.5960, altitude: 118, name: 'E-PERIMETER'},
  { lat: 49.0020, lng: 2.5890, altitude: 112, name: 'T2-SOUTH'   },
  { lat: 48.9990, lng: 2.5760, altitude: 110, name: 'CARGO-E'    },
  { lat: 49.0040, lng: 2.5670, altitude: 115, name: 'T2-WEST'    },
]
const aerialRouteC: Waypoint[] = [
  { lat: 49.0058, lng: 2.5540, altitude: 100, name: 'IS-NORTH' },
  { lat: 49.0108, lng: 2.5625, altitude: 105, name: 'IS-NE'    },
  { lat: 49.0128, lng: 2.5460, altitude: 108, name: 'IS-NW'    },
  { lat: 49.0085, lng: 2.5340, altitude: 100, name: 'IS-WEST'  },
  { lat: 49.0025, lng: 2.5360, altitude: 102, name: 'IS-SW'    },
  { lat: 49.0010, lng: 2.5490, altitude: 100, name: 'IS-SOUTH' },
]
const aerialRouteD: Waypoint[] = [
  { lat: 48.9990, lng: 2.5220, altitude: 108, name: 'CARGO-NW' },
  { lat: 48.9955, lng: 2.5340, altitude: 110, name: 'CARGO-N'  },
  { lat: 48.9930, lng: 2.5510, altitude: 115, name: 'CARGO-NE' },
  { lat: 48.9945, lng: 2.5660, altitude: 112, name: 'CARGO-E'  },
  { lat: 48.9985, lng: 2.5590, altitude: 108, name: 'CARGO-SE' },
  { lat: 49.0010, lng: 2.5400, altitude: 105, name: 'CARGO-S'  },
]
const aerialRouteE: Waypoint[] = [
  { lat: 49.0050, lng: 2.5040, altitude: 125, name: 'WEST-1' },
  { lat: 49.0135, lng: 2.5100, altitude: 128, name: 'WEST-2' },
  { lat: 49.0195, lng: 2.5005, altitude: 132, name: 'WEST-3' },
  { lat: 49.0175, lng: 2.4875, altitude: 130, name: 'W-APEX' },
  { lat: 49.0080, lng: 2.4820, altitude: 125, name: 'WEST-4' },
  { lat: 49.0010, lng: 2.4940, altitude: 120, name: 'WEST-5' },
]

const AERIAL_FLEET: DroneSimConfig[] = [
  { id: 'DR-001', callsign: 'FALCON-1', color: '#06b6d4', startBattery: 100, startWpIndex: 0, patrolRoute: aerialRouteA, home: { lat: 49.0097, lng: 2.5479, altitude: 120 }, missionName: 'North Perimeter Patrol' },
  { id: 'DR-002', callsign: 'VIPER-2',  color: '#22c55e', startBattery: 87,  startWpIndex: 2, patrolRoute: aerialRouteB, home: { lat: 49.0085, lng: 2.5750, altitude: 115 }, missionName: 'East Terminal Surveillance' },
  { id: 'DR-003', callsign: 'HAWK-3',   color: '#fbbf24', startBattery: 74,  startWpIndex: 1, patrolRoute: aerialRouteC, home: { lat: 49.0058, lng: 2.5540, altitude: 100 }, missionName: 'Inner Security Ring' },
  { id: 'DR-004', callsign: 'GHOST-4',  color: '#f97316', startBattery: 62,  startWpIndex: 3, patrolRoute: aerialRouteD, home: { lat: 48.9990, lng: 2.5220, altitude: 108 }, missionName: 'South Cargo Zone' },
  { id: 'DR-005', callsign: 'RAVEN-5',  color: '#a855f7', startBattery: 55,  startWpIndex: 0, patrolRoute: aerialRouteE, home: { lat: 49.0050, lng: 2.5040, altitude: 125 }, missionName: 'West Approach Corridor' },
]

// ═══════════════════════════════════════════════════════════════════════════
// GROUND — Camp de Satory convoy patrol (Versailles military zone)
// Center: 48.795°N, 2.097°E
// 5 ground vehicles at 0–25 m/s along road-following waypoints
// ═══════════════════════════════════════════════════════════════════════════

const alt0: number = 2   // ground vehicle height AGL ~2 m

const gndRouteA: Waypoint[] = [
  { lat: 48.7950, lng: 2.0960, altitude: alt0, name: 'HQ'       },
  { lat: 48.7985, lng: 2.1035, altitude: alt0, name: 'CP-ALPHA' },
  { lat: 48.8045, lng: 2.1100, altitude: alt0, name: 'NORTH-1'  },
  { lat: 48.8020, lng: 2.1185, altitude: alt0, name: 'EAST-1'   },
  { lat: 48.7945, lng: 2.1200, altitude: alt0, name: 'SE-1'     },
  { lat: 48.7875, lng: 2.1115, altitude: alt0, name: 'SOUTH-1'  },
  { lat: 48.7855, lng: 2.1010, altitude: alt0, name: 'SW-1'     },
  { lat: 48.7900, lng: 2.0945, altitude: alt0, name: 'WEST-1'   },
]
const gndRouteB: Waypoint[] = [
  { lat: 48.7960, lng: 2.0820, altitude: alt0, name: 'STAGING-W' },
  { lat: 48.7960, lng: 2.0930, altitude: alt0, name: 'WP-A'      },
  { lat: 48.7945, lng: 2.1045, altitude: alt0, name: 'WP-B'      },
  { lat: 48.7935, lng: 2.1150, altitude: alt0, name: 'WP-C'      },
  { lat: 48.7975, lng: 2.1240, altitude: alt0, name: 'STAGING-E' },
]
const gndRouteC: Waypoint[] = [
  { lat: 48.7870, lng: 2.0900, altitude: alt0, name: 'SW-FLANK' },
  { lat: 48.7860, lng: 2.1000, altitude: alt0, name: 'S-1'      },
  { lat: 48.7855, lng: 2.1120, altitude: alt0, name: 'S-2'      },
  { lat: 48.7875, lng: 2.1230, altitude: alt0, name: 'SE-FLANK' },
  { lat: 48.7920, lng: 2.1250, altitude: alt0, name: 'E-HOLD'   },
  { lat: 48.7940, lng: 2.1170, altitude: alt0, name: 'MID-E'    },
]
const gndRouteD: Waypoint[] = [
  { lat: 48.8050, lng: 2.0920, altitude: alt0, name: 'NW-POST'  },
  { lat: 48.8080, lng: 2.1020, altitude: alt0, name: 'N-1'      },
  { lat: 48.8075, lng: 2.1130, altitude: alt0, name: 'N-2'      },
  { lat: 48.8055, lng: 2.1230, altitude: alt0, name: 'NE-POST'  },
  { lat: 48.8010, lng: 2.1200, altitude: alt0, name: 'E-WATCH'  },
  { lat: 48.8005, lng: 2.1080, altitude: alt0, name: 'MID'      },
]
const gndRouteE: Waypoint[] = [
  { lat: 48.7955, lng: 2.0875, altitude: alt0, name: 'BASE'  },
  { lat: 48.8010, lng: 2.0960, altitude: alt0, name: 'MID-N' },
  { lat: 48.8040, lng: 2.1060, altitude: alt0, name: 'NE'    },
  { lat: 48.8025, lng: 2.1175, altitude: alt0, name: 'NE-2'  },
  { lat: 48.7975, lng: 2.1225, altitude: alt0, name: 'E'     },
  { lat: 48.7925, lng: 2.1150, altitude: alt0, name: 'SE'    },
  { lat: 48.7900, lng: 2.1050, altitude: alt0, name: 'S'     },
  { lat: 48.7920, lng: 2.0960, altitude: alt0, name: 'SW'    },
]

function gndHome(lat: number, lng: number): DronePosition {
  return { lat, lng, altitude: alt0 }
}

const GROUND_FLEET: DroneSimConfig[] = [
  { id: 'GV-001', callsign: 'SCOUT-1',    color: '#06b6d4', startBattery: 95,  startWpIndex: 0, patrolRoute: gndRouteA, home: gndHome(48.7950, 2.0960), missionName: 'Perimeter Recon Loop',    nominalSpeedMs: 12,  batteryDrainRate: 0.015 },
  { id: 'GV-002', callsign: 'GUARDIAN-2', color: '#22c55e', startBattery: 88,  startWpIndex: 1, patrolRoute: gndRouteB, home: gndHome(48.7960, 2.0820), missionName: 'Main Supply Route Escort', nominalSpeedMs: 14,  batteryDrainRate: 0.015 },
  { id: 'GV-003', callsign: 'SENTINEL-3', color: '#fbbf24', startBattery: 76,  startWpIndex: 2, patrolRoute: gndRouteC, home: gndHome(48.7870, 2.0900), missionName: 'Southern Flank Security',  nominalSpeedMs: 10,  batteryDrainRate: 0.015 },
  { id: 'GV-004', callsign: 'RANGER-4',   color: '#f97316', startBattery: 65,  startWpIndex: 3, patrolRoute: gndRouteD, home: gndHome(48.8050, 2.0920), missionName: 'Northern Observation Post', nominalSpeedMs: 13,  batteryDrainRate: 0.015 },
  { id: 'GV-005', callsign: 'NOMAD-5',    color: '#a855f7', startBattery: 82,  startWpIndex: 0, patrolRoute: gndRouteE, home: gndHome(48.7955, 2.0875), missionName: 'Link Route Patrol',         nominalSpeedMs: 11,  batteryDrainRate: 0.015 },
]

// ═══════════════════════════════════════════════════════════════════════════
// MARITIME — Rade de Brest patrol (French Navy operational area)
// Center: 48.345°N, -4.485°E
// Surface patrol vessels at 1–10 knots (0.5–5 m/s)
// ═══════════════════════════════════════════════════════════════════════════

const sea0: number = 0   // surface altitude

const marRouteA: Waypoint[] = [
  { lat: 48.3450, lng: -4.4850, altitude: sea0, name: 'BRAVO-ANCHORAGE' },
  { lat: 48.3600, lng: -4.4600, altitude: sea0, name: 'NORTH-CHANNEL'   },
  { lat: 48.3750, lng: -4.4400, altitude: sea0, name: 'NE-PATROL'       },
  { lat: 48.3700, lng: -4.4100, altitude: sea0, name: 'EAST-LIMIT'      },
  { lat: 48.3550, lng: -4.4050, altitude: sea0, name: 'SE-PATROL'       },
  { lat: 48.3350, lng: -4.4200, altitude: sea0, name: 'SOUTH-CHANNEL'   },
  { lat: 48.3200, lng: -4.4550, altitude: sea0, name: 'SW-APPROACH'     },
  { lat: 48.3300, lng: -4.4900, altitude: sea0, name: 'WEST-PATROL'     },
]
const marRouteB: Waypoint[] = [
  { lat: 48.3500, lng: -4.4750, altitude: sea0, name: 'INNER-1' },
  { lat: 48.3580, lng: -4.4640, altitude: sea0, name: 'INNER-2' },
  { lat: 48.3620, lng: -4.4480, altitude: sea0, name: 'INNER-3' },
  { lat: 48.3560, lng: -4.4350, altitude: sea0, name: 'INNER-4' },
  { lat: 48.3440, lng: -4.4380, altitude: sea0, name: 'INNER-5' },
  { lat: 48.3380, lng: -4.4560, altitude: sea0, name: 'INNER-6' },
]
const marRouteC: Waypoint[] = [
  { lat: 48.3680, lng: -4.5000, altitude: sea0, name: 'N-1' },
  { lat: 48.3800, lng: -4.4750, altitude: sea0, name: 'N-2' },
  { lat: 48.3820, lng: -4.4450, altitude: sea0, name: 'N-3' },
  { lat: 48.3760, lng: -4.4200, altitude: sea0, name: 'N-4' },
  { lat: 48.3640, lng: -4.4150, altitude: sea0, name: 'N-5' },
  { lat: 48.3560, lng: -4.4350, altitude: sea0, name: 'N-6' },
]
const marRouteD: Waypoint[] = [
  { lat: 48.3280, lng: -4.4650, altitude: sea0, name: 'S-1' },
  { lat: 48.3250, lng: -4.4400, altitude: sea0, name: 'S-2' },
  { lat: 48.3290, lng: -4.4180, altitude: sea0, name: 'S-3' },
  { lat: 48.3380, lng: -4.4100, altitude: sea0, name: 'S-4' },
  { lat: 48.3450, lng: -4.4200, altitude: sea0, name: 'S-5' },
  { lat: 48.3420, lng: -4.4450, altitude: sea0, name: 'S-6' },
]
const marRouteE: Waypoint[] = [
  { lat: 48.3350, lng: -4.5200, altitude: sea0, name: 'W-1' },
  { lat: 48.3450, lng: -4.5100, altitude: sea0, name: 'W-2' },
  { lat: 48.3550, lng: -4.5050, altitude: sea0, name: 'W-3' },
  { lat: 48.3650, lng: -4.5150, altitude: sea0, name: 'W-4' },
  { lat: 48.3700, lng: -4.5350, altitude: sea0, name: 'W-5' },
  { lat: 48.3580, lng: -4.5400, altitude: sea0, name: 'W-6' },
  { lat: 48.3430, lng: -4.5380, altitude: sea0, name: 'W-7' },
]

function marHome(lat: number, lng: number): DronePosition {
  return { lat, lng, altitude: sea0 }
}

const MARITIME_FLEET: DroneSimConfig[] = [
  { id: 'MV-001', callsign: 'POSEIDON-1', color: '#06b6d4', startBattery: 100, startWpIndex: 0, patrolRoute: marRouteA, home: marHome(48.3450, -4.4850), missionName: 'Outer Rade Patrol',    nominalSpeedMs: 3.5, batteryDrainRate: 0.008 },
  { id: 'MV-002', callsign: 'KRAKEN-2',   color: '#22c55e', startBattery: 91,  startWpIndex: 2, patrolRoute: marRouteB, home: marHome(48.3500, -4.4750), missionName: 'Inner Harbour Watch',  nominalSpeedMs: 2.5, batteryDrainRate: 0.008 },
  { id: 'MV-003', callsign: 'NEPTUNE-3',  color: '#fbbf24', startBattery: 78,  startWpIndex: 1, patrolRoute: marRouteC, home: marHome(48.3680, -4.5000), missionName: 'Northern Approach',    nominalSpeedMs: 4.0, batteryDrainRate: 0.008 },
  { id: 'MV-004', callsign: 'TRITON-4',   color: '#f97316', startBattery: 65,  startWpIndex: 3, patrolRoute: marRouteD, home: marHome(48.3280, -4.4650), missionName: 'South Channel Screen', nominalSpeedMs: 3.0, batteryDrainRate: 0.008 },
  { id: 'MV-005', callsign: 'NEREIDE-5',  color: '#a855f7', startBattery: 85,  startWpIndex: 0, patrolRoute: marRouteE, home: marHome(48.3350, -4.5200), missionName: 'Western Approaches',   nominalSpeedMs: 3.8, batteryDrainRate: 0.008 },
]

// ═══════════════════════════════════════════════════════════════════════════
// UGV — Camp de Mourmelon tactical recon (French Army training area)
// Center: 49.120°N, 4.375°E
// Unmanned ground vehicles at 0.5–3 m/s
// ═══════════════════════════════════════════════════════════════════════════

const tac0: number = 0   // ground level

const ugvRouteA: Waypoint[] = [
  { lat: 49.1200, lng: 4.3750, altitude: tac0, name: 'BASE'    },
  { lat: 49.1230, lng: 4.3810, altitude: tac0, name: 'TANGO-1' },
  { lat: 49.1265, lng: 4.3875, altitude: tac0, name: 'TANGO-2' },
  { lat: 49.1250, lng: 4.3940, altitude: tac0, name: 'TANGO-3' },
  { lat: 49.1215, lng: 4.3970, altitude: tac0, name: 'TANGO-4' },
  { lat: 49.1175, lng: 4.3920, altitude: tac0, name: 'TANGO-5' },
  { lat: 49.1155, lng: 4.3840, altitude: tac0, name: 'TANGO-6' },
  { lat: 49.1170, lng: 4.3770, altitude: tac0, name: 'TANGO-7' },
]
const ugvRouteB: Waypoint[] = [
  { lat: 49.1240, lng: 4.3870, altitude: tac0, name: 'W2-1' },
  { lat: 49.1270, lng: 4.3930, altitude: tac0, name: 'W2-2' },
  { lat: 49.1280, lng: 4.3995, altitude: tac0, name: 'W2-3' },
  { lat: 49.1255, lng: 4.4050, altitude: tac0, name: 'W2-4' },
  { lat: 49.1220, lng: 4.4020, altitude: tac0, name: 'W2-5' },
  { lat: 49.1200, lng: 4.3960, altitude: tac0, name: 'W2-6' },
]
const ugvRouteC: Waypoint[] = [
  { lat: 49.1295, lng: 4.3760, altitude: tac0, name: 'B3-1' },
  { lat: 49.1320, lng: 4.3840, altitude: tac0, name: 'B3-2' },
  { lat: 49.1305, lng: 4.3920, altitude: tac0, name: 'B3-3' },
  { lat: 49.1285, lng: 4.4000, altitude: tac0, name: 'B3-4' },
  { lat: 49.1250, lng: 4.4010, altitude: tac0, name: 'B3-5' },
  { lat: 49.1255, lng: 4.3930, altitude: tac0, name: 'B3-6' },
  { lat: 49.1275, lng: 4.3855, altitude: tac0, name: 'B3-7' },
]
const ugvRouteD: Waypoint[] = [
  { lat: 49.1150, lng: 4.3780, altitude: tac0, name: 'F4-1' },
  { lat: 49.1140, lng: 4.3850, altitude: tac0, name: 'F4-2' },
  { lat: 49.1145, lng: 4.3920, altitude: tac0, name: 'F4-3' },
  { lat: 49.1165, lng: 4.3990, altitude: tac0, name: 'F4-4' },
  { lat: 49.1200, lng: 4.4010, altitude: tac0, name: 'F4-5' },
  { lat: 49.1210, lng: 4.3950, altitude: tac0, name: 'F4-6' },
  { lat: 49.1195, lng: 4.3875, altitude: tac0, name: 'F4-7' },
]
const ugvRouteE: Waypoint[] = [
  { lat: 49.1190, lng: 4.3720, altitude: tac0, name: 'L5-1' },
  { lat: 49.1235, lng: 4.3760, altitude: tac0, name: 'L5-2' },
  { lat: 49.1290, lng: 4.3820, altitude: tac0, name: 'L5-3' },
  { lat: 49.1315, lng: 4.4010, altitude: tac0, name: 'L5-4' },
  { lat: 49.1255, lng: 4.4070, altitude: tac0, name: 'L5-5' },
  { lat: 49.1180, lng: 4.4040, altitude: tac0, name: 'L5-6' },
  { lat: 49.1135, lng: 4.3960, altitude: tac0, name: 'L5-7' },
  { lat: 49.1115, lng: 4.3860, altitude: tac0, name: 'L5-8' },
  { lat: 49.1130, lng: 4.3775, altitude: tac0, name: 'L5-9' },
]

function ugvHome(lat: number, lng: number): DronePosition {
  return { lat, lng, altitude: tac0 }
}

const UGV_FLEET: DroneSimConfig[] = [
  { id: 'UGV-001', callsign: 'MULE-1', color: '#06b6d4', startBattery: 100, startWpIndex: 0, patrolRoute: ugvRouteA, home: ugvHome(49.1200, 4.3750), missionName: 'Primary Recon Loop',   nominalSpeedMs: 1.8, batteryDrainRate: 0.04 },
  { id: 'UGV-002', callsign: 'WOLF-2', color: '#22c55e', startBattery: 87,  startWpIndex: 1, patrolRoute: ugvRouteB, home: ugvHome(49.1240, 4.3870), missionName: 'Eastern Flank Sweep',  nominalSpeedMs: 2.2, batteryDrainRate: 0.04 },
  { id: 'UGV-003', callsign: 'BEAR-3', color: '#fbbf24', startBattery: 73,  startWpIndex: 2, patrolRoute: ugvRouteC, home: ugvHome(49.1295, 4.3760), missionName: 'Northern Sector Scan',  nominalSpeedMs: 2.0, batteryDrainRate: 0.04 },
  { id: 'UGV-004', callsign: 'FOX-4',  color: '#f97316', startBattery: 61,  startWpIndex: 3, patrolRoute: ugvRouteD, home: ugvHome(49.1150, 4.3780), missionName: 'Southern Flank Patrol', nominalSpeedMs: 1.5, batteryDrainRate: 0.04 },
  { id: 'UGV-005', callsign: 'LYNX-5', color: '#a855f7', startBattery: 79,  startWpIndex: 0, patrolRoute: ugvRouteE, home: ugvHome(49.1190, 4.3720), missionName: 'Perimeter Overwatch',  nominalSpeedMs: 2.5, batteryDrainRate: 0.04 },
]

// ═══════════════════════════════════════════════════════════════════════════
// Profile registry
// ═══════════════════════════════════════════════════════════════════════════

export const MISSION_PROFILES: Record<MissionProfile, ProfileMeta> = {
  aerial: {
    id:                  'aerial',
    label:               'AERIAL',
    emoji:               '🚁',
    description:         'Aerial surveillance — 5-drone UAV fleet, Paris CDG perimeter patrol',
    mapCenter:           [49.0200, 2.5400],
    mapZoom:             12,
    datalinkLabel:       'RF LINK',
    speedLabel:          'GND SPD',
    speedUnit:           'm/s',
    speedMultiplier:     1,
    altLabel:            'ALT AGL',
    altUnit:             'm',
    energyLabel:         'BATTERY',
    fleet:               AERIAL_FLEET,
    missionStartMessage: 'Ground Control System online — 5-drone fleet active. CDG perimeter patrol initiated.',
  },
  ground: {
    id:                  'ground',
    label:               'GROUND',
    emoji:               '🚜',
    description:         'Ground vehicle convoy — 5-vehicle escort, Satory military zone',
    mapCenter:           [48.7970, 2.1050],
    mapZoom:             14,
    datalinkLabel:       'TACTICAL MESH',
    speedLabel:          'SPD OVR GND',
    speedUnit:           'km/h',
    speedMultiplier:     3.6,    // m/s → km/h
    altLabel:            'SPD OVR GND',
    altUnit:             'km/h',
    energyLabel:         'FUEL',
    fleet:               GROUND_FLEET,
    missionStartMessage: 'Ground Control System online — 5-vehicle convoy active. Satory zone patrol initiated.',
  },
  maritime: {
    id:                  'maritime',
    label:               'MARITIME',
    emoji:               '🌊',
    description:         'Maritime patrol — 5-vessel surface fleet, Rade de Brest',
    mapCenter:           [48.3500, -4.4600],
    mapZoom:             12,
    datalinkLabel:       'ACOUSTIC LINK',
    speedLabel:          'SPD OVR WTR',
    speedUnit:           'kn',
    speedMultiplier:     1.944,  // m/s → knots
    altLabel:            'DEPTH',
    altUnit:             'm',
    energyLabel:         'FUEL',
    fleet:               MARITIME_FLEET,
    missionStartMessage: 'Ground Control System online — 5-vessel maritime fleet active. Rade de Brest patrol initiated.',
  },
  ugv: {
    id:                  'ugv',
    label:               'UGV',
    emoji:               '🤖',
    description:         'Robotic recon — 5 unmanned ground vehicles, Mourmelon training area',
    mapCenter:           [49.1220, 4.3890],
    mapZoom:             15,
    datalinkLabel:       'MESH RF LINK',
    speedLabel:          'GND SPD',
    speedUnit:           'm/s',
    speedMultiplier:     1,
    altLabel:            'CLEARANCE',
    altUnit:             'cm',
    energyLabel:         'BATTERY',
    fleet:               UGV_FLEET,
    missionStartMessage: 'Ground Control System online — 5 UGV active. Mourmelon tactical recon initiated.',
  },
}

export const VALID_PROFILES: MissionProfile[] = ['aerial', 'ground', 'maritime', 'ugv']

/** Default profile on first load */
export const DEFAULT_PROFILE: MissionProfile = 'aerial'
