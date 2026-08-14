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

//Tracks current Filter status
let currentStatusFilter = 'All';

function filterByStatus(transactions, status) {

  //Status ALL, transactions remain unchanged  
  if (status === 'All') {
    return transactions; 
  }
  // Otherwise, keep only the transactions whose status field matches exactly.
  return transactions.filter(t => t.status === status);
}

// Grab the <select> dropdown element from the page by its id.
const statusFilterEl = document.getElementById('statusFilter');

//Listen for change event for status dropdown
statusFilterEl.addEventListener('change', (e) => {
  //Change current Status
  currentStatusFilter = e.target.value;

  // Re-run the filtering logic and re-render now that the selection changed.
  onStatusFilterChange();
});
























// Called every time the status filter changes.
function onStatusFilterChange() {
  // Apply the filter against the full transaction list.
  // allTransactions is assumed to come from wherever the list-view owner stores fetched data.
  const filtered = filterByStatus(allTransactions, currentStatusFilter);

  // Hand the filtered array off to whatever function actually redraws the table.
  // This is the one integration point with the teammate building the list view (SE-007).
  renderTransactionList(filtered);

  // Visually mark which option is active, per the acceptance criteria.
  highlightActiveStatus(currentStatusFilter);
}

// Adds a CSS class to show which filter is currently selected.
// Assumes each <option> or a wrapping element can carry an 'active' class for styling.
function highlightActiveStatus(status) {
  // Remove the 'active' class from every status option first,
  // so only one is ever marked active at a time.
  document.querySelectorAll('.status-option').forEach(el => {
    el.classList.remove('active');
  });

  // Add 'active' back onto the one that matches the current selection.
  const activeEl = document.querySelector(`.status-option[data-status="${status}"]`);
  if (activeEl) {
    activeEl.classList.add('active');
  }
}

// Placeholder for the shared, in-memory list of transactions.
// In the real app this gets populated once from the GET /api/transactions call
// and updated whenever a transaction's status changes (e.g. after a review decision).
let allTransactions = [];

// Called once, when the page first loads, to populate allTransactions
// and render the unfiltered list before any filter is touched.
function initStatusFilter(transactions) {
  allTransactions = transactions; // store the fetched data for later filtering
  onStatusFilterChange(); // render immediately with the default 'All' filter
}
