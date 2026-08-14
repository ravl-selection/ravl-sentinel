/**
 * RAVL Sentinel v0.1 - server entry point.
 *
 * This file is scaffolding. It boots and serves the client, and that is all.
 * Every API route below is a stub that returns HTTP 501 until you implement it.
 * The story IDs in the TODOs match the printed backlog.
 *
 * Read data/transactions.json before you write any code.
 */

const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// TODO SE-003: register the JSON body parser and CORS here, before any routes.
// Middleware order matters in Express. Work out why before you move on.
// app.use(cors());
// app.use(express.json());

// Serves /client so http://localhost:3000 loads the UI. Leave this alone.
app.use(express.static(path.join(__dirname, '..', 'client')));

// ---------------------------------------------------------------------------
// Application state. In-memory only - no database in this project.
// ---------------------------------------------------------------------------

// TODO SE-002: normalise dates.
const REQUIRED_FIELDS = [
  'id',
  'amount',
  'sender',
  'receiver',
  'date',
  'flag_reason',
  'status',
  'risk_score',
  'account_ref',
];

const dataPath = path.join(__dirname, '..', 'data', 'transactions.json');
let transactions = [];
const {loadTransactions} = require('./transactionLoader');
transactions = loadTransactions();

// TODO SE-016: every review decision gets appended here.
const auditLog = [];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// TODO SE-003: return { status: 'ok', uptime: <seconds> }
app.get('/health', notImplemented('SE-003'));

// TODO SE-004: return all transactions, highest risk first.
app.get('/api/transactions', notImplemented('SE-004'));

// TODO SE-005: return one transaction, or 404.
app.get('/api/transactions/:id', notImplemented('SE-005'));

// TODO SE-006: record an approval or rejection. Read every acceptance
// criterion on this story before you design it.
app.post('/api/transactions/:id/review', notImplemented('SE-006'));

// TODO SE-016: return the full audit log.
app.get('/api/audit-log', notImplemented('SE-016'));

function notImplemented(storyId) {
  return (req, res) => {
    res.status(501).json({
      error: 'Not implemented',
      story: storyId,
      hint: 'This route is a scaffold stub. Implement it and delete this handler.',
    });
  };
}

// Only listen when run directly, so tests can import the app without
// starting a second server on the same port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`RAVL Sentinel scaffold listening on http://localhost:${PORT}`);
    console.log(`Loaded ${transactions.length} transactions.`);
    // console.log(transactions);
    console.log('Nothing is implemented yet. SE-002 and SE-003 are the way in.');
  });
}

module.exports = app;
