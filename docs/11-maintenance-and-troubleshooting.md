# Maintenance and Troubleshooting

Make changes in source files and configuration, then verify the generated static site. The
build cleans generated directories before a full pipeline, so edits made only in `dist/` will
be lost.

## 1. Safe maintenance workflow

1. Check the worktree and identify the source/configuration files responsible for the
   behavior.
2. Use the Node.js version in `.nvmrc`; install dependencies with `npm ci` when needed.
3. Run `npm run dev` for iterative work, then inspect the terminal and browser.
4. Run `npm run pipesBuild` to validate production processing without BrowserSync.
5. Inspect both language outputs and check the affected resource paths in `dist/`.
6. Keep `package.json` and `package-lock.json` synchronized when changing dependencies.

## 2. Choose the right source

| Change | Edit |
|---|---|
| Localized page copy | `src/assets/data/pagesVersions/uk.json`, `ru.json` |
| Shared header/navigation copy | `src/assets/data/pagesVersions/header/uk.json`, `ru.json` |
| Page structure or shared HTML | `src/html/*.html` or `src/html/templates/*.html` |
| Responsive presentation | `src/scss/` and imported component SCSS |
| Common browser initialization | `src/js/index.js` |
| DOM helper or Masonry behavior | `src/js/helpers/funcsDOM.js` |
| Gallery modal behavior | `src/js/modulesPack/gallery-thumbs/` |
| GSAP parameters/selectors/builders | `src/js/partials/` |
| Paths, languages, metadata, or resource tags | `gulp/paths.js` and `gulp/settings.js` |
| Build pipeline behavior | `gulp/tasks.js` and `gulpfile.js` |
| Image conversion/optimization or SVG sprites | `modules/` and the associated Gulp task |
| Deployment redirects/robots | `src/_redirects`, `src/robots.txt`, and metadata source configuration |

## 3. Common build and preview problems

### Node version check fails

`dev`, `build`, `pipesDev`, and `pipesBuild` run `nodeCheck.js` before Gulp. Activate the exact
version from `.nvmrc` and verify with `node --version`; the check is exact, not a compatible
range check.

### Gulp cannot load a plugin or module

Confirm the required Node version, then run `npm ci`. Do not delete the lockfile or install
arbitrary versions as a first response. If dependency versions were intentionally changed,
review `package.json` and `package-lock.json` together.

### Build fails

Run `npm run pipesBuild` to remove BrowserSync from the diagnosis. Read the first Gulp, Sass,
Webpack, Sharp, or SVGO error and fix that source/configuration issue before interpreting
later stream errors.

### Browser content is stale

Check that `npm run dev` is still running, the edited path is covered by the watch globs in
`gulp/paths.js`, and its corresponding task completed successfully. A manual reload can
distinguish a BrowserSync refresh issue from a failed rebuild.

### HTML or localized copy is missing

Check include paths, `page` arguments, JSON keys, and both language data files. Run
`npm run pipesBuild` and inspect `dist/uk/` and `dist/ru/` rather than debugging only the
source template.

### Images are missing or rendered incorrectly

Confirm source URL, output path, and case-sensitive basename. The HTML image transform runs
after image processing and only uses WebP when the matching generated image exists. For
gallery images, check the exact thumbnail/original filename pair and correct intrinsic
dimensions.

### Styles or JavaScript do not update

Check the source entry imports and Gulp watch output. For SCSS, verify that the partial is
reachable from a root entry in `src/scss/`. For JavaScript, verify that the module is
reachable from `src/js/index.js`. Inspect generated `dist/css/` or `dist/js/` files and
browser network errors.

### GSAP or gallery behavior seems delayed

This may be intentional: GSAP starts on first scroll; the gallery initializes when it
approaches the viewport. Inspect the dynamic chunk or observer lifecycle and the corresponding
runtime errors before changing the deferral strategy.

## 4. Extending the site without breaking conventions

- Add a language page consistently: source page, matching keys in both language JSON files,
  `data-type`/navigation identifiers, metadata configuration, and any page-specific
  animation registration.
- Add images in the correct `src/assets/img/` family and update source references. Preserve
  responsive and `@2x` file naming.
- Add gallery images as matched full-size/`thumbs/` pairs and set accurate `width`/`height`.
- Add animation configuration to `animationParams.js`, then register it in the appropriate
  common/page-specific initializer.
- Add new SCSS through an existing root entry and reuse the responsive mixins.
- Treat any change to `gulp/paths.js` as a cross-cutting change: it affects copy globs,
  watchers, output paths, page metadata, or generated routes.

See `docs/03-gulp-build-system.md` for exact pipeline stages and package roles, and the
feature-specific guides for localization, styles, animations, galleries, and assets.

## 5. Final verification checklist

- The intended npm command finishes without Gulp task errors.
- Both `/uk/` and `/ru/` output trees contain expected pages.
- Generated HTML contains no unresolved include/data placeholders.
- Referenced CSS, JavaScript chunks, images, fonts, and sprites exist in `dist/`.
- The affected feature works at narrow and wide viewport sizes.
- Links, language switching, and optional components still work on pages where the component
  is absent.
- Deployment-sensitive metadata and redirect rules are intentional.
