# Repository instructions for coding agents

## Project goal
Build 8.css as a lightweight CSS-only library inspired by the Windows 8 Start Screen / Modern UI and Windows 8 desktop. Keep these areas visually recognizable.

## Source of truth
- Edit src/8.css.
- Regenerate dist/8.css with npm run build; do not manually edit only the generated file.
- Keep README.md, docs/components.md, llms.txt, and llms-full.txt aligned with the public API.
- The old prototype is retained in examples/legacy-start-screen.html and styles/main.css; it is not the API for new components.

## Constraints
- Runtime must remain CSS-only; do not add required JavaScript dependencies.
- Use the w8- prefix for public component classes.
- Prefer semantic HTML and native elements. CSS styles controls but does not implement their behavior.
- Prefer flat shapes and solid colors. Avoid gradients, neon glow, and unrelated OS chrome.
- Preserve visible keyboard focus, reduced-motion support, readable contrast, and responsive layouts.
- New custom properties must use the --w8- prefix.

## Validation
Run npm run build and npm test. The tests are lightweight checks, not a full CSS parser or browser suite. Test the examples at narrow and wide widths when changing layout.

## Agent documentation
Read docs/README.md, docs/components.md, and docs/accessibility.md. Use llms.txt for a short entry point and llms-full.txt for the consolidated reference. Never invent classes not present in src/8.css or in an explicitly documented proposal.
