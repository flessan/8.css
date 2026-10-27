# Accessibility

8.css changes presentation. It does not make arbitrary markup accessible automatically. Use semantic HTML and native browser controls.

## Names and structure
- Use a logical heading order.
- Label every input with a visible label or accessible name.
- Give icon-only buttons an aria-label.
- Make interactive tiles links or buttons, not non-interactive div elements.
- Use ARIA roles only when the markup follows the corresponding interaction pattern.

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
