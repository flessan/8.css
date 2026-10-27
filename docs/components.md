# Component and icon reference

The [interactive catalog](index.html) includes live previews, a 50-symbol icon gallery, and copyable snippets. Public component classes use the `w8-` prefix.

## CSS modules
- `gui/base.css`: design tokens, scoped typography, and focus styles.
- `gui/tiles.css`: Start Screen canvas and tiles.
- `gui/buttons.css`: button states and variants.
- `gui/forms.css`: input, select, textarea, checkbox, radio, and toggle styling.
- `gui/feedback.css`: progress, tabs, badges, notices, and dividers.
- `gui/window.css`: desktop window and title bar.
- `gui/app-bar.css`: action bar.
- `gui/dialog.css`: native dialog styling.
- `gui/icons.css`: SVG sizing utilities, square icon buttons, and visually-hidden labels.
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

## SVG icon sprite

The source sprite is `icons/icons.svg`; the distributed file is `dist/icons.svg`. Symbol IDs follow the format `w8-icon-{name}`:

- `home`
- `mail`
- `calendar`
- `photos`
- `desktop`
- `weather`
- `search`
- `settings`
- `share`
- `user`
- `people`
- `phone`
- `chat`
- `globe`
- `wifi`
- `bluetooth`
- `battery`
- `power`
- `lock`
- `folder`
- `file`
- `download`
- `upload`
- `refresh`
- `edit`
- `delete`
- `check`
- `close`
- `back`
- `forward`
- `play`
- `pause`
- `stop`
- `volume`
- `menu`
- `camera`
- `music`
- `video`
- `info`
- `help`
- `heart`
- `pin`
- `map`
- `print`
- `copy`
- `save`
- `star`
- `clock`
- `notifications`
- `cloud`

Example:

```html
<svg class="w8-icon w8-icon--large" role="img" aria-label="Mail">
  <use href="https://unpkg.com/@flessan/8.css@0.2.0/dist/icons.svg#w8-icon-mail"></use>
</svg>
```

For an icon-only action, label the button and mark its nested SVG as decorative with `aria-hidden="true"`. The SVG sprite is a separate asset, so the `href` must point to the deployed file.

## Modular package imports
Load `dist/gui/base.css` first, then the modules required by your markup. Load `dist/gui/icons.css` when using icon utility classes. The complete `dist/8.css` bundle combines every CSS module, but the SVG sprite stays separate.
