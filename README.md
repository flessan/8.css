# 8.css

**A CSS-only UI library for building Windows 8-inspired interfaces.**

8.css brings the Windows 8 Start Screen and desktop visual language to the web: colorful tiles, flat controls, app bars, and desktop windows. It is framework-neutral, uses semantic HTML, and does not ship a JavaScript runtime.

## Why this project exists

8.css is very strongly inspired by [7.css by khang-nd](https://github.com/khang-nd/7.css). Its CSS-only approach, component-by-component learning experience, live examples, copyable code, and developer documentation showed what a focused operating-system UI library could look like. 7.css targets Windows 7; this project has a different target and an independently developed component API for Windows 8.

The starting point for this repository was [Windows-8-Metro-UI by SamWanekeya](https://github.com/SamWanekeya/Windows-8-Metro-UI), a small HTML and CSS Start Screen experiment. Its history shows no new commits since June 2017, and it appeared to be an abandoned prototype rather than a maintained, reusable component library. I forked it to preserve the original starting point and turn the idea into a practical Windows 8 UI library.

The existing MIT license is retained. 8.css is an independent community project, not an official Microsoft product and not affiliated with or endorsed by the 7.css author.

## Status

The library is in pre-release development and the npm package has not been published yet. npm rejected the unscoped name `8.css` as too similar to existing packages, so the public package will use the scoped name `@flessan/8.css`. Users will install it from the npm registry, with no GitHub dependency during normal installation or use.

## Installation after the first npm release

    npm install @flessan/8.css

Import the complete stylesheet from your app entry point:

    import "@flessan/8.css";

Or use a CDN backed by the npm package:

    <link rel="stylesheet" href="https://unpkg.com/@flessan/8.css/dist/8.css" />

These package commands become available after the first public release. For production, pin an exact published version instead of relying on the latest tag.

## Documentation site

The documentation is designed for GitHub Pages using **Deploy from a branch → `master` → `/docs`**. Its entry point is `docs/index.html`, and `docs/8.css` is a generated copy of the library stylesheet so the documentation can load without referencing files outside the published folder.

When you update CSS modules, run `npm run build` and commit the generated files, including `docs/8.css`. GitHub Pages branch publishing does not run the repository's npm build script for you. GitHub's setup guide confirms that the publishing folder must contain its entry file at the top level. citeturn429935search3turn429935search4

## Components

The API includes Start Screen tiles, buttons, form controls, toggles, progress indicators, badges, notices, tabs, desktop windows, app bars, and native dialog styling. Browse the [interactive documentation](docs/index.html) for live previews and copyable HTML examples.

The source is organized by component in <code>gui/</code>. The build creates a complete stylesheet plus modular files in <code>dist/gui/</code>.

## Development

Requires Node.js 20 or newer for maintainer scripts.

    npm run build
    npm test
    npm run build:site

- Source modules: <code>gui/</code>
- Generated combined source: <code>src/8.css</code>
- npm distribution: <code>dist/8.css</code>
- Modular distribution: <code>dist/gui/</code>
- Documentation site: <code>docs/index.html</code>
- Agent instructions: <code>AGENTS.md</code>, <code>.github/copilot-instructions.md</code>, <code>llms.txt</code>, and <code>llms-full.txt</code>

Do not edit generated files by hand. Change a module in <code>gui/</code>, rebuild, and keep the docs and examples in sync.

## Publishing

The first public publish requires an npm account with permission to publish the package name. After the package has been created, configure npm Trusted Publishing to allow the repository's <code>.github/workflows/publish.yml</code> workflow to publish future GitHub releases using short-lived OIDC credentials. Consumers install the published package from npm; GitHub Actions is only release automation.

## Accessibility

8.css supplies visual styling only. It does not implement application state, live tile updates, tab keyboard behavior, or window-control behavior. Use semantic HTML, accessible names, native controls, visible focus indicators, and reduced-motion support. Check color contrast when customizing tokens.

## License

MIT. See [LICENSE](LICENSE). The original prototype's MIT attribution remains preserved in the repository.
