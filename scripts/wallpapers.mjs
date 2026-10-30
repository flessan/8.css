/**
 * Builds the wallpaper pack index.
 *
 * The Windows 8 / 8.1 RTM wallpapers in styles/images/ are demo assets: they
 * are not part of the npm package and are not covered by the project's MIT
 * license (see styles/images/wallpapers/NOTICE.md). This script only reads
 * their metadata and the committed thumbnails/palette, so it needs no image
 * decoding and no npm dependencies.
 *
 * Outputs:
 *   styles/images/wallpapers/manifest.json   machine readable catalogue
 *   styles/images/wallpapers/wallpapers.css  optional per-wallpaper CSS hooks
 */
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const imagesDirectory = fileURLToPath(new URL("../styles/images/", import.meta.url));
const packDirectory = join(imagesDirectory, "wallpapers");

const sets = [
  { prefix: "win8", directory: "Windows8RTM", window: "Windows 8", label: "Windows 8 RTM" },
  { prefix: "win81", directory: "Windows8.1RTMWallpapers", window: "Windows 8.1", label: "Windows 8.1 RTM" },
];

/** Curated, human readable titles; the fallback is a zero padded file name. */
const titles = {
  "win8-img0": "Daisy",
  "win8-img1": "Blue Ice",
  "win8-img2": "Desert Dunes",
  "win8-img3": "Shallows",
  "win8-img4": "Stone River",
  "win8-img5": "Green Fields",
  "win8-img6": "Sand Sea",
  "win8-img7": "Red Bloom",
  "win8-img8": "Pink Flower",
  "win8-img9": "Pink Bloom",
  "win8-img10": "Tulips",
  "win8-img11": "Blossom",
  "win8-img12": "Fern",
  "win8-img100": "Space Needle",
  "win8-img101": "Honeycomb",
  "win8-img102": "Prism",
  "win8-img103": "Transit",
  "win8-img104": "Nautilus",
  "win8-img105": "Piano",
  "win81-img0": "Amber Fold",
  "win81-img1": "Blue Lines",
  "win81-img2": "Blue Ribbon",
  "win81-img3": "Green Ribbon",
  "win81-img4": "Crimson Fold",
  "win81-img5": "Violet Waves",
  "win81-img6": "Steel Curve",
  "win81-img13": "Sunset Facade",
  "win81-img100": "Ribbon Fan",
};

/**
 * JPEG files carry their dimensions in the frame header. Reading it here keeps
 * the manifest accurate without pulling in an image library.
 */
async function readJpegSize(file) {
  const buffer = await readFile(file);
  let offset = 2;
  while (offset < buffer.length - 9) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    // SOF0-SOF15, excluding DHT (0xc4), JPG (0xc8) and DAC (0xcc).
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return { width: 0, height: 0 };
}

