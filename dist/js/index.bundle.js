/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/helpers/funcsDOM.js":
/*!************************************!*\
  !*** ./src/js/helpers/funcsDOM.js ***!
  \************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   activateNavLink: function() { return /* binding */ activateNavLink; },
/* harmony export */   attachModalListeners: function() { return /* binding */ attachModalListeners; },
/* harmony export */   calculateNavIndex: function() { return /* binding */ calculateNavIndex; },
/* harmony export */   cleanupModal: function() { return /* binding */ cleanupModal; },
/* harmony export */   createElementWithClass: function() { return /* binding */ createElementWithClass; },
/* harmony export */   createMasonry: function() { return /* binding */ createMasonry; },
/* harmony export */   createModalHandlers: function() { return /* binding */ createModalHandlers; },
/* harmony export */   createModalState: function() { return /* binding */ createModalState; },
/* harmony export */   detachModalListeners: function() { return /* binding */ detachModalListeners; },
/* harmony export */   getImagesLoaded: function() { return /* binding */ getImagesLoaded; },
/* harmony export */   getSelectorName: function() { return /* binding */ getSelectorName; },
/* harmony export */   initLangSwitcher: function() { return /* binding */ initLangSwitcher; },
/* harmony export */   initLockScroll: function() { return /* binding */ initLockScroll; },
/* harmony export */   isStyleSupported: function() { return /* binding */ isStyleSupported; },
/* harmony export */   lockedEventListener: function() { return /* binding */ lockedEventListener; },
/* harmony export */   migrateElement: function() { return /* binding */ migrateElement; },
/* harmony export */   observeIntersection: function() { return /* binding */ observeIntersection; },
/* harmony export */   replaceFilePath: function() { return /* binding */ replaceFilePath; },
/* harmony export */   setAttributes: function() { return /* binding */ setAttributes; },
/* harmony export */   toggleClassOnIntersection: function() { return /* binding */ toggleClassOnIntersection; }
/* harmony export */ });
/* harmony import */ var imagesloaded__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! imagesloaded */ "./node_modules/imagesloaded/imagesloaded.js");




/**
 * It checks whether the given style rule is supported for the given HTML Element
 * @param {HTMLElement} element - target HTML Element
 * @param {string} param - css rule
 * @param {string} value - the value of the css rule
 * @return {boolean}
 */
function isStyleSupported(element, param, value) {
  return param in element.style && CSS.supports(param, value);
}

/**
 * it migrates the given HTML Element to another HTML parent
 * @param {HTMLElement} target - the target HTML Element
 * @param {HTMLElement} parentFrom - the current HTML parent
 * @param {HTMLElement} parentTo - the target HTML parent to migrate to
 */
function migrateElement({
  target,
  parentFrom,
  parentTo
}) {
  if (target.isConnected) {
    (target.parentElement === parentFrom ? parentTo : parentFrom).appendChild(target);
  } else {
    console.warn(`transitBox: target in not in DOM: ${target}`);
  }
}

/**
 * It creates a debounced event listener that ensures the provided callback is called
 * only after a specified delay, regardless of how frequently the event is triggered.
 *
 * @param {string} event - The name of the event to listen for (e.g., "click", "scroll").
 * @param {HTMLElement|Window|Document} listenerOwner - The target element, window, or document
 *   that will receive the event listener.
 * @param {number} [delay=300] - The delay in milliseconds before the callback is executed
 *   after the event is triggered. Defaults to 300ms.
 * @returns {Function} A function that accepts a callback (`cb`) and optional parameters (`params`).
 *   This function attaches the event listener with debouncing behavior. The returned function
 *   also returns another function for removing the event listener.
 *
 * @example
 * const removeClickListener = lockedEventListener("click", document.body, 500)(
 *   () => console.log("Click event triggered!"),
 *   []
 * );
 *
 * // To remove the listener:
 * removeClickListener();
 */
function lockedEventListener(event, listenerOwner, delay = 300) {
  if (listenerOwner instanceof HTMLElement && !listenerOwner.isConnected) {
    throw new Error('Provided listenerOwner at lockedEventListener() is not a valid DOM element...');
  }
  let isLocked = false;
  return (cb, params = []) => {
    const handler = () => {
      if (!isLocked) {
        isLocked = true;
        setTimeout(() => {
          cb(...params);
          isLocked = false;
        }, delay);
      }
    };
    listenerOwner.addEventListener(event, handler);
    return () => {
      listenerOwner.removeEventListener(event, handler);
    };
  };
}

/**
 * Toggles a CSS class on a target element when a trigger element
 * crosses the top boundary of the viewport.
 *
 * Uses IntersectionObserver instead of scroll listeners,
 * which improves performance and avoids unnecessary scroll handling.
 *
 * @param {HTMLElement} targetElement - The element whose class will be toggled.
 * @param {HTMLElement} triggerElement - The element that triggers the class change.
 * @param {string} activeClass - The CSS class to add/remove.
 * @param {Element|null} [root=null] - The scrolling container. Default is the viewport.
 * @param {string} [rootMargin="-1px 0px 0px 0px"] - Margin around the root to fine-tune trigger timing.
 *
 * @returns {Function} Cleanup function that disconnects the observer.
 */
function toggleClassOnIntersection(targetElement, triggerElement, activeClass, root = null, rootMargin = '-1px 0px 0px 0px') {
  if (!targetElement?.isConnected || !triggerElement?.isConnected) {
    throw new Error('[toggleClassOnIntersection]: targetElement or triggerElement is not connected to the DOM.');
  }
  let isClassActive = false;
  const observer = new IntersectionObserver(([entry]) => {
    const shouldActivate = entry.boundingClientRect.top <= 0 && !entry.isIntersecting;
    if (shouldActivate && !isClassActive) {
      requestAnimationFrame(() => {
        targetElement.classList.add(activeClass);
        isClassActive = true;
      });
    }
    if (!shouldActivate && isClassActive) {
      requestAnimationFrame(() => {
        targetElement.classList.remove(activeClass);
        isClassActive = false;
      });
    }
  }, {
    root,
    threshold: 0,
    rootMargin
  });
  observer.observe(triggerElement);
  return () => observer.disconnect();
}

/**
 * Observes visibility changes of a DOM element using IntersectionObserver.
 *
 * Provides convenient callbacks for when an element enters or leaves
 * the viewport (or a custom scroll container).
 *
 * This utility simplifies common IntersectionObserver patterns such as:
 * - reveal-on-scroll animations
 * - lazy loading
 * - sticky headers
 * - infinite scrolling triggers
 *
 * @param {HTMLElement} targetElement - The element to observe.
 * @param {Object} [options]
 * @param {Element|null} [options.root=null] - The scroll container used as the viewport.
 * @param {string} [options.rootMargin="0px"] - Margin around the root to expand or shrink the observation area.
 * @param {number|number[]} [options.threshold=0] - Intersection ratio(s) that trigger the observer callback.
 * @param {(entry: IntersectionObserverEntry) => void} [options.onEnter] - Called when the element enters the viewport.
 * @param {(entry: IntersectionObserverEntry) => void} [options.onLeave] - Called when the element leaves the viewport.
 * @param {(entry: IntersectionObserverEntry) => void} [options.onChange] - Called whenever intersection state changes.
 * @param {boolean} [options.once=false] - If true, observer disconnects after the first enter event.
 *
 * @returns {Function} Cleanup function that disconnects the observer.
 *
 * @example
 * observeIntersection(document.querySelector(".card"), {
 *   onEnter: () => console.log("Card visible"),
 *   onLeave: () => console.log("Card hidden")
 * });
 */
function observeIntersection(targetElement, options = {}) {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    onEnter,
    onLeave,
    onChange,
    once = false
  } = options;
  if (!targetElement?.isConnected) {
    throw new Error('[observeIntersection]: targetElement is not connected to the DOM.');
  }
  let wasIntersecting = false;
  const observer = new IntersectionObserver(([entry]) => {
    const isIntersecting = entry.isIntersecting;

    // Trigger generic change callback
    onChange?.(entry);

    // Element entered viewport
    if (isIntersecting && !wasIntersecting) {
      onEnter?.(entry);
      if (once) {
        observer.disconnect();
        return;
      }
    }

    // Element left viewport
    if (!isIntersecting && wasIntersecting) {
      onLeave?.(entry);
    }
    wasIntersecting = isIntersecting;
  }, {
    root,
    rootMargin,
    threshold
  });
  observer.observe(targetElement);

  // Return cleanup function
  return () => observer.disconnect();
}

/**
 *  It sets attributes to HTMLElement instances
 * @param {[Element]} [elements=[]] the list of HTMLElements to be set with the attributes
 * @param {Object} [targetAttr={}] consists of the keys as the attributes and the values
 * @returns {void}
 */
function setAttributes(elements = [], targetAttr = {}) {
  elements.forEach((element, i) => {
    if (!(element instanceof HTMLElement)) {
      throw new Error(`one of the elements at index ${i} is not the instance of HTMLElement...`);
    }
    Object.entries(targetAttr).forEach(([attr, value]) => {
      element.setAttribute(attr, value !== null && value !== undefined ? value.toString() : '');
    });
  });
}

