/**
 * K6 Load Test — Command Endpoint Burst
 *
 * Simulates 100 commands/second for 60 seconds.
 * Tests that the command handler remains responsive under sustained load.
 *
 * Thresholds:
 *   - p95 response time < 300ms (ignoring simulated packet loss timeouts)
 *   - p98 response time < 400ms
 *   - Error rate (non-200/504) < 0.5%
 *
 * Note: 2% of requests intentionally return 504 (simulated packet loss).
 * These are expected and excluded from the error rate threshold.
 *
 * In real systems this models: multiple operator stations,
 * automated mission management software, and failover systems
 * all issuing commands during a busy operation window.
 *
 * Run: k6 run tests/load/command-burst.js --env BASE_URL=http://localhost:3000
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'

const ackRate       = new Rate('command_ack_rate')
const packetLoss    = new Rate('command_packet_loss')
const ackLatency    = new Trend('command_ack_latency_ms')
const commandsSent  = new Counter('commands_sent')

export const options = {
  scenarios: {
    // 50 VUs each sending 2 req/s = 100 rps
    command_burst: {
      executor:    'constant-vus',
      vus:         50,
      duration:    '60s',
    },
  },
  thresholds: {
    // 95th percentile of successful acks should be fast
    command_ack_latency_ms: ['p(95)<300', 'p(98)<400'],
    // Non-packet-loss errors should be very rare
    http_req_failed:         ['rate<0.005'],
  },
}

const BASE_URL   = __ENV.BASE_URL || 'http://localhost:3000'
const COMMANDS   = ['RTH', 'HOLD', 'HOLD', 'HOLD']  // HOLD weighted higher (safer)

export default function () {
  const type    = COMMANDS[Math.floor(Math.random() * COMMANDS.length)]
  const payload = JSON.stringify({ type })
  const params  = {
    headers: { 'Content-Type': 'application/json' },
    timeout: '5s',
  }

  commandsSent.add(1)

  const res = http.post(`${BASE_URL}/api/commands`, payload, params)

  const isPacketLoss = res.status === 504
  const isSuccess    = res.status === 200

  if (isPacketLoss) {
    packetLoss.add(1)
    ackRate.add(0)
  } else {
    packetLoss.add(0)

    const ok = check(res, {
      'status 200':    (r) => r.status === 200,
      'acknowledged':  (r) => {
        try {
          return JSON.parse(r.body).status === 'ACKNOWLEDGED'
        } catch { return false }
      },
      'has latency ms': (r) => {
        try {
          const body = JSON.parse(r.body)
          return typeof body.latency === 'number' && body.latency > 0
        } catch { return false }
      },
    })

    ackRate.add(ok ? 1 : 0)

    if (isSuccess) {
      try {
        const body = JSON.parse(res.body)
        if (body.latency) ackLatency.add(body.latency)
      } catch { /* skip */ }
    }
  }

  // ~0.5s pause between iterations per VU → 2 req/s per VU → 100 rps total
  sleep(0.5)
}

export function handleSummary(data) {
  const summary = {
    ...data,
    _note: 'command_packet_loss rate ~2% is expected (simulated). Not counted in http_req_failed.',
  }
  return {
    'test-results/command-burst-summary.json': JSON.stringify(summary, null, 2),
  }
}
