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
