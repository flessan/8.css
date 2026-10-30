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
    // Aborted loads happen when a navigation supersedes in-flight requests; they
    // are not failures the page can act on.
    if (!payload.params.errorText.includes("ERR_ABORTED")) {
      recordFailure(currentPath, `failed ${payload.params.errorText}`);
    }
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
  // Desktop-mode metrics on purpose: mobile emulation shrink-to-fits the
// layout, which hides real horizontal overflow from the layout width.
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
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
  { path: "/examples/wallpapers.html", name: "wallpapers", icons: true },
  { path: "/examples/shell.html", name: "shell", icons: true },
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

// Wallpaper pack: every thumbnail loads, picking a wallpaper repaints the
// preview, the fit mode is applied and the CSS snippet follows the selection.
await visit("/examples/wallpapers.html", 1440, 1000);
const pack = await evaluate(`(async () => {
  const radios = [...document.querySelectorAll('.wp-radio')];
  const preview = document.getElementById('preview');
  const initial = getComputedStyle(preview).backgroundImage;
  const sixth = radios[5];
  sixth.checked = true;
  sixth.dispatchEvent(new Event('change'));
  await new Promise((done) => setTimeout(done, 120));
  const afterPick = getComputedStyle(preview).backgroundImage;
  document.getElementById('fit').value = 'contain';
  document.getElementById('fit').dispatchEvent(new Event('change'));
  await new Promise((done) => setTimeout(done, 80));
  const images = [...document.images];
  return {
    options: radios.length,
    initial,
    afterPick,
    expected: 'url("' + new URL(sixth.dataset.file, location.href).href + '")',
    backgroundSize: getComputedStyle(preview).backgroundSize,
    snippet: document.getElementById('snippet').textContent,
    note: document.getElementById('preview-note').textContent,
    images: images.length,
    broken: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src).slice(0, 3),
    thumbLoaded: images.every((image) => !image.complete || image.naturalWidth > 0),
  };
})()`);
check(
  "wallpaper pack lists every wallpaper with a loading thumbnail",
  pack.options >= 20 && pack.broken.length === 0 && pack.images >= 20,
  JSON.stringify({ options: pack.options, images: pack.images, broken: pack.broken }),
);
check(
  "picking a wallpaper repaints the preview and updates the snippet",
  pack.afterPick === pack.expected && pack.afterPick !== pack.initial && pack.snippet.includes("--w8-start-image"),
  JSON.stringify({ initial: pack.initial.slice(0, 60), afterPick: pack.afterPick.slice(0, 60), note: pack.note }),
);
check("fit mode is applied to the preview", pack.backgroundSize === "contain", pack.backgroundSize);
await shoot("wallpapers-picked");

await realClick(".wp-option:nth-of-type(3)");
await new Promise((done) => setTimeout(done, 150));

// Picking an accent radio recolours controls through --w8-accent.
const accent = await evaluate(`(async () => {
  const radios = [...document.querySelectorAll('input[name="accent"]')];
  radios[2].checked = true;
  radios[2].dispatchEvent(new Event('change'));
  await new Promise((done) => setTimeout(done, 100));
  const preview = document.getElementById('preview');
  return {
    accentVariable: getComputedStyle(preview).getPropertyValue('--w8-accent').trim(),
    picked: radios[2].value,
    button: getComputedStyle(document.querySelector('#preview ~ .sample-row .w8-button--primary, .sample-row .w8-button--primary')).backgroundColor,
    snippet: document.getElementById('snippet').textContent,
  };
})()`);
check(
  "accent selection drives --w8-accent and the snippet",
  accent.accentVariable === accent.picked && accent.snippet.includes(accent.picked),
  JSON.stringify(accent),
);

