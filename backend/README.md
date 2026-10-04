# Paykar (SabPaisa) hosted-checkout — backend

Express + Sequelize + MySQL API for the Paykar hosted-checkout integration.
Sandbox-first. All gateway traffic is server-side: the browser never holds a
merchant credential and never calls Paykar.

Frontend counterpart: `../frontend` (built against the contract below).

---

## Quick start

```bash
npm install
cp .env.example .env       # then fill in DB_* and PAYKAR_* credentials
npm run dev                # http://localhost:4000
```

The schema is created automatically on boot (`sequelize.sync()`), so the only
manual step is having the database itself exist:

```sql
CREATE DATABASE paykar_gateway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Smoke test:

```bash
curl -s localhost:4000/api/health
curl -s localhost:4000/api/payments/customer
```

> Payment initiation fails until `PAYKAR_MERCHANT_KEY` / `PAYKAR_API_KEY` are set
> to real sandbox values. Every other endpoint works without them.
>
> The dashboard labels these credentials inconsistently, so each is also read
> from an alias: `PAYKAR_MERCHANT_ID` for `PAYKAR_MERCHANT_KEY` and
> `PAYKAR_SECRET_KEY` for `PAYKAR_API_SECRET`. A name mismatch used to resolve
> to `undefined` and surface to the customer as a misleading
> "payments are temporarily unavailable".

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | `nodemon src/server.js` |
| `npm start` | `node src/server.js` |
| `npm run stub:paykar` | local fake gateway on `:4998`, for testing without credentials |
| `npm run verify:flow` | drives the whole flow against a running server (see below) |

### Verifying the flow without real credentials

In three terminals:

```bash
npm run stub:paykar                       # fake gateway on :4998

PAYKAR_MERCHANT_KEY=test PAYKAR_API_KEY=test \
PAYKAR_BASE_URL=http://localhost:4998 \
npm run dev                               # real server, pointed at the stub

npm run verify:flow                       # 30 assertions across the whole flow
```

---

## Configuration

`.env` holds the local values and is git-ignored. `src/config/env.js` reads them
once with defaults.

| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `5000` | `.env` sets `4000`; must match the frontend proxy target |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allow-list **and** the Paykar return URL |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | — | MySQL connection |
| `PAYKAR_ENV` | `sandbox` | echoed to the client and stored on each order |
| `PAYKAR_BASE_URL` | `https://paykar.in/api/v1` | |
| `PAYKAR_MERCHANT_KEY` / `PAYKAR_API_KEY` | — | required for a real checkout |
| `PAYKAR_API_SECRET` | — | IPN signing only; not sent on initiate/verify |
| `PAYKAR_WEBHOOK_URL` | — | sent as `ipn_url` on initiate |
| `CUSTOMER_SESSION_TTL_MS` | `600000` | how long a generated customer stays resolvable |
| `CUSTOMER_SESSION_MAX` | `5000` | cap on remembered sessions |
| `LOG_LEVEL` | `info` | `debug｜info｜warn｜error` |

---

## API contract

Base URL `http://localhost:4000`. Every response is JSON.

Success:

```json
{ "success": true, "message": "...", "data": { } }
```

Error:

```json
{ "success": false, "message": "...", "error": { "code": "...", "message": "...", "details": {} } }
```

The frontend branches on `error.code` and displays `error.message`. A top-level
`message` is kept alongside `error` for older callers.

### `GET /api/health`

Also served at `/health`. Never throws.

```json
{ "success": true, "message": "Payment backend is running", "data": { "environment": "sandbox" } }
```

### `GET /api/payments/customer`

Generates a **fresh random customer on every call** — random name, random e-mail,
random 10-digit Indian mobile. This is what the checkout screen auto-fetches on
mount, so every visit shows a different person.

The e-mail domain is `.test` (reserved by RFC 2606) and the numbers are
structurally valid but unallocated, so nothing can reach a real inbox.

```json
{
  "success": true,
  "data": {
    "customer": { "name": "Aadhya Malhotra", "email": "aadhya.67489@example.test", "mobile": "9392338632" },
    "customerSessionId": "cst_sandbox_7d047100",
    "synthetic": true,
    "environment": "sandbox"
  }
}
```

`customerSessionId` is an opaque handle; the browser echoes it back on initiate
instead of re-sending the customer's details.

### `POST /api/payments/initiate`

```json
{ "amount": 1000, "customerSessionId": "cst_sandbox_7d047100", "idempotencyKey": "3f1c2b4a-…" }
```

