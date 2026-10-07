// Verifies the entry order (run: node scripts/verify-welcome.mjs [url])
// Covers: every load runs the loading splash → the Welcome page (nothing
// ahead of it), the Welcome navbar exposes Log in / Sign up (each opening
// the AuthModal in the right mode), Get Started is centred on the page, and
// it leads to the DiscoveryFeed — through the one-time sign-up step for a
// first-timer, straight through for a returning visitor. Also checks the
// legacy /welcome URL rejoins the flow and /about still loads directly, the
// "Become a seller" button reaches the seller login page (/seller/login),
// the page renders on a white background with ink text, and the brand
// marquee at the bottom of the page shows the brands sliding.
import { chromium } from 'playwright'
import { completeSignUp } from './boot-gate.mjs'

const BASE_URL = process.argv[2] ?? 'http://localhost:5173'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const FEED_HEADING = 'Discover African fashion, story first'

const browser = await chromium.launch({ channel: 'chrome' })

// The AuthModal never unmounts — it fades out via an `opacity-0` class on its
// overlay, so "closed" means that class is present (not detachment).
const modalClosed = (page) =>
  page
    .waitForFunction(
      () => {
        const el = document.querySelector('div.fixed.inset-0.z-50')
        return !el || el.className.includes('opacity-0')
      },
      null,
      { timeout: 5000 },
    )
    .then(() => true)
    .catch(() => false)

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.setDefaultTimeout(15000)

  // ── 1. Loading splash first, then the Welcome page ───────────────────────
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })

  const splash = page.locator('[data-boot="splash"]')
  await splash.waitFor({ state: 'visible' })
  check('loading splash shows first', true)
  await splash.waitFor({ state: 'detached' })

  const welcome = page.locator('[data-welcome="page"]')
  await welcome.waitFor({ state: 'visible' })
  check('Welcome page is the next page after the splash', true)
  check(
    'no sign-up step runs before the Welcome page',
    (await page.locator('[data-boot="signup"]').count()) === 0,
  )
  check(
    'no currency step runs before the Welcome page',
    (await page.locator('[data-boot="currency"]').count()) === 0,
  )
  check('the Welcome navbar is the only nav', (await page.locator('nav').count()) === 1)

  // ── 2. Basic information about the website ───────────────────────────────
  const text = await page.locator('main').innerText()
  check('names the website', text.includes('Àgbáyémáarà'))
  check('says what the site is', text.includes('fashion') && text.includes('African'))
  check('shows the three feature highlights', (await page.locator('main ul > li').count()) === 3)

  // ── 3. Navbar auth buttons open the AuthModal in the right mode ──────────
  const nav = page.locator('nav')
  const login = nav.getByRole('button', { name: 'Log in' })
  const signUp = nav.getByRole('button', { name: 'Sign up' })
  check('navbar shows a Log in button', await login.isVisible())
  check('navbar shows a Sign up button', await signUp.isVisible())

  await login.click()
  check(
    'Log in opens the modal in sign-in mode',
    await page.getByRole('heading', { name: 'Welcome back' }).isVisible(),
  )

  // The mode is driven by the navbar, but the in-modal tabs keep working.
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
  check(
    'modal tabs still switch modes in place',
    await page.getByRole('heading', { name: 'Create account' }).isVisible(),
  )
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  check(
    'modal tabs switch back to sign-in',
    await page.getByRole('heading', { name: 'Welcome back' }).isVisible(),
  )

  await page.keyboard.press('Escape')
  check('auth modal closes', await modalClosed(page))

  await signUp.click()
  check(
    'Sign up opens the modal in sign-up mode',
    await page.getByRole('heading', { name: 'Create account' }).isVisible(),
  )
  await page.keyboard.press('Escape')
  check('auth modal closes again', await modalClosed(page))

  // ── 4. Get Started sits in the centre of the page ────────────────────────
  const getStarted = page.locator('[data-welcome="get-started"]')
  check('Get Started button renders', await getStarted.isVisible())

  const box = await getStarted.boundingBox()
  const { width, height } = page.viewportSize()
  const hDelta = Math.abs(box.x + box.width / 2 - width / 2)
  const vDelta = Math.abs(box.y + box.height / 2 - height / 2)
  check('Get Started is horizontally centred', hDelta <= 2, `${hDelta.toFixed(1)}px off centre`)
  check(
    'Get Started sits near the vertical centre',
    vDelta <= height * 0.2,
    `${vDelta.toFixed(1)}px (${((vDelta / height) * 100).toFixed(1)}%) off centre`,
  )

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  check('no horizontal overflow on desktop', overflow <= 0, `${overflow}px overflow`)

  // Centred on mobile too — the button must not drift into a corner, and the
  // two auth buttons must still fit the narrow navbar.
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mobile.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  const mobileStarted = mobile.locator('[data-welcome="get-started"]')
  await mobileStarted.waitFor({ state: 'visible' })
  const mBox = await mobileStarted.boundingBox()
  const mDelta = Math.abs(mBox.x + mBox.width / 2 - 390 / 2)
  check('Get Started stays centred on mobile', mDelta <= 2, `${mDelta.toFixed(1)}px off centre`)
  check(
    'navbar auth buttons fit the mobile navbar',
    (await mobile.locator('nav').getByRole('button', { name: 'Log in' }).isVisible()) &&
      (await mobile.locator('nav').getByRole('button', { name: 'Sign up' }).isVisible()),
  )
  const mOverflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  check('no horizontal overflow on mobile', mOverflow <= 0, `${mOverflow}px overflow`)
  await mobile.close()

  // ── 5. Get Started leads to the DiscoveryFeed ────────────────────────────
  // First-timer (this context has no stored profile): the one-time sign-up
  // step stands between the Welcome page and the feed.
  await getStarted.click()
  const signup = page.locator('[data-boot="signup"]')
  await signup.waitFor({ state: 'visible' })
  check('first-timer meets the sign-up step after Get Started', true)
  await completeSignUp(page)
  await page
    .getByRole('heading', { name: FEED_HEADING })
    .waitFor({ state: 'visible', timeout: 10000 })
  check('Get Started leads to the DiscoveryFeed', true)
  const storedProfile = await page.evaluate(() => localStorage.getItem('agbayemaara.user'))
  check('sign-up profile is stored for the visit', storedProfile?.includes('ada@example.com') ?? false)

  // ── 6. Returning visitor: splash → Welcome → feed, sign-up skipped ──────
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('[data-boot="splash"]').waitFor({ state: 'visible' })
  await page.locator('[data-boot="splash"]').waitFor({ state: 'detached' })
  await welcome.waitFor({ state: 'visible' })
  check('Welcome page shows on every visit', true)
  check(
    'returning visitor gets no sign-up step after the splash',
    (await page.locator('[data-boot="signup"]').count()) === 0,
  )
  await page.locator('[data-welcome="get-started"]').click()
  await page.getByRole('heading', { name: FEED_HEADING }).waitFor({ state: 'visible' })
  check('returning visitor reaches the DiscoveryFeed straight from Get Started', true)

  // ── 7. Legacy /welcome URL rejoins the flow ─────────────────────────────
  await page.goto(`${BASE_URL}/welcome`, { waitUntil: 'domcontentloaded' })
  await page.waitForURL(`${BASE_URL}/`)
  await page.locator('[data-boot="splash"]').waitFor({ state: 'visible' })
  await welcome.waitFor({ state: 'visible' })
  check('legacy /welcome URL redirects into the flow at the Welcome page', true)

  // ── 8. The former landing page (/about) still loads directly ────────────
  await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'About Us' }).waitFor({ state: 'visible' })
  check(
    '/about loads directly with no boot gate',
    (await page.locator('[data-boot="splash"]').count()) === 0 &&
      (await page.locator('[data-welcome="page"]').count()) === 0,
  )
  check('landing navbar mounts on /about', (await page.locator('nav').count()) >= 1)

  // The landing branch re-mounts the app-wide drawer — the navbar's cart
  // button must not have gone dead.
  await page.getByRole('button', { name: 'Open cart' }).first().click()
  await page.getByRole('heading', { name: 'Your Cart' }).waitFor()
  check('cart drawer opens from the landing navbar', true)
  await page.keyboard.press('Escape')

  // ── 9. "Become a seller" button + the brand marquee at the bottom ────────
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-boot="splash"]').waitFor({ state: 'visible' })
  await page.locator('[data-boot="splash"]').waitFor({ state: 'detached' })
  await welcome.waitFor({ state: 'visible' })

  const sellerLink = welcome.locator('main').getByRole('link', { name: /become a seller/i })
  check('Welcome shows a "Become a seller" button', await sellerLink.isVisible())
  const navSellerLink = welcome
    .locator('nav')
    .getByRole('link', { name: /become a seller/i })
  check('the navbar shows a "Become a seller" link', await navSellerLink.isVisible())
  check(
    'both seller links point at the seller login page',
    (await sellerLink.getAttribute('href')) === '/seller/login' &&
      (await navSellerLink.getAttribute('href')) === '/seller/login',
    `hero=${await sellerLink.getAttribute('href')}, nav=${await navSellerLink.getAttribute('href')}`,
  )

  // The marquee sits after the main content — at the bottom of the page.
  const marqueeTrack = welcome.locator('.brand-marquee-track')
  check('the Welcome page has the brand marquee', (await marqueeTrack.count()) === 1)
  const layout = await page.evaluate(() => {
    const root = document.querySelector('[data-welcome="page"]')
    const kids = [...root.children]
    return {
      mainIdx: kids.findIndex((el) => el.tagName === 'MAIN'),
      marqueeIdx: kids.findIndex((el) =>
        el.contains(document.querySelector('.brand-marquee-container')),
      ),
    }
  })
  check(
    'the marquee renders below the main content (bottom of the page)',
    layout.mainIdx !== -1 && layout.marqueeIdx > layout.mainIdx,
    `main #${layout.mainIdx}, marquee #${layout.marqueeIdx}`,
  )

  const marqueeCards = await marqueeTrack.locator('a').count()
  check('the marquee shows the brands', marqueeCards >= 4, `${marqueeCards} brand cards`)
  const imagesOk = await marqueeTrack.evaluate(
    (el) =>
      [...el.querySelectorAll('a')]
        .slice(0, 6)
        .every((a) => a.querySelector('img')?.naturalWidth > 0),
  )
  check('the brand images in the marquee are loaded', imagesOk)

  // The track slides: a running keyframe animation that moves over time.
  const anim = await marqueeTrack.evaluate((el) => {
    const s = getComputedStyle(el)
    return { name: s.animationName, state: s.animationPlayState }
  })
  check(
    'the marquee track is animating',
    anim.name.includes('brandMarqueeScroll') && anim.state === 'running',
    `${anim.name} / ${anim.state}`,
  )
  const slideFrom = await marqueeTrack.evaluate(
    (el) => new DOMMatrix(getComputedStyle(el).transform).m41,
  )
  await new Promise((r) => setTimeout(r, 700))
  const slideTo = await marqueeTrack.evaluate(
    (el) => new DOMMatrix(getComputedStyle(el).transform).m41,
  )
  check(
    'the brand cards slide as the marquee moves',
    Math.abs(slideTo - slideFrom) > 1,
    `${slideFrom.toFixed(1)}px → ${slideTo.toFixed(1)}px`,
  )

  // ── 10. White redesign: white surface + dark ink headline ─────────────
  const paint = await page.evaluate(() => {
    const root = document.querySelector('[data-welcome="page"]')
    return {
      pageBg: getComputedStyle(root).backgroundColor,
      h1Color: getComputedStyle(root.querySelector('h1')).color,
    }
  })
  check(
    'the Welcome page background is pure white',
    paint.pageBg === 'rgb(255, 255, 255)',
    paint.pageBg,
  )
  check(
    'the headline is dark ink on the white page',
    paint.h1Color === 'oklch(0.205 0 0)' || paint.h1Color === 'rgb(23, 23, 23)',
    paint.h1Color,
  )

  await sellerLink.click()
  await page.waitForURL('**/seller/login', { timeout: 10000 })
  check('the seller button lands on the login URL', page.url().endsWith('/seller/login'))
  // Wait for the login page's own copy to paint (the URL changes before
  // React commits the route), which also proves the dashboard did NOT render.
  const loginRendered = await page
    .getByText('Sign in to manage products', { exact: false })
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false)
  check('the seller login page renders (not the dashboard)', loginRendered)

  await page.close()
} catch (err) {
  check('script completed without throwing', false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
