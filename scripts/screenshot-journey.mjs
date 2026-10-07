// One-off: capture the user journey section for visual review (node scripts/screenshot-journey.mjs [url])
import { chromium } from 'playwright'
import { passBootGate } from './boot-gate.mjs'

const BASE_URL = process.argv[2] ?? 'http://localhost:5174'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  reducedMotion: 'reduce',
})
await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
// Splash → Welcome → Get Started → sign-up (first visit) before the feed
// that carries the journey section.
await passBootGate(page)
const section = page.locator(
  'section[aria-label="The Àgbáyémáarà user journey, step by step"]'
)
await section.scrollIntoViewIfNeeded()
await page.waitForTimeout(400)
await section.screenshot({ path: 'screenshots/journey-section.png' })
console.log('saved screenshots/journey-section.png')
await browser.close()