/**
 * It creates a scroll lock controller with encapsulated state
 * @description When the scroll container switches to overflow: hidden, the function replaces
 * the width of the hidden scrollbar with the same width of the right padding
 * to avoid shifting elements on the page.
 *
 * @returns {{ lockScroll: function(): void, destroy: function(): void }}
 *
 * @sample
 * const scrollLocker = initLockScroll();
 * scrollLocker.lockScroll(true); //locking scrolling
 * scrollLocker.lockScroll(false); //unlocking scrolling
 * scrollLocker.destroy() //resetting scroll controller
 */
function initLockScroll() {
  // Encapsulated state - not accessible from outside
  const state = {
    /** @type {number|null} */
    rafId: null,
    /** @type {boolean} */
    isLocked: false,
    /** @type {string} */
    originalPaddingRight: '',
    /** @type {number} */
    scrollbarWidth: 0,
    /** @type {boolean} */
    isInitialized: false
  };

  /**
   * Calculates scrollbar width once and caches it
   * @returns {number}
   */
  const getScrollbarWidth = () => {
    if (!state.scrollbarWidth) {
      state.scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    }
    return state.scrollbarWidth;
  };

  /**
   * Applies scroll lock styles
   */
  const applyLock = () => {
    const scrollbarWidth = getScrollbarWidth();

    // Save original padding only on first lock
    if (!state.isInitialized) {
      state.originalPaddingRight = document.body.style.paddingRight;
      state.isInitialized = true;
    }
    document.body.style.overflow = 'hidden';

    // Apply padding compensation only if scrollbar was visible
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    state.rafId = null;
  };

  /**
   * Removes scroll lock styles
   */
  const applyUnlock = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = state.originalPaddingRight;
    state.rafId = null;
  };

  /**
   * Locks or unlocks page scroll with scrollbar width compensation
   * @param {boolean} [lock=true] - true to lock, false to unlock
   */
  const lockScroll = (lock = true) => {
    // Early return if state hasn't changed
    if (state.isLocked === lock) return;

    // Cancel pending animation frame to prevent race conditions
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
    }
    state.isLocked = lock;
    state.rafId = requestAnimationFrame(lock ? applyLock : applyUnlock);
  };
  return {
    lockScroll,
    /**
     * reset capability (when unmounting a component)
     */
    destroy() {
      if (state.rafId !== null) cancelAnimationFrame(state.rafId);
      if (state.isLocked) applyUnlock();
      state.isInitialized = false;
      state.scrollbarWidth = 0;
    }
  };
}

//// getImagesLoaded SECTION ////
/**
 * @typedef {Object} ImageSize
 * @property {number} naturalWidth - Original image width in pixels
 * @property {number} naturalHeight - Original image height in pixels
 * @property {number} offsetWidth - Rendered width including padding/borders
 * @property {number} offsetHeight - Rendered height including padding/borders
 */

/**
 * @typedef {Object} LoadedImageResult
 * @property {HTMLElement} element - The parent element containing the image
 * @property {ImageSize} size - Dimension information
 */

/**
 * Validates that container is attached to DOM
 * @param {HTMLElement} container - Element to validate
 * @throws {Error} If container is not connected to DOM
 */
function validateContainer(container) {
  if (!container?.isConnected) {
    throw new Error('[getImagesLoaded]: Container must be a DOM element connected to the document');
  }
}

/**
 * Builds a mapping between image elements and their parent containers
 * Handles both <img> tags and background images
 *
 * @param {HTMLElement} container - The container which contains the images or image wrappers
 * @param {Object} options - imagesLoaded options
 * @returns {Map<HTMLImageElement, HTMLElement>} Map of image -> parent
 */
function buildImageParentMap(container, options) {
  const map = new Map();
  const {
    background
  } = options;
  for (const child of Array.from(container.children)) {
    // Priority 1: Direct img child (most common case)
    if (child.matches('img')) {
      map.set(child, child);
      continue;
    }
    // Priority 2: Wrapper with nested img
    const nestedImg = child.querySelector('img');
    if (nestedImg) {
      map.set(nestedImg, child);
      continue;
    }
    // Priority 3: Background images (only if no regular img found)
    if (!background) continue;

    /**
     * truthy background: boolean true, or string selector ('.image', '.bg', [data-bg], etc...)
     * option from the imagesLoaded library:
     * if hasBackground is true, then any child is considered a background image container
     * @sample
     * options = {
     *   background: '.grid-item' // or true
     * }
     */
    const hasBackground = background === true || child.matches(background);
    if (hasBackground) {
      map.set(child, child);
    }
  }
  return map;
}

/**
 * Extracts dimension information from a loaded image
 * @param {HTMLImageElement} img - The image element
 * @returns {ImageSize} Dimension data object
 */
function extractDimensions(img) {
  return {
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    offsetWidth: img.offsetWidth,
    offsetHeight: img.offsetHeight
  };
}

/**
 * Waits for image dimensions to be available
 * Handles cached images that already have dimensions
 *
 * @param {HTMLImageElement} img - Image to check
 * @returns {Promise<ImageSize|null>} Resolves with dimensions or null on error
 */
function getImageDimensions(img) {
  return new Promise(resolve => {
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      resolve(extractDimensions(img));
      return;
    }
    const cleanup = () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
    const handleLoad = () => {
      cleanup();
      resolve(extractDimensions(img));
    };
    const handleError = () => {
      cleanup();
      console.warn(`[getImageDimensions]: could not load the image with src: ${img.src}`);
      resolve(null);
    };
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
  });
}

/**
 * Removes broken images and their parent elements from DOM
 * @param {Array<{src: string, element: HTMLElement}>} brokenImages - Array of broken image data
 */
function removeBrokenImages(brokenImages) {
  if (brokenImages.length === 0) return;
  console.warn(`[getImagesLoaded] Removed ${brokenImages.length} broken image(s):`, brokenImages.map(b => b.src));
  brokenImages.forEach(({
    element
  }) => {
    if (element?.isConnected) {
      element.remove();
    }
  });
}

/**
 * Processes imagesLoaded instance results
 * Separates broken and loaded images, collects dimensions
 *
 * @param {Object} instance - imagesLoaded instance
 * @param {Map<HTMLImageElement, HTMLElement>} parentMap - Mapping of images to parents
 * @returns {Promise<Array<LoadedImageResult>>} Processed image results
 */
async function processImageResults(instance, parentMap) {
  const loadedPromises = [];
  const brokenImages = [];
  instance.images.forEach(item => {
    const img = item.img;
    const parentElement = parentMap.get(img);
    if (!item.isLoaded) {
      brokenImages.push({
        src: img.src || img.currentSrc || 'unknown',
        element: parentElement
      });
    } else {
      loadedPromises.push(getImageDimensions(img).then(size => ({
        element: parentElement,
        size
      })));
    }
  });
  removeBrokenImages(brokenImages);
  const results = await Promise.all(loadedPromises);
  return results.filter(r => r.size !== null);
}

/**
 * Waits for all images within a container to finish loading.
 * Collects dimensions of successfully loaded images and removes broken images.
 *
 * @param {HTMLElement} container - The DOM element containing images to be processed.
 * @param {Object} [options={}] - Configuration options passed to imagesLoaded library.
 * @param {boolean|string} [options.background] - Background image detection strategy:
 *   - `true`: Detect background images on all elements
 *   - `string` (CSS selector): Detect background images only on matching elements
 * @returns {Promise<Array<LoadedImageResult>>} Resolves with loaded image data
 * @throws {Error} When container is invalid or processing fails
 */
async function getImagesLoaded(container, options = {}) {
  // Validate container
  validateContainer(container);

  // Return a promise that resolves when imagesLoaded completes
  return new Promise((resolve, reject) => {
    try {
      imagesloaded__WEBPACK_IMPORTED_MODULE_0__(container, options, async instance => {
        try {
          const parentMap = buildImageParentMap(container, options);
          const results = await processImageResults(instance, parentMap);
          resolve(results);
        } catch (error) {
          reject(new Error(`[getImagesLoaded] Processing error: ${error.message}`));
        }
      });
    } catch (error) {
      reject(new Error(`[getImagesLoaded] Initialization error: ${error.message}`));
    }
  });
}

/**
 * Initializes a masonry grid layout for the specified container, positioning its child image elements.
 * The function calculates the number of columns based on the container's width and the image item's width,
 * and positions the images in a masonry style with specified gaps between them.
 * If a free space in a row exists then it places the columns in the center position...
 *
 * @async
 * @function createMasonry
 * @param {string} containerSelector - The CSS selector of the container element where the masonry grid will be applied.
 * @param {Object} [params={}] - Optional configuration parameters for masonry initialization.
 * @param {number} [params.gap=0] - The gap (in pixels) between the items in the masonry grid. Defaults to 0.
 *
 * @returns {Promise<HTMLElement[]>} - A promise that resolves to an array of positioned image elements.
 *
 * @throws {Error} - If the specified container is not found in the DOM or if there is an issue with loading the images.
 *
 * @example
 * // Initialize masonry grid with a 20px gap
 * createMasonry('#gallery', { gap: 20 }).then((imageItems) => {
 *   console.log('Masonry initialized and images positioned:', imageItems);
 * });
 */
