/**
 * End-to-end check of the checkout flow against a stubbed Paykar gateway.
 *
 *   node scripts/verifyFlow.js
 *
 * Drives the exact request sequence the frontend performs:
 *   1. GET  /api/payments/customer          (screen 1 auto-fetch)
 *   2. POST /api/payments/initiate          (screen 2 auto-submit)
 *   3. POST /api/webhooks/paykar            (gateway confirms)
 *   4. GET  /api/payments/:orderId/status   (result screen poll)
 * plus the duplicate-submit guard.
 */

import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://localhost:4000';
const STUB = process.env.STUB_URL || 'http://localhost:4998';

let failures = 0;

const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${label}${ok ? '' : `\n          expected ${expected}, got ${actual}`}`);
};

const call = async (method, path, body) => {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return { status: response.status, body: await response.json() };
};

const setVerifyMode = (status) =>
  fetch(`${STUB}/__mode?status=${status}`).then((r) => r.json());

// ==========================================================

console.log('\n1. Screen 1 - auto-fetch generates a random customer every hit');

const first = await call('GET', '/api/payments/customer');
const second = await call('GET', '/api/payments/customer');

check('status', first.status, 200);
check('envelope success', first.body.success, true);

const a = first.body.data.customer;
const b = second.body.data.customer;

check('name present', typeof a.name === 'string' && a.name.length > 0, true);
check('email present', typeof a.email === 'string' && a.email.includes('@'), true);
check('mobile is 10 digits', /^[6-9]\d{9}$/.test(a.mobile), true);
check('two hits differ', JSON.stringify(a) !== JSON.stringify(b), true);
check('session id issued', first.body.data.customerSessionId.startsWith('cst_'), true);
check('synthetic flag', first.body.data.synthetic, true);

console.log(`        ${a.name} / ${a.email} / ${a.mobile}`);
console.log(`        ${b.name} / ${b.email} / ${b.mobile}`);

// ==========================================================

console.log('\n2. Screen 2 - auto-submit creates a Paykar checkout');

const { customerSessionId } = first.body.data;
const idempotencyKey = `verify-${Date.now()}`;

const initiated = await call('POST', '/api/payments/initiate', {
  amount: 1000,
  customerSessionId,
  idempotencyKey,
});

check('status', initiated.status, 201);
check('checkoutUrl returned', typeof initiated.body.data.checkoutUrl === 'string', true);
check('orderId returned', typeof initiated.body.data.orderId === 'string', true);

const { orderId, checkoutUrl } = initiated.body.data;

console.log(`        order ${orderId}`);
console.log(`        ${checkoutUrl}`);

// ==========================================================

console.log('\n3. Duplicate submit is idempotent (no second checkout)');

const duplicate = await call('POST', '/api/payments/initiate', {
  amount: 1000,
  customerSessionId,
  idempotencyKey,
});

check('status', duplicate.status, 200);
check('same order id', duplicate.body.data.orderId, orderId);
check('same checkout url', duplicate.body.data.checkoutUrl, checkoutUrl);
check('flagged as replay', duplicate.body.data.replayed, true);

// ==========================================================

console.log('\n4. The consumed session cannot be reused');

const reused = await call('POST', '/api/payments/initiate', {
  amount: 2500,
  customerSessionId,
  idempotencyKey: `${idempotencyKey}-other`,
});

check('status', reused.status, 400);
check('error code', reused.body.error.code, 'CUSTOMER_SESSION_INVALID');

// ==========================================================

console.log('\n5. Status before any webhook');

await setVerifyMode('pending');

const pending = await call('GET', `/api/payments/${orderId}/status`);

check('status', pending.status, 200);
check('orderId echoed', pending.body.data.orderId, orderId);
// No webhook yet, so the order stays in its non-terminal INITIATED state. The
// frontend maps INITIATED -> PROCESSING and keeps polling.
check('still in flight', ['INITIATED', 'PENDING'].includes(pending.body.data.status), true);
check('customer echoed', pending.body.data.customer.mobile, a.mobile);
check('no false success', pending.body.data.needsReview, false);

// ==========================================================

console.log('\n6. Webhook confirms the payment');

await setVerifyMode('success');

const webhook = await call('POST', '/api/webhooks/paykar', {
  trx_id: initiated.body.data.orderId,
});

check('status', webhook.status, 200);

const confirmed = await call('GET', `/api/payments/${orderId}/status`);

check('status', confirmed.status, 200);
check('marked SUCCESS', confirmed.body.data.status, 'SUCCESS');
check('paidAt stamped', Boolean(confirmed.body.data.paidAt), true);
check('gateway verdict', confirmed.body.data.paymentStatus, 'success');
check('not flagged for review', confirmed.body.data.needsReview, false);

// ==========================================================

console.log('\n7. Failed payment is reported as failed, never as success');

await setVerifyMode('pending');

const failSession = await call('GET', '/api/payments/customer');
const failOrder = await call('POST', '/api/payments/initiate', {
  amount: 99,
  customerSessionId: failSession.body.data.customerSessionId,
  idempotencyKey: `fail-${Date.now()}`,
});

check('initiate ok', failOrder.status, 201);

await setVerifyMode('failed');

await call('POST', '/api/webhooks/paykar', { trx_id: failOrder.body.data.orderId });

const failed = await call('GET', `/api/payments/${failOrder.body.data.orderId}/status`);

check('marked FAILED', failed.body.data.status, 'FAILED');
check('paidAt stays empty', failed.body.data.paidAt, null);
check('reason surfaced', typeof failed.body.data.message, 'string');

await setVerifyMode('success');

// ==========================================================

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}\n`);
process.exit(failures === 0 ? 0 : 1);