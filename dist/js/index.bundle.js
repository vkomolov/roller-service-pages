/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/helpers/funcs.js":
/*!*********************************!*\
  !*** ./src/js/helpers/funcs.js ***!
  \*********************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createKeySet: function() { return /* binding */ createKeySet; },
/* harmony export */   getInvalidKeys: function() { return /* binding */ getInvalidKeys; },
/* harmony export */   getLocalStorage: function() { return /* binding */ getLocalStorage; },
/* harmony export */   getMatchedFromArray: function() { return /* binding */ getMatchedFromArray; },
/* harmony export */   getRandomElemsfromArray: function() { return /* binding */ getRandomElemsfromArray; },
/* harmony export */   isInSet: function() { return /* binding */ isInSet; },
/* harmony export */   isKeyOf: function() { return /* binding */ isKeyOf; },
/* harmony export */   randomNum: function() { return /* binding */ randomNum; },
/* harmony export */   setLocalStorage: function() { return /* binding */ setLocalStorage; }
/* harmony export */ });


/**** TYPE DEFINITIONS ****/
/**
 * for typing of argument params of {@link getInvalidKeys}
 * @typedef {{
 *   invalidValues?: unknown[]
 * }} TGetInvalidKeysParams
 */
function randomNum(max, min) {
  return Math.floor(Math.random() * max) + min;
}

/**
 * Filters and returns the elements from `values` that are present in `targetArr`.
 *
 * This function checks if the first argument `targetArr` is a non-empty array and then
 * filters the remaining arguments (`...values`) to find which ones are included in `targetArr`.
 * If `targetArr` is not a valid array or is empty, a warning is logged to the console and an empty array is returned.
 *
 * @param {Array<unknown>} targetArr - The array to check for matches.
 * @param {...*} values - A list of values to check against the `targetArr`.
 *
 * @returns {Array<unknown>} - An array of matched values from `values` that exist in `targetArr`.
 *
 * @example
 * const result = getMatchedFromArray([1, 2, 3, 4], 2, 4, 6);
 * console.log(result); // Output: [2, 4]
 *
 * @example
 * const result = getMatchedFromArray([], 1, 2);
 * console.log(result); // Output: []
 */
function getMatchedFromArray(targetArr, ...values) {
  if (!Array.isArray(targetArr) || !targetArr.length) {
    console.error(`at getMatchedFromArray: the given array of values is not Array or empty...`);
    return [];
  }
  const targetSet = new Set(targetArr); // Convert targetArr to Set for O(1) lookups
  const flatValues = values.flat(); //to flat possible arrays in the array of values
  return flatValues.filter(val => targetSet.has(val));
}

/**
 *  It randomly chooses the requested amount of elems from the given array
 * @param {Array} fromArray - target array
 * @param {number} [maxRandCount=1] max number of the random elems from the given array
 * @return {*[] | []} the array of the random elements from the given array
 */
function getRandomElemsfromArray(fromArray, maxRandCount = 1) {
  if (!Array.isArray(fromArray) || fromArray.length < maxRandCount) {
    console.error(`the length of the given array ${fromArray.length} should not be less than max random count ${maxRandCount}...`);
    return [];
  }

  // Shuffle the array randomly (Fisher-Yates method)
  for (let i = fromArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fromArray[i], fromArray[j]] = [fromArray[j], fromArray[i]]; // Swapping elements
  }

  // Return the first maxRandCount numbers
  return fromArray.slice(0, maxRandCount);
}

/**
 * It gets the LocalStorage by name, validating by the time limit in days;
 * If the time limit is expired, then to return false;
 * If the LocalStorage does not exist then to return false;
 * Else to return the data;
 * @param { string } name of the LocalStorage data;
 * @param { number } [timeLimit=1]: number of days;
 * @returns { object | boolean } the data, stored in the LocalStorage...
 * or false, if its not found or expired by time
 * */
function getLocalStorage(name, timeLimit = 1) {
  const storage = localStorage.getItem(name);
  let innData;
  if (storage) {
    innData = JSON.parse(storage);
    const creationDate = innData.creationDate;
    const currentDate = Date.now();
    if ((currentDate - creationDate) / 1000 / 60 / 60 / 24 > timeLimit) {
      return false;
    }
    return innData;
  }
  return false;
}

/**@description it receives the data and update it with the current Date
 * and sets the localStorage;
 * @param {string} name The name of the LocalStorage to be set
 * @param {Object} data which is fetched
 * */
function setLocalStorage(name = "localData", data) {
  //log(data, "setting localStorage Data");

  const dataWithDate = {
    data,
    creationDate: Date.now()
  };
  localStorage.setItem(name, JSON.stringify(dataWithDate));
}

/**
 * Type guard that checks if a key exists in an object.
 * Narrows the key type to keyof T, allowing safe indexed access.
 *
 * @template {Record<PropertyKey, unknown>} T
 * @param {T} obj - The object to check the key against.
 * @param {PropertyKey} key - The key to check.
 * @returns {key is keyof T} True if key exists in the object.
 *
 * @example
 * const handlers = { head: (v) => v, main: (v) => v };
 * const key = "head";
 * if (isKeyOf(handlers, key)) {
 *   handlers[key](value); // TS knows key is "head" | "main"
 * }
 */
function isKeyOf(obj, key) {
  return key in obj;
}

/**
 * Returns the names of missing or invalid object properties.
 *
 * A property is considered missing if:
 * - it does not exist as an own property of the object;
 * - or its value matches one of the specified invalid values.
 *
 * String values are trimmed before comparison, so a value containing
 * only whitespace is treated as an empty string (`''`).
 *
 * @param {Record<string, unknown>} targetObj
 * @param {string[]} keys
 * @param {TGetInvalidKeysParams} [params]
 * @returns {string[]}
 *
 * @example
 * getInvalidKeys(
 *   targetObj,
 *   ['selector', 'pageType'],
 *   {invalidValues: [undefined, null, '']}
 * );
 *
 * @example
 * getInvalidKeys(
 *   targetObj,
 *   ['count', 'enabled'],
 *   {invalidValues: [undefined, null, '', 0]}
 * );
 *
 */
function getInvalidKeys(targetObj, keys, params) {
  const invalidValues = params?.invalidValues ?? [];
  const invalidSet = new Set(invalidValues);
  return keys.filter(key => {
    if (!Object.hasOwn(targetObj, key)) {
      return true;
    }
    const value = targetObj[key];
    return invalidSet.has(typeof value === "string" ? value.trim() : value);
  });
}

/**
 * Creates a Set containing the keys of an object.
 *
 * The generic key type is preserved instead of being widened
 * to `string`.
 *
 * @template {string} K
 *
 * @param {Record<K, unknown>} object
 *
 * @returns {Set<K>}
 */
function createKeySet(object) {
  return new Set(/** @type {K[]} */
  Object.keys(object));
}

/**
 * Checks whether a string exists in a Set of valid values.
 *
 * The successful check narrows the value from `string`
 * to the Set's element type.
 *
 * @template {string} T
 *
 * @param {string} value - Value to validate.
 * @param {Set<T>} values - Set containing valid values.
 *
 * @returns {value is T} Whether the value exists in the Set.
 */
function isInSet(value, values) {
  return values.has(/** @type {T} */value);
}

/***/ }),

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
/* harmony export */   checkEventCurrentTarget: function() { return /* binding */ checkEventCurrentTarget; },
/* harmony export */   checkHtmlElement: function() { return /* binding */ checkHtmlElement; },
/* harmony export */   cleanupModal: function() { return /* binding */ cleanupModal; },
/* harmony export */   createElementWithClass: function() { return /* binding */ createElementWithClass; },
/* harmony export */   createMasonry: function() { return /* binding */ createMasonry; },
/* harmony export */   createModalHandlers: function() { return /* binding */ createModalHandlers; },
/* harmony export */   createModalState: function() { return /* binding */ createModalState; },
/* harmony export */   detachModalListeners: function() { return /* binding */ detachModalListeners; },
/* harmony export */   getDOMElement: function() { return /* binding */ getDOMElement; },
/* harmony export */   getElements: function() { return /* binding */ getElements; },
/* harmony export */   getImagesLoaded: function() { return /* binding */ getImagesLoaded; },
/* harmony export */   getSelectorName: function() { return /* binding */ getSelectorName; },
/* harmony export */   initLangSwitcher: function() { return /* binding */ initLangSwitcher; },
/* harmony export */   initLockScroll: function() { return /* binding */ initLockScroll; },
/* harmony export */   isHTMLElement: function() { return /* binding */ isHTMLElement; },
/* harmony export */   isStyleSupported: function() { return /* binding */ isStyleSupported; },
/* harmony export */   lockDocumentScroll: function() { return /* binding */ lockDocumentScroll; },
/* harmony export */   lockedEventListener: function() { return /* binding */ lockedEventListener; },
/* harmony export */   logInitError: function() { return /* binding */ logInitError; },
/* harmony export */   migrateElement: function() { return /* binding */ migrateElement; },
/* harmony export */   observeIntersection: function() { return /* binding */ observeIntersection; },
/* harmony export */   replaceFilePath: function() { return /* binding */ replaceFilePath; },
/* harmony export */   requireElements: function() { return /* binding */ requireElements; },
/* harmony export */   restoreDocumentScroll: function() { return /* binding */ restoreDocumentScroll; },
/* harmony export */   setAttributes: function() { return /* binding */ setAttributes; },
/* harmony export */   toggleClassOnIntersection: function() { return /* binding */ toggleClassOnIntersection; }
/* harmony export */ });
/* harmony import */ var imagesloaded__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! imagesloaded */ "./node_modules/imagesloaded/imagesloaded.js");
/* harmony import */ var _funcs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./funcs.js */ "./src/js/helpers/funcs.js");





//////////////// TYPE DEFINITIONS /////////////////

/**
 * TBurgerElements
 * DOM elements required by the navigation menu.
 *
 * @typedef {Object} TBurgerElements
 * @property {Element} navMenuFixed
 * @property {Element} burgerHidden
 * @property {Element} burgerFixed
 * @property {Element[]} burgerNavAll
 */

/**
 * TDOMSelectorConfig
 * Configuration for a generic DOM element lookup.
 *
 * @typedef {Object} TDOMSelectorConfig
 * @property {string} key - Property name used in the resulting object.
 * @property {string} selector - CSS selector used to find the element(s).
 * @property {boolean} [multiple=false] - Whether all matching elements should be returned.
 */

/**
 * TNavMenuSelector
 * Configuration for navigation menu DOM element lookup.
 *
 * Specializes the generic selector configuration by restricting `key`
 * to the known properties of `TBurgerElements`.
 *
 * @typedef {Omit<TDOMSelectorConfig, "key"> & {
 *     key: keyof TBurgerElements
 * }} TNavMenuSelector
 */

/**
 * ImageSize
 *
 * @typedef {Record<string, number>} ImageSize
 * @property {number} naturalWidth - Original image width in pixels
 * @property {number} naturalHeight - Original image height in pixels
 * @property {number} offsetWidth - Rendered width including padding/borders
 * @property {number} offsetHeight - Rendered height including padding/borders
 */

/**
 * LoadedImageResult
 *
 * @typedef {Record<string, unknown>} LoadedImageResult
 * @property {HTMLElement} element - The parent element containing the image
 * @property {ImageSize} size - Dimension information
 */

/**
 * TActivateNavlinkParams
 * Type definition for arguments of {@link activateNavLink}
 *
 * @typedef {Object} TActivateNavlinkParams
 * @property {string} navLinkSelector - The CSS selector to find the navigation link items.
 * @property {string} pageType - The type of the page to match with the pagesVersions attribute of the navigation items.
 * @property {string} activeClass - The class name to add to the matched navigation link items.
 * @property {string} anchorLink - The URL to set as the `href` attribute for the matched navigation items.
 */

/**
 * TInitLangSwitcherParams
 * Type definition for arguments of {@link initLangSwitcher}
 *
 * @typedef {Object} TInitLangSwitcherParams
 * @property {string} langSwitcherSelector - Selector for the root container.
 * @property {string} langSwitcherCurrent - Selector for language button to open dropDown lang menu...
 * @property {string} langSwitcherButton - Selector for language button.
 * @property {string} langSwitcherItem - Selector for <li> in the drop-down list of not active language vers...
 * @property {string} langActiveSelector - Selector for active language element.
 * @property {string} langListSelector - Selector for options container.
 * @property {string[]} langOptionArr - Supported language codes.
 * @property {string} dataSetKey - Dataset parameter name.
 *
 */

/**
 * TGetLangItemsParams
 *
 * @description - the type of argument "params" for the function {@link getLangItems}
 *
 * @typedef {Record<string, string>} TGetLangItemsParams
 * @property {string} langSwitcherItem - className of the language list item <li>
 * @property {string} langSwitcherButton - className of the buttons <button>
 * @property {string} dataSetKey - the key of the dataset
 *
 */

/**
 * TLogErrorParams
 *
 * @typedef {{
 *   component: string, //Component or module name.
 *   message: string, //Error description
 *   details?: unknown,  //Optional data
 * }} TLogErrorParams
 */

/**
 * ModalState
 *
 * @typedef {Object} ModalState
 * @property {number|null} currentIndex
 * @property {boolean} isOpen
 * @property {boolean} isLoading
 * @property {HTMLElement|null} currentImage
 */

//////////////// END OF TYPE DEFINITIONS /////////////////

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
 * @typedef {{
 *   target: HTMLElement,
 *   parentFrom: HTMLElement,
 *   parentTo: HTMLElement,
 * }} TMigrageElementParams
 */