async function createMasonry(containerSelector, params = {}) {
  const options = {
    gap: 0,
    ...params
  };
  try {
    const container = document.querySelector(containerSelector);
    if (!container?.isConnected) {
      throw new Error(`[createMasonry]: Container with selector "${containerSelector}" not found in DOM`);
    }

    // Get loaded images data
    const imagesArr = await getImagesLoaded(container);

    // Validate that we have images
    if (!Array.isArray(imagesArr) || imagesArr.length === 0) {
      throw new Error(`[createMasonry]: No images found in container "${containerSelector}"`);
    }

    // Validate first image data structure and get dimensions
    const firstImage = imagesArr[0];
    if (!firstImage?.element || !firstImage?.size) {
      throw new Error('[createMasonry]: Invalid image data structure returned from getImagesLoaded');
    }
    const itemWidth = firstImage.size.offsetWidth;
    const containerWidth = container.clientWidth;

    // Validate dimensions
    if (!itemWidth || itemWidth === 0) {
      throw new Error('[createMasonry]: Image width is zero or undefined');
    }
    const {
      gap
    } = options;
    const {
      columns,
      freeWidth
    } = getColumnsNumber(containerWidth, itemWidth, gap);
    const leftOffset = freeWidth / 2;

    // Set container styles
    container.style.position = 'relative';
    container.style.overflowX = 'hidden';

    // Initialize position arrays
    const posLeftArr = Array.from({
      length: columns
    }, (_, i) => leftOffset + i * (itemWidth + gap));
    const posTopArr = new Array(columns).fill(0);
    const imageItems = [];

    // Position each image
    for (let i = 0; i < imagesArr.length; i++) {
      const imageData = imagesArr[i];

      // Validate image data
      if (!imageData?.element || !imageData?.size) {
        console.warn(`[createMasonry]: Skipping invalid image at index ${i}`);
        continue;
      }
      const item = imageData.element;
      const itemHeight = imageData.size.offsetHeight;

      // Find column with minimum height
      const minHeight = Math.min(...posTopArr);
      const minColumnIndex = posTopArr.indexOf(minHeight);
      if (minColumnIndex === -1) {
        throw new Error('[createMasonry]: Failed to find valid column index');
      }

      // Apply positioning
      item.style.position = 'absolute';
      item.style.top = `${Math.round(posTopArr[minColumnIndex])}px`;
      item.style.left = `${Math.round(posLeftArr[minColumnIndex])}px`;

      // Update column height
      posTopArr[minColumnIndex] += itemHeight + gap;
      imageItems.push(item);
    }
    return imageItems;
  } catch (error) {
    console.error('[createMasonry]:', error.message);
    throw error; // Re-throw to allow caller to handle it
  }
}

/**
 * Calculates the number of columns and free space for masonry layout
 * @param {number} containerWidth - Width of the container
 * @param {number} itemWidth - Width of a single item
 * @param {number} gap - Gap between items
 * @returns {{columns: number, freeWidth: number}} Column count and remaining space
 */
function getColumnsNumber(containerWidth, itemWidth, gap) {
  const itemGapWidth = itemWidth + gap;
  const maxColumns = Math.floor(containerWidth / itemGapWidth);
  const usedWidth = maxColumns * itemGapWidth;
  const remainingSpace = containerWidth - usedWidth;
  const columns = remainingSpace >= itemWidth ? maxColumns + 1 : maxColumns;
  const freeWidth = containerWidth - (columns * itemWidth + (columns - 1) * gap);
  return {
    columns,
    freeWidth
  };
}

/**
 * Activates the navigation link based on the specified conditions.
 * Adds an `activeClass` to the matching navigation items and sets the `href` attribute to the provided `anchorLink`.
 *
 * @param {string} navLinkSelector - The CSS selector to find the navigation link items.
 * @param {string} pageType - The type of the page to match with the pagesVersions attribute of the navigation items.
 * @param {string} activeClass - The class name to add to the matched navigation link items.
 * @param {string} anchorLink - The URL to set as the `href` attribute for the matched navigation items.
 *
 * @returns {void} This function does not return any value.
 *
 * @example
 * // Example usage:
 * activateNavLink('.nav-link', 'home', 'active', '#homeAnchor');
 */
function activateNavLink(navLinkSelector, pageType, activeClass, anchorLink) {
  // Check if all necessary arguments are provided, otherwise, log a warning.
  if (!navLinkSelector || !pageType || !activeClass || !anchorLink) {
    console.warn('at activateNavLink: no given all arguments');
    return;
  }

  // Get all navigation link items using the provided selector.
  const navLinkItems = Array.from(document.querySelectorAll(navLinkSelector));

  // If no matching navigation items are found, log a warning and exit.
  if (!navLinkItems.length) {
    console.warn(`at activateNavLink: the nav link items with selector: ${navLinkSelector} are not found in the page...`);
    return;
  }

  // Iterate over each navigation item to check if its pagesVersions-type matches the provided pageType.
  for (const navItem of navLinkItems) {
    // If the page type matches, add the active class and update the href attribute.
    if (navItem?.dataset?.type === pageType) {
      navItem.classList.add(activeClass);
      navItem.setAttribute('href', anchorLink);
    }
  }
}

/**
 * Initializes a language switcher component.
 * @param {Object} params - Configuration object.
 * @param {string} [params.langSwitcherSelector="#lang-switcher"] - Selector for the root container.
 * @param {string} [params.iconLangSelector=".lang-switcher__lang-icon"] - Selector for language icons.
 * @param {string} [params.langActiveSelector=".active"] - Selector for active language element.
 * @param {string} [params.langListSelector="#listbox"] - Selector for options container.
 * @param {string[]} [params.langOptionArr=["ua","ru"]] - Supported language codes.
 * @param {string} [params.dataSetParam="lang"] - Dataset parameter name.
 * @returns {void} Returns early if any critical elements are missing.
 */
function initLangSwitcher(params = {}) {
  const {
    langSwitcherSelector = '#lang-switcher',
    iconLangSelector = '.lang-switcher__lang-icon',
    langActiveSelector = '.active',
    langListSelector = '#listbox',
    langOptionArr = ['uk', 'ru'],
    dataSetParam = 'lang'
  } = params;

  /**
   *
   * @param {string} selector
   * @param {string} addition
   */
  const notFoundError = (selector, addition = '') => {
    console.error(`at initLangSwitcher: the given selector: ${selector} is not found in DOM`, addition);
  };
  const url = window.location.href;
  const langSwitcher = document.querySelector(langSwitcherSelector);
  if (!langSwitcher) {
    notFoundError(langSwitcherSelector);
    return;
  }
  const langActiveElement = langSwitcher.querySelector(`${iconLangSelector}${langActiveSelector}`);
  const langActive = langActiveElement?.dataset[dataSetParam];
  if (!langActive) {
    notFoundError(`${iconLangSelector}${langActiveSelector}`, `or data-${dataSetParam} has no value...`);
    return;
  }
  if (!Array.isArray(langOptionArr) || !langOptionArr.length) {
    console.error(`at initLangSwitcher: the given array of language versions is not Array or empty: ${langOptionArr}`);
    return;
  }
  const langVerArr = langOptionArr.filter(lang => lang !== langActive);
  const langList = langSwitcher.querySelector(langListSelector);
  if (!langList) {
    notFoundError(langListSelector);
    return;
  }
  const optionListElems = langVerArr.map(langVer => {
    const listElem = document.createElement('li');
    listElem.classList.add(getSelectorName(iconLangSelector));
    listElem.setAttribute('role', 'option');
    listElem.setAttribute(`data-${dataSetParam}`, langVer);
    const spanElem = document.createElement('span');
    spanElem.textContent = langVer;
    listElem.appendChild(spanElem);
    return listElem;
  });
  langList.append(...optionListElems);
  const handleClick = ({
    target
  }) => {
    const clickedLang = target.closest(iconLangSelector).dataset[dataSetParam];
    window.location.replace(url.replace(`/${langActive}/`, `/${clickedLang}/`));
  };
  langList.addEventListener('click', handleClick);
}

/**
 * Removes the "." and "#" characters from the beginning of the selector and returns its name.
 * @param {string} selector - Selector (example: ".class", "#id", "tag").
 * @returns {string} Selector name without symbols "." и "#".
 */
