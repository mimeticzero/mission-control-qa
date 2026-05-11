/**
 * Mission Profiles — Multi-profile E2E validation
 *
 * Demonstrates that the same GCS framework is transposable across
 * four operational contexts: aerial surveillance, ground convoy,
 * maritime patrol, and UGV reconnaissance.
 *
 * These tests verify:
 * 1. Profile switching changes vehicle names and telemetry labels
 * 2. URL ?profile= param pre-selects a profile on load
 * 3. Core commands (RTH, HOLD, EMERGENCY_LAND) dispatch in every profile
 * 4. EW mode works independently of the active profile
 * 5. Profile changes are reflected in the mission timeline
 * 6. Drone selector updates when profile switches
 */

import { test, expect } from '@playwright/test'
import { gotoDemo, waitForTelemetry } from './helpers'

// ─── Profile dropdown ─────────────────────────────────────────────────────────

test.describe('Profile Selector UI', () => {

  test('mission profile dropdown is visible in the header', async ({ page }) => {
    await gotoDemo(page)
    await expect(page.locator('[data-testid="mission-profile-select"]')).toBeVisible()
  })

  test('default profile is AERIAL on first load', async ({ page }) => {
    await gotoDemo(page)
    const select = page.locator('[data-testid="mission-profile-select"]')
    await expect(select).toHaveValue('aerial')
  })

  test('all four profiles are available as options', async ({ page }) => {
    await gotoDemo(page)
    const select = page.locator('[data-testid="mission-profile-select"]')
    await expect(select.locator('option[value="aerial"]')).toBeAttached()
    await expect(select.locator('option[value="ground"]')).toBeAttached()
    await expect(select.locator('option[value="maritime"]')).toBeAttached()
    await expect(select.locator('option[value="ugv"]')).toBeAttached()
  })

})

// ─── Profile switching — vehicle names ───────────────────────────────────────

test.describe('Profile Switching — Vehicle Names', () => {

  test('switching to GROUND shows SCOUT-1 in the selector', async ({ page }) => {
    await gotoDemo(page)
    await page.selectOption('[data-testid="mission-profile-select"]', 'ground')
    await expect(page.locator('[data-testid="drone-selector"]'))
      .toContainText('SCOUT-1', { timeout: 3_000 })
  })

  test('switching to MARITIME shows POSEIDON-1 in the selector', async ({ page }) => {
    await gotoDemo(page)
    await page.selectOption('[data-testid="mission-profile-select"]', 'maritime')
    await expect(page.locator('[data-testid="drone-selector"]'))
      .toContainText('POSEIDON-1', { timeout: 3_000 })
  })

  test('switching to UGV shows MULE-1 in the selector', async ({ page }) => {
    await gotoDemo(page)
    await page.selectOption('[data-testid="mission-profile-select"]', 'ugv')
    await expect(page.locator('[data-testid="drone-selector"]'))
      .toContainText('MULE-1', { timeout: 3_000 })
  })

  test('switching back to AERIAL restores FALCON-1', async ({ page }) => {
    await gotoDemo(page)
    await page.selectOption('[data-testid="mission-profile-select"]', 'ground')
    await page.selectOption('[data-testid="mission-profile-select"]', 'aerial')
    await expect(page.locator('[data-testid="drone-selector"]'))
      .toContainText('FALCON-1', { timeout: 3_000 })
  })

  test('GROUND profile shows all 5 ground vehicle callsigns', async ({ page }) => {
    await gotoDemo(page)
    await page.selectOption('[data-testid="mission-profile-select"]', 'ground')
    const selector = page.locator('[data-testid="drone-selector"]')
    await expect(selector).toContainText('SCOUT-1',    { timeout: 3_000 })
    await expect(selector).toContainText('GUARDIAN-2')
    await expect(selector).toContainText('SENTINEL-3')
    await expect(selector).toContainText('RANGER-4')
    await expect(selector).toContainText('NOMAD-5')
  })

})

// ─── URL ?profile= param ─────────────────────────────────────────────────────

