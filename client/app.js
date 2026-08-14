/**
 * RAVL Sentinel v0.1 - client.
 *
 * `state` is the single source of truth. Components never keep their own copy
 * of a transaction: they read `state`, render, and subscribe for updates.
 */

async function api(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}

const state = {
  transactions: [],
  auditLogs: [],
  selectedTransactionId: null,
  loading: false,
  error: null,
};

const subscribers = new Set();

function subscribe(listener) {
  subscribers.add(listener);
  listener();
  return () => subscribers.delete(listener);
}

function setState(patch) {
  Object.assign(state, patch);
  subscribers.forEach((listener) => listener());
}

async function loadTransactions() {
  setState({ loading: true, error: null });
  try {
    const transactions = await api('/api/transactions');
    setState({
      transactions,
      selectedTransactionId: state.selectedTransactionId || transactions[0]?.id || null,
      loading: false,
    });
  } catch (error) {
    setState({ loading: false, error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Formatting Helper Functions
// ---------------------------------------------------------------------------

// avoids rendering HTML chars in input
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// show value as CAD decimal value
function formatAmount(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return String(value ?? '');
  return value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

// prase date to readable time
function formatDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value ?? '');
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// SE-007 transaction list view
// ---------------------------------------------------------------------------

const LIST_COLUMNS = ['ID', 'Sender', 'Amount', 'Risk Score', 'Date', 'Status'];

function transactionRowHtml(transaction) {
  return `
    <tr>
      <td>${escapeHtml(transaction.id)}</td>
      <td>${escapeHtml(transaction.sender)}</td>
      <td>${escapeHtml(formatAmount(transaction.amount))}</td>
      <td>${escapeHtml(transaction.risk_score)}</td>
      <td>${escapeHtml(formatDate(transaction.date))}</td>
      <td>${escapeHtml(transaction.status)}</td>
    </tr>`;
}

function transactionTableHtml(transactions) {
  return `
    <table>
      <thead>
        <tr>${LIST_COLUMNS.map((label) => `<th>${label}</th>`).join('')}</tr>
      </thead>
      <tbody>${transactions.map(transactionRowHtml).join('')}
      </tbody>
    </table>`;
}

function renderTransactionList() {
  const root = document.querySelector('#transaction-list');
  if (!root) return;

  if (state.loading) {
    root.innerHTML = '<p>Loading transactions...</p>';
    return;
  }
  if (state.error) {
    root.innerHTML = `<p>Could not load transactions: ${escapeHtml(state.error)}</p>`;
    return;
  }
  if (!state.transactions.length) {
    root.innerHTML = '<p>No transactions to review.</p>';
    return;
  }

  root.innerHTML = transactionTableHtml(state.transactions);
}

console.log('RAVL Sentinel client loaded. Nothing implemented yet.');

// SE-008 - Transaction detail panel

// Renders the detail panel for a given transaction, or shows the empty state
// if no transaction is currently selected.
function renderDetailPanel(transaction) {
  const panel = document.getElementById('detailPanel');

  // No transaction selected — show the empty state, per acceptance criteria.
  if (!transaction) {
    panel.innerHTML = '<p class="empty-state">Select a transaction to view details.</p>';
    return;
  }

  // Build the base detail view. This always fully replaces the panel's
  // content, so it always reflects exactly the currently selected transaction.
  let html = `
    <p><strong>ID:</strong> ${transaction.id}</p>
    <p><strong>Risk:</strong> ${transaction.risk_score}</p>
    <p><strong>Sender:</strong> ${transaction.sender}</p>
    <p><strong>Receiver:</strong> ${transaction.receiver}</p>
    <p><strong>Amount:</strong> $${transaction.amount.toLocaleString()}</p>
    <p><strong>Flag:</strong> ${transaction.flag_reason}</p>
    <p><strong>Status:</strong> ${transaction.status}</p>
  `;

  // Special case required by SE-008: if a transaction is waiting on a second
  // approver, show who approved first, their reason, and a warning banner.
  if (transaction.status === 'AWAITING_SECOND_APPROVAL' && transaction.first_approval) {
    html += `
      <div class="second-approval-warning">
        <strong>⚠ Awaiting second approval</strong>
        <p>First approved by: ${transaction.first_approval.reviewer}</p>
        <p>Reason given: ${transaction.first_approval.reason}</p>
        <p>A different reviewer must approve before this is finalized.</p>
      </div>
    `;
  }

  // Only show the review form (justification, reviewer name, approve/reject)
  // for transactions still awaiting a decision — PENDING or waiting on a
  // second, different approver. Resolved transactions shouldn't show it at all.
  const canReview = transaction.status === 'PENDING' || transaction.status === 'AWAITING_SECOND_APPROVAL';

  if (canReview) {
    html += `
      <label for="reviewReason">Justification:</label>
      <input type="text" id="reviewReason" placeholder="Enter justification">

      <label for="reviewerName">Reviewer:</label>
      <input type="text" id="reviewerName" placeholder="Enter reviewer name">

      <button id="approveBttn">Approve</button>
      <button id="rejectBttn">Reject</button>
    `;
  }

  panel.innerHTML = html;

  // The approve/reject buttons only exist in the DOM after the line above,
  // so their click listeners have to be attached here, after each render —
  // not once at page load, since the panel's HTML gets fully replaced every time.
  if (canReview) {
    document.getElementById('approveBttn').addEventListener('click', () => submitReview(transaction.id, 'APPROVED'));
    document.getElementById('rejectBttn').addEventListener('click', () => submitReview(transaction.id, 'REJECTED'));
  }
}

// Placeholder for whoever wires up SE-006 — this is the shape SE-008 expects
// to call once the review endpoint exists.
function submitReview(transactionId, decision) {
  const reason = document.getElementById('reviewReason').value;
  const reviewer = document.getElementById('reviewerName').value;
  console.log('submit review (not yet wired to SE-006):', { transactionId, decision, reason, reviewer });
}
document.addEventListener('DOMContentLoaded', () => {
  subscribe(renderTransactionList);
  loadTransactions();
});
