#!/usr/bin/env node
/**
 * Re-anchors data/transactions.json to a different run date.
 *
 * The dataset is tuned for Friday 14 August 2026. Two records sit deliberately
 * either side of the 48-hour OVERDUE line (SE-014), so if you run this case
 * study on another date the boundary stops testing anything.
 *
 * This shifts every date by whole days, which preserves each record's format
 * (ISO 8601, MM/DD/YYYY, DD/MM/YYYY) and every relative gap between records.
 *
 *   node scripts/reseed-dates.mjs 2026-11-06
 *   node scripts/reseed-dates.mjs 2026-11-06 --dry-run
 *
 * Facilitator tool. Run it before you push the repo, not during the sprint.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ANCHOR = '2026-08-14';
const DAY_MS = 86400000;

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = join(here, '..', 'data', 'transactions.json');

const target = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!/^\d{4}-\d{2}-\d{2}$/.test(target ?? '')) {
  console.error('Usage: node scripts/reseed-dates.mjs YYYY-MM-DD [--dry-run]');
  process.exit(1);
}

const shiftDays = Math.round(
  (Date.parse(`${target}T00:00:00Z`) - Date.parse(`${ANCHOR}T00:00:00Z`)) / DAY_MS
);

if (shiftDays === 0) {
  console.log(`Already anchored to ${ANCHOR}. Nothing to do.`);
  process.exit(0);
}

/** Detects the format of a date string and shifts it, keeping that format. */
function shift(value) {
  // ISO 8601 with time and Z
  let m = /^(\d{4})-(\d{2})-(\d{2})(T.*)$/.exec(value);
  if (m) {
    const d = new Date(Date.parse(value) + shiftDays * DAY_MS);
    return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }

  // MM/DD/YYYY or DD/MM/YYYY - ambiguous by design, so read the parts and
  // rebuild in the same order rather than trusting Date parsing.
  m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (m) {
    const [, a, b, year] = m;
    const aNum = Number(a);
    const bNum = Number(b);
    // If the first part cannot be a month, this record is DD/MM/YYYY.
    const dayFirst = aNum > 12;
    const month = dayFirst ? bNum : aNum;
    const day = dayFirst ? aNum : bNum;
    const shifted = new Date(Date.UTC(Number(year), month - 1, day) + shiftDays * DAY_MS);
    const yy = shifted.getUTCFullYear();
    const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(shifted.getUTCDate()).padStart(2, '0');
    return dayFirst ? `${dd}/${mm}/${yy}` : `${mm}/${dd}/${yy}`;
  }

  throw new Error(`Unrecognised date format, refusing to guess: ${value}`);
}

const raw = readFileSync(dataPath, 'utf8');
const records = JSON.parse(raw);

// Two-pass replace via placeholders. Some records share a date string, and a
// shifted value could collide with another record's original, so nothing is
// written until every source value has been swapped out. Editing the raw text
// rather than re-serialising keeps the trailing zeros on amounts, the key
// order, and the record with the deliberately missing field all intact.
let output = raw;
const shifted = records.map((record) => ({
  id: record.id,
  from: record.date,
  to: shift(record.date),
}));

shifted.forEach((entry, i) => {
  output = output.replace(`"date": "${entry.from}"`, `"date": "@@${i}@@"`);
});
shifted.forEach((entry, i) => {
  output = output.replace(`"date": "@@${i}@@"`, `"date": "${entry.to}"`);
  console.log(`  id ${String(entry.id).padStart(2)}  ${entry.from}  ->  ${entry.to}`);
});

// One record is DD/MM/YYYY with a day above 12, so new Date() rejects it and
// the bug shows up in the UI as "Invalid Date". If a shift lands that record on
// a day of 12 or less it becomes a valid US date and the nugget goes silent.
const nowAmbiguous = shifted.filter(
  (e) => /^\d{2}\/\d{2}\/\d{4}$/.test(e.from) &&
    Number(e.from.slice(0, 2)) > 12 &&
    Number(e.to.slice(0, 2)) <= 12
);
if (nowAmbiguous.length) {
  console.warn('\nWARNING: the DD/MM/YYYY nugget has gone quiet.');
  for (const e of nowAmbiguous) {
    console.warn(`  id ${e.id}: ${e.from} -> ${e.to} now parses as a valid US date.`);
  }
  console.warn('  Pick a target date one or two days either side, or hand-edit that record so the day is above 12.');
}

if (dryRun) {
  console.log(`\nDry run. ${shiftDays > 0 ? '+' : ''}${shiftDays} days, nothing written.`);
} else {
  writeFileSync(dataPath, output);
  console.log(`\nRe-anchored to ${target} (${shiftDays > 0 ? '+' : ''}${shiftDays} days).`);
  console.log('Update the ANCHOR constant in this script if you want the new date to be the baseline.');
}