/**
 * it migrates the given HTML Element to another HTML parent
 * @param {HTMLElement} target - the target HTML Element
 * @param {HTMLElement} parentFrom - the current HTML parent
 * @param {HTMLElement} parentTo - the target HTML parent to migrate to
 */
function migrateElement(target, parentFrom, parentTo) {
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

  /**
   * @type {() => {}} cb
   */
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
 *  @param {Element[]} elements - target Elements to set attributes...
 * @param {Record<string, string | number | boolean | null | undefined>} [targetAttr={}] the list of
 * HTMLElements to be set with the attributes
 * @returns {void}
 */
function setAttributes(elements = [], targetAttr = {}) {
  elements.forEach((element, i) => {
    if (!(element instanceof Element)) {
      const errorMessage = `one of the elements at index ${i} is not the instance of HTMLElement...`;
      logInitError({
        component: "setAttributes",
        message: errorMessage,
        details: {
          element
        }
      });
      throw new Error(`[setAttributes]: ${errorMessage}`);
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

/**
 * Validates that container is attached to DOM
 * @param {HTMLElement} container - Element to validate
 * @throws {Error} If container is not connected to DOM
 */
function checkInDOM(container) {
  if (!container?.isConnected) {
    throw new Error('[checkInDOM]: Container must be a DOM element connected to the document');
  }
}

/**
 * Checks whether Element is an HTMLElement.
 * @param {unknown} element
 * @returns {element is HTMLElement}
 */
function isHTMLElement(element) {
  return element instanceof HTMLElement;
}

/**
 * Checks whether Element is an HTMLElement.
 * Serves as a Type Guard for TypeScript/JSDoc.
 * @param {unknown} element
 * @returns {element is HTMLElement}
 */
function checkHtmlElement(element) {
  const isHTMLElem = isHTMLElement(element);
  if (!isHTMLElem) {
    // Cast to any type inside JSDoc comment so TS allows reading properties
    const unsafeTarget = /** @type {*} */element;
    logInitError({
      component: "checkHtmlElement",
      message: `Expected HTMLElement, but got ${element?.constructor?.name || typeof element}`,
      details: {
        type: typeof element,
        tagName: unsafeTarget?.tagName,
        className: unsafeTarget?.className
      }
    });
    return false;
  }
  return true;
}

/**
 * Finds an element in the DOM, checks its existence, and types it for JSDoc/TS.
 * If the element is not found, logs an error.
 *
 * @template {Element} T - Expected element type (e.g., HTMLButtonElement)
 * @param {string} selector - CSS selector to search for
 * @param {Document | Element | DocumentFragment} [context=document] - Search context.
 * @returns {T | undefined} Returns the element or null (to safely exit the function)
 *
 * @sample
 * above:@template {HTMLButtonElement}
 * const button = getDOMElement('.js-submit-btn');
 *
 * @sample
 * above:@template {HTMLFormElement}
 * const form = getDOMElement('#login-form');
 * if (!form) return;
*
 */
function getDOMElement(selector, context = document) {
  const element = context.querySelector(selector);
  if (!element) {
    logInitError({
      component: "getDOMElement",
      message: `Element with selector "${selector}" was not found in the DOM.`,
      details: {
        parent: parent.constructor.name
      }
    });
    return;
  }

  // returning the element by casting it to the generic type T
  return /** @type {T} */element;
}

/**
 * Returns DOM element(s) matching the specified CSS selector.
 *
 * Searches within the provided context and logs an initialization error
 * when no matching elements are found.
 *
 * The generic type `T` describes the expected element type at the call site.
 * Runtime type validation is intentionally not performed by this function.
 *
 * @template {Element} T
 *
 * @param {string} selector
 * CSS selector used to find the element(s).
 *
 * @param {Document | Element | DocumentFragment} [context=document]
 * DOM context in which the selector should be searched.
 *
 * @param {boolean} [multiple=true]
 * Whether to return all matching elements.
 * When `false`, only the first matching element is returned.
 *
 * @returns {T[]}
 * Array containing the matched element(s).
 * Returns an empty array when no matching element is found.
 *
 * @example
 * ..@type {HTMLButtonElement[]}
 * const buttons = getElements(".button");
 *
 * @example
 * ..@type {HTMLElement[]}
 * const header = getElements("#header", document, false);
 *
 * @example
 * You may also grab alone Element with multiple selection, but recommended to use multiple: false
 * ..@type {HTMLButtonElement[]}
 * const [button] = getElements(".button", modal);
 */
function getElements(selector, context = document, multiple = true) {
  if (multiple) {
    /**
     * `querySelectorAll()` returns a NodeListOf<Element>.
     *
     * The generic type `T` cannot be inferred from the CSS selector,
     * therefore the cast documents the expected type declared by the caller.
     */
    const elements = /** @type {T[]} */
    [...context.querySelectorAll(selector)];
    if (!elements.length) {
      logInitError({
        component: "getElements",
        message: `No elements matched selector "${selector}". Array is empty.`,
        details: {
          context: context.constructor.name,
          multiple: true
        }
      });
    }
    return elements;
  }
  const element = context.querySelector(selector);
  if (!element) {
    logInitError({
      component: "getElements",
      message: `Element with selector "${selector}" was not found in the DOM.`,
      details: {
        context: context.constructor.name,
        multiple: false
      }
    });
    return [];
  }

  /**
   * `querySelector()` returns Element | null.
   *
   * The runtime check above guarantees that `element` is not null.
   * The generic cast describes the element type expected by the caller.
   */
  return [(/** @type {T} */element)];
}

/**
 * Retrieves required DOM elements and groups them into an object.
 *
 * Each selector configuration defines:
 * - the property key used in the resulting object;
 * - the CSS selector used for lookup;
 * - whether one or all matching elements should be returned.
 *
 * The function throws an error when any required selector does not match
 * at least one element.
 *
 * `getElements()` is used internally for DOM lookup and diagnostic logging.
 *
 * @param {TDOMSelectorConfig[]} selectors
 * List of DOM selector configurations.
 *
 * @param {Document | Element | DocumentFragment} [context=document]
 * DOM context in which all selectors should be searched.
 *
 * @returns {Record<string, Element | Element[]>}
 * Object whose keys are taken from the `key` property of each selector
 * configuration.
 *
 * @throws {Error}
 * Throws when a required selector does not match any DOM element.
 *
 * @example
 * const DOM = requireElements([
 *     {
 *         key: "navMenuHidden",
 *         selector: SELECTORS.navMenuHidden,
 *     },
 *     {
 *         key: "burgerHidden",
 *         selector: SELECTORS.burgerHidden,
 *     },
 *     {
 *         key: "burgerFixed",
 *         selector: SELECTORS.burgerFixed,
 *     },
 *     {
 *         key: "burgerNavAll",
 *         selector: SELECTORS.burgerNavAll,
 *         multiple: true,
 *     },
 * ]);
 *
 * DOM.navMenuHidden.classList.add("opened");
 * DOM.burgerNavAll.forEach((button) => {
 *     button.classList.add("active");
 * });
 */
function requireElements(selectors, context = document) {
  /**
   * The function is intentionally generic at runtime.
   *
   * The exact structure of the resulting object depends on the
   * selector configuration passed by the caller.
   *
   * @type {Record<string, Element | Element[]>}
   */
  const elements = {};
  for (const {
    key,
    selector,
    multiple = false
  } of selectors) {
    /**
     * `getElements()` returns an array in both single and multiple modes.
     *
     * When `multiple` is false, the array contains one element.
     * When `multiple` is true, it contains all matching elements.
     */
    const result = getElements(selector, context, multiple);

    /**
     * `getElements()` returns an empty array when nothing was found.
     *
     * For `requireElements()`, an absent required element is a fatal
     * initialization error, therefore execution stops immediately.
     */
    if (!result.length) {
      const errorMessage = `Required DOM element missing. ` + `Key: "${key}", Selector: "${selector}"`;
      logInitError({
        component: "requireElements",
        message: errorMessage
      });
      throw new Error(`[requireElements]: ${errorMessage}`);
    }

    /**
     * Store either the first element or the complete result array
     * according to the selector configuration.
     */
    elements[key] = multiple ? result : result[0];
  }
  return elements;
}

/**
 * Locks document scrolling while the Burger navigation is open.
 *
 * The scrollbar gutter is kept stable to prevent the layout from
 * shifting when the browser removes the document scrollbar after
 * scrolling is disabled.
 *
 * Both the root element and the document body receive the stable
 * scrollbar gutter configuration to keep their scrollbar behavior
 * synchronized.
 *
 * @returns {void}
 */
function lockDocumentScroll() {
  // Preserve the scrollbar width while the navigation is open.
  document.documentElement.style.scrollbarGutter = "stable";
  document.body.style.scrollbarGutter = "stable";

  // Prevent the document from scrolling behind the navigation.
  document.body.style.overflow = "hidden";
}

/**
 * Restores the document's default scrolling behavior.
 *
 * This function resets the scrollbar gutter configuration on both
 * the root element and the document body, then restores normal
 * document scrolling.
 *
 * It is intended to be called when the Burger navigation is closed
 * and the document no longer needs to be locked.
 *
 * @returns {void}
 */
function restoreDocumentScroll() {
  // Restore the default automatic scrollbar gutter behavior.
  document.documentElement.style.scrollbarGutter = "auto";
  document.body.style.scrollbarGutter = "auto";

  // Restore normal document scrolling.
  document.body.style.overflow = "auto";
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
  // Validate container or throws error...
  checkInDOM(container);

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
 * @param {TActivateNavlinkParams} params
 * @returns {void} This function does not return any value.
 *
 * @example
 * // Example usage:
 * activateNavLink({
 * navLinkSelector: '.nav-link',
 * pageType: 'home',
 * activeClass: 'active',
 * anchorLink: '#homeAnchor'
 * });
 */
function activateNavLink(params) {
  // Check if all necessary arguments are provided, otherwise, log a warning.
  /** @type {(keyof TActivateNavlinkParams)[]} */
  const requiredKeys = ["navLinkSelector", "pageType", "activeClass", "anchorLink"];
  const missingKeys = (0,_funcs_js__WEBPACK_IMPORTED_MODULE_1__.getInvalidKeys)(params, requiredKeys, {
    invalidValues: ["", undefined, null, 0]
  });
  if (missingKeys.length) {
    logInitError({
      component: "activateNavLink",
      message: `Missing required parameters:\n${missingKeys.join("\n")}`,
      details: params
    });
    return;
  }
  const {
    navLinkSelector,
    pageType,
    activeClass,
    anchorLink
  } = params;

  // Get all navigation link items using the provided selector.
  const navLinkItems = /** @type {HTMLAnchorElement[]} */
  getElements(navLinkSelector, document, true);
  // If no matching navigation items are found, log a warning and exit.
  if (!navLinkItems.length) return;

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
 * Logs an initialization error with optional diagnostic details.
 *
 * @param {TLogErrorParams} params
 * @returns {void}
 *
 * @example
 * logInitError({
 *     component: "initLangSwitcher",
 *     message: 'Element ".lang-switcher" was not found.'
 * });
 *
 * @example
 * logInitError({
 *     component: "initLangSwitcher",
 *     message: 'Button has no data-lang attribute.',
 *     details: button
 * });
 */
function logInitError(params) {
  const {
    component,
    message,
    details
  } = params;
  const prefix = `[${component}]`;
  if (details !== undefined) {
    console.error(`${prefix}: ${message}`, details);
    return;
  }
  console.error(`${prefix} ${message}`);
}

/**
 * Handles language selection.
 * @param {string} dataSetKey - the key of the dataset-[key]: dataset-lang
 * @param {string} langActive - active version of language
 *
 * @return ()=>{} //returning cb for {@link initLangSwitcher}
 */
function getLangClickHandler(dataSetKey, langActive) {
  /**
   * the callback for the click listener at langListSelector "#lang-list"
   * @param {MouseEvent}  event
   */
  return event => {
    const eTarget = event.target;
    if (!(eTarget instanceof Element)) {
      // Cast to any type inside JSDoc comment so TS allows reading properties
      const unsafeTarget = /** @type {*} */eTarget;
      logInitError({
        component: "getLangClickHandler",
        message: `Expected Element, but got ${eTarget?.constructor?.name || typeof eTarget}`,
        details: {
          type: typeof eTarget,
          tagName: unsafeTarget?.tagName,
          className: unsafeTarget?.className
        }
      });
      return;
    }
    const clickedLang = getClickedLanguage(eTarget, dataSetKey);
    if (!clickedLang) return;
    redirectToLanguage(langActive, clickedLang);
  };
}

/**
 * @param {string} langActive
 * @param {string} clickedLang
 * @return {void}
 */
function redirectToLanguage(langActive, clickedLang) {
  const currentUrl = new URL(window.location.href);
  currentUrl.pathname = currentUrl.pathname.replace(`/${langActive}/`, `/${clickedLang}/`);
  window.location.replace(currentUrl.toString());
}

/**
 *
 * @param {Element} eTarget
 * @param {string} dataSetKey
 * @return {string|undefined}
 */
function getClickedLanguage(eTarget, dataSetKey) {
  //const langElement = e.target.closest("[data-lang]");
  //const langElement = e.target.closest("button");
  const langElement = eTarget.closest(`[data-${dataSetKey}]`);

  //'dataset' is guaranteed only for HTMLElement (HTMLButtonElement...)
  if (!langElement || !checkHtmlElement(langElement)) return;

  //langElement is already checked to be HTMLElement and has "dataset" property...
  const dataSetLang = langElement.dataset;
  const clickedLang = dataSetLang[dataSetKey];
  if (!clickedLang) {
    logInitError({
      component: "getLangClickHandler",
      message: `The given HTMLElement has no data-set attributes or not valid:`,
      details: {
        dataset: dataSetLang,
        tagName: langElement?.tagName,
        className: langElement?.className
      }
    });
    return;
  }
  return clickedLang;
}

/**
 * Toggles the expanded state of an interactive element.
 * it is made for {@link toggleAriaExpandedMenu}
 * @param {HTMLElement} element - Interactive element exposing the `ariaExpanded` property.
 * @returns {void}
 */
function toggleAriaExpanded(element) {
  const expanded = element.ariaExpanded === "true";
  element.ariaExpanded = `${!expanded}`;
}

/**
 * Handles click on the current language button.
 *
 * @param {MouseEvent} event - Mouse click event.
 * @returns {void}
 */
function toggleAriaExpandedMenu(event) {
  //checking HTMLElement type of event.currentTarget
  if (!checkEventCurrentTarget(event)) return;
  const curTarget = event.currentTarget;
  toggleAriaExpanded(curTarget);
}

/**
 * Opens the language menu.
 *
 * @param {HTMLElement} currentButton - Element with attributes dataSet
 * @returns {void}
 */
function openLanguageMenu(currentButton) {
  currentButton.ariaExpanded = "true";
}

/**
 * Closes the language menu.
 *
 * @param {HTMLElement} currentButton
 * @returns {void}
 */

function closeLanguageMenu(currentButton) {
  currentButton.ariaExpanded = "false";
}

/**
 * Checks whether the currentTarget is an HTMLElement.
 * Serves as a Type Guard for TypeScript/JSDoc.
 *
 * @param {MouseEvent|KeyboardEvent} event
 * @returns {event is (MouseEvent|KeyboardEvent) & { currentTarget: HTMLElement }}
 */
function checkEventCurrentTarget(event) {
  const curTarget = event.currentTarget;
  if (!isHTMLElement(curTarget)) {
    // Cast to any type inside JSDoc comment so TS allows reading properties
    const unsafeTarget = /** @type {*} */curTarget;
    logInitError({
      component: "checkEventCurrentTarget",
      message: `Expected HTMLElement, but got ${curTarget?.constructor?.name || typeof curTarget}`,
      details: {
        eventType: event.type,
        tagName: unsafeTarget?.tagName,
        className: unsafeTarget?.className
      }
    });
    return false;
  }
  return true;
}

/**
 * @param {HTMLElement} menuContainer
 * @param {HTMLElement} toggleButton
 */
function getHandlerOnCloseLanguageMenu(menuContainer, toggleButton) {
  /**
   * @param {MouseEvent|KeyboardEvent} event
   */
  return event => {
    // 1. Handling the Escape key press
    if (event instanceof KeyboardEvent && event.key === "Escape") {
      closeLanguageMenu(toggleButton);
      return;
    }
    if (event instanceof MouseEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      // If you click INSIDE the menu or INSIDE the button, do nothing (ignore)
      if (menuContainer?.contains(target)) {
        return;
      }

      // If the click was outside these elements, close it
      closeLanguageMenu(toggleButton);
    }
  };
}

/**
 * Initializes a language switcher component.
 * @param {TInitLangSwitcherParams} params - Configuration object.
 *
 * @returns {void} Returns early if any critical elements are missing.
 */
function initLangSwitcher(params) {
  const requiredKeys = ["langSwitcherSelector", "langSwitcherCurrent", "langSwitcherButton", "langSwitcherItem", "langActiveSelector", "langListSelector", "langOptionArr", "dataSetKey"];
  const missingKeys = (0,_funcs_js__WEBPACK_IMPORTED_MODULE_1__.getInvalidKeys)(params, requiredKeys, {
    invalidValues: ["", undefined, null]
  });
  if (missingKeys.length) {
    logInitError({
      component: "initLangSwitcher",
      message: `Missing required parameters:\n${missingKeys.join("\n")}`
    });
    return;
  }
  const {
    langSwitcherSelector,
    langSwitcherCurrent,
    langSwitcherButton,
    langSwitcherItem,
    langActiveSelector,
    langListSelector,
    langOptionArr,
    dataSetKey
  } = params;
  const [langSwitcher] = getElements(langSwitcherSelector);
  //all error logging is in the level of {@link getElements} and {@link checkHtmlElement}
  if (!langSwitcher || !checkHtmlElement(langSwitcher)) return;
  const [langCurrentButton] = getElements(`${langSwitcherCurrent}${langActiveSelector}`);
  if (!langCurrentButton || !checkHtmlElement(langCurrentButton)) return;
  const langActive = langCurrentButton.dataset[dataSetKey];
  if (!langActive) {
    logInitError({
      component: "initLangSwitcher",
      message: `Element with selector: ${langSwitcherCurrent}${langActiveSelector} has no data-${dataSetKey} value...`
    });
    return;
  }
  if (!Array.isArray(langOptionArr) || !langOptionArr.length) {
    logInitError({
      component: "initLangSwitcher",
      message: `langOptionArr must be a non-empty array.`,
      details: langOptionArr
    });
    return;
  }
  //forming the list of not active languages...
  const langVerArr = langOptionArr.filter(lang => lang !== langActive);
  const [langList] = getElements(langListSelector, langSwitcher);
  if (!langList || !checkHtmlElement(langList)) return;

  /**
   * Creates language option buttons list.
   *
   * Each language option is represented by a semantic HTMLElement (<li>, etc...), which includes <button>,
   * providing built-in keyboard accessibility (Tab, Enter, Space)
   * without additional event handlers.
   * @type {HTMLLIElement[]}
   *
   */
  const optionListElems = getLangItems(langVerArr, {
    langSwitcherItem,
    langSwitcherButton,
    dataSetKey
  });
  langList.append(...optionListElems);
  const langListHandler = getLangClickHandler(dataSetKey, langActive);
  const escapeLanguageMenuHandler = getHandlerOnCloseLanguageMenu(langSwitcher, langCurrentButton);

  //! ESCAPE HANDLERS
  document.addEventListener("click", escapeLanguageMenuHandler);
  document.addEventListener("keydown", escapeLanguageMenuHandler);

  //!handler on the list of the language buttons
  langList.addEventListener('click', langListHandler);
  //!handler on the current language button to open and close language menu
  langCurrentButton.addEventListener('click', toggleAriaExpandedMenu);
}

/**
 *
 * @param {string[]} langVerArr
 * @param {TGetLangItemsParams} params
 *
 * @return {HTMLLIElement[]}
 */
function getLangItems(langVerArr, params) {
  const {
    langSwitcherItem,
    langSwitcherButton,
    dataSetKey
  } = params;

  /**
   * Creates language option buttons.
   *
   * Each language option is represented by a semantic HTML button,
   * providing built-in keyboard accessibility (Tab, Enter, Space)
   * without additional event handlers.
   */
  return langVerArr.map(langVer => {
    // Create list item.
    const listItem = document.createElement("li");
    listItem.classList.add(getSelectorName(langSwitcherItem));

    // Create interactive button.
    const buttonElem = document.createElement("button");
    buttonElem.type = "button";
    buttonElem.classList.add(getSelectorName(langSwitcherButton));
    buttonElem.dataset[dataSetKey] = langVer;
    buttonElem.textContent = langVer;
    listItem.appendChild(buttonElem);
    return listItem;
  });
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
/* harmony import */ var _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./partials/initialSelectors.js */ "./src/js/partials/initialSelectors.js");
/* harmony import */ var _modulesPack_gallery_thumbs_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modulesPack/gallery-thumbs/index.js */ "./src/js/modulesPack/gallery-thumbs/index.js");
/* harmony import */ var _partials_animations_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./partials/animations.js */ "./src/js/partials/animations.js");
/* harmony import */ var _helpers_funcs_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./helpers/funcs.js */ "./src/js/helpers/funcs.js");


/**
 * @file index.js
 * @description Entry point. Bootstraps non-GSAP UI first, then lazily loads
 * GSAP via gsap-loader.js, builds animations through animations.js, and
 * initializes the masonry gallery.
 */






// ============================================
// DOM READY
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  const pageType = document.body.dataset.type || "";
  const isIn = (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_4__.isKeyOf)(_partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkAnchors, pageType);
  const navLinkParams = {
    navLinkSelector: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.navLinkSelector,
    pageType,
    activeClass: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkClassNameActive,
    anchorLink: isIn ? _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkAnchors[pageType] : "#"
  };
  const navLinkParamsHexagon = {
    navLinkSelector: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.navHexagonSelector,
    pageType,
    activeClass: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkClassNameActive,
    anchorLink: isIn ? _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkAnchors[pageType] : "#"
  };
  try {
    // ------------------------------------------
    // Navigation & Language (non-GSAP, immediate)
    // ------------------------------------------
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.activateNavLink)(navLinkParams);
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.activateNavLink)(navLinkParamsHexagon);

    //initializing GSAP animations...
    await (0,_partials_animations_js__WEBPACK_IMPORTED_MODULE_3__.initAnimations)();

    //initializing language switcher...
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.initLangSwitcher)(_partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.langSwitchData);

    //await initThumbs(gallerySelector, galleryThumbsFolderName);
  } catch (error) {
    console.error("[DOMContentLoaded]: initialization failed:", error);
  }

  // ------------------------------------------
  // Resize listener
  // ------------------------------------------

  /*  TEMPORAL
  /*
    lockedEventListener("resize", window, 1500)(async () => {
      try {
        await createMasonry(gallerySelector, { gap: 20 });
      } catch (error) {
        console.error("Resize masonry failed:", error);
      }
    });
  
    // ------------------------------------------
    // Optional: full cleanup on page unload
    // Useful for SPA navigation or hot-reload scenarios
    // ------------------------------------------
    window.addEventListener("beforeunload", () => {
      killAllAnimations();
      resetGsapCache();
    });
  
    */
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

/***/ "./src/js/partials/animationParams.js":
/*!********************************************!*\
  !*** ./src/js/partials/animationParams.js ***!
  \********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   burgerNavTimelineParams: function() { return /* binding */ burgerNavTimelineParams; },
