# 8.css

**A CSS-only Windows 8 Modern UI library with the complete Font Awesome 4.7.0 icon set.**

8.css brings the flat, colorful Start Screen and Windows 8 desktop language to semantic HTML: tiles, controls, app bars, windows, dialogs, and a self-hosted icon font. It works with plain HTML and JavaScript frameworks without requiring a JavaScript runtime.

## What is included

- Start Screen tiles with solid Windows 8-inspired colors and responsive size modifiers.
- Buttons, text fields, choices, toggles, progress indicators, notices, tabs, app bars, windows, and dialog styling.
- Font Awesome 4.7.0, bundled unmodified and served from your own site instead of a third-party CDN.
- Icon helpers with sizing hooks, square app-bar buttons, and accessible visually-hidden labels.
- Interactive documentation, copyable HTML snippets, and modular stylesheets.

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

## Modules and customization

The full stylesheet is `dist/8.css`. For a smaller bundle, load `base.css` first, then the modules required by your markup, plus the standalone Font Awesome stylesheet when you use icons.

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
```

Source of truth:
- `gui/`: maintained CSS modules.
- `vendor/font-awesome/`: unmodified Font Awesome 4.7.0 package files plus its license text.
- `src/8.css`: generated combined stylesheet (font stylesheet + modules).
- `dist/8.css`, `dist/gui/`, `dist/font-awesome/`: consumer distribution.
- `docs/index.html`, `docs/8.css`, `docs/font-awesome/`: documentation site.

Do not hand-edit generated CSS or font copies; update the source and rebuild. The checks validate module parity, CSS structure, distribution files, font and license asset parity, glyph coverage for every icon used in the docs and examples, accessible icon markup, and package contents.

## Accessibility boundary

This package supplies styling and an icon font only. It does not implement tab navigation, toggle state, live tiles, or window controls. Use semantic controls, accessible names, visible focus indicators, sufficient contrast, and reduced-motion support. Decorative icons should carry `aria-hidden="true"`; icon-only controls need an `aria-label` or visible text.

## License

MIT for 8.css itself. See [LICENSE](LICENSE). The license and attribution for the original Windows-8-Metro-UI prototype remain preserved.

Font Awesome 4.7.0 is bundled unmodified: the font files are licensed under the SIL OFL 1.1 and the stylesheets under the MIT License. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for the full text and attribution.
