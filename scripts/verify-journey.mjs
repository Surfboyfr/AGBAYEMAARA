// Smoke test for the user journey marquee (run: node scripts/verify-journey.mjs [url])
// Verifies the section renders below the discovery feed, all steps are present,
// and the deep links point at the right surfaces. Reduced motion is emulated so
// the marquee holds still for interaction (the app supports prefers-reduced-motion).
import { chromium } from 'playwright'

const BASE_URL = process.argv[2] ?? 'http://localhost:5174'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  reducedMotion: 'reduce',
})
page.setDefaultTimeout(15000)

const SECTION = 'section[aria-label="The Àgbáyémáarà user journey, step by step"]'

try {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

  // ── 1. Section renders below the discovery feed ───────────────────────────
  const section = page.locator(SECTION)
  await section.waitFor({ state: 'visible' })
  check('journey section renders on discovery feed', true)

  // It must sit below the feed grid inside <main>
  const belowFeed = await section.evaluate((el) => {
    const main = el.closest('main')
    const grid = main?.querySelector('.grid')
    if (!main || !grid) return false
    return (
      main.contains(el) &&
      grid.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
    )
  })
  check('section sits below the feed grid', belowFeed)

  // ── 2. All 9 steps present with correct deep links ─────────────────────────
  const EXPECTED = [
    { title: 'Discover unknown brands', href: '/' },
    { title: 'Read the story', href: '/brands/lisa-folawiyo/story/c1' },
    { title: 'Explore the brand', href: '/brands/ashluxe' },
    { title: 'Follow the brand', href: '/brands/ashluxe' },
    { title: 'Return later', href: '/following' },
    { title: 'See a new drop', href: '/' },
    { title: 'You buy', href: '/shop' },
    { title: 'Àgbáyémáarà coordinates fulfilment', href: '/orders' },
    { title: 'Receive it — then discover more', href: '/' },
  ]

  const cards = section.locator('a')
  const uniqueLinks = await cards.evaluateAll((links) => {
    const seen = new Map()
    for (const a of links) {
      const title = a.querySelector('h3')?.textContent?.trim()
      if (title && !seen.has(title)) seen.set(title, a.getAttribute('href'))
    }
    return Object.fromEntries(seen)
  })

  for (const { title, href } of EXPECTED) {
    check(
      `"${title}" links to ${href}`,
      uniqueLinks[title] === href,
      uniqueLinks[title] ? `got ${uniqueLinks[title]}` : 'missing',
    )
  }

  // ── 3. Second copy is hidden from accessibility tooling ────────────────────
  const hiddenCount = await section.locator('[aria-hidden="true"] a').count()
  const visibleCount = await section.locator('a:not([aria-hidden] a)').count()
  check(
    'duplicate marquee copy hidden from a11y tree',
    hiddenCount >= 9 && visibleCount === 9,
    `${visibleCount} visible / ${hiddenCount} hidden`,
  )

  // ── 4. Deep links navigate (story step → brand story page) ─────────────────
  await section.locator('a[href="/brands/lisa-folawiyo/story/c1"]').first().click()
  await page.waitForURL('**/brands/lisa-folawiyo/story/c1')
  check('story deep-link navigates to the story page', true)

  // ── 4b. Shop pill in the feed header navigates to /shop ────────────────────
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  const shopPill = page.locator('main header a[href="/shop"]')
  check('shop pill renders in the feed header', await shopPill.isVisible())
  await shopPill.click()
  await page.waitForURL('**/shop')
  check('shop pill navigates to /shop', true)

  // ── 5. "See a new drop" scrolls to and pulses the newest drop card ─────────
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await section.locator('a').filter({ hasText: 'See a new drop' }).first().click()
  await page
    .locator('[data-feed-card="drop"].journey-focus-pulse')
    .waitFor({ state: 'attached', timeout: 5000 })
  check('drop deep-link highlights the newest drop card', true)

  // Smooth scrolling takes a moment — poll until the card settles in view.
  let dropCardInViewport = false
  for (let i = 0; i < 20 && !dropCardInViewport; i += 1) {
    await page.waitForTimeout(150)
    dropCardInViewport = await page
      .locator('[data-feed-card="drop"]')
      .first()
      .evaluate((el) => {
        const rect = el.getBoundingClientRect()
        return rect.top >= 0 && rect.bottom <= window.innerHeight
      })
  }
  check('drop card is scrolled into view', dropCardInViewport)
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
