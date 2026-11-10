# Styles and Responsive Design

Styles are authored in SCSS, compiled by Dart Sass, processed by PostCSS, and written to
`dist/css/`. Responsive behavior is implemented mainly with SCSS media-query mixins and
fluid CSS custom properties.

## 1. SCSS structure

- `src/scss/index.scss` is the main stylesheet entry point. It loads the shared root styles,
  gallery viewer styles, and footer styles.
- `src/scss/critical.scss` is the critical entry point. It loads shared root styles and the
  header. This stylesheet is configured to be inlined in the generated document head.
- `src/scss/global_styles/` contains reset, fonts, variables, media mixins, mixins, keyframes,
  and shared extensions.
- `src/scss/partials/` contains component styles such as header and footer styles.
- `src/js/modulesPack/gallery-thumbs/scss/gallery-thumbs.scss` styles the gallery modal and
  is imported by `index.scss`.

Gulp compiles only root-level `src/scss/*.scss` files as entry points. Nested partials are
included through Sass `@use`/`@forward`; they are not emitted as standalone stylesheets.
When changing a nested file, edit the partial, not generated CSS in `dist/`.

## 2. Responsive conventions

`src/scss/global_styles/_media.scss` defines the project's breakpoint mixins, including
maximum widths of 1280, 1024, 768, 640, 480, 375, and 320 pixels. Use the existing mixins
through the root Sass module (for example `root.maxTabletPortrait`) instead of introducing
slightly different breakpoint values for the same layout.

`global_styles/_variables.scss` and `root.scss` provide shared design tokens and fluid
custom properties. `global_styles/_mixins.scss` provides common layout and responsive
utilities. The project uses both media-query breakpoints and fluid values; check an existing
component before deciding which technique fits.

For responsive images, keep layout geometry in sync with HTML `width` and `height`
attributes. These intrinsic dimensions allow the browser to reserve the correct aspect ratio
before an image loads. This is especially important for the Masonry gallery.

## 3. Sass and PostCSS pipeline

For each root SCSS entry point:

1. Dart Sass compiles imported SCSS to CSS.
2. `postcss-sort-media-queries` sorts media queries mobile-first.
3. Autoprefixer applies prefixes for the Browserslist targets (`last 5 versions`, `not dead`).
4. `postcss-discard-unused` and cssnano run as part of the configured optimization array.
5. The pipeline writes the optimized `.css` file.
6. It applies `postcss-normalize-whitespace`, renames the result to `.min.css`, and writes it.

In development, Sass source maps are enabled and `.min.css` output also receives a source map.
Production mode uses Webpack-independent Sass streams with no Sass source maps. In both
modes, the build emits normal and `.min.css` variants because the resource metadata points
at the minified stylesheet.

The CSS optimization array does not call the custom `CustomPurgeCss` transform: its
invocation is commented out in the production task. The transform and its `purgecss`
dependency are retained for an optional single-page/single-language workflow, but the
current multi-page, multilingual build must not enable that HTML matching unchanged: selectors
used by another page or language could be removed. Do not rely on the current build to scan
the generated HTML and remove all unused selectors.

## 4. Critical and deferred CSS

`gulp/paths.js` configures `critical.scss` as inline CSS and `index.scss` as a deferred
stylesheet. Critical CSS contains the header and initial/hero presentation; the common
stylesheet contains the rest of the site's presentation, including gallery viewer styling.
If a component is moved between entry points, check its initial-render behavior and all
generated pages.

Use the browser's network panel and generated HTML to confirm that a style change landed in
the intended entry point. Avoid putting the same rule in both entry points unless there is
a deliberate reason.

## 5. CSS animations versus GSAP

CSS handles the initial hero entrance effects and ordinary interaction transitions, such as
hover and active states. Their keyframes are in `global_styles/_animations.scss`, and hero
animation declarations are in `critical.scss`. The delayed hero entrance is designed to work
without waiting for a scroll event.

GSAP handles scroll-linked parallax, reveal timelines, and the scrolled navigation panel.
The SCSS selectors `[data-anime=fade-in-left]`, `[data-anime=fade-in-right]`,
`[data-anime=fade-in-up]`, and `[data-anime=scale-in]` establish their initial hidden state;
GSAP changes their visual properties when initialized. See
`docs/07-gsap-animations.md` before changing those elements' initial CSS state.

Do not animate the same property on the same element with both CSS and GSAP at the same
time. CSS transitions are appropriate for simple hover, focus, and modal state changes;
GSAP is appropriate for coordinated timelines, scroll triggers, and parallax.

## 6. Adding or changing a component style

1. Find the component's existing partial and its entry-point imports.
2. Reuse shared colors, typography, mixins, and breakpoint mixins.
3. Keep selector names consistent with the HTML and JavaScript selectors.
4. If the style is needed before deferred CSS loads, decide whether it belongs in
   `critical.scss`; avoid duplicating a complete component stylesheet.
5. Run `npm run pipesBuild`, then inspect both `dist/css/*.css` and the rendered page at
   representative viewport widths.

## 7. Troubleshooting

- **SCSS compiles but a rule is absent:** check that the entry point imports the partial and
  that the selector matches generated HTML.
- **A nested SCSS change is not reflected during development:** confirm the nested SCSS file
  is within the configured watch paths and inspect the Gulp output.
- **Layout shifts while images load:** verify correct `width`/`height` attributes and the
  image's intrinsic aspect ratio.
- **A rule appears only after a delay:** determine whether it is in deferred common CSS
  rather than critical CSS.
- **A CSS animation conflicts with a reveal:** identify whether CSS or GSAP owns `opacity`,
  `transform`, or another animated property and keep one owner for that effect.
- **Prefixes or media ordering differ:** check the active PostCSS configuration and the
  Browserslist targets rather than adding manual vendor-prefixed copies.
