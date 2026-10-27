import { copyFile, mkdir } from "node:fs/promises";
const source = new URL("../src/8.css", import.meta.url);
const outputDirectory = new URL("../dist/", import.meta.url);
const output = new URL("../dist/8.css", import.meta.url);
await mkdir(outputDirectory, { recursive: true });
await copyFile(source, output);
console.log("Built dist/8.css from src/8.css");
