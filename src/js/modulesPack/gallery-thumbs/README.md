# Gallery Thumbs

## Overview

`gallery-thumbs` is a JavaScript module that adds an interactive image viewer to a masonry gallery. It allows users to open an image in a separate modal window and browse through enlarged versions of the images displayed as thumbnails in the gallery.

The module supports images defined using either `<picture>` elements or standalone `<img>` elements. It can be initialized for a specific gallery container using the `initThumbs()` function.

When a user clicks a gallery image, a modal window opens with the corresponding image. The modal provides navigation controls and supports keyboard navigation and touch gestures on mobile devices.

The module supports the following features:

- Opens an image in a modal viewer without navigating away from the current page.
- Displays an enlarged version of the selected gallery image when the corresponding high-resolution file is available.
- Provides previous/next navigation controls.
- Supports keyboard navigation and touch gestures.
- Displays the current image position and its alternative text.
- Automatically scales images to fit within the available modal viewport while preserving their aspect ratio.
- Falls back to the thumbnail image if the corresponding high-resolution image cannot be loaded.

## Image File Structure

Each gallery image can have two versions:

- **Thumbnail:** a reduced-size image used in the masonry gallery.
- **High-resolution image:** the original or larger image displayed in the modal viewer.

The thumbnail files must be stored in a `thumbs/` subdirectory relative to the directory containing the corresponding high-resolution images.

For example:

```text
images/
├── photo-01.webp
├── photo-02.webp
└── thumbs/
    ├── photo-01.webp
    └── photo-02.webp
```

The thumbnail and high-resolution versions must have matching filenames.

When the modal opens, the module derives the high-resolution image path by removing the `thumbs/` directory segment from the selected thumbnail's URL.

If the high-resolution image cannot be loaded, the module uses the thumbnail as a fallback.

## Initialization

### 1. Include the styles

Import the module's SCSS file into the project's root SCSS file or another stylesheet entry point:

```scss
@use "./path/gallery-thumbs/gallery-thumbs";
```

Adjust the path to match your project structure.

### 2. Import the initialization function

Import `initThumbs` into the JavaScript module responsible for initializing the gallery:

```js
import { initThumbs } from "./path/gallery-thumbs/index.js";
```

### 3. Initialize the gallery

Pass a CSS selector identifying the gallery container:

```js
initThumbs("#gallery-work");
```

The container must exist in the DOM when `initThumbs()` is called.

The function initializes the modal viewer for the images found inside the specified container. The masonry layout itself is managed separately; `gallery-thumbs` adds the image-viewing functionality to the existing gallery.

The `initThumbs()` function also accepts an optional `thumbsFolder` argument for specifying the thumbnail directory name. The default value is `"thumbs"`.

For example:

```js
initThumbs("#gallery-work", "thumbs");
```

## Modal Viewer

### Opening an image

Clicking a thumbnail opens a separate modal window containing the corresponding image.

The viewer attempts to load the high-resolution version of the image. If loading fails, it falls back to the thumbnail.

### Navigation

Users can navigate between images using:

- The previous and next controls in the modal.
- The supported keyboard controls.
- Touch gestures on touch-enabled devices.

The modal displays the current image position and the image's alternative text where available.

### Image sizing

Images are scaled proportionally to fit within the available modal viewport. Their aspect ratio is preserved, and images are not enlarged beyond their natural dimensions.

The modal's maximum dimensions are controlled by the module's configuration constants:

- Maximum width: `1290px`.
- Maximum height: `720px`.

The actual displayed dimensions depend on the image's natural dimensions and the available viewport space.

## Notes and Requirements

- Each thumbnail should have a corresponding high-resolution image with the same filename in the parent directory.
- The `thumbs/` directory must be nested inside the directory containing the corresponding high-resolution images.
- The directory name must match the `thumbsFolder` argument passed to `initThumbs()`.
- If a high-resolution image is unavailable or fails to load, the module attempts to display the thumbnail instead.
- The gallery container must be present in the DOM before initialization.
- The masonry layout and the modal image viewer are separate concerns: the gallery layout is provided by the project's masonry implementation, while `gallery-thumbs` handles image selection, modal display, and navigation.
