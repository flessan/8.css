# 8.css

**A CSS-only Windows 8 Modern UI library with the complete Font Awesome 4.7.0 icon set.**

8.css brings the flat, colorful Start Screen and Windows 8 desktop language to semantic HTML: tiles, controls, app bars, windows, dialogs, and a self-hosted icon font. It works with plain HTML and JavaScript frameworks without requiring a JavaScript runtime.

## What is included

- Start Screen tiles with solid Windows 8-inspired colors and responsive size modifiers, laid out as the horizontally panned Windows 8 grid or as a reflowing Windows 10 grid.
- Buttons, text fields, choices, toggles, sliders, ratings, search boxes, progress indicators and rings, notices, tabs, navigation bars, list and flip views, app bars, the Charms bar, windows, and dialog styling.
- Windows 8 touch shell: a horizontally panned Start screen, edge panels, the app switcher, a snap preview, a gesture coach, and 44px touch targets.
- Font Awesome 4.7.0, bundled unmodified and served from your own site instead of a third-party CDN.
- A Windows 8 / 8.1 wallpaper pack with a Personalize preview, curated titles, dominant and accent colours, and optional per-wallpaper CSS classes.
- Start screen customize mode with tile selection and the contextual app bar.
- A lock screen with sign-in panel and battery indicator, live tiles with badges and flips, a taskbar with tray and clock, flyouts, toasts, hubs and snapped split views.
- Icon helpers with sizing hooks, square app-bar buttons, and accessible visually-hidden labels.
- Interactive documentation, copyable HTML snippets, a one-page component gallery, and modular stylesheets.

The icon font is Font Awesome 4.7.0 by Dave Gandy. 8.css is an independent community project and is not an official Microsoft product.

## Install from npm

```sh
npm install @flessan/8.css
```

Import the complete stylesheet:

```js
import "@flessan/8.css";
```

For plain HTML, use the CDN bundle:

```html
<link rel="stylesheet" href="https://unpkg.com/@flessan/8.css@0.2.0/dist/8.css">
```

`dist/8.css` already contains the Font Awesome 4.7.0 stylesheet and points at the bundled font files in `dist/font-awesome/fonts/`. Because the `@font-face` URL is relative to the stylesheet, icons work whether the CSS is imported by a bundler or linked from a page. No icon CDN request is made.

npm is the default registry, so the standard install command above does not require additional registry configuration.

## Icons

Use the classic Font Awesome 4.7.0 classes next to the `fa` base class:

```html
<i class="fa fa-envelope" aria-hidden="true"></i>
<button class="w8-button w8-button--primary" type="button">
  <i class="fa fa-check" aria-hidden="true"></i>
  Save changes
</button>
```

Font Awesome's own size and utility classes are available (`fa-lg`, `fa-2x`, `fa-3x`, `fa-fw`, `fa-spin`), and 8.css adds `w8-icon--small`, `w8-icon--large`, and `w8-icon--xl` so icons line up with the component scale:

```html
<i class="fa fa-search w8-icon--large" aria-hidden="true"></i>
```

The `w8-icon` class is an alias for Font Awesome's `.fa` base class, so `<i class="w8-icon fa fa-home">` also works. The size hooks work with either base class.

Icon-only controls need an accessible name on the control itself, and the nested glyph should be hidden from assistive technology:

```html
<button class="w8-icon-button" type="button" aria-label="Search">
  <i class="fa fa-search w8-icon--large" aria-hidden="true"></i>
  <span class="w8-icon-button__label">Search</span>
</button>
```

To use the icon font with the modular stylesheets, load `dist/font-awesome/css/font-awesome.min.css` yourself:

```html
<link rel="stylesheet" href="https://unpkg.com/@flessan/8.css@0.2.0/dist/font-awesome/css/font-awesome.min.css">
```

