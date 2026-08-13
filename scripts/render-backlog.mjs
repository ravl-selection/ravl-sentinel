#!/usr/bin/env node
/**
 * Regenerates BACKLOG.md from scripts/backlog.json.
 *
 * backlog.json is the single source of truth for the 22 stories. Edit it, run
 * this, commit both. Facilitator tool, run before the day from the repo root.
 *
 *   node scripts/render-backlog.mjs
 *   node scripts/render-backlog.mjs --check    # exit 1 if BACKLOG.md is stale
 *
 * Needs nothing but Node.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outPath = join(root, 'BACKLOG.md');
const { stories } = JSON.parse(readFileSync(join(here, 'backlog.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');

const lines = [
  '# RAVL Sentinel v0.1 - Backlog',
  '',
  'The same 22 stories as your printed copy. You will not complete all of them. That is intentional. Prioritise, assign, and ship the most valuable work first.',
  '',
  '**Size:** S = roughly 20-30 min · M = 45-60 min · L = 90+ min',
  '',
  '| ID | Epic | Story | Size | Priority |',
  '| --- | --- | --- | --- | --- |',
  ...stories.map((s) => `| ${s.id} | ${s.epic} | ${s.title} | ${s.size} | ${s.priority} |`),
  '',
  '---',
  '',
];

for (const s of stories) {
  lines.push(
    `## ${s.id} - ${s.title}`,
    '',
    `**Epic:** ${s.epic} · **Size:** ${s.size} · **Priority:** ${s.priority}`,
    '',
    s.story,
    '',
    '**Acceptance criteria**',
    '',
    ...s.acceptance.map((a) => `- [ ] ${a}`),
    ''
  );
}

const rendered = lines.join('\n');

if (checkOnly) {
  let current = '';
  try {
    current = readFileSync(outPath, 'utf8');
  } catch {
    console.error('BACKLOG.md does not exist. Run without --check.');
    process.exit(1);
  }
  if (current === rendered) {
    console.log(`BACKLOG.md is up to date (${stories.length} stories).`);
    process.exit(0);
  }
  console.error('BACKLOG.md is stale. Run: node scripts/render-backlog.mjs');
  process.exit(1);
}

writeFileSync(outPath, rendered);
console.log(`Wrote BACKLOG.md (${stories.length} stories).`);
