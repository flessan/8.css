# Component and icon reference

The [interactive catalog](index.html) includes live previews, a 78-icon gallery drawn from Font Awesome 4.7.0, and copyable snippets. The [component gallery](../examples/components.html) shows every component on one page, including a complete 12-tile Start Screen group. Public component classes use the `w8-` prefix.

## CSS modules
- `gui/base.css`: design tokens, scoped typography, and focus styles.
- `gui/tiles.css`: Start Screen canvas and tiles.
- `gui/live-tiles.css`: tile badges, flip animations, tile groups and the semantic zoom overview.
- `gui/buttons.css`: button states and variants.
- `gui/forms.css`: input, select, textarea, checkbox, radio, and toggle styling.
- `gui/feedback.css`: progress, tabs, badges, notices, and dividers.
- `gui/window.css`: desktop window and title bar.
- `gui/taskbar.css`: desktop taskbar, app buttons, previews, tray and clock.
- `gui/app-bar.css`: action bar.
- `gui/charms.css`: Charms bar, flyout panes and search results.
- `gui/flyout.css`: message flyouts, menu flyouts and tooltips.
- `gui/toast.css`: toast notification region and cards.
- `gui/lock-screen.css`: lock screen, sign-in panel and battery indicator.
- `gui/hub.css`: horizontally panned hub pages.
- `gui/split-view.css`: snapped and filled split layouts.
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
- Charms: `w8-charms`, `w8-charm`, `w8-charm__icon`, `w8-charm__label`, `w8-charm-pane`, `w8-charm-pane__title`, `w8-charm-pane__group`, `w8-charm-pane__item`; modifiers `w8-charms--right`, `w8-charms--fixed`.
- Lock screen: `w8-lock`, `w8-lock__time`, `w8-lock__date`, `w8-lock__detail`, `w8-lock__detail-text`, `w8-lock__badges`, `w8-lock__badge`, `w8-lock__badge-count`, `w8-lock__status`, `w8-lock__status-item`, `w8-lock__hint`, `w8-lock__panel`, `w8-lock__avatar`, `w8-lock__user`, `w8-lock__tools`, `w8-lock__tool`; modifier `w8-lock--dimmed`; battery `w8-battery` with `w8-battery__level` and `w8-battery--low`.
- Live tiles: `w8-tile__badge` (`--solid`, `--alert`), `w8-tile--live`, `w8-tile__flipper`, `w8-tile__face` (`--back`), `w8-tile-groups`, `w8-tile-group`, `w8-tile-group__label`, `w8-tile-groups--overview`.
- Taskbar: `w8-taskbar`, `w8-taskbar__start`, `w8-taskbar__apps`, `w8-taskbar__app`, `w8-taskbar__item`, `w8-taskbar__preview`, `w8-taskbar__preview-title`, `w8-taskbar__preview-shot`, `w8-taskbar__tray`, `w8-taskbar__tray-item`, `w8-taskbar__clock`, `w8-taskbar__spacer`, `w8-taskbar__show-desktop`; modifiers `w8-taskbar--fixed`, `w8-taskbar__app--active`.
- Flyouts and toasts: `w8-flyout`, `w8-flyout__arrow`, `w8-flyout__title`, `w8-flyout__text`, `w8-flyout__actions`, `w8-flyout__item`, `w8-flyout__separator`, `w8-tooltip`; modifiers `w8-flyout--top`, `--bottom`, `--left`, `--right`, `--menu`, `--dark`; `w8-toast-region`, `w8-toast`, `w8-toast__icon`, `w8-toast__title`, `w8-toast__body`, `w8-toast__close`, `w8-toast__actions`, `w8-toast__action`, `w8-toast--peek`.
- Hub and split view: `w8-hub`, `w8-hub__header`, `w8-hub__title`, `w8-hub__lead`, `w8-hub__section`, `w8-hub__section-title`, `w8-hub__list`, `w8-hub__item`, `w8-hub__item-icon`, `w8-hub__item-text`, `w8-hub__item-title`, `w8-hub__item-meta`, `w8-hub__card`; `w8-split`, `w8-split__pane`, `w8-split__main`, `w8-split__title`; modifiers `w8-hub--dark`, `w8-split--snap-right`, `w8-split--divider`.
- Progress ring and app bar variants: `w8-progress-ring` (`--small`), `w8-app-bar--top`, `w8-app-bar--contextual`, `w8-app-bar--circular`, `w8-app-bar__separator`.
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

## Wallpaper pack

`styles/images/` contains the Windows 8 (19) and Windows 8.1 (9) RTM wallpapers. The [wallpaper pack page](../examples/wallpapers.html) previews them on a live Start Screen with fit modes and accent colours.

- Start Screen hooks: `--w8-start-image` (background image) and `--w8-start-background` (fallback colour), documented under `.w8-start-screen`.
- Optional classes generated by `scripts/wallpapers.mjs`: `.w8-wallpaper-<id>` and `.w8-wallpaper-cover`.
- Manifest: `styles/images/wallpapers/manifest.json`; published thumbnails: `dist/wallpapers/`.
- Licensing: Microsoft artwork, demonstration use only, not covered by the MIT license and not published at full resolution. See `styles/images/wallpapers/NOTICE.md`.

## Modular package imports
Load `dist/gui/base.css` first, then the modules required by your markup. Load `dist/gui/icons.css` for the 8.css icon helpers, and load `dist/font-awesome/css/font-awesome.min.css` for the glyphs themselves. The complete `dist/8.css` bundle combines the Font Awesome stylesheet and every CSS module, but the font files stay separate so they can be cached independently.