* `amount` — number or decimal string, `1 … 50000`, re-validated server-side.
* `customerSessionId` — resolves the customer server-side. `400
  CUSTOMER_SESSION_INVALID` when unknown or expired.
* `idempotencyKey` — optional, unique per order. Replaying a key returns the
  **existing** checkout with `200` instead of creating a second Paykar session;
  a unique-index violation from a concurrent duplicate is caught and replayed too.

`201` on creation:

```json
{
  "success": true,
  "data": {
    "orderId": "PAYKAR_1791046886320_B69E7ED5B39B",
    "paymentId": "pay_5B39B",
    "checkoutUrl": "https://paykar.in/pay/…",
    "amount": 1000,
    "currency": "INR",
    "status": "CHECKOUT_CREATED"
  }
}
```

The session is consumed on success, so one customer identity cannot pay twice.

Errors: `400 CUSTOMER_SESSION_INVALID`, `400 INVALID_AMOUNT`, `502
MISSING_CHECKOUT_URL` / `MISSING_TRANSACTION_ID`, `500 PAYMENT_INITIATION_FAILED`.

### `GET /api/payments/:orderId/status`

Pure database read — it never calls Paykar, so polling cannot exhaust the
gateway's quota and an outage can never flip a paid order to failed. The webhook
is the only writer of a terminal status; `POST /:orderId/verify` exists for
manual reconciliation.

```json
{
  "success": true,
  "data": {
    "orderId": "PAYKAR_1791046886320_B69E7ED5B39B",
    "status": "SUCCESS",
    "paymentStatus": "success",
    "amount": 1500,
    "currency": "INR",
    "customer": { "name": "Shreya Reddy", "email": "…", "mobile": "…" },
    "paykarTransactionId": "PAYKAR_…",
    "paidAt": "2026-10-03T17:01:26.000Z",
    "checkoutUrl": null,
    "message": "",
    "needsReview": false
  }
}
```

`status` ∈ `CREATED | INITIATED | PENDING | SUCCESS | FAILED | CANCELLED |
EXPIRED`. `paidAt` is stamped once, the first time a capture is confirmed.

`needsReview: true` means we cannot show a confident verdict — a captured
payment with no capture time, or our status contradicting the gateway's.

`404 PAYMENT_NOT_FOUND` when the order does not exist.

### `GET /api/payments/:orderId`

The full stored row. **Route-ordering note:** `/customer` is declared before
`/:orderId`, otherwise Express matches the literal string `customer` as an order
id and the lookup fails.

### `POST /api/payments/:orderId/verify`

Calls Paykar's verify API, normalises the verdict and stores it. Also stamps
`paidAt` on a first confirmation.

### `POST /api/webhooks/paykar`

The IPN endpoint. The payload is used **only** to find the order — it never
decides anything on its own. The server always re-verifies with Paykar before
writing a status, so a forged or tampered callback cannot mark an order paid.

Status classification is shared with the verify path via `src/utils/status.js`,
so a payment can never be classified two different ways.

---

## Domain model

```
PaymentStatus  CREATED → INITIATED → PENDING → SUCCESS
                                         ↘ FAILED / CANCELLED / EXPIRED
```

* `orderId` — `PAYKAR_<epoch_ms>_<random>`, generated in `src/utils/order.js`.
* `idempotencyKey` — unique, nullable. NULL repeats freely in MySQL, so callers
  that omit it are unaffected.
* `paidAt` — capture time, stamped once via `resolvePaidAt()` so it records when
  the money moved rather than when we noticed.
* The order row is the single source of truth for the result screen; the query
  string Paykar returns with is only a lookup key.

---

## Security

* `helmet`, explicit CORS allow-list from `FRONTEND_URL`.
* Customers are generated server-side and referenced by an opaque id, so the
  browser holds no customer data to tamper with.
* Idempotency is enforced by a unique index, so a double submit cannot create a
  second checkout even under concurrency.
* The webhook never trusts its payload — it always re-verifies with the gateway.
* Structured JSON logger; internal details never reach the client.

## Known limitations

* Customer sessions are **in-memory**, so a backend restart invalidates them and
  the customer is bounced back to step 1 for a fresh identity. Acceptable for
  throwaway sandbox identities; move to Redis if this ever holds real customers.
* The webhook endpoint has no HMAC signature verification. Add it before
  production — the payload is already never trusted for status, but the endpoint
  is unauthenticated.
* `sequelize.sync()` is used rather than migrations. Fine while the schema is
  changing; adopt migrations before production.
* No rate limiting on the payment routes.