/* harmony export */   heroTimelineParams: function() { return /* binding */ heroTimelineParams; }
/* harmony export */ });
/* harmony import */ var _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./initialSelectors.js */ "./src/js/partials/initialSelectors.js");




/**
 * TGsap
 * GSAP instance.
 * @typedef {typeof import("gsap").gsap} TGsap
 */

/**
 * TGsapVars
 *
 * Generic GSAP vars object.
 *
 * `Record<string, any>` is intentionally used here because this
 * configuration represents generic GSAP vars and may contain
 * properties provided by GSAP core, plugins, or ScrollTrigger.
 *
 * The type is kept generic at this abstraction layer instead of
 * coupling the application-specific animation configuration to
 * every possible GSAP plugin type.
 *
 * @typedef {Record<string, any>} TGsapVars
 */

/**
 * TTween
 *
 * GSAP Tween instance.
 *
 * @typedef {gsap.core.Tween} TTween
 */

/**
 * TTimeline
 *
 * GSAP Timeline instance.
 *
 * @typedef {gsap.core.Timeline} TTimeline
 */

/**
 * TAnimation
 *
 * Common GSAP animation type.
 *
 * This includes both Tween and Timeline instances.
 *
 * @typedef {gsap.core.Animation} TAnimation
 */

/**
 * TAnimationKey
 *
 * Cache key used to identify a registered animation.
 *
 * Element keys are used when the animation belongs to a concrete
 * DOM Element.
 *
 * String keys are used for application-level animations such as
 * grouped animations.
 *
 * @typedef {string | Element} TAnimationKey
 */

/**
 * TTargetMode
 *
 * Defines how target Elements are associated with timelines.
 *
 * `single`
 *     One primary Element and one Timeline.
 *
 * `group`
 *     Multiple Elements and one shared Timeline.
 *
 * `each`
 *     Multiple scope Elements and one independent Timeline
 *     for every scope.
 *
 * @typedef {"single" | "group" | "each"} TTargetMode
 */

/**
 * TScrollTriggerParams
 *
 * ScrollTrigger configuration for a single timeline step.
 *
 * `trigger` is optional because the builder may resolve it from
 * the current animation context.
 *
 * The resolution rules are:
 *
 * - Explicit `trigger` has the highest priority.
 * - `single` may use its primary target Element.
 * - `each` may use its current scope Element.
 * - `group` does not have an implicit trigger and therefore
 *   requires an explicit `trigger`.
 *
 * @typedef {{
 *   trigger?: string | Element,
 *   start?: string | number,
 *   end?: string | number,
 *   toggleActions?: string,
 *   preventOverlaps?: boolean | string,
 *   fastScrollEnd?: boolean | number,
 *   markers?: boolean,
 *   scrub?: boolean | number,
 *   pin?: boolean | string | Element,
 * }} TScrollTriggerParams
 */

/**
 * TTimelineStep
 *
 * Declarative description of one operation in a GSAP Timeline.
 *
 * The order of objects inside the `steps` array is significant:
 * it defines the order in which operations are added to the
 * Timeline.
 *
 * `target`
 *     CSS selector of the Elements animated by this step.
 *
 * `type`
 *     GSAP operation used to build the step.
 *
 * `vars`
 *     Vars used by `set()`, `from()`, and `to()`, and as the
 *     destination vars for `fromTo()`.
 *
 * `fromVars`
 *     Initial vars used only by `fromTo()`.
 *
 * `position`
 *     GSAP Timeline position parameter.
 *
 * `scrollTrigger`
 *     Optional ScrollTrigger configuration attached to the
 *     current GSAP tween.
 *
 * @typedef {{
 *   target: string,
 *   type: "set" | "from" | "to" | "fromTo",
 *   vars?: TGsapVars,
 *   fromVars?: TGsapVars,
 *   position?: string | number,
 *   scrollTrigger?: TScrollTriggerParams,
 * }} TTimelineStep
 */

