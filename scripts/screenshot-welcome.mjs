import { chromium } from 'playwright'

const BASE_URL = process.argv[2] ?? 'http://localhost:5175'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } })

await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })

// Wait for splash to detach
const splash = page.locator('[data-boot="splash"]')
await splash.waitFor({ state: 'visible' }).catch(() => {})
await splash.waitFor({ state: 'detached', timeout: 15000 })

const welcome = page.locator('[data-welcome="page"]')
await welcome.waitFor({ state: 'visible' })

// Check "Become a seller" button exists and links to /seller
const sellerBtn = page.getByRole('link', { name: 'Become a seller' }).first()
console.log('Become a seller button visible:', await sellerBtn.isVisible())
console.log('Become a seller href:', await sellerBtn.getAttribute('href'))

// Check marquee exists
const marquee = page.locator('[aria-label="Featured African Brands Marquee"]')
console.log('Brand Marquee visible:', await marquee.isVisible())

await page.screenshot({ path: 'screenshots/welcome-page-seller-marquee.png', fullPage: true })
console.log('Saved screenshots/welcome-page-seller-marquee.png')

// Also test clicking "Become a seller"
await sellerBtn.click()
await page.waitForURL('**/seller/**')
console.log('Navigated to seller URL:', page.url())

await browser.close()
console.log('Verification finished!')
