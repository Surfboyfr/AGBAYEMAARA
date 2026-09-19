// Verifies the theme system with real computed styles (run: node scripts/verify-theme.mjs [url])
// Covers: tokens actually resolving, no opaque navbar outlines, glass bar,
// toggle behavior in both directions, persistence, and theme-aware CTAs.
import { chromium } from 'playwright'
import { passBootGate } from './boot-gate.mjs'

const BASE_URL = process.argv[2] ?? 'http://localhost:5173'
let pass = 0
let fail = 0
const check = (name, ok, detail = '') => {
  ok ? pass++ : fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const css = (locator, prop) =>
  locator.evaluate((el, p) => getComputedStyle(el)[p], prop)

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

// The boot splash + role gate run on every load; pass through as a shopper.
const gotoWithBoot = async (path, wait = 'networkidle') => {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: wait })
  await passBootGate(page)
}
const reloadWithBoot = async (wait = 'networkidle') => {
  await page.reload({ waitUntil: wait })
  await passBootGate(page)
}

try {
  // Start from a known state: dark
  await gotoWithBoot('/')
  await page.evaluate(() => localStorage.setItem('agbayemaara.theme', 'dark'))
  await reloadWithBoot()

  const nav = page.locator('nav').first()
  const body = page.locator('body')

  // ── 1. Dark theme: tokens resolve, no opaque outlines ─────────────────────
  check('html carries .dark', await page.evaluate(() => document.documentElement.classList.contains('dark')))

  const bgDark = await css(body, 'backgroundColor')
  check('dark body uses token surface', bgDark === 'rgb(10, 11, 15)', bgDark)

  // The old bug: border-line was dead → borders rendered currentColor (white).
  const chip = page.locator('nav button', { hasText: /en|es|fr/i }).first()
  const chipBg = await css(chip, 'backgroundColor')
  check('language chip bg-raised resolves (not transparent)', chipBg !== 'rgba(0, 0, 0, 0)', chipBg)

  const navBorder = await css(nav, 'borderBottomColor')
  check('navbar bottom border not opaque white', navBorder !== 'rgb(255, 255, 255)', navBorder)

  const navShadow = await css(nav, 'boxShadow')
  check('navbar has soft shadow (no hard outline)', navShadow !== 'none', navShadow.slice(0, 60))

  const navBlur = await css(nav, 'backdropFilter')
  check('navbar glass blur active', navBlur.includes('blur'), navBlur)

  // ── 2. Toggle to light ────────────────────────────────────────────────────
  await page.getByRole('button', { name: /light/i }).first().click()
  await page.waitForTimeout(450)

  check('html switches to .light', await page.evaluate(() => document.documentElement.classList.contains('light')))
  const bgLight = await css(body, 'backgroundColor')
  check('light body is warm paper', bgLight === 'rgb(250, 248, 244)', bgLight)
  const textLight = await css(body, 'color')
  check('light text is ink', textLight === 'rgb(25, 28, 36)', textLight)

  // Sign-in pill inverts: ink on paper in light mode
  const pill = page.getByRole('button', { name: 'Sign in' }).first()
  const pillBg = await css(pill, 'backgroundColor')
  check('sign-in pill inverts in light theme', pillBg === 'rgb(25, 28, 36)', pillBg)

  // ── 3. Persistence + back to dark ─────────────────────────────────────────
  await reloadWithBoot()
  check('light persists across reload', await page.evaluate(() => document.documentElement.classList.contains('light')))

  await page.getByRole('button', { name: /dark/i }).first().click()
  await page.waitForTimeout(450)
  check('toggles back to dark', await page.evaluate(() => document.documentElement.classList.contains('dark')))
  check('body returns to dark surface', (await css(body, 'backgroundColor')) === 'rgb(10, 11, 15)')

  // ── 4. Theme carries across surfaces ─────────────────────────────────────
  await gotoWithBoot('/orders')
  check('orders page stays dark after toggle', await page.evaluate(() => document.documentElement.classList.contains('dark')))

  // ── 5. Discovery surface in light mode: pills + borderless cards ──────────
  await gotoWithBoot('/')
  await page.getByRole('button', { name: /light/i }).first().click()
  await page.waitForTimeout(450)
  check('discovery surface switched to light', await page.evaluate(() => document.documentElement.classList.contains('light')))

  const pillLight = page.locator('button[aria-pressed="true"]').first()
  const activePillBg = await css(pillLight, 'backgroundColor')
  const activePillText = await css(pillLight, 'color')
  check(
    'active filter pill is accent (visible on paper)',
    activePillBg === 'rgb(236, 88, 0)' && activePillText === 'rgb(255, 255, 255)',
    `${activePillBg} / ${activePillText}`,
  )

  const inactivePill = page.locator('button[aria-pressed="false"]').first()
  const inactiveBg = await css(inactivePill, 'backgroundColor')
  check('inactive pill has a visible fill', inactiveBg !== 'rgba(0, 0, 0, 0)', inactiveBg)

  // Wait out the simulated feed latency, then check real card outlines.
  const firstCard = page.locator('main article').first()
  await firstCard.waitFor({ state: 'visible', timeout: 10000 })
  const cardBorder = await css(firstCard, 'borderTopWidth')
  check('feed cards have no border outline', cardBorder === '0px', cardBorder)
  const cardShadow = await css(firstCard, 'boxShadow')
  check('feed cards use a soft shadow instead', cardShadow !== 'none', cardShadow.slice(0, 50))

  // ── 6. Hover lift on cards ─────────────────────────────────────────────────
  await firstCard.hover()
  await page.waitForTimeout(400)
  const liftedTransform = await css(firstCard, 'transform')
  check('card lifts on hover (translateY)', liftedTransform.includes('-6'), liftedTransform.slice(0, 40))
  const liftedShadow = await css(firstCard, 'boxShadow')
  check('hover deepens the shadow', liftedShadow !== cardShadow, liftedShadow.slice(0, 50))

  // ── 7. AuthModal in light mode: active tab + submit visible ──────────────
  await gotoWithBoot('/following')
  await page.getByRole('button', { name: 'Sign in' }).first().click()
  const activeTab = page.locator('div.bg-raised.rounded-lg.p-1 button', { hasText: 'Sign in' }).first()
  const tabBg = await css(activeTab, 'backgroundColor')
  check('auth modal active tab is ink in light mode', tabBg === 'rgb(25, 28, 36)', tabBg)
  const submitBtn = page.locator('button[type="submit"]')
  const submitBg = await css(submitBtn, 'backgroundColor')
  check('auth modal submit is accent in light mode', submitBg === 'rgb(236, 88, 0)', submitBg)
  await page.keyboard.press('Escape')

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exitCode = fail ? 1 : 0
} finally {
  await browser.close()
}
