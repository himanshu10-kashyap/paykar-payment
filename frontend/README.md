# Alina Overseas — hosted checkout (React)

Two-step checkout that creates a Paykar (SabPaisa) **hosted** payment session on the
server and then hands the browser over to Paykar with `window.location.assign`.

The browser never talks to Paykar directly, never holds a merchant credential, and
never embeds or scrapes the provider's page. Every call goes to our own API.

```
src/
  main.jsx                     <StrictMode> entry
  App.jsx                      react-router routes
  components/PaymentHeader.jsx  gradient business header
  components/CustomerDetails.jsx  step 1 — read-only customer details (auto-fetched)
  components/AmountForm.jsx    step 2 — amount entry + PAY button
  components/PaymentProcessing.jsx  spinner shown while a status is resolved
  components/PaymentSuccess.jsx    success receipt
  components/PaymentFailed.jsx     failed / cancelled / expired / review
  components/Spinner.jsx       shared spinner
  pages/PaymentPage.jsx        the two-step flow and the auto-pay trigger
  pages/PaymentResult.jsx      return page, bounded status polling
  services/paymentApi.js       typed API client + module-level in-flight lock
  hooks/useDebouncedValue.js   800ms settle timer
  hooks/usePaymentSession.js   customer fetch + sessionStorage idempotency key
  utils/format.js              decimal-safe amount validation and formatting
  utils/constants.js           limits, debounce, poll and storage settings
tests/                         vitest + @testing-library/react (no real network)
scripts/verifyLiveFlow.js      replays this client's requests against a live stack
```

## Commands

```bash
npm install
npm run dev     # http://localhost:5173, proxies /api -> http://localhost:4000
npm run lint
npm test        # vitest run
npm run build
```

Set `VITE_API_BASE_URL` to override the API base path (defaults to `/api`).
The dev/preview proxy target can be overridden with `API_TARGET`.

## The two steps

**Step 1 — customer details.** `useCustomer()` fetches
`GET /api/payments/customer` on mount, so the name, e-mail and mobile are
generated fresh on every visit to the screen. They render read-only; the browser
never holds customer data of its own, only the opaque `customerSessionId` it
echoes back on initiate.

**Step 2 — amount.** A valid amount that stays quiet for `AUTO_PAY_DEBOUNCE_MS`
(800 ms) submits the payment automatically. The PAY button remains available as a
manual trigger and is disabled while a submission is in flight. Paykar redirects
the customer back to `/payment/result?order_id=...`.

## API used

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/payments/customer` | random sandbox customer + `customerSessionId` |
| POST | `/api/payments/initiate` | creates the Paykar checkout (idempotency key) |
| GET | `/api/payments/:orderId/status` | return-page status, polled up to 5× |
| GET | `/api/health` | environment / connectivity |

Responses are `{ success, data }` or `{ success, error: { code, message, details } }`;
`error.message` is what the UI shows.

## Duplicate-payment protection

1. `isSubmitting` gates the UI, and an `inFlightRef` is checked **synchronously**
   before the request is made.
2. A module-level lock (`acquirePaymentLock` in `services/paymentApi.js`) stops a
   second component instance from submitting at the same time.
3. `idempotencyKey` is generated once per attempt and persisted in
   `sessionStorage`, so a refresh, remount or StrictMode double-mount reuses it and
   the backend returns the **same** Paykar checkout.
4. The key is cleared only after a redirect is issued or on an explicit "Try Again".

The backend's idempotency is the real guarantee; the client guards are UX
protection that stops accidental double charges from a fast click or a refresh.

## Payment trigger

A valid amount that stays quiet for `AUTO_PAY_DEBOUNCE_MS` (800ms) triggers the
payment automatically. The PAY button remains available as a manual trigger and is
disabled while a submission is in flight. Paykar redirects the customer back to
`/payment/result?order_id=...`.

## Checking against a live stack

With the backend running (pointed at its `npm run stub:paykar` so a checkout can
actually be created):

```bash
node scripts/verifyLiveFlow.js
```

This replays this client's exact request sequence — customer fetch, initiate,
status poll, webhook, re-poll — through the dev proxy, using the same envelope
rules as `services/paymentApi.js`.