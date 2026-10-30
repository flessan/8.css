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
  <i class="fa fa-home w8-icon--large" aria-hidden="true"></i>
  <span class="w8-icon-button__label">Home</span>
</button>
```

## Wallpapers and accent

The Start Screen paints an optional background image behind the tiles:

```css
.my-start {
  --w8-start-image: url("../styles/images/Windows8RTM/img3.jpg");
  --w8-start-background: #4d96b0; /* fallback colour while the image loads */
  --w8-accent: #0078d7;
}
```

`styles/images/wallpapers/wallpapers.css` provides one `.w8-wallpaper-<id>` class per wallpaper in the [pack](../examples/wallpapers.html); each sets the image, its dominant colour and a matching accent. Add `.w8-wallpaper-cover` to apply the same artwork as a cover background on any element. Because the artwork is decorative, keep text contrast in mind and prefer the dominant colour for any surface that must stay readable.

## Shell surfaces

The lock screen, taskbar and layouts expose their own properties so a page can skin them without touching the module:

```css
.my-lock {
  --w8-lock-image: url("../styles/images/Windows8.1RTMWallpapers/img13.jpg");
  --w8-lock-background: #0b3b60; /* fallback while the image loads */
}

.my-desktop {
  --w8-chrome: #1c1c1c;      /* taskbar surface */
  --w8-chrome-hover: #333;   /* taskbar hover */
  --w8-toast-background: #202020;
}

.my-battery { --w8-battery-level: 62%; }        /* fill of .w8-battery__level */
.my-split   { --w8-split-size: 20rem; }          /* snapped pane width */
.my-hub     { --w8-hub-section: 20rem; }         /* hub column width */
```

Live tiles animate on their own: `.w8-tile--live` flips every ten seconds and stops when the visitor asks for reduced motion. Badge text is yours to write; the component only positions it.

## Icon sizes

Font Awesome 4.7.0 utilities are available unchanged, and 8.css adds three size hooks so icons match its component scale:

```html
<i class="fa fa-check fa-lg" aria-hidden="true"></i>
<i class="fa fa-check w8-icon--small" aria-hidden="true"></i>
<i class="fa fa-check w8-icon--large" aria-hidden="true"></i>
<i class="fa fa-check w8-icon--xl" aria-hidden="true"></i>
```

Change the icon color by setting `color` on the icon or on a parent element; no separate icon color property is required. To swap the whole palette, override the `--w8-` custom properties instead of individual component rules.

Load `base.css` before modular component styles. Load `icons.css` when using the 8.css icon hooks, and load `dist/font-awesome/css/font-awesome.min.css` when you are not using the complete bundle.

See [Accessibility](accessibility.md) for focus, semantic HTML, and reduced-motion guidance.
