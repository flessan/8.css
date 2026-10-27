# 8.css

**A lightweight, CSS-only UI library inspired by Windows 8.**

8.css brings the Windows 8 visual language to the web: colorful Start Screen tiles, flat controls, desktop windows, app bars, and familiar typography. It is designed for plain HTML first and works with any frontend framework that can consume CSS.

> This project is being rebuilt from an older Start Screen experiment. The component API is at its initial foundation stage and may evolve before a stable release.

## Principles
- **Windows 8 first.** Keep Modern UI / Start Screen and Windows 8 desktop recognizable.
- **CSS-only runtime.** Components style semantic HTML. No JavaScript runtime is bundled.
- **Framework-neutral.** Use the classes with HTML, React, Vue, Svelte, or another framework.
- **Small and inspectable.** No runtime dependencies.
- **Agent-readable.** The repository includes component references and LLM-friendly entry points.

## Quick start

### CDN
After this branch is available on GitHub, include the stylesheet:

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/flessan/8.css@main/dist/8.css" />

For production, pin a version tag instead of main once tagged releases are available.

### Install from GitHub

    npm install github:flessan/8.css

Then import from a CSS-capable bundler:

    import "8.css";

A public npm registry release is not implied by this GitHub installation method.

### Local development

    git clone https://github.com/flessan/8.css.git
    cd 8.css
    npm run build
    npm test

Link dist/8.css from your HTML. The library itself does not require Node.js at runtime.

## Example: Start Screen tiles

    <div class="w8">
      <section class="w8-start-screen" aria-labelledby="start-title">
        <h1 class="w8-start-heading" id="start-title">Start</h1>
        <p class="w8-start-subtitle">Your apps, at a glance.</p>
        <div class="w8-tiles">
          <a class="w8-tile w8-tile--wide w8-tile--blue" href="#mail">
            <span class="w8-tile__symbol" aria-hidden="true">M</span>
            <span class="w8-tile__label">Mail</span>
          </a>
          <a class="w8-tile w8-tile--purple" href="#photos">
            <span class="w8-tile__symbol" aria-hidden="true">P</span>
            <span class="w8-tile__label">Photos</span>
          </a>
        </div>
      </section>
    </div>

## Component map

| Area | Main classes |
| --- | --- |
| Start Screen | w8-start-screen, w8-start-heading, w8-start-subtitle |
| Tiles | w8-tiles, w8-tile, w8-tile--wide, w8-tile--tall, w8-tile--large |
| Tile colors | w8-tile--blue, --cyan, --purple, --magenta, --green, --orange, --red, --dark |
| Buttons | w8-button, w8-button--primary, w8-button--subtle |
| Fields | w8-input, w8-select, w8-textarea, w8-field, w8-label, w8-help |
| Choices | w8-check, w8-radio, w8-choice, w8-toggle |
| Feedback | w8-progress, w8-badge, w8-notice, w8-divider |
| Desktop | w8-window, w8-title-bar, w8-window-body, w8-window-footer |
| App bar / dialog | w8-app-bar, w8-app-bar__item, w8-dialog |

Read [docs/components.md](docs/components.md) for the current class reference and [docs/README.md](docs/README.md) for the documentation map.

## Customization
Override CSS custom properties after loading the library:

    :root {
      --w8-accent: #0078d7;
      --w8-tile-blue: #0078d7;
      --w8-tile-green: #107c10;
      --w8-font-family: "Segoe UI", Arial, sans-serif;
    }

See [docs/customization.md](docs/customization.md) for the available tokens.

## Development and accessibility
- Source stylesheet: src/8.css
- Generated stylesheet: dist/8.css
- Showcase: index.html
- Legacy experiment: examples/legacy-start-screen.html
- Agent entry points: AGENTS.md, llms.txt, llms-full.txt

Run npm run build and npm test before submitting a change. The stylesheet provides visual styling only; use semantic HTML, accessible names, native controls, visible focus, and reduced-motion support. Validate contrast and responsive behavior in your own context.

## License
MIT. See [LICENSE](LICENSE).
