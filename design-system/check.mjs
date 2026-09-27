// Usage: node design-system/check.mjs   (exits 1 and lists every difference when the design system has drifted from the site)
//
// 1. tokens.css: its custom properties are exactly the ones in src/designs/panes/panes.css, value
//    for value, under the same media query. panes.css declares them on `.panes`; tokens.css on `:root`.
// 2. components.css: every declaration is in panes.css, scenes.css or src/index.css under the same
//    selector and the same at-rule. It may hold fewer rules than the site, never other ones.

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const panesDir = join(here, "../src/designs/panes");
const read = (path) => readFile(path, "utf8");

const squash = (text) => text.replace(/\s+/g, " ").trim();

function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let current = "";
  let quote = null;
  for (const ch of text) {
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    if (ch === separator && depth === 0 && !quote) {
      parts.push(current);
      current = "";
    } else current += ch;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

// Every declaration of a stylesheet as "at-rules | selector | property: value", one per selector of a list.
function declarations(css, context = []) {
  const out = [];
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let i = 0;
  while (i < text.length) {
    let j = i;
    let depth = 0;
    let quote = null;
    for (; j < text.length; j += 1) {
      const ch = text[j];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === "(") depth += 1;
      else if (ch === ")") depth -= 1;
      else if ((ch === "{" || ch === ";") && depth === 0) break;
    }
    if (j >= text.length) break;
    const prelude = squash(text.slice(i, j));
    if (text[j] === ";") {
      i = j + 1;
      continue;
    }
    let end = j + 1;
    for (let open = 1; open; end += 1) {
      if (text[end] === "{") open += 1;
      if (text[end] === "}") open -= 1;
    }
    const body = text.slice(j + 1, end - 1);
    if (prelude.startsWith("@")) out.push(...declarations(body, [...context, prelude]));
    else
      for (const selector of splitTopLevel(prelude, ","))
        for (const declaration of splitTopLevel(body, ";")) {
          const colon = declaration.indexOf(":");
          out.push({
            context: context.join(" "),
            selector: squash(selector),
            property: declaration.slice(0, colon).trim(),
            value: squash(declaration.slice(colon + 1)),
          });
        }
    i = end;
  }
  return out;
}

const line = (d) => `${d.context ? `${d.context} ` : ""}${d.selector} { ${d.property}: ${d.value} }`;

const panes = declarations(await read(join(panesDir, "panes.css")));
const scenes = declarations(await read(join(panesDir, "scenes/scenes.css")));
const reset = declarations(await read(join(here, "../src/index.css")));
const tokens = declarations(await read(join(here, "tokens.css")));
const components = declarations(await read(join(here, "components.css")));

const problems = [];

const siteTokens = new Set(
  panes.filter((d) => d.property.startsWith("--")).map((d) => line({ ...d, selector: d.selector === ".panes" ? ":root" : d.selector })),
);
const ourTokens = new Set(tokens.map(line));
for (const token of siteTokens) if (!ourTokens.has(token)) problems.push(`tokens.css is missing, or has another value for:  ${token}`);
for (const token of ourTokens) if (!siteTokens.has(token)) problems.push(`tokens.css has, and panes.css does not:  ${token}`);

const siteRules = new Set([...panes, ...scenes, ...reset].map(line));
for (const d of components) if (!siteRules.has(line(d))) problems.push(`components.css has, and the site does not:  ${line(d)}`);

console.log(`tokens.css: ${ourTokens.size} custom properties, panes.css: ${siteTokens.size}`);
console.log(`components.css: ${components.length} declarations, each looked up among ${siteRules.size} on the site`);
if (problems.length) {
  console.log(`\n${problems.length} difference${problems.length > 1 ? "s" : ""}:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log("no drift");
