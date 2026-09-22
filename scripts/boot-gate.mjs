// Shared boot-flow helper for verify scripts.
//
// The splash + role gate run on EVERY full page load, so any goto()/reload()
// in a script must pass through the gate before the app mounts. The sign-up
// form only appears on a FIRST visit (no stored profile) — returning visitors
// skip it. This helper handles both paths, so callers work regardless of
// whether the suite's page has signed up before. Shoppers are the default
// persona for test suites.
export const passBootGate = async (page, timeout = 20000) => {
  const gate = page.locator('[data-boot="gate"]')
  await gate.waitFor({ state: 'visible', timeout })
  await page.getByRole('button', { name: 'I am a shopper' }).click()

  // First visit on this page: the sign-up form appears and must be filled.
  // Returning visits: the gate detaches straight away — the wait below wins
  // instantly, no form is touched.
  const signup = page.locator('[data-boot="signup"]')
  const needsSignUp = await signup
    .waitFor({ state: 'visible', timeout: 2500 })
    .then(() => true)
    .catch(() => false)
  if (needsSignUp) {
    await completeSignUp(page)
  }

  await gate.waitFor({ state: 'detached', timeout: 5000 })
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
