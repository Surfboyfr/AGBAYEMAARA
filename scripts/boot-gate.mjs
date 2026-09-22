// Shared boot-flow helper for verify scripts.
//
// The splash + role gate + sign-up run on EVERY full page load (first visit,
// refresh, new session), so any goto()/reload() in a script must pass through
// the whole flow before the app mounts. Shoppers are the default persona for
// test suites.
export const passBootGate = async (page, timeout = 20000) => {
  const gate = page.locator('[data-boot="gate"]')
  await gate.waitFor({ state: 'visible', timeout })
  await page.getByRole('button', { name: 'I am a shopper' }).click()
  await completeSignUp(page)
  await gate.waitFor({ state: 'detached', timeout: 5000 })
}

// Fill the sign-up step that follows the role choice. Kept separate so boot
// scripts can drive brand sign-ups and validation paths individually.
export const completeSignUp = async (page) => {
  const signup = page.locator('[data-boot="signup"]')
  await signup.waitFor({ state: 'visible', timeout: 5000 })
  await page.locator('#boot-name').fill('Ada Test')
  await page.locator('#boot-email').fill('ada@example.com')
  await page.locator('#boot-password').fill('password123')
  await page.getByRole('button', { name: 'Continue' }).click()
  await signup.waitFor({ state: 'detached', timeout: 5000 })
}
