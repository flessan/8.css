# Using 8.css with coding agents

## Recommended reading order
1. Read /llms.txt for the project summary.
2. Read /AGENTS.md for repository rules.
3. Read /docs/components.md for implemented class names and markup.
4. Read /docs/accessibility.md before generating interactive controls.
5. Read /llms-full.txt for a consolidated reference.

## Suggested task instruction
Tell the agent to use documented classes, keep the runtime CSS-only, and avoid inventing selectors. If a component is missing, ask the agent to identify the gap and propose a documented API.

## Accuracy boundaries
Class names do not imply behavior. Styled tabs are not a tabs controller; a close-looking window button does not close a window by itself. Implement behavior separately and use accessible native elements.
