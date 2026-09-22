// Verifies every brand profile carries at least one readable brand story
// (run: node scripts/verify-brand-stories.mjs [url])
//
// The brand list is parsed from src/data/brands.js, so adding a brand keeps
// this script honest without edits: a new brand without a story fails here.
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { passBootGate } from './boot-gate.mjs'

const BASE_URL = process.argv[2] ?? 'http://localhost:5173'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

// ── Source-level checks ───────────────────────────────────────────────────────
const brandsSource = readFileSync(
  new URL('../src/data/brands.js', import.meta.url),
  'utf8'
)
const contentSource = readFileSync(
  new URL('../src/data/content.js', import.meta.url),
  'utf8'
)

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const brandSlugs = [...brandsSource.matchAll(/name: '([^']+)'/g)]
  .map((match) => slugify(match[1]))
check(
  'brand list parsed from src/data/brands.js',
  brandSlugs.length >= 8,
  `${brandSlugs.length} brands: ${brandSlugs.join(', ')}`
)

// Every brandSlug referenced by a content unit must belong to a real brand —
// a typo here silently hides content from the brand's profile.
const referencedSlugs = [...contentSource.matchAll(/brandSlug: '([^']+)'/g)].map(
  (match) => match[1]
)
const unknownSlugs = referencedSlugs.filter(
  (slug) => !brandSlugs.includes(slug)
)
check(
  'every content unit references a real brand slug',
  unknownSlugs.length === 0,
  unknownSlugs.length ? `unknown: ${unknownSlugs.join(', ')}` : 'all valid'
)

// ── UI checks: one readable story per brand profile ───────────────────────────
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.setDefaultTimeout(15000)

try {
  for (const slug of brandSlugs) {
    await page.goto(`${BASE_URL}/brands/${slug}`, { waitUntil: 'networkidle' })
    await passBootGate(page)

    // The Stories tab only renders when the brand has a qualifying story
    // unit (type 'story' with a storyBody) — its absence is the bug class
    // this script exists to catch.
    const storiesHeading = page.getByRole('heading', {
      name: 'Stories',
      exact: true,
    })
    const storiesVisible = await storiesHeading
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false)
    check(
      `${slug}: profile shows a Stories section`,
      storiesVisible
    )
    if (!storiesVisible) continue

    const storyLinks = page.locator(`a[href^="/brands/${slug}/story/"]`)
    const storyCount = await storyLinks.count()
    check(
      `${slug}: at least one story is linked`,
      storyCount >= 1,
      `${storyCount} story link(s)`
    )

    // Open the newest story and confirm it renders end to end.
    await storyLinks.first().click()
    await page.waitForURL(`**/brands/${slug}/story/**`)
    const storyTitle = page.locator('article h1')
    await storyTitle.waitFor({ state: 'visible' })
    check(
      `${slug}: story page renders with a title`,
      (await storyTitle.innerText()).trim().length > 0
    )

    // The desire → buy bridge: every story names a real product.
    const shopLink = page.locator('a[href^="/shop/product/"]').first()
    const bridgeVisible = await shopLink
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false)
    check(
      `${slug}: story links to a shopable product`,
      bridgeVisible,
      bridgeVisible ? await shopLink.getAttribute('href') : 'no product link'
    )
  }
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
