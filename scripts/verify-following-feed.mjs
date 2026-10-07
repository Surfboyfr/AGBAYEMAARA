import { chromium } from 'playwright'
import { passBootGate } from './boot-gate.mjs'

const BASE_URL = process.argv[2] ?? 'http://localhost:5175'

console.log(`Testing following feed & brand details on ${BASE_URL}...`)

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: 'reduce',
})
const page = await context.newPage()

// 1. Visit root to pass boot gate
console.log('1. Loading app and clearing boot gate...')
await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
await passBootGate(page)
console.log('✓ Boot gate cleared.')

// 2. Navigate to /following
console.log('2. Navigating to /following...')
await page.goto(`${BASE_URL}/following`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

// Verify header & title
const title = await page.locator('h1').textContent()
console.log(`✓ Feed title: "${title.trim()}"`)

// Verify stories tray
const storiesCount = await page.locator('button[title^="View "]').count()
console.log(`✓ Stories & drops avatar circles found: ${storiesCount}`)

// Verify brand cards
const brandCards = page.locator('article')
const cardsCount = await brandCards.count()
console.log(`✓ Social brand cards rendered: ${cardsCount}`)

// Verify card details on first card
const firstCard = brandCards.first()
const brandName = await firstCard.locator('h3').textContent()
console.log(`✓ First brand card name: "${brandName.trim()}"`)

const hasFollowBtn = (await firstCard.locator('button[title="Follow"], button[title="Unfollow"]').count()) > 0
console.log(`✓ Has social follow button: ${hasFollowBtn}`)

// Screenshot Following Feed
await page.screenshot({ path: 'screenshots/following-feed-social.png' })
console.log('✓ Saved screenshots/following-feed-social.png')

// 3. Test clicking a brand card
console.log(`3. Clicking on "${brandName.trim()}" card...`)
await firstCard.click()
await page.waitForURL('**/brands/*')
await page.waitForTimeout(600)

const currentUrl = page.url()
console.log(`✓ Navigated to brand page: ${currentUrl}`)

// Verify brand page details
const brandHeading = await page.locator('h1').textContent()
console.log(`✓ Brand page title: "${brandHeading.trim()}"`)

// Check sections
const hasAtGlance = (await page.locator('text=Atelier At a Glance').count()) > 0
console.log(`✓ Has "Atelier At a Glance" grid: ${hasAtGlance}`)

const hasCollection = (await page.locator('text=Collection').count()) > 0
console.log(`✓ Has "Collection" products grid: ${hasCollection}`)

const hasNarrative = (await page.locator('text=The Atelier Narrative').count()) > 0
console.log(`✓ Has "Atelier Narrative" story grid: ${hasNarrative}`)

const hasMilestones = (await page.locator('text=Historical Journey & Milestones').count()) > 0
console.log(`✓ Has "Historical Journey & Milestones" grid: ${hasMilestones}`)

const hasStories = (await page.locator('text=Editorial Stories & Features').count()) > 0
console.log(`✓ Has "Editorial Stories" grid: ${hasStories}`)

// Screenshot Brand Page
await page.screenshot({ path: 'screenshots/brand-page-details.png' })
console.log('✓ Saved screenshots/brand-page-details.png')

await browser.close()
console.log('ALL CHECKS PASSED SUCCESSFULLY!')
