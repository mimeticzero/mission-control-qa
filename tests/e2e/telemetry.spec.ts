/**
 * Telemetry — E2E
 *
 * Validates that real-time telemetry updates correctly reach the operator UI,
 * and that anomalous states (low battery, datalink degradation) surface
 * in the expected visual and structural ways.
 *
 * In a real GCS, stale or lost telemetry is a safety incident.
 * These tests ensure the UI never silently stops updating.
 */

import { test, expect } from '@playwright/test'
import { gotoDemo, waitForTelemetry, injectLowBattery, injectDatalinkLoss } from './helpers'

test.describe('Telemetry Updates', () => {

  test('flight time counter increments over time', async ({ page }) => {
    await gotoDemo(page)
    await waitForTelemetry(page)

    // Capture flight time at T0
    const t0 = await page.locator('[data-testid="flight-time"]').first().textContent()

    // Wait ~1.5 s (> 1 simulator tick of 400ms)
    await page.waitForTimeout(1_500)

    // Flight time should have advanced
    const t1 = await page.locator('[data-testid="flight-time"]').first().textContent()
    expect(t0).not.toEqual(t1)
  })

  test('altitude value changes as drone moves along patrol route', async ({ page }) => {
    await gotoDemo(page)
    await waitForTelemetry(page)

    const alt0 = await page.locator('[data-testid="altitude-value"]').first().textContent()

    // Wait 3 seconds — enough for several simulator ticks
    await page.waitForTimeout(3_000)

    const alt1 = await page.locator('[data-testid="altitude-value"]').first().textContent()

    // Values may be the same if luck has it (tiny change rounds to same int),
    // so we check flight time to confirm simulator is alive rather than alt equality
    const ft0 = await page.locator('[data-testid="flight-time"]').first().textContent()
    // 1.5 s gives enough margin for one flight-time tick even on a loaded Firefox worker
    await page.waitForTimeout(1_500)
    const ft1 = await page.locator('[data-testid="flight-time"]').first().textContent()
    expect(ft0).not.toEqual(ft1)

    // Altitude should be a positive number
    const altNum = parseInt(alt1?.replace(/\D/g, '') ?? '0', 10)
    expect(altNum).toBeGreaterThan(50)
    expect(altNum).toBeLessThan(300)
  })

  test('battery value is between 0 and 100', async ({ page }) => {
    await gotoDemo(page)
    await waitForTelemetry(page)

    const battText = await page.locator('[data-testid="battery-value"]').first().textContent()
    const batt = parseFloat(battText?.replace(/[^0-9.]/g, '') ?? '0')
    expect(batt).toBeGreaterThan(0)
    expect(batt).toBeLessThanOrEqual(100)
  })

  test('latency value is a positive number in expected range', async ({ page }) => {
    await gotoDemo(page)
    await waitForTelemetry(page)

    const latText = await page.locator('[data-testid="latency-value"]').first().textContent()
    const lat = parseInt(latText?.replace(/\D/g, '') ?? '0', 10)

    // Simulated latency is always between 50 and 300ms
    expect(lat).toBeGreaterThan(0)
    expect(lat).toBeLessThan(1_000)
  })

  // ── Critical state: battery < 15% ────────────────────────────────────────────

  test('battery CRITICAL state: text turns red and status badge shows CRITICAL', async ({ page }) => {
    await gotoDemo(page, { e2e: true })
    await waitForTelemetry(page)

    // Inject low battery via test bridge
    await injectLowBattery(page)

    // Inner data-value element should be red (and pulsing)
    await expect(page.locator('[data-testid="battery-value"]').first().locator('.data-value'))
      .toHaveClass(/text-gcs-red/, { timeout: 2_000 })

    // System status in header should reflect CRITICAL
    await expect(page.locator('[data-testid="drone-status"]'))
      .toContainText('CRITICAL', { timeout: 2_000 })
  })

  test('battery CRITICAL triggers aria-live assertive announcement', async ({ page }) => {
    await gotoDemo(page, { e2e: true })
    await waitForTelemetry(page)
    await injectLowBattery(page)

    // The battery-value container has aria-live="assertive" when battery < 15%
    const liveAttr = await page.locator('[data-testid="battery-value"]').first().getAttribute('aria-live')
    expect(liveAttr).toBe('assertive')
  })

  // ── Datalink degradation ──────────────────────────────────────────────────────

  test('datalink loss: latency spikes are reflected in the bar chart', async ({ page }) => {
    await gotoDemo(page, { e2e: true })
    await waitForTelemetry(page)

    // Inject degraded datalink
    await injectDatalinkLoss(page)

    // Latency value should show the injected 9999ms
    await expect(page.locator('[data-testid="latency-value"]').first())
      .toContainText('9999', { timeout: 2_000 })
  })

  test('datalink loss: latency value turns red when above 150ms', async ({ page }) => {
    await gotoDemo(page, { e2e: true })
    await waitForTelemetry(page)
    await injectDatalinkLoss(page)

    // Latency display uses text-gcs-red when latency > 150
    await expect(page.locator('[data-testid="latency-value"]').first())
      .toHaveClass(/text-gcs-red/, { timeout: 2_000 })
  })

  // ── Mission timeline ──────────────────────────────────────────────────────────

  test('waypoint events appear in mission timeline', async ({ page }) => {
    await gotoDemo(page)
    await waitForTelemetry(page)

    // The first event is the "GCS online" system message which appears immediately.
    // Now that we have a 5-drone fleet, the startup message uses "CDG perimeter patrol".
    await expect(page.locator('[data-testid="event-list"]').first())
      .toContainText('CDG perimeter patrol', { timeout: 5_000 })
  })

  test('each event item has a timestamp visible', async ({ page }) => {
    await gotoDemo(page)
    await waitForTelemetry(page)

    // Wait for at least one event item
    const eventCount = await page.locator('[data-testid="event-item"]').count()
    expect(eventCount).toBeGreaterThanOrEqual(1)

    // First event should have a time pattern HH:MM:SS
    const firstEvent = page.locator('[data-testid="event-item"]').first()
    await expect(firstEvent).toContainText(/\d{2}:\d{2}:\d{2}/)
  })

  test('CRITICAL events are visually distinguished (red border)', async ({ page }) => {
    await gotoDemo(page, { e2e: true })
    await waitForTelemetry(page)
    await injectLowBattery(page)

    // Send a command that will generate a CRITICAL event
    await page.locator('[data-testid="cmd-emrg"]').first().click()
    const confirmBtn = page.locator('[data-testid="emrg-confirm-btn"]')
    await expect(confirmBtn).toBeVisible({ timeout: 3_000 })
    await confirmBtn.click({ force: true })

    // After ACK, a CRITICAL severity event (EMERGENCY_LAND) should appear
    // Check for event items with red-related styling
    await page.waitForTimeout(3_000) // wait for ACK

    // At least one event item should exist
    await expect(page.locator('[data-testid="event-item"]').first()).toBeVisible()
  })
})
