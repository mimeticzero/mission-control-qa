import { type Page, expect } from '@playwright/test'

/** Navigate to the GCS demo and wait until the page is interactive. */
export async function gotoDemo(page: Page, { e2e = false } = {}) {
  const url = e2e ? '/mission-control/demo?__e2e=1' : '/mission-control/demo'
  // networkidle ensures all JS bundles are loaded and executed before we start
  // checking state — this is critical for the Next.js production build where
  // chunk loading happens asynchronously after the initial HTML.
  await page.goto(url, { waitUntil: 'networkidle' })
  // Bring the page to the foreground. On webkit CI, background tabs have their
  // timers (setInterval) aggressively throttled. bringToFront() ensures the
  // 400 ms simulator interval runs at full speed throughout the test.
  await page.bringToFront()
  // Wait for the command console to confirm the GCS UI is mounted and interactive.
  // We deliberately do NOT wait for telemetry here — tests that need actual
  // telemetry values must call waitForTelemetry() explicitly.
  await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
}

/** Wait until the first telemetry tick has populated the UI. */
export async function waitForTelemetry(page: Page, options?: { timeout?: number }) {
  await page.waitForFunction(
    () => {
      const panel = document.querySelector('[data-testid="telemetry-panel"]')
      return panel && !panel.textContent?.includes('AWAITING TELEMETRY')
    },
    { timeout: options?.timeout ?? 10_000 },
  )
}

/** Read the text content of a testid element. */
export async function getTestText(page: Page, testId: string): Promise<string> {
  return (await page.locator(`[data-testid="${testId}"]`).textContent()) ?? ''
}

/** Wait for a testid element to contain specific text (polls). */
export async function waitForTestText(
  page: Page,
  testId: string,
  text: string,
  options?: { timeout?: number },
) {
  await expect(page.locator(`[data-testid="${testId}"]`))
    .toContainText(text, { timeout: options?.timeout ?? 10_000 })
}

/** Inject low-battery state via the E2E test bridge. */
export async function injectLowBattery(page: Page) {
  await page.evaluate(() => window.__missionControl?.injectLowBattery())
  // Allow one React render cycle
  await page.waitForTimeout(100)
}

/** Inject datalink loss via the E2E test bridge. */
export async function injectDatalinkLoss(page: Page) {
  await page.evaluate(() => window.__missionControl?.injectDatalinkLoss())
  await page.waitForTimeout(100)
}
