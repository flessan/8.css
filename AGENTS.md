# Repository instructions for coding agents

## Project goal
Build 8.css as a lightweight CSS-only library inspired by Windows 8 Modern UI / Start Screen and desktop. Keep the project independent while using semantic HTML, component-first docs, and copyable examples.

## Source of truth
- Edit component modules in `gui/`.
- Icon artwork comes from the unmodified Font Awesome 4.7.0 package in `vendor/font-awesome/`. Do not hand-edit vendored CSS or font binaries; replace the folder contents when upgrading the icon release and keep its license text with it.
- Run `npm run build` to regenerate `src/8.css`, `dist/8.css`, `dist/gui/*.css`, `dist/font-awesome/`, `docs/8.css`, `docs/font-awesome/`, and `THIRD-PARTY-NOTICES.md`.
- Keep README.md, docs/index.html, docs/components.md, llms.txt, and llms-full.txt aligned with public APIs.
- Keep the legacy demo in `examples/legacy-start-screen.html` as a historical reference; it uses `styles/main.css` and the published Font Awesome assets.
- Wallpaper artwork is demonstration material: never add the full resolution files to `package.json` `files`, and keep `styles/images/wallpapers/NOTICE.md` accurate.

## Constraints
- Runtime must remain CSS-only; do not add required JavaScript dependencies.
- Use the `w8-` prefix for public component classes and `--w8-` for custom properties.
- Use Font Awesome 4.7.0 classes (`fa fa-home`), not Font Awesome 5/6/7 syntax. Never substitute text glyphs or emoji for an icon that exists in Font Awesome.
- Prefer semantic HTML and native controls. CSS styles controls but does not implement application behavior.
- Use flat shapes and solid colors consistent with Windows 8. Avoid gradients, neon glow, and unrelated OS chrome.
- Match Windows 8, not Windows 10: the Start screen pans sideways with column-major tiles, the Charms order is Search, Share, Start, Devices, Settings, the RTM taskbar has no Start button, and edge gestures (right = Charms, left = switcher and snap, top/bottom = app bar) stay the primary interaction model.
- Keep focus visible, provide accessible names, mark decorative icons with `aria-hidden="true"`, and respect reduced-motion preferences.

## Build layout
- `gui/base.css`: tokens and base typography.
- `gui/tiles.css` and `gui/live-tiles.css`: Start Screen tiles, badges, flips and semantic zoom.
- `gui/buttons.css`, `gui/forms.css`, and `gui/navigation.css`: common controls, navigation lists and flip views.
- `gui/feedback.css`: progress, tabs, badges, notices, separators.
- `gui/window.css`, `gui/taskbar.css`, `gui/app-bar.css`, `gui/charms.css`, `gui/flyout.css`, `gui/toast.css`, and `gui/dialog.css`: desktop and notification chrome.
- `gui/lock-screen.css`, `gui/hub.css`, and `gui/split-view.css`: the sign-in surface and the two Windows 8 app layouts.
- `gui/gestures.css`: the surfaces the Windows 8 edge gestures reveal (edge panels, app switcher, snap preview, gesture coach, RTM Start hotspot) and the touch utilities.
- `examples/shell.html`: the assembled shell demo (lock screen, Start screen, desktop, taskbar) used to check the surfaces together.
- `examples/gestures.js`: demo-only Pointer Events wiring for the edge gestures. Keep runtime JavaScript out of `gui/` and `dist/`; this file is never published as package code.
- `gui/icons.css`: Font Awesome sizing hooks and icon-button helpers.
- `gui/motion.css`: opt-in entrance animations, tile stagger, Charms entrance, wallpaper crossfade, press ripples and the motion tokens; everything is disabled under `prefers-reduced-motion`.
- `gui/responsive.css`: responsive and reduced-motion adjustments.
- `vendor/font-awesome/`: upstream icon font, stylesheets, and license.
- `styles/images/`: demo wallpaper artwork (`Windows8RTM/`, `Windows8.1RTMWallpapers/`) and the generated `wallpapers/` pack (manifest, thumbnails, palette, optional classes).
- `scripts/wallpapers.mjs`: builds the wallpaper index; `npm run build` runs it. Thumbnails and colours are committed and documented in `styles/images/wallpapers/NOTICE.md`.
- `dist/8.css`: full CSS bundle (Font Awesome + modules); `dist/gui/`: modules; `dist/font-awesome/`: icon font.
- `scripts/lib/bundle.mjs`: shared bundle generation used by build and tests.

## Validation
Run `npm run build`, `npm test`, and `npm run build:site`. Confirm generated CSS matches its modules, that `dist/font-awesome/` and `docs/font-awesome/` match `vendor/font-awesome/`, that every `fa-*` class in the HTML pages exists as a glyph in the shipped font, and that icon markup stays accessible.

`npm run test:browser` adds an optional real-browser pass (no npm dependencies): it renders every page at 1280px and 390px, checks that icons paint, that no request fails, that nothing overflows horizontally, and that the mobile menu, code copy, code snippets, skip link and reduced-motion rules work. Run it before shipping visual changes; it skips when Chromium is unavailable.

Wallpaper coverage is checked too: every entry needs a source file, a thumbnail, a palette pair, a published copy in `dist/wallpapers/`, and matching generated classes.

The Start Screen previews use `grid-auto-flow: row dense` so a wide tile is followed by the next fitting tile instead of a hole. Keep that behaviour in mind when adding tiles to the demos.
