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
