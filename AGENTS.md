# Repository instructions for coding agents

## Project goal
Build 8.css as a lightweight CSS-only library inspired by Windows 8 Modern UI / Start Screen and desktop. Keep the project independent while using semantic HTML, component-first docs, and copyable examples.

## Source of truth
- Edit component modules in `gui/`.
- Edit the icon sprite in `icons/icons.svg`.
- Run `npm run build` to regenerate `src/8.css`, `dist/8.css`, `dist/gui/*.css`, `dist/icons.svg`, `docs/8.css`, and `docs/icons.svg`.
- Keep README.md, docs/index.html, docs/components.md, llms.txt, and llms-full.txt aligned with public APIs.
- Keep the legacy demo in `examples/legacy-start-screen.html` as a historical reference.

## Constraints
- Runtime must remain CSS-only; do not add required JavaScript dependencies.
- Use the `w8-` prefix for public component classes and `--w8-` for custom properties.
- Prefer semantic HTML and native controls. CSS styles controls but does not implement application behavior.
- Use flat shapes and solid colors consistent with Windows 8. Avoid gradients, neon glow, and unrelated OS chrome.
- Keep focus visible, provide accessible names, and respect reduced-motion preferences.
- SVG symbol IDs must be unique and follow the `w8-icon-{name}` pattern. Icons should inherit `currentColor` where feasible.

## Build layout
- `gui/base.css`: tokens and base typography.
- `gui/tiles.css`: Start Screen tiles.
- `gui/buttons.css` and `gui/forms.css`: common controls.
- `gui/feedback.css`: progress, tabs, badges, notices, separators.
- `gui/window.css`, `gui/app-bar.css`, and `gui/dialog.css`: desktop components.
- `gui/icons.css`: icon sizing and icon-button helpers.
- `gui/responsive.css`: responsive and reduced-motion adjustments.
- `icons/icons.svg`: source sprite copied into dist and docs.
- `dist/8.css`: full CSS bundle; `dist/gui/`: modules; `dist/icons.svg`: SVG sprite.

## Validation
Run `npm run build`, `npm test`, and `npm run build:site`. Confirm generated CSS matches its modules and that `dist/icons.svg` and `docs/icons.svg` match the source sprite. Tests are contract checks, not a browser rendering suite.
