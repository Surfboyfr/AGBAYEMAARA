import { chromium } from 'playwright'
import { passBootGate } from './scripts/boot-gate.mjs'
const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
p.on('pageerror', (e) => console.log('PAGEERROR', String(e).slice(0, 300)))
await p.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
await passBootGate(p)

// Exactly what the probe does before clicking:
const order = await p.evaluate(() => {
  const main = document.querySelector('main')
  const kids = [...main.children]
  return { total: kids.length, first: kids[0].tagName, shopIdx: kids.indexOf(document.getElementById('shop')) }
})
console.log('layout:', JSON.stringify(order))
console.log('belowFold:', await p.locator('#shop').evaluate((el) => el.getBoundingClientRect().top > window.innerHeight))
console.log('navVisible:', await p.locator('nav[aria-label="Shop categories"]').isVisible())

await p.evaluate(() => {
  window.__log = []
  const orig = Element.prototype.scrollIntoView
  Element.prototype.scrollIntoView = function (...args) {
    window.__log.push({ id: this.id, args: JSON.stringify(args), scrollY: Math.round(window.scrollY) })
    return orig.apply(this, args)
  }
})

await p.getByRole('button', { name: 'Shoes', exact: true }).click()
console.log('aria-pressed:', await p.getByRole('button', { name: 'Shoes', exact: true }).getAttribute('aria-pressed'))
for (const ms of [0, 200, 500, 1200, 3000, 5000]) {
  await p.waitForTimeout(ms === 0 ? 0 : ms - (0))
  console.log(`t≈${ms}ms scrollY=`, await p.evaluate(() => Math.round(window.scrollY)),
    'shopTop=', await p.evaluate(() => Math.round(document.getElementById('shop').getBoundingClientRect().top)),
    'docH=', await p.evaluate(() => document.documentElement.scrollHeight))
  if (ms > 0) break
}
await p.waitForTimeout(3000)
console.log('after 3s scrollY=', await p.evaluate(() => Math.round(window.scrollY)),
  'shopTop=', await p.evaluate(() => Math.round(document.getElementById('shop').getBoundingClientRect().top)),
  'calls=', JSON.stringify(await p.evaluate(() => window.__log)))
await b.close()