function getSelectorName(selector) {
  // Regular expression for ".selector", "#selector", "selector"
  const regex = /^[.#]?([\w-]+)$/;
  const match = selector.match(regex);
  return match ? match[1] : selector; // If not matched, return original selector
}

/**
 * Creates a new HTML element with specified tag and adds the provided CSS classes to it.
 *
 * @param {string} tag - The tag name of the element to create (e.g., 'div', 'span', 'p').
 * @param {...string} classNames - One or more class names to be added to the newly created element.
 * @returns {HTMLElement} The newly created HTML element with the specified tag and classes.
 *
 * @example
 * const div = createElementWithClass('div', 'container', 'main');
 * console.log(div); // <div class="container main"></div>
 */
function createElementWithClass(tag, ...classNames) {
  const element = document.createElement(tag);
  element.classList.add(...classNames);
  return element;
}

/**
 * Replaces the file path of the given URL with a new base path.
 *
 * @param {string} url - The original URL (either `src` or `srcset`) with the file.
 * @param {string} targetFolder - the part of the path (folder) to remove from the path...
 * @returns {string} The updated URL with the new base path to the given file.
 */
function replaceFilePath(url, targetFolder) {
  //to clean from symbols as "./thumbs/", "./thumbs", "/thumbs/", "/thumbs" to "thumbs"
  const nestedFolder = targetFolder.replace(/^\.?\/?|\/?\.?$/, '');
  return url.replace(new RegExp(`/${nestedFolder}/`), '/'); // If no match is found, return the original URL
}

/**
 * @typedef {Object} ModalState
 * @property {number|null} currentIndex
 * @property {boolean} isOpen
 * @property {boolean} isLoading
 * @property {HTMLElement|null} currentImage
 */

/**
 * Creates initial modal state
 * @returns {ModalState}
 */
function createModalState() {
  return {
    currentIndex: null,
    isOpen: false,
    isLoading: false,
    currentImage: null
  };
}

/**
 * Creates modal event handlers
 * @param {Object} dom - Modal DOM elements
 * @param {ModalState} state - Modal state reference
 * @param {Object} callbacks - Action callbacks
 * @returns {{handleKeydown: Function, handleClick: Function}}
 */
function createModalHandlers(dom, state, callbacks) {
  const handleKeydown = event => {
    const actions = {
      Escape: callbacks.close,
      ArrowLeft: callbacks.prev,
      ArrowRight: callbacks.next
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };
  const handleClick = event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const actionMap = {
      close: callbacks.close,
      prev: callbacks.prev,
      next: callbacks.next
    };
    const action = actionMap[button.dataset.action];
    if (action) action();
  };
  return {
    handleKeydown,
    handleClick
  };
}

/**
 * Calculates navigation index with wrap-around
 * @param {number} current - Current index
 * @param {number} total - Total items
 * @param {string} direction - 'prev' or 'next'
 * @returns {number} New index
 */
function calculateNavIndex(current, total, direction) {
  if (direction === 'prev') {
    return current === 0 ? total - 1 : current - 1;
  }
  return current === total - 1 ? 0 : current + 1;
}

/**
 * Attaches modal event listeners
 * @param {HTMLElement} root - Modal root element
 * @param {Function} handleClick - Click handler
 * @param {Function} handleKeydown - Keydown handler
 * @param {{bind: Function}} touch - Touch handler
 */
function attachModalListeners(root, handleClick, handleKeydown, touch) {
  root.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeydown);
  touch.bind();
}

/**
 * Detaches modal event listeners
 * @param {HTMLElement} root - Modal root element
 * @param {Function} handleClick - Click handler
 * @param {Function} handleKeydown - Keydown handler
 * @param {{unbind: Function}} touch - Touch handler
 */
function detachModalListeners(root, handleClick, handleKeydown, touch) {
  touch.unbind();
  root.removeEventListener('click', handleClick);
  document.removeEventListener('keydown', handleKeydown);
}

/**
 * Cleanup modal on close with fade animation
 * @param {Object} dom - Modal DOM elements
 * @param {ModalState} state - Modal state reference
 * @param {number} fadeDuration - Fade out duration in ms
 * @returns {Promise<void>}
 */
async function cleanupModal(dom, state, fadeDuration = 300) {
  dom.root.style.opacity = '0';
  await new Promise(resolve => setTimeout(resolve, fadeDuration));
  dom.root.remove();
  dom.root.style.opacity = '';
  document.body.style.overflow = '';

  // Reset state
  state.currentIndex = null;
  if (dom.currentImage) {
    dom.currentImage.remove();
    dom.currentImage = null;
  }
}

/***/ }),

/***/ "./src/js/index.js":
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers/funcsDOM.js */ "./src/js/helpers/funcsDOM.js");
/* harmony import */ var _modulesPack_gallery_thumbs_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modulesPack/gallery-thumbs/index.js */ "./src/js/modulesPack/gallery-thumbs/index.js");
/* harmony import */ var _partials_gsap_loader_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./partials/gsap-loader.js */ "./src/js/partials/gsap-loader.js");
/* harmony import */ var _partials_animations_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./partials/animations.js */ "./src/js/partials/animations.js");


/**
 * @file index.js
 * @description Entry point. Bootstraps non-GSAP UI first, then lazily loads
 * GSAP via gsap-loader.js, builds animations through animations.js, and
 * initializes the masonry gallery.
 */





// ============================================
// INITIAL DATA
// ============================================

const linkAnchors = {
  index: "#about-us",
  gates: "#gatesSection",
  rollers: "#securityShuttersSection",
  automation: "#rollerShuttersAutomation",
  barriers: "#barrierSection",
  awnings: "#awningsSection",
  windows: "#windowSection",
  security: "#securitySurveillanceSection"
};
const linkClassNameActive = "active";
const navLinkSelector = ".nav-link";
const navHexagonSelector = ".hexagon-comb-block__cell";
const langSwitchData = {
  langSwitcherSelector: "#lang-switcher",
  iconLangSelector: ".lang-switcher__lang-icon",
  langActiveSelector: ".active",
  langListSelector: "#lang-list",
  langOptionArr: ["uk", "ru"],
  dataSetParam: "lang"
};
const gallerySelector = "#gallery-work";
const galleryThumbsFolderName = "thumbs";

// ============================================
// DOM READY
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  /** @type {string} */
  const pageType = document.body.dataset.type;

  // ------------------------------------------
  // Navigation & Language (non-GSAP, immediate)
  // ------------------------------------------
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.activateNavLink)(navLinkSelector, pageType, linkClassNameActive, linkAnchors[pageType] || "#");
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.activateNavLink)(navHexagonSelector, pageType, linkClassNameActive, linkAnchors[pageType] || "#");
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.initLangSwitcher)(langSwitchData);

  // ------------------------------------------
  // Lazy load GSAP + ScrollTrigger + animations module
  // ------------------------------------------
  const {
    gsap,
    ScrollTrigger
  } = await (0,_partials_gsap_loader_js__WEBPACK_IMPORTED_MODULE_2__.getGsap)();
  const {
    animatePage,
    fadeInGallery
  } = (0,_partials_animations_js__WEBPACK_IMPORTED_MODULE_3__.createAnimations)(gsap, ScrollTrigger);

  // ------------------------------------------
  // GSAP-dependent operations
  // ------------------------------------------
  const totalTl = animatePage();
  try {
    const imageItems = await (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.createMasonry)(gallerySelector, {
      gap: 20
    });
    const timelines = fadeInGallery(imageItems);
    Object.assign(totalTl, timelines);
    await (0,_modulesPack_gallery_thumbs_index_js__WEBPACK_IMPORTED_MODULE_1__.initThumbs)(gallerySelector, galleryThumbsFolderName);
  } catch (error) {
    console.error("Gallery initialization failed:", error);
  }

  // ------------------------------------------
  // Resize listener
  // ------------------------------------------
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.lockedEventListener)("resize", window, 1500)(async () => {
    try {
      await (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.createMasonry)(gallerySelector, {
        gap: 20
      });
    } catch (error) {
      console.error("Resize masonry failed:", error);
    }
  });

  // ------------------------------------------
  // Optional: full cleanup on page unload
  // Useful for SPA navigation or hot-reload scenarios
  // ------------------------------------------
  window.addEventListener("beforeunload", () => {
    (0,_partials_gsap_loader_js__WEBPACK_IMPORTED_MODULE_2__.killAllAnimations)();
    (0,_partials_gsap_loader_js__WEBPACK_IMPORTED_MODULE_2__.resetGsapCache)();
  });
});

/***/ }),

/***/ "./src/js/modulesPack/gallery-thumbs/index.js":
/*!****************************************************!*\
  !*** ./src/js/modulesPack/gallery-thumbs/index.js ***!
  \****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initThumbs: function() { return /* binding */ initThumbs; }
/* harmony export */ });
/* harmony import */ var touchsweep__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! touchsweep */ "./node_modules/touchsweep/dist/touchsweep.js");
/* harmony import */ var _helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../helpers/funcsDOM.js */ "./src/js/helpers/funcsDOM.js");





//////// CONSTANTS ////////

/** Aspect ratio constants from README (1290:660) */
const MODAL_MAX_WIDTH = 1290;
const MODAL_MAX_HEIGHT = 720;

/** Swipe threshold for touch navigation */
const SWIPE_THRESHOLD = 50;
const THUMBS_FOLDER = "thumbs";

/*** ClassNames ***/
const MODAL_CLASSNAME = "modal";
const MODAL_BAR_CLASSNAME = "modal__bar";
const MODAL_BAR_ARROW_CLASSNAME = "modal__bar--arrow";
const MODAL_BUTTON_CLASSNAME = "modal__btn";
const MODAL_COUNTER_CLASSNAME = "modal__counter";
const MODAL_LOADER_CLASSNAME = "modal__loader";
const MODAL_VIEWPORT_CLASSNAME = "modal__viewport";
const IS_LOADED = "is-loaded"; //opacity: 1
const MODAL_IMAGE = "modal__image";

//////// MAIN EXPORT ////////

