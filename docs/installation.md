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

Font Awesome 4.7.0 is bundled with the package. `dist/8.css` contains its stylesheet, and the font files are copied to `dist/font-awesome/fonts/`, next to the bundle, so a single import is enough:

```html
<link rel="stylesheet" href="https://unpkg.com/@flessan/8.css@0.2.0/dist/8.css">

<!-- Use the classic Font Awesome 4.7.0 classes -->
<i class="fa fa-cog" aria-hidden="true"></i>
```

With the modular stylesheets, load the icon font stylesheet yourself and keep the font directory next to it:

```html
<link rel="stylesheet" href="./node_modules/@flessan/8.css/dist/font-awesome/css/font-awesome.min.css">
<link rel="stylesheet" href="./node_modules/@flessan/8.css/dist/gui/base.css">
<link rel="stylesheet" href="./node_modules/@flessan/8.css/dist/gui/icons.css">
```

Load `gui/base.css` before modular component styles and load `gui/icons.css` when using the 8.css icon hooks. The full `dist/8.css` bundle already includes the Font Awesome stylesheet and the helper styles.

### Wallpapers

The wallpaper pack is demo material and is not installed with the package except for thumbnails in `dist/wallpapers/`. Copy the full resolution artwork from `styles/images/` if you want it locally, and read the license notice first:

```html
<link rel="stylesheet" href="https://unpkg.com/@flessan/8.css@0.2.0/dist/wallpapers/wallpapers.css">
<section class="w8-start-screen w8-wallpaper-win8-img3">…</section>
```

### Fonts

The library asks for `"Segoe UI"`, then `"Segoe UI Variable"`, `"Helvetica Neue"`, and `Arial`. Browsers without Segoe UI fall back to a neutral grotesk, so capture reference screenshots on Windows if the exact Segoe UI metrics matter. To ship your own text font, override the custom property:

```css
:root {
  --w8-font-family: "Segoe UI", "Selawik", "Helvetica Neue", Arial, sans-serif;
}
```

The bundled icon font keeps its upstream license. See [THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md).
