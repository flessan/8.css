# Using 8.css with coding agents

## Recommended reading order
1. Read /llms.txt for the short project and component map.
2. Read /AGENTS.md for repository implementation rules.
3. Read /docs/index.html for the interactive component catalog.
4. Read /docs/components.md for the selector and icon reference.
5. Read /docs/accessibility.md before generating interactive controls.
6. Read /llms-full.txt for the consolidated API.

## Source layout
- gui/ contains maintained component CSS modules.
- vendor/font-awesome/ contains the unmodified Font Awesome 4.7.0 stylesheet, fonts, and license text.
- src/8.css and dist/8.css are generated combined stylesheets (Font Awesome plus modules).
- dist/gui/ contains generated modular stylesheets; dist/font-awesome/ contains the self-hosted icon font.
- docs/index.html is the component catalog. docs/docs.css styles it and docs/script.js adds code-copy and navigation behavior.

## Suggested task instruction
Use documented classes and the classic `fa fa-{name}` icon classes. Keep the runtime CSS-only, and do not invent selectors. If a component is missing, identify the gap and propose a documented API before implementing it. After CSS changes, run npm run build and npm test.

## Accuracy boundaries
Class names do not imply behavior. Styled tabs are not a tabs controller; a close-looking window button does not close a window by itself. Icon glyphs are decorative unless the surrounding control has an accessible name.
