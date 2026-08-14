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

// TODO SE-002: load and validate data/transactions.json on startup, into here.
let transactions = [];

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
    console.log(`RAVL Sentinel scaffold listening on http://localhost:${PORT}`);
    console.log(`Loaded ${transactions.length} transactions.`);
    console.log('Nothing is implemented yet. SE-002 and SE-003 are the way in.');
  });
}

module.exports = app;
