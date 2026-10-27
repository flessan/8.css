# Installation

## npm

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

## Optional: GitHub Packages

The package is also available through GitHub Packages. To resolve the `@flessan` scope through that registry, add the following to the project's `.npmrc`:

```ini
@flessan:registry=https://npm.pkg.github.com
```

GitHub Packages may require authentication depending on package visibility and account access. npm remains the default registry declared by the package.

## Icons

The stylesheet and icon sprite are separate files. Make `dist/icons.svg` accessible from your website and reference a symbol ID:

```html
<svg class="w8-icon w8-icon--large" role="img" aria-label="Settings">
  <use href="./icons.svg#w8-icon-settings"></use>
</svg>
```

Load `gui/base.css` before modular styles and load `gui/icons.css` when using icon helpers. The full `dist/8.css` bundle already includes the helper styles.
