# Repository instructions for coding agents

## Project goal
Build 8.css as a lightweight CSS-only library inspired by Windows 8 Modern UI / Start Screen and desktop. The component-first documentation approach is strongly inspired by 7.css by khang-nd, while this library's target UI and API are specific to Windows 8.

## Source of truth
- Edit component modules in gui/.
- Run npm run build to regenerate src/8.css, dist/8.css, and dist/gui/*.css.
- Keep README.md, docs/index.html, docs/components.md, llms.txt, and llms-full.txt aligned with the public API.
- Keep the legacy demo at examples/legacy-start-screen.html as a historical reference, not the new component API.

## Constraints
- Runtime must remain CSS-only; do not add required JavaScript dependencies.
- Use the w8- prefix for public component classes.
- Prefer semantic HTML and native elements. CSS styles controls but does not implement their behavior.
- Use flat shapes and solid colors consistent with Windows 8. Avoid gradients, neon glow, and unrelated OS chrome.
- Preserve visible keyboard focus, reduced-motion support, readable contrast, and responsive layouts.
- New custom properties must use the --w8- prefix.

## Build layout
- gui/base.css defines tokens and base typography.
- gui/tiles.css defines Start Screen tiles.
- gui/buttons.css and gui/forms.css define common controls.
- gui/feedback.css defines progress, tabs, badges, notices, and separators.
- gui/window.css, gui/app-bar.css, and gui/dialog.css define desktop components.
- gui/responsive.css defines responsive and reduced-motion adjustments.
- dist/8.css is the complete bundle; dist/gui/*.css are modular stylesheets. Load base.css before selected component modules when using the modular distribution.

## Validation
Run npm run build, npm test, and npm run build:site. The tests are lightweight contract checks, not a full CSS parser or browser suite. Test examples at narrow and wide viewport widths when changing layout.

## Agent documentation
Read docs/index.html, docs/components.md, and docs/accessibility.md. Use llms.txt for the short map and llms-full.txt for the consolidated reference. Never invent classes not present in gui/ or in an explicitly documented proposal.
