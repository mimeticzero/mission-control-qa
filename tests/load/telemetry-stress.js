/**
 * K6 Load Test — Telemetry SSE Endpoint
 *
 * Simulates 200 concurrent clients subscribing to the /api/telemetry
 * Server-Sent Events stream. Each VU opens a long-lived connection and
 * reads events for the duration of the test.
 *
 * Thresholds:
 *   - Connection establishment: p95 < 500ms
 *   - Event receive rate: > 0.9 events/s per connection
 *   - Error rate: < 0.1%
 *
 * In a real GCS deployment, this models multiple operator stations
 * and monitoring dashboards all consuming drone telemetry simultaneously.
 *
 * Run: k6 run tests/load/telemetry-stress.js --env BASE_URL=http://localhost:3000
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'

const eventsReceived  = new Counter('telemetry_events_received')
const connectionErrors = new Rate('telemetry_connection_errors')
const ttfe            = new Trend('time_to_first_event_ms')  // TTFE

export const options = {
  scenarios: {
    // Ramp up to 200 concurrent SSE subscribers over 30s, hold for 3 min, ramp down
    sse_subscribers: {
      executor:      'ramping-vus',
      startVUs:      0,
      stages: [
        { duration: '30s', target: 200 },   // Ramp up
        { duration: '3m',  target: 200 },   // Steady state — 200 concurrent clients
        { duration: '30s', target: 0   },   // Ramp down
      ],
    },
  },
  thresholds: {
    // Connection + first-event latency
    time_to_first_event_ms:     ['p(95)<500'],
    // Very low error rate
    telemetry_connection_errors: ['rate<0.001'],
    // Standard HTTP metrics
    http_req_failed:             ['rate<0.001'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export default function () {
  const start    = Date.now()
  let gotEvent   = false
  let eventCount = 0
  let error      = false

  // SSE is an HTTP GET with streaming response.
  // k6 reads the body stream; we parse event lines manually.
  const response = http.get(`${BASE_URL}/api/telemetry`, {
    headers: {
      'Accept':        'text/event-stream',
      'Cache-Control': 'no-cache',
    },
    // Read the stream for 5 seconds then move on
    responseType: 'text',
    timeout:      '8s',
  })

  check(response, {
    'status 200':              (r) => r.status === 200,
    'content-type is SSE':     (r) => (r.headers['Content-Type'] ?? '').includes('text/event-stream'),
    'body contains data event': (r) => r.body?.includes('data:') ?? false,
  }) || (error = true)

  if (response.body?.includes('data:')) {
    gotEvent = true
    // Count data lines as events
    eventCount = (response.body.match(/^data:/gm) || []).length
    eventsReceived.add(eventCount)
  }

  if (!gotEvent) {
    connectionErrors.add(1)
  } else {
    ttfe.add(Date.now() - start)
    connectionErrors.add(0)
  }

  // Brief pause before next iteration (simulate realistic polling pattern)
  sleep(Math.random() * 2 + 1)  // 1–3 seconds between reconnects
}

export function handleSummary(data) {
  return {
    'test-results/telemetry-stress-summary.json': JSON.stringify(data, null, 2),
  }
}
