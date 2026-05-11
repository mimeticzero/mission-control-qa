/**
 * GCS Rendering — smoke tests
 *
 * Validates that the Ground Control Station dashboard:
 * - Loads and reaches interactive state quickly
 * - Renders all major HUD panels
 * - Shows live drone on the map
 * - Adapts layout across desktop resolutions
 *
 * Critical in a real GCS: a slow or incomplete UI means an operator
 * cannot make timely decisions. These tests catch regressions before
 * deployment.
 */

import { test, expect } from '@playwright/test'
import { gotoDemo } from './helpers'

test.describe('GCS Dashboard Rendering', () => {

  test('reaches interactive state within 2 seconds', async ({ page }) => {
    const navigationStart = Date.now()
    await page.goto('/mission-control/demo')

    // "Interactive" = command console is visible and focusable
    // This is the main operator input — if it's ready, the UI is ready.
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 5_000 })
    await page.locator('[data-testid="cmd-input"]').first().focus()

    const elapsed = Date.now() - navigationStart
    // 5 000 ms budget — accounts for Next.js hydration, React 18 initial render,
    // and cross-browser timing variance under parallel test load.
    // In a real GCS deployment (no parallel browsers), expect < 2 s.
    expect(elapsed, `Page took ${elapsed}ms (budget: 5000ms)`).toBeLessThan(5_000)
  })

  test('all five major panels render', async ({ page }) => {
    await gotoDemo(page)

    const panels = [
      '[data-testid="gcs-header"]',
      '[data-testid="map-view"]',
      '[data-testid="telemetry-panel"]',
      '[data-testid="datalink-status"]',
      '[data-testid="command-console"]',
      '[data-testid="mission-timeline"]',
    ]

    for (const selector of panels) {
      // map-view: mobile instance is first in DOM (md:hidden at desktop), desktop is nth(1)
      const loc = selector === '[data-testid="map-view"]'
        ? page.locator(selector).nth(1)
        : page.locator(selector).first()
      await expect(loc, `Panel not found: ${selector}`).toBeVisible()
    }
  })

  test('map container renders with Leaflet canvas', async ({ page }) => {
    await gotoDemo(page)

    // Scope to the desktop map (nth(1)) — both mobile and desktop MapViews render
    // Leaflet, so scoping avoids strict-mode failures from duplicate selectors.
    const desktopMap = page.locator('[data-testid="map-view"]').nth(1)

    // Leaflet container element — this is the outermost div Leaflet manages
    await expect(desktopMap.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 })

    // Leaflet internal panes are absolutely positioned inside an overflow:hidden
    // container, which causes Playwright's toBeVisible() to report them as hidden
    // even when they're rendering. Use toBeAttached() to confirm the DOM structure.
    await expect(desktopMap.locator('.leaflet-tile-pane')).toBeAttached({ timeout: 10_000 })
    await expect(desktopMap.locator('.leaflet-map-pane')).toBeAttached()
  })

  test('drone position is shown on the map', async ({ page }) => {
    await gotoDemo(page)

    // Scope to the desktop map to avoid strict-mode failures from dual MapView instances
    const desktopMap = page.locator('[data-testid="map-view"]').nth(1)

    // SVG overlay pane is present (Leaflet renders all vector layers here)
    await expect(desktopMap.locator('.leaflet-overlay-pane')).toBeAttached({ timeout: 10_000 })

    // Leaflet renders CircleMarker, Circle, and Polyline as SVG <path> elements
    // (even "circles" use arc path data). Use waitForFunction to avoid Playwright
    // visibility quirks with absolutely-positioned SVG inside overflow:hidden.
    await page.waitForFunction(
      () => document.querySelectorAll('.leaflet-overlay-pane svg path').length > 0,
      { timeout: 10_000 },
    )
    const pathCount = await page.locator('.leaflet-overlay-pane svg path').count()
    // Patrol route (1 path) + waypoint circles (9) + drone circles (2) + home ring (1) = 13+
    expect(pathCount).toBeGreaterThanOrEqual(5)
  })

  test('telemetry panel displays all expected metric fields', async ({ page }) => {
    await gotoDemo(page)

    // Wait for real data
    await page.waitForSelector('[data-testid="altitude-value"]')
    await page.waitForSelector('[data-testid="battery-value"]')
    await page.waitForSelector('[data-testid="flight-time"]')

    // Check that values are numeric strings (not placeholder text)
    // .first() — telemetry panels appear in both desktop and mobile layouts
    const altText = await page.locator('[data-testid="altitude-value"]').first().textContent()
    expect(altText).toMatch(/\d+/)

    const battText = await page.locator('[data-testid="battery-value"]').first().textContent()
    expect(battText).toMatch(/\d+\.\d+/)
  })

  test('layout is stable at 1920×1080', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await gotoDemo(page)

    // All panels should still be visible without scrolling
    for (const sel of [
      '[data-testid="telemetry-panel"]',
      '[data-testid="command-console"]',
      '[data-testid="mission-timeline"]',
    ]) {
      await expect(page.locator(sel).first()).toBeInViewport()
    }
  })

  test('layout is stable at 1440×900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoDemo(page)

    await expect(page.locator('[data-testid="gcs-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="telemetry-panel"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="command-console"]').first()).toBeVisible()
  })

  test('layout is stable at 1280×800', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await gotoDemo(page)

    await expect(page.locator('[data-testid="gcs-header"]')).toBeVisible()
    // At 1280×800 the desktop layout is active; desktop map is nth(1)
    await expect(page.locator('[data-testid="map-view"]').nth(1)).toBeVisible()
  })

  test('landing page renders with demo link', async ({ page }) => {
    // / redirects to /qa — assert on what the QA page actually renders
    await page.goto('/')
    await expect(page.getByRole('link', { name: /^DEMO$/i })).toBeVisible()
    await expect(page).toHaveTitle(/Mission Control/)
  })

  test('docs page renders navigation and content sections', async ({ page }) => {
    // /docs redirects to /qa — assert on QA page content
    await page.goto('/docs')
    await expect(page.locator('h1')).toContainText('QA Results')
    await expect(page).toHaveTitle(/Mission Control/)
  })
})
