// E2E verification: "Become a seller" opens the vendor registration page
// (/seller/register) instead of the login page, the route is publicly
// reachable, and completing the form runs POST /auth/register (or login) +
// POST /seller/register and lands on the seller dashboard.
//
// The backend is mocked here (context.route) so no real vendor is created —
// run with the Vite dev server on :5173:  node scripts/verify-seller-register.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)

  // ── Mock the V1 backend: register + vendor onboarding succeed ────────────
  const apiCalls = []
  await context.route('**/api/v1/**', async (route) => {
    const req = route.request()
    const url = req.url()
    const body = req.postDataJSON?.() ?? null
    apiCalls.push({ method: req.method(), path: new URL(url).pathname, body })

    if (url.includes('/auth/register')) {
      return route.fulfill({
        json: {
          success: true,
          data: {
            token: 'e2e-vendor-token',
            user: { id: 'usr_e2e', displayName: body?.displayName, email: body?.email },
          },
        },
      })
    }
    if (url.includes('/auth/login')) {
      return route.fulfill({
        json: { success: true, data: { token: 'e2e-vendor-token', user: { id: 'usr_e2e' } } },
      })
    }
    if (url.includes('/seller/register')) {
      return route.fulfill({ json: { success: true, data: { id: 'vnd_e2e', ...body } } })
    }
    return route.fulfill({ json: { success: true, data: {} } })
  })

  // ── 1. Welcome page: both "Become a seller" links point at /seller/register ─
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  const splash = page.locator('[data-boot="splash"]')
  await splash.waitFor({ state: 'visible' })
  await splash.waitFor({ state: 'detached' })
  const welcome = page.locator('[data-welcome="page"]')
  await welcome.waitFor({ state: 'visible' })

  const heroLink = welcome.locator('main').getByRole('link', { name: /become a seller/i })
  const navLink = welcome.locator('nav').getByRole('link', { name: /become a seller/i })
  check('Welcome hero shows "Become a seller"', await heroLink.isVisible())
  check(
    'hero + navbar links point at /seller/register',
    (await heroLink.getAttribute('href')) === '/seller/register' &&
      (await navLink.getAttribute('href')) === '/seller/register',
    `hero=${await heroLink.getAttribute('href')}, nav=${await navLink.getAttribute('href')}`,
  )

  // ── 2. Clicking it opens the registration page, not the login page ────────
  await heroLink.click()
  await page.waitForURL('**/seller/register', { timeout: 10000 })
  check('clicking "Become a seller" lands on /seller/register', page.url().endsWith('/seller/register'))
  const registerHeading = await page
    .getByRole('heading', { name: 'Become a seller' })
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false)
  check('the registration page renders its heading', registerHeading)
  check(
    'the login page copy is NOT shown',
    (await page.getByText('Sign in to your seller account', { exact: false }).count()) === 0,
  )
  check(
    'the form asks for business details',
    (await page.getByLabel('Business name', { exact: true }).count()) === 1 &&
      (await page.getByLabel('Contact phone', { exact: true }).count()) === 1 &&
      (await page.getByLabel('What do you sell?', { exact: true }).count()) === 1,
  )

  // ── 3. Direct load with no token still shows the register page ───────────
  await context.clearCookies()
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`${BASE}/seller/register`, { waitUntil: 'networkidle' })
  await page.waitForURL('**/seller/register', { timeout: 10000 })
  check(
    'a tokenless direct load of /seller/register does not bounce to login',
    page.url().endsWith('/seller/register') &&
      (await page.getByRole('heading', { name: 'Become a seller' }).isVisible()),
    page.url(),
  )

  // ── 4. Native required fields + the page's own validation ─────────────────
  // An empty submit never reaches onSubmit (the browser stops it first), so
  // the form is filled with a too-short password to exercise the JS check.
  await page.getByLabel('Full name', { exact: true }).fill('E2E Test Vendor')
  await page.getByLabel('Email', { exact: true }).fill('e2e-vendor@example.com')
  await page.getByLabel('Password', { exact: true }).fill('short')
  await page.getByLabel('Business name', { exact: true }).fill('E2E Atelier')
  await page.getByLabel('Contact email', { exact: true }).fill('hello@e2e-atelier.example')
  await page.getByLabel('Contact phone', { exact: true }).fill('+234 802 345 6789')
  await page.getByLabel('Location', { exact: true }).fill('Lagos, Nigeria')
  await page
    .getByLabel('What do you sell?', { exact: true })
    .fill('Contemporary Yoruba silhouettes and ancestral textile design.')

  const callsBeforeValidation = apiCalls.length
  await page.getByRole('button', { name: 'Create seller account' }).click()
  const validation = await page
    .getByRole('alert')
    .textContent()
    .then((t) => t ?? '')
    .catch(() => '')
  check(
    'the form rejects a short password before any API call',
    /at least 8 characters/i.test(validation) && apiCalls.length === callsBeforeValidation,
    validation || 'no validation message',
  )

  // ── 5. Complete the form → auth + vendor onboarding → dashboard ───────────
  await page.getByLabel('Password', { exact: true }).fill('e2e-password-123')
  await page.getByRole('button', { name: 'Create seller account' }).click()
  await page.waitForURL('**/seller/dashboard', { timeout: 15000 })
  check('submitting the form lands on /seller/dashboard', page.url().endsWith('/seller/dashboard'))

  // The signup details must drive the portal — no mock defaults on screen.
  // The dashboard greeting uses the owner's first name only. Wait for the
  // heading to paint — waitForURL resolves before React commits the route.
  const greetedVendor = await page
    .getByRole('heading', { name: /^Welcome back, E2E$/ })
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false)
  check('dashboard greets the seller by the name from the signup form', greetedVendor)
  const businessOnDashboard = await page
    .getByText('E2E Atelier', { exact: false })
    .first()
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false)
  check(
    'dashboard shows the business name from the signup form',
    businessOnDashboard,
  )
  check(
    'the mock default seller name is gone',
    (await page.getByText('Adaeze', { exact: false }).count()) === 0,
  )

  const authCall = apiCalls.find((c) => c.path.endsWith('/auth/register'))
  check(
    'POST /auth/register was called with the account details',
    !!authCall && authCall.body?.role === 'buyer' && !!authCall.body?.displayName,
    authCall ? JSON.stringify(authCall.body) : 'not called',
  )
  const sellerCall = apiCalls.find((c) => c.path.endsWith('/seller/register'))
  check(
    'POST /seller/register was called with the business details',
    !!sellerCall &&
      !!sellerCall.body?.businessName &&
      !!sellerCall.body?.contactPhone &&
      !!sellerCall.body?.location,
    sellerCall ? JSON.stringify(sellerCall.body) : 'not called',
  )

  // ── 6. The login page still works and links back to registration ──────────
  await page.goto(`${BASE}/seller/login`, { waitUntil: 'networkidle' })
  check(
    'the seller login page still renders',
    await page.getByRole('button', { name: 'Sign In' }).isVisible(),
  )
  const toRegister = page.getByRole('link', { name: 'Become a seller' })
  check(
    'the login page links to registration',
    (await toRegister.getAttribute('href')) === '/seller/register',
    `href=${await toRegister.getAttribute('href')}`,
  )
} catch (err) {
  check('verification ran to completion', false, err.message)
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