test.describe('URL Profile Parameter', () => {

  test('?profile=ground pre-selects GROUND profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ground', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })

    await expect(page.locator('[data-testid="mission-profile-select"]')).toHaveValue('ground')
    await expect(page.locator('[data-testid="drone-selector"]'))
      .toContainText('SCOUT-1', { timeout: 5_000 })
  })

  test('?profile=maritime pre-selects MARITIME profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=maritime', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })

    await expect(page.locator('[data-testid="mission-profile-select"]')).toHaveValue('maritime')
    await expect(page.locator('[data-testid="drone-selector"]'))
      .toContainText('POSEIDON-1', { timeout: 5_000 })
  })

  test('?profile=ugv pre-selects UGV profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ugv', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })

    await expect(page.locator('[data-testid="mission-profile-select"]')).toHaveValue('ugv')
    await expect(page.locator('[data-testid="drone-selector"]'))
      .toContainText('MULE-1', { timeout: 5_000 })
  })

  test('invalid ?profile= value falls back to AERIAL', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=invalid', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })

    await expect(page.locator('[data-testid="mission-profile-select"]')).toHaveValue('aerial')
  })

  test('profile change updates URL query param', async ({ page }) => {
    await gotoDemo(page)
    await page.selectOption('[data-testid="mission-profile-select"]', 'maritime')
    await page.waitForTimeout(300)

    const url = new URL(page.url())
    expect(url.searchParams.get('profile')).toBe('maritime')
  })

})

// ─── Telemetry labels per profile ────────────────────────────────────────────

test.describe('Profile-Specific Telemetry Labels', () => {

  test('GROUND profile shows SPD OVR GND label', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ground', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await expect(page.locator('[data-testid="telemetry-panel"]').first())
      .toContainText('SPD OVR GND', { timeout: 3_000 })
  })

  test('MARITIME profile shows DEPTH label', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=maritime', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await expect(page.locator('[data-testid="telemetry-panel"]').first())
      .toContainText('DEPTH', { timeout: 3_000 })
  })

  test('UGV profile shows CLRNCE label', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ugv', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await expect(page.locator('[data-testid="telemetry-panel"]').first())
      .toContainText('CLRNCE', { timeout: 3_000 })
  })

  test('GROUND profile shows FUEL label instead of BATTERY', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ground', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await expect(page.locator('[data-testid="battery-value"]'))
      .toContainText('FUEL', { timeout: 3_000 })
  })

  test('MARITIME profile shows WAVE HT extra metric', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=maritime', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await expect(page.locator('[data-testid="telemetry-panel"]').first())
      .toContainText('WAVE HT', { timeout: 3_000 })
  })

  test('UGV profile shows ARMOR extra metric', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ugv', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await expect(page.locator('[data-testid="telemetry-panel"]').first())
      .toContainText('ARMOR', { timeout: 3_000 })
  })

})

// ─── Commands in all profiles ─────────────────────────────────────────────────

test.describe('Commands Work In All Profiles', () => {

  test('RTH command dispatches in GROUND profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ground', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await page.locator('[data-testid="cmd-rth"]').first().click()
    await expect(page.locator('[data-testid="cmd-log"]').first())
      .toContainText('RTH', { timeout: 3_000 })
  })

  test('RTH command dispatches in MARITIME profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=maritime', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await page.locator('[data-testid="cmd-rth"]').first().click()
    await expect(page.locator('[data-testid="cmd-log"]').first())
      .toContainText('RTH', { timeout: 3_000 })
  })

  test('RTH command dispatches in UGV profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ugv', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await page.locator('[data-testid="cmd-rth"]').first().click()
    await expect(page.locator('[data-testid="cmd-log"]').first())
      .toContainText('RTH', { timeout: 3_000 })
  })

  test('HOLD command dispatches in MARITIME profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=maritime', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })

    await page.locator('[data-testid="cmd-hold"]').first().click()
    await expect(page.locator('[data-testid="cmd-log"]').first())
      .toContainText('HOLD', { timeout: 3_000 })
  })

  test('EMERGENCY_LAND dispatches in GROUND profile after confirmation', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ground', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await page.locator('[data-testid="cmd-emrg"]').first().click()
    await expect(page.locator('[data-testid="emrg-confirm-dialog"]')).toBeVisible()
    await page.click('[data-testid="emrg-confirm-btn"]')

    await expect(page.locator('[data-testid="cmd-log"]').first())
      .toContainText('EMERGENCY_LAND', { timeout: 3_000 })
  })

  test('EMERGENCY_LAND dispatches in UGV profile after confirmation', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ugv', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })
    await waitForTelemetry(page, { timeout: 15_000 })

    await page.locator('[data-testid="cmd-emrg"]').first().click()
    await expect(page.locator('[data-testid="emrg-confirm-dialog"]')).toBeVisible()
    await page.click('[data-testid="emrg-confirm-btn"]')

    await expect(page.locator('[data-testid="cmd-log"]').first())
      .toContainText('EMERGENCY_LAND', { timeout: 3_000 })
  })

})