/**
 * TSingleTimelineParams Configuration for a single-target Timeline.
 *
 * @typedef {{
 *   targetMode: "single",
 *   paused?: boolean,
 *   steps: TTimelineStep[],
 * }} TSingleTimelineParams
 */

/**
 * TGroupTimelineParams Configuration for a grouped Timeline.
 *
 * @typedef {{
 *   targetMode: "group",
 *   paused?: boolean,
 *   steps: TTimelineStep[],
 * }} TGroupTimelineParams
 */

/**
 * TEachTimelineParams Configuration for per-element Timelines.
 *
 * @typedef {{
 *   targetMode: "each",
 *   scope: string,
 *   paused?: boolean,
 *   steps: TTimelineStep[],
 * }} TEachTimelineParams
 */

/**
 * TTimelineParams Complete configuration accepted by buildTimeline().
 *
 * @typedef {TSingleTimelineParams | TGroupTimelineParams | TEachTimelineParams} TTimelineParams
 */

///////// FUNCTIONS //////////

/**
 * Configuration for the Burger navigation Timeline.
 *
 * The Timeline is created in its initial paused state because it is
 * controlled interactively by Burger event handlers.
 *
 * @type {TSingleTimelineParams}
 */
const burgerNavTimelineParams = {
  targetMode: "single",
  paused: true,
  steps: [{
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.navMenuFixed,
    type: "to",
    vars: {
      top: -20,
      duration: 0.8,
      ease: "back.out(0.8)"
    }
  }]
};

/**
 * Configuration for the Hero section entrance animation Timeline.
 *
 * The Timeline coordinates multiple independent DOM targets and is
 * therefore configured with `targetMode: "group"`.
 *
 * @type {TGroupTimelineParams}
 */
const heroTimelineParams = {
  targetMode: "group",
  steps: [
  // Hero heading accent
  {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.headingAccentHero,
    type: "to",
    vars: {
      opacity: 1,
      duration: 2,
      delay: 0.3
    }
  }, {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.headingAccentHero,
    type: "from",
    vars: {
      x: 80,
      duration: 0.8,
      ease: "circ.out"
    },
    position: "<"
  },
  // Remaining part of the Hero heading
  {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.headingHeroRest,
    type: "to",
    vars: {
      opacity: 1,
      duration: 2
    },
    position: "<"
  }, {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.headingHeroRest,
    type: "from",
    vars: {
      x: -80,
      duration: 0.8,
      ease: "circ.out"
    },
    position: "<"
  },
  // Hero text block
  {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.textBlockHero,
    type: "to",
    vars: {
      opacity: 1,
      duration: 2
    },
    position: "-=1.5"
  }, {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.textBlockHero,
    type: "from",
    vars: {
      y: 80,
      duration: 0.8,
      ease: "circ.out"
    },
    position: "<"
  },
  // Hero bidding block
  {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.biddingBlockHero,
    type: "to",
    vars: {
      opacity: 1,
      duration: 2
    },
    position: "<+0.3"
  }, {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.biddingBlockHero,
    type: "from",
    vars: {
      y: 40,
      duration: 0.8,
      ease: "circ.out"
    },
    position: "<"
  },
  // Hero icon
  {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.iconWrapperHero,
    type: "to",
    vars: {
      scale: 1,
      duration: 1.5,
      ease: "elastic.out"
    },
    position: "<+0.2"
  }]
};

/***/ }),

/***/ "./src/js/partials/animations.js":
/*!***************************************!*\
  !*** ./src/js/partials/animations.js ***!
  \***************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initAnimations: function() { return /* binding */ initAnimations; }
/* harmony export */ });
/* harmony import */ var _helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/funcsDOM.js */ "./src/js/helpers/funcsDOM.js");
/* harmony import */ var _gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gsap-loader.js */ "./src/js/partials/gsap-loader.js");
/* harmony import */ var _helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../helpers/funcs.js */ "./src/js/helpers/funcs.js");
/* harmony import */ var _initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./initialSelectors.js */ "./src/js/partials/initialSelectors.js");
/* harmony import */ var _animationParams_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./animationParams.js */ "./src/js/partials/animationParams.js");


/**
 * @file animations.js
 * @description GSAP animation factory integrated with gsap-loader.js caching.
 * All animations are registered in the global gsap-loader cache so they can
 * be killed individually or in bulk. No local WeakMap is used anymore.
 */







// ============================================
//****** TYPE DEFINITIONS *******//

/**
 * TBurgerElements: DOM elements required by the navigation menu.
 *
 * @typedef {Object} TBurgerElements
 * @property {Element} navMenuFixed
 * @property {Element} burgerHidden
 * @property {Element} burgerFixed
 * @property {Element[]} burgerNavAll
 */

/**
 * TDOMSelectorConfig: Configuration for a generic DOM element lookup.
 *
 * @typedef {Object} TDOMSelectorConfig
 * @property {string} key - Property name used in the resulting object.
 * @property {string} selector - CSS selector used to find the element(s).
 * @property {boolean} [multiple=false] - Whether all matching elements should be returned.
 */

/**
 * TNavMenuSelector: Configuration for navigation menu DOM element lookup.
 *
 * Specializes the generic selector configuration by restricting `key`
 * to the known properties of `TBurgerElements`.
 *
 * @typedef {Omit<TDOMSelectorConfig, "key"> & {
 *     key: keyof TBurgerElements
 * }} TNavMenuSelector
 */

/**
 * TBurgerHandlersData: Configuration for return {@link initBurgerHandlers}
 *
 * @typedef {{
 *   closeBurgerHandler: (e:MouseEvent) => void,
 *   attachBurgerListener: (burger: Element) => void,
 * }} TBurgerHandlersData
 */

/**
 * TLinkAnchors is the type of the exported linkAnchors object.
 *
 * @typedef {typeof import("./initialSelectors.js").linkAnchors} TLinkAnchors
 */

/**
 * TPageName is the page names defined by `linkAnchors`.
 *
 * @typedef {keyof TLinkAnchors} TPageName
 */

/**
 * TPageAnimation: A function that initializes animations
 * for a page or common layout.
 *
 * @typedef {() => void} TPageAnimation
 */

/**
 * TPageAnimations: Animation configuration for all pages.
 *
 * `common` is always required.
 * Page-specific animation functions are optional.
 *
 * @typedef {{
 *   common: TPageAnimation
 * } & Partial<Record<TPageName, TPageAnimation>>} TPageAnimations
 */

/**
 * TGsap
 * GSAP instance.
 * @typedef {typeof import("gsap").gsap} TGsap
 */

/**
 * TGsapVars
 *
 * Generic GSAP vars object.
 *
 * `Record<string, any>` is intentionally used here because this
 * configuration represents generic GSAP vars and may contain
 * properties provided by GSAP core, plugins, or ScrollTrigger.
 *
 * The type is kept generic at this abstraction layer instead of
 * coupling the application-specific animation configuration to
 * every possible GSAP plugin type.
 *
 * @typedef {Record<string, any>} TGsapVars
 */

/**
 * TTween
 *
 * GSAP Tween instance.
 *
 * @typedef {gsap.core.Tween} TTween
 */

/**
 * TTimeline
 *
 * GSAP Timeline instance.
 *
 * @typedef {gsap.core.Timeline} TTimeline
 */

/**
 * TAnimation
 *
 * Common GSAP animation type.
 *
 * This includes both Tween and Timeline instances.
 *
 * @typedef {gsap.core.Animation} TAnimation
 */

/**
 * TAnimationKey
 *
 * Cache key used to identify a registered animation.
 *
 * Element keys are used when the animation belongs to a concrete
 * DOM Element.
 *
 * String keys are used for application-level animations such as
 * grouped animations.
 *
 * @typedef {string | Element} TAnimationKey
 */

/**
 * TTargetMode
 *
 * Defines how target Elements are associated with timelines.
 *
 * `single`
 *     One primary Element and one Timeline.
 *
 * `group`
 *     Multiple Elements and one shared Timeline.
 *
 * `each`
 *     Multiple scope Elements and one independent Timeline
 *     for every scope.
 *
 * @typedef {"single" | "group" | "each"} TTargetMode
 */

/**
 * TScrollTriggerParams
 *
 * ScrollTrigger configuration for a single timeline step.
 *
 * `trigger` is optional because the builder may resolve it from
 * the current animation context.
 *
 * The resolution rules are:
 *
 * - Explicit `trigger` has the highest priority.
 * - `single` may use its primary target Element.
 * - `each` may use its current scope Element.
 * - `group` does not have an implicit trigger and therefore
 *   requires an explicit `trigger`.
 *
 * @typedef {{
 *   trigger?: string | Element,
 *   start?: string | number,
 *   end?: string | number,
 *   toggleActions?: string,
 *   preventOverlaps?: boolean | string,
 *   fastScrollEnd?: boolean | number,
 *   markers?: boolean,
 *   scrub?: boolean | number,
 *   pin?: boolean | string | Element,
 * }} TScrollTriggerParams
 */

/**
 * TTimelineStep
 *
 * Declarative description of one operation in a GSAP Timeline.
 *
 * The order of objects inside the `steps` array is significant:
 * it defines the order in which operations are added to the
 * Timeline.
 *
 * `target`
 *     CSS selector of the Elements animated by this step.
 *
 * `type`
 *     GSAP operation used to build the step.
 *
 * `vars`
 *     Vars used by `set()`, `from()`, and `to()`, and as the
 *     destination vars for `fromTo()`.
 *
 * `fromVars`
 *     Initial vars used only by `fromTo()`.
 *
 * `position`
 *     GSAP Timeline position parameter.
 *
 * `scrollTrigger`
 *     Optional ScrollTrigger configuration attached to the
 *     current GSAP tween.
 *
 * @typedef {{
 *   target: string,
 *   type: "set" | "from" | "to" | "fromTo",
 *   vars?: TGsapVars,
 *   fromVars?: TGsapVars,
 *   position?: string | number,
 *   scrollTrigger?: TScrollTriggerParams,
 * }} TTimelineStep
 */

/**
 * TSingleTimelineParams Configuration for a single-target Timeline.
 *
 * @typedef {{
 *   targetMode: "single",
 *   paused?: boolean,
 *   steps: TTimelineStep[],
 * }} TSingleTimelineParams
 */

/**
 * TGroupTimelineParams Configuration for a grouped Timeline.
 *
 * @typedef {{
 *   targetMode: "group",
 *   paused?: boolean,
 *   steps: TTimelineStep[],
 * }} TGroupTimelineParams
 */

/**
 * TEachTimelineParams Configuration for per-element Timelines.
 *
 * @typedef {{
 *   targetMode: "each",
 *   scope: string,
 *   paused?: boolean,
 *   steps: TTimelineStep[],
 * }} TEachTimelineParams
 */

/**
 * TTimelineParams Complete configuration accepted by buildTimeline().
 *
 * @typedef {TSingleTimelineParams | TGroupTimelineParams | TEachTimelineParams} TTimelineParams
 */

/// UTILITY FUNCTIONS ///

/**
 * Checks if a GSAP timeline has real (non-zero duration) animations.
 *
 * @param {TTimeline} timeline - The timeline to check
 * @returns {boolean} True if at least one child tween has duration > 0
 */
function hasTimelineRealAnimations(timeline) {
  return timeline.getChildren().some(child => child.duration() > 0);
}

/// SCROLL TIMELINE BUILDERS ///
/**
 * buildTimeline
 *
 * Main public builder responsible for selecting the appropriate
 * timeline construction strategy.
 *
 * Target modes:
 *
 * `single`
 *     One primary Element → one Timeline.
 *
 * `group`
 *     Multiple Elements → one shared Timeline.
 *     The supplied `key` becomes the cache identity.
 *
 * `each`
 *     Multiple scope Elements → one independent Timeline per scope.
 *     Each scope Element becomes the cache identity.
 *
 * The `key` is optional at the API level because it is meaningful
 * only for `group` mode.
 *
 * This dispatcher intentionally performs very little work:
 *
 *     validate basic configuration
 *           ↓
 *     select target-mode builder
 *
 * Keeping target-mode-specific logic outside this function prevents
 * its cyclomatic complexity from growing as the animation system
 * evolves.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {TTimelineParams} params
 * Complete timeline configuration.
 *
 * @param {TAnimationKey} [key]
 * Named cache key used by `group` mode.
 *
 * The argument is intentionally optional because `single` and
 * `each` use Element-based cache identities.
 *
 * @returns {TTimeline | TTimeline[]}
 * A single Timeline for `single`/`group`, or an array of independent
 * Timelines for `each`.
 *
 * @throws {Error}
 * When `steps` is empty.
 *
 * @throws {TypeError}
 * When an unsupported target mode is provided.
 *
 * @throws {TypeError}
 * When `group` mode does not receive a key.
 *
 * @sample
 * buildTimeline(
 *   gsap,
 *   {
 *     targetMode: "single",
 *     steps: [
 *       {
 *         target: ".hero-title",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *         },
 *       },
 *     ],
 *   }
 * );
 *
 * @sample
 * buildTimeline(
 *   gsap,
 *   {
 *     targetMode: "group",
 *     steps: [
 *       {
 *         target: ".gallery-item",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *         },
 *         scrollTrigger: {
 *           trigger: ".gallery",
 *           start: "top 80%",
 *         },
 *       },
 *     ],
 *   },
 *   "galleryItems"
 * );
 */
