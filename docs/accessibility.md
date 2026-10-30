# Accessibility

8.css changes presentation. It does not make arbitrary markup accessible automatically. Use semantic HTML and native browser controls.

## Names and structure
- Use a logical heading order.
- Label every input with a visible label or accessible name.
- Give icon-only buttons an aria-label.
- Mark decorative icons with `aria-hidden="true"` so screen readers skip the glyph.
- Make interactive tiles links or buttons, not non-interactive div elements.
- Use ARIA roles only when the markup follows the corresponding interaction pattern.

## Surfaces that appear and disappear
- A flyout, charm pane or toast is only hidden while it carries the `hidden` attribute; toggle that attribute rather than a CSS class, so assistive technology follows the same state as the eye.
- Keep the control that opens a flyout in sync with `aria-expanded`, point it at the surface with `aria-controls`, and move focus into the surface when it opens.
- Announce toasts by placing them in a `role="status"` or `aria-live="polite"` region.
- Semantic zoom, the lock screen and the taskbar are visual states: provide the behaviour and the keyboard path yourself, and never leave the only copy of an action inside an animated or decorative surface.
- The live tile flip is decorative information; the same text must be readable without motion, and `prefers-reduced-motion` stops the animation.

## Icons
Font Awesome glyphs are decorative when they sit next to text:

```html
<button class="w8-button w8-button--primary" type="button">
  <i class="fa fa-check" aria-hidden="true"></i>
  Save changes
</button>
```

When the glyph carries the meaning, label the control and hide the glyph:

```html
<button class="w8-icon-button" type="button" aria-label="Search">
  <i class="fa fa-search w8-icon--large" aria-hidden="true"></i>
  <span class="w8-icon-button__label">Search</span>
</button>
```

The private-use-area codepoints that Font Awesome uses are not meaningful text, so never place an icon inside a control without an accessible name. Icon color must meet contrast requirements against its background, especially on colored tiles and the dark app bar.

## Keyboard focus
The library includes :focus-visible styling. Do not remove focus indicators without a visible replacement. Test the UI using only a keyboard.

## Tabs and dialogs
The .w8-tabs and .w8-tab classes style tabs but do not implement the complete tabs interaction pattern. The host app must manage active state, keyboard navigation, panels, and ARIA attributes.

The .w8-dialog class styles native <dialog>. Use browser dialog APIs and provide a meaningful title.

## Contrast and motion
- Check contrast when changing tile or text colors.
- Test narrow viewports and zoomed layouts.
- The stylesheet includes a prefers-reduced-motion override.
- Do not use animation as the only signal for a state change.

CSS does not manage focus, announce status changes, toggle settings, or handle form submission.
