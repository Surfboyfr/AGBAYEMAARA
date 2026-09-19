// Captures the discovery feed in both themes (run: node scripts/screenshot-themes.mjs [url])
// Outputs screenshots/discovery-{dark,light}.png (+ hover states).
import { chromium } from 'playwright'
import { passBootGate } from './boot-gate.mjs'

const BASE_URL = process.argv[2] ?? 'http://localhost:5173'
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

// The boot splash + role gate run on every load; pass through as a shopper.
const captureTheme = async (theme) => {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await passBootGate(page)
  await page.evaluate((t) => localStorage.setItem('agbayemaara.theme', t), theme)
  await page.reload({ waitUntil: 'networkidle' })
  await passBootGate(page)
  await page.locator('main article').first().waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `screenshots/discovery-${theme}.png`, fullPage: true })

  await page.locator('main article').nth(1).hover()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `screenshots/discovery-${theme}-hover.png` })
  console.log(`captured ${theme}`)
}

await captureTheme('dark')
await captureTheme('light')
await browser.close()
console.log('Screenshots saved to screenshots/')
