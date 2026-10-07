// Verifies the boot flow (run: node scripts/verify-boot.mjs [url])
// Covers: the splash runs on EVERY page load — first visit, refresh, and a
// brand-new session all show the loading screen — the Welcome page follows
// the splash on every visit, the old shopper/brand choice screen never
// appears, and first-timers still pass a sign-up step (after Get Started)
// before the app mounts (returning visitors go straight through).
import { chromium } from 'playwright'
import { completeSignUp } from './boot-gate.mjs'

// True when the boot flow is currently showing the first-visit sign-up form.
const signUpVisible = (page) =>
  page
    .locator('[data-boot="signup"]')
    .waitFor({ state: 'visible', timeout: 2500 })
    .then(() => true)
    .catch(() => false)

// True when the boot flow is currently showing the currency picker.
const currencyVisible = (page) =>
  page
    .locator('[data-boot="currency"]')
    .waitFor({ state: 'visible', timeout: 2500 })
    .then(() => true)
    .catch(() => false)

// The removed choice screen — it must never mount again.
const gateCount = (page) => page.locator('[data-boot="gate"]').count()

const BASE_URL = process.argv[2] ?? 'http://localhost:5174'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome' })

try {
  // ── 1. First visit: splash → currency → sign-up → discovery ──────────────
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.setDefaultTimeout(15000)

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })

  const splash = page.locator('[data-boot="splash"]')
  await splash.waitFor({ state: 'visible' })
  check('splash shows on first load', true)

  const splashBg = await splash.evaluate(
    (el) => getComputedStyle(el).backgroundColor
  )
  check('splash is a white screen', splashBg === 'rgb(255, 255, 255)', splashBg)

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
  check('no choice screen behind the splash', (await gateCount(page)) === 0)

  // Splash → Welcome: the page that follows the loading screen, reached
  // with no choice screen, currency pick, or sign-up step ahead of it.
  const welcome = page.locator('[data-welcome="page"]')
  await welcome.waitFor({ state: 'visible' })
  check('Welcome page follows the splash', true)
  check('no choice screen in between', (await gateCount(page)) === 0)
  check(
    'no sign-up step runs before the Welcome page',
    (await page.locator('[data-boot="signup"]').count()) === 0
  )
  check(
    'no currency step runs before the Welcome page',
    (await page.locator('[data-boot="currency"]').count()) === 0
  )
  check('Welcome navbar is the only nav', (await page.locator('nav').count()) === 1)

  // Get Started → the boot steps: sign-up for a first-timer (the shopper
  // currency is persisted by CurrencyProvider on mount, so no currency step
  // blocks a first visit either).
  await page.locator('[data-welcome="get-started"]').click()
  const signup = page.locator('[data-boot="signup"]')
  await signup.waitFor({ state: 'visible' })
  check(
    'sign-up follows Get Started with no choice screen in between',
    (await gateCount(page)) === 0
  )
  check(
    'no currency step blocks the first visit',
    (await page.locator('[data-boot="currency"]').count()) === 0
  )
  check('app stays unmounted behind the sign-up step', await page.evaluate(() => document.querySelector('nav') === null))
  check(
    'shopper currency is stored for the visit',
    (await page.evaluate(() => localStorage.getItem('agbayemaara.currency'))) === 'USD'
  )

  // Sign-up is mandatory: submitting an incomplete form must not proceed.
  await page.locator('#boot-name').fill('Ada Test')
  await page.locator('#boot-email').fill('ada@example.com')
  await page.locator('#boot-password').fill('short')
  await page.getByRole('button', { name: 'Continue' }).click()
  check(
    'sign-up rejects short passwords',
    (await page.getByRole('alert').count()) === 1
  )

  await completeSignUp(page)
  await page.waitForURL(`${BASE_URL}/`)
  check('shopper sign-up lands on the discovery feed', true)
  await page.locator('nav a[href="/following"]').first().waitFor()
  check('discovery navbar mounts after shopper sign-up', true)
  check('choice screen never appears during boot', (await gateCount(page)) === 0)
  const storedProfile = await page.evaluate(() =>
    localStorage.getItem('agbayemaara.user')
  )
  check(
    'sign-up profile is stored for the visit',
    storedProfile?.includes('ada@example.com') ?? false
  )

  // ── 2. Refresh: the splash returns, the first-visit steps do not ─────────
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('[data-boot="splash"]').waitFor({ state: 'visible' })
  check('refresh shows the splash again', true)
  await page.locator('[data-boot="splash"]').waitFor({ state: 'detached' })
  check('refresh never shows the choice screen', (await gateCount(page)) === 0)
  check(
    'refresh skips the currency step for a returning visitor',
    !(await currencyVisible(page))
  )
  check(
    'refresh skips the sign-up form for a returning visitor',
    !(await signUpVisible(page))
  )

  // The Welcome page shows on every visit, returning visitors included —
  // Get Started is what lets them through to the app.
  await welcome.waitFor({ state: 'visible' })
  check('Welcome page shows on refresh too', true)
  await page.locator('[data-welcome="get-started"]').click()
  await page.locator('nav a[href="/following"]').first().waitFor()
  check('app mounts after Get Started on refresh', true)
  const keptProfile = await page.evaluate(() =>
    localStorage.getItem('agbayemaara.user')
  )
  check(
    'stored profile survives the refresh untouched',
    keptProfile?.includes('ada@example.com') ?? false
  )
  await page.close()

  // ── 3. Fresh browser context (brand owner stored from before) ────────────
  const page2 = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page2.setDefaultTimeout(15000)
  // The choice screen used to record this; without it the stored role is what
  // still routes brand owners to their hub.
  await page2.addInitScript(() => {
    try {
      localStorage.setItem('agbayemaara.role', 'brand')
    } catch {
      // Storage unavailable — the test falls back to the shopper path.
    }
  })

  await page2.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  await page2.locator('[data-boot="splash"]').waitFor({ state: 'visible' })
  check('brand-new session shows the splash', true)

  // Brand path: splash → Welcome, then Get Started into the brand sign-up —
  // with no choice screen to click through at any point, and no currency
  // step (brand owners don't shop in a chosen currency).
  const brandWelcome = page2.locator('[data-welcome="page"]')
  await brandWelcome.waitFor({ state: 'visible' })
  check('brand boot shows the Welcome page after the splash', true)
  await page2.locator('[data-welcome="get-started"]').click()
  const brandSignup = page2.locator('[data-boot="signup"]')
  await brandSignup.waitFor({ state: 'visible' })
  check(
    'brand sign-up follows Get Started with no choice screen',
    (await gateCount(page2)) === 0
  )
  check(
    'brand sign-up uses the brand heading',
    (await brandSignup.innerText()).includes('Create your brand account')
  )
  await completeSignUp(page2)
  await page2.waitForURL('**/brand-owner')
  check('brand sign-up routes to the brand-owner hub', true)

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

  // Refresh on the hub: the splash runs again, the stored role keeps the
  // brand route, and no choice screen stands in the way.
  await page2.reload({ waitUntil: 'domcontentloaded' })
  await page2.locator('[data-boot="splash"]').waitFor({ state: 'visible' })
  await page2.locator('[data-boot="splash"]').waitFor({ state: 'detached' })
  check('refresh on /brand-owner never shows the choice screen', (await gateCount(page2)) === 0)
  check(
    'sign-up stays skipped across routes and refreshes',
    !(await signUpVisible(page2))
  )
  // Welcome shows on every visit; Get Started lets the returning brand owner
  // straight through to the hub (their stored role keeps the brand route).
  await page2.locator('[data-welcome="get-started"]').waitFor({ state: 'visible' })
  await page2.locator('[data-welcome="get-started"]').click()
  await page2.waitForURL('**/brand-owner')
  await page2.locator('main').waitFor()
  check('app remounts on the brand-owner route after the splash', true)
  await page2.close()
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