function buildTimeline(gsap, params, key) {
  /**
   * Validate the most basic invariant here as well as inside
   * specialized builders.
   *
   * This makes the public entry point fail early and keeps the
   * specialized builders independently safe.
   */
  if (!params.steps.length) {
    throw new Error("[buildTimeline]: steps cannot be empty.");
  }
  switch (params.targetMode) {
    case "single":
      return buildSingleTimeline(gsap, params, key);
    case "group":
      if (!key || typeof key !== "string") {
        throw new TypeError("[buildTimeline]: key as `string` is required " + `for group mode. But received: ${key}`);
      }
      return buildGroupTimeline(gsap, key, params);
    case "each":
      return buildEachTimelines(gsap, params);
    default:
      throw new TypeError(`[buildTimeline]: unsupported targetMode...".`);
  }
}

/**
 * buildSingleTimeline
 *
 * Builds one GSAP Timeline for a logical single-target animation.
 *
 * The function resolves the primary target from the first Timeline step.
 * The primary target serves as the default cache identity when no explicit
 * `key` is provided.
 *
 * The first step therefore establishes the following relationship:
 *
 *     params.steps[0].target
 *                ↓
 *          primary target
 *                ↓
 *     default animation key
 *
 * An explicit `key` overrides this default behavior and may be either:
 *
 * - a DOM Element, for Element-based animation caching;
 * - a string, for a named application-level animation.
 *
 * The primary target is also passed to `addTimelineStep()` as the
 * contextual target for ScrollTrigger configuration. Therefore, when
 * a step defines `scrollTrigger` without an explicit `trigger`, the
 * primary target can be used as the default trigger.
 *
 * Steps after the first one may target different Elements. This allows
 * one logical Timeline to coordinate several related DOM Elements while
 * retaining one primary cache identity.
 *
 * `params.paused` represents the initial runtime state of the Timeline.
 * It is intentionally applied to the Timeline itself rather than being
 * included in an individual Tween's vars.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {TSingleTimelineParams} params
 * Configuration for a single-target Timeline.
 *
 * `targetMode` must be `"single"`.
 *
 * @param {TAnimationKey} [key]
 * Optional cache key.
 *
 * When omitted, the first resolved target Element is used as the
 * animation key.
 *
 * @returns {TTimeline}
 * Created and registered GSAP Timeline.
 *
 * @throws {Error}
 * When `params.steps` is empty.
 *
 * @throws {Error}
 * When the target of any Timeline step cannot be resolved.
 *
 * @example
 * // The first target becomes the default cache key.
 * const timeline = buildSingleTimeline(
 *     gsap,
 *     {
 *         targetMode: "single",
 *         steps: [
 *             {
 *                 target: ".hero-title",
 *                 type: "from",
 *                 vars: {
 *                     opacity: 0,
 *                     y: 40,
 *                     duration: 0.8,
 *                 },
 *             },
 *             {
 *                 target: ".hero-text",
 *                 type: "from",
 *                 vars: {
 *                     opacity: 0,
 *                     y: 20,
 *                     duration: 0.6,
 *                 },
 *                 position: "<",
 *             },
 *         ],
 *     }
 * );
 *
 * @example
 * // Explicit string key creates a named cache entry.
 * const timeline = buildSingleTimeline(
 *     gsap,
 *     {
 *         targetMode: "single",
 *         steps: [
 *             {
 *                 target: ".hero",
 *                 type: "from",
 *                 vars: {
 *                     opacity: 0,
 *                 },
 *             },
 *         ],
 *     },
 *     "heroIntro"
 * );
 *
 * @example
 * // The primary Element is used as the default ScrollTrigger trigger.
 * const timeline = buildSingleTimeline(
 *     gsap,
 *     {
 *         targetMode: "single",
 *         steps: [
 *             {
 *                 target: ".service-title",
 *                 type: "from",
 *                 vars: {
 *                     opacity: 0,
 *                     y: 30,
 *                     duration: 0.8,
 *                 },
 *                 scrollTrigger: {
 *                     start: "top 80%",
 *                 },
 *             },
 *         ],
 *     }
 * );
 *
 * @example
 * // The Timeline starts paused and can later be controlled by
 * // event handlers using play(), reverse(), pause(), etc.
 * const timeline = buildSingleTimeline(
 *     gsap,
 *     {
 *         targetMode: "single",
 *         paused: true,
 *         steps: [
 *             {
 *                 target: ".burger-menu",
 *                 type: "to",
 *                 vars: {
 *                     top: -20,
 *                     duration: 0.8,
 *                     ease: "back.out(0.8)",
 *                 },
 *             },
 *         ],
 *     }
 * );
 */
function buildSingleTimeline(gsap, params, key) {
  /**
   * A Timeline without steps has no meaningful target or animation.
   *
   * Validate this before attempting to resolve the primary target.
   */
  if (!params.steps.length) {
    throw new Error("[buildSingleTimeline]: steps cannot be empty.");
  }

  /**
   * The first step establishes the primary target.
   *
   * This Element is used as the default cache identity when the
   * caller does not provide an explicit key.
   */
  const firstStep = params.steps[0];
  const firstTargets = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getElements)(firstStep.target, document, false);
  if (!firstTargets.length) {
    throw new Error(`[buildSingleTimeline]: target "${firstStep.target}" ` + "was not found in DOM.");
  }
  const primaryTarget = firstTargets[0];

  /**
   * Create the Timeline itself.
   *
   * `paused` is deliberately not passed to gsap.timeline() here.
   * The initial playback state is applied after all Timeline steps
   * have been constructed.
   */
  const timeline = gsap.timeline();

  /**
   * Add every declarative step to the Timeline.
   *
   * The primary target is passed as the contextual target so that
   * addTimelineStep() can use it as the default ScrollTrigger
   * trigger when a step defines ScrollTrigger without an explicit
   * trigger.
   */
  for (const step of params.steps) {
    const targets = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getElements)(step.target, document, false);
    if (!targets.length) {
      throw new Error(`[buildSingleTimeline]: target "${step.target}" ` + "was not found in DOM.");
    }
    addTimelineStep(timeline, targets[0], step, "single", primaryTarget);
  }

  /**
   * An explicit key has priority over the automatically determined
   * primary Element.
   *
   * Element keys are suitable for WeakMap-based caching.
   * String keys are suitable for named application-level animations.
   */
  const animationKey = key ?? primaryTarget;

  /**
   * Apply the initial runtime state to the complete Timeline.
   *
   * `paused` describes the state of the interactive Timeline itself,
   * not an individual Tween.
   *
   * This is especially useful for animations controlled later by
   * event handlers through play() and reverse().
   */
  if (params.paused) {
    timeline.pause();
  }

  /**
   * Register the fully constructed Timeline only after its initial
   * runtime state has been established.
   *
   * The cache therefore exposes the same Timeline instance that
   * event handlers will subsequently control.
   */
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.registerAnimation)(animationKey, timeline);
  return timeline;
}

/**
 * buildGroupTimeline
 *
 * Builds one shared Timeline for multiple Elements.
 *
 * Every step resolves its selector globally and passes all matching
 * Elements to GSAP as one target collection.
 *
 * The resulting Timeline represents the whole group and is therefore
 * registered under the supplied string cache key.
 *
 * Group mode intentionally does not provide an implicit
 * ScrollTrigger trigger. If a step declares ScrollTrigger without
 * an explicit `trigger`, resolveScrollTrigger() throws an error
 * because there is no unique Element representing the whole group.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {string} key
 * Named cache key for the group animation.
 *
 * @param {TGroupTimelineParams} params
 * Timeline configuration.
 *
 * @returns {TTimeline}
 * Created and registered Timeline.
 *
 * @throws {Error}
 * When `steps` is empty.
 *
 * @throws {Error}
 * When a step target cannot be resolved.
 *
 * @sample
 * buildGroupTimeline(
 *   gsap,
 *   "galleryCards",
 *   {
 *     targetMode: "group",
 *     steps: [
 *       {
 *         target: ".gallery-card",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *           y: 40,
 *         },
 *       },
 *     ],
 *   }
 * );
 *
 * @sample
 * buildGroupTimeline(
 *   gsap,
 *   "heroGroup",
 *   {
 *     targetMode: "group",
 *     steps: [
 *       {
 *         target: ".hero-title",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *         },
 *         scrollTrigger: {
 *           trigger: ".hero",
 *           start: "top 80%",
 *         },
 *       },
 *     ],
 *   }
 * );
 */
function buildGroupTimeline(gsap, key, params) {
  if (!params.steps.length) {
    throw new Error("[buildGroupTimeline]: steps cannot be empty.");
  }
  if (!key) {
    throw new TypeError("[buildGroupTimeline]: key must be a non-empty string.");
  }
  const timeline = gsap.timeline();
  for (const step of params.steps) {
    const targets = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getElements)(step.target, document, true);
    if (!targets.length) {
      throw new Error(`[buildGroupTimeline]: target "${step.target}" ` + "was not found in DOM.");
    }

    /**
     * No default trigger is supplied in group mode.
     *
     * Explicit step.scrollTrigger.trigger is still fully supported.
     */
    addTimelineStep(timeline, targets, step, "group", undefined);
  }

  /**
   * One shared Timeline represents the complete group,
   * therefore the group name becomes its cache identity.
   */
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.registerAnimation)(key, timeline);
  return timeline;
}

/**
 * buildEachTimelines
 *
 * Builds one independent Timeline for every Element matched
 * by `params.scope`.
 *
 * Example:
 *
 *     scope: ".card"
 *
 * produces:
 *
 *     card #1 → Timeline #1
 *     card #2 → Timeline #2
 *     card #3 → Timeline #3
 *
 * Every scope Element becomes:
 *
 * 1. the DOM context for resolving step targets;
 * 2. the default ScrollTrigger trigger;
 * 3. the cache identity used by registerAnimation().
 *
 * The resulting Element → Timeline relationship fits naturally
 * into the WeakMap-based animation cache.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {TEachTimelineParams} params
 * Timeline configuration with `targetMode: "each"`.
 *
 * @returns {TTimeline[]}
 * One independent Timeline for each scope Element.
 *
 * @throws {Error}
 * When `scope` is missing.
 *
 * @throws {Error}
 * When `steps` is empty.
 *
 * @throws {Error}
 * When no scope Elements are found.
 *
 * @sample
 * buildEachTimelines(
 *   gsap,
 *   {
 *     targetMode: "each",
 *     scope: ".card",
 *     steps: [
 *       {
 *         target: ".card__title",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *           y: 30,
 *         },
 *         scrollTrigger: {
 *           start: "top 80%",
 *         },
 *       },
 *     ],
 *   }
 * );
 *
 * @sample
 * buildEachTimelines(
 *   gsap,
 *   {
 *     targetMode: "each",
 *     scope: ".service-card",
 *     steps: [
 *       {
 *         target: ".service-card__image",
 *         type: "fromTo",
 *         fromVars: {
 *           scale: 0.8,
 *         },
 *         vars: {
 *           scale: 1,
 *           duration: 0.8,
 *         },
 *       },
 *       {
 *         target: ".service-card__text",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *         },
 *         position: "<0.2",
 *       },
 *     ],
 *   }
 * );
 */
function buildEachTimelines(gsap, params) {
  if (!params.steps.length) {
    throw new Error("[buildEachTimelines]: steps cannot be empty.");
  }
  if (!params.scope) {
    throw new Error("[buildEachTimelines]: scope is required " + "when targetMode is 'each'.");
  }
  const scopes = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getElements)(params.scope, document, true);
  if (!scopes.length) {
    throw new Error(`[buildEachTimelines]: no elements matched scope "${params.scope}".`);
  }
  const timelines = [];
  for (const scope of scopes) {
    const timeline = buildTimelineForScope(gsap, scope, params.steps);

    /**
     * Each scope receives its own cache entry.
     *
     * WeakMap<Element, TAnimation> provides the required
     * Element → Timeline identity and allows the DOM Element
     * to remain eligible for garbage collection.
     */
    (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.registerAnimation)(scope, timeline);
    timelines.push(timeline);
  }
  return timelines;
}

/**
 * buildTimelineForScope
 *
 * Builds one Timeline for one scope Element.
 *
 *! This function is the core of `each` mode.
 *
 * Example:
 *
 *     scope: ".card"
 *
 *     current scope:
 *
 *     <article class="card">
 *         <h2 class="card__title"></h2>
 *         <p class="card__text"></p>
 *     </article>
 *
 * Then:
 *
 *     target: ".card__title"
 *
 * is resolved relative to the current `.card` Element.
 *
 * This allows every repeated component to have its own independent
 * Timeline while still using simple relative selectors.
 *
 * The current scope Element is also the default ScrollTrigger trigger
 * for steps that request ScrollTrigger without defining an explicit
 * `trigger`.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {Element} scope
 * Current scope Element.
 *
 * @param {TTimelineStep[]} steps
 * Timeline steps resolved relative to the scope.
 *
 * @returns {TTimeline}
 * Created Timeline.
 *
 * @throws {Error}
 * When `steps` is empty.
 *
 * @throws {Error}
 * When a step target cannot be found inside the scope.
 *
 * @sample
 * buildTimelineForScope(
 *   gsap,
 *   cardElement,
 *   [
 *     {
 *       target: ".card__title",
 *       type: "from",
 *       vars: {
 *         opacity: 0,
 *       },
 *       scrollTrigger: {
 *         start: "top 80%",
 *       },
 *     },
 *   ]
 * );
 *
 * @sample
 * buildTimelineForScope(
 *   gsap,
 *   cardElement,
 *   [
 *     {
 *       target: ".card__image",
 *       type: "from",
 *       vars: {
 *         y: 40,
 *       },
 *     },
 *     {
 *       target: ".card__text",
 *       type: "from",
 *       vars: {
 *         opacity: 0,
 *       },
 *       position: "<0.2",
 *     },
 *   ]
 * );
 */
