/**
 * K6 Load Test — Datalink Recovery
 *
 * Simulates connection loss and recovery:
 * 100 VUs each perform: connect → get event → disconnect → reconnect.
 *
 * Models a scenario where signal loss causes many clients to reconnect
 * simultaneously (e.g., field operation returning to coverage area).
 *
 * Thresholds:
 *   - Reconnection successful within 3s: 99% of cases
 *   - p95 reconnect time < 1s
 *
 * Run: k6 run tests/load/datalink-recovery.js --env BASE_URL=http://localhost:3000
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const reconnectSuccess = new Rate('reconnect_success_rate')
const reconnectTime    = new Trend('reconnect_time_ms')

export const options = {
  scenarios: {
    // 100 VUs simulate disconnect-reconnect cycles
    datalink_recovery: {
      executor: 'constant-vus',
      vus:      100,
      duration: '90s',
    },
  },
  thresholds: {
    reconnect_success_rate: ['rate>0.99'],   // 99% reconnect success
    reconnect_time_ms:      ['p(95)<1000'],  // p95 < 1s
    http_req_failed:        ['rate<0.01'],
  },
}

const BASE_URL  = __ENV.BASE_URL || 'http://localhost:3000'
const BASE_PATH = '/mission-control'

export default function () {
  // Step 1: Simulate initial connection
  const connect1 = http.get(`${BASE_URL}${BASE_PATH}/api/telemetry`, {
    headers: { 'Accept': 'text/event-stream' },
    timeout: '3s',
  })

  check(connect1, { 'initial connect 200': (r) => r.status === 200 })

  // Step 2: Simulate datalink loss (artificial delay = "link down")
  sleep(0.1 + Math.random() * 0.4)  // 100-500ms outage window

  // Step 3: Reconnection attempt
  const reconnectStart = Date.now()

  const connect2 = http.get(`${BASE_URL}${BASE_PATH}/api/telemetry`, {
    headers: { 'Accept': 'text/event-stream' },
    timeout: '3s',
  })

  const elapsed = Date.now() - reconnectStart

  const ok = check(connect2, {
    'reconnect 200':              (r) => r.status === 200,
    'reconnect < 3s':             ()  => elapsed < 3_000,
    'body has SSE event':         (r) => (r.body ?? '').includes('data:'),
  })

  reconnectSuccess.add(ok ? 1 : 0)
  reconnectTime.add(elapsed)

  // Random idle period between cycles
  sleep(Math.random() * 1 + 0.5)
}

export function handleSummary(data) {
  return {
    'test-results/datalink-recovery-summary.json': JSON.stringify(data, null, 2),
  }
}
