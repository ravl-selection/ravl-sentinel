# RAVL Sentinel v0.1 - Backlog

The same 22 stories as your printed copy. You will not complete all of them. That is intentional. Prioritise, assign, and ship the most valuable work first.

**Size:** S = roughly 20-30 min · M = 45-60 min · L = 90+ min

| ID | Epic | Story | Size | Priority |
| --- | --- | --- | --- | --- |
| SE-001 | Foundation | Project setup and shared repository | S | CRITICAL |
| SE-002 | Foundation | Load and validate transaction data | S | CRITICAL |
| SE-003 | Foundation | Basic Express server with health check | S | CRITICAL |
| SE-004 | API | GET all pending transactions | M | HIGH |
| SE-005 | API | GET single transaction by ID | S | HIGH |
| SE-006 | API | POST review decision (approve or reject) | M | HIGH |
| SE-007 | UI | Transaction list view | M | HIGH |
| SE-008 | UI | Transaction detail panel | M | HIGH |
| SE-009 | UI | Approve and reject action buttons | M | HIGH |
| SE-010 | Filter and sort | Filter transactions by status | S | MEDIUM |
| SE-011 | Filter and sort | Filter by risk score band | S | MEDIUM |
| SE-012 | Filter and sort | Sort by amount or date | S | MEDIUM |
| SE-013 | Business logic | Risk score colour coding | S | MEDIUM |
| SE-014 | Business logic | Transaction age warning | S | MEDIUM |
| SE-015 | Business logic | Batch approve low-risk transactions | L | LOW |
| SE-016 | Audit and compliance | Server-side audit log | S | LOW |
| SE-017 | Audit and compliance | Audit log UI panel | S | LOW |
| SE-018 | Quality | Input validation on review endpoint | S | MEDIUM |
| SE-019 | Quality | API test suite (minimum 3 tests) | M | LOW |
| SE-020 | Quality | README with setup and API documentation | S | LOW |
| SE-021 | Bonus | Pagination (20 transactions per page) | L | BONUS |
| SE-022 | Bonus | Export audit log as CSV | M | BONUS |

---

## SE-001 - Project setup and shared repository

**Epic:** Foundation · **Size:** S · **Priority:** CRITICAL

As a team, I need a shared codebase so all engineers can contribute without conflicts.

**Acceptance criteria**

- [ ] Git repository created; all 12 team members have clone and push access
- [ ] package.json present with dependencies: express, cors, nodemon
- [ ] Folder structure exists: /server/index.js /client/index.html /data/transactions.json /tests/
- [ ] Running 'npm start' boots the server without errors
- [ ] A shared branching convention is agreed and communicated to the team

## SE-002 - Load and validate transaction data

**Epic:** Foundation · **Size:** S · **Priority:** CRITICAL

As a developer, I need to load transaction data from the provided JSON file so the API has data to serve.

**Acceptance criteria**

- [ ] transactions.json loads successfully on server start
- [ ] Server logs the number of records loaded (e.g. 'Loaded 10 transactions')
- [ ] Data is validated on load - any records with missing required fields are logged as warnings
- [ ] Date fields are normalised to ISO 8601 format regardless of input format
- [ ] Server still starts even if individual records fail validation (graceful degradation)

## SE-003 - Basic Express server with health check

**Epic:** Foundation · **Size:** S · **Priority:** CRITICAL

As an operator, I need confirmation the system is running so I know it is safe to use.

**Acceptance criteria**

- [ ] GET /health returns HTTP 200 with JSON body: { status: 'ok', uptime: <seconds> }
- [ ] Server logs startup message including port number
- [ ] CORS is enabled (frontend can call the API from a different port)
- [ ] express.json() middleware registered before all routes

## SE-004 - GET all pending transactions

**Epic:** API · **Size:** M · **Priority:** HIGH

As a reviewer, I need to see all flagged transactions so I can begin my review queue.

**Acceptance criteria**

- [ ] GET /api/transactions returns HTTP 200 with a JSON array of all transactions
- [ ] Response includes all fields: id, amount, sender, receiver, date, flag_reason, status, risk_score
- [ ] Transactions are returned ordered by risk_score descending (highest risk first) by default
- [ ] Returns an empty array (not an error) if no transactions exist
- [ ] Response time under 200ms for the provided dataset

## SE-005 - GET single transaction by ID

**Epic:** API · **Size:** S · **Priority:** HIGH

As a reviewer, I need to fetch a specific transaction so I can see its full details before making a decision.

**Acceptance criteria**

- [ ] GET /api/transactions/:id returns HTTP 200 with the matching transaction object
- [ ] Returns HTTP 404 with { error: 'Transaction not found' } if the ID does not exist
- [ ] ID matching is case-insensitive and tolerates leading zeros

