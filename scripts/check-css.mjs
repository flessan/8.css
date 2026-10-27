import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../src/8.css", import.meta.url), "utf8");
const output = await readFile(new URL("../dist/8.css", import.meta.url), "utf8");
assert.equal(output, source, "dist/8.css must match src/8.css");
assert.ok(!/@import\b/i.test(source), "Stylesheet must not depend on external CSS imports.");
const required = [".w8-start-screen", ".w8-tiles", ".w8-tile", ".w8-button", ".w8-input", ".w8-toggle", ".w8-progress", ".w8-window", ".w8-title-bar", ".w8-app-bar", ".w8-dialog", "@media (prefers-reduced-motion: reduce)"];
for (const selector of required) assert.ok(source.includes(selector), "Missing selector: " + selector);
const noComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
let depth = 0;
for (const char of noComments) {
  if (char === "{") depth += 1;
  if (char === "}") depth -= 1;
  assert.ok(depth >= 0, "Unexpected closing CSS brace.");
}
assert.equal(depth, 0, "CSS braces must balance.");
console.log("8.css checks passed.");