// Charms bar: the settings charm toggles its pane and keeps ARIA in sync.
await visit("/docs/index.html", 1280, 900);
const charms = await (async () => {
  await evaluate("document.querySelector('#charms .preview').scrollIntoView({ block: 'center' }); true");
  const selector = "#charms [data-charm-pane]";
  const before = await evaluate(`(() => { const charm = document.querySelector('${selector}'); const pane = document.getElementById(charm.getAttribute('data-charm-pane')); return { hidden: pane.hidden, expanded: charm.getAttribute('aria-expanded') }; })()`);
  await realClick(selector);
  const closed = await evaluate(`(() => { const charm = document.querySelector('${selector}'); const pane = document.getElementById(charm.getAttribute('data-charm-pane')); return { hidden: pane.hidden, expanded: charm.getAttribute('aria-expanded') }; })()`);
  await realClick(selector);
  const reopened = await evaluate(`(() => { const charm = document.querySelector('${selector}'); const pane = document.getElementById(charm.getAttribute('data-charm-pane')); return { hidden: pane.hidden, expanded: charm.getAttribute('aria-expanded') }; })()`);
  const geometry = await evaluate(`(() => {
    const bar = document.querySelector('#charms .w8-charms');
    const charms = [...bar.querySelectorAll('.w8-charm')];
    return {
      count: charms.length,
      labels: charms.map((charm) => charm.textContent.trim()),
      activeBackground: getComputedStyle(bar.querySelector('[aria-expanded="true"]')).backgroundColor,
      icons: charms.map((charm) => getComputedStyle(charm.querySelector('.w8-charm__icon'), '::before').content).filter(Boolean).length,
    };
  })()`);
  return { before, closed, reopened, geometry };
})();
check(
  "charms bar renders five charms with glyphs and a filled active state",
  charms.geometry.count === 5 && charms.geometry.icons === 5 && charms.geometry.activeBackground.replace(/rgba\(0, 120, 215, 1\)/, "rgb(0, 120, 215)") === "rgb(0, 120, 215)",
  JSON.stringify(charms.geometry),
);
check(
  "settings charm toggles its flyout pane and aria-expanded",
  charms.before.hidden === false && charms.closed.hidden === true && charms.closed.expanded === "false" && charms.reopened.hidden === false && charms.reopened.expanded === "true",
  JSON.stringify({ before: charms.before, closed: charms.closed, reopened: charms.reopened }),
);
await shoot("docs-charms");

// Shell demo: lock screen unlocks, semantic zoom collapses the tiles, the
// taskbar clock and app-bar flyouts open and close, and toasts appear.
await visit("/examples/shell.html", 1440, 900);
const lockFlow = await evaluate(`(async () => {
  const surface = document.getElementById("lock-surface");
  const idleVisible = !document.getElementById("lock-idle").hidden;
  surface.click();
  await new Promise((done) => requestAnimationFrame(done));
  const signin = {
    idleHidden: document.getElementById("lock-idle").hidden,
    panelVisible: !document.getElementById("lock-signin").hidden,
    dimmed: surface.classList.contains("w8-lock--dimmed"),
    focused: document.activeElement.id,
  };
  document.getElementById("lock-signin-button").click();
  await new Promise((done) => requestAnimationFrame(done));
  const after = {
    startVisible: !document.getElementById("start").hidden,
    lockHidden: document.getElementById("lock").hidden,
    toastVisible: !document.getElementById("toast").hidden,
    toastText: document.querySelector(".w8-toast__title").textContent.trim(),
    focused: document.activeElement.id,
  };
  const closedToast = (() => {
    document.querySelector(".w8-toast__close").click();
    return document.getElementById("toast").hidden;
  })();
  return { idleVisible, signin, after, closedToast };
})()`);
check(
  "lock screen opens sign-in, then unlocks to the Start screen",
  lockFlow.idleVisible === true &&
    lockFlow.signin.idleHidden === true &&
    lockFlow.signin.panelVisible === true &&
    lockFlow.signin.dimmed === true &&
    lockFlow.signin.focused === "lock-password" &&
    lockFlow.after.startVisible === true &&
    lockFlow.after.lockHidden === true &&
    lockFlow.after.focused === "start-heading",
  JSON.stringify(lockFlow),
);
check(
  "unlocking raises a dismissible toast",
  lockFlow.after.toastVisible === true && lockFlow.after.toastText.length > 0 && lockFlow.closedToast === true,
  JSON.stringify({ visible: lockFlow.after.toastVisible, text: lockFlow.after.toastText, closed: lockFlow.closedToast }),
);
await shoot("shell-start");