/**
 * Initializes a thumbnail gallery with modal functionality.
 * Clicking any image opens a fullscreen modal with the hi-resolution version.
 * Navigation: click arrows, keyboard arrows/Escape, or swipe on mobile.
 *
 * @param {string} gallerySelector - CSS selector for the gallery container
 * @param {string} [thumbsFolder="thumbs"] - Subfolder containing thumbnail images
 * @returns {Promise<void>}
 * @throws {Error} If gallery container not found or no valid media elements
 *
 * @example
 * await initThumbs("#gallery-work", "thumbs");
 */
async function initThumbs(gallerySelector, thumbsFolder = THUMBS_FOLDER) {
  const gallery = document.querySelector(gallerySelector);
  if (!gallery?.isConnected) {
    throw new Error(`[initThumbs]: Gallery "${gallerySelector}" not found in DOM`);
  }

  // Collect all valid media elements (pictures and standalone images)
  const mediaItems = collectMediaItems(gallery);
  if (mediaItems.length === 0) {
    console.warn(`[initThumbs]: No media found in "${gallerySelector}"`);
    return;
  }

  // Initialize modal system with media data
  const modal = createModalController(mediaItems, {
    thumbsFolder
  });

  // Delegated click handler on gallery container
  gallery.addEventListener("click", event => {
    const mediaItem = event.target.closest("picture, img");

    // Ignore if click wasn't on a media element or if img is inside picture
    if (!mediaItem || mediaItem.tagName === "IMG" && mediaItem.closest("picture")) {
      return;
    }
    const index = mediaItems.indexOf(mediaItem);
    if (index !== -1) {
      modal.open(index);
    }
  });
}

//////// HELPER FUNCTIONS ////////

/**
 * Collects all valid media elements from gallery container.
 * Includes <picture> elements and standalone <img> elements (not nested in picture).
 *
 * @param {HTMLElement} gallery - Gallery container element
 * @returns {HTMLElement[]} Array of picture and standalone img elements
 */
function collectMediaItems(gallery) {
  const pictures = Array.from(gallery.querySelectorAll("picture"));

  // Get all images that are NOT inside a picture element
  const allImages = Array.from(gallery.querySelectorAll("img"));
  const standaloneImages = allImages.filter(img => !img.closest("picture"));
  return [...pictures, ...standaloneImages];
}

/**
 * Creates the modal controller with all functionality.
 * Refactored for lower complexity - helper functions moved to funcsDOM.
 *
 * @param {HTMLElement[]} items - Array of media elements
 * @param {Object} config - Configuration object
 * @param {string} config.thumbsFolder - Name of thumbnails subfolder
 * @returns {{open: Function}} Modal controller with open method
 */
function createModalController(items, config) {
  const state = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.createModalState)();
  const dom = buildModalDOM();
  const touch = initTouchHandling(dom.root, navigatePrev, navigateNext);

  // Navigation functions
  async function navigatePrev() {
    if (state.isLoading) return;
    try {
      await showImage((0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.calculateNavIndex)(state.currentIndex, items.length, 'prev'));
    } catch (error) {
      console.error('[Modal] Navigation failed:', error);
    }
  }
  async function navigateNext() {
    if (state.isLoading) return;
    try {
      await showImage((0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.calculateNavIndex)(state.currentIndex, items.length, 'next'));
    } catch (error) {
      console.error('[Modal] Navigation failed:', error);
    }
  }

  // Create handlers with bound callbacks
  const {
    handleKeydown,
    handleClick
  } = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.createModalHandlers)(dom, state, {
    close: closeModal,
    prev: navigatePrev,
    next: navigateNext
  });

  /**
   * Displays image at given index
   * @param {number} index - Image index
   */
  async function showImage(index) {
    if (index === state.currentIndex && dom.currentImage) return;
    state.currentIndex = index;
    state.isLoading = true;
    const item = items[index];
    dom.counter.textContent = formatCounter(index, items.length, getAltText(item));

    // Show loader
    dom.viewport.innerHTML = `<div class=${MODAL_LOADER_CLASSNAME}></div>`;

    // Fade out previous
    if (dom.currentImage) {
      dom.currentImage.style.opacity = "0";
      await delay(200);
      dom.currentImage.remove();
      dom.currentImage = null;
    }
    try {
      const {
        element,
        naturalSize
      } = await loadHiResImage(item, config.thumbsFolder);
      dom.currentImage = element;
      const dims = calculateViewportDimensions(naturalSize.width, naturalSize.height, dom.root);
      applyViewportDimensions(dom.viewport, dims);
      dom.viewport.innerHTML = '';
      dom.viewport.appendChild(dom.currentImage);
      requestAnimationFrame(() => {
        dom.currentImage.classList.add(IS_LOADED);
        state.isLoading = false;
      });
    } catch (error) {
      console.error(`[Modal] Failed to load image ${index}:`, error);
      dom.viewport.innerHTML = `
                <div class="modal__error">
                    <span class="modal__error-icon">⚠</span>
                    <span class="modal__error-text">Failed to load image</span>
                </div>
            `;
      state.isLoading = false;
    }
  }
  async function openModal(startIndex) {
    if (state.isOpen) return;
    state.isOpen = true;
    document.body.style.overflow = "hidden";
    document.body.appendChild(dom.root);
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.attachModalListeners)(dom.root, handleClick, handleKeydown, touch);
    try {
      await showImage(startIndex);
    } catch (error) {
      console.error('[Modal] Failed to open:', error);
    }
  }
  async function closeModal() {
    if (!state.isOpen) return;
    state.isOpen = false;
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.detachModalListeners)(dom.root, handleClick, handleKeydown, touch);
    await (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.cleanupModal)(dom, state);
  }
  return {
    open: openModal
  };
}

//////// DOM BUILDING ////////

/**
 * Builds modal DOM structure with all necessary elements.
 * Uses createElementWithClass from funcsDOM for consistency.
 *
 * @returns {Object} Modal DOM elements reference object
 */
function buildModalDOM() {
  const root = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.createElementWithClass)("div", MODAL_CLASSNAME);

  // Top bar with counter and close button
  const header = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.createElementWithClass)("div", MODAL_BAR_CLASSNAME);
  const counter = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.createElementWithClass)("span", MODAL_COUNTER_CLASSNAME);
  const closeBtn = createModalButton("×", "close", true);
  header.append(counter, closeBtn);

  // Navigation arrows (left/right)
  const navBar = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.createElementWithClass)("div", MODAL_BAR_CLASSNAME, MODAL_BAR_ARROW_CLASSNAME);
  const prevBtn = createModalButton("‹", "prev");
  const nextBtn = createModalButton("›", "next");
  navBar.append(prevBtn, nextBtn);

  // Main viewport for images
  const viewport = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.createElementWithClass)("div", MODAL_VIEWPORT_CLASSNAME);

  // Assemble structure
  root.append(header, navBar, viewport);
  return {
    root,
    counter,
    viewport,
    currentImage: null
  };
}

/**
 * Creates a modal control button.
 *
 * @param {string} symbol - Button text/icon
 * @param {string} action - Action identifier (close, prev, next)
 * @param {boolean} [isAbsolute=false] - Whether button is absolutely positioned
 * @returns {HTMLButtonElement} Created button element
 */
function createModalButton(symbol, action, isAbsolute = false) {
  const btn = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.createElementWithClass)("button", MODAL_BUTTON_CLASSNAME, `${MODAL_BUTTON_CLASSNAME}--${action}`);
  btn.textContent = symbol;
  btn.dataset.action = action;
  btn.type = "button";
  btn.setAttribute("aria-label", action === "close" ? "Close modal" : action === "prev" ? "Previous image" : "Next image");
  if (isAbsolute) {
    btn.style.position = "absolute";
  }
  return btn;
}

//////// IMAGE LOADING ////////

/**
 * Loads hi-resolution image and returns element with natural dimensions.
 * Replaces thumbnail path with hi-res path, waits for load, extracts size.
 *
 * @param {HTMLElement} original - Original thumbnail element
 * @param {string} thumbsFolder - Thumbnails subfolder name
 * @returns {Promise<{element: HTMLElement, naturalSize: {width: number, height: number}}>}
 */
async function loadHiResImage(original, thumbsFolder) {
  /** @type {HTMLElement} */
  const clone = /** @type {HTMLElement} */original.cloneNode(true);
  clone.classList.add(MODAL_IMAGE);

  // Remove fixed dimensions from thumbnail
  clone.removeAttribute("width");
  clone.removeAttribute("height");

  // Remove lazy loading - not needed in modal
  clone.removeAttribute("loading");
  clone.removeAttribute("decoding");

  // Get main image element
  /** @type {HTMLImageElement|null} */
  const mainImg = clone.tagName === "IMG" ? (/** @type {HTMLImageElement} */clone) : clone.querySelector("img");
  if (!mainImg) {
    throw new Error("No image element found in clone");
  }

  // Get original src and calculate hi-res URL
  const originalSrc = mainImg.getAttribute("src");
  const hiResUrl = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.replaceFilePath)(originalSrc, thumbsFolder);

  // Create a fresh Image object to load hi-res version
  const loaderImg = new Image();

  // Wait for hi-res to load
  const naturalSize = await new Promise((resolve, reject) => {
    loaderImg.onload = () => {
      resolve({
        width: loaderImg.naturalWidth,
        height: loaderImg.naturalHeight
      });
    };
    loaderImg.onerror = () => {
      reject(new Error(`Failed to load: ${hiResUrl}`));
    };
    loaderImg.src = hiResUrl;
  });

  // Update the clone's src and set natural dimensions as attributes
  mainImg.src = hiResUrl;
  mainImg.setAttribute("width", naturalSize.width);
  mainImg.setAttribute("height", naturalSize.height);

  // Also update srcset if present in sources
  if (clone.tagName === "PICTURE") {
    /** @type {NodeListOf<HTMLSourceElement>} */
    const sources = clone.querySelectorAll("source");
    sources.forEach(src => {
      if (src.hasAttribute("srcset")) {
        const srcsetUrl = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.replaceFilePath)(src.getAttribute("srcset"), thumbsFolder);
        src.setAttribute("srcset", srcsetUrl);
      }
    });
  }
  return {
    element: clone,
    naturalSize
  };
}

