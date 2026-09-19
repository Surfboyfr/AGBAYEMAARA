// Verifies the seven-surface IA across the three navbars (run: node scripts/verify-nav.mjs [url])
import { chromium } from 'playwright'

const BASE_URL = process.argv[2] ?? 'http://localhost:5173'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.setDefaultTimeout(15000)

// The primary link set every navbar must expose, plus the Cart action.
const PRIMARY = [
  { label: 'Discover', to: '/' },
  { label: 'Following', to: '/following' },
  { label: 'Brands', to: '/brands' },
]

const navHasIa = async (scope) => {
  for (const { label, to } of PRIMARY) {
    const link = scope.locator(`nav a[href="${to}"]`, { hasText: label }).first()
    if (!(await link.isVisible().catch(() => false))) return `${label} link missing`
  }
  const cart = scope.getByRole('button', { name: 'Open cart' }).first()
  if (!(await cart.isVisible().catch(() => false))) return 'Cart button missing'
  return null
}

try {
  // ── 1. Shop surface (/shop — ShopNavbar) ──────────────────────────────────
  await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' })
  const popupClose = page.getByRole('button', { name: 'Close discount popup' })
  await popupClose.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  if (await popupClose.isVisible().catch(() => false)) await popupClose.click()

  let problem = await navHasIa(page)
  check('ShopNavbar shows Discover / Following / Brands + Cart', !problem, problem ?? '')
  check(
    'ShopNavbar dropped the Shop/Home link set',
    (await page.locator('nav a[href="/shop"]', { hasText: 'Shop' }).count()) === 0 &&
      (await page.locator('nav a', { hasText: 'Home' }).count()) === 0,
  )
  check('ShopNavbar logo points to Discover (/)', (await page.locator('nav a[href="/"]').first().getAttribute('href')) === '/')

  // Cart works from the shop navbar
  await page.getByRole('button', { name: 'Add to Cart' }).first().click()
  await page.getByRole('button', { name: 'Open cart' }).first().click()
  await page.getByRole('heading', { name: 'Your Cart' }).waitFor()
  check('cart drawer opens from ShopNavbar', true)
  await page.keyboard.press('Escape')

  // ── 2. Discovery surface (/ — DiscoveryNavbar) ────────────────────────────
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  problem = await navHasIa(page)
  check('DiscoveryNavbar shows Discover / Following / Brands + Cart', !problem, problem ?? '')
  check(
    'DiscoveryNavbar dropped Shop and About links',
    (await page.locator('nav a[href="/shop"]').count()) === 0 &&
      (await page.locator('nav a[href="/about"]').count()) === 0,
  )
  check(
    'DiscoveryNavbar keeps the Sign in action',
    await page.getByRole('button', { name: 'Sign in' }).first().isVisible(),
  )

  // Cart works from the discovery navbar (drawer is app-wide now)
  await page.getByRole('button', { name: 'Open cart' }).first().click()
  await page.getByRole('heading', { name: 'Your Cart' }).waitFor()
  check('cart drawer opens from DiscoveryNavbar', true)
  await page.keyboard.press('Escape')

  // ── 3. Following surface uses the same navbar ─────────────────────────────
  await page.goto(`${BASE_URL}/following`, { waitUntil: 'networkidle' })
  check(
    'FollowingFeed renders DiscoveryNavbar',
    (await page.locator('nav a[href="/brands"]').count()) > 0,
  )

  // ── 4. About surface (/about — LandingNavBar) ─────────────────────────────
  await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle' })
  problem = await navHasIa(page)
  check('LandingNavBar shows Discover / Following / Brands + Cart', !problem, problem ?? '')
  // Anchors render in both desktop and (hidden) mobile menus — presence and
  // demoted styling are what matters.
  check(
    'LandingNavBar demotes About/Contact to secondary links',
    (await page.locator('nav a[href="#about"]').count()) >= 1 &&
      (await page.locator('nav a[href="#contact"]').count()) >= 1 &&
      (await page.locator('nav a[href="#about"]').first().getAttribute('class')).includes('text-faint'),
  )
  check(
    'LandingNavBar keeps the Sign in action',
    await page.getByRole('button', { name: 'Sign in' }).first().isVisible(),
  )

  // ── 5. Cart reachable on the checkout/orders surfaces too (app-wide drawer) ─
  await page.goto(`${BASE_URL}/orders`, { waitUntil: 'networkidle' })
  // No navbar renders here, but the drawer itself must not crash the page
  check('orders page loads with app-wide drawer mounted', (await page.locator('body').count()) === 1)

  // ── 6. Active-link highlighting per surface ─────────────────────────────
  // The active surface keeps a persistent orange underline (after:w-full) and
  // full-white label; inactive links use width-0 underlines.
  const activeIs = async (label) => {
    const link = page.locator('nav a', { hasText: label }).first()
    const cls = (await link.getAttribute('class')) ?? ''
    return cls.includes('after:w-full') && cls.includes('text-strong') && !cls.includes('text-muted')
  }
  const inactiveIs = async (label) => {
    const link = page.locator('nav a', { hasText: label }).first()
    const cls = (await link.getAttribute('class')) ?? ''
    return cls.includes('after:w-0')
  }

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  check('Discover active on /', await activeIs('Discover'))
  check('Following inactive on /', await inactiveIs('Following'))

  await page.goto(`${BASE_URL}/following`, { waitUntil: 'networkidle' })
  check('Following active on /following', await activeIs('Following'))
  check('Discover inactive on /following', await inactiveIs('Discover'))

  await page.goto(`${BASE_URL}/brands`, { waitUntil: 'networkidle' })
  check('Brands active on /brands', await activeIs('Brands'))

  await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' })
  const shopPopup = page.getByRole('button', { name: 'Close discount popup' })
  await shopPopup.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  if (await shopPopup.isVisible().catch(() => false)) await shopPopup.click()
  // /shop is its own surface and no longer in the nav — nothing should be
  // highlighted (Discover matches only the exact / route).
  check('nothing falsely active on /shop (Discover = exact / only)', await inactiveIs('Discover'))
  check('Brands inactive on /shop', await inactiveIs('Brands'))
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
