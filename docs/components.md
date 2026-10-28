# Component and icon reference

The [interactive catalog](index.html) includes live previews, a 78-icon gallery drawn from Font Awesome 4.7.0, and copyable snippets. Public component classes use the `w8-` prefix.

## CSS modules
- `gui/base.css`: design tokens, scoped typography, and focus styles.
- `gui/tiles.css`: Start Screen canvas and tiles.
- `gui/buttons.css`: button states and variants.
- `gui/forms.css`: input, select, textarea, checkbox, radio, and toggle styling.
- `gui/feedback.css`: progress, tabs, badges, notices, and dividers.
- `gui/window.css`: desktop window and title bar.
- `gui/app-bar.css`: action bar.
- `gui/dialog.css`: native dialog styling.
- `gui/icons.css`: Font Awesome sizing hooks, square icon buttons, and visually-hidden labels.
- `gui/responsive.css`: narrow viewport and reduced-motion rules.

## Public classes
- Start Screen: `w8-start-screen`, `w8-start-heading`, `w8-start-subtitle`, `w8-tiles`.
- Tiles: `w8-tile`, `w8-tile__symbol`, `w8-tile__label`, `w8-tile__meta`, `w8-tile__count`; size modifiers `w8-tile--wide`, `w8-tile--tall`, `w8-tile--large`; colors `w8-tile--blue`, `w8-tile--cyan`, `w8-tile--purple`, `w8-tile--magenta`, `w8-tile--green`, `w8-tile--orange`, `w8-tile--red`, `w8-tile--dark`.
- Buttons: `w8-button`, `w8-button--primary`, `w8-button--subtle`.
- Fields: `w8-input`, `w8-select`, `w8-textarea`, `w8-field`, `w8-label`, `w8-help`.
- Choices: `w8-check`, `w8-radio`, `w8-choice`, `w8-toggle`, `w8-toggle__input`.
- Feedback: `w8-progress`, `w8-badge`, `w8-notice` variants, `w8-divider`.
- Tabs: `w8-tabs`, `w8-tab`.
- Desktop: `w8-window`, `w8-title-bar`, `w8-title-bar__text`, `w8-title-bar__controls`, `w8-window-control`, `w8-window-control--close`, `w8-window-body`, `w8-window-footer`.
- Actions and dialogs: `w8-app-bar`, `w8-app-bar__item`, `w8-dialog`, `w8-dialog__body`, `w8-dialog__footer`.
- Icons: `w8-icon`, `w8-icon--small`, `w8-icon--large`, `w8-icon--xl`, `w8-icon-button`, `w8-icon-button--accent`, `w8-icon-button__label`, `w8-sr-only`.

## Font Awesome 4.7.0 icons

`dist/8.css` bundles the Font Awesome 4.7.0 stylesheet, so the classic classes work from one import. The font files are published separately in `dist/font-awesome/fonts/`, and the unmodified upstream stylesheet is published in `dist/font-awesome/css/`.

```html
<i class="fa fa-envelope" aria-hidden="true"></i>
<i class="fa fa-star fa-2x" aria-hidden="true"></i>
<i class="fa fa-search w8-icon--large" aria-hidden="true"></i>

<button class="w8-icon-button" type="button" aria-label="Search">
  <i class="fa fa-search w8-icon--large" aria-hidden="true"></i>
  <span class="w8-icon-button__label">Search</span>
</button>
```

- `fa` is the Font Awesome base class; `fa-{name}` selects a glyph.
- `fa-lg`, `fa-2x`, `fa-3x`, `fa-4x`, `fa-5x`, `fa-fw`, `fa-ul`, `fa-li`, `fa-stack`, `fa-spin`, and `fa-rotate-*` behave exactly as in Font Awesome 4.7.0.
- `w8-icon` is an alias for the `fa` base class, kept for the existing 8.css API.
- `w8-icon--small` (1rem), `w8-icon--large` (2rem), and `w8-icon--xl` (3rem) provide the 8.css size steps and work with `.fa` or `.w8-icon`.
- Icons inherit `currentColor`. Use `aria-hidden="true"` for decorative glyphs and `aria-label` or visible text for meaningful ones.
- Window controls use `fa-window-minimize`, `fa-window-maximize`, and `fa-window-close`.

The SVG sprite (`icons.svg` and the `w8-icon-{name}` IDs) was removed in favour of Font Awesome 4.7.0. See [THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md) for licensing.

## Modular package imports
Load `dist/gui/base.css` first, then the modules required by your markup. Load `dist/gui/icons.css` for the 8.css icon helpers, and load `dist/font-awesome/css/font-awesome.min.css` for the glyphs themselves. The complete `dist/8.css` bundle combines the Font Awesome stylesheet and every CSS module, but the font files stay separate so they can be cached independently.
