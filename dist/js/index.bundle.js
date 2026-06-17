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
/* harmony import */ var _partials_animations_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./partials/animations.js */ "./src/js/partials/animations.js");






//INITIAL DATA
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
document.addEventListener("DOMContentLoaded", async () => {
  /*** @type {string} */
  const pageType = document.body.dataset.type;

  /// Navigation ///
  //checking and lighten several duplicate navigations for the .active links:
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.activateNavLink)(navLinkSelector, pageType, linkClassNameActive, linkAnchors[pageType] || "#");
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.activateNavLink)(navHexagonSelector, pageType, linkClassNameActive, linkAnchors[pageType] || "#");

  //GSAP animation tweens
  const totalTl = (0,_partials_animations_js__WEBPACK_IMPORTED_MODULE_2__.animatePage)();
  try {
    // Masonry + Gallery + Thumbs - consistent and readable
    const imageItems = await (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.createMasonry)(gallerySelector, {
      gap: 20
    });
    const timelines = (0,_partials_animations_js__WEBPACK_IMPORTED_MODULE_2__.fadeInGallery)(imageItems);
    Object.assign(totalTl, timelines);
    await (0,_modulesPack_gallery_thumbs_index_js__WEBPACK_IMPORTED_MODULE_1__.initThumbs)(gallerySelector, galleryThumbsFolderName);
  } catch (error) {
    console.error("Gallery initialization failed:", error);
  }

  //initializing optional language versions interaction
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.initLangSwitcher)(langSwitchData);

  //listening to "resize" event to recompile the masonry gallery with the new parameters...
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.lockedEventListener)("resize", window, 2000)(async () => {
    try {
      await (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.createMasonry)(gallerySelector, {
        gap: 20
      });
    } catch (error) {
      console.error("Resize masonry failed:", error);
    }
  });

  ///////// END OF DOMContentLoaded Listener ////////////
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
/* harmony export */   animatePage: function() { return /* binding */ animatePage; },
/* harmony export */   fadeInGallery: function() { return /* binding */ fadeInGallery; }
/* harmony export */ });
/* harmony import */ var gsap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gsap */ "./node_modules/gsap/index.js");
/* harmony import */ var gsap_ScrollTrigger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! gsap/ScrollTrigger.js */ "./node_modules/gsap/ScrollTrigger.js");
/* harmony import */ var _helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/funcsDOM.js */ "./src/js/helpers/funcsDOM.js");






///////////////// REGISTER GSAP PLUGINS /////////////
gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.registerPlugin(gsap_ScrollTrigger_js__WEBPACK_IMPORTED_MODULE_2__.ScrollTrigger);

////////////////// INITIATING SCROLL CONTROLLER /////////
//const { lockScroll } = initLockScroll();