// ─── EW mode in non-aerial profiles ──────────────────────────────────────────

test.describe('EW Mode Works In All Profiles', () => {

  test('EW mode activates in GROUND profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ground', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })

    await page.click('[data-testid="ew-mode-toggle"]')
    await expect(page.locator('[data-testid="ew-mode-banner"]')).toBeVisible({ timeout: 2_000 })
    await expect(page.locator('[data-testid="ew-mode-toggle"]')).toHaveAttribute('aria-pressed', 'true')
  })

  test('EW mode activates in MARITIME profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=maritime', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })

    await page.click('[data-testid="ew-mode-toggle"]')
    await expect(page.locator('[data-testid="ew-mode-banner"]')).toBeVisible({ timeout: 2_000 })
  })

  test('EW mode activates in UGV profile', async ({ page }) => {
    await page.goto('/mission-control/demo?profile=ugv', { waitUntil: 'domcontentloaded' })
    await page.bringToFront()
    await page.waitForSelector('[data-testid="command-console"]', { timeout: 10_000 })

    await page.click('[data-testid="ew-mode-toggle"]')
    await expect(page.locator('[data-testid="ew-mode-banner"]')).toBeVisible({ timeout: 2_000 })
  })

  test('profile switch resets EW mode', async ({ page }) => {
    await gotoDemo(page)

    // Activate EW
    await page.click('[data-testid="ew-mode-toggle"]')
    await expect(page.locator('[data-testid="ew-mode-banner"]')).toBeVisible({ timeout: 2_000 })

    // Switch profile — EW should deactivate
    await page.selectOption('[data-testid="mission-profile-select"]', 'ground')
    await expect(page.locator('[data-testid="ew-mode-banner"]')).not.toBeAttached({ timeout: 2_000 })
  })

})

// ─── Profile switch events in mission timeline ────────────────────────────────

test.describe('Profile Switch Logged to Timeline', () => {

  test('switching to GROUND logs a SYSTEM event', async ({ page }) => {
    await gotoDemo(page)

    await page.selectOption('[data-testid="mission-profile-select"]', 'ground')

    await expect(page.locator('[data-testid="event-list"]').first())
      .toContainText('GROUND', { timeout: 3_000 })
  })

  test('switching to MARITIME logs MARITIME in the timeline', async ({ page }) => {
    await gotoDemo(page)

    await page.selectOption('[data-testid="mission-profile-select"]', 'maritime')

    await expect(page.locator('[data-testid="event-list"]').first())
      .toContainText('MARITIME', { timeout: 3_000 })
  })

})

// ─── Telemetry arrives after profile switch ───────────────────────────────────

test.describe('Telemetry After Profile Switch', () => {

  test('telemetry populates after switching to GROUND', async ({ page }) => {
    await gotoDemo(page)
    await page.selectOption('[data-testid="mission-profile-select"]', 'ground')
    await waitForTelemetry(page, { timeout: 15_000 })

    // Telemetry panel should show SCOUT-1 callsign
    await expect(page.locator('[data-testid="telemetry-panel"]').first())
      .toContainText('SCOUT-1', { timeout: 5_000 })
  })

  test('telemetry populates after switching to UGV', async ({ page }) => {
    await gotoDemo(page)
    await page.selectOption('[data-testid="mission-profile-select"]', 'ugv')
    await waitForTelemetry(page, { timeout: 15_000 })

    await expect(page.locator('[data-testid="telemetry-panel"]').first())
      .toContainText('MULE-1', { timeout: 5_000 })
  })

})
