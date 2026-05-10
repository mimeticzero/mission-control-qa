/**
 * Command Dispatch — E2E
 *
 * Tests the full command lifecycle: operator input → dispatch → simulated
 * datalink → ACK/FAIL → UI reflection.
 *
 * In real GCS systems, command reliability is safety-critical.
 * These tests verify:
 * - Commands reach the drone (ACK appears within datalink timeout)
 * - Destructive commands require double confirmation
 * - Failed commands surface clearly to the operator
 * - Command history is available for post-mission review
 */

import { test, expect } from '@playwright/test'
import { gotoDemo, waitForTelemetry } from './helpers'

test.describe('Command Dispatch', () => {

  test.beforeEach(async ({ page }) => {
    await gotoDemo(page)
  })

  // ── RTH ─────────────────────────────────────────────────────────────────────

  test('RTH button dispatches command and flight mode changes', async ({ page }) => {
    await waitForTelemetry(page)
    // Drone starts at HOME position. Wait for it to travel >5 m away so that
    // the RTH "near home → HOLD" threshold (dist < 5 m) is not immediately triggered.
    // At 10 m/s × 400 ms ticks, 3 ticks ≈ 12 m — well clear.
    await page.waitForTimeout(1_600)

    // Click the RTH quick-action button
    await page.click('[data-testid="cmd-rth"]')

    // The command log should immediately show the dispatch
    await expect(page.locator('[data-testid="cmd-log"]'))
      .toContainText('RTH', { timeout: 2_000 })

    // Flight mode in header should update to RTH after ACK (~50-200ms simulated latency)
    await expect(page.locator('[data-testid="flight-mode"]'))
      .toHaveText('RTH', { timeout: 5_000 })
  })

  test('RTH command appears in mission timeline', async ({ page }) => {
    await page.click('[data-testid="cmd-rth"]')

    await expect(page.locator('[data-testid="event-list"]'))
      .toContainText('RTH', { timeout: 5_000 })
  })

  // ── HOLD ────────────────────────────────────────────────────────────────────

  test('HOLD button dispatches command and changes flight mode', async ({ page }) => {
    await waitForTelemetry(page)
    await page.click('[data-testid="cmd-hold"]')

    await expect(page.locator('[data-testid="cmd-log"]'))
      .toContainText('HOLD', { timeout: 2_000 })

    await expect(page.locator('[data-testid="flight-mode"]'))
      .toHaveText('HOLD', { timeout: 5_000 })
  })

  // ── EMERGENCY_LAND — two-step confirmation ──────────────────────────────────

  test('EMERGENCY_LAND requires confirmation dialog before executing', async ({ page }) => {
    await waitForTelemetry(page)
    // First click: arm the command (should NOT execute yet)
    await page.click('[data-testid="cmd-emrg"]')

    // Confirmation dialog must appear
    await expect(page.locator('[data-testid="emrg-confirm-dialog"]')).toBeVisible()

    // Flight mode should NOT have changed yet
    const mode = await page.locator('[data-testid="flight-mode"]').textContent()
    expect(mode).not.toBe('EMERGENCY_LAND')
  })

  test('EMERGENCY_LAND executes after two-step confirmation', async ({ page }) => {
    await waitForTelemetry(page)
    // Step 1: arm
    await page.click('[data-testid="cmd-emrg"]')
    await expect(page.locator('[data-testid="emrg-confirm-dialog"]')).toBeVisible()

    // Step 2: confirm
    await page.click('[data-testid="emrg-confirm-btn"]')

    // Dialog should dismiss
    await expect(page.locator('[data-testid="emrg-confirm-dialog"]')).not.toBeVisible({ timeout: 2_000 })

    // Command should appear in log
    await expect(page.locator('[data-testid="cmd-log"]'))
      .toContainText('EMERGENCY_LAND', { timeout: 3_000 })

    // Flight mode eventually reflects EMERGENCY_LAND after ACK
    await expect(page.locator('[data-testid="flight-mode"]'))
      .toHaveText('EMERGENCY_LAND', { timeout: 5_000 })
  })

  test('EMERGENCY_LAND confirm dialog auto-cancels after 3 seconds', async ({ page }) => {
    await page.click('[data-testid="cmd-emrg"]')
    await expect(page.locator('[data-testid="emrg-confirm-dialog"]')).toBeVisible()

    // Wait for auto-cancel (3s + 500ms buffer)
    await page.waitForTimeout(3_600)

    // Dialog should have dismissed
    await expect(page.locator('[data-testid="emrg-confirm-dialog"]')).not.toBeVisible()

    // Console should note the auto-cancel
    await expect(page.locator('[data-testid="cmd-log"]'))
      .toContainText('auto-cancelled', { timeout: 1_000 })
  })

  test('EMERGENCY_LAND can be cancelled via CANCEL button', async ({ page }) => {
    await waitForTelemetry(page)
    await page.click('[data-testid="cmd-emrg"]')
    await expect(page.locator('[data-testid="emrg-confirm-dialog"]')).toBeVisible()

    await page.click('[data-testid="emrg-cancel-btn"]')
    await expect(page.locator('[data-testid="emrg-confirm-dialog"]')).not.toBeVisible()

    // Flight mode unchanged
    await expect(page.locator('[data-testid="flight-mode"]'))
      .not.toHaveText('EMERGENCY_LAND')
  })

  // ── CLI terminal ─────────────────────────────────────────────────────────────

  test('operator can type and submit RTH via CLI', async ({ page }) => {
    const input = page.locator('[data-testid="cmd-input"]')
    await input.click()
    await input.fill('RTH')
    await input.press('Enter')

    await expect(page.locator('[data-testid="cmd-log"]'))
      .toContainText('> RTH', { timeout: 2_000 })
  })

  test('unknown CLI command produces clear error message', async ({ page }) => {
    const input = page.locator('[data-testid="cmd-input"]')
    await input.click()
    await input.fill('LAUNCH_MISSILES')
    await input.press('Enter')

    await expect(page.locator('[data-testid="cmd-log"]'))
      .toContainText('Unknown command', { timeout: 2_000 })
  })

  test('HELP command lists all available commands', async ({ page }) => {
    const input = page.locator('[data-testid="cmd-input"]')
    await input.click()
    await input.fill('HELP')
    await input.press('Enter')

    const log = page.locator('[data-testid="cmd-log"]')
    await expect(log).toContainText('RTH', { timeout: 2_000 })
    await expect(log).toContainText('HOLD')
    await expect(log).toContainText('EMERGENCY_LAND')
    await expect(log).toContainText('GOTO')
  })

  test('CLI history is navigable with arrow keys', async ({ page }) => {
    const input = page.locator('[data-testid="cmd-input"]')

    // Submit two commands
    await input.click()
    await input.fill('RTH')
    await input.press('Enter')
    await page.waitForTimeout(100)
    await input.fill('HOLD')
    await input.press('Enter')
    await page.waitForTimeout(100)

    // Arrow up should restore last command (HOLD)
    await input.press('ArrowUp')
    await expect(input).toHaveValue(/HOLD/)

    // Arrow up again should restore second-to-last (RTH)
    await input.press('ArrowUp')
    await expect(input).toHaveValue(/RTH/)
  })

  test('command log persists multiple commands in session', async ({ page }) => {
    const input = page.locator('[data-testid="cmd-input"]')

    await input.click()
    await input.fill('RTH')
    await input.press('Enter')
    await page.waitForTimeout(200)

    await input.fill('HOLD')
    await input.press('Enter')
    await page.waitForTimeout(200)

    // Both commands should be visible in the log
    const log = page.locator('[data-testid="cmd-log"]')
    await expect(log).toContainText('RTH')
    await expect(log).toContainText('HOLD')
  })

  test('STATUS command shows current drone state in log', async ({ page }) => {
    await waitForTelemetry(page)
    const input = page.locator('[data-testid="cmd-input"]')
    await input.click()
    await input.fill('STATUS')
    await input.press('Enter')

    const log = page.locator('[data-testid="cmd-log"]')
    await expect(log).toContainText('FALCON-1', { timeout: 2_000 })
    await expect(log).toContainText('BAT:')
  })
})
