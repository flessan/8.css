# Documentation

The interactive component catalog lives in index.html. It uses a left-side tree navigation, live previews, expandable source snippets, and copy-code controls. Its information architecture is inspired by [7.css](https://github.com/khang-nd/7.css), while the content and component API are specific to 8.css.

- [Interactive documentation site](index.html)
- [Installation](installation.md)
- [Component and icon reference](components.md)
- [Customization](customization.md)
- [Accessibility](accessibility.md)
- [AI agent guide](ai-agents.md)

The site source is index.html, docs.css, script.js, the generated 8.css stylesheet, and the generated font-awesome/ folder that holds the self-hosted Font Awesome 4.7.0 stylesheet and font files. The GitHub Pages source is the master branch /docs folder, so keep 8.css and font-awesome/ committed and synchronized using npm run build. The site uses static HTML and CSS with small progressive-enhancement JavaScript.

The historical Start Screen prototype is preserved at [examples/legacy-start-screen.html](../examples/legacy-start-screen.html). It loads the original stylesheet in styles/main.css and the public Font Awesome stylesheet from dist/font-awesome/ instead of a CDN.