## SE-006 - POST review decision (approve or reject)

**Epic:** API · **Size:** M · **Priority:** HIGH

As a reviewer, I need to submit my approval or rejection decision so the transaction is actioned.

**Acceptance criteria**

- [ ] POST /api/transactions/:id/review accepts body: { decision: 'APPROVED' | 'REJECTED', reason: string, reviewer: string }
- [ ] Returns HTTP 200 with the updated transaction object on success
- [ ] Returns HTTP 400 if decision, reason or reviewer fields are missing or empty
- [ ] Returns HTTP 404 if the transaction ID is not found
- [ ] IMPORTANT: transactions with amount over $10,000 must enter 'AWAITING_SECOND_APPROVAL' status after first review - a second distinct reviewer must approve before status becomes APPROVED
- [ ] Second approval for over $10K is rejected if the reviewer name matches the first reviewer
- [ ] Decision is appended to the in-memory audit log

## SE-007 - Transaction list view

**Epic:** UI · **Size:** M · **Priority:** HIGH

As a reviewer, I need to see all flagged transactions in a table so I can quickly scan and prioritise.

**Acceptance criteria**

- [ ] Table displays: ID, Sender, Amount (formatted as $), Risk Score, Date, Status, and a 'Review' button
- [ ] Table is populated by fetching from GET /api/transactions on page load
- [ ] Clicking a row or Review button populates the detail panel (SE-008)
- [ ] Page shows a loading state while fetching data
- [ ] Page shows an error message if the API call fails

## SE-008 - Transaction detail panel

**Epic:** UI · **Size:** M · **Priority:** HIGH

As a reviewer, I need to see all details of a selected transaction before making my decision.

**Acceptance criteria**

- [ ] Detail panel shows all transaction fields in a readable layout
- [ ] Panel is empty or hidden when no transaction is selected
- [ ] Panel updates immediately when a different row is selected
- [ ] For transactions with status AWAITING_SECOND_APPROVAL, panel shows who gave first approval, their reason, and a warning that a second reviewer is required

## SE-009 - Approve and reject action buttons

**Epic:** UI · **Size:** M · **Priority:** HIGH

As a reviewer, I need buttons to approve or reject a transaction directly from the detail panel.

**Acceptance criteria**

- [ ] Approve and Reject buttons are visible in the detail panel for PENDING transactions
- [ ] Clicking either button opens a reason input field (required, minimum 10 characters)
- [ ] Reviewer name field is required before submission
- [ ] Submitting calls POST /api/transactions/:id/review
- [ ] On success: button shows confirmation, transaction status in the list updates without a full page reload
- [ ] On error: error message is displayed inline
- [ ] Buttons are hidden (not just disabled) for already-resolved transactions

## SE-010 - Filter transactions by status

**Epic:** Filter and sort · **Size:** S · **Priority:** MEDIUM

As a reviewer, I need to filter the list by status so I can focus on what needs action.

**Acceptance criteria**

- [ ] Dropdown filter with options: All, Pending, Awaiting Second Approval, Approved, Rejected
- [ ] Filter applies immediately without a page reload
- [ ] Active filter is visually indicated
- [ ] Filter state persists when a transaction detail is opened and closed
- [ ] Filter and sort (SE-012) must work together simultaneously

## SE-011 - Filter by risk score band

**Epic:** Filter and sort · **Size:** S · **Priority:** MEDIUM

As a reviewer, I need to filter by risk level so I can triage the highest-risk items first.

**Acceptance criteria**

- [ ] Toggle buttons or dropdown: All | High Risk (70+) | Medium Risk (40-69) | Low Risk (under 40)
- [ ] Filter stacks with the status filter (SE-010) - both can be active at once
- [ ] Count badge next to each filter option shows how many transactions match

## SE-012 - Sort by amount or date

**Epic:** Filter and sort · **Size:** S · **Priority:** MEDIUM

As a reviewer, I need to sort the list so I can work through transactions in a logical order.

**Acceptance criteria**

- [ ] Sort dropdown: Default (risk desc), Amount (high to low), Amount (low to high), Date (newest), Date (oldest)
- [ ] Sort applies to the currently filtered list, not the full dataset
- [ ] Sort direction arrow shown in the column header when active

## SE-013 - Risk score colour coding

**Epic:** Business logic · **Size:** S · **Priority:** MEDIUM

As a reviewer, I need visual risk indicators so I can instantly see which transactions need urgent attention.

**Acceptance criteria**

- [ ] Risk score displayed as a coloured badge: green (0-39), amber (40-69), red (70-100)
- [ ] Colour coding applies consistently in both the list view and the detail panel
- [ ] Colour coding does not rely on inline styles - uses CSS classes

