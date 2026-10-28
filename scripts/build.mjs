import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { buildBundle, fontAwesomeAssets } from "./lib/bundle.mjs";

const root = new URL("../", import.meta.url);
const distDirectory = new URL("../dist/", import.meta.url);
const modularOutput = new URL("../dist/gui/", import.meta.url);
const docsDirectory = new URL("../docs/", import.meta.url);

const { bundle, modules } = await buildBundle();

await mkdir(new URL("../src/", import.meta.url), { recursive: true });
await mkdir(distDirectory, { recursive: true });
await mkdir(modularOutput, { recursive: true });

await writeFile(new URL("../src/8.css", import.meta.url), bundle);
await writeFile(new URL("8.css", distDirectory), bundle);

for (const module of modules) {
  await copyFile(new URL(module.name, new URL("../gui/", import.meta.url)), new URL(module.name, modularOutput));
}

await copyFile(new URL("8.css", distDirectory), new URL("8.css", docsDirectory));

// Self-hosted Font Awesome 4.7.0: stylesheet, fonts, and license notice.
for (const target of [distDirectory, docsDirectory]) {
  await mkdir(new URL("font-awesome/css/", target), { recursive: true });
  await mkdir(new URL("font-awesome/fonts/", target), { recursive: true });
  for (const file of [...fontAwesomeAssets.css, ...fontAwesomeAssets.fonts]) {
    await copyFile(new URL(`vendor/font-awesome/${file}`, root), new URL(`font-awesome/${file}`, target));
  }
  await copyFile(
    new URL(`vendor/font-awesome/${fontAwesomeAssets.license}`, root),
    new URL(`font-awesome/${fontAwesomeAssets.license}`, target),
  );
}

// One canonical third-party notice, generated from the vendored license.
await copyFile(
  new URL(`vendor/font-awesome/${fontAwesomeAssets.license}`, root),
  new URL("THIRD-PARTY-NOTICES.md", root),
);

console.log(
  "Built src/8.css, dist/8.css with bundled Font Awesome 4.7.0, modular dist/gui/*.css, " +
    "the self-hosted icon font, and documentation assets.",
);