/**
 * Waits for image to load and returns its natural dimensions.
 * Handles already-cached images immediately.
 *
 * @param {HTMLImageElement} img - Image element to wait for
 * @returns {Promise<{width: number, height: number}>}
 */
function waitForImageLoad(img) {
  return new Promise((resolve, reject) => {
    // Check if already loaded with valid dimensions
    if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      console.log(`[waitForImageLoad] Already loaded: ${img.naturalWidth}x${img.naturalHeight}`);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      return;
    }

    // Set up handlers before setting src to avoid race condition
    const onLoad = () => {
      console.log(`[waitForImageLoad] Load event: ${img.naturalWidth}x${img.naturalHeight}`);
      cleanup();
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    const onError = () => {
      console.error(`[waitForImageLoad] Error: ${img.src}`);
      cleanup();
      reject(new Error(`Failed to load image: ${img.src}`));
    };
    const cleanup = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };
    img.addEventListener("load", onLoad, {
      once: true
    });
    img.addEventListener("error", onError, {
      once: true
    });

    // If image is not complete, wait for it
    // If it's complete but naturalWidth is 0, force reload
    if (img.complete && img.naturalWidth === 0) {
      console.log(`[waitForImageLoad] Forcing reload`);
      const currentSrc = img.src;
      img.src = "";
      img.src = currentSrc;
    }
  });
}

//////// VIEWPORT CALCULATIONS ////////

/**
 * Calculates optimal viewport dimensions to fit image in modal.
 * Preserves aspect ratio, fits within modal bounds with padding.
 *
 * @param {number} imgWidth - Image natural width
 * @param {number} imgHeight - Image natural height
 * @param {HTMLElement} modal - Modal container element
 * @returns {{width: number, height: number}} Calculated dimensions
 */
function calculateViewportDimensions(imgWidth, imgHeight, modal) {
  // Get modal styles for padding calculations
  const modalStyles = window.getComputedStyle(modal);
  const paddingX = parseFloat(modalStyles.paddingLeft) + parseFloat(modalStyles.paddingRight);
  const paddingY = parseFloat(modalStyles.paddingTop) + parseFloat(modalStyles.paddingBottom);

  // Available space for image (use full modal space minus padding)
  const availableWidth = modal.clientWidth - paddingX;
  const availableHeight = modal.clientHeight - paddingY;

  // Image and available space aspect ratios
  const imgRatio = imgWidth / imgHeight;
  const availableRatio = availableWidth / availableHeight;
  let finalWidth, finalHeight;

  // Fit by the dimension that is more constrained
  if (imgRatio > availableRatio) {
    // Image is relatively wider - constrain by available width
    finalWidth = availableWidth;
    finalHeight = availableWidth / imgRatio;
  } else {
    // Image is relatively taller - constrain by available height
    finalHeight = availableHeight;
    finalWidth = availableHeight * imgRatio;
  }

  // Cap at max dimensions from README
  finalWidth = Math.min(finalWidth, MODAL_MAX_WIDTH);
  finalHeight = Math.min(finalHeight, MODAL_MAX_HEIGHT);
  return {
    width: Math.round(finalWidth),
    height: Math.round(finalHeight)
  };
}

/**
 * Applies calculated dimensions to viewport element.
 *
 * @param {HTMLElement} viewport - Viewport container element
 * @param {{width: number, height: number}} dimensions - Dimensions to apply
 */
function applyViewportDimensions(viewport, dimensions) {
  viewport.style.width = `${dimensions.width}px`;
  viewport.style.height = `${dimensions.height}px`;
}

//////// TOUCH/SWIPE HANDLING ////////

/**
 * Initializes touch swipe handling for modal navigation.
 * Uses TouchSweep library with custom threshold.
 *
 * @param {HTMLElement} element - Element to attach swipe to
 * @param {Function} onSwipeLeft - Handler for left swipe (show previous)
 * @param {Function} onSwipeRight - Handler for right swipe (show next)
 * @returns {{bind: Function, unbind: Function}} Control methods
 */
function initTouchHandling(element, onSwipeLeft, onSwipeRight) {
  const handler = new touchsweep__WEBPACK_IMPORTED_MODULE_0__["default"](element, {}, SWIPE_THRESHOLD);

  // TouchSweep fires custom events on the element
  const handleSwipeLeft = () => onSwipeLeft();
  const handleSwipeRight = () => onSwipeRight();
  element.addEventListener("swipeleft", handleSwipeLeft);
  element.addEventListener("swiperight", handleSwipeRight);
  return {
    bind: () => handler.bind(),
    unbind: () => {
      handler.unbind();
      element.removeEventListener("swipeleft", handleSwipeLeft);
      element.removeEventListener("swiperight", handleSwipeRight);
    }
  };
}

//////// UTILITY FUNCTIONS ////////

/**
 * Extracts alt text from media element for display.
 * Checks img element directly or nested within picture.
 *
 * @param {HTMLElement} element - Picture or img element
 * @returns {string} Alt text or empty string
 */
function getAltText(element) {
  const img = element.tagName === "IMG" ? element : element.querySelector("img");
  return img?.getAttribute("alt") || "";
}

/**
 * Formats counter display text.
 *
 * @param {number} index - Current index (0-based)
 * @param {number} total - Total number of images
 * @param {string} label - Optional label/alt text
 * @returns {string} Formatted counter string
 */
function formatCounter(index, total, label) {
  const base = `${index + 1} / ${total}`;
  return label ? `${base}: ${label}` : base;
}

/**
 * Simple delay promise for animations.
 *
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/***/ }),

/***/ "./src/js/partials/animations.js":
/*!***************************************!*\
  !*** ./src/js/partials/animations.js ***!
  \***************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createAnimations: function() { return /* binding */ createAnimations; }
/* harmony export */ });
/* harmony import */ var _helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/funcsDOM.js */ "./src/js/helpers/funcsDOM.js");
/* harmony import */ var _gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gsap-loader.js */ "./src/js/partials/gsap-loader.js");


/**
 * @file animations.js
 * @description GSAP animation factory integrated with gsap-loader.js caching.
 * All animations are registered in the global gsap-loader cache so they can
 * be killed individually or in bulk. No local WeakMap is used anymore.
 */



// ============================================
// SELECTORS
// ============================================

/** @type {Object.<string, string>} Animation selectors map */
const SELECTORS = {
  scrolledNav: "#scrolledNav",
  burgerBase: ".burger_nav",
  burgerFixed: ".burger_nav:not(.hidden)",
  burgerHidden: ".burger_nav.hidden",
  navMenuHidden: ".header__nav.abs",
  benefitsSection: "#benefitsSection",
  headingAccentHero: ".section__heading-block--hero .accent",
  headingHeroRest: ".section__heading-block--hero .rest-of-heading",
  textBlockHero: ".section__text-block--hero",
  biddingBlockHero: ".section__bidding-block",
  iconWrapperHero: ".section__img-wrapper--hero",
  galleryWork: "#gallery-work",
  automationParallax: ".section--roller-automation",
  automationParallaxBg: "[data-anime=automation]",
  servicesParallax: ".section--services",
  servicesParallaxBg: "[data-anime=services]",
  fadeInLeft: "[data-anime=fade-in-left]",
  fadeInRight: "[data-anime=fade-in-right]",
  fadeInUp: "[data-anime=fade-in-up]",
  scaleIn: "[data-anime=scale-in]"
};

// ============================================
// DOM REFERENCES (evaluated once at module load)
// ============================================

const navMenuFixed = document.querySelector(SELECTORS.navMenuHidden);
const burgerHidden = document.querySelector(SELECTORS.burgerHidden);
const burgerFixed = document.querySelector(SELECTORS.burgerFixed);
const burgerAll = Array.from(document.querySelectorAll(SELECTORS.burgerBase));

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Checks if a GSAP timeline has real (non-zero duration) animations.
 *
 * @param {gsap.core.Timeline|gsap.core.Tween} timeline - The timeline to check
 * @returns {boolean} True if at least one child tween has duration > 0
 */
function hasRealAnimations(timeline) {
  return timeline.getChildren().some(child => child.duration() > 0);
}

// ============================================
// SCROLL TIMELINE BUILDERS
// ============================================

/**
 * Creates a scroll-triggered timeline with fade-in from opacity 0.
 * The resulting timeline is automatically cached via gsap-loader.js.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {HTMLElement} elem - Target element
 * @param {HTMLElement} triggerElem - ScrollTrigger trigger element
 * @param {Object} gsapToParams - Parameters for gsap.to (fade in)
 * @param {Object} gsapFromParams - Parameters for gsap.from (entrance motion)
 * @param {string} [nextAnimePos="<"] - Timeline position for second tween
 * @returns {gsap.core.Timeline|false} Created timeline or false if invalid
 */