function buildTimelineForScope(gsap, scope, steps) {
  if (!steps.length) {
    throw new Error("[buildTimelineForScope]: steps cannot be empty.");
  }
  const timeline = gsap.timeline();
  for (const step of steps) {
    /**
     * Resolve the step target relative to the current scope.
     *
     * This is what gives `each` mode its component-oriented
     * behavior.
     */
    const targets = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getElements)(step.target, scope, true);
    if (!targets.length) {
      throw new Error(`[buildTimelineForScope]: target "${step.target}" ` + "was not found inside the current scope.");
    }

    /**
     * The current scope is the contextual default trigger.
     *
     * It is used only when this particular step has ScrollTrigger
     * configuration without its own explicit trigger.
     */
    addTimelineStep(timeline, targets, step, "each", scope);
  }
  return timeline;
}

/**
 * addTimelineStep
 *
 * Dispatches one timeline step to the appropriate GSAP operation.
 *
 * This function deliberately does not contain animation-building
 * logic itself. Its responsibility is only to select the correct
 * operation builder based on `step.type`.
 *
 * Keeping this dispatcher small prevents the complexity of ${@link buildTimeline()}
 * from growing as additional GSAP operation
 * types are introduced.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by the step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @throws {TypeError}
 * When `step.type` is not supported.
 *
 * @sample
 * addTimelineStep(
 *   timeline,
 *   heroElement,
 *   {
 *     target: ".hero",
 *     type: "to",
 *     vars: {
 *       opacity: 1,
 *     },
 *   },
 *   "single",
 *   heroElement
 * );
 *
 * @sample
 * addTimelineStep(
 *   timeline,
 *   cards,
 *   {
 *     target: ".card",
 *     type: "from",
 *     vars: {
 *       opacity: 0,
 *       y: 40,
 *     },
 *   },
 *   "group"
 * );
 */
function addTimelineStep(timeline, target, step, targetMode, defaultTrigger) {
  switch (step.type) {
    case "set":
      addSetStep(timeline, target, step, targetMode, defaultTrigger);
      break;
    case "from":
      addFromStep(timeline, target, step, targetMode, defaultTrigger);
      break;
    case "to":
      addToStep(timeline, target, step, targetMode, defaultTrigger);
      break;
    case "fromTo":
      addFromToStep(timeline, target, step, targetMode, defaultTrigger);
      break;
    default:
      throw new TypeError(`[addTimelineStep]: unsupported step type "${step.type}".`);
  }
}

/**
 * resolveScrollTrigger
 *
 * Resolves the final ScrollTrigger configuration for a timeline step.
 *
 * This function intentionally distinguishes between:
 *
 * 1. absence of `scrollTrigger`;
 * 2. explicitly supplied `scrollTrigger.trigger`;
 * 3. an implicit trigger supplied by the current animation context.
 *
 * An explicit trigger always has priority.
 *
 * When `scrollTrigger` is absent, the function returns `undefined`.
 * This is important because a GSAP animation should remain a normal
 * non-scroll-triggered animation unless ScrollTrigger configuration
 * was explicitly requested.
 *
 * For `group` mode there is no unique Element representing the
 * complete target collection. Therefore an implicit trigger would
 * be ambiguous and is rejected.
 *
 * @param {TScrollTriggerParams | undefined} scrollTrigger
 * ScrollTrigger configuration declared by the current step.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element that may be used when the step does not
 * explicitly define `trigger`.
 *
 * @returns {TScrollTriggerParams | undefined}
 * Normalized ScrollTrigger configuration.
 *
 * @throws {Error}
 * When `group` mode declares ScrollTrigger without an explicit
 * `trigger`.
 *
 * @sample
 * const result = resolveScrollTrigger(
 *   {
 *     start: "top 80%",
 *   },
 *   "single",
 *   heroElement
 * );
 *
 * // result.trigger === heroElement
 *
 * @sample
 * const result = resolveScrollTrigger(
 *   {
 *     trigger: ".section",
 *     start: "top 80%",
 *   },
 *   "group"
 * );
 *
 * // Explicit selector is preserved unchanged.
 */
function resolveScrollTrigger(scrollTrigger, targetMode, defaultTrigger) {
  /**
   * No ScrollTrigger configuration means that the animation
   * must remain a regular GSAP animation.
   */
  if (!scrollTrigger) {
    return undefined;
  }

  /**
   * An explicitly supplied trigger always has priority over
   * any contextual default.
   */
  if (scrollTrigger.trigger) {
    return {
      ...scrollTrigger
    };
  }

  /**
   * A grouped Timeline represents multiple Elements as one
   * animation instance. There is no unique implicit Element
   * that can safely act as the trigger for the whole group.
   */
  if (targetMode === "group") {
    throw new Error("[resolveScrollTrigger]: group mode requires an explicit " + "ScrollTrigger.trigger.");
  }

  /**
   * No contextual Element is available.
   *
   * We do not invent a trigger. The caller may intentionally
   * configure ScrollTrigger using only properties such as
   * `start`, `end`, `scrub`, etc.
   */
  if (!defaultTrigger) {
    return {
      ...scrollTrigger
    };
  }

  /**
   * Use the contextual Element as the implicit trigger.
   */
  return {
    ...scrollTrigger,
    trigger: defaultTrigger
  };
}

/**
 * createStepVars
 *
 * Creates a new GSAP vars object without mutating the original
 * configuration object.
 *
 * The optional ScrollTrigger configuration is merged into the
 * returned vars object only when it exists.
 *
 * This function also normalizes an `undefined` vars value into
 * an empty object, allowing callers to omit `step.vars`.
 *
 * The second argument is intentionally optional because some
 * GSAP operations do not need ScrollTrigger configuration.
 *
 * @param {TGsapVars | undefined} vars
 * Original GSAP vars object.
 *
 * @param {TScrollTriggerParams} [scrollTrigger]
 * Optional normalized ScrollTrigger configuration.
 *
 * @returns {TGsapVars}
 * New vars object suitable for passing to GSAP.
 *
 * @sample
 * const vars = createStepVars(
 *   {
 *     opacity: 1,
 *     duration: 1,
 *   }
 * );
 *
 * // {
 * //   opacity: 1,
 * //   duration: 1
 * // }
 *
 * @sample
 * const vars = createStepVars(
 *   {
 *     opacity: 1,
 *   },
 *   {
 *     trigger: heroElement,
 *     start: "top 80%",
 *   }
 * );
 *
 * // {
 * //   opacity: 1,
 * //   scrollTrigger: {
 * //     trigger: heroElement,
 * //     start: "top 80%",
 * //   }
 * // }
 */
function createStepVars(vars, scrollTrigger) {
  /**
   * Create a fresh object so that the original animation
   * configuration remains immutable.
   *
   * Using `TGsapVars` allows us to add GSAP/plugin-specific
   * properties such as `scrollTrigger`.
   */
  const normalizedVars = {
    ...(vars ?? {})
  };
  if (scrollTrigger) {
    normalizedVars.scrollTrigger = scrollTrigger;
  }
  return normalizedVars;
}

/**
 * prepareStepVars
 *
 * Prepares all vars required to execute one timeline step.
 *
 * This function centralizes the repeated preparation logic shared
 * by `set`, `from`, `to`, and `fromTo` operations:
 *
 *     step.scrollTrigger
 *             ↓
 *     resolveScrollTrigger()
 *             ↓
 *     createStepVars()
 *
 * `fromTo()` needs two vars objects:
 *
 *     fromVars → initial values
 *     vars     → destination values
 *
 * Therefore this function always prepares both values. For normal
 * operations, callers simply use `vars` and ignore `fromVars`.
 *
 * ScrollTrigger is intentionally attached only to the destination
 * vars object because those vars are passed to the actual GSAP
 * tween configuration.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used when `scrollTrigger.trigger` is omitted.
 *
 * @returns {{
 *   vars: TGsapVars,
 *   fromVars: TGsapVars,
 *   scrollTrigger: TScrollTriggerParams | undefined,
 * }}
 * Prepared vars used by the step builders.
 *
 * @sample
 * const prepared = prepareStepVars(
 *   {
 *     target: ".title",
 *     type: "from",
 *     vars: {
 *       opacity: 0,
 *       y: 40,
 *     },
 *     scrollTrigger: {
 *       start: "top 80%",
 *     },
 *   },
 *   "single",
 *   titleElement
 * );
 *
 * // prepared.vars contains:
 * // {
 * //   opacity: 0,
 * //   y: 40,
 * //   scrollTrigger: {
 * //     start: "top 80%",
 * //     trigger: titleElement
 * //   }
 * // }
 *
 * @sample
 * const prepared = prepareStepVars(
 *   {
 *     target: ".title",
 *     type: "fromTo",
 *     fromVars: {
 *       opacity: 0,
 *     },
 *     vars: {
 *       opacity: 1,
 *     },
 *   },
 *   "single"
 * );
 *
 * // prepared.fromVars → { opacity: 0 }
 * // prepared.vars     → { opacity: 1 }
 */
function prepareStepVars(step, targetMode, defaultTrigger) {
  const scrollTrigger = resolveScrollTrigger(step.scrollTrigger, targetMode, defaultTrigger);
  const vars = createStepVars(step.vars, scrollTrigger);
  const fromVars = createStepVars(step.fromVars);
  return {
    vars,
    fromVars,
    scrollTrigger
  };
}

/**
 * addSetStep
 *
 * Adds one `set()` operation to an existing GSAP Timeline.
 *
 * All generic configuration processing is delegated to ${@link prepareStepVars()}
 * This function is therefore responsible
 * only for the GSAP-specific `timeline.set()` call.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by this step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @sample
 * addSetStep(
 *   timeline,
 *   heroElement,
 *   {
 *     target: ".hero",
 *     type: "set",
 *     vars: {
 *       opacity: 0,
 *     },
 *   },
 *   "single",
 *   heroElement
 * );
 *
 * @sample
 * addSetStep(
 *   timeline,
 *   cards,
 *   {
 *     target: ".card",
 *     type: "set",
 *     vars: {
 *       y: 40,
 *     },
 *     scrollTrigger: {
 *       trigger: ".cards-section",
 *       start: "top 80%",
 *     },
 *   },
 *   "group"
 * );
 */
function addSetStep(timeline, target, step, targetMode, defaultTrigger) {
  const {
    vars
  } = prepareStepVars(step, targetMode, defaultTrigger);
  timeline.set(target, vars, step.position);
}

/**
 * addFromStep
 *
 * Adds one `from()` operation to an existing GSAP Timeline.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by this step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @sample
 * addFromStep(
 *   timeline,
 *   titleElement,
 *   {
 *     target: ".title",
 *     type: "from",
 *     vars: {
 *       opacity: 0,
 *       y: 50,
 *       duration: 0.8,
 *     },
 *   },
 *   "single",
 *   titleElement
 * );
 *
 * @sample
 * addFromStep(
 *   timeline,
 *   textElements,
 *   {
 *     target: ".text",
 *     type: "from",
 *     vars: {
 *       opacity: 0,
 *     },
 *     scrollTrigger: {
 *       start: "top 80%",
 *     },
 *   },
 *   "each",
 *   cardElement
 * );
 */
function addFromStep(timeline, target, step, targetMode, defaultTrigger) {
  const {
    vars
  } = prepareStepVars(step, targetMode, defaultTrigger);
  timeline.from(target, vars, step.position);
}

/**
 * addToStep
 *
 * Adds one `to()` operation to an existing GSAP Timeline.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by this step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @sample
 * addToStep(
 *   timeline,
 *   buttonElement,
 *   {
 *     target: ".button",
 *     type: "to",
 *     vars: {
 *       scale: 1.1,
 *       duration: 0.4,
 *     },
 *   },
 *   "single",
 *   buttonElement
 * );
 *
 * @sample
 * addToStep(
 *   timeline,
 *   cards,
 *   {
 *     target: ".card",
 *     type: "to",
 *     vars: {
 *       opacity: 1,
 *     },
 *     scrollTrigger: {
 *       trigger: ".cards",
 *       start: "top 80%",
 *     },
 *   },
 *   "group"
 * );
 */
function addToStep(timeline, target, step, targetMode, defaultTrigger) {
  const {
    vars
  } = prepareStepVars(step, targetMode, defaultTrigger);
  timeline.to(target, vars, step.position);
}

/**
 * addFromToStep
 *
 * Adds one `fromTo()` operation to an existing GSAP Timeline.
 *
 * `fromVars` defines the initial animation state and `vars`
 * defines the destination state.
 *
 * ScrollTrigger configuration is attached to the destination
 * vars object through `prepareStepVars()`.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by this step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @sample
 * addFromToStep(
 *   timeline,
 *   heroElement,
 *   {
 *     target: ".hero",
 *     type: "fromTo",
 *     fromVars: {
 *       opacity: 0,
 *       y: 80,
 *     },
 *     vars: {
 *       opacity: 1,
 *       y: 0,
 *       duration: 1,
 *     },
 *   },
 *   "single",
 *   heroElement
 * );
 *
 * @sample
 * addFromToStep(
 *   timeline,
 *   cardElement,
 *   {
 *     target: ".card__image",
 *     type: "fromTo",
 *     fromVars: {
 *       scale: 0.8,
 *     },
 *     vars: {
 *       scale: 1,
 *       duration: 0.7,
 *     },
 *     scrollTrigger: {
 *       start: "top 80%",
 *     },
 *   },
 *   "each",
 *   cardElement
 * );
 */
function addFromToStep(timeline, target, step, targetMode, defaultTrigger) {
  const {
    fromVars,
    vars
  } = prepareStepVars(step, targetMode, defaultTrigger);
  timeline.fromTo(target, fromVars, vars, step.position);
}

