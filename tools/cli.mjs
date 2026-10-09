// Arguments for the tools here: `--name value`, a bare `--flag` (true), and the rest in `_`.
// `--help` prints the calling file's header comment, which is its usage.
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function isMain(metaUrl) {
  return process.argv[1] === fileURLToPath(metaUrl);
}

export function cli(metaUrl, defaults = {}) {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    const lines = readFileSync(fileURLToPath(metaUrl), "utf8").split("\n");
    const header = lines.slice(
      0,
      lines.findIndex((l) => !l.startsWith("//")),
    );
    console.log(header.map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
    process.exit(0);
  }
  const args = { ...defaults, _: [] };
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i].startsWith("--") && argv[i].slice(2);
    if (!name) {
      args._.push(argv[i]);
      continue;
    }
    if (!(name in defaults)) throw new Error(`unknown option --${name} (see --help)`);
    const value = argv[i + 1] === undefined || argv[i + 1].startsWith("--") || typeof defaults[name] === "boolean" ? true : argv[++i];
    args[name] = typeof defaults[name] === "number" ? Number(value) : value;
  }
  return args;
}

// A new folder under tools/out (gitignored) for one run's files: tools/out/<name>-<time>.
export function outDir(name) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
  const dir = fileURLToPath(new URL(`./out/${name}-${stamp}`, import.meta.url));
  mkdirSync(dir, { recursive: true });
  return dir;
}
