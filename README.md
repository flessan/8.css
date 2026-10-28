# 8.css

**A CSS-only Windows 8 Modern UI library, with a custom Metro-style SVG icon set.**

8.css brings the flat, colorful Start Screen and Windows 8 desktop language to semantic HTML: tiles, controls, app bars, windows, dialogs, and a reusable 50-icon vector sprite. It works with plain HTML and JavaScript frameworks without requiring a JavaScript runtime.

## What is included

- Start Screen tiles with solid Windows 8-inspired colors and responsive size modifiers.
- Buttons, text fields, choices, toggles, progress indicators, notices, tabs, app bars, windows, and dialog styling.
- 50 lightweight SVG symbols inspired by the simple geometry of Windows 8 Modern UI.
- An icon CSS module with sizing utilities, square app-bar buttons, and accessible visually-hidden labels.
- Interactive documentation, copyable HTML snippets, and modular stylesheets.

The icons are original redrawings made for this project, not extracted Microsoft artwork. 8.css is an independent community project and is not an official Microsoft product.

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

npm is the default registry, so the standard install command above does not require additional registry configuration.

## GitHub Packages

Each published GitHub Release triggers the release workflow. It validates that the release tag matches `package.json`, builds and tests 8.css once, creates one package tarball, and publishes that same tarball to npm and GitHub Packages. If one registry already has that version, the workflow skips that publish step so a failed partial release can be retried safely.

To use the GitHub Packages copy, add the following to the consuming project's `.npmrc`:

```ini
@flessan:registry=https://npm.pkg.github.com
```

GitHub Packages requires authentication for npm clients. Use a GitHub Personal Access Token (classic) with `read:packages` permission for installation, and keep the token in your user-level `~/.npmrc` or another secret-managed configuration rather than committing it to a repository.

A package's first GitHub Packages publication is private by default. After the first successful publication, open the package's settings on GitHub and change its visibility to **Public** if you intend it to be publicly reusable. Until then, access is restricted.

## Use the icon sprite

The vector sprite is published separately at `dist/icons.svg`. Reference an icon symbol with an SVG `use` element:

```html
<svg class="w8-icon w8-icon--large" role="img" aria-label="Mail">
  <use href="https://unpkg.com/@flessan/8.css@0.2.0/dist/icons.svg#w8-icon-mail"></use>
</svg>
```

For decorative icons, use `aria-hidden="true"`. For icon-only controls, add an accessible label to the button itself:

```html
<button class="w8-icon-button" type="button" aria-label="Search">
  <svg class="w8-icon w8-icon--large" aria-hidden="true">
    <use href="https://unpkg.com/@flessan/8.css@0.2.0/dist/icons.svg#w8-icon-search"></use>
  </svg>
  <span class="w8-icon-button__label">Search</span>
</button>
```

Available symbols: `w8-icon-home`, `w8-icon-mail`, `w8-icon-calendar`, `w8-icon-photos`, `w8-icon-desktop`, `w8-icon-weather`, `w8-icon-search`, `w8-icon-settings`, `w8-icon-share`, `w8-icon-user`, `w8-icon-people`, `w8-icon-phone`, `w8-icon-chat`, `w8-icon-globe`, `w8-icon-wifi`, `w8-icon-bluetooth`, `w8-icon-battery`, `w8-icon-power`, `w8-icon-lock`, `w8-icon-folder`, `w8-icon-file`, `w8-icon-download`, `w8-icon-upload`, `w8-icon-refresh`, `w8-icon-edit`, `w8-icon-delete`, `w8-icon-check`, `w8-icon-close`, `w8-icon-back`, `w8-icon-forward`, `w8-icon-play`, `w8-icon-pause`, `w8-icon-stop`, `w8-icon-volume`, `w8-icon-menu`, `w8-icon-camera`, `w8-icon-music`, `w8-icon-video`, `w8-icon-info`, `w8-icon-help`, `w8-icon-heart`, `w8-icon-pin`, `w8-icon-map`, `w8-icon-print`, `w8-icon-copy`, `w8-icon-save`, `w8-icon-star`, `w8-icon-clock`, `w8-icon-notifications`, `w8-icon-cloud`.

See the [interactive documentation](docs/index.html) for the complete visual catalog and copyable examples.

## Modules and customization

The full stylesheet is `dist/8.css`. For a smaller bundle, load `base.css` first, then the modules required by your markup. Load `icons.css` when using icon sizing or icon-button helpers; `icons.svg` supplies the actual vector symbols.

```js
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
- `icons/icons.svg`: source icon sprite.
- `src/8.css`: generated combined stylesheet.
- `dist/8.css`, `dist/gui/`, `dist/icons.svg`: consumer distribution.
- `docs/index.html`, `docs/8.css`, `docs/icons.svg`: documentation site.

Do not hand-edit generated CSS or sprite copies; update the source and rebuild. The checks validate module parity, CSS structure, distribution files, and expected icon IDs.

## Accessibility boundary

This package supplies styling and vector icons only. It does not implement tab navigation, toggle state, live tiles, or window controls. Use semantic controls, accessible names, visible focus indicators, sufficient contrast, and reduced-motion support. Icons inherit `currentColor` so they adapt to the foreground color of a tile, toolbar, or button.

## License

MIT. See [LICENSE](LICENSE). The license and attribution for the original Windows-8-Metro-UI prototype remain preserved.
