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
