// Shared boot-flow helper for verify scripts.
//
// The splash + role gate run on EVERY full page load (first visit, refresh,
// new session), so any goto()/reload() in a script must pass through the gate
// before the app mounts. Shoppers are the default persona for test suites.
export const passBootGate = async (page, timeout = 20000) => {
  const gate = page.locator('[data-boot="gate"]')
  await gate.waitFor({ state: 'visible', timeout })
  await page.getByRole('button', { name: 'I am a shopper' }).click()
  await gate.waitFor({ state: 'detached', timeout: 5000 })
}