const zoom = await evaluate(`(async () => {
  const groups = document.getElementById("tile-groups");
  const toggle = document.getElementById("zoom-toggle");
  const before = { tiles: groups.querySelectorAll(".w8-tile").length, label: getComputedStyle(groups.querySelector(".w8-tile-group__label")).display };
  const normalTile = groups.querySelector(".w8-tile__label");
  const normalVisible = normalTile && getComputedStyle(normalTile).display !== "none";
  toggle.click();
  await new Promise((done) => requestAnimationFrame(done));
  const overviewTile = groups.querySelector(".w8-tile__label");
  const after = {
    overview: groups.classList.contains("w8-tile-groups--overview"),
    pressed: toggle.getAttribute("aria-pressed"),
    tileLabel: overviewTile ? getComputedStyle(overviewTile).display : "missing",
    groupLabel: getComputedStyle(groups.querySelector(".w8-tile-group__label")).display,
    tileWidth: Math.round(groups.querySelector(".w8-tile").getBoundingClientRect().width),
    overallWidth: Math.round(groups.getBoundingClientRect().width),
  };
  toggle.click();
  return { before, normalVisible, after, restored: !groups.classList.contains("w8-tile-groups--overview") };
})()`);
check(
  "semantic zoom swaps tile labels for group names",
  zoom.normalVisible === true &&
    zoom.after.overview === true &&
    zoom.after.pressed === "true" &&
    zoom.after.tileLabel === "none" &&
    zoom.after.groupLabel !== "none" &&
    zoom.after.tileWidth > 0 &&
    zoom.after.overallWidth <= 1440 &&
    zoom.restored === true,
  JSON.stringify(zoom),
);
await shoot("shell-zoom");

await realClick('[data-scene="desktop"]');
await evaluate("new Promise((done) => setTimeout(done, 250))");
const desktop = await evaluate(`(async () => {
  const clock = document.getElementById("clock-button");
  const flyout = document.getElementById("clock-flyout");
  clock.click();
  await new Promise((done) => requestAnimationFrame(done));
  const opened = { visible: !flyout.hidden, expanded: clock.getAttribute("aria-expanded"), time: flyout.querySelector(".clock-flyout__time").textContent.trim() };
  clock.click();
  const closed = flyout.hidden;
  const share = document.getElementById("share-command");
  const shareFlyout = document.getElementById("share-flyout");
  share.click();
  await new Promise((done) => requestAnimationFrame(done));
  const shareOpened = { visible: !shareFlyout.hidden, expanded: share.getAttribute("aria-expanded") };
  document.querySelector('[data-dismiss-flyout="share-flyout"]').click();
  const taskbar = document.querySelector(".desk-taskbar");
  const app = taskbar.querySelector('.w8-taskbar__app[aria-current="page"]');
  const rect = app.getBoundingClientRect();
  const barRect = taskbar.getBoundingClientRect();
  return {
    opened,
    closed,
    shareOpened,
    shareClosed: shareFlyout.hidden,
    taskbar: {
      atBottom: Math.abs(barRect.bottom - innerHeight) <= 1,
      width: Math.round(barRect.width),
      activeApp: getComputedStyle(app).backgroundColor,
      trayItems: taskbar.querySelectorAll(".w8-taskbar__tray-item").length,
      clockText: taskbar.querySelector(".w8-taskbar__clock").textContent.trim(),
      appInside: rect.right <= barRect.right + 1 && rect.left >= barRect.left - 1,
    },
    deskCharms: getComputedStyle(document.querySelector(".desk-charms")).position,
  };
})()`);
check(
  "taskbar clock and app-bar flyouts open, report state and close",
  desktop.opened.visible === true &&
    desktop.opened.expanded === "true" &&
    desktop.opened.time.length > 0 &&
    desktop.closed === true &&
    desktop.shareOpened.visible === true &&
    desktop.shareOpened.expanded === "true" &&
    desktop.shareClosed === true,
  JSON.stringify({ opened: desktop.opened, closed: desktop.closed, share: desktop.shareOpened, shareClosed: desktop.shareClosed }),
);
check(
  "desktop taskbar pins to the bottom with tray, clock and an active app",
  desktop.taskbar.atBottom === true &&
    desktop.taskbar.activeApp !== "rgba(0, 0, 0, 0)" &&
    desktop.taskbar.trayItems === 4 &&
    /9:41/.test(desktop.taskbar.clockText) &&
    desktop.taskbar.appInside === true &&
    desktop.deskCharms === "absolute",
  JSON.stringify(desktop.taskbar),
);
await shoot("shell-desktop");

