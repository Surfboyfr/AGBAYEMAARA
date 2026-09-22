// Diagnoses theme-toggle jank (run: node scripts/diagnose-theme-perf.mjs [url])
// A/B measures frame timing during theme toggles under three conditions:
//   1. Normal (the .theme-fade universal transition active)
//   2. All transitions disabled (isolates the fade cost)
//   3. Transitions on, marquee animations paused (isolates animation cost)
import { chromium } from 'playwright'
import { passBootGate } from './boot-gate.mjs'

const BASE_URL = process.argv[2] ?? 'http://localhost:5174'
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.setDefaultTimeout(15000)

await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
await passBootGate(page)

// Frame sampler: rAF deltas over a window, in ms, with summary stats.
const sample = async (ms) =>
  page.evaluate((duration) => {
    const deltas = []
    return new Promise((resolve) => {
      let last = performance.now()
      const start = performance.now()
      const tick = (now) => {
        deltas.push(now - last)
        last = now
        if (now - start < duration) requestAnimationFrame(tick)
        else {
          const sorted = [...deltas].sort((a, b) => a - b)
          const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]
          resolve({
            frames: deltas.length,
            avg: +(deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(1),
            p95: +p(0.95).toFixed(1),
            max: +sorted[sorted.length - 1].toFixed(1),
            dropped: deltas.filter((d) => d > 32).length,
          })
        }
      }
      requestAnimationFrame(tick)
    })
  }, ms)

// Click the theme toggle, wait out the 300ms fade, sample that window.
const toggleAndSample = async () => {
  const statsPromise = sample(800)
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('nav button')].find((b) =>
      (b.getAttribute('aria-label') ?? '').toLowerCase().includes('switch')
    )
    btn.click()
  })
  return statsPromise
}

const domCount = await page.evaluate(() => document.querySelectorAll('*').length)
const idle = await sample(1000)

// 1. Normal toggle with the .theme-fade cross-fade active.
const normalLight = await toggleAndSample()
await page.waitForTimeout(500)
const normalDark = await toggleAndSample()
await page.waitForTimeout(500)

// 2. Kill every transition, toggle again — same React work, no fade paint.
await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' })
const noFadeLight = await toggleAndSample()
await page.waitForTimeout(500)
const noFadeDark = await toggleAndSample()
await page.waitForTimeout(500)

// 3. Restore transitions, pause the marquee animations instead — isolates the
//    continuously-scrolling tracks as a contributing cost.
await page.addStyleTag({ content: '* { animation-play-state: paused !important; }' })
const pausedMarquee = await toggleAndSample()

const fmt = (s) =>
  `avg ${String(s.avg).padStart(5)}  p95 ${String(s.p95).padStart(6)}  max ${String(s.max).padStart(6)}  dropped ${s.dropped}/${s.frames}`

console.log(`DOM nodes: ${domCount}`)
console.log('')
console.log('Frame deltas (ms) during theme toggles:')
console.log(`  idle (no toggle)        ${fmt(idle)}`)
console.log(`  toggle →light (fade on) ${fmt(normalLight)}`)
console.log(`  toggle →dark  (fade on) ${fmt(normalDark)}`)
console.log(`  toggle →light (no fade) ${fmt(noFadeLight)}`)
console.log(`  toggle →dark  (no fade) ${fmt(noFadeDark)}`)
console.log(`  toggle (fade on, marquee paused) ${fmt(pausedMarquee)}`)

await browser.close()