Icons inherit `currentColor`, so they adapt to the foreground color of a tile, toolbar, or button. The full glyph list is documented at [fontawesome.io](https://fontawesome.com/v4.7.0/icons/) and in the [icon catalog](docs/index.html#icons). The [interactive documentation](docs/index.html) shows every component with rendered previews, copyable markup, and the icon gallery.

### Migrating from the 0.2.0 SVG sprite

The bespoke 50-symbol SVG sprite was replaced by Font Awesome 4.7.0. Replace sprite markup with the equivalent class:

```html
<!-- before: dist/icons.svg sprite -->
<svg class="w8-icon w8-icon--large" aria-hidden="true"><use href="./icons.svg#w8-icon-mail"></use></svg>

<!-- now: Font Awesome 4.7.0 -->
<i class="fa fa-envelope w8-icon--large" aria-hidden="true"></i>
```

`dist/icons.svg` and the `w8-icon-{name}` symbol IDs are no longer published. The `w8-icon`, `w8-icon--small`, `w8-icon--large`, `w8-icon--xl`, `w8-icon-button`, `w8-icon-button--accent`, `w8-icon-button__label`, and `w8-sr-only` classes remain supported.

## GitHub Packages

Each published GitHub Release triggers the release workflow. It validates that the release tag matches `package.json`, builds and tests 8.css once, creates one package tarball, and publishes that same tarball to npm and GitHub Packages. If one registry already has that version, the workflow skips that publish step so a failed partial release can be retried safely.

To use the GitHub Packages copy, add the following to the consuming project's `.npmrc`:

```ini
@flessan:registry=https://npm.pkg.github.com
```

GitHub Packages requires authentication for npm clients. Use a GitHub Personal Access Token (classic) with `read:packages` permission for installation, and keep the token in your user-level `~/.npmrc` or another secret-managed configuration rather than committing it to a repository.

A package's first GitHub Packages publication is private by default. After the first successful publication, open the package's settings on GitHub and change its visibility to **Public** if you intend it to be publicly reusable. Until then, access is restricted.

## Wallpaper pack

`styles/images/` ships the Windows 8 and Windows 8.1 RTM wallpapers used by the demo site. A generated manifest describes each one, and the Start Screen reads the artwork through two custom properties:

```html
<section class="w8-start-screen" style="
  --w8-start-image: url('styles/images/Windows8RTM/img3.jpg');
  --w8-start-background: #4d96b0;
  --w8-accent: #0078d7;
">
  <div class="w8-tiles">…</div>
</section>
```

`styles/images/wallpapers/wallpapers.css` is optional and adds one `.w8-wallpaper-<id>` class per wallpaper that sets all three properties, plus `.w8-wallpaper-cover` for a plain cover-fitted background on any element:

```html
<link rel="stylesheet" href="https://unpkg.com/@flessan/8.css@0.2.0/dist/wallpapers/wallpapers.css">
<section class="w8-start-screen w8-wallpaper-win8-img3">…</section>
```

| Path | Contents |
| --- | --- |
| `styles/images/Windows8RTM/` | 19 Windows 8 RTM wallpapers (1920×1200, two 3840×1200 panoramas) |
| `styles/images/Windows8.1RTMWallpapers/` | 9 Windows 8.1 RTM wallpapers |
| `styles/images/wallpapers/manifest.json` | Titles, dimensions, byte sizes, aspect ratios, monitor span, dominant and accent colours |
| `styles/images/wallpapers/thumbs/` | 480×300 thumbnails used by the gallery |
| `styles/images/wallpapers/wallpapers.css` | Optional per-wallpaper classes for the demo paths |
| `dist/wallpapers/` | Published thumbnail pack with root-relative classes and a consumer manifest |

Regenerate everything with `npm run build` (which runs `scripts/wallpapers.mjs`), or just the dependency-free index with `node scripts/wallpapers.mjs`.

**Licensing:** the wallpaper artwork is © Microsoft and is included for demonstration only. It is **not** covered by the MIT license and the full resolution files are **not** published to npm — only the thumbnails in `dist/wallpapers/` are. See [the wallpaper notice](styles/images/wallpapers/NOTICE.md).

## Charms bar

The Windows 8 edge menu is available as a vertical bar of icon-and-label buttons plus a flyout pane:

```html
<nav class="w8-charms w8-charms--right" aria-label="Charms">
  <button class="w8-charm" type="button">
    <i class="fa fa-search w8-charm__icon" aria-hidden="true"></i>
    <span class="w8-charm__label">Search</span>
  </button>
  <button class="w8-charm" type="button" aria-expanded="false" aria-controls="settings-pane">
    <i class="fa fa-cog w8-charm__icon" aria-hidden="true"></i>
    <span class="w8-charm__label">Settings</span>
  </button>
</nav>
<div class="w8-charm-pane" id="settings-pane" hidden>
  <h3 class="w8-charm-pane__title">Settings</h3>
  <div class="w8-charm-pane__group">
    <button class="w8-charm-pane__item" type="button"><i class="fa fa-wifi" aria-hidden="true"></i>Network</button>
  </div>
</div>
```

`aria-expanded="true"` (or `aria-pressed="true"`) fills the active charm with `--w8-accent`. `w8-charms--right` pins the bar to the right edge of a positioned parent and `w8-charms--fixed` keeps it on screen; opening and closing the pane stays your call, as the library ships no JavaScript.

## Touch and gestures

Windows 8 was designed for touch, so the library ships the surfaces its edge gestures reveal:

```html
<div class="w8-start-screen" style="--w8-tile-size: 6.75rem; --w8-start-rows: 3">
  <div class="w8-start-screen__pan">
    <div class="w8-tile-groups w8-tile-groups--columns">
      <div class="w8-tile-group">
        <span class="w8-tile-group__label">Everyday</span>
        <div class="w8-tiles"><a class="w8-tile w8-tile--blue" href="#mail">…</a></div>
      </div>
    </div>
  </div>
</div>

<aside class="w8-edge-panel w8-edge-panel--left w8-switcher is-open">…</aside>
<div class="w8-snap-preview"><span class="w8-snap-preview__label">News</span></div>
```

- `w8-start-screen__pan` plus `w8-tile-groups--columns` lay tiles out top to bottom in a column, then start the next column and pan the screen sideways, the way Windows 8 behaves. Tune it with `--w8-tile-size` and `--w8-start-rows`.
- `w8-edge-panel` (`--left`, `--right`, `--top`, `--bottom`, `is-open`) slides a surface in from an edge; `w8-switcher` is the app switcher, and `w8-snap-preview` is the snapped pane.
- `w8-gesture-hint` and `w8-touch-tutorial` are the coaching surfaces Windows 8 showed on tablets; `w8-edge` with `w8-edge__grip` marks the edges and never blocks clicks.
- `w8-taskbar--rtm` hides the Start button because Windows 8 RTM did not have one; `w8-start-hotspot` is the bottom-left corner that revealed Start instead.
- `w8-touch-target`, `w8-pan-x`/`w8-pan-y`/`w8-pan-none`, `w8-no-select` and `w8-grab` are the touch utilities. Charms, taskbar apps and icon buttons grow to 44px on coarse pointers, or under a `w8-touch` ancestor.

The library is still CSS-only: CSS cannot detect a swipe. [examples/gestures.js](examples/gestures.js) is 200 lines of Pointer Events that wire the right edge to Charms, the left edge to the switcher and snapping, the top and bottom edges to the app bar, and press-and-hold to tile selection.

## Modules and customization

The full stylesheet is `dist/8.css`. For a smaller bundle, load `base.css` first, then the modules required by your markup, plus the standalone Font Awesome stylesheet when you use icons. Desktop chrome lives in `window.css`, `taskbar.css`, `app-bar.css`, `charms.css`, `flyout.css`, `toast.css`, and `dialog.css`; the lock screen and app layouts live in `lock-screen.css`, `hub.css`, and `split-view.css`, live tile extras and the horizontal Start layout in `live-tiles.css`, and the touch surfaces in `gestures.css`.

```js
import "@flessan/8.css/dist/font-awesome/css/font-awesome.min.css";
import "@flessan/8.css/dist/gui/base.css";
import "@flessan/8.css/dist/gui/buttons.css";
import "@flessan/8.css/dist/gui/icons.css";
```

## Development

Requires Node.js 20 or newer.

```sh
npm run build
npm test
npm run build:site
npm run test:browser   # optional, needs a local Chromium
```

`npm test` is a dependency-free contract suite over the CSS, asset and package layout. `npm run test:browser` is an optional smoke test that drives a real Chromium over the DevTools protocol using only Node built-ins: it verifies that the icon font actually paints, that pages load with no failed requests, that the layout has no horizontal overflow at 1280px and 390px, and that the mobile menu, copy buttons, code snippets, skip link and reduced-motion rules behave. Point it at a browser with `CHROMIUM_PATH=/path/to/chrome` and add `SCREENSHOT_DIR=./screenshots` to keep captures. It skips cleanly when no browser is available.

Browsers without a `Segoe UI` installation fall back to `Segoe UI Variable`, `Helvetica Neue`, then `Arial`. Set the `--w8-font-family` custom property if you ship a Segoe UI-compatible webfont.

Source of truth:
- `gui/`: maintained CSS modules.
- `vendor/font-awesome/`: unmodified Font Awesome 4.7.0 package files plus its license text.
- `styles/images/wallpapers/`: generated wallpaper manifest, thumbnails, palette and optional classes.
- `src/8.css`: generated combined stylesheet (font stylesheet + modules).
- `dist/8.css`, `dist/gui/`, `dist/font-awesome/`: consumer distribution.
- `docs/index.html`, `docs/8.css`, `docs/font-awesome/`: documentation site.

Do not hand-edit generated CSS, font copies or the wallpaper manifest; update the source and rebuild. The checks validate module parity, CSS structure, distribution files, font and license asset parity, glyph coverage for every icon used in the docs and examples, accessible icon markup, and package contents.

## Accessibility boundary

This package supplies styling and an icon font only. It does not implement tab navigation, toggle state, live tiles, or window controls. Use semantic controls, accessible names, visible focus indicators, sufficient contrast, and reduced-motion support. Decorative icons should carry `aria-hidden="true"`; icon-only controls need an `aria-label` or visible text.

## License

MIT for 8.css itself. See [LICENSE](LICENSE). The license and attribution for the original Windows-8-Metro-UI prototype remain preserved.

Font Awesome 4.7.0 is bundled unmodified: the font files are licensed under the SIL OFL 1.1 and the stylesheets under the MIT License. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for the full text and attribution.

The Windows 8 and 8.1 wallpapers are Microsoft artwork, included with the demo site for demonstration only and excluded from the published package. See [styles/images/wallpapers/NOTICE.md](styles/images/wallpapers/NOTICE.md).