// Charm panes inside the shell open on the Start screen and close on Escape.
await realClick('[data-scene="start"]');
await evaluate("new Promise((done) => setTimeout(done, 200))");
await realClick('#start [data-charm-pane="search-pane"]');
const charmPane = await evaluate(`(() => {
  const pane = document.getElementById("search-pane");
  const charm = document.querySelector('#start [data-charm-pane="search-pane"]');
  const rect = pane.getBoundingClientRect();
  return {
    visible: !pane.hidden,
    expanded: charm.getAttribute("aria-expanded"),
    results: pane.querySelectorAll(".w8-charm-pane__result").length,
    insideViewport: rect.right <= innerWidth + 1 && rect.left >= 0,
    focused: document.activeElement.tagName,
  };
})()`);
await pressKey("Escape", "Escape", 27);
const charmClosed = await evaluate("document.getElementById('search-pane').hidden");
check(
  "shell Charms search pane opens with results, stays on screen and closes on Escape",
  charmPane.visible === true &&
    charmPane.expanded === "true" &&
    charmPane.results === 3 &&
    charmPane.insideViewport === true &&
    charmPane.focused === "INPUT" &&
    charmClosed === true,
  JSON.stringify({ ...charmPane, closed: charmClosed }),
);
await shoot("shell-charms");

// Controls: the rating fills up to the checked star, the slider tracks its
// value and the search box paints the magnifier inside the field.
await visit("/docs/index.html", 1280, 900);
const controls = await evaluate(`(() => {
  const stars = [...document.querySelectorAll('#controls .w8-rating__star')];
  const checked = document.querySelector('#controls .w8-rating__input:checked');
  const checkedLabel = checked ? document.querySelector('label[for="' + checked.id + '"]') : null;
  const gold = stars.filter((star) => getComputedStyle(star).color === 'rgb(212, 160, 23)').length;
  const slider = document.querySelector('#controls .w8-slider');
  const sliderBox = slider.getBoundingClientRect();
  const thumbTrack = getComputedStyle(slider).getPropertyValue('height').trim();
  const search = document.querySelector('#controls .w8-search');
  const iconBox = search.querySelector('.w8-search__icon').getBoundingClientRect();
  const inputBox = search.querySelector('.w8-search__input').getBoundingClientRect();
  return {
    stars: stars.length,
    checked: !!checked,
    checkedIsGold: checkedLabel ? getComputedStyle(checkedLabel).color === 'rgb(212, 160, 23)' : false,
    gold,
    sliderValue: slider.value,
    sliderWidth: Math.round(sliderBox.width),
    sliderTrack: thumbTrack,
    iconInsideField: iconBox.left > inputBox.left && iconBox.right < inputBox.right,
    labels: stars.filter((star) => star.querySelector('.w8-sr-only')).length,
  };
})()`);
check(
  "rating, slider and search controls render and report state",
  controls.stars === 5 &&
    controls.checked === true &&
    controls.checkedIsGold === true &&
    controls.gold === 3 &&
    controls.sliderValue === "62" &&
    controls.sliderWidth > 100 &&
    controls.iconInsideField === true &&
    controls.labels === 5,
  JSON.stringify(controls),
);

const ratingKeyboard = await evaluate(`(() => {
  const radios = [...document.querySelectorAll('#controls .w8-rating__input')];
  const middle = radios[2];
  middle.focus();
  const focused = document.activeElement === middle;
  const outline = getComputedStyle(document.querySelector('label[for="' + middle.id + '"]')).outlineStyle;
  return { focused, outline, name: middle.name, total: radios.length };
})()`);
check(
  "rating stars are reachable radios with a labelled focus ring",
  ratingKeyboard.focused === true && ratingKeyboard.name === "rate" && ratingKeyboard.total === 5 && ratingKeyboard.outline !== "none",
  JSON.stringify(ratingKeyboard),
);