function getScrollTimelineTwoTweens(gsap, elem, triggerElem, gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
  if (!(elem instanceof HTMLElement) || !(triggerElem instanceof HTMLElement)) {
    console.warn(`getScrollTimelineTwoTweens: invalid element (${elem}) or trigger (${triggerElem})`);
    return false;
  }
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElem,
      start: "top 80%",
      toggleActions: "play none none reverse",
      preventOverlaps: true
    }
  });
  tl.to(elem, {
    ...gsapToParams
  });
  tl.from(elem, {
    ...gsapFromParams
  }, nextAnimePos);

  // Register in gsap-loader cache; kills previous animation for this element automatically
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.cacheAnimation)(tl, elem);
  return tl;
}

/**
 * Creates multiple scroll-triggered timelines for an array of elements.
 * Each timeline is cached against its element via gsap-loader.js.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {HTMLElement[]} elemsArr - Array of target elements
 * @param {HTMLElement|null} triggerElem - Common trigger element (or null for per-element)
 * @param {string} propKey - Prefix for timeline keys in result object
 * @param {Object} gsapToParams - Parameters for gsap.to
 * @param {Object} gsapFromParams - Parameters for gsap.from
 * @param {string} [nextAnimePos="<"] - Timeline position
 * @returns {Object.<string, gsap.core.Timeline>} Object with timeline references
 */
function getAllScrollTwoTweens(gsap, elemsArr, triggerElem, propKey = "tlKey", gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
  const tlObj = {};
  let trigger = null;
  if (!Array.isArray(elemsArr)) {
    console.error(`getAllScrollTwoTweens: elemsArr is not an Array`);
    return tlObj;
  }
  if (triggerElem !== null) {
    if (!(triggerElem instanceof HTMLElement) || !document.body.contains(triggerElem)) {
      console.error(`getAllScrollTwoTweens: invalid trigger element`);
      return tlObj;
    }
    trigger = triggerElem;
  }
  elemsArr.forEach((elem, index) => {
    if (!(elem instanceof HTMLElement) || !document.body.contains(elem)) {
      console.warn(`getAllScrollTwoTweens: element at index ${index} is invalid`);
      return;
    }
    const tlKey = `${propKey}_${index}`;
    const tl = getScrollTimelineTwoTweens(gsap, elem, trigger || elem, gsapToParams, gsapFromParams, nextAnimePos);
    if (tl && hasRealAnimations(tl)) {
      tlObj[tlKey] = tl;
    }
  });
  return tlObj;
}

// ============================================
// BUILDER FUNCTIONS (accept gsap instance)
// ============================================

/**
 * Builds the hero section entrance animation timeline.
 * Cached globally so it can be killed on page transition.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @returns {gsap.core.Timeline} Hero animation timeline
 */
function buildHeroAnimation(gsap) {
  const tlHero = gsap.timeline();
  tlHero.to(SELECTORS.headingAccentHero, {
    opacity: 1,
    duration: 2,
    delay: 0.3
  });
  tlHero.from(SELECTORS.headingAccentHero, {
    x: 80,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(SELECTORS.headingHeroRest, {
    opacity: 1,
    duration: 2
  }, "<");
  tlHero.from(SELECTORS.headingHeroRest, {
    x: -80,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(SELECTORS.textBlockHero, {
    opacity: 1,
    duration: 2
  }, "-=1.5");
  tlHero.from(SELECTORS.textBlockHero, {
    y: 80,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(SELECTORS.biddingBlockHero, {
    opacity: 1,
    duration: 2
  }, "<+0.3");
  tlHero.from(SELECTORS.biddingBlockHero, {
    y: 40,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(SELECTORS.iconWrapperHero, {
    scale: 1,
    duration: 1.5,
    ease: "elastic.out"
  }, "<+0.2");
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.cacheAnimation)(tlHero);
  return tlHero;
}

/**
 * Builds the scrolled navigation show/hide animation.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {typeof import('gsap/ScrollTrigger').ScrollTrigger} ScrollTrigger - ScrollTrigger plugin
 */
function buildScrolledNav(gsap, ScrollTrigger) {
  const target = document.querySelector(SELECTORS.scrolledNav);
  if (!target) return;
  const tween = gsap.to(target, {
    top: -10,
    duration: 0.7,
    ease: "back.out(1.5)",
    delay: 0.5,
    scrollTrigger: {
      trigger: SELECTORS.benefitsSection,
      start: "top 5%",
      toggleActions: "play none none reverse",
      preventOverlaps: true
    }
  });
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.cacheAnimation)(tween, target);
}

/**
 * Builds a parallax background effect using ScrollTrigger scrub.
 * Cached against the target element.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {typeof import('gsap/ScrollTrigger').ScrollTrigger} ScrollTrigger - ScrollTrigger plugin
 * @param {string} targetSelector - Selector for the parallax target
 * @param {string} triggerSelector - Selector for the trigger container
 * @returns {gsap.core.Tween|undefined} The parallax tween or undefined if elements missing
 */
function buildParallax(gsap, ScrollTrigger, targetSelector, triggerSelector) {
  const target = document.querySelector(targetSelector);
  const trigger = document.querySelector(triggerSelector);
  if (!target || !trigger) return;
  const tween = gsap.fromTo(target, {
    yPercent: 10
  }, {
    yPercent: -10,
    ease: "none",
    scrollTrigger: {
      trigger,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.5,
      invalidateOnRefresh: true
    }
  });
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.cacheAnimation)(tween, target);
  return tween;
}

/**
 * Builds fade-in animations for elements matching a selector.
 * Each element's timeline is cached individually.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {string} selector - CSS selector for target elements
 * @param {string} propKey - Key prefix for timeline references
 * @param {Object} fromParams - gsap.from parameters (entrance motion)
 * @returns {Object.<string, gsap.core.Timeline>} Timeline references object
 */
function buildFadeAnimations(gsap, selector, propKey, fromParams) {
  return getAllScrollTwoTweens(gsap, gsap.utils.toArray(document.querySelectorAll(selector)), null, propKey, {
    opacity: 1,
    duration: 0.7,
    delay: 0.2
  }, fromParams);
}

/**
 * Builds gallery image fade-in animations.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {HTMLElement[]} elemsArr - Gallery image elements
 * @returns {Object.<string, gsap.core.Timeline>} Timeline references
 */
function buildGalleryFade(gsap, elemsArr) {
  return getAllScrollTwoTweens(gsap, elemsArr, document.querySelector(SELECTORS.galleryWork), "fadeInGallery", {
    opacity: 1,
    duration: 0.8,
    delay: 0.2
  }, {
    scale: 0.7,
    duration: 1,
    ease: "back.out"
  });
}

// ============================================
// BURGER MENU (returns handlers + tween)
// ============================================

/**
 * Creates burger menu animation and event handlers.
 * The open/close tween is cached against the nav menu element.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @returns {{navMenuAnime: gsap.core.Tween, burgerClickHandler: Function, burgerInitListener: Function}}
 */
function createBurgerHandlers(gsap) {
  const navMenuAnime = gsap.to(navMenuFixed, {
    top: -20,
    duration: 0.8,
    ease: "back.out(0.8)",
    paused: true
  });
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.cacheAnimation)(navMenuAnime, navMenuFixed);
  const burgerClickHandler = e => {
    if (!e.target.closest(SELECTORS.burgerBase)) {
      const isNavActive = navMenuFixed.getAttribute("aria-expanded") === "true";
      if (isNavActive) {
        (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setAttributes)([burgerHidden, burgerFixed, navMenuFixed], {
          "aria-expanded": !isNavActive
        });
        burgerHidden.classList.remove("opened");
        burgerFixed.classList.remove("opened");
        navMenuAnime.reverse();
        document.body.style.overflow = "auto";
      }
    }
  };
  const burgerInitListener = burger => {
    burger.addEventListener("click", e => {
      const burgerMenu = e.target.closest(SELECTORS.burgerBase);
      if (!burgerMenu) return;
      e.preventDefault();
      const isExpanded = burger.getAttribute("aria-expanded") === "true";
      (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setAttributes)([burgerHidden, burgerFixed, navMenuFixed], {
        "aria-expanded": !isExpanded
      });
      if (isExpanded) {
        burgerHidden.classList.remove("opened");
        burgerFixed.classList.remove("opened");
        document.documentElement.style.scrollbarGutter = "initial";
        document.body.style.scrollbarGutter = "initial";
        document.body.style.overflow = "auto";
        navMenuAnime.reverse();
      } else {
        burgerHidden.classList.add("opened");
        burgerFixed.classList.add("opened");
        document.documentElement.style.scrollbarGutter = "stable";
        document.body.style.scrollbarGutter = "stable";
        document.body.style.overflow = "hidden";
        navMenuAnime.play();
      }
    });
  };
  return {
    navMenuAnime,
    burgerClickHandler,
    burgerInitListener
  };
}

// ============================================
// MAIN FACTORY
// ============================================

/**
 * Creates all page animations. Must be called AFTER GSAP is dynamically loaded.
 * All animations are registered in gsap-loader.js for centralized cleanup.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP core instance
 * @param {typeof import('gsap/ScrollTrigger').ScrollTrigger} ScrollTrigger - ScrollTrigger plugin
 * @returns {{animatePage: Function, fadeInGallery: Function}} Animation API
 *
 * @example
 * const { gsap, ScrollTrigger } = await getGsap();
 * const { animatePage, fadeInGallery } = createAnimations(gsap, ScrollTrigger);
 * const totalTl = animatePage();
 */
function createAnimations(gsap, ScrollTrigger) {
  const {
    burgerClickHandler,
    burgerInitListener
  } = createBurgerHandlers(gsap);
  const pageAnimations = {
    automation: () => {
      const tlData = {};
      const rollerParallax = buildParallax(gsap, ScrollTrigger, SELECTORS.automationParallaxBg, SELECTORS.automationParallax);
      if (rollerParallax) tlData.rollerParallax = rollerParallax;
      return tlData;
    },
    common: () => {
      const tlData = {};
      const tlHero = buildHeroAnimation(gsap);
      if (hasRealAnimations(tlHero)) tlData.tlHero = tlHero;
      const servicesParallax = buildParallax(gsap, ScrollTrigger, SELECTORS.servicesParallaxBg, SELECTORS.servicesParallax);
      if (servicesParallax) tlData.servicesParallax = servicesParallax;
      Object.assign(tlData, buildFadeAnimations(gsap, SELECTORS.fadeInLeft, "fadeInLeft", {
        x: -60,
        y: 40,
        duration: 1,
        ease: "circ.out"
      }));
      Object.assign(tlData, buildFadeAnimations(gsap, SELECTORS.fadeInRight, "fadeInRight", {
        x: 60,
        y: 40,
        duration: 1,
        ease: "circ.out"
      }));
      Object.assign(tlData, buildFadeAnimations(gsap, SELECTORS.scaleIn, "scaleIn", {
        scale: 0.7,
        duration: 1.2,
        ease: "back.out(1)"
      }));
      Object.assign(tlData, buildFadeAnimations(gsap, SELECTORS.fadeInUp, "fadeInUp", {
        y: 40,
        duration: 1,
        ease: "circ.out"
      }));
      buildScrolledNav(gsap, ScrollTrigger);
      document.addEventListener("click", burgerClickHandler);
      burgerAll.forEach(burgerInitListener);
      return tlData;
    }
  };
  function fadeInGallery(elemsArr = []) {
    return buildGalleryFade(gsap, elemsArr);
  }

  /**
   * Runs all page animations.
   * DOM readiness is guaranteed by index.js (DOMContentLoaded + async GSAP load),
   * so no redundant readyState checks are needed here.
   *
   * @returns {Object.<string, gsap.core.Timeline|gsap.core.Tween>} Map of all active timelines/tweens
   */
  function animatePage() {
    return onPageLoaded(pageAnimations);
  }
  function onPageLoaded(animationData) {
    const pageName = document.body.dataset.type;
    const totalTl = {};
    if (animationData.common) Object.assign(totalTl, animationData.common());
    if (pageName in animationData) Object.assign(totalTl, animationData[pageName]());
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return totalTl;
  }
  return {
    animatePage,
    fadeInGallery
  };
}

/***/ }),

/***/ "./src/js/partials/gsap-loader.js":
/*!****************************************!*\
  !*** ./src/js/partials/gsap-loader.js ***!
  \****************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cacheAnimation: function() { return /* binding */ cacheAnimation; },
/* harmony export */   generateAnimId: function() { return /* binding */ generateAnimId; },
/* harmony export */   getCachedGsap: function() { return /* binding */ getCachedGsap; },
/* harmony export */   getGsap: function() { return /* binding */ getGsap; },
/* harmony export */   isGsapLoaded: function() { return /* binding */ isGsapLoaded; },
/* harmony export */   killAllAnimations: function() { return /* binding */ killAllAnimations; },
/* harmony export */   killAnimation: function() { return /* binding */ killAnimation; },
/* harmony export */   killAnimationByKey: function() { return /* binding */ killAnimationByKey; },
/* harmony export */   resetGsapCache: function() { return /* binding */ resetGsapCache; }
/* harmony export */ });


