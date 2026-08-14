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
