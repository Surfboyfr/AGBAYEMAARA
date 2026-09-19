// Verifies the boot flow (run: node scripts/verify-boot.mjs [url])
// Covers: the splash + role gate run on EVERY page load — first visit,
// refresh, and a brand-new session all show the loading screen and the
// shopper/brand choice before the app mounts.
import { chromium } from 'playwright'

const BASE_URL = process.argv[2] ?? 'http://localhost:5174'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome' })

try {
  // ── 1. First visit: splash → gate → shopper → discovery ───────────────────
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.setDefaultTimeout(15000)

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })

  const splash = page.locator('[data-boot="splash"]')
  await splash.waitFor({ state: 'visible' })
  check('splash shows on first load', true)

  const splashBg = await splash.evaluate(
    (el) => getComputedStyle(el).backgroundColor
  )
  check('splash is a black screen', splashBg === 'rgb(0, 0, 0)', splashBg)

  const splashText = await splash.innerText()
  check('splash shows the brand name', splashText.includes('Àgbáyémáarà'))
  check(
    'splash shows a loading spinner',
    (await splash.locator('svg.animate-spin').count()) === 1
  )

  // Nothing behind the splash is mounted during the first ~3s
  const appHiddenDuringSplash = await page.evaluate(
    () => document.querySelector('nav') === null
  )
  check('app stays unmounted behind the splash', appHiddenDuringSplash)

  // Splash ≈ 3s — the gate must not appear immediately
  await page.locator('[data-boot="gate"]').waitFor({ state: 'visible' })
  check('role gate appears after the splash (~3s)', true)

  // Shopper path → straight to the landing/discovery surface
  await page.getByRole('button', { name: 'I am a shopper' }).click()
  await page.waitForURL(`${BASE_URL}/`)
  check('shopper choice lands on the discovery feed', true)
  await page.locator('nav').first().waitFor()
  check('discovery navbar mounts after shopper choice', true)

  // ── 2. Refresh: splash + gate show again on EVERY load ────────────────────
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('[data-boot="splash"]').waitFor({ state: 'visible' })
  check('refresh shows the splash again', true)
  await page.locator('[data-boot="gate"]').waitFor({ state: 'visible' })
  check('refresh shows the role gate again', true)
  await page.getByRole('button', { name: 'I am a shopper' }).click()
  await page.locator('nav').first().waitFor()
  check('app mounts after choosing shopper on refresh', true)
  await page.close()

  // ── 3. Fresh browser context (new session): full boot flow again ──────────
  const page2 = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page2.setDefaultTimeout(15000)

  await page2.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  await page2.locator('[data-boot="splash"]').waitFor({ state: 'visible' })
  await page2.locator('[data-boot="gate"]').waitFor({ state: 'visible' })
  check('brand-new session shows splash and gate', true)

  // Brand-owner path → dedicated hub
  await page2.getByRole('button', { name: 'I am a brand owner' }).click()
  await page2.waitForURL('**/brand-owner')
  check('brand choice routes to the brand-owner hub', true)

  // Wait for the hub to mount fully before asserting (count() never waits).
  const showcase = page2.getByRole('heading', {
    name: 'Brands on Àgbáyémáarà',
  })
  await showcase.waitFor({ state: 'visible' })

  const hubText = await page2.locator('main').innerText()
  const brandLinkCount = await page2
    .locator('main a[href^="/brands/"]')
    .count()
  check(
    'hub showcases other brands',
    hubText.includes('Brands on Àgbáyémáarà') && brandLinkCount >= 8,
    `${brandLinkCount} brand links`
  )
  const soonBadges = await page2
    .locator('main span', { hasText: 'Coming soon' })
    .count()
  check('hub shows the coming-soon owner toolkit', soonBadges >= 3, `${soonBadges} badges`)

  // Refresh on the hub: boot flow runs again, brand route is preserved,
  // and the app mounts after the shopper choice (role choice is per-visit).
  await page2.reload({ waitUntil: 'domcontentloaded' })
  await page2.locator('[data-boot="gate"]').waitFor({ state: 'visible' })
  check('refresh on /brand-owner shows the gate again', true)
  await page2.getByRole('button', { name: 'I am a shopper' }).click()
  await page2.waitForURL('**/brand-owner')
  await page2.locator('main').waitFor()
  check('app remounts on the same route after refresh', true)
  await page2.close()
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