/**
 * @file gsap-loader.js
 * @description Atomic lazy-loader for GSAP + ScrollTrigger.
 * Exports a global animation cache so that animations.js (or any consumer)
 * can register, retrieve, and kill tweens/timelines in one centralized place.
 */

// ============================================
// CACHE & STATE
// ============================================

/** @type {{ gsap?: typeof import('gsap').gsap, ScrollTrigger?: typeof import('gsap/ScrollTrigger').ScrollTrigger }|null} */
let gsapCache = null;

/** @type {Promise<{ gsap: typeof import('gsap').gsap, ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }>|null} */
let gsapLoadPromise = null;

/** @type {Map<string, gsap.core.Tween|gsap.core.Timeline>} */
const activeAnimations = new Map();

/** @type {number} */
let animationId = 0;

// ============================================
// LOADER
// ============================================

/**
 * Loading and caching GSAP + ScrollTrigger as a single atomic chunk.
 * Returns the cached result when called again.
 *
 * @returns {Promise<{
 *   gsap: typeof import('gsap').gsap,
 *   ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
 * }>}
 */
async function getGsap() {
  if (gsapCache) return gsapCache;
  if (gsapLoadPromise) return gsapLoadPromise;
  gsapLoadPromise = Promise.all(/*! import() */[__webpack_require__.e("gsap"), __webpack_require__.e("src_js_partials_gsap-all_js")]).then(__webpack_require__.bind(__webpack_require__, /*! ./gsap-all.js */ "./src/js/partials/gsap-all.js")).then(({
    gsap,
    ScrollTrigger
  }) => {
    gsap.registerPlugin(ScrollTrigger);
    gsapCache = {
      gsap,
      ScrollTrigger
    };
    return gsapCache;
  });
  return gsapLoadPromise;
}

// ============================================
// ANIMATION CACHE API
// ============================================

/**
 * Generates a unique cache key for an animation.
 * @returns {string}
 */
function generateAnimId() {
  return `anim_${++animationId}`;
}

/**
 * Caches the animation. Returns the cache key.
 * When an element is provided and has existing animation, it is killed.
 *
 * @param {gsap.core.Tween|gsap.core.Timeline} animation
 * @param {HTMLElement} [element] - Optional element for element-based kill
 * @returns {string} Cache key
 */
function cacheAnimation(animation, element) {
  if (element) {
    for (const [key, anim] of activeAnimations.entries()) {
      if (anim.targets && anim.targets().includes(element)) {
        anim.kill();
        activeAnimations.delete(key);
      }
    }
  }
  const key = generateAnimId();
  activeAnimations.set(key, animation);
  return key;
}

/**
 * Kills animation by cache key.
 * @param {string} key
 */
function killAnimationByKey(key) {
  const animation = activeAnimations.get(key);
  if (animation) {
    animation.kill();
    activeAnimations.delete(key);
  }
}

/**
 * Kills animation by element (finds in cache by target).
 * @param {HTMLElement} element
 */
function killAnimation(element) {
  for (const [key, anim] of activeAnimations.entries()) {
    if (anim.targets && anim.targets().includes(element)) {
      anim.kill();
      activeAnimations.delete(key);
    }
  }
}

/**
 * Kills ALL cached animations and ScrollTriggers.
 * Safe cleanup that preserves GSAP cache.
 */
function killAllAnimations() {
  const {
    ScrollTrigger
  } = gsapCache || {};
  activeAnimations.forEach(anim => anim.kill());
  activeAnimations.clear();
  if (ScrollTrigger) {
    ScrollTrigger.getAll().forEach(st => st.kill());
  }
  animationId = 0;
}

/**
 * Kills all animations AND clears GSAP cache.
 * Use for full page reload / SPA navigation.
 */
function resetGsapCache() {
  killAllAnimations();
  gsapCache = null;
  gsapLoadPromise = null;
}

/**
 * Checks if GSAP is loaded.
 * @returns {boolean}
 */
function isGsapLoaded() {
  return gsapCache !== null;
}

/**
 * Returns cached GSAP instance without reloading.
 * @returns {{ gsap: typeof import('gsap').gsap, ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }|null}
 */
function getCachedGsap() {
  return gsapCache;
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	!function() {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = function(result, chunkIds, fn, priority) {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every(function(key) { return __webpack_require__.O[key](chunkIds[j]); })) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	!function() {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = function(chunkId) {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce(function(promises, key) {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	!function() {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = function(chunkId) {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	!function() {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "gulp5_starting_kit_2024:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = function(url, done, key, chunkId) {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = function(prev, event) {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach(function(fn) { return fn(event); });
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	!function() {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"index": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = function(chunkId, promises) {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise(function(resolve, reject) { installedChunkData = installedChunks[chunkId] = [resolve, reject]; });
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = function(event) {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = function(chunkId) { return installedChunks[chunkId] === 0; };
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkgulp5_starting_kit_2024"] = self["webpackChunkgulp5_starting_kit_2024"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], function() { return __webpack_require__("./src/js/index.js"); })
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.bundle.js.map