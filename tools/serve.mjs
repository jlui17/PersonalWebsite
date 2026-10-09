// Serves the site on a free port of its own (never 5173, which is Justin's dev server).
//
//   node tools/serve.mjs                  build this tree into a temp folder and `vite preview` it (frozen:
//                                         saves made during a run do not change what is served)
//   node tools/serve.mjs --dev            this tree's dev server instead (hot reload, so not frozen)
//   node tools/serve.mjs --commit <rev>   `git archive <rev>` into a temp folder, `npm ci`, build, preview
//                                         ("Shipping to main" step 4; never a symlinked node_modules)
//
// Prints the URL and serves until Ctrl-C. From code: `const site = await serve({ dev, commit })`
// gives { url, root }, and the server stops when the process exits.
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cli, isMain } from "./cli.mjs";
import { freePort, sleep, spawnTracked, stayAwake, tempDir } from "./proc.mjs";

export const repo = join(dirname(fileURLToPath(import.meta.url)), "..");

// A one-shot command; throws with its output when it fails.
function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawnTracked(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("exit", (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} ${args.join(" ")} failed in ${cwd} (exit ${code}):\n${out}`))));
  });
}

export async function build(root, outDir) {
  await run("npm", ["run", "build", "--", "--outDir", outDir, "--emptyOutDir", "--logLevel", "warn"], root);
}

export async function serve({ dev = false, commit = null, log = () => {} } = {}) {
  stayAwake();
  let root = repo;
  if (commit) {
    root = tempDir("commit");
    log(`git archive ${commit} into ${root}`);
    execFileSync("sh", ["-c", `git archive "$1" | tar -x -C "$2"`, "sh", commit, root], { cwd: repo });
    log("npm ci");
    await run("npm", ["ci", "--no-audit", "--no-fund"], root);
  }
  const port = await freePort();
  const vite = join(root, "node_modules/vite/bin/vite.js");
  let args;
  if (dev) {
    args = [vite, "--port", String(port), "--strictPort", "--host", "127.0.0.1"];
  } else {
    const outDir = tempDir("dist");
    log("npm run build");
    await build(root, outDir);
    args = [vite, "preview", "--outDir", outDir, "--port", String(port), "--strictPort", "--host", "127.0.0.1"];
  }
  const server = spawnTracked(process.execPath, args, { cwd: root });
  const url = `http://127.0.0.1:${port}/`;
  for (let i = 0; i < 400; i++) {
    if (server.exitCode !== null) throw new Error(`vite exited with ${server.exitCode} before serving ${url}`);
    if (
      await fetch(url).then(
        (r) => r.ok,
        () => false,
      )
    )
      return { url, root, pid: server.pid };
    await sleep(25);
  }
  throw new Error(`vite (pid ${server.pid}) did not answer at ${url}`);
}

// The options every tool takes for what it loads, and the site they name: --url an already
// running server (then the steps are read from this tree), else serve() with --dev or --commit.
export const SITE_OPTIONS = { url: null, dev: false, commit: null };
export const openSite = (args) => (args.url ? { url: args.url.replace(/\/?$/, "/"), root: repo } : serve(args));

if (isMain(import.meta.url)) {
  const args = cli(import.meta.url, { dev: false, commit: null });
  const site = await serve({ ...args, log: (m) => console.log(m) });
  console.log(`serving ${site.root} at ${site.url} (vite pid ${site.pid}); Ctrl-C stops it`);
  await new Promise(() => {});
}
