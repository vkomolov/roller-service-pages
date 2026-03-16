"use strict";

import imagesLoaded from 'imagesloaded';

/**
 * It checks whether the given style rule is supported for the given HTML Element
 * @param {HTMLElement} element - target HTML Element
 * @param {string} param - css rule
 * @param {string} value - the value of the css rule
 * @return {boolean}
 */
export function isStyleSupported(element, param, value) {
  return param in element.style && CSS.supports(param, value);
}

/**
 * it migrates the given HTML Element to another HTML parent
 * @param {HTMLElement} target - the target HTML Element
 * @param {HTMLElement} parentFrom - the current HTML parent
 * @param {HTMLElement} parentTo - the target HTML parent to migrate to
 */
export function migrateElement({ target, parentFrom, parentTo }) {
  if (target.isConnected) {
    (target.parentElement === parentFrom ? parentTo : parentFrom).appendChild(target);
  }
  else {
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
export function lockedEventListener(event, listenerOwner, delay = 300) {
  if (listenerOwner instanceof HTMLElement &&
    !listenerOwner.isConnected) {
    throw new Error("Provided listenerOwner at lockedEventListener() is not a valid DOM element...");
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
export function toggleClassOnIntersection(
  targetElement,
  triggerElement,
  activeClass,
  root = null,
  rootMargin = "-1px 0px 0px 0px"
) {
  if (!targetElement?.isConnected || !triggerElement?.isConnected) {
    throw new Error(
      "[toggleClassOnIntersection]: targetElement or triggerElement is not connected to the DOM."
    );
  }

  let isClassActive = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
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
    },
    {
      root,
      threshold: 0,
      rootMargin
    }
  );

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
export function observeIntersection(targetElement, options = {}) {
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0,
    onEnter,
    onLeave,
    onChange,
    once = false
  } = options;

  if (!targetElement?.isConnected) {
    throw new Error(
      "[observeIntersection]: targetElement is not connected to the DOM."
    );
  }

  let wasIntersecting = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
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
    },
    {
      root,
      rootMargin,
      threshold
    }
  );

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
export function setAttributes(elements = [], targetAttr = {}) {

  elements.forEach((element, i) => {
    if (!(element instanceof HTMLElement)) {
      throw new Error(`one of the elements at index ${i} is not the instance of HTMLElement...`);
    }

    Object.entries(targetAttr).forEach(([attr, value]) => {
      element.setAttribute(attr, (value !== null && value !== undefined) ? value.toString() : "");
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
export function initLockScroll() {
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
  }

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
  }

  /**
   * Removes scroll lock styles
   */
  const applyUnlock = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = state.originalPaddingRight;
    state.rafId = null;
  }

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
  }

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
  }
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
  const { background } = options;

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
    const hasBackground =
      background === true || child.matches(background);

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
    offsetHeight: img.offsetHeight,
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
  return new Promise((resolve) => {
    // Image already loaded (cached)
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      resolve(extractDimensions(img));
      return;
    }

    // Wait for load event
    const handleLoad = () => resolve(extractDimensions(img));
    const handleError = () => resolve(null);

    img.addEventListener('load', handleLoad, { once: true });
    img.addEventListener('error', handleError, { once: true });
  });
}

/**
 * Removes broken images and their parent elements from DOM
 * @param {Array<{src: string, element: HTMLElement}>} brokenImages - Array of broken image data
 */
