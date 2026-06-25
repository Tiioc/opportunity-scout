# Opportunity Scout 🔭

An **evidence-first idea engine**. It doesn't just brainstorm — it generates niche
software ideas, **researches each one live on the web** (real demand signals + who already
builds it), **red-teams** them against a hard-won failure-pattern library, **scores** them,
keeps only the survivors, and **never repeats an idea** it has already examined.

Built for one operator: a non-technical solo founder who ships with AI, under $2k, in the
nutrition / fitness / drones / gardening / maker zones. It's tuned to *that* profile — but the
patterns are general.

## Why it's different
Most "idea generators" hand you plausible-sounding nonsense. This one encodes the single
lesson that killed ~40 of our candidates: **almost every googleable niche is already tooled, so
weak competition is the real bottleneck.** Every idea must survive an explicit "who already
builds this?" web check and prove **2+ wallet-level demand signals** — or it dies.

## Setup
```bash
cd opportunity-scout
npm install
export ANTHROPIC_API_KEY=sk-ant-...      # required for live runs
```

## Run
```bash
node scout.js                    # 1 round, keep score >= 60
node scout.js --rounds 3         # three research rounds
node scout.js --zone drones      # bias a round toward an operator zone
node scout.js --threshold 65     # be stricter
node scout.js --forever --interval 1800   # run continuously, 30 min apart
node scout.js --selftest         # validate the engine WITHOUT an API key
```

## What you get
- `out/brief-<date>.md` — a skimmable morning brief: every keeper with its evidence,
  competition read, the case against it, and the cheapest test to run this week.
- `data/researched-ideas.json` — the engine's growing memory of kept/killed ideas, so it
  never resurfaces the same thing. (Seeded with everything examined so far.)

## How it works
- `lib/patterns.js` — the rubric, hard constraints, and the **fail/win pattern libraries** (the IP).
- `lib/prompt.js` — turns those into the system/user prompts.
- `lib/research.js` — one Claude call per round, with the **web_search** tool, that researches,
  red-teams, scores, and returns structured JSON.
- `lib/store.js` — persistent memory + de-duplication.
- `lib/brief.js` — renders the morning brief.

## The honest part
A run that keeps **zero** ideas is a success — it means you were protected from a dud.
Scores top out where the evidence supports; the engine will not inflate a number to fill a list.
A high score is a hypothesis, not a verdict — the brief always ends each idea with the cheapest
real-world test, because **a tested 65 beats a theoretical 90.**
