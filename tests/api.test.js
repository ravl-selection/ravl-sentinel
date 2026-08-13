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

test('boot the app on an ephemeral port', async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  assert.ok(baseUrl);
});

// TODO SE-019: GET /api/transactions returns an array.
// TODO SE-019: POST a valid review returns 200.
// TODO SE-019: POST a review with a missing reason returns 400.

test('placeholder - replace me', async () => {
  const res = await fetch(`${baseUrl}/api/transactions`);
  // The scaffold returns 501. This assertion is here so npm test passes on a
  // fresh clone. Change it to expect 200 once SE-004 is implemented.
  assert.strictEqual(res.status, 501);
});

test('shut down', () => {
  server.close();
});