function removeBrokenImages(brokenImages) {
  if (brokenImages.length === 0) return;

  console.warn(
    `[getImagesLoaded] Removed ${brokenImages.length} broken image(s):`,
    brokenImages.map((b) => b.src)
  );

  brokenImages.forEach(({ element }) => {
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

  instance.images.forEach((item) => {
    const img = item.img;
    const parentElement = parentMap.get(img);

    if (!item.isLoaded) {
      brokenImages.push({
        src: img.src || img.currentSrc || 'unknown',
        element: parentElement,
      });
    } else {
      loadedPromises.push(
        getImageDimensions(img).then((size) => ({
          element: parentElement,
          size,
        }))
      );
    }
  });

  removeBrokenImages(brokenImages);

  const results = await Promise.all(loadedPromises);
  return results.filter((r) => r.size !== null);
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
export async function getImagesLoaded(container, options = {}) {
  // Validate container
  validateContainer(container);

  // Return a promise that resolves when imagesLoaded completes
  return new Promise((resolve, reject) => {
    try {
      imagesLoaded(container, options, async (instance) => {
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
export async function createMasonry(containerSelector, params = {}) {
  const options = {
    gap: 0,
    ...params,
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

    const { gap } = options;
    const { columns, freeWidth } = getColumnsNumber(containerWidth, itemWidth, gap);
    const leftOffset = freeWidth / 2;

    // Set container styles
    container.style.position = 'relative';
    container.style.overflowX = 'hidden';

    // Initialize position arrays
    const posLeftArr = Array.from(
      { length: columns },
      (_, i) => leftOffset + i * (itemWidth + gap)
    );
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

  return { columns, freeWidth };
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
export function activateNavLink(navLinkSelector, pageType, activeClass, anchorLink) {
  // Check if all necessary arguments are provided, otherwise, log a warning.
  if (!navLinkSelector || !pageType || !activeClass || !anchorLink) {
    console.warn("at activateNavLink: no given all arguments");
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
      navItem.setAttribute("href", anchorLink);
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
export function initLangSwitcher(params = {}) {
  const {
    langSwitcherSelector = "#lang-switcher",
    iconLangSelector = ".lang-switcher__lang-icon",
    langActiveSelector = ".active",
    langListSelector = "#listbox",
    langOptionArr = ["ua", "ru"],
    dataSetParam = "lang"
  } = params;

  const notFoundError = (selector, addition="") => {
    console.error(
      `at initLangSwitcher: the given selector: ${selector} is not found in DOM`,
      addition
    );
  }

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

  const optionListElems = langVerArr.map((langVer) => {
    const listElem = document.createElement("li");
    listElem.classList.add(getSelectorName(iconLangSelector));
    listElem.setAttribute("role", "option");
    listElem.setAttribute(`data-${dataSetParam}`, langVer);

    const spanElem = document.createElement("span");
    spanElem.textContent = langVer;
    listElem.appendChild(spanElem);

    return listElem;
  });

  langList.append(...optionListElems);

  const handleClick = ({ target }) => {
    const clickedLang = target.closest(iconLangSelector).dataset[dataSetParam];
    window.location.replace(url.replace(`/${langActive}/`, `/${clickedLang}/`));
  };

  langList.addEventListener("click", handleClick);

}

/**
 * Removes the "." and "#" characters from the beginning of the selector and returns its name.
 * @param {string} selector - Selector (example: ".class", "#id", "tag").
 * @returns {string} Selector name without symbols "." и "#".
 */
export function getSelectorName(selector) {
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
export function createElementWithClass(tag, ...classNames) {
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
export function replaceFilePath(url, targetFolder) {
  //to clean from symbols as "./thumbs/", "./thumbs", "/thumbs/", "/thumbs" to "thumbs"
  const nestedFolder = targetFolder.replace(/^\.?\/?|\/?\.?$/, "");

  return url.replace(new RegExp(`/${nestedFolder}/`), "/"); // If no match is found, return the original URL
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
export function createModalState() {
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
export function createModalHandlers(dom, state, callbacks) {
  const handleKeydown = (event) => {
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

  const handleClick = (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const actionMap = {
      close: callbacks.close,
      prev: callbacks.prev,
      next: callbacks.next
    };

    const action = actionMap[button.dataset.action];
    if (action) action();
  };

  return { handleKeydown, handleClick };
}

/**
 * Calculates navigation index with wrap-around
 * @param {number} current - Current index
 * @param {number} total - Total items
 * @param {string} direction - 'prev' or 'next'
 * @returns {number} New index
 */
export function calculateNavIndex(current, total, direction) {
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
export function attachModalListeners(root, handleClick, handleKeydown, touch) {
  root.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
  touch.bind();
}

/**
 * Detaches modal event listeners
 * @param {HTMLElement} root - Modal root element
 * @param {Function} handleClick - Click handler
 * @param {Function} handleKeydown - Keydown handler
 * @param {{unbind: Function}} touch - Touch handler
 */
export function detachModalListeners(root, handleClick, handleKeydown, touch) {
  touch.unbind();
  root.removeEventListener("click", handleClick);
  document.removeEventListener("keydown", handleKeydown);
}

/**
 * Cleanup modal on close with fade animation
 * @param {Object} dom - Modal DOM elements
 * @param {ModalState} state - Modal state reference
 * @param {number} fadeDuration - Fade out duration in ms
 * @returns {Promise<void>}
 */
export async function cleanupModal(dom, state, fadeDuration = 300) {
  dom.root.style.opacity = "0";

  await new Promise(resolve => setTimeout(resolve, fadeDuration));

  dom.root.remove();
  dom.root.style.opacity = "";

  document.body.style.overflow = "";

  // Reset state
  state.currentIndex = null;
  if (dom.currentImage) {
    dom.currentImage.remove();
    dom.currentImage = null;
  }
}