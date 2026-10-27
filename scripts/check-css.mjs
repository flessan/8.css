import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
const order=["base.css","tiles.css","buttons.css","forms.css","feedback.css","window.css","app-bar.css","dialog.css","responsive.css"];
const modules=await Promise.all(order.map(async(name)=>({name,content:await readFile(new URL("../gui/"+name,import.meta.url),"utf8")})));
const expected=modules.map(m=>m.content.trim()).join("\n\n")+"\n";
const source=await readFile(new URL("../src/8.css",import.meta.url),"utf8");
const dist=await readFile(new URL("../dist/8.css",import.meta.url),"utf8");
assert.equal(source,expected,"src/8.css must be generated from gui modules.");
assert.equal(dist,expected,"dist/8.css must match the generated source.");
const docsBundle=await readFile(new URL("../docs/8.css",import.meta.url),"utf8");
assert.equal(docsBundle,expected,"docs/8.css must match the published CSS bundle for GitHub Pages.");
assert.ok(!/@import\b/i.test(dist),"Complete stylesheet must not require external CSS imports.");
for(const selector of [".w8-start-screen",".w8-tiles",".w8-tile--wide",".w8-button--primary",".w8-input",".w8-toggle__input",".w8-progress",".w8-tabs",".w8-window",".w8-app-bar",".w8-dialog","@media (prefers-reduced-motion: reduce)"]) assert.ok(dist.includes(selector),"Missing selector: "+selector);
for(const m of modules){
 const output=await readFile(new URL("../dist/gui/"+m.name,import.meta.url),"utf8");
 assert.equal(output,m.content,"Distribution module differs for "+m.name);
 assert.ok(!/@import\b/i.test(m.content),"Module has external CSS import: "+m.name);
 const clean=m.content.replace(/\/\*[\s\S]*?\*\//g,"");let depth=0;
 for(const c of clean){if(c==="{")depth++;if(c==="}")depth--;assert.ok(depth>=0,"Extra closing CSS brace in "+m.name);}
 assert.equal(depth,0,"CSS braces must balance in "+m.name);
}
assert.deepEqual((await readdir(new URL("../dist/gui/",import.meta.url))).sort(),order.slice().sort());
console.log("8.css module, bundle, and distribution checks passed.");
