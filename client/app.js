/**
 * RAVL Sentinel v0.1 - client.
 *
 * Empty on purpose. How you structure this is your call.
 *
 * One thing worth deciding as a team before anyone writes code: SE-010,
 * SE-011 and SE-012 all change which transactions are on screen. Agree how
 * that is held and updated before three people build three of them.
 */

// TODO SE-007: fetch GET /api/transactions and render the list.

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
};

async function setInitState() {
    try {
    const [transactions, auditLogs] = await Promise.all([
      api("/api/transaction"),
      api("/api/audit-log")
    ]);

    state.transactions = transactions;
    state.auditLogs = auditLogs;
    state.selectedTransactionId = state.transactions[0]?.id || null;

   } catch (error) {
    console.error("Failed to initialize app state:", error);
  }
}

function setFilterState(){

}

console.log('RAVL Sentinel client loaded. Nothing implemented yet.');

setInitState()