/** PNG files store width and height in the IHDR chunk at a fixed offset. */
async function readPngSize(file) {
  const buffer = await readFile(file);
  if (buffer.toString("ascii", 12, 16) !== "IHDR") return { width: 0, height: 0 };
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const readSize = async (file) =>
  extname(file).toLowerCase() === ".png" ? readPngSize(file) : readJpegSize(file);

const spanFor = (width) => (width >= 3840 ? "triple" : width >= 2560 ? "dual" : "single");

let palette = {};
try {
  palette = JSON.parse(await readFile(join(packDirectory, "palette.json"), "utf8"));
} catch {
  console.warn("wallpapers: palette.json is missing, falling back to neutral colours.");
}

await mkdir(packDirectory, { recursive: true });
await mkdir(join(packDirectory, "thumbs"), { recursive: true });

const wallpapers = [];
const warnings = [];

for (const set of sets) {
  const directory = join(imagesDirectory, set.directory);
  let files;
  try {
    files = await readdir(directory);
  } catch {
    warnings.push(`missing source directory: ${set.directory}`);
    continue;
  }
  const ordered = files
    .filter((file) => /\.(jpe?g|png)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  for (const file of ordered) {
    const id = `${set.prefix}-${file.replace(/\.[^.]+$/, "").toLowerCase()}`;
    const absolute = join(directory, file);
    const { width, height } = await readSize(absolute);
    const info = await stat(absolute);
    const { width: thumbWidth, height: thumbHeight } = await readSize(join(packDirectory, "thumbs", `${id}.jpg`)).catch(
      () => ({ width: 0, height: 0 }),
    );
    if (!thumbWidth) warnings.push(`missing thumbnail for ${id}`);
    const colours = palette[id] ?? {};
    wallpapers.push({
      id,
      title: titles[id] ?? file.replace(/\.[^.]+$/, ""),
      window: set.window,
      file: `${set.directory}/${file}`,
      thumb: `wallpapers/thumbs/${id}.jpg`,
      width,
      height,
      thumbWidth,
      thumbHeight,
      bytes: info.size,
      aspect: Number((width / height).toFixed(3)),
      span: spanFor(width),
      dominant: colours.dominant ?? "#1f1f1f",
      accent: colours.accent ?? "#0078d7",
    });
  }
}

const manifest = {
  name: "8.css Windows wallpaper pack",
  description:
    "Windows 8 and Windows 8.1 RTM wallpapers used by the 8.css demo site. Demo assets only: not published to npm and not covered by the project MIT license.",
  license: "Microsoft wallpapers, redistributed for demonstration only. See styles/images/wallpapers/NOTICE.md.",
  counts: {
    total: wallpapers.length,
    "windows-8": wallpapers.filter((wallpaper) => wallpaper.window === "Windows 8").length,
    "windows-8.1": wallpapers.filter((wallpaper) => wallpaper.window === "Windows 8.1").length,
  },
  wallpapers,
};

await writeFile(join(packDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

/**
 * Optional stylesheet: one class per wallpaper so a Start Screen (or any
 * element) can borrow the image and its matching accent colour without
 * copying URLs around.
 */
const rules = wallpapers
  .map((wallpaper) => {
    const url = `url("../${wallpaper.file}")`;
    return [
      `.w8-wallpaper-${wallpaper.id} {`,
      `  --w8-start-image: ${url};`,
      `  --w8-start-background: ${wallpaper.dominant};`,
      `  --w8-accent: ${wallpaper.accent};`,
      `}`,
    ].join("\n");
  })
  .join("\n");

const stylesheet = `/*!
 * 8.css Windows wallpaper pack (generated by scripts/wallpapers.mjs)
 * Windows 8 and Windows 8.1 RTM wallpapers for the demo site.
 * Microsoft artwork: demonstration use only, not covered by the MIT license.
 * See https://github.com/flessan/8.css/blob/master/styles/images/wallpapers/NOTICE.md
 */
${rules}
.w8-wallpaper-cover { background-color: var(--w8-start-background, #1f1f1f); background-image: var(--w8-start-image, none); background-position: center; background-repeat: no-repeat; background-size: cover; }
`;

await writeFile(join(packDirectory, "wallpapers.css"), stylesheet);

// Root relative variants live in dist/ so the pack keeps working when the CSS
// is imported from a bundler instead of linked from the demo site.
const thumbsDirectory = fileURLToPath(new URL("../dist/wallpapers/", import.meta.url));
await mkdir(thumbsDirectory, { recursive: true });
for (const wallpaper of wallpapers) {
  const source = join(packDirectory, "thumbs", `${wallpaper.id}.jpg`);
  const destination = existsSync(source) ? join(thumbsDirectory, `${wallpaper.id}.jpg`) : null;
  if (!destination) {
    warnings.push(`missing thumbnail for ${wallpaper.id}`);
    continue;
  }
  await copyFile(source, destination);
}

const distRules = wallpapers
  .map((wallpaper) => {
    const url = `url("/wallpapers/${wallpaper.id}.jpg")`;
    return [
      `.w8-wallpaper-${wallpaper.id} {`,
      `  --w8-start-image: ${url};`,
      `  --w8-start-background: ${wallpaper.dominant};`,
      `  --w8-accent: ${wallpaper.accent};`,
      `}`,
    ].join("\n");
  })
  .join("\n");

await writeFile(
  join(thumbsDirectory, "wallpapers.css"),
  `/*!
 * 8.css wallpaper thumbnail pack (generated by scripts/wallpapers.mjs)
 * Root relative thumbnails for consumers: 480 x 300 JPEGs in this folder.
 * Windows 8 / 8.1 artwork: demonstration use only, see THIRD-PARTY-NOTICES.md.
 */
${distRules}
.w8-wallpaper-cover { background-color: var(--w8-start-background, #1f1f1f); background-image: var(--w8-start-image, none); background-position: center; background-repeat: no-repeat; background-size: cover; }
`,
);

await writeFile(
  join(thumbsDirectory, "manifest.json"),
  `${JSON.stringify(
    {
      ...manifest,
      base: "/wallpapers/",
      note: "Thumbnail-only variant for npm consumers. The full resolution wallpapers stay in styles/images/ and are not published.",
      wallpapers: wallpapers.map((wallpaper) => ({
        ...wallpaper,
        file: `/wallpapers/${wallpaper.id}.jpg`,
        thumb: `/wallpapers/${wallpaper.id}.jpg`,
      })),
    },
    null,
    2,
  )}\n`,
);

for (const warning of warnings) console.warn(`wallpapers: ${warning}`);
console.log(
  `Indexed ${wallpapers.length} wallpapers (Windows 8: ${manifest.counts["windows-8"]}, ` +
    `Windows 8.1: ${manifest.counts["windows-8.1"]}) into styles/images/wallpapers/.`,
);