await visit("/examples/components.html", 1280, 900);
const listView = await evaluate(`(() => {
  const rows = [...document.querySelectorAll('.w8-list-view__item')];
  const selected = rows.find((row) => row.getAttribute('aria-selected') === 'true');
  const normal = rows.find((row) => row.getAttribute('aria-selected') === 'false');
  const flip = document.querySelector('.w8-flip-view');
  const nav = document.querySelector('.w8-nav-bar');
  return {
    rows: rows.length,
    selectedBackground: selected ? getComputedStyle(selected).backgroundColor : null,
    normalBackground: normal ? getComputedStyle(normal).backgroundColor : null,
    flipButtons: flip.querySelectorAll('.w8-flip-view__button').length,
    flipHeight: Math.round(flip.getBoundingClientRect().height),
    navCurrent: nav.querySelectorAll('[aria-current="page"]').length,
    overflow: document.documentElement.scrollWidth - innerWidth,
  };
})()`);
check(
  "list view, navigation bar and flip view render their states",
  listView.rows === 2 &&
    listView.selectedBackground !== listView.normalBackground &&
    listView.flipButtons === 2 &&
    listView.flipHeight > 100 &&
    listView.navCurrent === 1 &&
    listView.overflow <= 1,
  JSON.stringify(listView),
);

// Live tiles actually animate, and the flip stops for reduced motion.
await visit("/examples/shell.html", 1440, 900);
await realClick('[data-scene="start"]');
await evaluate("new Promise((done) => setTimeout(done, 250))");
const flip = await evaluate(`(() => {
  const flipper = document.querySelector("#start .w8-tile--live .w8-tile__flipper");
  const style = getComputedStyle(flipper);
  const faces = flipper.querySelectorAll(".w8-tile__face").length;
  const badge = document.querySelector("#start .w8-tile__badge");
  const badgeStyle = badge ? getComputedStyle(badge) : null;
  return {
    animation: style.animationName,
    duration: style.animationDuration,
    faces,
    badgePosition: badgeStyle ? badgeStyle.position : "missing",
    badgeVisible: badge ? badge.getBoundingClientRect().width > 0 : false,
  };
})()`);
check(
  "live tiles flip between two faces and carry a visible badge",
  flip.animation === "w8-tile-flip" && parseFloat(flip.duration) > 0 && flip.faces === 2 && flip.badgePosition === "absolute" && flip.badgeVisible === true,
  JSON.stringify(flip),
);

// Narrow viewports: each scene stays inside the viewport and the demo bar
// does not cover the Start screen heading area.
for (const scene of ["start", "desktop"]) {
  await visit("/examples/shell.html", 390, 844);
  await realClick(`[data-scene="${scene}"]`);
  await evaluate("new Promise((done) => setTimeout(done, 250))");
  const narrow = await evaluate(`(() => {
    const bar = document.querySelector(".demo-bar").getBoundingClientRect();
    const heading = document.getElementById("start-heading");
    const headingHidden = heading ? getComputedStyle(heading).display === "none" : true;
    const taskbar = document.querySelector(".desk-taskbar");
    const problems = [];
    document.querySelectorAll("#" + ${JSON.stringify(scene)} + " .w8-tile, #" + ${JSON.stringify(scene)} + " .w8-charm, .w8-taskbar__app, .w8-taskbar__tray-item").forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.right > innerWidth + 1) problems.push(node.className);
    });
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      barWidth: Math.round(bar.width),
      barInside: bar.right <= innerWidth + 1 && bar.left >= -1,
      headingHidden,
      taskbarVisible: taskbar ? getComputedStyle(taskbar).display !== "none" : false,
      problems: problems.slice(0, 3),
    };
  })()`);
  check(
    `shell ${scene} fits a 390px viewport`,
    narrow.overflow <= 1 && narrow.barInside === true && (scene === "desktop" || narrow.headingHidden === true) && narrow.problems.length === 0,
    JSON.stringify(narrow),
  );
  await shoot(`shell-${scene}-mobile`);
}

const reduced = await (async () => {
  // Measure on a page that uses the documented .w8 root scope.
  await visit("/examples/components.html", 1280, 900);
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
