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

  // Retries: 1 on both CI and local — handles cross-browser timing flakiness
  // without masking real failures (a test that fails twice is a real failure)
  retries: 1,

  // Limit parallelism to prevent server overload when running all 3 browsers
  // CI=2 keeps pipeline concurrency low; local=4 gives reasonable throughput
  workers: process.env.CI ? 2 : 4,

  // Reporters
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]]
    : [['html', { open: 'on-failure' }], ['list']],

  // Global test timeout
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
