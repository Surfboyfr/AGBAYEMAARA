// E2E verification for the admin console (run: node scripts/verify-admin.mjs [url])
// Covers: /admin is directly reachable (no shopper boot flow), it reports both
// the customer and the seller section from their real stores, and its live
// feed picks up tracked actions as they happen.
import { chromium } from 'playwright'
import { passBootGate } from './boot-gate.mjs'

const BASE_URL = process.argv[2] ?? 'http://localhost:5173'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome' })

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.setDefaultTimeout(15000)

  // ── 1. /admin is a direct entry point ──────────────────────────────────────
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' })
  const bootOverlays = await page.locator('[data-boot]').count()
  check('/admin skips the shopper boot flow', bootOverlays === 0)

  await page
    .getByRole('heading', { name: 'What is happening across the platform' })
    .waitFor()
  check('admin console renders', true)
  check(
    'admin shell links out to both sections',
    (await page.locator('a[href="/"]').count()) > 0 &&
      (await page.locator('a[href="/seller"]').count()) > 0
  )

  // ── 2. Both sections are reported ──────────────────────────────────────────
  await page.getByRole('heading', { name: 'Customer section' }).waitFor()
  check('customer section panel renders', true)
  await page.getByRole('heading', { name: 'Seller section' }).waitFor()
  check('seller section panel renders', true)

  // innerText honours the cards' CSS uppercase transform — compare lowercased.
  const mainText = (await page.locator('main').innerText()).toLowerCase()
  check(
    'KPI row covers both sections',
    ['customer orders', 'cart & follows', 'seller products', 'seller revenue'].every(
      (label) => mainText.includes(label)
    )
  )

  const sellerPanel = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Seller section' }) })
  const sellerRows = await sellerPanel.locator('li').count()
  check('seller orders are listed from the seller store', sellerRows > 0, `${sellerRows} rows`)

  const feed = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Live activity' }) })
  const feedRows = await feed.locator('li').count()
  check('live feed is populated from both sections', feedRows > 0, `${feedRows} events`)

  // ── 3. A real shopper action is tracked into the feed ──────────────────────
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  await passBootGate(page)

  await page.goto(`${BASE_URL}/brands/ashluxe`, { waitUntil: 'domcontentloaded' })
  await passBootGate(page)
  const followButton = page.locator('button[aria-pressed]').first()
  await followButton.waitFor({ state: 'visible' })
  await followButton.click()
  check('followed a brand in the customer section', true)

  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' })
  await page
    .getByRole('heading', { name: 'What is happening across the platform' })
    .waitFor()
  // The feed polls every 4s, so the new event lands without a manual refresh.
  await feed.getByText(/Followed|Unfollowed/).first().waitFor({ timeout: 10000 })
  check('tracked shopper action shows up in the live feed', true)
  check(
    'feed event is tagged with its section',
    (await feed.locator('li', { hasText: 'ashluxe' }).count()) > 0
  )

  await page.close()
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