//////////////////// GSAP ANIMATIONS ////////////////////////////
/**
 * Initializes all page animations and animation-related event handlers.
 *
 * The function is the main runtime entry point for the site's animation system.
 * It lazily loads GSAP and ScrollTrigger, resolves the current page names,
 * creates shared burger-navigation handlers, and runs both common and
 * page-specific animation builders.
 *
 * Animation execution is delegated to {@link runPageAnimations}, which
 * determines which page-specific animations should run based on the
 * resolved page names.
 *
 * If GSAP or ScrollTrigger cannot be loaded, initialization is aborted
 * and the error is reported through {@link logInitError}.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initAnimations() {
  const gsapAll = await (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.getGSAP)();
  if (!gsapAll) {
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.logInitError)({
      component: "initAnimations",
      message: `gsap is not loaded... omitting...`,
      details: gsapAll
    });
    return;
  }
  const {
    gsap,
    ScrollTrigger
  } = gsapAll;

  /**
   * Runtime collection of valid page names.
   *
   * The collection is derived from the page navigation anchors and is used
   * by {@link runPageAnimations} to determine which page-specific
   * animations should be initialized.
   *
   * @type {Set<TPageName>}
   */
  const pageNames = createPageNameSet(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.linkAnchors);

  /**
   * Animation builders available for the current application.
   *
   * `common` contains animations and interaction handlers shared by all pages.
   * Page-specific builders are keyed by {@link TPageName}.
   *
   * @type {TPageAnimations}
   */
  const pageAnimations = {
    automation: () => {
      /*			buildParallax(
      				gsap,
      				SELECTORS.automationParallaxBg,
      				SELECTORS.automationParallax
      			);*/
    },
    common: () => {
      //Hero section priority...
      buildHeroTimeline(gsap, "heroAnimation", _animationParams_js__WEBPACK_IMPORTED_MODULE_4__.heroTimelineParams);

      //initializing burger handlers, build and register animation timeline...
      /*			initBurgerMenu(
      				gsap,
      				navMenuSelectorsData,
      				burgerNavTimelineParams
      			);*/

      /*		buildParallax(gsap, SELECTORS.servicesParallaxBg, SELECTORS.servicesParallax);
      		buildFadeAnimations(gsap, SELECTORS.fadeInLeft, "fadeInLeft", {
      			x: -60,
      			y: 40,
      			duration: 1,
      			ease: "circ.out"
      		});
      		buildFadeAnimations(gsap, SELECTORS.fadeInRight, "fadeInRight", {
      			x: 60,
      			y: 40,
      			duration: 1,
      			ease: "circ.out"
      		});
      		buildFadeAnimations(gsap, SELECTORS.scaleIn, "scaleIn", {
      			scale: 0.7,
      			duration: 1.2,
      			ease: "back.out(1)"
      		});
      		buildFadeAnimations(gsap, SELECTORS.fadeInUp, "fadeInUp", {
      			y: 40,
      			duration: 1,
      			ease: "circ.out"
      		});
      		buildScrolledNav(gsap);*/
    }
  };
  runPageAnimations(pageAnimations, pageNames);
}

/**
 * Initializes common and page-specific animations.
 *
 * Common animations are always executed.
 * Page-specific animations are executed only when a corresponding
 * animation function has been registered for the current page.
 *
 * @param {TPageAnimations} animations
 * @param {ReadonlySet<string>} pageNames
 *
 * @returns {void}
 */
function runPageAnimations(animations, pageNames) {
  const pageName = getCurrentPageName(pageNames);

  // Common animations are mandatory.
  animations.common();

  // Stop when the current page name is missing or invalid.
  if (!pageName) {
    return;
  }
  const pageAnimation = animations[pageName];

  // Page-specific animations are optional.
  if (!pageAnimation) {
    return;
  }
  pageAnimation();
}

/**
 * Initializes the complete Burger navigation subsystem.
 *
 * This function acts as the composition layer for Burger navigation.
 *
 * It coordinates:
 *
 * 1. DOM dependency resolution;
 * 2. Timeline construction;
 * 3. Event callback creation;
 * 4. Burger listener attachment;
 * 5. Outside-click listener attachment.
 *
 * The individual responsibilities remain delegated:
 *
 *     requireElements()
 *         → resolves DOM dependencies
 *
 *     buildTimeline()
 *         → builds and registers the animation
 *
 *     initBurgerHandlers()
 *         → creates event callbacks
 *
 *     initBurgerListener()
 *         → handles Burger trigger interaction
 *
 *     closeBurgerClickHandler()
 *         → handles outside-click behavior
 *
 * This function intentionally contains no animation implementation
 * and no event-handling logic of its own.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {TNavMenuSelector[]} selectors
 * Selector configuration for Burger navigation DOM dependencies.
 *
 * @param {TSingleTimelineParams} timelineParams
 * Declarative configuration for the Burger navigation Timeline.
 *
 * @returns {void}
 */
function initBurgerMenu(gsap, selectors, timelineParams) {
  /**
   * Resolve all Burger-related DOM dependencies once.
   *
   * The type assertion is intentionally placed at the boundary
   * between the generic DOM utility and the Burger-specific subsystem.
   */
  const burgerElementsData = /** @type {TBurgerElements} */
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.requireElements)(selectors);

  /**
   * Extract the Burger trigger collection.
   *
   * These Elements are needed only to attach the callbacks created
   * by initBurgerHandlers().
   */
  const {
    burgerNavAll
  } = burgerElementsData;

  /**
   * Build the Burger navigation Timeline.
   *
   * The Timeline is already configured with its declared initial
   * runtime state and registered in the animation cache by the builder.
   */
  const navMenuAnime = buildSingleTimeline(gsap, timelineParams);

  /**
   * Initialize callbacks that control the Burger navigation.
   *
   * initBurgerHandlers() does not attach listeners itself.
   * It only creates callback functions with the required dependencies
   * closed over.
   */
  const {
    closeBurgerHandler,
    attachBurgerListener
  } = initBurgerHandlers(burgerElementsData, navMenuAnime);

  /**
   * Attach the Burger click handler to every resolved trigger.
   *
   * DOM lookup is not repeated here because all required Elements
   * were resolved once at the beginning of this function.
   */
  burgerNavAll.forEach(burger => attachBurgerListener(burger));

  /**
   * Attach the document-level outside-click handler.
   */
  document.addEventListener("click", closeBurgerHandler);
}

/**
 * Initializes Burger navigation event callbacks.
 *
 * This function is intentionally limited to event-handler composition.
 * It does not:
 *
 * - resolve DOM elements;
 * - create GSAP animations;
 * - register animations in the animation cache;
 * - attach event listeners.
 *
 * All required runtime dependencies are supplied by the caller.
 *
 * The function creates closures around `burgerElementsData` and
 * `navMenuAnime`, allowing the returned callbacks to be used directly
 * with DOM event APIs.
 *
 * @param {TBurgerElements} burgerElementsData
 * Resolved DOM elements required by Burger navigation.
 *
 * @param {TTimeline} navMenuAnime
 * GSAP Timeline controlling the fixed navigation menu.
 *
 * @returns {{
 *     closeBurgerHandler: (e: MouseEvent) => void,
 *     attachBurgerListener: (burger: Element) => void
 * }}
 * Event callbacks used by the Burger navigation initializer.
 */
function initBurgerHandlers(burgerElementsData, navMenuAnime) {
  /**
   * Creates the document-level click callback.
   *
   * The callback delegates the actual behavior to
   * `closeBurgerClickHandler()`.
   *
   * @param {MouseEvent} e
   * Mouse click event.
   *
   * @returns {void}
   */
  const closeBurgerHandler = e => {
    closeBurgerClickHandler(e, burgerElementsData, navMenuAnime);
  };

  /**
   * Creates a callback that attaches the Burger click handler
   * to one specific Burger trigger.
   *
   * The actual interaction logic remains inside
   * `initBurgerListener()`.
   *
   * @param {Element} burger
   * Burger navigation trigger.
   *
   * @returns {void}
   */
  const attachBurgerListener = burger => {
    initBurgerListener(burger, burgerElementsData, navMenuAnime);
  };
  return {
    closeBurgerHandler,
    attachBurgerListener
  };
}

/**
 * Initializes the click listener for one Burger navigation trigger.
 *
 * The listener toggles the ARIA state of the Burger controls,
 * controls document scrolling, and drives the supplied GSAP Timeline.
 *
 * Opening the navigation plays the Timeline.
 * Closing the navigation reverses the Timeline.
 *
 * @param {Element} burger
 * Burger navigation trigger element.
 *
 * @param {TBurgerElements} burgerElementsData
 * Resolved DOM elements required by the navigation.
 *
 * @param {TTimeline} navMenuAnime
 * GSAP Timeline controlling the fixed navigation menu.
 *
 * @returns {void}
 */
function initBurgerListener(burger, burgerElementsData, navMenuAnime) {
  const {
    burgerHidden,
    burgerFixed,
    navMenuFixed
  } = burgerElementsData;
  burger.addEventListener("click", e => {
    // Prevent the browser's default action for the Burger control.
    e.preventDefault();
    const isExpanded = burger.getAttribute("aria-expanded") === "true";

    // Keep all Burger-related ARIA states synchronized.
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setAttributes)([burgerHidden, burgerFixed, navMenuFixed], {
      "aria-expanded": !isExpanded
    });
    if (isExpanded) {
      // Restore the default scrollbar behavior.
      (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.restoreDocumentScroll)();

      // Reverse the Timeline to hide the navigation.
      navMenuAnime.reverse();
      return;
    }

    // Preserve the scrollbar width while the navigation is open.
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.lockDocumentScroll)();

    // Play the Timeline to reveal the navigation.
    navMenuAnime.play();
  });
}

/**
 * Handles a document click used to close the Burger navigation.
 *
 * The navigation is closed only when:
 *
 * 1. the event target is a DOM Element;
 * 2. the click occurs outside the Burger navigation;
 * 3. the navigation is currently expanded.
 *
 * @param {MouseEvent} e
 * Document click event.
 *
 * @param {TBurgerElements} burgerElementsData
 * Resolved Burger navigation DOM elements.
 *
 * @param {TTimeline} navMenuAnime
 * GSAP Timeline controlling the fixed navigation menu.
 *
 * @returns {void}
 */
function closeBurgerClickHandler(e, burgerElementsData, navMenuAnime) {
  // Ignore events whose target is not a DOM Element.
  if (!(e.target instanceof Element)) {
    return;
  }

  // Ignore clicks originating inside the Burger navigation.
  if (e.target.closest(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.burgerNav)) {
    return;
  }
  const {
    burgerHidden,
    burgerFixed,
    navMenuFixed
  } = burgerElementsData;
  const isNavActive = navMenuFixed.getAttribute("aria-expanded") === "true";

  // Nothing to close when the navigation is already collapsed.
  if (!isNavActive) {
    return;
  }

  // Synchronize the ARIA state of all Burger controls.
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setAttributes)([burgerHidden, burgerFixed, navMenuFixed], {
    "aria-expanded": false
  });

  // Reverse the Timeline to hide the fixed navigation.
  navMenuAnime.reverse();

  // Restore document scrolling.
  document.body.style.overflow = "auto";
}

/**
 * Creates a runtime collection of registered page names.
 *
 * The type assertion is intentionally localized here because
 * `Object.keys()` widens its result to `string[]`.
 *
 * @param {typeof linkAnchors} anchors
 *
 * @returns {Set<TPageName>}
 */
function createPageNameSet(anchors) {
  return new Set(/** @type {TPageName[]} */
  Object.keys(anchors));
}

/**
 * Builds and registers the Hero section entrance animation Timeline.
 *
 * @param {TGsap} gsap
 * @param {string} key
 * @param {TGroupTimelineParams} params
 * @returns {TTimeline}
 */
function buildHeroTimeline(gsap, key, params) {
  return buildGroupTimeline(gsap, key, params);
}

// ============================================
// BUILDER FUNCTIONS (accept gsap instance)
// ============================================

/**
 * Builds and registers the hero section entrance animation timeline.
 *
 * The builder assumes that GSAP has already been successfully initialized.
 * DOM target resolution is delegated to GSAP.
 *
 * @param {TGsap} gsap - Initialized GSAP instance.
 * @param {string} tlName - Cache key for the created animation.
 * @returns {TTimeline}
 */
function buildHeroTimelineVer(gsap, tlName) {
  const tlHero = gsap.timeline();
  tlHero.to(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.headingAccentHero, {
    opacity: 1,
    duration: 2,
    delay: 0.3
  });
  tlHero.from(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.headingAccentHero, {
    x: 80,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.headingHeroRest, {
    opacity: 1,
    duration: 2
  }, "<");
  tlHero.from(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.headingHeroRest, {
    x: -80,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.textBlockHero, {
    opacity: 1,
    duration: 2
  }, "-=1.5");
  tlHero.from(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.textBlockHero, {
    y: 80,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.biddingBlockHero, {
    opacity: 1,
    duration: 2
  }, "<+0.3");
  tlHero.from(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.biddingBlockHero, {
    y: 40,
    duration: 0.8,
    ease: "circ.out"
  }, "<");
  tlHero.to(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.iconWrapperHero, {
    scale: 1,
    duration: 1.5,
    ease: "elastic.out"
  }, "<+0.2");
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.registerAnimation)(tlName, tlHero);
  return tlHero;
}

/**
 * Builds the scrolled navigation show/hide animation.
 *
 * @param {TGsap} gsap - GSAP instance
 * @throws {Error} if the Element with the given selector is not found in DOM...
 * @returns {TTween}
 */
function buildScrolledNav(gsap) {
  /**
   * target is used for registering animation with {@link registerAnimation} args: (Element|string, core.Tween)
   * we cannot use selector as the key because of multiple Elements with the same selector...
   * therefore we use separate Element as the key for the current animation
   * in order to avoid the Element which is not found in DOM we throw Error
   * finally buildScrolledNav
   */
  const target = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getDOMElement)(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.scrolledNav);
  if (!target) {
    throw TypeError(`[buildScrolledNav]: target ${_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.scrolledNav} not found in DOM...`);
  }
  const tween = gsap.to(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.scrolledNav, {
    top: -10,
    duration: 0.7,
    ease: "back.out(1.5)",
    delay: 0.5,
    scrollTrigger: {
      trigger: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.benefitsSection,
      start: "top 5%",
      toggleActions: "play none none reverse",
      preventOverlaps: true
    }
  });
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.registerAnimation)(target, tween);
  return tween;
}

