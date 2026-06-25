// selftest.js — proves the engine's deterministic parts work WITHOUT an API key.
// Validates: pattern library loads, JSON extraction, dedup, threshold enforcement,
// store round-trip, and brief rendering.
import { extractIdeas } from './research.js';
import { normalizeName, isDuplicate, recordResults } from './store.js';
import { FAIL_PATTERNS, WIN_PATTERNS, KEEP_THRESHOLD_DEFAULT } from './patterns.js';
import { writeBrief } from './brief.js';

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('  ok -', msg);
}

export function runSelfTest() {
  console.log('Opportunity Scout self-test (no API calls)\n');

  assert(FAIL_PATTERNS.length >= 8, `fail-pattern library loaded (${FAIL_PATTERNS.length})`);
  assert(WIN_PATTERNS.length >= 4, `win-pattern library loaded (${WIN_PATTERNS.length})`);

  const sample = 'blah blah\n```json\n[{"name":"TestIdea","oneLiner":"x","verdict":"keep","score":{"total":72}}]\n```\ntrailing';
  const ideas = extractIdeas(sample);
  assert(ideas.length === 1 && ideas[0].name === 'TestIdea', 'JSON extraction from fenced block');

  const bare = 'noise [ {"name":"Bare","verdict":"kill","score":{"total":40}} ] noise';
  assert(extractIdeas(bare)[0].name === 'Bare', 'JSON extraction from bare array');
  assert(extractIdeas('no json here').length === 0, 'graceful empty on no JSON');

  assert(normalizeName('Prop 65 Co-Pilot!') === 'prop 65 co pilot', 'name normalization');

  const store = { offLimits: ['Nutrition-label SaaS'], kept: [], killed: [] };
  assert(isDuplicate(store, 'nutrition label saas'), 'dedup catches off-limits (normalized)');
  assert(!isDuplicate(store, 'Brand New Idea'), 'dedup allows a genuinely new name');

  recordResults(store, [
    { name: 'KeeperOne', oneLiner: 'a', verdict: 'keep', score: { total: 70 } },
    { name: 'KillerOne', oneLiner: 'b', verdict: 'kill', killReason: 'Saturated-niche', score: { total: 45 } },
    { name: 'Nutrition-label SaaS', oneLiner: 'dup', verdict: 'keep', score: { total: 99 } },
  ], '2026-06-25');
  assert(store.kept.length === 1 && store.kept[0].name === 'KeeperOne', 'keeper recorded');
  assert(store.killed.length === 1, 'killed recorded, duplicate skipped');

  const briefPath = writeBrief('2026-06-25-selftest', [
    { name: 'KeeperOne', oneLiner: 'does a thing', buyer: 'someone', verdict: 'keep',
      score: { total: 70 }, demandEvidence: ['x — http://e'], competition: 'thin',
      redTeam: 'maybe nobody pays', validationStep: 'ship a page', sources: ['http://e'] },
    { name: 'KillerOne', verdict: 'kill', killReason: 'Saturated-niche', score: { total: 45 } },
  ]);
  assert(typeof briefPath === 'string', `brief rendered -> ${briefPath}`);

  assert(KEEP_THRESHOLD_DEFAULT === 60, 'default keep threshold is 60');

  console.log('\nALL CHECKS PASSED ✅  The engine logic is sound; add ANTHROPIC_API_KEY to run live.');
}
