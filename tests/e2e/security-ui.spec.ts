/**
 * Security — UI/HTTP Layer
 *
 * Tests that the application enforces security controls visible to
 * a browser client: headers, CSP, framing protections, secret hygiene.
 *
 * These are the tests that catch the most common web security regressions
 * before a ZAP or Burp Suite scan confirms them.
 *
 * Applicable to real GCS systems: operator stations are high-value targets.
 * Even an "internal" web app must have basic header hygiene.
 */

import { test, expect } from '@playwright/test'
import { gotoDemo } from './helpers'

// ─── HTTP Response Headers ───────────────────────────────────────────────────

test.describe('Security Headers', () => {

  // basePath is /mission-control — a leading-slash path resolves from the host
  // origin, NOT from baseURL. Use full paths that include the basePath prefix so
  // Next.js actually serves the request and applies the security headers config.
  async function getHeaders(page: import('@playwright/test').Page, path = '/mission-control') {
    const response = await page.goto(path)
    if (!response) throw new Error(`No response for ${path}`)
    return response.headers()
  }

  test('X-Frame-Options is DENY', async ({ page }) => {
    const headers = await getHeaders(page)
    expect(headers['x-frame-options']).toBe('DENY')
  })

  test('X-Content-Type-Options is nosniff', async ({ page }) => {
    const headers = await getHeaders(page)
    expect(headers['x-content-type-options']).toBe('nosniff')
  })

  test('Referrer-Policy is set', async ({ page }) => {
    const headers = await getHeaders(page)
    expect(headers['referrer-policy']).toBeTruthy()
    expect(headers['referrer-policy']).toContain('origin')
  })

  test('Content-Security-Policy header is present and blocks framing', async ({ page }) => {
    const headers = await getHeaders(page)
    const csp = headers['content-security-policy']
    expect(csp).toBeTruthy()
    // frame-ancestors 'none' is the CSP equivalent of X-Frame-Options: DENY
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test('CSP restricts base URI to self', async ({ page }) => {
    const headers = await getHeaders(page)
    const csp = headers['content-security-policy']
    expect(csp).toContain("base-uri 'self'")
  })

  test('Permissions-Policy disables camera, microphone, geolocation', async ({ page }) => {
    const headers = await getHeaders(page)
    const policy = headers['permissions-policy']
    expect(policy).toBeTruthy()
    expect(policy).toContain('camera=()')
    expect(policy).toContain('microphone=()')
    expect(policy).toContain('geolocation=()')
  })

  test('security headers are present on /demo as well as /', async ({ page }) => {
    const headers = await getHeaders(page, '/mission-control/demo')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['content-security-policy']).toBeTruthy()
  })

  test('security headers are present on API routes', async ({ page }) => {
    const headers = await getHeaders(page, '/mission-control/api/commands')
    expect(headers['x-frame-options']).toBe('DENY')
  })
})

// ─── Secret / credential hygiene ────────────────────────────────────────────

test.describe('Secret Hygiene', () => {

  test('no JWT tokens visible in HTML page source', async ({ page }) => {
    await gotoDemo(page)
    const html = await page.content()

    // JWT pattern: three base64url segments separated by dots
    // A real service role key would match this — anon keys with real values also match
    // In demo/CI, all Supabase keys are placeholders so this should not match
    const jwtPattern = /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/
    expect(html).not.toMatch(jwtPattern)
  })

  test('no private key patterns visible in page source', async ({ page }) => {
    await page.goto('/')
    const html = await page.content()

    // Patterns that indicate private key material
    const privateKeyPatterns = [
      /sk-[A-Za-z0-9]{20,}/,                    // generic secret key format
      /-----BEGIN (RSA|EC|PRIVATE) KEY-----/,   // PEM private key
      /service_role/,                            // Supabase service role key label
    ]

    for (const pattern of privateKeyPatterns) {
      expect(html).not.toMatch(pattern)
    }
  })

  test('no GPS coordinates leak to browser console log', async ({ page }) => {
    const consoleLogs: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'log' || msg.type() === 'debug') {
        consoleLogs.push(msg.text())
      }
    })

    await gotoDemo(page)

    // Let the simulator run for 2 seconds
    await page.waitForTimeout(2_000)

    // GPS coordinate pattern: decimal degrees like 49.0097
    const gpsPattern = /\b4[89]\.\d{3,}/  // Paris CDG lat range

    const leakedCoords = consoleLogs.filter((l) => gpsPattern.test(l))
    expect(
      leakedCoords,
      `GPS coordinates found in console logs:\n${leakedCoords.join('\n')}`,
    ).toHaveLength(0)
  })

  test('NEXT_PUBLIC env vars in JS bundle contain no sensitive values', async ({ page }) => {
    await page.goto('/')

    // Intercept the main JS chunk and verify no credentials
    const scripts: string[] = []
    page.on('response', async (response) => {
      if (response.url().includes('/_next/static/chunks/') &&
          response.headers()['content-type']?.includes('javascript')) {
        try {
          const text = await response.text()
          scripts.push(text)
        } catch { /* already consumed */ }
      }
    })

    await page.goto('/mission-control/demo')
    await page.waitForTimeout(1_000)

    // Check each captured chunk
    for (const script of scripts) {
      // Private key indicators
      expect(script).not.toMatch(/service_role/)
      // High-entropy secret pattern (not a placeholder)
      expect(script).not.toMatch(/supabase\.co.*eyJ[A-Za-z0-9_-]{40,}/)
    }
  })
})

// ─── Client-side injection resistance ──────────────────────────────────────

test.describe('Client-Side Injection', () => {

  test('command input does not execute arbitrary code via CLI', async ({ page }) => {
    await gotoDemo(page)

    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // .first() — CommandConsole renders in both desktop and mobile layouts
    const input = page.locator('[data-testid="cmd-input"]').first()
    await input.click()
    // Attempt script injection via the CLI
    await input.fill('<SCRIPT>window.__injected=1</SCRIPT>')
    await input.press('Enter')

    // The input is uppercased and treated as a command string, not HTML
    await expect(page.locator('[data-testid="cmd-log"]').first())
      .toContainText('Unknown command', { timeout: 2_000 })

    // No injected global should exist
    const injected = await page.evaluate(() => (window as Window & { __injected?: number }).__injected)
    expect(injected).toBeUndefined()
  })
})
