// research.js — the one place that talks to the Claude API (with live web search).
// Imported lazily so --selftest and the store work with zero dependencies installed.
import { DEFAULT_MODEL } from './patterns.js';
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

// Pull the text out of a Messages response (ignoring tool-use/thinking blocks).
function textOf(message) {
  return (message.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}

// Robustly extract the JSON array the model was asked to emit.
export function extractIdeas(text) {
  if (!text) return [];
  let candidate = null;
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  if (fenced) candidate = fenced[1];
  if (!candidate) {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end > start) candidate = text.slice(start, end + 1);
  }
  if (!candidate) return [];
  try {
    const parsed = JSON.parse(candidate);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

// Run one research round against the API. Handles the server-side web-search loop
// (web_search can pause the turn after its internal iteration cap; we resume).
export async function runRound({ count, threshold, offLimits, zoneFocus, model = DEFAULT_MODEL }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

  const system = buildSystemPrompt();
  const messages = [{ role: 'user', content: buildUserPrompt({ count, threshold, offLimits, zoneFocus }) }];

  let lastText = '';
  for (let i = 0; i < 8; i++) {
    const resp = await client.messages.create({
      model,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      tools: [{ type: 'web_search_20260209', name: 'web_search' }],
      system,
      messages,
    });
    lastText = textOf(resp);
    if (resp.stop_reason === 'pause_turn') {
      // Server tool hit its iteration cap mid-turn — append and resume.
      messages.push({ role: 'assistant', content: resp.content });
      continue;
    }
    break;
  }

  const ideas = extractIdeas(lastText);
  // Trust the model's verdict but enforce the threshold defensively.
  for (const idea of ideas) {
    const total = idea?.score?.total ?? 0;
    if (idea.verdict === 'keep' && total < threshold) idea.verdict = 'kill';
  }
  return { ideas, rawText: lastText };
}
