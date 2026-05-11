import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Mission Control QA Stack.
 *
 * Browsers: Chromium (Chrome), Firefox, WebKit (Safari)
 * All tests run against a production-built Next.js server.
 *
 * Local: `npm run test:e2e` — reuses existing dev server if running.
 * CI:    server is started fresh from the pre-built artifact.
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Run all tests in parallel across files
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally committed
  forbidOnly: !!process.env.CI,

  // No retries — a flaky test that passes on retry masks a real problem.
  // Fix the root cause; don't hide it behind retries.
  retries: 0,

  // 4 workers in CI: with fullyParallel=true and no retries, this keeps
  // total wall-clock time well under 10 minutes across 3 browser projects.
  workers: process.env.CI ? 4 : 4,

  // Reporters
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]]
    : [['html', { open: 'on-failure' }], ['list']],

  // Global test timeout — 30 s accommodates profile-specific tests that do
  // a full networkidle load, waitForSelector, AND waitForTelemetry in sequence.
  // 20 s proved insufficient on CI when all three waits chain together.
  timeout: 30_000,

  // Shared settings for all tests
  use: {
    baseURL:    'http://localhost:3000/mission-control',
    // Capture traces, screenshots, and video on failure
    trace:      'retain-on-failure',
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    // Default viewport — desktop GCS context
    viewport:   { width: 1440, height: 900 },
    // Locale
    locale:     'en-US',
    timezoneId: 'UTC',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Web server — starts the Next.js production server before tests
  webServer: {
    command:              'npm run start',
    url:                  'http://localhost:3000/mission-control',
    reuseExistingServer:  !process.env.CI,
    timeout:              60_000,
    stdout:               'pipe',
    stderr:               'pipe',
  },

  // Output directory for test artifacts
  outputDir: 'test-results',
})
