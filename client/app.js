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

document.addEventListener('DOMContentLoaded', () => {
  subscribe(renderTransactionList);
  loadTransactions();
});
