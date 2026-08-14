/**
 * RAVL Sentinel v0.1 - API tests (SE-019).
 *
 * Uses the Node built-in test runner, so there is nothing extra to install.
 * Run with: npm test
 *
 * Any framework is fine if you prefer jest or mocha. Three passing tests is
 * the bar. Delete the placeholder below once you have written real ones.
 */

const { test } = require('node:test');
const assert = require('node:assert');

// The server exports the Express app without calling listen(), so you can
// start it on a throwaway port here.
const app = require('../server/index.js');

let server;
let baseUrl;
let id = '1';

test('boot the app on an ephemeral port', async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  assert.ok(baseUrl);
});

// TODO SE-019: GET /api/transactions returns an array.
test('GET /api/transactions returns an array', async () => {
  const res = await fetch(`${baseUrl}/api/transactions`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
});

// TODO SE-019: POST a valid review returns 200.
test('POST /api/transactions/:id/review valid review returns 200', async () => {
  const res = await fetch(`${baseUrl}/api/transactions/${id}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      decision: 'APPROVED',
      reason: 'Low risk',
      reviewer: 'testuser',
    }),
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.id);
});

// TODO SE-019: POST a review with a missing reason returns 400.
test('POST /api/transactions/:id/review missing reason returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/transactions/${id}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      decision: 'APPROVED',
      reviewer: 'testuser',
    }),
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test('placeholder - replace me', async () => {
  const res = await fetch(`${baseUrl}/api/transactions`);
  // The scaffold returns 501. This assertion is here so npm test passes on a
  // fresh clone. Change it to expect 200 once SE-004 is implemented.
  assert.strictEqual(res.status, 501);
  // assert.strictEqual(res.status, 200); CHANGE TO THIS
});

test('shut down', () => {
  server.close();
});
