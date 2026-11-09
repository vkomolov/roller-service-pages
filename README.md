# Roller Service Pages

A multilingual static website for Roller Service, built with Gulp 5, Sass, Webpack, and Vanilla JavaScript.
The project provides Ukrainian and Russian versions of the website, a reusable HTML templating system, responsive
styling, optimized static assets, interactive galleries, and scroll-triggered animations.

## Overview

Roller Service Pages is a static multi-page website. Its source files are maintained separately from the generated
production output.
The same HTML templates and page structure are used to generate two localized versions:
• Ukrainian — /uk/
• Russian — /ru/
Page content and metadata are stored in language-specific JSON files. Gulp combines this data with the HTML templates
and generates the final pages in dist/.

## Features

- Multilingual content — Ukrainian and Russian versions generated from shared HTML templates.
- HTML templating — reusable partials assembled with gulp-file-include.
- SCSS architecture — modular Sass stylesheets with shared variables, mixins, media queries, and global styles.
- CSS optimization — PostCSS processing, Autoprefixer, and cssnano.
- JavaScript bundling — Webpack and Babel.
- Type-aware JavaScript — JSDoc annotations and strict JavaScript checking configuration.
- Scroll-triggered animations — GSAP and ScrollTrigger with dynamic loading.
- Responsive image handling — image processing with Sharp and support for WebP alternatives and Retina variants.
- SVG sprites — separate monochrome and multicolor sprites generated from source SVG files.
- Interactive gallery — custom Masonry layout and a modal image viewer with keyboard and touch navigation.
- Development server — BrowserSync with automatic updates when source files change.

## Technology Stack

| Technology    | Purpose                                       |
|---------------|-----------------------------------------------|
| Node.js       | JavaScript runtime                            |
| Gulp 5        | Build automation and task orchestration       |
| Sass          | SCSS compilation                              |
| PostCSS       | CSS optimization and vendor prefixing         |
| Webpack 5     | JavaScript bundling and code splitting        |
| Babel         | JavaScript transpilation                      |
| JSDoc         | JavaScript documentation and type annotations |
| GSAP          | Animation engine                              |
| ScrollTrigger | Scroll-based animation control                |
| Sharp         | Raster image processing and conversion        |
| SVGO          | SVG optimization                              |
| BrowserSync   | Development server with live reloading        |

## Project Structure

```
roller-service-pages/
│
├── docs/                   # Project documentation
│
├── dist/                   # Generated website output
│   ├── assets/             # Images, fonts, and data
│   ├── css/                # Compiled stylesheets
│   ├── js/                 # JavaScript bundles
│   ├── uk/                 # Ukrainian pages
│   └── ru/                 # Russian pages
│
├── gulp/                   # Gulp configuration and tasks
│   ├── paths.js
│   ├── settings.js
│   ├── tasks.js
│   └── utilFuncs.js
│
├── modules/                # Custom Gulp plugins and utilities
│
├── src/
│   ├── assets/
│   │   ├── data/           # Localized JSON content
│   │   ├── fonts/          # Font files
│   │   └── img/            # Source images and SVG files
│   │
│   ├── html/
│   │   └── templates/      # Reusable HTML partials
│   │
│   ├── js/
│   │   ├── helpers/        # Shared JavaScript utilities
│   │   ├── modulesPack/    # Feature modules
│   │   ├── partials/       # Application initialization and configuration
│   │   └── types/          # JSDoc type definitions
│   │
│   └── scss/
│       ├── global_styles/  # Shared styles, variables, mixins, and media queries
│       └── partials/       # Component styles
│
├── types/                  # Custom TypeScript declaration files
│
├── gulpfile.js
├── nodeCheck.js
├── package.json
├── package-lock.json
├── tsconfig.json
└── .nvmrc
```

## Requirements

- Node.js 24.12.0 — the required version is specified in .nvmrc.
- npm — use the version compatible with the installed Node.js release.

The project includes a Node.js version check. The development and build scripts validate the current
runtime against .nvmrc before executing Gulp tasks.

## Getting Started

1. Clone the repository
   git clone https://github.com/vkomolov/roller-service-pages.git
   cd roller-service-pages
2. Install the required Node.js version
   If you use NVM:
   nvm install 24.12.0
   nvm use 24.12.0
3. Install dependencies
   npm ci
   npm ci installs dependencies using the versions recorded in package-lock.json.
4. Start development
   npm run dev

This command:

- checks the Node.js version;
- cleans previous generated output;
- runs the development build pipeline;
- starts BrowserSync;
- watches source files and rebuilds affected resources when they change.

The local server opens the Ukrainian homepage at /uk/index.html.

## Available Scripts

| Command              | Description                                                                  |
|----------------------|------------------------------------------------------------------------------|
| `npm run dev`        | Runs the development pipeline, starts BrowserSync, and watches source files. |
| `npm run build`      | Runs the production pipeline and starts a local BrowserSync preview.         |
| `npm run pipesDev`   | Runs the development pipeline without starting a local server.               |
| `npm run pipesBuild` | Runs the production pipeline without starting a local server.                |
| `npm run clean`      | Removes generated output and temporary build directories.                    |
| `npm run node:check` | Checks whether the installed Node.js version matches `.nvmrc`.               |

## Build Output

The generated website is written to dist/.

```
dist/
├── assets/
│   ├── data/
│   ├── fonts/
│   └── img/
│
├── css/
│   ├── critical.css
│   ├── critical.min.css
│   ├── index.css
│   └── index.min.css
│
├── js/
│   ├── index.bundle.js
│   ├── vendor.bundle.js
│   └── gsap.bundle.js
│
├── uk/
│   └── *.html
│
├── ru/
│   └── *.html
│
└── _redirects
```

The uk/ and ru/ directories contain the generated language-specific HTML pages.
The JavaScript output is split into the application bundle, vendor bundle, and dynamically loaded GSAP bundle.

## Deployment Notes

The project contains a Cloudflare Pages-compatible _redirects file.
The current routing configuration redirects the root URL to /uk/ and supports the /uk/* and /ru/* paths.
Before deploying to a public production environment, review the following configuration:

- rootUrl in gulp/settings.js — the base URL used to generate canonical and alternate language links.
- robotsParams in gulp/paths.js — the current value is noindex, nofollow.
  The current generated HTML contains the noindex, nofollow robots directive. Verify that this is intentional before
  enabling production indexing.

## Documentation

Detailed documentation is maintained separately in the `docs/` directory.

| Document                           | Description                                            |
|------------------------------------|--------------------------------------------------------|
| 01-project-overview                | Application architecture and major components          |
| 02-development-setup               | Environment requirements and local setup               |
| 03-gulp-build-system               | Build pipeline, tasks, modes, and file watching        |
| 04-html-templates-and-localization | HTML partials, JSON content, and language generation   |
| 05-styles-and-responsive-design    | SCSS structure, CSS processing, and breakpoints        |
| 06-javascript-architecture         | Entry point, modules, helpers, and type definitions    |
| 07-gsap-animations                 | Lazy loading, timelines, and ScrollTrigger             |
| 08-gallery-and-image-viewer        | Masonry layout, thumbnails, and modal viewer           |
| 09-assets-and-optimization         | Images, WebP, SVG sprites, fonts, and asset processing |
| 10-distribution-and-deployment     | Generated output and deployment configuration          |
| 11-maintenance-and-troubleshooting | Maintenance practices and common issues                |

## License
ISC

