// brief.js — writes a skimmable morning brief for a run's keepers + a one-line kill log.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', 'out');

export function writeBrief(dateISO, allIdeas) {
  mkdirSync(OUT_DIR, { recursive: true });
  const keepers = allIdeas.filter((i) => i.verdict === 'keep')
    .sort((a, b) => (b?.score?.total ?? 0) - (a?.score?.total ?? 0));
  const killed = allIdeas.filter((i) => i.verdict !== 'keep');

  const lines = [`# Opportunity Scout — Morning Brief ${dateISO}`, ''];
  if (keepers.length === 0) {
    lines.push('**No idea cleared the bar this run.** That is a valid result — it means you were protected from chasing a dud.', '');
  }
  for (const k of keepers) {
    lines.push(`## ✅ ${k.name} — ${k?.score?.total ?? '?'}/100`);
    lines.push(`**${k.oneLiner || ''}**`, '');
    lines.push(`- **Buyer:** ${k.buyer || '—'}`);
    lines.push(`- **Why people pay (evidence):**`);
    for (const e of k.demandEvidence || []) lines.push(`  - ${e}`);
    lines.push(`- **Competition / the gap:** ${k.competition || '—'}`);
    lines.push(`- **The case against it:** ${k.redTeam || '—'}`);
    lines.push(`- **Cheapest test this week:** ${k.validationStep || '—'}`);
    if (k.sources?.length) lines.push(`- **Sources:** ${k.sources.join(' · ')}`);
    lines.push('');
  }
  if (killed.length) {
    lines.push('## ❌ Killed this run');
    for (const x of killed) lines.push(`- **${x.name}** — ${x.killReason || x.redTeam || 'did not clear the bar'}`);
    lines.push('');
  }

  const safeDate = dateISO.replace(/[^0-9-]/g, '');
  const path = join(OUT_DIR, `brief-${safeDate}.md`);
  writeFileSync(path, lines.join('\n'));
  return path;
}
