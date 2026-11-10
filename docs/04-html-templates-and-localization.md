# HTML Templates and Localization

The site shares HTML structure between its Ukrainian and Russian versions. Page templates,
language data, and build-time metadata are combined by Gulp; the browser receives static HTML
files and does not fetch the JSON content at runtime.

## 1. Source layout and generated pages

- Root page templates: `src/html/*.html`.
- Reusable partials: `src/html/templates/*.html`.
- Localized page content: `src/assets/data/pagesVersions/uk.json` and `ru.json`.
- Shared header/navigation strings: `src/assets/data/pagesVersions/header/uk.json` and
  `header/ru.json`.
- Language codes and metadata are configured in `gulp/paths.js`.

The page source files are `index.html`, `awnings-installation-repair.html`,
`barriers-installation-repair.html`, `gates-installation-repair.html`,
`gates-rollers-automation.html`, `rollers-installation-repair.html`,
`security-installation-maintenance.html`, and `window-settings-repair.html`.
Each includes data using the matching page key: `index`, `awnings`, `barriers`, `gates`,
`automation`, `rollers`, `security`, or `windows`.

For each configured language (`uk`, `ru`), Gulp processes every root page and writes it under
`dist/<lang>/`. The HTML `<html lang>` value comes from the page data. Shared markup is not
duplicated per language.

## 2. Includes, conditions, and data context

`gulp-file-include` uses `@@` as its directive prefix and `@file` as its include base path.
Common patterns are:

```html
@@include("templates/head.html", {"page": "index"})

@@if (data && data["index"] && data["index"].main) {
  <h1>@@data.index.main.hero.accent</h1>
}
```

An included partial receives the include arguments, such as `page: "index"`. Text values are
referenced by paths such as `@@data.@@page.main.hero.accent`. The data context is assembled
by `setFileIncludeSettings()` and `getPageData()`:

1. Read the selected language's page JSON and matching `header_<lang>` JSON.
2. For each page key in the language file, combine its `head`, `main`, and other page data
   with the shared header strings.
3. Add language-specific values and generated metadata such as robots, stylesheet, script,
   favicon, preload, canonical, alternate, and x-default links.
4. Pass that object to `gulp-file-include`.

Keep the JSON nesting and property names aligned with the HTML placeholders. A missing key
may leave a placeholder empty or prevent a conditional block from rendering; the build does
not translate or infer absent values.

## 3. Adding or changing localized copy

For copy on an existing page:

1. Find the placeholder in the relevant root page or partial.
2. Update the same data key in both `uk.json` and `ru.json`.
3. Keep the JSON valid and preserve the existing object hierarchy.
4. Run `npm run pipesBuild` and inspect both generated language versions.

The header language files are separate because they contain shared navigation and header
content. Update both language files when changing shared localized UI text. Build metadata
such as canonical URLs, resource tags, and robots directives is generated from
`gulp/paths.js` and `gulp/settings.js`; it is not ordinary translated copy.

When adding a page, coordinate the source filename, page-key passed to its includes, both
language JSON objects, and the page lists/metadata configuration in `gulp/paths.js`. The
runtime navigation also has page keys and anchors in `src/js/partials/initialSelectors.js`.
Adding only an HTML file does not automatically add navigation, page metadata, or animations.

## 4. Reusable templates

Partials in `src/html/templates/` include the document head, headers, navigation lists, hero
content, benefits, services, partners, gallery, footer, and icon links. Root HTML pages
compose them with `@@include`; conditional partials can be guarded by language data, for
example the gallery partial is included only when the page has `main.gallery` data.

Edit a shared partial when its structure should change consistently across pages. Keep
page-specific text in JSON and avoid copying a whole shared partial into an individual page.
Changes to partials are detected by the nested HTML watch pattern and trigger HTML
recompilation.

## 5. Head metadata

`src/html/templates/head.html` renders the page title and description along with generated
robots and resource metadata. The metadata source lists are prepared in `gulp/paths.js`;
`gulp/utilFuncs.js` builds the language/page-specific tags. In particular:

- Stylesheets include inline critical CSS and a deferred common stylesheet.
- Scripts include the vendor and main bundles; GSAP is loaded dynamically instead.
- Canonical and alternate links are generated from configured language URLs.
- The canonical URL base is `https://roller-service.pages.dev/` in `gulp/settings.js`.
- The current robots value is `noindex, nofollow` in `gulp/paths.js`.

Review the canonical base and robots policy before deploying to a public production domain.

## 6. HTML image processing

HTML processing happens after images have been written to `dist/`. The custom image transform
checks standalone `<img>` tags outside an existing `<picture>` for a matching generated WebP
image and may wrap the tag with `<source>` elements. An explicit `<picture>` is left alone.
This is useful for responsive art direction such as the hero image, which supplies its own
media-specific sources.

Use the source image paths under `/assets/img/`; the generated `dist/` paths should not be
edited manually. Image format, `@2x` conventions, and gallery-specific thumbnail pairing are
covered in `docs/09-assets-and-optimization.md` and
`docs/08-gallery-and-image-viewer.md`.

## 7. Troubleshooting

- **A text placeholder is blank:** compare its exact key path to both language JSON files;
  verify the include passes the expected `page` value.
- **A block is missing:** inspect its `@@if` condition and the data object used by that page.
- **One language is missing:** check the configured language list and matching page/header
  JSON files.
- **Metadata is wrong:** inspect `gulp/paths.js`, `gulp/settings.js`, and the head template,
  rather than adding duplicate hard-coded tags.
- **A template change is not visible:** confirm the dev process is running, the include is
  under `src/html/`, and the HTML task finished successfully.
- **The generated image markup is unexpected:** check whether the source image is inside an
  explicit `<picture>`, and confirm the target WebP exists in the generated image folder
  before HTML compilation.
