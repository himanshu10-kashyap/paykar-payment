/**
 * Stand-in for the Paykar gateway, used to exercise the real backend code path
 * (axios -> response parsing -> DB -> status/webhook) without live credentials.
 *
 * Run: node scripts/stubPaykar.js [port]
 */

import http from 'node:http';

const port = Number(process.argv[2] || 4998);

/** What the next verify call should report. Flipped via POST /__mode. */
let verifyStatus = 'success';

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    const json = (payload, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    };

    // Flip the verdict the verify endpoint will report.
    if (url.pathname === '/__mode') {
      verifyStatus = url.searchParams.get('status') || 'success';
      json({ verifyStatus });
      return;
    }

    if (url.pathname === '/initiate-payment' && req.method === 'POST') {
      const parsed = body ? JSON.parse(body) : {};
      const ref = parsed.ref_trx || 'unknown';

      json({
        payment_url: `https://checkout.example.test/session/${ref}`,
        info: {
          ref_trx: ref,
          payment_id: `pay_${ref.slice(-8)}`,
          merchant_id: 'MERCH_1',
          merchant_name: 'Alina Overseas',
          amount: parsed.payment_amount,
          currency_code: 'INR',
          environment: 'sandbox',
        },
      });
      return;
    }

    if (url.pathname.startsWith('/verify-payment/')) {
      const trxId = decodeURIComponent(url.pathname.split('/').pop());

      json({
        status: verifyStatus,
        trx_id: trxId,
        amount: '1000.00',
      });
      return;
    }

    json({ message: 'Not found' }, 404);
  });
});

server.listen(port, () => {
  console.log(`stub paykar listening on http://localhost:${port}`);
});