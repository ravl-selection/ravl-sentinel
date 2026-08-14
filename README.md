# RAVL Sentinel v0.1

Transaction review dashboard for Northfield Bank compliance operations. Built during the RAVL Selection Day build sprint.

This repository is a scaffold. It boots, serves a page, and implements none of the features. That part is yours.

---

## Get running (do this first, in the planning hour)

```bash
git clone <this repo url>
cd ravl-sentinel
npm install
npm start
```

Then open http://localhost:3000. You should see the Sentinel header and a note saying nothing is built yet. If you see that, your environment is good.

`npm run dev` does the same thing with auto-restart on file changes.

`npm test` runs the test suite. It passes on a fresh clone, against a scaffold that returns 501 for everything. That is not a signal that anything works.

**Requirements:** Node.js 18 or newer, npm, git. Check with `node --version`.

---

## What is already here

| Path | State |
| --- | --- |
| `server/index.js` | Boots on port 3000, serves the client, five API routes stubbed with `501 Not Implemented` |
| `client/index.html` | Page shell with the header and an empty `<main>` |
| `client/app.js` | Empty |
| `client/styles.css` | Reset, header, nothing else |
| `data/transactions.json` | 10 records. Read this file before you write code. |
| `tests/api.test.js` | Runner wired up, one placeholder test |
| `BACKLOG.md` | The 22 stories, same content as your printed copy |

Every stub carries a `TODO SE-0xx` comment matching a story ID in the backlog.

---

## Ground rules

- **No CDN links, no external HTTP calls.** No Bootstrap, no jQuery, no Google Fonts, no third-party APIs. Everything the browser loads comes from this repo. The bank's environment blocks outbound requests.
- **No database.** State lives in memory in the server process. Restarting the server resets it. That is expected.
- **The data file is the data file.** Do not hand-edit `data/transactions.json` to make a feature easier. If you think a record is wrong, that is a finding, not a licence to change it.

---

## Team conventions

Agree these in the planning hour and write them down here. Twelve people pushing to one repo without an agreed convention is the single fastest way to lose the afternoon.

**Branching:** Ticket ID

**Commits:** Everyone should follow this convention: https://www.conventionalcommits.org/en/v1.0.0/ 

**Who merges to `main`:** Chris and Frick

**Shared client state (SE-010 / SE-011 / SE-012 all change what is on screen):** Jacky, Faraaz, Ahmad (if time persists)

---

## API

_SE-020 asks you to document every endpoint here: method, path, request body, response shape, and the approval rules. Deliberately left empty._

| Method | Path | Purpose | Status |
| --- | --- | --- | --- |
| GET | `/health` | Liveness check | Not implemented (SE-003) |
| GET | `/api/transactions` | List all flagged transactions | Not implemented (SE-004) |
| GET | `/api/transactions/:id` | One transaction | Not implemented (SE-005) |
| POST | `/api/transactions/:id/review` | Record an approve or reject decision | Not implemented (SE-006) |
| GET | `/api/audit-log` | Full decision trail | Not implemented (SE-016) |

---

## Definition of done

Evaluators check all five in the demo.

- [ ] The server starts without errors on `npm start`.
- [ ] The UI loads in a browser and displays transaction data fetched from the API.
- [ ] A reviewer can select a transaction, enter a reason, and submit an approval or rejection.
- [ ] The decision is recorded and visible in the audit log.
- [ ] The application works with no errors in the browser console during the demo.
