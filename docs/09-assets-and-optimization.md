# Assets and Optimization

Static resources are authored under `src/assets/`. Gulp preserves their relative paths in
`dist/assets/`, except for monochrome and multicolor SVG icons, which are combined into
sprites. Production image processing is not a substitute for maintaining correct source
dimensions, names, and references.

## 1. Asset locations

| Resource | Source location | Build behavior |
|---|---|---|
| Page and section raster images | `src/assets/img/<section>/` | Copy; create WebP from JPEG/PNG; production optimization |
| Gallery originals | `src/assets/img/gallery/` | Copy and production optimization |
| Gallery thumbnails | `src/assets/img/gallery/thumbs/` | Copy and production optimization; same basename/extension as parent original |
| Monochrome icon source SVGs | `src/assets/img/svgIcons/mono/` | Excluded from ordinary image copy; combined to monochrome sprite |
| Multicolor icon source SVGs | `src/assets/img/svgIcons/multi/` | Excluded from ordinary image copy; combined to multicolor sprite |
| Other standalone SVG icons | `src/assets/img/svgIcons/` or other image folders | Copied; production SVG optimization |
| Fonts | `src/assets/fonts/<family>/` | Binary copied with directory layout preserved |
| Localization/data resources | `src/assets/data/` | Copied; page-version JSON is also read during HTML generation |
| Redirects and robots file | `src/_redirects`, `src/robots.txt` | Copied to the root of `dist/` |

The ordinary image input glob includes JPG/JPEG, PNG, SVG, GIF, WebP, AVIF, and ICO files
below `src/assets/img/`, excluding the two sprite input folders.

## 2. Image formats and optimization behavior

The custom converter creates WebP alternatives for JPEG/JPG and PNG inputs. It does not
convert every accepted source extension: GIF, SVG, WebP, AVIF, and ICO inputs pass through
that conversion step unchanged.

In production, the image optimizer handles JPEG, PNG, WebP, AVIF, and SVG. Raster images are
processed with Sharp; SVG files are processed with SVGO. The current optimizer does not
optimize GIF or ICO through those format handlers. Development copies originals and creates
JPEG/PNG WebP alternatives without running the production optimizer.

The source image is copied to its output path before conversion/optimization. Do not assume
the original format disappears just because a WebP alternative is generated. Review the
resulting `dist/assets/img/` tree when changing the pipeline or the source format.

Use WebP for the current project's raster content where suitable. Keep vector artwork as SVG
and icons in their intended standalone/sprite form. JPEG/PNG sources remain supported by the
conversion pipeline. Choose a format that preserves required transparency and visual quality;
check the optimized output rather than relying solely on a nominal quality value.

## 3. Responsive and retina assets

Use descriptive file names and keep the path in HTML/SCSS aligned with the source folder.
Existing conventions include section folders such as `heroSection`, `servicesSection`, and
`gallery`. Responsive hero imagery uses separate compositions and widths, selected by
`<picture><source media=...>`. Other images use responsive CSS layout or explicit `srcset`.

The HTML image transform recognizes the `@2x` retina suffix and looks for a companion
`<name>@2x.<format>` file. It can generate WebP `srcset` candidates and use JPEG/PNG variants
when corresponding files exist. The transform only rewrites eligible standalone `<img>` tags
outside an existing `<picture>`. Explicit art-direction `<picture>` markup remains under the
author's control.

For any responsive or retina set:

- Use the exact same basename and the `@2x` suffix before the extension.
- Keep each variant's intended dimensions and crop consistent.
- Reference the base asset correctly in the source markup.
- Rebuild and verify every generated `srcset` URL in the browser's network panel.

Do not rename files without updating markup and checking generated paths; missing variants
are not automatically discovered from arbitrary names.

## 4. SVG sprites

Place icons that should be in the monochrome sprite under `svgIcons/mono/`, and multicolor
icons under `svgIcons/multi/`. Sprite generation optimizes each input, assigns the filename
as the SVG symbol ID, and emits:

- `dist/assets/img/svgIcons/sprite.mono.svg`
- `dist/assets/img/svgIcons/sprite.multi.svg`

The monochrome optimization removes `fill` and `stroke` attributes as well as dimensions,
allowing presentation to be controlled by the consumer. The multicolor configuration retains
color information. Do not move an icon between these folders without checking its rendering
semantics; do not expect the individual source files in these folders to be copied as ordinary
assets.

Other SVGs outside these two directories remain individual files and are eligible for
production SVGO optimization. The optimizer preserves `viewBox` and IDs according to the
configured overrides; validate icons that rely on IDs, styling, or external references.

## 5. Fonts and static data

Font files with `.eot`, `.woff`, `.woff2`, `.ttf`, or `.otf` extensions are copied without
conversion. Keep family subdirectories and file names stable because SCSS font declarations
and preload metadata refer to those paths.

Files with JSON, PDF, or XML extensions under `src/assets/data/` are copied to
`dist/assets/data/`. The language page JSON is also consumed during the build to render
localized HTML; changing it affects both the generated pages and the copied data file.

## 6. Adding an asset safely

1. Choose the correct source folder and follow its naming convention.
2. Add required variants (responsive sizes, retina, gallery original/thumbnail, or sprite
   counterpart) with exact matching names where the feature relies on paired files.
3. Update source HTML/SCSS to reference the source URL under `/assets/...`, not `dist/`.
4. Preserve correct HTML `width` and `height` values and meaningful `alt` text.
5. Run `npm run pipesBuild` and check generated files and browser requests for 404s.

The gallery has additional strict pairing requirements; follow
`docs/08-gallery-and-image-viewer.md` before adding gallery images.

## 7. Troubleshooting

- **WebP is absent:** confirm the source is JPEG/JPG or PNG, the task completed, and the
  output path mirrors the source path.
- **HTML did not gain a WebP source:** check whether the `<img>` is already in a `<picture>`,
  whether the source uses an eligible extension, and whether the generated WebP existed
  before HTML compilation.
- **Retina source returns 404:** verify the exact `@2x` filename and extension and that its
  path is covered by the image input glob.
- **Sprite symbol is missing:** check the input directory, `.svg` extension, sprite task
  output, and symbol ID derived from the basename.
- **Font is missing:** inspect the copied path, extension, and matching `@font-face` or
  preload URL.
- **Optimized graphic changes appearance:** compare source and generated SVG/raster files and
  review SVGO/Sharp options in the custom module and `gulp/tasks.js`.
