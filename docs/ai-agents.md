# Using 8.css with coding agents

## Recommended reading order
1. Read /llms.txt for the short project and component map.
2. Read /AGENTS.md for repository implementation rules.
3. Read /docs/index.html for the interactive component catalog.
4. Read /docs/components.md for the selector reference.
5. Read /docs/accessibility.md before generating interactive controls.
6. Read /llms-full.txt for the consolidated API.

## Source layout
- gui/ contains maintained component CSS modules.
- src/8.css and dist/8.css are generated combined stylesheets.
- dist/gui/ contains generated modular stylesheets.
- docs/index.html is the component catalog. docs/docs.css styles it and docs/script.js adds code-copy and navigation behavior.

## Suggested task instruction
Use documented classes, keep the runtime CSS-only, and do not invent selectors. If a component is missing, identify the gap and propose a documented API before implementing it. After CSS changes, run npm run build and npm test.

## Accuracy boundaries
Class names do not imply behavior. Styled tabs are not a tabs controller; a close-looking window button does not close a window by itself. Implement behavior separately and use accessible native elements.
