// Temporary probe: verify the Discovery page search bar + results.
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

try {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await passBootGate(page)
  await page.locator('nav[aria-label="Shop categories"]').waitFor({ state: 'visible' })

  const searchInput = page.locator('main input[type="search"]')
  const categoriesNav = page.locator('nav[aria-label="Shop categories"]')

  // ── 1. Search bar sits above the categories ───────────────────────────────
  const barCount = await searchInput.count()
  check('a search bar renders on the discover page', barCount === 1, `${barCount} found`)

  const order = await page.evaluate(() => {
    const main = document.querySelector('main')
    const kids = [...main.children]
    const input = main.querySelector('input[type="search"]')
    // Walk up to the input's top-level sibling within main
    let top = input
    while (top.parentElement !== main) top = top.parentElement
    const nav = main.querySelector('nav[aria-label="Shop categories"]')
    return { inputIdx: kids.indexOf(top), navIdx: kids.indexOf(nav) }
  })
  check(
    'the search bar is above the categories',
    order.inputIdx !== -1 && order.inputIdx < order.navIdx,
    `search idx ${order.inputIdx}, categories idx ${order.navIdx}`,
  )

  const placeholder = await searchInput.getAttribute('placeholder')
  check('the bar has a search placeholder', !!placeholder, placeholder)

  // ── 2. Typing a keyword shows results below, feed hidden ──────────────────
  await searchInput.fill('wig')
  await page.waitForTimeout(200)
  const resultsSection = page.locator('section[aria-label="Search results"]')
  check('results appear below when a keyword is typed', await resultsSection.isVisible())

  const heading = await resultsSection.locator('h2').innerText()
  check('results heading quotes the keyword', /wig/i.test(heading), heading)

  const resultCards = await resultsSection.locator('div.grid > div').count()
  check('result cards render for "wig"', resultCards >= 5, `${resultCards} cards`)

  // Every result card should relate to the keyword (name or description)
  const names = await resultsSection.locator('h3').allInnerTexts()
  const allWig = names.length > 0 && names.every((n) => /wig/i.test(n))
  check('every result matches the keyword', allWig, names.slice(0, 3).join(' | '))

  // Feed (masthead, journey, shop grid) is hidden while searching
  const feedHidden =
    (await page.locator('main header h1').count()) === 0 &&
    (await page.locator('#shop').count()) === 0
  check('the feed/journey/shop grid are hidden while searching', feedHidden)

  const navStillVisible = await categoriesNav.isVisible()
  check('the categories stay visible while searching', navStillVisible)

  // ── 3. Category pill scopes the results without scrolling ─────────────────
  await page.getByRole('button', { name: 'Bags', exact: true }).click()
  await page.waitForTimeout(300)
  const bagResults = page.locator('section[aria-label="Search results"] div.grid > div')
  const bagCards = await bagResults.count()
  const bagNames = await page.locator('section[aria-label="Search results"] h3').allInnerTexts()
  const allBags = bagCards === 0 || bagNames.every((n) => /bag|tote|clutch|crossbody|saddle|briefcase/i.test(n))
  check('category pill narrows the search results (Bags × wig → empty or bag-only)', allBags, `${bagCards} cards: ${bagNames.slice(0, 2).join(' | ')}`)
  check('the page did not scroll to #shop (no shop grid while searching)', (await page.locator('#shop').count()) === 0)

  // A broad category search that matches: Bags + "leather"
  await searchInput.fill('leather')
  await page.waitForTimeout(200)
  const leatherCards = await page.locator('section[aria-label="Search results"] div.grid > div').count()
  check('Bags × "leather" returns bag results', leatherCards >= 1, `${leatherCards} cards`)

  // Back to All
  await page.getByRole('button', { name: 'All', exact: true }).first().click()
  await page.waitForTimeout(200)
  const allLeather = await page.locator('section[aria-label="Search results"] div.grid > div').count()
  check('All × "leather" returns at least as many results', allLeather >= leatherCards, `${allLeather} cards`)

  // ── 4. No-match empty state ───────────────────────────────────────────────
  await searchInput.fill('zzzznope')
  await page.waitForTimeout(200)
  const emptyTitle = await page
    .locator('section[aria-label="Search results"]')
    .innerText()
  check('no-match shows the empty state copy', /No products match/i.test(emptyTitle))

  // ── 5. Clear button restores the feed ─────────────────────────────────────
  await page.locator('main button[aria-label="Clear search"]').click()
  await page.waitForTimeout(300)
  const feedBack =
    (await searchInput.inputValue()) === '' &&
    (await page.locator('main header h1').isVisible()) &&
    (await page.locator('#shop').count()) === 1 &&
    (await page.locator('section[aria-label="Search results"]').count()) === 0
  check('clearing the search restores the full feed page', feedBack)

  // ── 6. Product card in results links to the detail page ───────────────────
  await searchInput.fill('kaftan')
  await page.waitForTimeout(200)
  await page.locator('section[aria-label="Search results"] div.grid > div').first().click()
  await page.waitForTimeout(500)
  const onDetail = /\/shop\/product\//.test(page.url())
  check('clicking a result opens the product detail page', onDetail, page.url())

  await page.screenshot({ path: 'screenshots/discover-search-results.png', fullPage: false })
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
