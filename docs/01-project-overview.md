# Project Overview

1. Introduction
   Roller Service Pages is a multilingual static website for Roller Service, built with Gulp 5,
   Sass, Webpack, and Vanilla JavaScript.

The project provides information about the company's services, including roller shutters, gates,
automation systems, barriers, awnings, window services, and security systems.

The website is generated in two language versions:

- Ukrainian — /uk/
- Russian — /ru/

Both versions share the same HTML templates, stylesheets, JavaScript modules, and static assets.
Language-specific content and metadata are maintained separately in JSON files.

The project uses a custom Gulp build system to assemble HTML pages, compile stylesheets,
bundle JavaScript, process images, generate SVG sprites, and prepare the final static website
in the dist/ directory.

The resulting website does not require a dedicated application server or server-side
rendering runtime to serve its generated pages. It can be deployed to a static hosting platform.

2. Project Goals

The project is designed around the following objectives:

- Static website generation — produce ready-to-serve HTML, CSS, JavaScript, and static assets.
- Multilingual architecture — maintain multiple language versions without duplicating page templates or application
  code.
- Reusable components — use shared HTML partials and modular SCSS stylesheets.
- Responsive presentation — adapt page layouts and assets to different viewport sizes.
- Performance optimization — process images, optimize CSS, split JavaScript bundles, and defer non-critical
  functionality where appropriate.
- Modular JavaScript — separate DOM utilities, application initialization, animations, and gallery functionality.
- Automated build workflow — use Gulp tasks to coordinate development and production pipelines.
- Static deployment — generate a self-contained website suitable for static hosting.

3. High-Level Architecture

The project follows a source-to-output architecture.
<br>The `src/` directory contains the editable source files.
Gulp processes these files and generates the final website in `dist/`.
<br>The build system also uses the `gulp/` and `modules/` directories for build configuration,
task orchestration, and custom processing utilities.

```
SOURCE FILES
                         |
                         v
                  +-------------+
                  |    src/     |
                  +-------------+
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
       HTML           SCSS           JavaScript
          |              |              |
          v              v              v
    HTML templates   Sass compiler   Webpack + Babel
    + JSON content   + PostCSS       + code splitting
          |              |              |
          +--------------+--------------+
                         |
                         v
                  Gulp build system
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
       Images          Fonts        Static resources
     + WebP            copied       + SVG sprites
     processing
          |              |              |
          +--------------+--------------+
                         |
                         v
                  +-------------+
                  |    dist/    |
                  +-------------+
                         |
                         v
                 Static deployment
```

The build process is divided into several stages:

1. Collect and process static resources.
2. Compile stylesheets and bundle JavaScript.
3. Generate localized HTML pages.
4. Write the resulting files to `dist/`.

The build pipeline is described in detail in `docs/03-gulp-build-system.md`.

4. Main Project Components
   <br>4.1. Gulp Build System

The build system is responsible for coordinating all source processing tasks.
<br>Its configuration and implementation are located in:

`gulpfile.js` — Gulp entry point and task orchestration.

`gulp/paths.js` — source paths, output paths, file entries, and page metadata configuration.

`gulp/settings.js` — build settings for HTML, CSS, JavaScript, and SVG processing.

`gulp/tasks.js` — development and production processing tasks.

`gulp/utilFuncs.js` — shared build utilities.

The build system supports two primary modes:

- `dev` — development processing with source maps and uncompressed CSS output.
- `build` — production processing and optimized output.

The project also contains custom Gulp modules in `modules/`,
which implement specialized operations such as image conversion, image optimization,
SVG sprite generation, and BrowserSync integration.

4.2. HTML Templates and Localization
HTML source pages are located in `src/html/`.
The project currently contains eight root HTML pages:

- `index.html`
- `awnings-installation-repair.html`
- `barriers-installation-repair.html`
- `gates-installation-repair.html`
- `gates-rollers-automation.html`
- `rollers-installation-repair.html`
- `security-installation-maintenance.html`
- `window-settings-repair.html`

Reusable HTML partials are stored in:
`src/html/templates/`
<br>The templates are assembled using `gulp-file-include`.
<br>Localized page content and metadata are stored in:
`src/assets/data/pagesVersions/`

The language-specific JSON files provide the data used to generate the corresponding page versions.
<br>During the build process, Gulp processes the HTML source pages separately for each configured language.
<br>Shared templates are reused, while the language-specific data context is passed to the HTML include system.
<br>This approach keeps the page structure independent of its localized content.
<br>For more information, see `docs/04-html-templates-and-localization.md`.

4.3. Styles and Responsive Design

Stylesheets are written in SCSS and stored in: `src/scss/`

The main stylesheet entry points are:

- `index.scss` — the main stylesheet entry point.
- `critical.scss` — styles intended for critical rendering.

Shared styling resources are located in: `src/scss/global_styles/`

Reusable component and section styles are located in: `src/scss/partials/`
<br>The project uses Sass for compilation and PostCSS for further CSS processing.

