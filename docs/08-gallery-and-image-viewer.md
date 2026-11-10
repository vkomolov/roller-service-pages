# Gallery and Image Viewer

The work gallery combines a custom JavaScript Masonry layout with a separate modal viewer.
It is initialized near the viewport, so gallery images and markup must follow the URL and
dimension conventions described below.

## 1. Components and initialization

- Gallery markup is in `src/html/templates/gallery-section.html`.
- The container selector is `#gallery-work`; items use `.gallery__item`.
- Masonry calculation and image validation are in `src/js/helpers/funcsDOM.js`.
- Masonry settings and lazy initialization margin are in
  `src/js/partials/initialSelectors.js`.
- The image viewer is `src/js/modulesPack/gallery-thumbs/index.js`.
- Viewer-specific configuration is also in `initialSelectors.js`; its styles are in
  `src/js/modulesPack/gallery-thumbs/scss/gallery-thumbs.scss`.

On DOM ready, `index.js` observes the gallery with an IntersectionObserver using a
`200px 0px` root margin. When the gallery approaches the viewport, the same callback starts
Masonry and the modal viewer independently. Masonry lays out items immediately and observes
container width changes for recalculation. It reveals validated items by adding the
`image-loaded` class; CSS handles the opacity/scale transition.

## 2. Required image directory and name pairing

The current image viewer is configured with the `thumbs` folder name. Store full-size gallery
images in:

```text
src/assets/img/gallery/
```

Store each gallery thumbnail in:

```text
src/assets/img/gallery/thumbs/
```

The thumbnail and full-size image **must have the same file name and extension**, and the
thumbnail folder must be a child of the full-size image folder. For example:

```text
src/assets/img/gallery/electric-gate_1.webp
src/assets/img/gallery/thumbs/electric-gate_1.webp
```

The viewer derives the large-image URL by replacing the `thumbs` path segment with the
parent image path. If the large image cannot be loaded, it falls back to the thumbnail.
Renaming only one side, changing the folder name without changing the configured
`galleryThumbsFolderName`, or placing the original in another directory breaks that lookup.

## 3. Add an image to the gallery

1. Create a full-size image and a proportionally matching thumbnail in the paired locations
   above. Follow the existing descriptive, lowercase, hyphen-separated names with a numbered
   suffix for a series, such as `roller-shutters-installation_8.webp`.
2. Add an item to `gallery-section.html` with the thumbnail URL, a meaningful `alt`, and
   accurate `width` and `height` values for the thumbnail.
3. Keep the wrapper class `.gallery__item` and the image inside the `#gallery-work`
   container.
4. Verify that both files resolve in `dist/assets/img/gallery/` and
   `dist/assets/img/gallery/thumbs/`.
5. Test Masonry layout, opening the image, previous/next navigation, and the viewer's large
   image. Test on a page where the gallery exists and confirm pages without the gallery still
   initialize normally.

The viewer collects `<picture>` items and standalone `<img>` items, avoiding duplicate
collection of an image inside `<picture>`. Either markup type can be used, but the selected
thumbnail URL must still obey the `thumbs` path convention.

## 4. Dimensions, layout, and accessibility

Correct `width` and `height` attributes are required for Masonry to reserve the image's
aspect ratio before loading and calculate its item geometry. They should describe the
thumbnail's actual ratio; do not copy dimensions from another image with a different crop.
Current gallery thumbnails are generally 480 pixels wide, but the critical requirement is
correct intrinsic ratio and consistency with the actual file.

The layout uses `.gallery__item` widths and a configured `gap` of 16 pixels. Masonry validates
image geometry and listens for gallery width changes. Avoid applying fixed heights or
unmatched transforms to gallery items that would invalidate the measured geometry.

Provide meaningful `alt` text. It is displayed in the modal counter when present. The viewer
supports previous/next controls, keyboard navigation, touch swipe navigation via TouchSweep,
and a fallback to the thumbnail when the large image fails. The modal limits its image to
1290 × 720 pixels and the available viewport while preserving aspect ratio; it does not
enlarge beyond the image's natural size.

## 5. Supported image formats and optimization

WebP is used by the current gallery assets. The build also copies source image formats and
optimizes supported raster/vector formats as described in
`docs/09-assets-and-optimization.md`. Keep the thumbnail and original format paired exactly:
the viewer's path substitution changes the directory segment, not the extension or basename.

## 6. Troubleshooting

- **Modal opens the thumbnail instead of the large image:** verify the matching full-size
  file exists at the parent path with the identical name and extension.
- **Modal reports a failed image:** inspect the thumbnail URL, derived parent URL, and
  server response; verify that both generated files exist.
- **A thumbnail is distorted or Masonry spacing is wrong:** correct its HTML intrinsic
  dimensions and confirm the thumbnail itself has the expected aspect ratio.
- **An image is not clickable:** check that it is inside `#gallery-work` and is a `picture`
  or standalone `img`.
- **The gallery initializes too late or is never observed:** confirm the container selector
  and that the observer can reach it; initialization occurs shortly before it enters view.
- **Masonry changes after resizing:** this is expected; inspect the ResizeObserver-driven
  recalculation and the actual container width.
