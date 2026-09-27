// Subsequence match, the way editor palettes filter: every character of the
// query appears in the text, in order. The score likes a plain substring best,
// then consecutive characters and the starts of words, so "gp" lands on
// "go to people" ahead of "open puzzlewithme". Returns null on no match, else
// the score and the matched indices, so the palette can mark them.
export function fuzzy(query, text) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase();
  if (!q) return { score: 0, indices: [] };

  const indices = [];
  let score = t.includes(q) ? 20 : 0;
  let from = 0;
  let prev = -2;
  for (const ch of q) {
    const at = t.indexOf(ch, from);
    if (at === -1) return null;
    const wordStart = at === 0 || !/[a-z0-9]/.test(t[at - 1]);
    score += (at === prev + 1 ? 4 : 0) + (wordStart ? 3 : 0) - (at - from) * 0.1;
    indices.push(at);
    prev = at;
    from = at + 1;
  }
  return { score, indices };
}

// A command matches by its label (marked in the list) or by one of its plain
// keywords ("projects", "coffee", "dog"): a keyword that starts with the query,
// or has a word that does, outranks any label match, so the step bar's own
// words land on their pane first.
export function matchCommand(query, command) {
  const label = fuzzy(query, command.label);
  const q = query.trim().toLowerCase();
  if (!q) return label;
  let best = label;
  for (const word of command.keywords ?? []) {
    const k = word.toLowerCase();
    const hit = k.startsWith(q) ? 60 : k.split(/\s+/).some((w) => w.startsWith(q)) ? 50 : k.includes(q) ? 30 : 0;
    if (hit && (!best || hit + (k === q ? 10 : 0) > best.score)) best = { score: hit + (k === q ? 10 : 0), indices: label?.indices ?? [] };
  }
  return best;
}
