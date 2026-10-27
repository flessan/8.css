# Customization

Override the CSS custom properties after importing 8.css.

## Global tokens

    :root {
      --w8-font-family: "Segoe UI", "Segoe UI Variable", Arial, sans-serif;
      --w8-text: #1a1a1a;
      --w8-muted: #666;
      --w8-surface: #fff;
      --w8-surface-subtle: #f2f2f2;
      --w8-border: #c8c8c8;
      --w8-accent: #0078d7;
      --w8-accent-hover: #006cc1;
      --w8-focus: #005a9e;
    }

## Tile palette
Available variables: --w8-tile-blue, --w8-tile-cyan, --w8-tile-purple, --w8-tile-magenta, --w8-tile-green, --w8-tile-orange, --w8-tile-red, and --w8-tile-dark.

    :root {
      --w8-tile-blue: #0078d7;
      --w8-tile-green: #107c10;
    }

Tile color modifiers read these variables, so overriding one value updates all tiles using that token.

## Local Start Screen override

    .my-start-screen {
      --w8-start-background: #124e78;
    }

    <section class="w8-start-screen my-start-screen">
      <!-- Start Screen content -->
    </section>

Prefer scoped tokens over global changes when only one part of a page needs a different appearance. Recheck text contrast after customization.
