// E2E verification: cart → cart drawer → checkout → mock pay → success →
// refresh survival → /orders history. Run with the Vite dev server on :5173.
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'

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
  // ── 1. Shop grid loads (dismiss the discount popup, as a shopper would) ────
  await page.goto(`${BASE}/shop`, { waitUntil: 'networkidle' })
  const popupClose = page.locator('button[aria-label="Close discount popup"]')
  if (await popupClose.isVisible().catch(() => false)) {
    await popupClose.click()
    await page.waitForTimeout(300)
  }
  const productCards = page.locator('[class*="group relative border"]')
  const cardCount = await productCards.count()
  step('shop grid renders product cards', cardCount > 0, `${cardCount} cards`)

  // ── 2. Add to cart from the grid ────────────────────────────────────────────
  const addToCart = page.getByRole('button', { name: /add to cart/i }).first()
  await addToCart.click()
  await page.waitForTimeout(200)
  const badge = page.locator('nav span.bg-red-600')
  step('cart badge shows 1 after add', (await badge.textContent())?.trim() === '1')

  // ── 3. Cart drawer opens from the navbar ───────────────────────────────────
  await page.locator('nav button[aria-label]').filter({ hasNotText: /sign|menu/i }).first().click()
  await page.waitForTimeout(400)
  const drawerTitle = page.getByText('Your Cart')
  step('cart drawer opens', await drawerTitle.isVisible())

  // ── 4. Checkout button navigates ───────────────────────────────────────────
  await page.getByRole('button', { name: 'Checkout' }).click()
  await page.waitForURL('**/checkout', { timeout: 8000 })
  step('checkout button navigates to /checkout', page.url().endsWith('/checkout'))

  // ── 5. Order summary reflects the cart ─────────────────────────────────────
  const summaryHasItem = await page.locator('img[alt]').nth(0).isVisible()
  step('order summary renders items', summaryHasItem)
  const payButton = page.getByRole('button', { name: /\$[\d,]+\.\d{2}/ })
  const payAmount = (await payButton.textContent())?.trim()
  step('pay button shows cart total', /\$/.test(payAmount ?? ''), payAmount)

  // ── 6. Fill delivery form (selectors from Checkout.jsx Field labels) ───────
  await page.getByLabel(/full name/i).fill('Amina Bello')
  await page.getByLabel(/email/i).fill('amina@example.com')
  await page.getByLabel(/phone/i).fill('+234 801 234 5678')
  await page.getByLabel(/^address/i).fill('12 Ozumba Mbadiwe Avenue')
  await page.getByLabel(/^city/i).fill('Lagos')
  await page.getByLabel(/^country/i).fill('Nigeria')
  step('delivery form accepts input', true)

  // ── 7. Payment method selection ─────────────────────────────────────────────
  await page.getByText('Bank transfer', { exact: false }).click()
  const selected = await page
    .locator('label:has-text("Bank transfer")')
    .evaluate((el) => el.className.includes('border-[#ec5800]'))
  step('bank transfer method selectable', selected)

  // ── 8. Pay → processing → success ───────────────────────────────────────────
  await payButton.click()
  const reference = await page
    .locator('span.font-mono')
    .filter({ hasText: /AGB-/ })
    .textContent({ timeout: 10000 })
  step('mock payment completes with AGB reference', /^AGB-/.test(reference ?? ''), reference)

  // ── 9. Refresh survival ─────────────────────────────────────────────────────
  await page.reload({ waitUntil: 'networkidle' })
  const refAfterReload = await page.locator('span.font-mono').filter({ hasText: /AGB-/ }).textContent()
  step('receipt survives refresh', refAfterReload === reference, refAfterReload)

  // ── 10. Order history lists the order ───────────────────────────────────────
  await page.getByRole('link', { name: /view my orders/i }).click()
  await page.waitForURL('**/orders')
  const orderCard = page.locator('article', { hasText: reference })
  await orderCard.waitFor({ state: 'visible' })
  step('/orders lists the new order', await orderCard.isVisible(), reference)

  // ── 11. Expand items, delivery, payment details ─────────────────────────────
  await orderCard.getByRole('button', { name: /view items/i }).click()
  const detail = await orderCard.locator('img[alt]').first().isVisible()
  step('order detail expands with items', detail)
  const addressShown = await orderCard.getByText(/Ozumba Mbadiwe/i).isVisible()
  step('order detail shows delivery address', addressShown)
  const bankShown = await orderCard.getByText(/bank transfer/i).isVisible()
  step('order detail shows payment method', bankShown)

  // ── 12. Empty-cart guard still works after successful flow ──────────────────
  await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: /continue shopping/i }).first().click()
  await page.waitForURL('**/shop')
  step('empty-cart guard redirects to /shop', page.url().endsWith('/shop'))
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
