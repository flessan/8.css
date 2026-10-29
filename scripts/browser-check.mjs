/**
 * Optional browser smoke test.
 *
 * Loads the documentation site, the landing page and the examples in a real
 * Chromium build and verifies that the icon font actually renders, that no
 * request fails, that there is no horizontal overflow on desktop or mobile,
 * and that the documented interactions (mobile menu, code copy, code details)
 * behave.
 *
 * It has no npm dependencies: it talks to Chromium over the DevTools protocol
 * using the WebSocket implementation built into Node.
 *
 * Usage:
 *   npm run test:browser                      # auto-detects Chromium
 *   CHROMIUM_PATH=/path/to/chrome npm run test:browser
 *   SCREENSHOT_DIR=./site/screenshots npm run test:browser
 *
 * The script skips with a notice when no browser is available, or when the
 * running Node version has no global WebSocket, so it never breaks CI.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const screenshotDir = process.env.SCREENSHOT_DIR ? resolve(process.env.SCREENSHOT_DIR) : null;

const candidateBrowsers = [
  process.env.CHROMIUM_PATH,
  process.env.CHROME_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/microsoft-edge",
].filter(Boolean);
const executablePath = candidateBrowsers.find((candidate) => existsSync(candidate));

if (!executablePath) {
  console.log("Skipping browser smoke test: no Chromium binary found (set CHROMIUM_PATH to enable it).");
  process.exit(0);
}
if (typeof WebSocket === "undefined") {
  console.log(`Skipping browser smoke test: the running Node (${process.version}) has no global WebSocket.`);
  process.exit(0);
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  const file = resolve(join(root, requested || "index.html"));
  if (!file.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  readFileSafe(file).then((body) => {
    if (body === null) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": mime[extname(file)] ?? "application/octet-stream" }).end(body);
  });
});

async function readFileSafe(file) {
  try {
    const { readFile } = await import("node:fs/promises");
    return await readFile(file);
  } catch {
    return null;
  }
}

await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = spawn(
  executablePath,
  [
    "--headless=new",
    "--remote-debugging-port=0",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    "--font-render-hinting=none",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

const endpoint = await new Promise((done, fail) => {
  let buffered = "";
  const timer = setTimeout(() => fail(new Error("Chromium did not report a DevTools endpoint in time.")), 20000);
  browser.stderr.on("data", (chunk) => {
    buffered += chunk.toString();
    const match = buffered.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) {
      clearTimeout(timer);
      done(match[1]);
    }
  });
  browser.on("exit", (code) => {
    clearTimeout(timer);
    fail(new Error(`Chromium exited early with code ${code}.`));
  });
});

// Replace the WebSocket host with 127.0.0.1 and grab the first page target.
const debugOrigin = endpoint.replace(/^ws:\/\/([^/]+)\/.*$/, "http://$1");
const targets = await (await fetch(`${debugOrigin}/json/list`)).json();
const pageTarget = targets.find((target) => target.type === "page");
if (!pageTarget) {
  console.error("No page target available in Chromium.");
  browser.kill("SIGKILL");
  server.close();
  process.exit(1);
}

const socket = new WebSocket(pageTarget.webSocketDebuggerUrl.replace(/^ws:\/\/[^/]+/, "ws://127.0.0.1:" + new URL(debugOrigin).port));
await new Promise((done, fail) => {
  socket.addEventListener("open", done, { once: true });
  socket.addEventListener("error", () => fail(new Error("Unable to open the DevTools WebSocket.")), { once: true });
});

let nextId = 0;
const pending = new Map();
const events = [];
socket.addEventListener("message", (message) => {
  const payload = JSON.parse(message.data);
  if (payload.id && pending.has(payload.id)) {
    const { resolve: resolveCommand, reject } = pending.get(payload.id);
    pending.delete(payload.id);
    payload.error ? reject(new Error(payload.error.message)) : resolveCommand(payload.result);
    return;
  }
  events.push(payload);
});

const send = (method, params = {}) =>
  new Promise((resolveCommand, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve: resolveCommand, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? "Evaluation failed");
  return result.result.value;
};

const realClick = async (selector) => {
  // The docs stylesheet enables smooth scrolling, so the scroll offset must be
  // settled before the pointer coordinates are read.
  const point = await evaluate(`(async () => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    element.scrollIntoView({ block: 'center' });
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    root.style.scrollBehavior = previous;
    const rect = element.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  })()`);
  if (!point) throw new Error(`Cannot click missing element: ${selector}`);
  const common = { x: point.x, y: point.y, button: "left", clickCount: 1 };
  // Park the pointer first so consecutive clicks are not merged into a dblclick.
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  await new Promise((done) => setTimeout(done, 260));
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", ...common });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", ...common });
  await new Promise((done) => setTimeout(done, 120));
};

const pressKey = async (key, code, windowsVirtualKeyCode) => {
  for (const type of ["keyDown", "keyUp"]) {
    await send("Input.dispatchKeyEvent", {
      type,
      key,
      code,
      windowsVirtualKeyCode,
      nativeVirtualKeyCode: windowsVirtualKeyCode,
      ...(key === "Enter" ? { text: "\r" } : {}),
    });
  }
  await new Promise((done) => setTimeout(done, 120));
};

const waitForLoad = () =>
  new Promise((done) => {
    const started = Date.now();
    const tick = () => {
      if (events.some((event) => event.method === "Page.loadEventFired")) return done();
      if (Date.now() - started > 15000) return done();
      setTimeout(tick, 50);
    };
    tick();
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Log.enable");

const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass, detail });

const failures = new Map();
const recordFailure = (path, message) => {
  failures.set(path, [...(failures.get(path) ?? []), message]);
};

socket.addEventListener("message", (message) => {
  const payload = JSON.parse(message.data);
  if (payload.method === "Network.responseReceived" && payload.params.response.status >= 400) {
    recordFailure(currentPath, `${payload.params.response.status} ${payload.params.response.url}`);
  }
  if (payload.method === "Network.loadingFailed") {
    recordFailure(currentPath, `failed ${payload.params.errorText}`);
  }
  if (payload.method === "Runtime.exceptionThrown") {
    recordFailure(currentPath, payload.params.exceptionDetails.exception?.description ?? "script error");
  }
  if (payload.method === "Log.entryAdded" && payload.params.entry.level === "error") {
    recordFailure(currentPath, payload.params.entry.text);
  }
});

let currentPath = "/index.html";
const visit = async (path, width, height) => {
  currentPath = path;
  events.length = 0;
  failures.delete(path);
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await send("Page.navigate", { url: origin + path });
  await waitForLoad();
  await evaluate("document.fonts.ready.then(() => true)").catch(() => {});
  return evaluate(`(() => {
    const icons = [...document.querySelectorAll('.fa')];
    const broken = icons.filter((icon) => {
      const before = getComputedStyle(icon, '::before').content;
      return !before || before === 'none' || before === '""' || getComputedStyle(icon).fontFamily !== 'FontAwesome';
    });
    return {
      title: document.title,
      icons: icons.length,
      brokenIcons: broken.map((icon) => icon.className).slice(0, 3),
      iconFontLoaded: document.fonts.check('14px FontAwesome'),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      hasSkipLink: !!document.querySelector('.skip-link, a[href="#main"]'),
    };
  })()`);
};

const shoot = async (name) => {
  if (!screenshotDir) return;
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(join(screenshotDir, `${name}.png`), Buffer.from(data, "base64"));
};
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

const pages = [
  { path: "/index.html", name: "home", icons: true },
  { path: "/docs/index.html", name: "docs", icons: true },
  { path: "/examples/components.html", name: "gallery", icons: true },
  { path: "/examples/legacy-start-screen.html", name: "legacy", icons: true, allowOverflow: true },
];

for (const page of pages) {
  for (const viewport of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const state = await visit(page.path, viewport.width, viewport.height);
    const problems = failures.get(page.path) ?? [];
    check(
      `${page.name} (${viewport.name}) renders Font Awesome glyphs`,
      state.iconFontLoaded && state.brokenIcons.length === 0 && state.icons > 0,
      JSON.stringify({ icons: state.icons, broken: state.brokenIcons, loaded: state.iconFontLoaded }),
    );
    check(
      `${page.name} (${viewport.name}) loads without errors`,
      problems.length === 0,
      problems.slice(0, 3).join(" | "),
    );
    if (!page.allowOverflow) {
      check(
        `${page.name} (${viewport.name}) has no horizontal overflow`,
        state.overflow <= 1,
        `overflow ${state.overflow}px`,
      );
    }
    await shoot(`${page.name}-${viewport.name}`);
  }
}

// Interactive behaviour on the documentation site.
await visit("/docs/index.html", 390, 844);
const menuClosed = await evaluate("document.querySelector('.docs-sidebar').classList.contains('open')");
await realClick(".mobile-menu-button");
await evaluate("new Promise((r) => setTimeout(r, 350))");
const menuOpen = await evaluate(
  "({ open: document.querySelector('.docs-sidebar').classList.contains('open'), expanded: document.querySelector('.mobile-menu-button').getAttribute('aria-expanded'), left: Math.round(document.querySelector('.docs-sidebar').getBoundingClientRect().left) })",
);
check(
  "documentation mobile menu opens and closes",
  menuClosed === false && menuOpen.open === true && menuOpen.expanded === "true" && menuOpen.left === 0,
  JSON.stringify({ menuClosed, menuOpen }),
);
await shoot("docs-mobile-menu");

await visit("/docs/index.html", 1280, 900);
await realClick("#buttons details.code summary");
await realClick("#buttons details.code .copy");
const copy = await evaluate(`(async () => {
  const button = document.querySelector('#buttons details.code .copy');
  const snippet = document.querySelector('#buttons details.code pre code').textContent;
  const during = button.textContent;
  let clipboard = '';
  try { clipboard = await navigator.clipboard.readText(); } catch (error) { clipboard = 'unreadable: ' + error.name; }
  await new Promise((r) => setTimeout(r, 1500));
  return { during, after: button.textContent, matches: clipboard === snippet };
})()`);
check(
  "copy button confirms, copies the snippet, then resets",
  copy.during === "Copied" && copy.after === "Copy Code",
  JSON.stringify(copy),
);
if (copy.matches) check("copy button puts the snippet on the clipboard", true);

const before = await evaluate("document.querySelector('#tiles details.code').open");
await realClick("#tiles details.code summary");
const opened = await evaluate("document.querySelector('#tiles details.code').open");
await realClick("#tiles details.code summary");
const details = { before, opened, restored: await evaluate("document.querySelector('#tiles details.code').open") };
check("code snippets expand and collapse", details.before === false && details.opened === true && details.restored === false, JSON.stringify(details));

// Keyboard: the first Tab reaches the skip link and Enter moves focus to main.
await visit("/docs/index.html", 1280, 900);
await evaluate("document.body.focus(); document.activeElement.blur(); window.scrollTo(0, 0); true");
await pressKey("Tab", "Tab", 9);
const firstStop = await evaluate(
  "({ cls: document.activeElement.className, text: (document.activeElement.textContent || '').trim(), top: Math.round(document.activeElement.getBoundingClientRect().top) })",
);
await pressKey("Enter", "Enter", 13);
const afterSkip = await evaluate("({ id: document.activeElement.id, hash: location.hash })");
check(
  "skip link is the first tab stop and jumps to the main region",
  firstStop.cls === "skip-link" && firstStop.top >= 0 && afterSkip.id === "main" && afterSkip.hash === "#main",
  JSON.stringify({ firstStop, afterSkip }),
);
await shoot("docs-skip-link");

// Gallery: the Start Screen showcase is a complete, keyboard reachable group.
await visit("/examples/components.html", 1280, 900);
const showcase = await evaluate(`(async () => {
  const tiles = [...document.querySelectorAll('#showcase .w8-tile')];
  tiles[0].focus();
  const firstFocused = document.activeElement === tiles[0];
  let reachedThird = false;
  for (let i = 0; i < 2; i++) {
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    const focusables = [...document.querySelectorAll('#showcase .w8-tile')];
    const index = focusables.indexOf(document.activeElement);
    if (index === 2) reachedThird = true;
    break;
  }
  const rects = tiles.map((tile) => Math.round(tile.getBoundingClientRect().width));
  return {
    count: tiles.length,
    firstFocused,
    reachedThird,
    columns: new Set(rects).size,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
})()`);
check(
  "gallery Start Screen showcase renders a complete tile group",
  showcase.count === 12 && showcase.firstFocused && showcase.overflow <= 1,
  JSON.stringify(showcase),
);
await shoot("gallery-showcase");

const reduced = await (async () => {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const value = await evaluate("getComputedStyle(document.querySelector('.w8-tile')).transitionDuration");
  await send("Emulation.setEmulatedMedia", { features: [] });
  return value;
})();
check("prefers-reduced-motion collapses transitions", parseFloat(reduced) < 0.001, reduced);

socket.close();
browser.kill("SIGKILL");
server.close();

const failed = results.filter((result) => !result.pass);
for (const result of results) {
  console.log(`${result.pass ? "PASS" : "FAIL"} ${result.name}${result.pass ? "" : ` -> ${result.detail}`}`);
}
console.log(`\n${results.length - failed.length}/${results.length} browser checks passed.`);
process.exit(failed.length ? 1 : 0);
