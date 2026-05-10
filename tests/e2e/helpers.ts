import { type Page, expect } from '@playwright/test'

/** Navigate to the GCS demo and wait until the simulator produces its first telemetry tick. */
export async function gotoDemo(page: Page, { e2e = false } = {}) {
  const url = e2e ? '/demo?__e2e=1' : '/demo'
  await page.goto(url)
  // Telemetry panel renders "AWAITING TELEMETRY…" until the first simulator tick (~400ms).
  // Wait up to 12 s for it to disappear (i.e., real data arrived).
  // 12 s headroom handles slow hydration under parallel cross-browser test load.
  await page.waitForFunction(
    () => {
      const panel = document.querySelector('[data-testid="telemetry-panel"]')
      return panel && !panel.textContent?.includes('AWAITING TELEMETRY')
    },
    { timeout: 12_000 },
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