/**
 * Builds a parallax background effect using GSAP's ScrollTrigger plugin.
 *
 * ScrollTrigger must be registered with GSAP before this function is called.
 * The created tween is registered in the animation cache using the target
 * element as its key.
 *
 * @param {TGsap} gsap - GSAP instance.
 * @param {string} targetSelector - Selector for the parallax target.
 * @param {string} triggerSelector - Selector for the ScrollTrigger container.
 *
 * @throws {Error} if target with the given selector is not in DOM
 *
 * @returns {TTween}
 */
function buildParallax(gsap, targetSelector, triggerSelector) {
  /**
   * Use the target Element as the animation identity.
   * Parallax animations are created by a generic builder, so a unique
   * application-level name is neither required nor naturally available.
   */
  const target = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getDOMElement)(targetSelector);
  if (!target) {
    throw new Error(`[buildParallax]: target selector "${targetSelector}" does not exist in DOM.`);
  }
  const tween = gsap.fromTo(target, {
    yPercent: 10
  }, {
    yPercent: -10,
    ease: "none",
    scrollTrigger: {
      trigger: triggerSelector,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.5,
      invalidateOnRefresh: true
    }
  });

  //caching Tween to js/partials/gsap-loader.js
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.registerAnimation)(target, tween);
  return tween;
}

/**
 * Builds fade-in animations for elements matching a selector.
 * Each element's timeline is cached individually to js/partials/gsap-loader.js
 *
 * @param {TGsap} gsap - GSAP instance
 * @param {string} targetSelector - CSS selector for target elements
 * @param {Object} fromParams - gsap.from parameters (entrance motion)
 * @returns {TTimeline[]}
 */
function buildFadeAnimations(gsap, targetSelector, fromParams) {
  return initAllTimelinesFromTo(gsap, targetSelector, {
    gsapFrom: fromParams
  }, {
    opacity: 1,
    duration: 0.7,
    delay: 0.2
  });
}

/**
 * Builds gallery image fade-in animations.
 *
 * @param {TGsap} gsap - GSAP instance
 * @param {HTMLElement[]} elemsArr - Gallery image elements
 * @returns {TTimeline} Timeline references
 */
function buildGalleryFade(gsap, elemsArr) {
  initAllTimelinesFromTo(gsap, elemsArr, document.querySelector(_initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.SELECTORS.galleryWork), {
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
// ===========================================

/*function openBurger() {
	document.addEventListener("click", closeBurgerHandler);
}

function closeBurger() {
	document.removeEventListener("click", closeBurgerHandler);
}*/

/**
 * Returns the current page name from the `<body data-type="...">`
 * attribute.
 *
 * The value is validated against the supplied runtime collection
 * of registered page names.
 *
 * @param {ReadonlySet<string>} pageNames
 *
 * @returns {TPageName | null}
 */
function getCurrentPageName(pageNames) {
  const pageName = document.body?.dataset?.type || null;
  if (!pageName) {
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.logInitError)({
      component: "getCurrentPageName",
      message: "<body> does not have a data-type attribute.",
      details: {
        dataset: document.body?.dataset
      }
    });
    return null;
  }
  if (!isPageName(pageName, pageNames)) {
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.logInitError)({
      component: "getCurrentPageName",
      message: `Unknown page name "${pageName}".`,
      details: {
        registeredPages: [...pageNames]
      }
    });
    return null;
  }
  return pageName;
}

/**
 * Checks whether a string is a registered page name.
 *
 * This function also acts as a TypeScript type guard and narrows
 * the value from `string` to `TPageName`.
 *
 * @param {string} value
 * @param {ReadonlySet<string>} pageNames intentionally wider
 *
 * @returns {value is TPageName}
 */
function isPageName(value, pageNames) {
  return pageNames.has(value);
}

//const imageItems = await createMasonry(gallerySelector, { gap: 20 });
//fadeInGallery(imageItems);

//const timelines = fadeInGallery(imageItems);
//Object.assign(totalTl, timelines);
/*function fadeInGallery(elemsArr = []) {
	return buildGalleryFade(gsap, elemsArr);
}*/

/**
 * Runs all page animations.
 * DOM readiness is guaranteed by index.js (DOMContentLoaded),
 * so no redundant readyState checks are needed here.
 *
 * @returns {Object.<string, gsap.core.Timeline|gsap.core.Tween>} Map of all active timelines/tweens
 */

/*  function animatePage() {
		return onPageLoaded(pageAnimations);
	}*/

/**
 *
 * @param animationData
 * @return {void}
 */
/*function onPageLoaded(animationData) {
	const pageName = document.body.dataset.type || "";
	const totalTl = {};
	if (animationData.common) Object.assign(totalTl, animationData.common());
	if (pageName in animation)....

 */

/***/ }),

/***/ "./src/js/partials/gsap-loader.js":
/*!****************************************!*\
  !*** ./src/js/partials/gsap-loader.js ***!
  \****************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getAnimation: function() { return /* binding */ getAnimation; },
/* harmony export */   getGSAP: function() { return /* binding */ getGSAP; },
/* harmony export */   isGsapLoaded: function() { return /* binding */ isGsapLoaded; },
/* harmony export */   isRegisteredAnimation: function() { return /* binding */ isRegisteredAnimation; },
/* harmony export */   killAnimation: function() { return /* binding */ killAnimation; },
/* harmony export */   registerAnimation: function() { return /* binding */ registerAnimation; }
/* harmony export */ });


/**
 * @file gsap-loader.js
 * @description Atomic lazy-loader for GSAP + ScrollTrigger.
 * Exports a global animation cache so that animations.js (or any consumer)
 * can register, retrieve, and kill tweens/timelines in one centralized place.
 */

/*** TYPES ***/

/**
 * TAnimation - Tween or Timeline
 * @typedef {gsap.core.Tween | gsap.core.Timeline} TAnimation or use type: gsap.core.Animation for any GSAP Animation
 */

/**
 * TAnimationKey - Key used to identify a cached animation.
 *
 * String keys are used for application-level animations,
 * while Element keys are used for element-bound animations.
 *
 * @typedef {string | Element} TAnimationKey
 */

/**
 * @typedef {{
 *   gsap: typeof import('gsap').gsap,
 *   ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger,
 * }} TGsapModules
 */

///////////////

/** @type {TGsapModules|null} */
let gsapModules = null;

// ============================================
// CACHE & STATE
// ============================================
/**
 * It is used for registering the animations of a particular Element
 * Using WeakMap for GC in case of removal of elements from DOM and cleaning its animations
 * @type {WeakMap<Element, TAnimation>}
 */
const elementAnimations = new WeakMap();

/**
 * It is used for registering the "named" animations, which are not connected to a particular Element
 * @type {Map<string, TAnimation>}
 */
const namedAnimations = new Map();

// ============================================
// LOADER
// ============================================

/**
 * Loads and caches GSAP + ScrollTrigger as a single atomic chunk.
 * Returns the cached modules when called again.
 *
 * @returns {Promise<TGsapModules | null>}
 */
async function getGSAP() {
  if (gsapModules) {
    return gsapModules;
  }
  const {
    gsap,
    ScrollTrigger
  } = await __webpack_require__.e(/*! import() | gsap */ "gsap").then(__webpack_require__.bind(__webpack_require__, /*! ./gsap-all.js */ "./src/js/partials/gsap-all.js"));
  if (!gsap || !ScrollTrigger) {
    console.error("at getGSAP: no gsap or ScrollTrigger imported...");
    return null;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsapModules = {
    gsap,
    ScrollTrigger
  };
  return gsapModules;
}

// ============================================
// ANIMATION CACHE API
// ============================================
/**
 * Registers a GSAP animation by element or application-level name.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @param {TAnimation} animation - GSAP animation instance.
 * @returns {void}
 */
function registerAnimation(key, animation) {
  if (typeof key !== "string" && !(key instanceof Element)) {
    throw TypeError(`[registerAnimation]: the given key must be string or Element... given key: ${key}`);
  }
  if (typeof key === "string" && !key) {
    throw new TypeError(`[registerAnimation]: the given key: ${key} has no length: ${key.length}`);
  }

  //testing registered animations...
  if (isRegisteredAnimation(key)) {
    console.count("Animation is already registered:");
    console.log(key, "key: ");
    console.log(animation, "animation: ");
  }
  if (typeof key === "string") {
    namedAnimations.set(key, animation);
    return;
  }
  elementAnimations.set(key, animation);
}

/**
 * Returns a registered animation.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @returns {TAnimation | undefined}
 */
function getAnimation(key) {
  if (typeof key === "string") {
    return namedAnimations.get(key);
  }
  return elementAnimations.get(key);
}

/**
 * Returns a registered animation.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @returns {boolean}
 */
function isRegisteredAnimation(key) {
  if (typeof key === "string") {
    return namedAnimations.has(key);
  }
  return elementAnimations.has(key);
}

/**
 * Kills and removes a registered animation.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @returns {void}
 */
function killAnimation(key) {
  const animation = getAnimation(key);
  if (!animation) {
    return;
  }
  animation.kill();
  if (typeof key === "string") {
    namedAnimations.delete(key);
  } else {
    elementAnimations.delete(key);
  }
}

/**
 * Checks if GSAP is loaded.
 * @returns {boolean}
 */
function isGsapLoaded() {
  return gsapModules !== null;
}

/***/ }),

/***/ "./src/js/partials/initialSelectors.js":
/*!*********************************************!*\
  !*** ./src/js/partials/initialSelectors.js ***!
  \*********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SELECTORS: function() { return /* binding */ SELECTORS; },
/* harmony export */   gallerySelector: function() { return /* binding */ gallerySelector; },
/* harmony export */   galleryThumbsFolderName: function() { return /* binding */ galleryThumbsFolderName; },
/* harmony export */   langSwitchData: function() { return /* binding */ langSwitchData; },
/* harmony export */   linkAnchors: function() { return /* binding */ linkAnchors; },
/* harmony export */   linkClassNameActive: function() { return /* binding */ linkClassNameActive; },
/* harmony export */   navHexagonSelector: function() { return /* binding */ navHexagonSelector; },
/* harmony export */   navLinkSelector: function() { return /* binding */ navLinkSelector; },
/* harmony export */   navMenuSelectorsData: function() { return /* binding */ navMenuSelectorsData; }
/* harmony export */ });


/**
 * @file initialSelectors.js
 * @description Initial Data with selectors
 */

//*** TYPE DEFINITIONS ***//

/**
 * TBurgerElements DOM elements required by the navigation menu.
 *
 * @typedef {Object} TBurgerElements
 * @property {Element} navMenuFixed
 * @property {Element} burgerHidden
 * @property {Element} burgerFixed
 * @property {Element[]} burgerNavAll
 */

/**
 * TDOMSelectorConfig: Configuration for a generic DOM element lookup.
 *
 * @typedef {Object} TDOMSelectorConfig
 * @property {string} key - Property name used in the resulting object.
 * @property {string} selector - CSS selector used to find the element(s).
 * @property {boolean} [multiple=false] - Whether all matching elements should be returned.
 */

/**
 * TNavMenuSelector: Configuration for navigation menu DOM element lookup.
 *
 * Specializes the generic selector configuration by restricting `key`
 * to the known properties of `TBurgerElements`.
 *
 * @typedef {Omit<TDOMSelectorConfig, "key"> & {
 *     key: keyof TBurgerElements
 * }} TNavMenuSelector
 */

/**
 * Page names defined by the linkAnchors registry.
 *
 * @typedef {keyof typeof linkAnchors} TPageName
 */
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
  langSwitcherCurrent: ".lang-switcher__current",
  langSwitcherButton: ".lang-switcher__button",
  langSwitcherItem: ".lang-switcher__item",
  langActiveSelector: ".active",
  langListSelector: "#lang-list",
  langOptionArr: ["uk", "ru"],
  dataSetKey: "lang"
};
const gallerySelector = "#gallery-work";
const galleryThumbsFolderName = "thumbs";

// ============================================
// ANIMATIONS SELECTORS
// ============================================

/** @type {Object.<string, string>} Animation selectors map */
const SELECTORS = {
  scrolledNav: "#scrolledNav",
  burgerNav: ".burger_nav",
  //for multiple elements
  burgerFixed: ".burger_nav:not(.hidden)",
  burgerHidden: ".burger_nav.hidden",
  navMenuFixed: "#nav-abs",
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

/**
 * @type {TNavMenuSelector[]}
 *
 * DOM elements required by Burger navigation handlers.
 */
const navMenuSelectorsData = [{
  key: "navMenuFixed",
  selector: SELECTORS.navMenuFixed,
  multiple: false
}, {
  key: "burgerHidden",
  selector: SELECTORS.burgerHidden,
  multiple: false
}, {
  key: "burgerFixed",
  selector: SELECTORS.burgerFixed,
  multiple: false
}, {
  key: "burgerNavAll",
  selector: SELECTORS.burgerNav,
  multiple: true
}];

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