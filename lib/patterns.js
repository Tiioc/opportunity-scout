// patterns.js
// The distilled "history of fails + wins" that makes this engine strong.
// Everything here was learned the hard way: most googleable niches are already
// tooled, so the binding constraint is almost always WEAK COMPETITION.

export const OPERATOR_PROFILE = `
OPERATOR PROFILE (tailor every idea to this person):
- One non-technical founder who builds software with an AI coding assistant.
- Low capital: under $2,000 to launch. Solo. No team, warehouse, or inventory.
- Wants niche, focused, genuinely buildable-solo products with real revenue.
- Unfair-advantage zones (SOFT boost, never a filter): nutrition, fitness, drones,
  gardening, maker/DIY. He understands these buyers.
- Emerging insider access: owns a DJI Mini 5 Pro and is getting his FAA Part 107
  license in the Boise, ID area. Treat drone-operator / local-trades pain he could
  witness firsthand as higher-value (insider access => weak competition is reachable).
`;

export const RUBRIC = `
SCORING (0-100). Score each surviving idea on:
- Demand evidence (40): strength of REAL, cited proof people already pay to solve this.
- Reachable distribution (25): can a non-technical solo founder actually reach the buyers?
- Weak competition (20): how empty is the lane? This is the usual bottleneck.
- Build feasibility solo (15): can it ship as a v1 in weeks for < $2,000, AI-assisted?
Then apply a pattern modifier of up to +/-10 from the WIN/FAIL libraries below.
KEEP threshold is configurable (default 60). Discard anything below it.
A run that keeps ZERO ideas is a SUCCESS, not a failure. Never inflate a score.
`;

// Auto-reject gates — if any is true, the idea dies before deep research.
export const HARD_CONSTRAINTS = [
  'Not buildable + maintainable by ONE non-technical founder with AI assistance.',
  'Costs more than $2,000 to launch, or needs a team/warehouse/significant capital.',
  'Passive-income scheme, dropshipping, crypto play, MLM, or "audience-first" content bet.',
  'No identifiable group that ALREADY spends money to solve this specific problem.',
  'Fewer than TWO independent, concrete, citable demand signals.',
  'Already present on the off-limits / researched-ideas log.',
];

// The graveyard. These killed almost every candidate we examined — encode them.
export const FAIL_PATTERNS = [
  ['Saturated-niche', 'Any niche specific enough to have reachable buyers almost always already has 2-5 dedicated tools. ALWAYS run an explicit "who already builds this?" check. If >=2 dedicated, non-hated tools exist, the competition score collapses — usually KILL.'],
  ['All-in-one trap', 'A product that tries to "excel at everything" loses to focused best-in-class tools (classic in fitness/nutrition apps). Kill all-in-one plays in crowded categories.'],
  ['Service-not-software', 'If the binding requirement is a HUMAN service (e.g. EU Responsible Person, lab testing, a permit expediter), software can only assist. Cap the score and never claim it replaces the service.'],
  ['Generic-AI-substitution', 'If a free ChatGPT prompt reproduces the core value, competition is effectively strong. Only survives with real specialization: current rule libraries, full-workflow coverage, audit logs, monitoring.'],
  ['Accuracy/liability ceiling', 'Compliance/legal/health tools cannot guarantee outcomes without testing/data. Frame as documentation + risk-reduction, never a guarantee. This caps willingness to pay.'],
  ['Distribution-death', 'Weak competition often coexists with hard-to-reach buyers (obscure insider niches). Score distribution honestly — an unreachable buyer kills a high-competition-gap idea.'],
  ['Pain != payment', 'Fear or annoyance is not proof of payment. Demand only counts when backed by a WALLET signal: a paid workaround, gig/Upwork postings, high-selling templates, refugees from a dead paid tool, or an expensive incumbent.'],
  ['Platform-shock crowding', 'A fresh platform/policy shock attracts many indie builders within WEEKS. Always search for existing fast-follower tools before assuming the lane is empty.'],
  ['Commoditized-by-free', 'Free workarounds (templates, Canva, spreadsheets, free tiers, marketplace-provided fields) cap willingness to pay even when a paid tool could be "better".'],
  ['B2B-fit-mismatch', 'A high-scoring B2B/enterprise-adjacent idea can be the WORST fit for a non-technical solo founder with no industry access. Weigh fit-for-THIS-operator, not just market merit.'],
];

// The priors that actually win. Use as a modifier, never as proof on their own.
export const WIN_PATTERNS = [
  ['Fresh-shock timing', 'A brand-new law or platform rule that creates a painful, recurring problem BEFORE anyone has built tooling — concentrated reachable buyers + a hard forcing function + a deadline.'],
  ['Data-moat grind', 'Value is a tediously-assembled per-jurisdiction / per-entity dataset other indie builders will not bother to compile. The grind itself keeps competition weak.'],
  ['Wallet-proven demand', 'Buyers ALREADY pay for the workaround: expediters, consultants, monthly VAs, best-selling spreadsheets/templates, or a beloved paid tool that just died.'],
  ['Compliance co-pilot for small sellers', 'Cheap "keep me out of trouble" tool for a scared small online seller (Prop 65 / FDA claims / CPSIA / EU rules). Repeatable shape — but re-verify competition every single time.'],
  ['Insider-access niche', 'A pain only visible from inside an industry the operator can actually enter (his unfair-advantage zones). Un-googleable => genuinely weak competition AND reachable for him.'],
];

// Things already explored — never resurface (also loaded/extended from the JSON store).
export const SEED_OFF_LIMITS = [
  'Nutrition-label SaaS', 'Online personal-training / coaching apps', '3D-print-farm managers',
  'Microgreens planners', 'Pesticide spray logs', 'HACCP temperature logs', 'Home-inspection software',
  'All-in-one powerlifting + nutrition app (most-competitive category; users prefer specialists)',
];

export const KEEP_THRESHOLD_DEFAULT = 60;
export const DEFAULT_MODEL = 'claude-opus-4-8';

// The JSON schema we require back from the model for each candidate.
export const IDEA_SCHEMA_HINT = `
Return ONLY a fenced \`\`\`json block containing an array of idea objects. Each object:
{
  "name": "short product name",
  "oneLiner": "one sentence: what it does + for whom",
  "buyer": "the exact, specific person who pays (not 'small businesses')",
  "demandEvidence": ["2+ concrete, cited signals — quote + source URL each"],
  "competition": "who already does this; how weak/strong the lane really is",
  "score": { "demand": 0, "distribution": 0, "competition": 0, "build": 0, "patternModifier": 0, "total": 0 },
  "verdict": "keep" | "kill",
  "killReason": "if kill, the single biggest reason (cite a FAIL pattern by name)",
  "redTeam": "the strongest case AGAINST it, honestly",
  "validationStep": "the cheapest test he could run THIS week for a real yes/no",
  "sources": ["url", "url"]
}
Be skeptical. Kill freely. Only mark "keep" when total >= the keep threshold AND you found 2+ real wallet/demand signals.
`;
