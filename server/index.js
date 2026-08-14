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
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS and the JSON body parser are registered before any routes as middleware order matters in Express.
app.use(cors());
app.use(express.json());

// Serves /client so http://localhost:3000 loads the UI. Leave this alone.
app.use(express.static(path.join(__dirname, '..', 'client')));

// ---------------------------------------------------------------------------
// Application state. In-memory only - no database in this project.
// ---------------------------------------------------------------------------

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

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// TODO SE-004: return all transactions, highest risk first.
// app.get('/api/transactions', notImplemented('SE-004'));

app.get('/api/transactions', (req, res) => {
  const sortedTransactions = transactions
      .filter(t => t.status === 'PENDING')
      .sort((a, b) => b.risk_score - a.risk_score);
    res.status(200).json(sortedTransactions);
})

app.get('/api/transactions/:id', (req, res) => {
  const requestedId = req.params.id;
  const numericId = Number(requestedId);

  const transaction = transactions.find((record) => {
    // Number(requestedId) is NaN when the id is not numeric (e.g. "abc") so
    // fall back to a string comparison. Otherwise compare as numbers.
    if (Number.isNaN(numericId)) {
      return String(record.id).toLowerCase() === requestedId.toLowerCase();
    }
    return Number(record.id) === numericId;
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.status(200).json(transaction);
});

// TODO SE-006: record an approval or rejection. Read every acceptance
// criterion on this story before you design it.
app.post('/api/transactions/:id/review', express.json(), (req, res) => {
  const transaction = transactions.find((item) => String(item.id) === req.params.id);

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const { decision, reason, reviewer } = req.body || {};
  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be APPROVED or REJECTED' });
  }
  if (typeof reason !== 'string' || !reason.trim()) {
    return res.status(400).json({ error: 'reason is required' });
  }
  if (typeof reviewer !== 'string' || !reviewer.trim()) {
    return res.status(400).json({ error: 'reviewer is required' });
  }

  const normalizedReviewer = reviewer.trim();
  const normalizedReason = reason.trim();
  const firstApproval = auditLog.find(
    (entry) => entry.transaction_id === transaction.id && entry.decision === 'APPROVED',
  );

  if (Number(transaction.amount) > 10000 && decision === 'APPROVED') {
    if (transaction.status === 'AWAITING_SECOND_APPROVAL') {
      if (firstApproval && firstApproval.reviewer.toLowerCase() === normalizedReviewer.toLowerCase()) {
        return res.status(400).json({ error: 'Second approval requires a different reviewer' });
      }
      transaction.status = 'APPROVED';
    } else {
      transaction.status = 'AWAITING_SECOND_APPROVAL';
      transaction.first_approval = {
        reviewer: normalizedReviewer,
        reason: normalizedReason,
      }
    }
  } else {
    transaction.status = decision;
  }

  auditLog.push({
    timestamp: new Date().toISOString(),
    transaction_id: transaction.id,
    reviewer: normalizedReviewer,
    decision,
    reason: normalizedReason,
  });

  return res.status(200).json(transaction);
});

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
    console.log(`RAVL Sentinel listening on http://localhost:${PORT}`);
    console.log(`Loaded ${transactions.length} transactions.`);
    // console.log(transactions);
    console.log('Nothing is implemented yet. SE-002 and SE-003 are the way in.');
  });
}

module.exports = app;
