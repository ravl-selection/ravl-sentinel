const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = [
  'id', 'amount', 'sender', 'receiver', 'date',
  'flag_reason', 'status', 'risk_score', 'account_ref',
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const SLASH_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

// Converts a date string to ISO 8601. Handles already-ISO strings and
// slash-separated dates where the day/month order can be determined
// unambiguously (one component > 12). Falls back to MM/DD/YYYY when
// genuinely ambiguous (both components <= 12).
function normalizeDate(raw) {
  if (ISO_DATE.test(raw)) {
    return { iso: new Date(raw).toISOString(), assumed: false };
  }

  const match = SLASH_DATE.exec(raw);
  if (!match) return null;

  const [, a, b, year] = match;
  const [n1, n2] = [+a, +b];

  if (n1 > 12 && n2 <= 12) {
    return { iso: new Date(Date.UTC(+year, n2 - 1, n1)).toISOString(), assumed: false }; // forced DD/MM
  }
  if (n2 > 12 && n1 <= 12) {
    return { iso: new Date(Date.UTC(+year, n1 - 1, n2)).toISOString(), assumed: false }; // forced MM/DD
  }

  return { iso: new Date(Date.UTC(+year, n1 - 1, n2)).toISOString(), assumed: true }; // ambiguous, default MM/DD
}

function validateTransaction(record, index) {
  const issues = [];
  const label = record.id !== undefined ? `id:${record.id}` : `index ${index}`;

  const missing = REQUIRED_FIELDS.filter((f) => !(f in record));
  if (missing.length) {
    issues.push(`missing ${missing.join(', ')}`);
  }

  if (record.date) {
    const result = normalizeDate(record.date);
    if (result) {
      if (result.assumed) {
        issues.push(`date format ambiguous, assumed MM/DD/YYYY: ${record.date}`);
      }
      record.date = result.iso;
    } else {
      issues.push(`unrecognised date format: ${record.date}`);
    }
  }

  if (issues.length) {
    console.warn(`${label} ${issues.join('; ')}`);
  }

  return record;
}

function loadTransactions(dataPath = path.join(__dirname, '..', 'data', 'transactions.json')) {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (err) {
    console.error(`Failed to load transactions from ${dataPath}:`, err.message);
    return [];
  }

  return raw.map(validateTransaction);
}

module.exports = { loadTransactions };
