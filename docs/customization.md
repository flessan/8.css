# Customization

8.css uses custom properties prefixed with `--w8-` so applications can override its colors without rewriting component markup.

```css
:root {
  --w8-accent: #0078d7;
  --w8-accent-hover: #006cc1;
  --w8-focus: #005a9e;
  --w8-tile-blue: #0078d7;
  --w8-tile-cyan: #0099bc;
  --w8-tile-purple: #744da9;
}
```

Use solid colors and crisp edges to preserve the Windows 8 visual language. Icons inherit `currentColor`, so they adapt to foreground color in a tile, toolbar, or icon button.

```html
<button class="w8-icon-button w8-icon-button--accent" type="button" aria-label="Home">
  <svg class="w8-icon w8-icon--large" aria-hidden="true">
    <use href="./icons.svg#w8-icon-home"></use>
  </svg>
  <span class="w8-icon-button__label">Home</span>
</button>
```

Load `base.css` before modular component styles. Load `icons.css` when using icon utilities, and make sure the SVG `use` URL points to the deployed `icons.svg` asset.

See [Accessibility](accessibility.md) for focus, semantic HTML, and reduced-motion guidance.
