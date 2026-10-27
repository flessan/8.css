# Component reference

The interactive catalog at [docs/index.html](index.html) includes live previews and copyable HTML. Public classes use the w8- prefix.

## Source modules
- gui/base.css: design tokens, scoped typography, and focus style.
- gui/tiles.css: Start Screen canvas and tiles.
- gui/buttons.css: button states and variants.
- gui/forms.css: input, select, textarea, checkbox, radio, and toggle styling.
- gui/feedback.css: progress, tabs, badges, notices, and divider.
- gui/window.css: desktop window and title bar.
- gui/app-bar.css: action bar.
- gui/dialog.css: native dialog styling.
- gui/responsive.css: narrow viewport and reduced-motion rules.

## Public classes
- Start Screen: w8-start-screen, w8-start-heading, w8-start-subtitle, w8-tiles.
- Tiles: w8-tile, w8-tile__symbol, w8-tile__label, w8-tile__meta, w8-tile__count; size modifiers w8-tile--wide, w8-tile--tall, w8-tile--large; colors w8-tile--blue, w8-tile--cyan, w8-tile--purple, w8-tile--magenta, w8-tile--green, w8-tile--orange, w8-tile--red, w8-tile--dark.
- Buttons: w8-button, w8-button--primary, w8-button--subtle.
- Fields: w8-input, w8-select, w8-textarea, w8-field, w8-label, w8-help.
- Choices: w8-check, w8-radio, w8-choice, w8-toggle, w8-toggle__input.
- Feedback: w8-progress, w8-badge, w8-badge--blue, w8-notice variants, w8-divider.
- Tabs: w8-tabs, w8-tab.
- Desktop: w8-window, w8-title-bar, w8-title-bar__text, w8-title-bar__controls, w8-window-control, w8-window-control--close, w8-window-body, w8-window-footer.
- Actions and dialogs: w8-app-bar, w8-app-bar__item, w8-dialog, w8-dialog__body, w8-dialog__footer.

## Modular package imports
Load dist/gui/base.css first, followed by only the modules you need. The complete dist/8.css bundle combines all modules.