The configured CSS processing includes:

- Media query sorting.
- Autoprefixer.
- Unused CSS declaration processing through postcss-discard-unused.
- CSS optimization with cssnano.

The build configuration defines separate development and production processing modes.
<br>For more information, see `05-styles-and-responsive-design.md`.

4.4. JavaScript Architecture
<br>The application JavaScript is located in: `src/js/`
<br>The main entry point is: `src/js/index.js`
<br>The JavaScript code is organized into several areas:

```
src/js/
│
├── helpers/
│   ├── funcs.js
│   └── funcsDOM.js
│
├── modulesPack/
│   └── gallery-thumbs/
│       ├── index.js
│       └── scss/
│
├── partials/
│   ├── animationParams.js
│   ├── animations.js
│   ├── gsap-all.js
│   ├── gsap-loader.js
│   └── initialSelectors.js
│
├── types/
│   ├── animations.types.js
│   ├── dom.types.js
│   └── masonry.types.js
│
└── index.js
```

The application uses native JavaScript modules.
<br>Webpack bundles the application code, while Babel processes project JavaScript according to the configured
transformation rules.
<br>JSDoc annotations and TypeScript declaration files are used to describe types and support static checking of
JavaScript code.
<br>The main entry point initializes the immediate interface functionality after DOMContentLoaded.

The current initialization flow includes:

- Navigation link activation.
- Language switcher initialization.
- Burger menu initialization.
- Conditional gallery initialization.
- Deferred GSAP initialization on the first scroll event.

For more information, see `docs/06-javascript-architecture.md`.

4.5. GSAP Animations

The project uses GSAP for JavaScript-driven animations.
<br>The animation-related modules are located in: `src/js/partials/`
<br>The project separates animation parameters, animation initialization, and GSAP loading logic.
<br>GSAP is not included in the initial static script declarations in the HTML metadata configuration.
<br>Instead, the project uses a dedicated loader to load the animation bundle dynamically.
<br>The main application entry point registers a one-time scroll listener.
<br>When the first scroll event occurs, it starts the asynchronous animation initialization process.
<br>This keeps the initial application initialization independent from the GSAP animation subsystem.

For more information, see `docs/07-gsap-animations.md`.

4.6. Gallery and Image Viewer

The project includes a custom gallery implementation.
<br>The gallery functionality consists of two separate concerns:

1. Masonry layout — calculates and arranges gallery items.
2. Image viewer — opens selected images in a modal window.

The Masonry initialization is handled by shared DOM utilities.
<br>The image viewer is implemented in: `src/js/modulesPack/gallery-thumbs/`

The viewer supports:

- Opening an image in a modal window.
- Loading a corresponding high-resolution image.
- Previous and next navigation.
- Keyboard navigation.
- Touch gestures.
- Displaying the current image position.
- Falling back to the thumbnail if the high-resolution image cannot be loaded.

Gallery initialization is deferred using an IntersectionObserver.
<br>The gallery is initialized when it approaches the viewport rather than immediately during
the initial page setup.

For more information, see `docs/08-gallery-and-image-viewer.md`.

4.7. Static Assets and Image Processing

Static assets are maintained in: `src/assets/`
<br>The directory contains:

- Raster images.
- SVG icons.
- Font files.
- Localized JSON data.

Image processing is handled by custom modules using Sharp.
<br>The build system copies source images into the output directory and generates alternative
WebP versions for supported raster formats.

SVG icons are processed separately to generate two sprite files:

- Monochrome SVG sprite.
- Multicolor SVG sprite.

Font files and static data are copied to the corresponding output directories.

For more information, see `docs/09-assets-and-optimization.md`.

5. Source and Output Directory Responsibilities

The project separates editable source files, build configuration, custom processing utilities,
and generated output.

| Directory or file | Responsibility                              |
|-------------------|---------------------------------------------|
| `src/`            | Main source code and static resources       |
| `src/html/`       | Root HTML pages and reusable templates      |
| `src/scss/`       | SCSS stylesheets                            |
| `src/js/`         | Application JavaScript modules              |
| `src/assets/`     | Images, fonts, and localized data           |
| `gulp/`           | Build configuration and task implementation |
| `modules/`        | Custom Gulp plugins and utilities           |
| `types/`          | Custom TypeScript declaration files         |
| `dist/`           | Generated website output                    |
| `gulpfile.js`     | Gulp task orchestration entry point         |
| `package.json`    | Project metadata, scripts, and dependencies |
| `.nvmrc`          | Required Node.js version                    |
| `tsconfig.json`   | TypeScript checking configuration           |

###Important: `dist/` is generated output.
<br>Source changes should normally be made in `src/`, `gulp/`, `modules/`,
<br>or the relevant project configuration files, not directly in generated files.
<br>The generated output should be recreated by running the appropriate build command.

6. Runtime Initialization Overview

7. The browser-side application is initialized from `src/js/index.js`.
   <br>After the DOM has been parsed, the application performs the following operations:

