// Verifies the Welcome navbar auth actions and Get Started stay in sync
// (run: node scripts/verify-navbar-auth-sync.mjs [url]).
// Covers: signing up OR logging in from the Welcome navbar's AuthModal marks
// the boot gate as cleared, so Get Started goes straight through (currency
// pick first on a fresh browser, then the app) instead of re-opening the
// sign-up step — while a first-timer with no session still meets that step.
import { chromium } from 'playwright'

const BASE_URL = process.argv[2] ?? 'http://localhost:5173'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const FEED_HEADING = 'Discover African fashion, story first'
const EMAIL = `navsync-${Date.now()}@example.com`
const PASSWORD = 'password123'

const browser = await chromium.launch({ channel: 'chrome' })

// The AuthModal never unmounts — it fades out via an `opacity-0` class, so
// "closed" means that class is present (not detachment).
const modalClosed = (page) =>
  page
    .waitForFunction(
      () => {
        const el = document.querySelector('div.fixed.inset-0.z-50')
        return !el || el.className.includes('opacity-0')
      },
      null,
      { timeout: 10000 }
    )
    .then(() => true)
    .catch(() => false)

// Splash → Welcome page (the order on every full page load).
const passSplash = async (page) => {
  const splash = page.locator('[data-boot="splash"]')
  await splash.waitFor({ state: 'visible' })
  await splash.waitFor({ state: 'detached' })
  await page.locator('[data-welcome="page"]').waitFor({ state: 'visible' })
}

// After Get Started: the one-time currency pick may appear first — choose
// USD when it does (same choice the rest of the suite makes).
const passCurrencyStep = async (page) => {
  const currency = page.locator('[data-boot="currency"]')
  const needsCurrency = await currency
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false)
  if (needsCurrency) {
    await page.getByRole('button', { name: /USD — US Dollar/ }).click()
    await currency.waitFor({ state: 'detached', timeout: 5000 })
  }
}

// True when the boot sign-up step shows up (it must not, for a session).
const signUpStepAppears = (page) =>
  page
    .locator('[data-boot="signup"]')
    .waitFor({ state: 'visible', timeout: 4000 })
    .then(() => true)
    .catch(() => false)

try {
  // ── 1. Sign up from the navbar, then Get Started ─────────────────────────
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.setDefaultTimeout(15000)
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  await passSplash(page)

  const nav = page.locator('nav')
  await nav.getByRole('button', { name: 'Sign up' }).click()
  await page.getByRole('heading', { name: 'Create account' }).waitFor()
  await page.locator('#auth-name').fill('Nav Sync Test')
  await page.locator('#auth-email').fill(EMAIL)
  await page.locator('#auth-password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Create Account' }).click()
  check('navbar sign-up submits and closes the modal', await modalClosed(page))
  check(
    'navbar swaps to the signed-in greeting after sign-up',
    await nav.getByRole('button', { name: 'Log out' }).isVisible()
  )

  await page.locator('[data-welcome="get-started"]').click()
  await passCurrencyStep(page)
  check(
    'Get Started does NOT re-open the sign-up step after navbar sign-up',
    !(await signUpStepAppears(page))
  )
  await page
    .getByRole('heading', { name: FEED_HEADING })
    .waitFor({ state: 'visible', timeout: 15000 })
  check('signed-up visitor reaches the DiscoveryFeed', true)
  await page.close()

  // ── 2. Log in from the navbar, then Get Started ──────────────────────────
  const loginPage = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  loginPage.setDefaultTimeout(15000)
  await loginPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  await passSplash(loginPage)

  const loginNav = loginPage.locator('nav')
  await loginNav.getByRole('button', { name: 'Log in' }).click()
  await loginPage.getByRole('heading', { name: 'Welcome back' }).waitFor()
  await loginPage.locator('#auth-email').fill(EMAIL)
  await loginPage.locator('#auth-password').fill(PASSWORD)
  // Scoped to the form's submit — the modal tab carries the same label.
  await loginPage.locator('form button[type="submit"]').click()
  check('navbar log-in submits and closes the modal', await modalClosed(loginPage))
  check(
    'navbar swaps to the signed-in greeting after log-in',
    await loginNav.getByRole('button', { name: 'Log out' }).isVisible()
  )

  await loginPage.locator('[data-welcome="get-started"]').click()
  await passCurrencyStep(loginPage)
  check(
    'Get Started does NOT re-open the sign-up step after navbar log-in',
    !(await signUpStepAppears(loginPage))
  )
  await loginPage
    .getByRole('heading', { name: FEED_HEADING })
    .waitFor({ state: 'visible', timeout: 15000 })
  check('logged-in visitor reaches the DiscoveryFeed', true)
  await loginPage.close()

  // ── 3. First-timer (no session): the sign-up step still stands ───────────
  const fresh = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  fresh.setDefaultTimeout(15000)
  await fresh.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  await passSplash(fresh)

  await fresh.locator('[data-welcome="get-started"]').click()
  await passCurrencyStep(fresh)
  check('first-timer still meets the sign-up step after Get Started', await signUpStepAppears(fresh))
  await fresh.close()
} catch (error) {
  check('verification run completed without errors', false, error.message)
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
