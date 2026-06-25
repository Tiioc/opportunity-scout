// store.js — persistent memory of everything examined, so the engine never repeats itself.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_OFF_LIMITS } from './patterns.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(HERE, '..', 'data', 'researched-ideas.json');

export function normalizeName(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function loadStore() {
  if (!existsSync(DATA_PATH)) {
    return { offLimits: [...SEED_OFF_LIMITS], kept: [], killed: [] };
  }
  const raw = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  return {
    offLimits: raw.offLimits || [...SEED_OFF_LIMITS],
    kept: raw.kept || [],
    killed: raw.killed || [],
  };
}

export function saveStore(store) {
  mkdirSync(dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(store, null, 2) + '\n');
}

// Everything the model must avoid re-suggesting: explicit off-limits + every name seen.
export function offLimitsList(store) {
  const seen = [...store.kept, ...store.killed].map((i) => i.name);
  return [...new Set([...store.offLimits, ...seen])];
}

export function isDuplicate(store, name) {
  const n = normalizeName(name);
  const all = [...store.offLimits, ...store.kept.map((i) => i.name), ...store.killed.map((i) => i.name)];
  return all.some((x) => normalizeName(x) === n);
}

// Record a round's results into the store (deduped).
export function recordResults(store, ideas, dateISO) {
  for (const idea of ideas) {
    if (isDuplicate(store, idea.name)) continue;
    const entry = {
      name: idea.name,
      date: dateISO,
      score: idea?.score?.total ?? null,
      summary: idea.oneLiner || '',
    };
    if (idea.verdict === 'keep') store.kept.push(entry);
    else store.killed.push({ ...entry, killReason: idea.killReason || '' });
  }
  return store;
}
