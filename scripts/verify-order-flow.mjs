// End-to-end walkthrough of the checkout → order status flow (run: node scripts/verify-order-flow.mjs [url])
import { chromium } from 'playwright'
import { passBootGate } from './boot-gate.mjs'

const BASE_URL = process.argv[2] ?? 'http://localhost:5173'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

// Use the system Chrome (channel: 'chrome') so no Playwright browser download is needed.
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.setDefaultTimeout(15000)

// The boot splash + role gate run on every load; pass through as a shopper.
const gotoWithBoot = async (path, wait = 'networkidle') => {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: wait })
  await passBootGate(page)
}

try {
  // ── 1. Add a product to the cart from the shop home ───────────────────────
  await gotoWithBoot('/shop')

  // The discount popup auto-opens ~800ms after mount — wait for it, then close.
  const popupClose = page.getByRole('button', { name: 'Close discount popup' })
  await popupClose.waitFor({ state: 'visible', timeout: 5000 })
  await popupClose.click()
  await popupClose.waitFor({ state: 'detached' })

  const addToCartButtons = page.locator('button', { hasText: 'Add to Cart' })
  await addToCartButtons.first().click()

  // Cart does not auto-open — open it from the navbar.
  await page.getByRole('button', { name: 'Open cart' }).click()
  const drawerCount = page.locator('span.bg-red-600').first()
  await drawerCount.waitFor()
  check('cart badge shows 1 item after add', (await drawerCount.innerText()).trim() === '1')

  // ── 2. Checkout: fill the form, pay, and land on the status page ──────────
  await page.getByRole('button', { name: 'Checkout' }).click()
  await page.waitForURL('**/checkout')
  check('cart checkout navigates to /checkout', page.url().includes('/checkout'))

  const fill = (label, value) =>
    page
      .locator('label', { hasText: label })
      .first()
      .locator('input')
      .fill(value)

  await fill('Full name', 'Amina Bello')
  await fill('Email', 'amina@example.com')
  await fill('Phone', '+234 801 234 5678')
  await fill('Address', '12 Ozumba Mbadiwe Avenue')
  await fill('City', 'Lagos')
  await fill('Country', 'Nigeria')
  await page.locator('button[type=submit]').click()

  // Mock payment takes ~1.2s, then checkout navigates to /orders/:id
  await page.waitForURL(/\/orders\/[^/]+$/, { timeout: 20000 })
  const orderUrl = page.url()
  check('after payment we land on /orders/:orderId', true, orderUrl)

  // ── 3. Status page renders confirmation + stepper ─────────────────────────
  await page.getByRole('heading', { name: 'Order confirmed!' }).waitFor()
  check('status page shows confirmation header', true)

  const reference = orderUrl.split('/').pop()
  const steps = page.locator('ol.grid > li')
  await steps.first().waitFor() // ensure the stepper is mounted before counting
  const stepCount = await steps.count()
  check('stepper has 4 steps', stepCount === 4, `found ${stepCount}`)

  const stepLabel = (i) => steps.nth(i).locator('span').last().innerText()
  check('step 1 is Ordered', (await stepLabel(0)).trim() === 'Ordered')
  check('step 2 is In Progress', (await stepLabel(1)).trim() === 'In Progress')
  check('step 3 is Shipped', (await stepLabel(2)).trim() === 'Shipped')
  check('step 4 is Delivered', (await stepLabel(3)).trim() === 'Delivered')

  // Fresh order is on step 1 — active, showing the truck icon (lucide adds
  // `lucide-truck` as a class).
  check(
    'step 1 active with truck icon',
    (await steps.first().locator('svg.lucide-truck').count()) === 1,
  )

  // ── 4. Happy path: advance through the lifecycle ──────────────────────────
  const advance = page.getByRole('button', { name: 'Demo: advance status' })
  await advance.click()
  await page.getByRole('button', { name: 'Demo: fail fulfilment' }).waitFor()
  check('advance moves to In Progress (fail control appears)', true)

  // paid → … → delivered needs 5 advances total; keep clicking until the
  // control disappears (defensive against any dropped click).
  let clicks = 1
  for (let i = 0; i < 8; i += 1) {
    if ((await advance.count()) === 0) break
    await advance.click()
    clicks += 1
    await page.waitForTimeout(120)
  }
  console.log(`      (advance clicks used: ${clicks})`)
  await page.getByRole('button', { name: 'Demo: reset order' }).waitFor()
  check(
    'advance control disappears once delivered (reset appears)',
    (await page.getByRole('button', { name: 'Demo: advance status' }).count()) === 0,
  )

  // ── 5. Reset and exercise the failure branch ──────────────────────────────
  await page.getByRole('button', { name: 'Demo: reset order' }).click()
  await page.getByRole('heading', { name: 'Order confirmed!' }).waitFor()
  check('reset returns to a fresh confirmation', true)

  await page.getByRole('button', { name: 'Demo: advance status' }).click()
  await page.getByRole('button', { name: 'Demo: fail fulfilment' }).click()
  await page.getByRole('heading', { name: 'Fulfilment failed' }).waitFor()
  check('fail fulfilment shows the failure header', true)

  // Stepper should show a red stop (Ban) on the In Progress node + struck-through later steps
  check(
    'stopped step shows the Ban icon',
    (await page.locator('ol.grid > li svg.lucide-ban').count()) === 1,
  )
  const skipped = page.locator('ol.grid > li span.line-through')
  check(
    'later steps struck through after failure',
    (await skipped.count()) >= 2,
    `${await skipped.count()} struck through`,
  )

  await page.getByRole('button', { name: 'Demo: issue refund' }).click()
  await page
    .locator('div', { hasText: 'Refunded — the full amount has been returned' })
    .first()
    .waitFor()
  check('refund shows the refunded banner', true)
  check(
    'no demo controls after refund (only reset)',
    (await page.getByRole('button', { name: 'Demo: reset order' }).count()) === 1 &&
      (await page.getByRole('button', { name: 'Demo: fail fulfilment' }).count()) === 0,
  )

  // ── 6. Persistence: refresh keeps the state, /orders links to the page ────
  await page.reload({ waitUntil: 'networkidle' })
  await passBootGate(page) // boot gate runs on every load, refresh included
  await page.getByRole('heading', { name: 'Fulfilment failed' }).waitFor()
  check('failure state survives a refresh (localStorage)', true)

  await gotoWithBoot('/orders')
  const trackLink = page.locator(`a[href="/orders/${reference}"]`).first()
  await trackLink.waitFor({ state: 'visible' })
  check('orders list has a track link for the order', true)

  // Chip for the refunded order shows the right label. Asserted while still
  // on the list page — the status page has no <article> card.
  const chip = page.locator('article span.rounded-full', { hasText: 'Refunded' }).first()
  await chip.waitFor({ state: 'visible' })
  check('order card chip reads Refunded', true)

  await trackLink.click()
  await page.waitForURL(`**/orders/${reference}`)
  check('track link opens the status page', true)

  // ── 7. Shopping promo shows once per session ──────────────────────────────
  // Section 1 closed it on the first /shop visit; navigating back within the
  // same session must not re-open it (sessionStorage flag).
  await gotoWithBoot('/shop')
  await page.waitForTimeout(1500) // past the 800ms auto-open delay
  check(
    'promo does not reappear on a return visit in the same session',
    !(await popupClose.isVisible().catch(() => false)),
  )
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
