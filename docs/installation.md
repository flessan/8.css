# Installation

## Planned npm installation

The public npm release has not been published yet. Once the package name is confirmed and the first release is published, install it from the npm registry:

    npm install 8.css

For a CSS-capable bundler:

    import "8.css/dist/8.css";

For plain HTML:

    <link rel="stylesheet" href="https://unpkg.com/8.css/dist/8.css" />

For production, pin an exact published version instead of using the latest tag. The CDN resolves the published npm package, not a GitHub branch.

## Modular CSS

The package includes separate stylesheets under dist/gui. Load the base file before any component stylesheet:

    import "8.css/dist/gui/base.css";
    import "8.css/dist/gui/tiles.css";
    import "8.css/dist/gui/buttons.css";
    import "8.css/dist/gui/responsive.css";

Available modules: base.css, tiles.css, buttons.css, forms.css, feedback.css, window.css, app-bar.css, dialog.css, and responsive.css. Include responsive.css when you want the library's narrow-screen and reduced-motion rules. Use dist/8.css when you prefer one stylesheet.

## Local development

Requires Node.js 20 or newer:

    git clone https://github.com/flessan/8.css.git
    cd 8.css
    npm run build
    npm test
    npm run build:site

Consumers do not need GitHub to install or use the package after its npm release. GitHub is the source repository and release automation location, not a runtime dependency.
