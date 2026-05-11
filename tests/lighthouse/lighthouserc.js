/**
 * Lighthouse CI Configuration — Mission Control QA Stack
 *
 * Audits three pages per run:
 *   /           — landing page (static, server-rendered)
 *   /docs       — documentation (static, server-rendered)
 *   /demo       — GCS HUD (heavily client-side, JS-driven)
 *
 * Thresholds vary by page type:
 *   Landing/Docs: aggressive — these are simple pages, no excuse for poor scores
 *   Demo:         relaxed for Performance — Leaflet + Recharts + Zustand are
 *                 heavyweight, intentionally so (real GCS UI pattern)
 *
 * Run: npx lhci autorun --config=tests/lighthouse/lighthouserc.js
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/mission-control',
        'http://localhost:3000/mission-control/docs',
        'http://localhost:3000/mission-control/demo',
      ],
      numberOfRuns: 2,   // Average over 2 runs to reduce variance
      // No startServerCommand — the CI workflow manages the server lifecycle
      settings: {
        // Simulate a realistic desktop client (operators use workstations)
        formFactor: 'desktop',
        screenEmulation: {
          mobile:            false,
          width:             1440,
          height:            900,
          deviceScaleFactor: 1,
          disabled:          false,
        },
        throttlingMethod:    'simulate',
        // 10 Mbps download — realistic control room network
        throttling: {
          rttMs:             40,
          throughputKbps:    10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },

    assert: {
      // assertMatrix is the only valid form when per-URL overrides are needed —
      // mixing top-level assertions + assertMatrix is not allowed by lhci.
      assertMatrix: [
        {
          // Landing and docs pages — high bar
          matchingUrlPattern: '.*/mission-control(/docs)?$',
          assertions: {
            'categories:performance':    ['error', { minScore: 0.90 }],
            'categories:accessibility':  ['error', { minScore: 0.95 }],
            'categories:best-practices': ['error', { minScore: 0.95 }],
            'categories:seo':            ['error', { minScore: 0.90 }],
          },
        },
        {
          // Demo page — relaxed for Performance (Leaflet + Recharts + Zustand)
          matchingUrlPattern: '.*/demo',
          assertions: {
            'categories:performance':    ['warn',  { minScore: 0.70 }],
            'categories:accessibility':  ['error', { minScore: 0.90 }],
            'categories:best-practices': ['error', { minScore: 0.90 }],
            'categories:seo':            ['warn',  { minScore: 0.70 }],
            // Core Web Vitals — warn only for a real-time GCS UI
            'first-contentful-paint':    ['warn',  { maxNumericValue: 2000 }],
            'largest-contentful-paint':  ['warn',  { maxNumericValue: 4000 }],
            'cumulative-layout-shift':   ['error', { maxNumericValue: 0.1  }],
            'total-blocking-time':       ['warn',  { maxNumericValue: 500  }],
          },
        },
      ],
    },

    upload: {
      target: 'temporary-public-storage',
    },
  },
}
