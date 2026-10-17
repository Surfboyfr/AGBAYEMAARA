// E2E verification: seller portal routes, real API login, dashboard, inventory
// CRUD + filters, products, orders, profile editing, logout, mobile nav and
// the untouched customer boot flow. Run with the Vite dev server on :5173.
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'

// Real vendor credentials (the demo vendor from docs/). Override via env for
// runs against a different backend instance.
const SELLER_EMAIL = process.env.SELLER_TEST_EMAIL ?? 'Adewaleadebayo630@gmail.com'
const SELLER_PASSWORD = process.env.SELLER_TEST_PASSWORD ?? 'goodboy101#'

// Sign in through the real /seller/login form (POST /auth/login + vendor
// profile probe) and wait for the dashboard.
const signInAsSeller = async (page) => {
  await page.goto(`${BASE}/seller/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('Email', { exact: true }).fill(SELLER_EMAIL)
  await page.getByLabel('Password', { exact: true }).fill(SELLER_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('**/seller/dashboard')
}

const results = []
const step = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
page.setDefaultTimeout(15000)

const errors = []
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
})

try {
  // ── 1. Direct load of /seller/login (bypasses the customer boot flow) ─────
  await page.goto(`${BASE}/seller/login`, { waitUntil: 'networkidle' })
  const bootOverlays = await page.locator('[data-boot]').count()
  step('seller login bypasses the customer boot flow', bootOverlays === 0)
  step('login form renders', await page.getByLabel('Email', { exact: true }).isVisible())

  // ── 2. Real sign-in → dashboard ───────────────────────────────────────────
  await signInAsSeller(page)
  step('sign-in routes to /seller/dashboard', page.url().endsWith('/seller/dashboard'))

  await page.getByRole('heading', { name: /Welcome back, Adewale/ }).waitFor()
  step('dashboard welcome greets the signed-in seller (real profile, not mock)', true)

  // The stat cards render behind the skeleton until hydration settles (the
  // real catalogue/stats take a few seconds to land) — wait for them.
  const cards = ['Total Products', 'Total Orders', 'Total Revenue', 'Low Stock Products']
  for (const label of cards) {
    const cardVisible = await page
      .getByText(label, { exact: true })
      .waitFor({ state: 'visible', timeout: 15000 })
      .then(() => true)
      .catch(() => false)
    step(`stat card: ${label}`, cardVisible)
  }
  const recentOrdersVisible = await page
    .getByRole('heading', { name: 'Recent Orders' })
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true)
    .catch(() => false)
  step('recent orders section renders', recentOrdersVisible)
  const recentProductsVisible = await page
    .getByRole('heading', { name: 'Recent Products' })
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true)
    .catch(() => false)
  step('recent products section renders', recentProductsVisible)

  // ── 3. Deep links + refresh on every nested seller route ──────────────────
  const surfaces = [
    ['/seller/dashboard', /Welcome back, Adewale/],
    ['/seller/inventory', /^Inventory$/],
    ['/seller/products', /^Products$/],
    ['/seller/orders', /^Orders$/],
    ['/seller/profile', /^Profile$/],
  ]
  for (const [path, heading] of surfaces) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: heading }).first().waitFor()
    step(`direct load + refresh works: ${path}`, true)
  }

  // ── 4. Inventory: navigation, search, filters ─────────────────────────────
  await page.goto(`${BASE}/seller/dashboard`, { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Inventory' }).click()
  await page.waitForURL('**/seller/inventory')
  step('sidebar link navigates to inventory', page.url().endsWith('/seller/inventory'))
  // Wait for the table to mount before counting rows (client-side route change).
  await page.locator('tbody tr').first().waitFor()

  const allRows = page.locator('tbody tr')
  const initialCount = await allRows.count()
  step('inventory table renders rows', initialCount > 0, `${initialCount} rows`)

  // Search term / filters are matched against the vendor's REAL catalogue
  // (hydrated from GET /seller/products), not the retired mock seed.
  await page.getByLabel('Search inventory').fill('kaftan')
  const searchCount = await allRows.count()
  const searchNames = await page.locator('tbody tr td:nth-child(2)').allInnerTexts()
  step(
    'search narrows the table',
    searchCount > 0 && searchCount < initialCount && searchNames.every((n) => /kaftan/i.test(n)),
    `${searchCount} rows`
  )

  await page.getByLabel('Search inventory').fill('')
  await page.getByLabel('Filter by category').selectOption('Clothes')
  const categoryNames = await page.locator('tbody tr td:nth-child(3)').allInnerTexts()
  step(
    'category filter applies',
    categoryNames.length > 0 && categoryNames.every((c) => c.trim() === 'Clothes'),
    `${categoryNames.length} rows`
  )

  await page.getByLabel('Filter by category').selectOption('All')
  await page.getByLabel('Filter by stock status').selectOption('Low Stock')
  const statusNames = await page.locator('tbody tr td:nth-child(6)').allInnerTexts()
  step(
    'stock status filter applies',
    statusNames.length > 0 && statusNames.every((s) => s.trim() === 'Low Stock'),
    `${statusNames.length} rows`
  )

  await page.getByRole('button', { name: 'Clear' }).click()
  step('clear filters restores all rows', (await allRows.count()) === initialCount)

  // ── 5. Inventory: add → edit → delete ─────────────────────────────────────
  await page.getByRole('button', { name: 'Add Product' }).first().click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  await dialog.getByLabel('Product name').fill('Verification Bomber')
  await dialog.getByLabel('Category').selectOption('Men')
  // The price label carries no currency symbol — locally added products
  // adopt the real catalogue's currency (NGN for this vendor).
  await dialog.getByLabel('Price', { exact: true }).fill('55.50')
  await dialog.getByLabel('Stock').fill('5')
  await dialog.getByLabel('Description').fill('Added by the seller portal verification run.')
  await dialog.getByRole('button', { name: 'Add Product' }).click()
  const newRow = page.locator('tbody tr', { hasText: 'Verification Bomber' })
  await newRow.waitFor()
  step('add product inserts a row', true)

  await newRow.getByRole('button', { name: /Edit Verification Bomber/ }).click()
  const editDialog = page.getByRole('dialog')
  await editDialog.getByLabel('Price', { exact: true }).fill('77.77')
  await editDialog.getByRole('button', { name: 'Save Changes' }).click()
  // Currency-agnostic match: the row renders in the catalogue's own money.
  await page.locator('tbody tr', { hasText: '77.77' }).waitFor()
  step('edit product updates the row', true)

  await page
    .locator('tbody tr', { hasText: 'Verification Bomber' })
    .getByRole('button', { name: /Delete Verification Bomber/ })
    .click()
  const alert = page.getByRole('alertdialog')
  await alert.waitFor()
  step('delete confirmation modal opens', await alert.isVisible())
  await alert.getByRole('button', { name: 'Delete' }).click()
  step(
    'delete removes the row',
    (await page.locator('tbody tr', { hasText: 'Verification Bomber' }).count()) === 0
  )

  // ── 6. Products page + orders page ────────────────────────────────────────
  await page.getByRole('link', { name: 'Products' }).click()
  await page.waitForURL('**/seller/products')
  await page.getByRole('heading', { name: 'Products', exact: true }).waitFor()
  // The products screen renders cards (ProductGrid), not table rows.
  const productCards = page.locator('article')
  await productCards.first().waitFor()
  const productCount = await productCards.count()
  step('products page lists the catalog', productCount > 0, `${productCount} cards`)

  await page.getByRole('link', { name: 'Orders' }).click()
  await page.waitForURL('**/seller/orders')
  // The backend's GET /seller/orders currently 404s (ORDER_NOT_FOUND) for
  // this vendor, and the retired mock rows (AGB-*) must never masquerade as
  // real orders — the portal shows the honest empty state instead.
  const ordersEmpty = await page
    .getByText('No orders yet', { exact: false })
    .first()
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false)
  step('orders surface shows the honest empty state (no mock rows)', ordersEmpty)
  step(
    'no retired mock order IDs leak into the portal',
    (await page.getByText(/AGB-20/).count()) === 0,
  )

  await page.getByRole('button', { name: 'Pending', exact: true }).click()
  step(
    'status filter switches without error on an empty list',
    (await page.locator('tbody tr').count()) === 0 &&
      (await page.getByText('No orders yet', { exact: false }).first().isVisible()),
  )
  await page.getByRole('button', { name: 'Clear' }).click()

  // ── 7. Profile: view + edit ───────────────────────────────────────────────
  await page.getByRole('link', { name: 'Profile' }).click()
  await page.waitForURL('**/seller/profile')
  step(
    'profile card renders business info',
    await page.getByText('Omol').first().isVisible(),
  )

  await page.getByRole('button', { name: 'Edit Profile' }).click()
  await page.getByLabel('Location').fill('Accra, Ghana')
  await page.getByRole('button', { name: 'Save Changes' }).click()
  await page.getByText(/Profile updated/).waitFor()
  step('profile edit saves and confirms', await page.getByText('Accra, Ghana').isVisible())

  // ── 8. Logout ─────────────────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Logout' }).click()
  await page.waitForURL('**/seller/login')
  step('logout returns to /seller/login', page.url().endsWith('/seller/login'))

  // ── 9. Mobile: drawer navigation ──────────────────────────────────────────
  // New page = fresh storage = no session token, so sign in first (the
  // /seller/* route guard bounces tokenless loads to the login screen).
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await signInAsSeller(mobile)
  // The URL changes as soon as navigation fires; wait for the dashboard to
  // paint before asserting on its controls.
  const menuButton = mobile.getByRole('button', { name: 'Open menu' })
  const menuVisible = await menuButton
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true)
    .catch(() => false)
  step('mobile shows the menu button', menuVisible)
  await menuButton.click()
  await mobile.getByRole('link', { name: 'Orders' }).waitFor()
  step('mobile drawer opens', await mobile.getByRole('link', { name: 'Orders' }).isVisible())
  await mobile.getByRole('link', { name: 'Orders' }).click()
  await mobile.waitForURL('**/seller/orders')
  step('mobile drawer navigates to orders', mobile.url().endsWith('/seller/orders'))
  await mobile.close()

  // ── 10. Customer-facing boot flow still intact ────────────────────────────
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.locator('[data-boot="splash"]').waitFor()
  step('customer route still shows the boot splash', true)
  await page.locator('[data-welcome="get-started"]').waitFor({ timeout: 8000 })
  step('splash hands over to the Welcome page', true)
  await page.locator('[data-welcome="get-started"]').click()
  await page.locator('[data-boot="signup"]').waitFor({ timeout: 8000 })
  step('Get Started continues into sign-up for a first-timer', true)
  step(
    'removed choice screen stays gone',
    (await page.locator('[data-boot="gate"]').count()) === 0
  )
} catch (err) {
  step('unexpected failure', false, String(err).slice(0, 300))
} finally {
  if (errors.length > 0) {
    console.log('\nConsole/page errors:')
    for (const e of [...new Set(errors)].slice(0, 8)) console.log('  ', e.slice(0, 220))
  }
  const passed = results.filter((r) => r.ok).length
  console.log(`\n${passed}/${results.length} steps passed`)
  await browser.close()
  process.exit(passed === results.length ? 0 : 1)
}
