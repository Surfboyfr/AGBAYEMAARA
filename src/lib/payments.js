// ── Payment seam ──────────────────────────────────────────────────────────────
// Paystack is the planned provider, but a browser cannot safely hold Paystack
// secret keys, so real checkout needs a server endpoint to initialize the
// transaction. Until that backend exists, this module simulates the exact
// client-visible contract (initialize → reference → verify) so the demo
// checkout flow is complete end-to-end.
//
// When the Express service lands, replace `initializeTransaction` with a call
// to that endpoint (e.g. POST {API_URL}/api/checkout/init) — no checkout UI
// changes required, since everything downstream consumes the same shape.

// Paystack amounts are in subunits (kobo), matching the real API contract.
export const toKobo = (amount) => Math.round(amount * 100)

export const generateReference = () =>
  `AGB-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`

// Mock "initialize transaction". Resolves with a Paystack-shaped payload after
// a short simulated network latency.
export const initializeTransaction = async ({ email, amount, currency = 'USD' }) => {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  return {
    status: true,
    message: 'Authorization initialized (mock)',
    data: {
      authorization_url: null, // no redirect URL in mock mode
      access_code: `MOCK_${generateReference()}`,
      reference: generateReference(),
      amount: toKobo(amount),
      currency,
      email,
    },
  }
}