//////////////// ANIMATION DATA /////////////////////
/// ANIMATION SELECTORS
/// index.html
/// SELECTORS
const i = {
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
const navMenuFixed = document.querySelector(i.navMenuHidden);
const burgerHidden = document.querySelector(i.burgerHidden);
const burgerFixed = document.querySelector(i.burgerFixed);
const burgerAll = document.querySelectorAll(i.burgerBase);
const navMenuAnime = gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.to(navMenuFixed, {
  top: -20,
  //to compensate animation top shift
  duration: .8,
  ease: "back.out(0.8)",
  paused: true
});
const getHeroAnimation = () => {
  const tlHero = gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.timeline();
  tlHero.to(i.headingAccentHero, {
    opacity: 1,
    duration: 2,
    delay: 0.3
  });
  tlHero.from(i.headingAccentHero, {
    x: 80,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(i.headingHeroRest, {
    opacity: 1,
    duration: 2
  }, "<");
  tlHero.from(i.headingHeroRest, {
    x: -80,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(i.textBlockHero, {
    opacity: 1,
    duration: 2
  }, "-=1.5");
  tlHero.from(i.textBlockHero, {
    y: 80,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(i.biddingBlockHero, {
    opacity: 1,
    duration: 2
  }, "<+0.3");
  tlHero.from(i.biddingBlockHero, {
    y: 40,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(i.iconWrapperHero, {
    scale: 1,
    duration: 1.5,
    ease: "elastic.out"
  }, "<+0.2");
  return tlHero;
};
const initScrolledNavigation = () => {
  gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.to(i.scrolledNav, {
    top: -10,
    duration: .7,
    ease: "back.out(1.5)",
    delay: 0.5,
    scrollTrigger: {
      trigger: i.benefitsSection,
      start: "top 5%",
      //end: "bottom 85%",
      toggleActions: "play none none reverse",
      //markers: true,
      /**
       * preventOverlaps vs fastScrollEnd - should be chosen on of them
       */
      preventOverlaps: true //prevent overlapping animations at several trigger animations
      //fastScrollEnd: true, // stop previous animation if the scrollTrigger starts animation again...
    }
  });
};

/**
 * @description It creates parralax effect on the target Element with GSAP
 * @param {string} auxTarget - className of the target html Element
 * @param {string} auxTrigger - className of the trigger html Element
 * @returns {gsap.core.Tween|undefined}
 */
const getBackgroundParallax = (auxTarget, auxTrigger) => {
  const target = document.querySelector(auxTarget);
  const trigger = document.querySelector(auxTrigger);
  if (!target || !trigger) return;
  // start position: the image is shifted up by 10%
  return gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.fromTo(target, {
    yPercent: 10
  },
  // End position: the image moves to -10%
  {
    yPercent: -10,
    ease: "none",
    // Linear movement synchronized with scroll
    scrollTrigger: {
      trigger,
      //The parent container
      start: "top bottom",
      // start animation when top of section enters viewport
      end: "bottom top",
      //end animation when bottom of section leaves viewport
      scrub: 1.5,
      //adds 1.5 of smooth "catch-up" delay (inertia)
      invalidateOnRefresh: true // Recalculates values on window resize for responsiveness
    }
  });
};
const burgerClickHandler = e => {
  //if clicked out of the burger-menu range then to check if the burger is opened and reverse the animation...
  if (!e.target.closest(i.burgerBase)) {
    const isNavActive = navMenuFixed.getAttribute("aria-expanded") === "true";
    if (isNavActive) {
      // Changing aria-expanded for both burger menu buttons and the fixed navigation menu
      (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setAttributes)([burgerHidden, burgerFixed, navMenuFixed], {
        "aria-expanded": !isNavActive
      });
      burgerHidden.classList.remove("opened");
      burgerFixed.classList.remove("opened");

      /// animation of hiding the fixed navigation menu with top: -100%;
      navMenuAnime.reverse();

      //returning scroll to the page...
      //lockScroll(false);
      document.body.style.overflow = "auto";
    }
  }
};
const burgerInitListener = burger => {
  burger.addEventListener("click", e => {
    const burgerMenu = e.target.closest(i.burgerBase);
    if (burgerMenu) {
      e.preventDefault();
      const isExpanded = burger.getAttribute("aria-expanded") === "true";

      // Changing aria-expanded for both burger menu buttons and the fixed navigation menu
      (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setAttributes)([burgerHidden, burgerFixed, navMenuFixed], {
        "aria-expanded": !isExpanded
      });
      if (isExpanded) {
        burgerHidden.classList.remove("opened");
        burgerFixed.classList.remove("opened");
        //lockScroll(false);
        document.documentElement.style.scrollbarGutter = "initial";
        document.body.style.scrollbarGutter = "initial";
        document.body.style.overflow = "auto";
      } else {
        burgerHidden.classList.add("opened");
        burgerFixed.classList.add("opened");
        //lockScroll(true);
        document.documentElement.style.scrollbarGutter = "stable";
        document.body.style.scrollbarGutter = "stable";
        document.body.style.overflow = "hidden";
      }
      if (isExpanded) {
        navMenuAnime.reverse();
      } else {
        navMenuAnime.play();
      }
    }
  });
};
const initBurgerMenu = () => {
  //// animation of the fixed navigation menu
  document.addEventListener("click", burgerClickHandler);

  //adding listener to the burger buttons...
  burgerAll.forEach(burgerInitListener);
};

/// ANIMATION PARAMS
const pageAnimations = {
  // animations for the separate pages
  automation: () => {
    const tlData = {};
    const rollerParallax = getBackgroundParallax(i.automationParallaxBg, i.automationParallax);
    if (rollerParallax) {
      tlData["rollerParallax"] = rollerParallax;
    }
    return tlData;
  },
  common: () => {
    const tlData = {};

    ///////////// SECTION HERO ANIMATION /////////////////
    const tlHero = getHeroAnimation();
    if (hasRealAnimations(tlHero)) {
      tlData["tlHero"] = tlHero;
    }

    ///////////// SECTION SERVICES ANIMATION /////////////////
    const servicesParallax = getBackgroundParallax(i.servicesParallaxBg, i.servicesParallax);
    if (servicesParallax) {
      tlData["servicesParallax"] = servicesParallax;
    }

    ///////////// FADE-IN-LEFT ANIMATIONS ////////////////

    const fadeInLeftAnimations = getAllScrollTwoTweens(gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.utils.toArray(document.querySelectorAll(i.fadeInLeft)), null, "fadeInLeft", {
      opacity: 1,
      duration: 0.7,
      delay: 0.2
    }, {
      x: -60,
      y: 40,
      duration: 1,
      ease: "circ.out"
    });
    //assigning timeline references
    Object.assign(tlData, fadeInLeftAnimations);

    ///////////// FADE-IN-RIGHT ANIMATIONS /////////////////

    const fadeInRightAnimations = getAllScrollTwoTweens(gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.utils.toArray(document.querySelectorAll(i.fadeInRight)), null, "fadeInRight", {
      opacity: 1,
      duration: 0.7,
      delay: 0.2
    }, {
      x: 60,
      y: 40,
      duration: 1,
      ease: "circ.out"
    });
    //assigning timeline references
    Object.assign(tlData, fadeInRightAnimations);

    ///////////// SCALE-IN ANIMATIONS ///////////

    const scaleInAnimations = getAllScrollTwoTweens(gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.utils.toArray(document.querySelectorAll(i.scaleIn)), null, "scaleIn", {
      opacity: 1,
      duration: 0.8
      //delay: 0.2,
    }, {
      scale: 0.7,
      duration: 1.2,
      ease: "back.out(1)"
    });
    //assigning timeline references
    Object.assign(tlData, scaleInAnimations);

    //////////// FADE-IN-UP ANIMATIONS /////////////////

    const fadeInUpAnimations = getAllScrollTwoTweens(gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.utils.toArray(document.querySelectorAll(i.fadeInUp)), null, "fadeInUp", {
      opacity: 1,
      duration: 1,
      delay: 0.2
    }, {
      y: 40,
      duration: 1,
      ease: "circ.out"
    });
    //assigning timeline references
    Object.assign(tlData, fadeInUpAnimations);

    ///////////////// SEPARATE TWEENS ////////////////////

    ///////////// SCROLLED NAVIGATION ANIMATION //////////
    initScrolledNavigation();

    //////////// BURGER MENU OPEN ANIMATION /////////////
    initBurgerMenu();
    return tlData;
  }
};

////////////////  ANIMATION FUNCTIONS ////////////////

function fadeInGallery(elemsArr = []) {
  return getAllScrollTwoTweens(elemsArr, document.querySelector(i.galleryWork), "fadInGallery", {
    opacity: 1,
    duration: 0.8,
    delay: 0.2
  }, {
    scale: 0.7,
    duration: 1,
    ease: "back.out"
  });
}

//for the dynamic and SPA site without reloading, using the flag to avoid multiple listeners
let listenerAdded = false;
const animatePage = () => {
  //if no Listener on DOMContentLoaded then to add Listener onPageLoaded()
  if (document.readyState === "loading" && !listenerAdded) {
    document.addEventListener("DOMContentLoaded", () => onPageLoaded(pageAnimations));
    listenerAdded = true; // Set a flag so that the listener is added only once
  } else {
    return onPageLoaded(pageAnimations);
  }
};

/**
 * It gets the animation instructions Object and returns the Object with the references to the initiated timelines
 * @param {Object} animationData - the Object with the animation instructions for the pages
 * @return {Object} - Returns the Object with the references to all the initiated timelines
 */
function onPageLoaded(animationData) {
  const pageName = document.body.dataset.type;
  const totalTl = {};
  if (animationData.common) {
    Object.assign(totalTl, animationData.common());
  }
  if (pageName in animationData) {
    Object.assign(totalTl, animationData[pageName]());
  }
  requestAnimationFrame(() => gsap_ScrollTrigger_js__WEBPACK_IMPORTED_MODULE_2__.ScrollTrigger.refresh());
  return totalTl;
}

/**
 * Checking the gsap timeline for not empty animations
 * @param {gsap.core.Timeline | gsap.core.Tween} timeline - the gsap timeline to be checked
 * @return {boolean} - Returns true if the timeline has at least one tween with a duration greater than zero.
 */
function hasRealAnimations(timeline) {
  // Getting all child tweens of the timeline
  // Checking if there is at least one tween with a duration greater than zero
  return timeline.getChildren().some(child => child.duration() > 0);
}

/**
 * It creates the Timeline scroll animations with fading in from opacity: 0, and optional gsap.from params which
 * are animated with the opacity animation...
 * @param {HTMLElement} elem  - the HTMLElement
 * @param {HTMLElement} triggerElem - the trigger HTMLElement for the animations at scrollTrigger
 * @param {Object} [gsapToParams={}] - params for the first tween with gsap.to
 * @param {Object} [gsapFromParams={}] - params for the last tween with gsap.from
 * @param {string} [nextAnimePos="<"] - The position for the second tween, indicating when the animation should start relative to the first.
 * @return {gsap.core.Timeline|boolean} - Returns a Timeline with animations, or false if the passed element is not an HTMLElement.
 *
 * @example using first tween gsap.to params for the first animation, and gsap.from params for the last tween
 * getScrollTimelineTwoTweens(elem, triggerElem, { opacity: 1, duration: 0.7, delay: 0.2 }, { x: 80, y: 80, duration: 1, ease: "circ.out", });
 *
 * @example
 * getScrollTimelineTwoTweens(elem, triggerElem, { opacity: 1, duration: 1, delay: 0.2 }, { scale: 0.7, duration: 1, ease: "circ.out", }, "-=1.5");
 */
function getScrollTimelineTwoTweens(elem, triggerElem, gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
  if (!(elem instanceof HTMLElement) || !(triggerElem instanceof HTMLElement)) {
    console.warn(`at getScrollTimeLinePairLeftRight: the given selector: ${elem} or trigger: ${triggerElem} is not HTMLElement... animation is omitted...`);
    return false;
  }

  //The timeline initiation with the ScrollTrigger and its default params...
  const tl = gsap__WEBPACK_IMPORTED_MODULE_1__.gsap.timeline({
    scrollTrigger: {
      trigger: triggerElem,
      start: "top 80%",
      //end: "bottom 85%",
      toggleActions: "play none none reverse",
      //markers: true,
      /**
       * preventOverlaps vs fastScrollEnd - should be chosen on of them
       */
      preventOverlaps: true //prevent overlapping animations at several trigger animations
      //fastScrollEnd: true, // stop previous animation if the scrollTrigger starts animation again...
    }
  });
  tl.to(elem, {
    ...gsapToParams
  });
  tl.from(elem, {
    ...gsapFromParams
  }, nextAnimePos);
  return tl;
}

/**
 * Creates multiple scroll-triggered timelines for elements matching the selector.
 * It makes animation timeline for the each element and returns the Object with the timeline references...
 * @param {Array<HTMLElement>} elemsArr - the Array of the target elements in DOM
 * @param {HTMLElement|null} triggerElem - the trigger element for the scrollTrigger (or null).
 * @param {string} [propKey="tlKey"] - the key part for making unique key of the timeline in the Object to return...
 * @param {Object} [gsapToParams={}] - params for the first tween with gsap.to
 * @param {Object} [gsapFromParams={}] - params for the last tween with gsap.from
 * @param {string} [nextAnimePos="<"] - The position for the second tween, indicating when the animation should start relative to the first.
 * @return {Object} - An object containing timelines with unique keys.
 */
function getAllScrollTwoTweens(elemsArr, triggerElem, propKey = "tlKey", gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
  const tlObj = {};
  let trigger = null;
  if (!Array.isArray(elemsArr)) {
    console.error(`at getAllScrollTwoTweens(): the given "elemsArr" is not Array...`);
    return tlObj;
  }
  if (triggerElem !== null) {
    if (!(triggerElem instanceof HTMLElement) || !document.body.contains(triggerElem)) {
      console.error(`at getAllScrollTwoTweens: the given trigger is not HTMLElement or not in DOM...`);
      return tlObj;
    } else {
      trigger = triggerElem;
    }
  }
  elemsArr.forEach((elem, index) => {
    if (!(elem instanceof HTMLElement) || !document.body.contains(elem)) {
      console.warn(`at getAllScrollTwoTweens: the target element at index ${index} is not HTMLElement or not in DOM...`);
      return;
    }
    const tlKey = `${propKey}_${index}`;
    const tl = getScrollTimelineTwoTweens(elem, trigger || elem, gsapToParams, gsapFromParams, nextAnimePos);
    if (tl && hasRealAnimations(tl)) {
      tlObj[tlKey] = tl;
    }
  });
  return tlObj;
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
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
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
/******/ 		// no chunk on demand loading
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