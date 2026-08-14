/**
 * RAVL Sentinel v0.1 - client.
 *
 * SE-010, SE-011 and SE-012 all change which transactions
 * are displayed on screen.
 */

// TODO SE-007: fetch GET /api/transactions and render the list.


// SE-012: Sort transactions

let currentSort = 'risk-desc';

const sortOptions = [
    { value: 'risk-desc', label: 'Sort: Risk ↓' },
    { value: 'risk-asc', label: 'Sort: Risk ↑' },
    { value: 'amount-desc', label: 'Sort: Amount ↓' },
    { value: 'amount-asc', label: 'Sort: Amount ↑' },
    { value: 'date-desc', label: 'Sort: Date ↓' },
    { value: 'date-asc', label: 'Sort: Date ↑' }
];

let currentSortIndex = 0;


/**
 * Sorts the provided transaction list.
 *
 * IMPORTANT:
 * SE-010 and SE-011 should filter the transactions first,
 * then pass the filtered list into this function.
 */
function sortTransactions(transactions) {
    const sorted = [...transactions];

    switch (currentSort) {

        // Risk: highest to lowest
        case 'risk-desc':
            return sorted.sort(
                (a, b) => b.risk_score - a.risk_score
            );

        // Risk: lowest to highest
        case 'risk-asc':
            return sorted.sort(
                (a, b) => a.risk_score - b.risk_score
            );

        // Amount: highest to lowest
        case 'amount-desc':
            return sorted.sort(
                (a, b) => b.amount - a.amount
            );

        // Amount: lowest to highest
        case 'amount-asc':
            return sorted.sort(
                (a, b) => a.amount - b.amount
            );

        // Date: newest first
        case 'date-desc':
            return sorted.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

        // Date: oldest first
        case 'date-asc':
            return sorted.sort(
                (a, b) => new Date(a.date) - new Date(b.date)
            );

        default:
            return sorted;
    }
}


// SE-012 sort button
const sortButton = document.getElementById('sortButton');

if (sortButton) {
    sortButton.addEventListener('click', () => {

        // Move to the next sorting option
        currentSortIndex =
            (currentSortIndex + 1) % sortOptions.length;

        // Update sorting state
        currentSort = sortOptions[currentSortIndex].value;

        // Update button text
        sortButton.textContent =
            sortOptions[currentSortIndex].label;

        /*
         * Once SE-007/010/011 implement the shared render flow,
         * call that render function here.
         *
         * Example:
         *
         * renderTransactions();
         */
    });
}


console.log('RAVL Sentinel client loaded.');