## SE-014 - Transaction age warning

**Epic:** Business logic · **Size:** S · **Priority:** MEDIUM

As a reviewer, I need to know when transactions have been waiting too long so I can prioritise stale items.

**Acceptance criteria**

- [ ] Transactions older than 48 hours from the current time display an 'OVERDUE' warning badge
- [ ] Warning visible in both the list and detail views
- [ ] Age calculation uses the normalised date from SE-002, not raw string comparison
- [ ] Tooltip or label explains what the warning means

## SE-015 - Batch approve low-risk transactions

**Epic:** Business logic · **Size:** L · **Priority:** LOW

As a senior reviewer, I need to approve multiple low-risk transactions at once to clear the queue faster.

**Acceptance criteria**

- [ ] Checkboxes appear on each row for transactions with risk_score under 40 and status PENDING
- [ ] An 'Approve Selected' button submits all checked transactions with a single reason
- [ ] Batch approval follows the same rules as individual approval (SE-006)
- [ ] Progress indicator shows X of Y approved during the operation

## SE-016 - Server-side audit log

**Epic:** Audit and compliance · **Size:** S · **Priority:** LOW

As a compliance officer, I need every review decision recorded so we have a full audit trail.

**Acceptance criteria**

- [ ] Every POST to /api/transactions/:id/review appends to an in-memory audit log
- [ ] Each log entry contains: timestamp (ISO 8601), transaction_id, reviewer, decision, reason
- [ ] GET /api/audit-log returns the full log as a JSON array
- [ ] Log is ordered chronologically (oldest first)
- [ ] Audit log is NOT reset when a transaction status is changed

## SE-017 - Audit log UI panel

**Epic:** Audit and compliance · **Size:** S · **Priority:** LOW

As an operator, I need to see the audit log in the UI so I can confirm decisions are being recorded.

**Acceptance criteria**

- [ ] Collapsible section or separate tab shows the audit log
- [ ] Columns: Timestamp, Transaction ID, Reviewer, Decision, Reason
- [ ] Log auto-refreshes every 10 seconds, or refreshes after each decision
- [ ] Empty state message shown when no decisions have been made yet

## SE-018 - Input validation on review endpoint

**Epic:** Quality · **Size:** S · **Priority:** MEDIUM

As a developer, I need the API to validate all inputs so bad data cannot corrupt the audit trail.

**Acceptance criteria**

- [ ] POST /api/transactions/:id/review rejects with HTTP 400 if: decision is not APPROVED or REJECTED, reason is empty or under 10 characters, reviewer is empty or missing
- [ ] Error response includes a clear human-readable message identifying the invalid field
- [ ] Validation errors are logged server-side as WARN

## SE-019 - API test suite (minimum 3 tests)

**Epic:** Quality · **Size:** M · **Priority:** LOW

As a team, I need automated tests so we can verify the API works correctly before the demo.

**Acceptance criteria**

- [ ] Test file at /tests/api.test.js using any test framework (node:test, jest, mocha, or plain asserts)
- [ ] Tests cover: GET /api/transactions returns an array, POST review with valid data returns 200, POST review with a missing reason returns 400
- [ ] Tests can be run with: npm test
- [ ] All tests pass against the current implementation

## SE-020 - README with setup and API documentation

**Epic:** Quality · **Size:** S · **Priority:** LOW

As a new team member, I need a README so I can understand and run the project without asking anyone.

**Acceptance criteria**

- [ ] README includes a one-line project description, prerequisites (Node version), setup steps (clone, npm install, npm start), and all API endpoints documented with method, path, request body and response shape
- [ ] A team member who has not seen the code can follow the README and get the server running
- [ ] API docs include the dual-approval rule for transactions over $10,000

## SE-021 - Pagination (20 transactions per page)

**Epic:** Bonus · **Size:** L · **Priority:** BONUS

As a reviewer, I need pagination so the UI stays responsive with large transaction volumes.

**Acceptance criteria**

- [ ] List displays a maximum of 20 transactions per page
- [ ] Previous and Next buttons navigate pages
- [ ] Current page and total pages displayed
- [ ] Page resets to 1 when filter or sort changes

## SE-022 - Export audit log as CSV

**Epic:** Bonus · **Size:** M · **Priority:** BONUS

As a compliance officer, I need to download the audit log as a CSV so I can share it with regulators.

**Acceptance criteria**

- [ ] Download button on the audit log panel triggers a CSV download
- [ ] CSV includes all audit log fields with a header row
- [ ] Filename includes the current date: ravl-audit-YYYY-MM-DD.csv
