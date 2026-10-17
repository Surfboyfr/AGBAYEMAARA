// Temporary probe: verify the Discovery feed shop restructure.
import { chromium } from 'playwright'
import { passBootGate } from './scripts/boot-gate.mjs'

const BASE = 'http://localhost:5173'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.setDefaultTimeout(15000)

const gotoFeed = async () => {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await passBootGate(page)
}

// Wait for the smooth scroll to settle on the shop section.
const settleOnShop = async () => {
  for (let i = 0; i < 30; i++) {
    const top = await page
      .locator('#shop')
      .evaluate((el) => el.getBoundingClientRect().top)
    if (Math.abs(top - 96) < 40) return top
    await page.waitForTimeout(150)
  }
  return page.locator('#shop').evaluate((el) => Math.round(el.getBoundingClientRect().top))
}

const cardCount = () => page.locator('#shop > div.grid > div').count()

try {
  await gotoFeed()

  // ── 1. Layout: categories on top, grid at the very bottom ─────────────────
  const order = await page.evaluate(() => {
    const main = document.querySelector('main')
    const kids = [...main.children]
    const idx = (el) => kids.indexOf(el)
    return {
      total: kids.length,
      navIdx: idx(main.querySelector('nav[aria-label="Shop categories"]')),
      headerIdx: idx(main.querySelector('header')),
      feedIdx: idx(main.querySelector('div.space-y-5')),
      journeyIdx: idx(
        main.querySelector('section[aria-label^="The Àgbáyémáarà user journey"]'),
      ),
      shopIdx: idx(document.getElementById('shop')),
      firstIsNav: kids[0] === main.querySelector('nav[aria-label="Shop categories"]'),
      lastIsShop: kids[kids.length - 1] === document.getElementById('shop'),
    }
  })
  check('the categories navbar is the first thing in the feed', order.firstIsNav, `index ${order.navIdx}`)
  check('the shop grid is the last block in the feed', order.lastIsShop, `index ${order.shopIdx} of ${order.total}`)
  check(
    'order: categories → header → feed → journey → shop',
    order.navIdx === 0 &&
      order.headerIdx > order.navIdx &&
      order.feedIdx > order.headerIdx &&
      order.journeyIdx > order.feedIdx &&
      order.shopIdx > order.journeyIdx,
    `nav=${order.navIdx} header=${order.headerIdx} feed=${order.feedIdx} journey=${order.journeyIdx} shop=${order.shopIdx}`,
  )

  const belowFold = await page
    .locator('#shop')
    .evaluate((el) => el.getBoundingClientRect().top > window.innerHeight)
  check('the shop grid starts below the fold', belowFold)

  const navVisibleAtTop = await page
    .locator('nav[aria-label="Shop categories"]')
    .isVisible()
  check('the categories navbar is visible at the top', navVisibleAtTop)

  // ── 2. Clicking a category up top filters + scrolls to the bottom ─────────
  await page.getByRole('button', { name: 'Shoes', exact: true }).click()
  const pressed = await page
    .getByRole('button', { name: 'Shoes', exact: true })
    .getAttribute('aria-pressed')
  check('the clicked category becomes active', pressed === 'true', `aria-pressed=${pressed}`)

  const top = await settleOnShop()
  check('the page scrolls to the shop section at the bottom', Math.abs(top - 96) < 40, `section top ${top}px (scroll-mt 96px)`)

  const shopInView = await page
    .locator('#shop')
    .evaluate((el) => {
      const r = el.getBoundingClientRect()
      return r.top < window.innerHeight && r.bottom > 0
    })
  check('the shop section is in the viewport after the click', shopInView)

  const shoesCards = await cardCount()
  const shoesMore = await page.locator('[data-shop="show-more"]').count()
  check('the grid is filtered to Shoes (3 rows + Show more)', shoesCards === 9 && shoesMore === 1, `${shoesCards} cards, show-more=${shoesMore}`)

  // ── 3. Show more expands; switching category resets to three rows ─────────
  await page.locator('[data-shop="show-more"]').click()
  const expandedCards = await cardCount()
  check('Show more reveals the rest of the category', expandedCards > shoesCards, `${shoesCards} → ${expandedCards}`)

  await page.getByRole('button', { name: 'Hats', exact: true }).click()
  await settleOnShop()
  const hatsCards = await cardCount()
  const hatsMore = await page.locator('[data-shop="show-more"]').count()
  check('switching category resets the grid (Hats: 1 card, no Show more)', hatsCards === 1 && hatsMore === 0, `${hatsCards} cards, show-more=${hatsMore}`)

  // ── 4. Back to "all" and the feed above is untouched ──────────────────────
  await page.getByRole('button', { name: /all/i }).first().click()
  await settleOnShop()
  const allCards = await cardCount()
  const allMore = await page.locator('[data-shop="show-more"]').count()
  check('All shows three rows behind Show more', allCards === 9 && allMore === 1, `${allCards} cards, show-more=${allMore}`)

  const feedCards = await page.locator('div.space-y-5 [data-feed-card], div.space-y-5 article, div.space-y-5 a').count()
  check('the feed above still renders cards', feedCards > 0, `${feedCards} feed links/cards`)

  const hero = await page.locator('main header h1').isVisible()
  check('the feed masthead still renders', hero)
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
