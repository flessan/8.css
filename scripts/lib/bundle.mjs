/**
 * Shared build helpers so scripts/build.mjs and scripts/check-css.mjs always
 * agree on how the published assets are generated.
 */
import { readFile } from "node:fs/promises";

/** Component modules, in cascade order. */
export const moduleOrder = [
  "base.css",
  "tiles.css",
  "buttons.css",
  "forms.css",
  "feedback.css",
  "window.css",
  "app-bar.css",
  "dialog.css",
  "icons.css",
  "responsive.css",
];

/** Files copied verbatim into the distribution and documentation folders. */
export const fontAwesomeAssets = {
  css: ["css/font-awesome.css", "css/font-awesome.min.css", "css/font-awesome.css.map"],
  fonts: [
    "fonts/fontawesome-webfont.eot",
    "fonts/fontawesome-webfont.svg",
    "fonts/fontawesome-webfont.ttf",
    "fonts/fontawesome-webfont.woff",
    "fonts/fontawesome-webfont.woff2",
  ],
  license: "LICENSE.txt",
};

/**
 * Banner placed before the vendored Font Awesome stylesheet inside 8.css.
 * The bundled copy makes icons work from a single stylesheet import.
 */
export const fontAwesomeBanner = [
  "/*!",
  " * 8.css bundles Font Awesome 4.7.0 so icons render without a CDN.",
  " * Font Awesome by Dave Gandy - http://fontawesome.io - @fontawesome",
  " * Font: SIL OFL 1.1. Stylesheet: MIT License.",
  " * Full license text: dist/font-awesome/LICENSE.txt",
  " */",
  "",
].join("\n");

export function readModule(name) {
  return readFile(new URL(`../../gui/${name}`, import.meta.url), "utf8");
}

export function readModuleList() {
  return Promise.all(moduleOrder.map(async (name) => ({ name, content: await readModule(name) })));
}

/**
 * The vendored stylesheet uses paths relative to vendor/font-awesome/css/.
 * In the published layout the fonts live next to the CSS, one directory up
 * from dist/8.css and docs/8.css, so the URL is rewritten accordingly.
 */
export async function readFontAwesomeStylesheet() {
  const raw = await readFile(new URL("../../vendor/font-awesome/css/font-awesome.css", import.meta.url), "utf8");
  return raw
    .replace(/url\('\.\.\/fonts\//g, "url('./font-awesome/fonts/")
    .replace(/\n?\/\*# sourceMappingURL=[^\n]*\*\/\s*$/, "\n");
}

/**
 * Builds the complete stylesheet: Font Awesome first, then the 8.css modules.
 * `modules` is returned so callers can detect drift in individual files.
 */
export async function buildBundle() {
  const modules = await readModuleList();
  const fontAwesome = await readFontAwesomeStylesheet();
  const components = modules.map((module) => module.content.trim()).join("\n\n");
  const bundle = `${fontAwesomeBanner}\n${fontAwesome.trim()}\n\n${components}\n`;
  return { bundle, modules, fontAwesome };
}
