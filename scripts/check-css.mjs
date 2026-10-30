import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildBundle, fontAwesomeAssets, moduleOrder } from "./lib/bundle.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const exists = async (path) => {
  try {
    await access(new URL(path, root));
    return true;
  } catch {
    return false;
  }
};

/* ------------------------------------------------------------------ *
 * Stylesheet generation and module layout
 * ------------------------------------------------------------------ */
const { bundle, modules, fontAwesome } = await buildBundle();
assert.equal(await read("src/8.css"), bundle, "src/8.css must be generated from the Font Awesome bundle and gui modules.");
assert.equal(await read("dist/8.css"), bundle, "dist/8.css must match the generated source.");
assert.equal(
  await read("docs/8.css"),
  bundle,
  "docs/8.css must match the published CSS bundle for GitHub Pages.",
);
assert.ok(!/@import\b/i.test(bundle), "Complete stylesheet must not require external CSS imports.");
assert.ok(bundle.startsWith("/*!"), "Complete stylesheet must keep the license banner first.");
assert.ok(
  bundle.indexOf("@font-face") < bundle.indexOf(".w8-start-screen"),
  "Bundled Font Awesome must load before the 8.css component modules.",
);

for (const selector of [
  ".w8-start-screen",
  ".w8-tiles",
  ".w8-tile--wide",
  ".w8-button--primary",
  ".w8-input",
  ".w8-toggle__input",
  ".w8-progress",
  ".w8-tabs",
  ".w8-window",
  ".w8-app-bar",
  ".w8-charms",
  ".w8-charm-pane",
  ".w8-lock",
  ".w8-lock__time",
  ".w8-battery",
  ".w8-tile__badge",
  ".w8-tile--live",
  ".w8-tile-groups--overview",
  ".w8-taskbar",
  ".w8-taskbar__preview",
  ".w8-flyout",
  ".w8-flyout__item",
  ".w8-tooltip",
  ".w8-toast",
  ".w8-hub",
  ".w8-split",
  ".w8-progress-ring",
  ".w8-app-bar--circular",
  ".w8-slider",
  ".w8-rating",
  ".w8-search",
  ".w8-nav-bar",
  ".w8-list-view",
  ".w8-flip-view",
  ".w8-dialog",
  ".w8-icon-button",
  ".w8-icon--large",
  "@media (prefers-reduced-motion: reduce)",
]) {
  assert.ok(bundle.includes(selector), "Missing selector: " + selector);
}

