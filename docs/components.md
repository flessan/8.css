# Component reference

All component selectors use the w8- prefix. Styling does not add JavaScript behavior.

## Start Screen
- .w8-start-screen: Start Screen canvas.
- .w8-start-heading: large lightweight heading.
- .w8-start-subtitle: supporting text.
- .w8-tiles: responsive CSS Grid container.

    <section class="w8-start-screen" aria-labelledby="start">
      <h1 class="w8-start-heading" id="start">Start</h1>
      <p class="w8-start-subtitle">Your apps, at a glance.</p>
      <div class="w8-tiles">
        <a class="w8-tile w8-tile--wide w8-tile--blue" href="#mail">
          <span class="w8-tile__symbol" aria-hidden="true">M</span>
          <span class="w8-tile__label">Mail</span>
          <span class="w8-tile__meta">2 new messages</span>
        </a>
      </div>
    </section>

### Tiles
Base and content classes: .w8-tile, .w8-tile__symbol, .w8-tile__label, .w8-tile__meta, .w8-tile__count.
Sizes: .w8-tile--wide, .w8-tile--tall, .w8-tile--large.
Colors: .w8-tile--blue, .w8-tile--cyan, .w8-tile--purple, .w8-tile--magenta, .w8-tile--green, .w8-tile--orange, .w8-tile--red, .w8-tile--dark.

## Buttons and fields
Buttons: .w8-button, .w8-button--primary, .w8-button--subtle.
Fields: .w8-input, .w8-select, .w8-textarea, .w8-field, .w8-label, .w8-help.
Choices: .w8-check, .w8-radio, .w8-choice, .w8-toggle, .w8-toggle__input.

    <div class="w8-field">
      <label class="w8-label" for="name">Display name</label>
      <input class="w8-input" id="name" name="name" />
      <p class="w8-help">Shown on your profile.</p>
    </div>
    <label class="w8-toggle">
      <input class="w8-toggle__input" type="checkbox" />
      <span>Wi-Fi</span>
    </label>

## Feedback and navigation
- .w8-progress
- .w8-badge and .w8-badge--blue
- .w8-notice, .w8-notice--success, .w8-notice--warning, .w8-notice--error
- .w8-divider
- .w8-tabs and .w8-tab

Tab classes style selected states only. Your application must manage keyboard navigation, panels, and ARIA state.

## Desktop windows
Window: .w8-window.
Title bar: .w8-title-bar, .w8-title-bar__text, .w8-title-bar__controls.
Controls: .w8-window-control, .w8-window-control--close.
Content/footer: .w8-window-body, .w8-window-footer.
App bar: .w8-app-bar, .w8-app-bar__item.
Dialog styling: .w8-dialog, .w8-dialog__body, .w8-dialog__footer.

Window controls are decorative unless you attach behavior. Dialog styles apply to native <dialog>, but do not open it for you.
