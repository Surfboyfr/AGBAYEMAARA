// Shared boot-flow helper for verify scripts.
//
// The order on every full page load is: splash → Welcome screen → Get
// Started → currency picker (once per browser, until localStorage is
// cleared) → sign-up form (FIRST visit only, no stored profile) → the app.
// Any goto()/reload() in a script must wait for the splash to clear and then
// click through the Welcome screen. There is no shopper/brand choice screen.
// This helper handles all paths, so callers work regardless of whether the
// suite's page has signed up before, and it no-ops on surfaces outside
// BootFlow (/about, /seller, /admin) where none of this mounts.
export const passBootGate = async (page, timeout = 20000) => {
  const splash = page.locator('[data-boot="splash"]')
  // The splash shows for ~3s on every load. If the caller never left the
  // mounted app there is nothing to wait for — the waits below win instantly.
  await splash.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
  await splash.waitFor({ state: 'detached', timeout })

  // The page after the loading screen: Welcome. Get Started is the way into
  // the steps below — it never shows on surfaces outside BootFlow, where the
  // wait times out harmlessly.
  await passWelcome(page)

  // First visit on this page: the currency picker appears after Get Started.
  // Returning visits: it never mounts — the wait below times out harmlessly.
  await passCurrencyStep(page)

  // First visit on this page: the sign-up form appears and must be filled.
  // Returning visits: the wait below times out harmlessly, no form is touched.
  const signup = page.locator('[data-boot="signup"]')
  const needsSignUp = await signup
    .waitFor({ state: 'visible', timeout: 2500 })
    .then(() => true)
    .catch(() => false)
  if (needsSignUp) {
    await completeSignUp(page)
  }

  await splash.waitFor({ state: 'detached', timeout: 5000 })
}

// Click through the Welcome screen — the page that follows the loading
// splash on every visit. Returns true when it was there (so callers can
// distinguish "clicked through" from "not on a boot surface").
export const passWelcome = async (page) => {
  const getStarted = page.locator('[data-welcome="get-started"]')
  const needsClick = await getStarted
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false)
  if (needsClick) await getStarted.click()
  return needsClick
}

// Choose USD at the currency step if it is showing. USD keeps every price
// assertion in the suites on the default `$xx.xx` formatting.
export const passCurrencyStep = async (page) => {
  const currency = page.locator('[data-boot="currency"]')
  const needsCurrency = await currency
    .waitFor({ state: 'visible', timeout: 2500 })
    .then(() => true)
    .catch(() => false)
  if (needsCurrency) {
    await page.getByRole('button', { name: /USD — US Dollar/ }).click()
    await currency.waitFor({ state: 'detached', timeout: 5000 })
  }
}

// Fill the first-visit sign-up step. Kept separate so boot scripts can drive
// brand sign-ups and validation paths individually.
export const completeSignUp = async (page) => {
  const signup = page.locator('[data-boot="signup"]')
  await signup.waitFor({ state: 'visible', timeout: 5000 })
  await page.locator('#boot-name').fill('Ada Test')
  await page.locator('#boot-email').fill('ada@example.com')
  await page.locator('#boot-password').fill('password123')
  await page.getByRole('button', { name: 'Continue' }).click()
  await signup.waitFor({ state: 'detached', timeout: 5000 })
}
