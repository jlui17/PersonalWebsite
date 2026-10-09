// Child processes and temp folders that go away with this Node process, however it ends,
// and a caffeinate that keeps the Mac and its display awake until then (with the display asleep,
// headless Chrome draws a frame only every 17 to 150 ms and plain 1x runs drift).
// Every tool spawns through here.
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const children = new Set();
const dirs = new Set();

// Detached, so the child leads its own process group and a kill reaches its helpers too
// (Chrome's renderers, npm's node).
export function spawnTracked(cmd, args, opts = {}) {
  const child = spawn(cmd, args, { stdio: "ignore", ...opts, detached: true });
  children.add(child);
  child.on("exit", () => children.delete(child));
  return child;
}

export function kill(child) {
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {}
  children.delete(child);
}

export function tempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), `pw-${prefix}-`));
  dirs.add(dir);
  return dir;
}

export function removeDir(dir) {
  rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
  dirs.delete(dir);
}

export function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer().listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let caffeinate;
export function stayAwake() {
  caffeinate ??= spawnTracked("caffeinate", ["-d", "-i", "-w", String(process.pid)]);
}

process.on("exit", () => {
  for (const child of [...children]) kill(child);
  for (const dir of [...dirs]) removeDir(dir);
});
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => process.exit(130));