```
DOMContentLoaded
       |
       v
Read page type from document.body
       |
       v
Initialize navigation links
       |
       v
Initialize language switcher
       |
       v
Initialize burger menu
       |
       v
Check whether gallery exists
       |
       +--------------------------+
       |                          |
       v                          v
    Gallery exists            No gallery
       |                          |
       v                          |
Register IntersectionObserver     |
       |                          |
       v                          |
Gallery approaches viewport       |
       |                          |
       v                          |
Initialize Masonry                |
       |                          |
       v                          |
Initialize image viewer           |
       |                          |
       +-------------+------------+
                     |
                     v
          Register one-time scroll
                 listener
                     |
                     v
             First scroll event
                     |
                     v
          Dynamically initialize GSAP
```

The gallery and animation initialization paths are independent.
<br>A page without a gallery can still initialize navigation, language switching,
burger menu functionality, and animations.

Likewise, the gallery does not depend on GSAP initialization.
<br>The main initialization sequence is protected by error handling.
<br>Failures in individual asynchronous components are logged through the project's logging utility.

7. Development and Production Modes

The project provides separate workflows for development and production.

#### Development mode

Development mode is intended for local work and debugging.
<br>It includes:

- Source map generation for stylesheets and JavaScript.
- Non-minified CSS output.
- BrowserSync integration.
- File watching and automatic rebuilds.
- Browser reload or CSS injection after relevant changes.

The development server starts at the Ukrainian homepage: `/uk/index.html`

#### Production mode

Production mode generates the optimized static website.

The production pipeline includes:

- HTML generation for configured languages.
- CSS processing and minification.
- Production JavaScript bundling.
- Static asset copying.
- Image processing and WebP conversion.
- SVG sprite generation.

The generated website is written to: `dist/`
<br>Both modes use the same source structure and build configuration, but apply different
processing settings.

Detailed instructions are available in `docs/02-development-setup.md`
and `docs/03-gulp-build-system.md`.

8. Deployment Architecture

The project generates a static website that can be served by a static hosting provider.
<br>The current configuration includes Cloudflare Pages-compatible redirect rules in:
`src/_redirects`.

The generated redirect file is placed in the root of `dist/`.
The intended public language paths are: `/uk/`, `/ru/`.

The root URL is configured to redirect to the Ukrainian version.
<br>The canonical URL base is configured in: `gulp/settings.js`.
<br>The deployment and output configuration should be reviewed before publishing changes
to production.
<br>In particular, the current source configuration defines:
`export const robotsParams = 'noindex, nofollow'`;

This value is used when generating the robots metadata for pages.
<br>It should be reviewed before production deployment if search engine indexing is expected.

For more information, see `docs/10-dist-and-deployment.md`.

9. Architectural Principles

The current project implementation follows several important principles.

9.1. Separation of Content and Presentation

Localized content is stored in JSON files, while HTML templates define the page structure.
<br>This allows the same templates to generate multiple language versions without
duplicating the markup.

9.2. Reusable HTML Components

Common interface elements are extracted into HTML partials.
<br>Changes to shared elements can therefore be applied consistently across pages.

9.3. Modular JavaScript

JavaScript responsibilities are divided between shared helpers, initialization modules, animation logic, and gallery
functionality.
This makes individual features easier to maintain and reason about.

9.4. Deferred Initialization

Features that are not required immediately are initialized later:

- Gallery functionality is initialized when the gallery approaches the viewport.
- GSAP animations are initialized after the first scroll event.

This reduces the amount of work performed during initial application startup.

9.5. Automated Asset Processing

Images, stylesheets, scripts, and SVG icons are processed by dedicated build tasks.
The generated output is therefore prepared for deployment without requiring manual optimization of every output file.

9.6. Centralized Build Configuration

Paths, metadata, processing settings, and task orchestration are maintained in dedicated configuration files.
This reduces duplication and makes the build system easier to extend.

10. Related Documentation

The following documents describe individual project subsystems in greater detail.

| Document                        | Description                                                     |
|---------------------------------|-----------------------------------------------------------------|
| Development Setup               | Environment requirements, installation, and local development   |
| Gulp Build System               | Build pipeline, task execution, and file watching               |
| HTML Templates and Localization | HTML partials, JSON content, and language generation            |
| Styles and Responsive Design    | SCSS organization and CSS processing                            |
| JavaScript Architecture         | Application entry point, helpers, modules, and type definitions |
| GSAP Animations                 | Animation loading, initialization, and ScrollTrigger            |
| Gallery and Image Viewer        | Masonry layout and modal image viewer                           |
| Assets and Optimization         | Images, WebP conversion, SVG sprites, and fonts                 |
| Distribution and Deployment     | Generated output and deployment configuration                   |
| Maintenance and Troubleshooting | Maintenance practices and common issues                         |

#### Document scope:

This document provides a high-level overview of the project architecture and its main components.
<br>Detailed implementation behavior, configuration options, and development procedures are
documented in the corresponding subsystem guides.