for (const module of modules) {
  const output = await read("dist/gui/" + module.name);
  assert.equal(output, module.content, "Distribution module differs for " + module.name);
  assert.ok(!/@import\b/i.test(module.content), "Module has external CSS import: " + module.name);
  const clean = module.content.replace(/\/\*[\s\S]*?\*\//g, "");
  let depth = 0;
  for (const character of clean) {
    if (character === "{") depth++;
    if (character === "}") depth--;
    assert.ok(depth >= 0, "Extra closing CSS brace in " + module.name);
  }
  assert.equal(depth, 0, "CSS braces must balance in " + module.name);
}
assert.deepEqual(
  (await readdir(new URL("dist/gui/", root))).sort(),
  moduleOrder.slice().sort(),
  "dist/gui must contain exactly the documented modules.",
);

/* ------------------------------------------------------------------ *
 * Font Awesome 4.7.0 distribution
 * ------------------------------------------------------------------ */
assert.match(fontAwesome, /Font Awesome 4\.7\.0/, "Vendored Font Awesome stylesheet must be 4.7.0.");
assert.ok(
  !/url\('\.\.\/fonts\//.test(fontAwesome),
  "Bundled Font Awesome URLs must be rewritten for the published layout.",
);
assert.ok(
  bundle.includes("url('./font-awesome/fonts/fontawesome-webfont.woff2?v=4.7.0')"),
  "Bundled stylesheet must reference the self-hosted woff2 font.",
);
assert.equal(
  (bundle.match(/@font-face/g) || []).length,
  1,
  "The bundle must declare exactly one icon @font-face.",
);

// Every local url() must resolve next to the stylesheet that references it.
for (const stylesheet of [
  "dist/8.css",
  "docs/8.css",
  "dist/font-awesome/css/font-awesome.css",
  "dist/font-awesome/css/font-awesome.min.css",
]) {
  const css = await read(stylesheet);
  for (const match of css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
    const url = match[2];
    if (/^(?:data:|https?:|\/\/|#)/.test(url)) continue;
    const [path] = url.split(/[?#]/);
    const resolved = relative(fileURLToPath(root), fileURLToPath(new URL(path, new URL(stylesheet, root))));
    assert.ok(await exists(resolved), `${stylesheet} references a missing asset: ${url}`);
  }
}

const fontAwesomeFontFiles = [...fontAwesomeAssets.css, ...fontAwesomeAssets.fonts, fontAwesomeAssets.license];
for (const file of fontAwesomeFontFiles) {
  assert.ok(await exists(`vendor/font-awesome/${file}`), "Missing vendored Font Awesome asset: " + file);
  const source = await readFile(new URL(`vendor/font-awesome/${file}`, root));
  for (const target of ["dist", "docs"]) {
    assert.ok(await exists(`${target}/font-awesome/${file}`), `Missing ${target} Font Awesome asset: ${file}`);
    const copy = await readFile(new URL(`${target}/font-awesome/${file}`, root));
    assert.ok(copy.equals(source), `${target}/font-awesome/${file} must match the vendored copy.`);
  }
}

const fontAwesomeLicense = await read("dist/font-awesome/LICENSE.txt");
assert.match(fontAwesomeLicense, /SIL OPEN FONT LICENSE Version 1\.1/, "Font license text must be included.");
assert.match(fontAwesomeLicense, /MIT License/i, "Stylesheet license text must be included.");
assert.match(fontAwesomeLicense, /Font Awesome by Dave Gandy/, "Attribution must be preserved.");

// The icon font must be the real thing: every referenced glyph is in the font.
const iconFontMarkup = await read("vendor/font-awesome/fonts/fontawesome-webfont.svg");
assert.match(iconFontMarkup, /font-family="FontAwesome"/, "Vendored SVG font must be Font Awesome.");

/* ------------------------------------------------------------------ *
 * Glyph coverage for every icon class used in the HTML pages
 * ------------------------------------------------------------------ */
const pages = ["index.html", "docs/index.html", "examples/components.html", "examples/legacy-start-screen.html"];
const fontAwesomeCss = await read("vendor/font-awesome/css/font-awesome.css");
const glyphMap = new Map();
for (const block of fontAwesomeCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const [, selectors, body] = block;
  const content = body.match(/content:\s*"\\([0-9a-f]+)"/);
  if (!content || !selectors.includes(".fa-")) continue;
  for (const name of selectors.matchAll(/\.fa-([a-z0-9-]+):before/g)) {
    glyphMap.set(name[1], parseInt(content[1], 16));
  }
}
assert.ok(glyphMap.size > 600, `Expected the full Font Awesome 4.7.0 set, found ${glyphMap.size} glyphs.`);

const utilityClasses = new Set([
  "lg",
  "2x",
  "3x",
  "4x",
  "5x",
  "fw",
  "ul",
  "li",
  "border",
  "stack",
  "stack-1x",
  "stack-2x",
  "inverse",
  "spin",
  "pulse",
  "rotate-90",
  "rotate-180",
  "rotate-270",
  "flip-horizontal",
  "flip-vertical",
  "pull-left",
  "pull-right",
  "1x",
]);

const fontUnicode = new Set(
  [...iconFontMarkup.matchAll(/unicode="&#x([0-9a-f]+);"/g)].map((match) => parseInt(match[1], 16)),
);
assert.ok(fontUnicode.size > 600, "Vendored SVG font must contain the full glyph set.");

for (const page of pages) {
  const html = await read(page);
  assert.ok(!/icons\.svg/.test(html), `${page} must not reference the removed SVG sprite.`);
  assert.ok(!/#w8-icon-/.test(html), `${page} must not reference the removed sprite symbol IDs.`);
  assert.ok(!/\bw8-icon w8-icon--/.test(html) || /class="fa /.test(html), `${page} must pair icon hooks with .fa.`);

  const usedIcons = new Set();
  for (const match of html.matchAll(/class="([^"]*\bfa\b[^"]*)"/g)) {
    for (const token of match[1].split(/\s+/)) {
      if (!token.startsWith("fa-")) continue;
      const name = token.slice(3);
      if (utilityClasses.has(name)) continue;
      usedIcons.add(name);
    }
  }
  assert.ok(usedIcons.size > 0, `${page} must use Font Awesome icons.`);
  for (const name of usedIcons) {
    assert.ok(glyphMap.has(name), `${page} uses unknown Font Awesome 4.7.0 icon: fa-${name}`);
    const codepoint = glyphMap.get(name);
    assert.ok(fontUnicode.has(codepoint), `Font file has no glyph for fa-${name} (U+${codepoint.toString(16)}).`);
  }

  assert.ok(
    /(font-awesome\/(css\/font-awesome(\.min)?\.css|fonts\/fontawesome-webfont\.woff2))|(8\.css)/.test(html),
    `${page} must load the bundled or standalone Font Awesome stylesheet.`,
  );
  const visibleMarkup = html.replace(/<!--[\s\S]*?-->/g, "");
  assert.ok(
    !/(maxcdn\.bootstrapcdn|cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome|use\.fontawesome|kit\.fontawesome)/.test(
      visibleMarkup,
    ),
    `${page} must not load an icon font from a third-party CDN.`,
  );
  assert.ok(
    !/class="[^"]*\b(?:fa-solid|fa-regular|fa-light|fa-brands|fas|far|fab)\b/.test(visibleMarkup),
    `${page} must use Font Awesome 4.7.0 classes, not Font Awesome 5+ syntax.`,
  );

  // Decorative icons must be hidden from assistive technology.
  for (const match of html.matchAll(/<i\b([^>]*class="[^"]*\bfa\b[^"]*"[^>]*)>/g)) {
    assert.match(match[1], /aria-hidden="true"/, `${page} has an icon without aria-hidden="true": ${match[0]}`);
  }

  // Icon-only controls need an accessible name.
  for (const match of html.matchAll(/<(?:button|a)\b([^>]*class="[^"]*\bw8-icon-button\b[^"]*"[^>]*)>/g)) {
    assert.match(match[1], /aria-label="[^"]+"/, `${page} has an icon button without aria-label: ${match[0]}`);
  }

  // Window controls use icon glyphs, not improvised text symbols.
  assert.ok(!/class="w8-window-control[^"]*"[^>]*>\s*[−□×✕✖]/.test(html), `${page} uses text symbols for window controls.`);

  // Container tags must nest correctly; browsers would silently repair this.
  const containers = new Set([
    "div",
    "section",
    "article",
    "aside",
    "main",
    "header",
    "footer",
    "nav",
    "ul",
    "ol",
    "li",
    "details",
    "dialog",
    "figure",
  ]);
  const stack = [];
  const markup = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const match of markup.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g)) {
    const [, closing, rawName, attributes] = match;
    const name = rawName.toLowerCase();
    if (!containers.has(name)) continue;
    if (closing) {
      assert.equal(stack.pop(), name, `${page} has an unexpected </${name}> closing tag.`);
    } else if (!attributes.trim().endsWith("/")) {
      stack.push(name);
    }
  }
  assert.deepEqual(stack, [], `${page} has unclosed container tags.`);

  // Local links and assets must exist in the repository.
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:[a-z]+:|\/\/|#|mailto:)/i.test(target)) continue;
    const [path] = target.split(/[?#]/);
    if (!path || path.endsWith("/")) continue;
    const resolved = path.startsWith("/")
      ? path.slice(1)
      : relative(fileURLToPath(root), fileURLToPath(new URL(path, new URL(page, root))));
    assert.ok(await exists(resolved), `${page} links to a missing file: ${target}`);
  }
}

// docs/index.html is the GitHub Pages root, so its navigation must stay
// in-page or absolute; relative paths would 404 once published.
for (const tag of (await read("docs/index.html")).matchAll(/<a\b[^>]*class="[^"]*tree-link[^"]*"[^>]*>/g)) {
  const href = tag[0].match(/href="([^"]+)"/)?.[1] ?? "";
  assert.ok(
    href.startsWith("#") || /^https?:/.test(href),
    `docs/index.html navigation link must be in-page or absolute: ${href}`,
  );
}
assert.ok(
  (await read("docs/script.js")).includes('href.startsWith("#")'),
  "docs/script.js must ignore non-anchor navigation links when tracking the active section.",
);

/* ------------------------------------------------------------------ *
 * Accessible page scaffolding and demo quality
 * ------------------------------------------------------------------ */
const home = await read("index.html");
const docsPage = await read("docs/index.html");
for (const [page, html] of [
  ["index.html", home],
  ["docs/index.html", docsPage],
]) {
  assert.match(html, /<a class="skip-link" href="#main">/, `${page} must start with a skip link.`);
  assert.match(
    html,
    /<main\b[^>]*\bid="main"[^>]*\btabindex="-1"[^>]*>/,
    `${page} must expose a focusable main region for the skip link.`,
  );
  assert.ok(
    html.indexOf('class="skip-link"') < html.indexOf("<main"),
    `${page} skip link must come before the main region in DOM order.`,
  );
}

const docsCss = await read("docs/docs.css");
assert.match(docsCss, /\.skip-link:focus\{top:8px\}/, "The skip link must become visible on focus.");
assert.match(docsCss, /\.tree-link:focus-visible\{outline:2px solid/, "Sidebar links need a visible focus ring.");

const docsScript = await read("docs/script.js");
assert.match(
  docsScript,
  /catch\{\}[\s\S]*selectionCopy/,
  "docs/script.js must fall back to a selection copy when the clipboard API rejects.",
);
assert.match(docsScript, /document\.execCommand\("copy"\)/, "docs/script.js must keep an execCommand copy fallback.");

// The dense tile flow keeps the Start Screen previews from developing holes.
assert.match(home, /grid-auto-flow:row dense/, "The landing page preview must fill tile rows densely.");
assert.match(docsCss, /grid-auto-flow:row dense/, "The documentation tile preview must fill rows densely.");
assert.match(docsCss, /#tiles \.preview \.w8-tiles\{grid-template-columns:repeat\(3/, "The tile demo should read as a complete Start Screen group.");

/* ------------------------------------------------------------------ *
 * Wallpaper pack
 * ------------------------------------------------------------------ */
const packDirectory = "styles/images/wallpapers";
const packManifest = JSON.parse(await read(`${packDirectory}/manifest.json`));
assert.ok(Array.isArray(packManifest.wallpapers) && packManifest.wallpapers.length >= 20, "The wallpaper manifest must list the pack.");
assert.equal(packManifest.counts.total, packManifest.wallpapers.length, "Manifest counts must match the wallpaper list.");
assert.equal(
  packManifest.counts["windows-8"] + packManifest.counts["windows-8.1"],
  packManifest.wallpapers.length,
  "Manifest window counts must add up.",
);
for (const wallpaper of packManifest.wallpapers) {
  assert.match(wallpaper.id, /^win8(1)?-img\d+$/, `Unexpected wallpaper id: ${wallpaper.id}`);
  assert.ok(wallpaper.title && wallpaper.title.length > 2, `Wallpaper ${wallpaper.id} needs a title.`);
  assert.ok(["Windows 8", "Windows 8.1"].includes(wallpaper.window), `Wallpaper ${wallpaper.id} has an unknown window.`);
  assert.ok(wallpaper.width >= 1920 && wallpaper.height >= 1200, `Wallpaper ${wallpaper.id} should be at least 1920x1200.`);
  assert.match(wallpaper.dominant, /^#[0-9a-f]{6}$/, `Wallpaper ${wallpaper.id} needs a dominant colour.`);
  assert.match(wallpaper.accent, /^#[0-9a-f]{6}$/, `Wallpaper ${wallpaper.id} needs an accent colour.`);
  assert.equal(wallpaper.span, wallpaper.width >= 3840 ? "triple" : "single", `Wallpaper ${wallpaper.id} has an unexpected span.`);
  assert.ok(await exists(`styles/images/${wallpaper.file}`), `Missing wallpaper file: ${wallpaper.file}`);
  assert.ok(await exists(`styles/images/${wallpaper.thumb}`), `Missing wallpaper thumbnail: ${wallpaper.thumb}`);
  assert.ok(await exists(`dist/wallpapers/${wallpaper.id}.jpg`), `Missing published thumbnail: ${wallpaper.id}`);
  const sourceBytes = await readFile(new URL(`styles/images/${wallpaper.file}`, root));
  assert.equal(sourceBytes.length, wallpaper.bytes, `Manifest byte size is stale for ${wallpaper.id}.`);
}

const wallpaperCss = await read(`${packDirectory}/wallpapers.css`);
const distWallpaperCss = await read("dist/wallpapers/wallpapers.css");
for (const wallpaper of packManifest.wallpapers) {
  assert.ok(wallpaperCss.includes(`.w8-wallpaper-${wallpaper.id} {`), `wallpapers.css is missing ${wallpaper.id}.`);
  assert.ok(wallpaperCss.includes(`url("../${wallpaper.file}")`), `wallpapers.css has the wrong path for ${wallpaper.id}.`);
  assert.ok(distWallpaperCss.includes(`url("/wallpapers/${wallpaper.id}.jpg")`), `dist wallpapers.css is missing ${wallpaper.id}.`);
}
const distManifest = JSON.parse(await read("dist/wallpapers/manifest.json"));
assert.equal(distManifest.wallpapers.length, packManifest.wallpapers.length, "The published manifest must stay in sync.");
assert.equal(distManifest.base, "/wallpapers/", "The published manifest must use root relative paths.");

// The library API for wallpapers.
assert.ok(bundle.includes("--w8-start-image"), "The bundle must document --w8-start-image.");
assert.match(await read("gui/tiles.css"), /\.w8-start-screen \{[^}]*background-image: var\(--w8-start-image, none\)/, "The Start Screen must paint --w8-start-image.");
assert.ok(await exists(`${packDirectory}/NOTICE.md`), "The wallpaper licensing notice must exist.");
assert.match(
  await read(`${packDirectory}/NOTICE.md`),
  /\*\*not\*\* covered by 8\.css's MIT license/i,
  "The notice must state that the artwork is not MIT licensed.",
);
assert.match(await read(`${packDirectory}/NOTICE.md`), /Microsoft/, "The notice must name the rights holder.");
const pkgForWallpapers = JSON.parse(await read("package.json"));
assert.ok(
  !pkgForWallpapers.files.some((entry) => entry.includes("Windows8") || entry.includes("styles/")),
  "Full resolution wallpapers must not be published to npm.",
);
assert.ok(pkgForWallpapers.files.includes("dist/wallpapers/"), "The thumbnail pack must be published.");
assert.ok(pkgForWallpapers.exports["./dist/wallpapers/*"], "Package exports must expose the wallpaper thumbnails.");

// The demo pages that present the pack must load their assets.
const wallpaperPage = await read("examples/wallpapers.html");
assert.match(wallpaperPage, /wallpapers\/wallpapers\.css/, "The wallpaper page must load the generated classes.");
assert.equal(
  (wallpaperPage.match(/class="wp-radio/g) || []).length,
  packManifest.wallpapers.length,
  "The wallpaper page must offer every wallpaper.",
);
assert.match(wallpaperPage, /name="wallpaper"/, "The wallpaper page needs a radio group.");
assert.match(await read("index.html"), /examples\/wallpapers\.html/, "The landing page must link to the wallpaper pack.");
assert.match(await read("docs/index.html"), /id="personalize"/, "The documentation must document the wallpaper API.");

/* ------------------------------------------------------------------ *
 * Windows shell surfaces: lock screen, live tiles, taskbar, flyouts
 * ------------------------------------------------------------------ */
for (const [id, marker] of [
  ["selection", "w8-tile__check"],
  ["controls", "w8-slider"],
  ["navigation", "w8-nav-bar"],
  ["lock", "w8-lock"],
  ["livetiles", "w8-tile__badge"],
  ["taskbar", "w8-taskbar"],
  ["flyout", "w8-toast"],
  ["hub", "w8-hub"],
]) {
  const start = docsPage.indexOf(`id="${id}"`);
  assert.ok(start > -1, `The documentation must have a #${id} section.`);
  assert.ok(
    docsPage.slice(start, start + 20000).includes(marker),
    `The #${id} documentation section must show ${marker}.`,
  );
  assert.ok(
    (await read("docs/index.html")).includes(`href="#${id}"`),
    `The sidebar must link to #${id}.`,
  );
}

const lockMarkup = docsPage.slice(docsPage.indexOf('id="lock"'), docsPage.indexOf('id="livetiles"'));
for (const cls of ["w8-lock__time", "w8-lock__date", "w8-lock__status-item", "w8-lock__panel", "w8-battery__level"]) {
  assert.ok(lockMarkup.includes(cls), `The lock screen example must show ${cls}.`);
}
assert.ok(lockMarkup.includes("--w8-lock-image"), "The lock screen docs must mention --w8-lock-image.");

// The lock screen paints its image and dims the surface for sign-in.
assert.match(
  await read("gui/lock-screen.css"),
  /\.w8-lock \{[^}]*background-image: var\(--w8-lock-image, none\)/,
  "The lock screen must paint --w8-lock-image.",
);
assert.match(
  await read("gui/lock-screen.css"),
  /\.w8-lock--dimmed::before/,
  "The lock screen must expose a dimmed state for sign-in.",
);

// Live tiles: a badge, a two faced flip, and the semantic zoom overview.
const liveTilesCss = await read("gui/live-tiles.css");
for (const selector of [".w8-tile__badge", ".w8-tile__flipper", ".w8-tile__face--back", ".w8-tile-groups--overview"]) {
  assert.ok(liveTilesCss.includes(selector), `gui/live-tiles.css is missing ${selector}.`);
}
assert.match(liveTilesCss, /@keyframes w8-tile-flip/, "The flip animation must be defined.");
assert.match(
  liveTilesCss,
  /prefers-reduced-motion[\s\S]*\.w8-tile__flipper \{ animation: none; \}/,
  "The flip animation must stop for reduced motion.",
);

// Toast and flyout surfaces must respect the hidden attribute and stay accessible.
const toastCss = await read("gui/toast.css");
assert.match(toastCss, /\.w8-toast\[hidden\] \{ display: none; \}/, "Hidden toasts must not render.");
assert.match(toastCss, /@keyframes w8-toast-in/, "Toasts need an entrance animation.");
const flyoutCss = await read("gui/flyout.css");
for (const modifier of ["--top", "--bottom", "--left", "--right"]) {
  assert.ok(flyoutCss.includes(`w8-flyout${modifier} .w8-flyout__arrow`), `Flyout placement ${modifier} needs an arrow.`);
}
assert.match(flyoutCss, /\.w8-flyout__item:focus-visible/, "Menu flyout items need a visible focus ring.");

// Taskbar: preview appears on hover and keyboard focus, clock is a control surface.
const taskbarCss = await read("gui/taskbar.css");
assert.match(taskbarCss, /:hover \.w8-taskbar__preview,[\s\S]*:focus-within \.w8-taskbar__preview/, "Taskbar previews must appear for keyboard users too.");
assert.match(taskbarCss, /\.w8-taskbar__app\[aria-current="page"\]/, "The active taskbar app must be derived from ARIA.");

// Split view collapses to a stack and hubs stop panning on phones.
assert.match(await read("gui/split-view.css"), /@media \(max-width: 48rem\)/, "Split view needs a narrow screen fallback.");
assert.match(await read("gui/hub.css"), /@media \(max-width: 40rem\)/, "Hubs need a narrow screen fallback.");

// The shell demo must exist, use the components and load its wallpaper.
assert.ok(await exists("examples/shell.html"), "The shell demo page must exist.");
const shellPage = await read("examples/shell.html");
for (const cls of [
  "w8-lock",
  "w8-tile--live",
  "w8-tile-groups--overview",
  "w8-taskbar",
  "w8-charm-pane",
  "w8-flyout",
  "w8-toast",
  "w8-hub",
  "w8-app-bar--circular",
]) {
  assert.ok(shellPage.includes(cls), `The shell demo must use ${cls}.`);
}
assert.match(shellPage, /styles\/images\/Windows8\.1RTMWallpapers\/img13\.jpg/, "The shell lock screen must use a packed wallpaper.");
assert.match(shellPage, /data-charm-pane="/, "The shell demo must wire its charm panes.");
assert.equal(
  (shellPage.match(/class="w8-charm"/g) || []).length % 5,
  0,
  "Each Charms bar in the shell demo must carry the five charms.",
);
assert.ok(
  (shellPage.match(/class="w8-charm"/g) || []).length >= 10,
  "The shell demo needs a Charms bar on Start and on the desktop.",
);

// Landing page and gallery must link the new surfaces.
assert.match(home, /examples\/shell\.html/, "The landing page must link to the shell demo.");
assert.match(home, /id="shell"/, "The landing page needs a shell section.");
const galleryPage = await read("examples/components.html");
for (const id of ["lock-gallery", "taskbar-gallery"]) {
  assert.ok(galleryPage.includes(`id="${id}"`), `The gallery must include #${id}.`);
}
assert.match(galleryPage, /shell\.html/, "The gallery must link to the shell demo.");
assert.ok((await read("gui/tiles.css")).includes(".w8-tile--selected"), "Selected tiles must be styled.");
assert.match(shellPage, /w8-tile--selected/, "The shell demo must implement tile selection.");
assert.match(shellPage, /id="start-appbar"/, "The shell demo needs the contextual tile app bar.");

// Extra controls: the rating is a radio group, the slider a range input.
const formsCss = await read("gui/forms.css");
for (const selector of [".w8-slider", ".w8-slider::-webkit-slider-thumb", ".w8-rating__input", ".w8-rating__star", ".w8-search__icon"]) {
  assert.ok(formsCss.includes(selector), `gui/forms.css is missing ${selector}.`);
}
assert.match(formsCss, /--w8-accent[\s\S]*-webkit-slider-thumb/, "The slider thumb must use the accent colour.");
assert.match(formsCss, /fieldset\.w8-field \{ border: 0;/, "Fieldsets used as fields must not draw a frame.");

const controlsSection = docsPage.slice(docsPage.indexOf('id="controls"'), docsPage.indexOf('id="navigation"'));
assert.match(controlsSection, /type="range"/, "The slider demo must use a native range input.");
assert.equal(
  (controlsSection.match(/class="w8-rating__input"/g) || []).length,
  5,
  "The rating demo must offer five stars.",
);
for (const radio of controlsSection.match(/class="w8-rating__input"[^>]*>/g) || []) {
  assert.match(radio, /aria-hidden|id="rate-\d"/, "Each rating radio needs an id for its label.");
}
assert.equal((controlsSection.match(/:checked|checked\/>/g) || []).length >= 1, true, "The rating demo needs a selected star.");
assert.match(controlsSection, /w8-search__icon/, "The search demo must show the magnifier hook.");
assert.equal(
  (controlsSection.match(/<span class="w8-sr-only">/g) || []).length,
  5,
  "Every rating star needs an accessible label.",
);

// Navigation module: state comes from ARIA, not from extra classes.
const navCss = await read("gui/navigation.css");
for (const selector of [".w8-back", ".w8-nav-bar__item", ".w8-list-view__item", ".w8-flip-view__button"]) {
  assert.ok(navCss.includes(selector), `gui/navigation.css is missing ${selector}.`);
}
assert.match(navCss, /\[aria-current="page"\]/, "Navigation selection must follow aria-current.");
assert.match(navCss, /\[aria-selected="true"\]/, "List selection must follow aria-selected.");
assert.match(navCss, /\.w8-list-view__item:focus-visible/, "List rows need a visible focus ring.");
assert.ok(docsPage.includes('id="navigation"'), "The documentation must cover navigation and lists.");
assert.ok((await read("examples/components.html")).includes('class="w8-flip-view"'), "The gallery must show the flip view.");

// Every page that uses the new surfaces must load the bundle.
for (const page of ["docs/index.html", "examples/components.html", "examples/shell.html"]) {
  const html = await read(page);
  assert.match(html, /(8\.css|\.\.\/dist\/8\.css)/, `${page} must load the 8.css bundle.`);
}


// The Charms bar must be documented and demoed with a working flyout pane.
const charmsDocs = await read("docs/index.html");
const charmsGallery = await read("examples/components.html");
assert.match(charmsDocs, /id="charms"/, "The documentation must document the Charms bar.");
assert.ok(
  (charmsDocs.match(/class="w8-charm"/g) || []).length >= 5,
  "docs/index.html must show the full five-charm bar.",
);
assert.ok(
  (charmsGallery.match(/class="w8-charm"/g) || []).length >= 5,
  "examples/components.html must show the full five-charm bar.",
);
assert.match(
  charmsGallery,
  /data-charm-pane="gallery-charm-pane"/,
  "The gallery charm must declare which pane it toggles.",
);
assert.match(await read("docs/script.js"), /data-charm-pane/, "The docs must wire the Charms bar flyout.");

/* ------------------------------------------------------------------ *
 * Package metadata
 * ------------------------------------------------------------------ */
const pkg = JSON.parse(await read("package.json"));
for (const file of pkg.files) {
  const normalized = file.replace(/\/$/, "");
  assert.ok(await exists(normalized), "package.json files entry does not exist: " + file);
}
assert.ok(pkg.files.includes("dist/font-awesome/"), "The icon font must be published with the package.");
assert.ok(pkg.files.includes("THIRD-PARTY-NOTICES.md"), "Third-party license notices must be published.");
assert.ok(pkg.exports["./dist/font-awesome/*"], "Package exports must expose the Font Awesome assets.");
for (const [key, value] of Object.entries(pkg.exports)) {
  if (value.includes("*")) {
    // Wildcard exports map a folder; check the directory they point at.
    const directory = value.slice(0, value.indexOf("*")).replace(/^\.\//, "").replace(/\/$/, "");
    assert.ok(await exists(directory), `package.json export ${key} points at a missing path: ${value}`);
    continue;
  }
  assert.ok(await exists(value.replace(/^\.\//, "")), `package.json export ${key} points at a missing file: ${value}`);
}
assert.equal(await read("THIRD-PARTY-NOTICES.md"), await read("dist/font-awesome/LICENSE.txt"), "The bundled license notice must match THIRD-PARTY-NOTICES.md.");

// Relative links in the Markdown documentation must resolve in the repo.
for (const markdown of ["README.md", "AGENTS.md", "docs/README.md", "docs/components.md", "docs/installation.md", "docs/customization.md", "docs/accessibility.md", "docs/ai-agents.md"]) {
  const text = await read(markdown);
  for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const [path] = target.split("#");
    if (!path) continue;
    const resolved = relative(fileURLToPath(root), fileURLToPath(new URL(path, new URL(markdown, root))));
    assert.ok(await exists(resolved), `${markdown} links to a missing file: ${target}`);
  }
}

/* ------------------------------------------------------------------ *
 * Documentation consistency
 * ------------------------------------------------------------------ */
const readme = await read("README.md");
for (const token of ["font-awesome", "Font Awesome 4.7.0", "SIL OFL"]) {
  assert.ok(readme.includes(token), "README must document the Font Awesome integration: " + token);
}
assert.ok(
  !/https?:\/\/[^\s"']*icons\.svg/.test(readme),
  "README must not advertise the removed SVG sprite as a downloadable asset.",
);
assert.match(readme, /Migrating from the 0\.2\.0 SVG sprite/, "README must document the icon migration path.");
assert.ok(!/w8-icon-mail/.test(await read("llms-full.txt")), "llms-full.txt must not reference removed sprite IDs.");

console.log("8.css module, bundle, distribution, icon font, and documentation checks passed.");
