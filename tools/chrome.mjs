// The one headless Chrome driver every tool here uses (zero dependencies, CDP over Node's WebSocket).
//
//   import { launch } from "./chrome.mjs";
//   const page = await launch();                       // its own Chrome, port and profile
//   await page.load(url, { width: 375, phone: true, reducedMotion: true, cpu: 4, speed: 4 });
//   await page.eval("document.title"); await page.shot("out.png"); page.errors; await page.close();
//
// One page per Chrome: two drivers in one Chrome throttle the background tab, which looks
// exactly like a frozen animation (docs/design-process.md, "Shipping to main" step 5).
// Chrome and its profile go away when the Node process exits, also on an error.
import { writeFileSync } from "node:fs";
import { freePort, kill, removeDir, sleep, spawnTracked, stayAwake, tempDir } from "./proc.mjs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Runs in the page before any site code. With a `seed` it replaces Math.random with a seeded
// generator. With a `speed` other than 1 it gives the page one virtual clock, the page time, that
// follows real time times `speed`: performance.now, Date, setTimeout/setInterval and
// requestAnimationFrame all read it. Each timer fires at its exact page time, and animation frames
// come every 1/60 s of page time, each timer and frame in a task of its own (so React commits
// between them, as it would in a browser). Real frames only pace the clock and paint.
// Why not just multiply the clocks: headless Chrome here draws a frame every 17 to 150 ms, and
// the stage caps one tick at 0.1 s, so at 4x most ticks were capped, walks fell behind the
// timers, and scenes came out in another order. Nor CDP's Animation.setPlaybackRate: it scales
// requestAnimationFrame's timestamps but not performance.now, two clocks the stage compares.
// When the page's own work is slower than `speed` allows, page time falls behind real time
// times `speed` and the run just takes longer; window.__clock says by how much.
// window.__clock.holdAt(t) stops page time at t (`held` turns true once it is there) and
// release(next) lets it go on to the next hold, so a driver's key or click lands at an exact
// page time; load()'s `holdAt` sets the first hold before any of the page's code runs.
// CSS and Web Animations run at `speed` on Chrome's own clock (their playbackRate).
function pageClock(speed, seed, firstHold) {
  if (seed !== null) {
    let a = seed >>> 0;
    Math.random = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  if (speed === 1) return;
  const FRAME = 1000 / 60;
  const realNow = performance.now.bind(performance);
  const { setInterval: realInterval, requestAnimationFrame: realFrame } = globalThis;
  // page time is 0 when the document starts and runs at `speed` from there; a hold shifts it
  let now = 0,
    base = 0,
    baseReal = realNow();
  let holdAt = firstHold ?? Infinity;
  const clock = (globalThis.__clock = {
    frames: 0,
    behindMs: 0,
    realNow,
    held: false,
    holdAt(t) {
      holdAt = t;
      clock.held = false;
      pump();
    },
    release(next = Infinity) {
      holdAt = next;
      clock.held = false;
      base = now;
      baseReal = realNow();
      pump();
    },
  });

  const timers = new Map();
  let nextId = 1;
  const addTimer = (fn, ms, args, every) => {
    const id = nextId++;
    timers.set(id, { at: now + Math.max(0, Number(ms) || 0), fn: typeof fn === "function" ? fn : () => (0, eval)(fn), args, every, id });
    return id;
  };
  globalThis.setTimeout = (fn, ms, ...args) => addTimer(fn, ms, args, null);
  globalThis.setInterval = (fn, ms, ...args) => addTimer(fn, ms, args, Math.max(1, Number(ms) || 0));
  globalThis.clearTimeout = globalThis.clearInterval = (id) => timers.delete(id);

  let frameCallbacks = new Map();
  let lastFrame = now - FRAME;
  globalThis.requestAnimationFrame = (cb) => {
    const id = nextId++;
    frameCallbacks.set(id, cb);
    return id;
  };
  globalThis.cancelAnimationFrame = (id) => frameCallbacks.delete(id);

  performance.now = () => now;
  const RealDate = Date;
  const dateNow = () => performance.timeOrigin + now;
  function PageDate(...args) {
    if (!new.target) return new RealDate(dateNow()).toString();
    return Reflect.construct(RealDate, args.length ? args : [dateNow()], new.target);
  }
  PageDate.prototype = RealDate.prototype;
  Object.assign(PageDate, { now: dateNow, parse: RealDate.parse, UTC: RealDate.UTC });
  globalThis.Date = PageDate;

  // One event per task: the earliest timer, or the next frame, while it is due by real time.
  const channel = new MessageChannel();
  let busy = false;
  const step = () => {
    const byRealTime = base + (realNow() - baseReal) * speed;
    const due = Math.min(byRealTime, holdAt);
    let timer = null;
    for (const t of timers.values()) if (!timer || t.at < timer.at) timer = t;
    const frameAt = frameCallbacks.size ? Math.max(lastFrame + FRAME, now) : Infinity;
    const at = Math.min(timer?.at ?? Infinity, frameAt);
    if (at > due) {
      clock.held = due === holdAt;
      return (busy = false);
    }
    clock.behindMs = Math.max(clock.behindMs, Math.round(byRealTime - at));
    now = Math.max(now, at);
    const run = (fn, ...args) => {
      try {
        fn(...args);
      } catch (error) {
        reportError(error);
      }
    };
    if (timer && timer.at <= frameAt) {
      if (timer.every) timer.at += timer.every;
      else timers.delete(timer.id);
      run(timer.fn, ...timer.args);
    } else {
      const callbacks = frameCallbacks;
      frameCallbacks = new Map();
      lastFrame = now;
      clock.frames++;
      for (const cb of callbacks.values()) run(cb, now);
    }
    channel.port2.postMessage(null);
  };
  channel.port1.onmessage = step;
  const pump = () => busy || ((busy = true), channel.port2.postMessage(null));
  realFrame(function paint() {
    pump();
    realFrame(paint);
  });
  realInterval(pump, 4);

  const faster = (animation) => (animation.playbackRate = speed);
  for (const type of ["animationstart", "transitionrun"]) addEventListener(type, (e) => e.target.getAnimations().forEach(faster), true);
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (...args) {
    const animation = animate.apply(this, args);
    faster(animation);
    return animation;
  };
}

const KEYS = {
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  Enter: 13,
  Escape: 27,
  Tab: 9,
  " ": 32,
  "/": 191,
};

export async function launch() {
  stayAwake();
  const port = await freePort();
  const profile = tempDir("chrome");
  const proc = spawnTracked(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--hide-scrollbars",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
    "--window-size=1440,1000",
    "about:blank",
  ]);
  let target;
  for (let i = 0; i < 400 && !target; i++) {
    await sleep(25);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === "page");
    } catch {}
  }
  if (!target) throw new Error(`Chrome (pid ${proc.pid}) did not open its debugging port ${port}`);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => ((ws.onopen = resolve), (ws.onerror = reject)));
  let nextId = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (message) => {
    const m = JSON.parse(message.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject, method } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result);
    } else if (m.method) for (const l of listeners) l(m);
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject, method });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const once = (method) =>
    new Promise((resolve) => {
      const l = (m) => m.method === method && (listeners.delete(l), resolve(m.params));
      listeners.add(l);
    });

  const errors = [];
  listeners.add(({ method, params }) => {
    if (method === "Runtime.exceptionThrown") {
      const d = params.exceptionDetails;
      errors.push(`exception: ${d.exception?.description ?? d.text}`);
    } else if (method === "Runtime.consoleAPICalled" && (params.type === "error" || params.type === "assert")) {
      errors.push(`console.${params.type}: ${params.args.map((a) => a.value ?? a.description ?? "").join(" ")}`);
    } else if (method === "Log.entryAdded" && params.entry.level === "error") {
      errors.push(`log: ${params.entry.text}${params.entry.url ? ` (${params.entry.url})` : ""}`);
    }
  });
  await Promise.all(["Page.enable", "Runtime.enable", "Log.enable"].map((m) => send(m)));
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });

  let scripts = [];
  let closed = false;
  const page = {
    send,
    listeners,
    errors,
    pid: proc.pid,
    port,
    speed: 1,

    // Opens `url` fresh (about:blank first, so a change of hash alone is a real load).
    // init: extra scripts to run before the site's code, after the clock.
    async load(
      url,
      {
        width = 1440,
        phone = false,
        height = phone ? 812 : 1000,
        scale = 1,
        reducedMotion = false,
        cpu = 1,
        speed = 1,
        seed = null,
        holdAt = null,
        init = [],
      } = {},
    ) {
      await send("Page.navigate", { url: "about:blank" });
      for (const identifier of scripts) await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
      scripts = [];
      for (const source of [`(${pageClock})(${speed}, ${seed}, ${holdAt});`, ...init]) {
        scripts.push((await send("Page.addScriptToEvaluateOnNewDocument", { source })).identifier);
      }
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: phone });
      await send("Emulation.setTouchEmulationEnabled", phone ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
      await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }] });
      await send("Emulation.setCPUThrottlingRate", { rate: cpu });
      page.speed = speed;
      errors.length = 0;
      const loaded = once("Page.loadEventFired");
      await send("Page.navigate", { url });
      await loaded;
      await page.eval("document.fonts.ready.then(() => true)");
    },

    async eval(expression) {
      const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails)
        throw new Error(`eval failed: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}\n  in: ${expression.slice(0, 200)}`);
      return r.result.value;
    },

    // Polls `expression` until it is truthy; returns its value, or null after `timeout` real ms.
    async waitFor(expression, timeout = 30000, every = 20) {
      const start = performance.now();
      while (performance.now() - start < timeout) {
        const v = await page.eval(expression).catch(() => null);
        if (v) return v;
        await sleep(every);
      }
      return null;
    },

    // clip: { x, y, width, height } in CSS px of the viewport.
    async shot(path, clip) {
      const r = await send("Page.captureScreenshot", { format: "png", ...(clip && { clip: { ...clip, scale: 1 } }) });
      const png = Buffer.from(r.data, "base64");
      if (path) writeFileSync(path, png);
      return png;
    },

    async key(key) {
      const keyCode = KEYS[key] ?? key.toUpperCase().charCodeAt(0);
      const code = /^[0-9]$/.test(key) ? `Digit${key}` : /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : key;
      const text = key.length === 1 ? key : undefined;
      await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, text, windowsVirtualKeyCode: keyCode });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode });
    },

    async click(x, y) {
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    },

    async tap(x, y) {
      await send("Input.synthesizeTapGesture", { x, y, gestureSourceType: "touch" });
    },

    // The centre of the first element matching `selector`, in viewport px, or throws.
    async centre(selector) {
      const c = await page.eval(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null;
        el.scrollIntoView({ block: "nearest" }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
      if (!c) throw new Error(`no element matches ${selector}`);
      return c;
    },

    async close() {
      if (closed) return;
      closed = true;
      await Promise.race([send("Browser.close").catch(() => {}), sleep(1500)]);
      await Promise.race([new Promise((r) => (proc.exitCode !== null ? r() : proc.once("exit", r))), sleep(1500)]);
      kill(proc);
      ws.close();
      removeDir(profile);
    },
  };
  return page;
}
