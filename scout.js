#!/usr/bin/env node
// scout.js — Opportunity Scout CLI.
// Continuously hunts evidence-backed niche software ideas, researches them live
// with web search, red-teams them against a failure-pattern library, scores them,
// keeps only survivors, and never repeats itself.
//
// Usage:
//   node scout.js                      # 1 round, keep threshold 60
//   node scout.js --rounds 3           # 3 research rounds
//   node scout.js --threshold 65       # only keep ideas scoring >= 65
//   node scout.js --count 6            # ~6 candidates per round
//   node scout.js --zone drones        # bias toward an operator zone
//   node scout.js --forever --interval 1800   # run continuously, 30 min apart
//   node scout.js --selftest           # validate the engine without an API key
//
// Requires ANTHROPIC_API_KEY in the environment for live runs.

import { KEEP_THRESHOLD_DEFAULT, DEFAULT_MODEL } from './lib/patterns.js';
import { loadStore, saveStore, offLimitsList, recordResults } from './lib/store.js';
import { writeBrief } from './lib/brief.js';

function parseArgs(argv) {
  const a = { rounds: 1, threshold: KEEP_THRESHOLD_DEFAULT, count: 5, zone: null,
    forever: false, interval: 0, selftest: false, model: DEFAULT_MODEL };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--selftest') a.selftest = true;
    else if (k === '--forever') a.forever = true;
    else if (k === '--rounds') a.rounds = parseInt(argv[++i], 10);
    else if (k === '--threshold') a.threshold = parseInt(argv[++i], 10);
    else if (k === '--count') a.count = parseInt(argv[++i], 10);
    else if (k === '--interval') a.interval = parseInt(argv[++i], 10);
    else if (k === '--zone') a.zone = argv[++i];
    else if (k === '--model') a.model = argv[++i];
    else if (k === '--help' || k === '-h') { printHelp(); process.exit(0); }
  }
  return a;
}

function printHelp() {
  console.log(`Opportunity Scout — an evidence-first idea engine
  --rounds N        number of research rounds (default 1)
  --threshold N     minimum score to keep (default ${KEEP_THRESHOLD_DEFAULT})
  --count N         candidates to generate per round (default 5)
  --zone NAME       bias a round toward: nutrition|fitness|drones|gardening|maker
  --forever         run continuously
  --interval SEC    seconds to sleep between rounds (with --forever)
  --model ID        model to use (default ${DEFAULT_MODEL})
  --selftest        validate engine logic without calling the API`);
}

const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

async function main() {
  const args = parseArgs(process.argv);

  if (args.selftest) {
    const { runSelfTest } = await import('./lib/selftest.js');
    runSelfTest();
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY is not set.\n' +
      'Set it (export ANTHROPIC_API_KEY=sk-ant-...) for live runs, or try `node scout.js --selftest`.');
    process.exit(1);
  }

  const { runRound } = await import('./lib/research.js');
  let round = 0;
  do {
    round++;
    const store = loadStore();
    const offLimits = offLimitsList(store);
    const date = new Date().toISOString().slice(0, 10);
    console.log(`\n=== Round ${round} (${date}) — threshold ${args.threshold}, ${offLimits.length} off-limits ===`);

    let ideas = [];
    try {
      const result = await runRound({
        count: args.count, threshold: args.threshold, offLimits,
        zoneFocus: args.zone, model: args.model,
      });
      ideas = result.ideas;
      if (!ideas.length) console.log('  (model returned no parseable ideas this round)');
    } catch (err) {
      console.error('  research error:', err?.message || err);
      ideas = [];
    }

    const keepers = ideas.filter((i) => i.verdict === 'keep');
    for (const k of keepers) {
      console.log(`  ✅ KEEP  ${k.name} (${k?.score?.total ?? '?'}) — ${k.oneLiner || ''}`);
    }
    for (const x of ideas.filter((i) => i.verdict !== 'keep')) {
      console.log(`  ❌ kill  ${x.name} — ${x.killReason || 'below bar'}`);
    }

    if (ideas.length) {
      const briefPath = writeBrief(`${date}-r${round}`, ideas);
      recordResults(store, ideas, date);
      saveStore(store);
      console.log(`  brief: ${briefPath}`);
      console.log(`  log: ${store.kept.length} kept / ${store.killed.length} killed total`);
    }

    if (args.forever && args.interval > 0) {
      console.log(`  sleeping ${args.interval}s ...`);
      await sleep(args.interval);
    }
  } while (args.forever || round < args.rounds);
}

main().catch((e) => { console.error(e); process.exit(1); });
