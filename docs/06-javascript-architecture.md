# JavaScript Architecture

The browser application is authored as native JavaScript modules. Webpack starts from
`src/js/index.js`, Babel transforms project source, and Gulp writes the bundles into
`dist/js/`.

## 1. Entry point and bundle layout

`gulp/paths.js` discovers JavaScript entries in the root of `src/js/`; currently this is
`index.js`. Webpack resolves its imported modules, creates `index.bundle.js`, and splits
non-GSAP dependencies into `vendor.bundle.js`. GSAP and ScrollTrigger are loaded as a
separate asynchronous chunk.

The generated HTML resource metadata includes the vendor and main scripts with `defer`.
Do not add generated bundles to source HTML; edit the entry/module and let Gulp rebuild.

## 2. Initialization flow

On `DOMContentLoaded`, `src/js/index.js`:

1. Reads `document.body.dataset.type` and activates matching navigation links.
2. Initializes the language switcher and CSS-driven burger menu.
3. If `#gallery-work` exists, observes it with a shared IntersectionObserver. At a
   `200px 0px` root margin, it initializes Masonry and the modal image viewer.
4. Registers a one-time passive `scroll` listener. The first scroll starts GSAP loading and
   animation initialization.

Navigation, gallery, and GSAP are separate concerns. Pages without a gallery still initialize
the shared navigation and animation code. Gallery setup does not require GSAP.

## 3. Modules and responsibilities

- `helpers/funcs.js`: general helpers, validation/logging utilities, and shared small
  functions.
- `helpers/funcsDOM.js`: DOM querying and updates, observer utilities, Masonry geometry and
  resize lifecycle, modal support helpers, and DOM-related validation.
- `partials/initialSelectors.js`: selector strings, navigation/page anchors, gallery settings,
  and modal constants.
- `partials/animations.js`: timeline builders, burger-menu interaction, animation dispatch,
  and initialization.
- `partials/animationParams.js`: declarative GSAP timeline configurations.
- `partials/gsap-loader.js` and `gsap-all.js`: cached dynamic GSAP/ScrollTrigger loading and
  animation registry.
- `modulesPack/gallery-thumbs/`: modal image-viewer behavior and its styles.
- `types/` and root `types/`: JSDoc type aliases and custom declarations used for static
  checking.

Keep selectors centralized when they are shared by JavaScript and HTML conventions. When
changing a selector, update the matching markup and any animation or gallery configuration
that uses it.

## 4. DOM conventions and helpers

Prefer the existing helpers in `funcsDOM.js` over repeating selector handling, element
narrowing, event wiring, or observer setup. Many helpers accept a selector and a search root;
use the component root where possible to avoid querying unrelated page content.

The page identifier is the `data-type` attribute on `<body>`. It must match the key in
`linkAnchors` when navigation highlighting or page-specific animation dispatch is required.
`linkAnchors` is also the source of valid page-name keys for animation dispatch.

## 5. JSDoc and checking

JavaScript files use JSDoc annotations and typedef imports from `src/js/types/`. `tsconfig.json`
enables `allowJs`, `checkJs`, and strict checking for JavaScript, with declarations under
`types/`. When adding a parameter, return value, DOM element, or configuration object, update
the closest type alias and annotate the implementation rather than weakening checks with an
untyped escape hatch.

There is no dedicated `typecheck` npm script in `package.json`. The normal build scripts
execute the Node version check and Gulp build; treat compiler/runtime errors emitted by the
build as actionable, and use the repository's existing TypeScript tooling only if available
in the installed dependency tree.

## 6. Adding a browser feature

1. Put shared low-level behavior in the appropriate helper; keep feature orchestration in a
   module or partial.
2. Import and initialize it from `index.js` only when it belongs in the common application
   startup path. For viewport- or interaction-deferred work, follow the existing observer or
   lazy-loader pattern.
3. Add or reuse a selector in `initialSelectors.js`.
4. Add JSDoc types for public parameters and return values.
5. Verify the feature on pages both with and without its optional DOM element.
6. Run `npm run pipesBuild` and inspect the generated bundle and HTML.

Avoid adding an independent listener or observer if an existing lifecycle helper already
covers the same component. Ensure asynchronous failures are logged through the project's
logging utility or propagated to the caller, rather than silently ignored.

## 7. Troubleshooting

- **Feature runs before markup exists:** initialize after `DOMContentLoaded` or at the
  existing feature lifecycle point.
- **Page-specific behavior is missing:** compare `<body data-type>` with `linkAnchors` and
  the registered page animation key.
- **A helper finds the wrong element:** verify the selector and pass a narrow root element.
- **JavaScript change does not appear:** inspect Gulp/Webpack output and confirm the source is
  reachable from `src/js/index.js`.
- **A module is absent from the initial network requests:** it may be a deliberate dynamic
  chunk, especially for GSAP. Inspect the network panel after the relevant trigger.
