# Installation

## CDN
After this branch is available on the default branch, load the built stylesheet:

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/flessan/8.css@main/dist/8.css" />

For production, pin a version tag once releases exist. A branch URL is not immutable.

## GitHub install

    npm install github:flessan/8.css

Then import the stylesheet from a bundler that supports CSS package imports:

    import "8.css";

This repository does not claim a public npm registry release already exists.

## Local development
Requires Node.js 18 or newer for maintainer scripts:

    git clone https://github.com/flessan/8.css.git
    cd 8.css
    npm run build
    npm test

End users only need the CSS file if they are not building from source. Frameworks are supported because 8.css has no framework-specific runtime.
