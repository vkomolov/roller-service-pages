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
/* harmony export */   initLog: function() { return /* binding */ initLog; },
/* harmony export */   isInSet: function() { return /* binding */ isInSet; },
/* harmony export */   isKeyOf: function() { return /* binding */ isKeyOf; },
/* harmony export */   randomNum: function() { return /* binding */ randomNum; },
/* harmony export */   setLocalStorage: function() { return /* binding */ setLocalStorage; },
/* harmony export */   tryUse: function() { return /* binding */ tryUse; }
/* harmony export */ });


/**** TYPE DEFINITIONS ****/

/**
 *! DOM type aliases used by this module.
 *
 * @typedef {import("../types/dom.types.js").TLogMessageParams} TLogMessageParams
 */

/**
 * for typing of argument params of {@link getInvalidKeys}
 * @typedef {{
 *   invalidValues?: unknown[]
 * }} TGetInvalidKeysParams
 */

////////////

/**
 * Returns a random integer in the inclusive range [min, max].
 *
 * @param {number} min - Lower bound (inclusive).
 * @param {number} max - Upper bound (inclusive).
 * @returns {number} Random integer between `min` and `max`.
 *
 * @throws {TypeError} When arguments are not finite numbers.
 * @throws {RangeError} When `min` is greater than `max`.
 */
function randomNum(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new TypeError("[randomNum]: both arguments must be finite numbers.");
  }
  if (min > max) {
    throw new RangeError(`[randomNum]: min (${min}) must not exceed max (${max}).`);
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
 * @param {*[]} fromArray - target array
 * @param {number} [maxRandCount=1] max number of the random elems from the given array
 * @return {*[] | undefined} the array of the random elements from the given array
 */
function getRandomElemsfromArray(fromArray, maxRandCount = 1) {
  if (!Array.isArray(fromArray) || fromArray.length < maxRandCount) {
    console.error(`the length of the given array ${fromArray.length} should not be less than max random count ${maxRandCount}...`);
    return;
  }
  const innArray = [...fromArray];

  // Shuffle the array randomly (Fisher-Yates method)
  for (let i = innArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [innArray[i], innArray[j]] = [innArray[j], innArray[i]]; // Swapping elements
  }

  // Return the first maxRandCount numbers
  return innArray.slice(0, maxRandCount);
}

/**
 * @typedef {{
 *   data: Record<string, unknown>,
 *   creationDate: number,
 * }} TLocalStorageEntry
 */

/**
 * Milliseconds in one day, used for TTL calculations.
 * @type {number}
 */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Reads a localStorage entry and validates it against a TTL in days.
 *
 * Returns `undefined` in every "no usable data" scenario:
 * missing key, malformed JSON, unexpected data shape, or expired TTL.
 *
 * Absence of data is a normal state and is not logged as an error.
 *
 * @param {string} name - localStorage key.
 * @param {number} [timeLimit=1] - Time-to-live in days.
 * @returns {TLocalStorageEntry | undefined} The stored entry, or `undefined`.
 */
function getLocalStorage(name, timeLimit = 1) {
  let parsed;
  try {
    const storage = localStorage.getItem(name);

    // Missing key is a normal first-visit state, not an error.
    if (storage === null) {
      return undefined;
    }
    parsed = JSON.parse(storage);
  } catch (error) {
    // Quota/security errors on read, or malformed JSON.
    console.error(`[getLocalStorage]: failed to read "${name}":`, error);
    return undefined;
  }

  // Validate the expected entry shape before trusting its fields.
  if (typeof parsed !== "object" || parsed === null || !Number.isFinite(parsed.creationDate)) {
    console.warn(`[getLocalStorage]: entry "${name}" has an invalid shape.`);
    return undefined;
  }
  const ageInDays = (Date.now() - parsed.creationDate) / MS_PER_DAY;
  if (ageInDays > timeLimit) {
    return undefined; // Expired entries are an expected state.
  }
  return /** @type {TLocalStorageEntry} */parsed;
}

/**
 * Writes data to localStorage wrapped with a creation timestamp,
 * so that {@link getLocalStorage} can validate its TTL.
 *
 * @param {string} name - localStorage key.
 * @param {Record<string, unknown>} data - Payload to store.
 * @returns {boolean} `true` when the entry was written successfully.
 */
function setLocalStorage(name, data) {
  const entry = {
    data,
    creationDate: Date.now()
  };
  try {
    localStorage.setItem(name, JSON.stringify(entry));
    return true;
  } catch (error) {
    // QuotaExceededError or storage disabled (e.g. private mode).
    console.error(`[setLocalStorage]: failed to write "${name}":`, error);
    return false;
  }
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

/**
 * @param {"warn"|"log"|"error"} logType
 * @param {TLogMessageParams} params
 * @returns {void}
 */
function initLog(logType, params) {
  const {
    component = 'Unknown',
    message = '',
    details
  } = params;
  if (typeof console[logType] !== 'function') {
    throw new TypeError(`[initLog]: unsupported log type "${logType}".`);
  }
  const formattedMessage = `[${component}]: ${message}`;
  if (details !== undefined) {
    // We pass them as separate arguments—modern browsers render this perfectly.
    console[logType](formattedMessage, '\nDetails:', details);
  } else {
    console[logType](formattedMessage);
  }
}

/**
 * Wraps a function to catch and log synchronous errors.
 *
 * @template {(...args: any[]) => any} T
 *
 * @param {T} func - The function to wrap.
 * @param {string} [fallbackName] - Optional custom name for logging (useful for anonymous/arrow functions).
 *
 * @returns {(...args: Parameters<T>) => (ReturnType<T> | undefined)}
 * A wrapped function that returns the original result or undefined if an error occurs.
 *
 * @throws {TypeError} If func is not a function.
 *
 * @example
 * // Option 1: Named function (the name will be picked up automatically)
 * function calculateTax(amount) { return amount * 0.2; }
 * const safeTax = tryUse(calculateTax);
 * safeTax(100);
 *
 * @example
 * // Option 2: Arrow function with a custom name for logs
 * const safeSum = tryUse((a, b) => a + b, 'sumOperation');
 * console.log(safeSum(2, 3)); // 5
 *
 * @example
 * const safeSum = tryUse((a, b) => a + b, 'sumOperation')(2, 3);
 *
 * @example
 * const safeSum = tryUse(someFunc)(2, 3);
 */
function tryUse(func, fallbackName) {
  if (typeof func !== 'function') {
    initLog('error', {
      component: 'tryUse',
      message: `Expected a function, received "${typeof func}".`,
      details: new TypeError(`Received ${typeof func} instead of function`)
    });
    return () => undefined;
  }
  const component = func.name || fallbackName || 'AnonymousFunction';
  return (/** @type {Parameters<T>} */...args) => {
    try {
      return func(...args);
    } catch (error) {
      initLog('error', {
        component,
        message: `An error occurred during animation initialization.`,
        details: error
      });
      return undefined;
    }
  };
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
/* harmony export */   applyMasonryLayout: function() { return /* binding */ applyMasonryLayout; },
/* harmony export */   attachModalListeners: function() { return /* binding */ attachModalListeners; },
/* harmony export */   calculateMasonryLayout: function() { return /* binding */ calculateMasonryLayout; },
/* harmony export */   calculateNavIndex: function() { return /* binding */ calculateNavIndex; },
/* harmony export */   canUseContextAsTarget: function() { return /* binding */ canUseContextAsTarget; },
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
/* harmony export */   getMasonryColumnsNumber: function() { return /* binding */ getMasonryColumnsNumber; },
/* harmony export */   getSelectorName: function() { return /* binding */ getSelectorName; },
/* harmony export */   initLangSwitcher: function() { return /* binding */ initLangSwitcher; },
/* harmony export */   initLockScroll: function() { return /* binding */ initLockScroll; },
/* harmony export */   initMasonry: function() { return /* binding */ initMasonry; },
/* harmony export */   isHTMLElement: function() { return /* binding */ isHTMLElement; },
/* harmony export */   isStyleSupported: function() { return /* binding */ isStyleSupported; },
/* harmony export */   lockDocumentScroll: function() { return /* binding */ lockDocumentScroll; },
/* harmony export */   lockedEventListener: function() { return /* binding */ lockedEventListener; },
/* harmony export */   measureMasonryItems: function() { return /* binding */ measureMasonryItems; },
/* harmony export */   migrateElement: function() { return /* binding */ migrateElement; },
/* harmony export */   observeIntersection: function() { return /* binding */ observeIntersection; },
/* harmony export */   replaceFilePath: function() { return /* binding */ replaceFilePath; },
/* harmony export */   requireElements: function() { return /* binding */ requireElements; },
/* harmony export */   restoreDocumentScroll: function() { return /* binding */ restoreDocumentScroll; },
/* harmony export */   setAttributes: function() { return /* binding */ setAttributes; },
/* harmony export */   setDocumentScrollLocked: function() { return /* binding */ setDocumentScrollLocked; },
/* harmony export */   toggleClassOnIntersection: function() { return /* binding */ toggleClassOnIntersection; }
/* harmony export */ });
/* harmony import */ var _funcs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./funcs.js */ "./src/js/helpers/funcs.js");
/* harmony import */ var _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../partials/initialSelectors.js */ "./src/js/partials/initialSelectors.js");





//////////////// TYPE DEFINITIONS /////////////////
/**
 *! DOM type aliases used by this module.
 *
 * @typedef {import("../types/dom.types.js").TDOMSelectorConfig} TDOMSelectorConfig
 * @typedef {import("../types/dom.types.js").ImageSize} ImageSize
 * @typedef {import("../types/dom.types.js").LoadedImageResult} LoadedImageResult
 * @typedef {import("../types/dom.types.js").TActivateNavlinkParams} TActivateNavlinkParams
 * @typedef {import("../types/dom.types.js").TInitLangSwitcherParams} TInitLangSwitcherParams
 * @typedef {import("../types/dom.types.js").TGetLangItemsParams} TGetLangItemsParams
 * @typedef {import("../types/dom.types.js").TLogMessageParams} TLogMessageParams
 * @typedef {import("../types/dom.types.js").ModalState} ModalState
 *
 */

/**
 * ! MASONRY type aliases used by this module.
 *
 * @typedef {import("../types/masonry.types.js").TMasonryItemMeasurement} TMasonryItemMeasurement
 * @typedef {import("../types/masonry.types.js").TMasonryColumnCalculation} TMasonryColumnCalculation
 * @typedef {import("../types/masonry.types.js").TMasonryLayout} TMasonryLayout
 * @typedef {import("../types/masonry.types.js").TMasonryColumns} TMasonryColumns
 * @typedef {import("../types/masonry.types.js").TMasonryItemLayout} TMasonryItemLayout
 * @typedef {import("../types/masonry.types.js").TMasonryConfig} TMasonryConfig
 * @typedef {import("../types/masonry.types.js").TMasonryResizeSchedulerState} TMasonryResizeSchedulerState
 * @typedef {import("../types/masonry.types.js").TMasonryLifecycleState} TMasonryLifecycleState
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
 * The activation flag is updated synchronously while the DOM mutation
 * is deferred to the next animation frame. This prevents duplicate
 * scheduled frames when the observer fires again before the pending
 * frame executes.
 *
 * @param {HTMLElement} targetElement - The element whose class will be toggled.
 * @param {HTMLElement} triggerElement - The element that triggers the class change.
 * @param {string} activeClass - The CSS class to add/remove.
 * @param {Element | null} [root=null] - The scrolling container. Default is the viewport.
 * @param {string} [rootMargin="-1px 0px 0px 0px"] - Margin around the root to fine-tune trigger timing.
 *
 * @returns {() => void} Cleanup function that disconnects the observer.
 */
function toggleClassOnIntersection(targetElement, triggerElement, activeClass, root = null, rootMargin = '-1px 0px 0px 0px') {
  if (!targetElement?.isConnected || !triggerElement?.isConnected) {
    throw new Error('[toggleClassOnIntersection]: targetElement or triggerElement is not connected to the DOM.');
  }
  let isClassActive = false;
  const observer = new IntersectionObserver(([entry]) => {
    const shouldActivate = entry.boundingClientRect.top <= 0 && !entry.isIntersecting;

    // No state change — nothing to schedule.
    if (shouldActivate === isClassActive) {
      return;
    }

    // Synchronous flag update blocks duplicate scheduling
    // from observer notifications arriving before the frame.
    isClassActive = shouldActivate;
    requestAnimationFrame(() => {
      targetElement.classList.toggle(activeClass, shouldActivate);
    });
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
      (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
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
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
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
 * Determines whether the search context can be used as a fallback target.
 *
 * The context is eligible only when:
 *
 * - `includeContextSelector` is enabled;
 * - the context is an Element;
 * - the context itself matches the requested selector.
 *
 * @param {Document | Element} context
 * DOM context used for the selector search.
 *
 * @param {string} targetSelector
 * CSS selector used to resolve the target.
 *
 * @param {boolean} includeContextSelector
 * Whether the context Element may be used as a fallback target.
 *
 * @returns {boolean}
 * `true` when the context can be used as a fallback target;
 * otherwise, `false`.
 */
function canUseContextAsTarget(context, targetSelector, includeContextSelector) {
  return includeContextSelector && context instanceof Element && context.matches(targetSelector);
}

/**
 * Finds an element in the DOM, checks its existence, and types it for JSDoc/TS.
 * If the element is not found, logs an error.
 *
 * @template {Element} T - Expected element type (e.g., HTMLButtonElement)
 * @param {string} selector - CSS selector to search for
 * @param {Document | Element | DocumentFragment} [context=document] - Search context.
 * @param {boolean} [useLog=true]
 * @returns {T | undefined} Returns the element or null (to safely exit the function)
 *
 * @sample
 * above:@template {HTMLButtonElement}
 * const button = getDOMElement('.js-submit-btn');
 *
 * @sample
 * above:@template {HTMLFormElement}
 * const form = getDOMElement('#login-form', document, false);
 * if (!form) return;
 *
 */
function getDOMElement(selector, context = document, useLog = true) {
  const element = context.querySelector(selector);
  if (!element) {
    useLog && (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
      component: "getDOMElement",
      message: `Element with selector "${selector}" was not found in the DOM.`,
      details: {
        parent: context?.constructor?.name,
        targetSelector: selector,
        targetElement: element
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
 * The selector is first resolved against descendants of the provided
 * context. The context Element itself is considered only when no
 * matching descendants are found.
 *
 * When `includeContextSelector` is enabled and the context Element
 * matches the requested selector, the context is returned as a fallback
 * target.
 *
 * This allows a Timeline root to be used as a step target without
 * changing the default meaning of selector resolution: step targets
 * are resolved inside the provided context whenever matching Elements
 * exist there.
 *
 * The generic type `T` describes the expected Element type at the
 * call site. Runtime type validation is intentionally not performed
 * by this function.
 *
 * @template {Element} T
 *
 * @param {string} selector
 * CSS selector used to resolve the target Element(s).
 *
 * @param {Document | Element} [context=document]
 * DOM context in which the selector should be searched.
 *
 * @param {boolean} [multiple=true]
 * Whether to return all matching descendants.
 * When `false`, only the first matching descendant is returned.
 *
 * @param {boolean} [includeContextAsTarget=false]
 * Whether the context Element may be used as a fallback target
 * when no matching descendants are found.
 *
 * @param {boolean} [useLog=true]
 * if true, it will make log with warning, if it returns an empty array
 *
 * @returns {T[]}
 * Array containing the resolved Element(s).
 * Returns an empty array when neither matching descendants nor
 * a matching context Element can be resolved.
 *
 * @example
 * type {HTMLButtonElement[]}
 * const buttons = getElements(".button");
 *
 * @example
 * type {HTMLElement[]}
 * const header = getElements(
 *   "#header",
 *   document,
 *   false,
 * );
 *
 * @example
 * type {HTMLElement[]}
 * const targets = getElements(
 *   ".card",
 *   cardRoot,
 *   true,
 *   true,
 * );
 */
function getElements(selector, context = document, multiple = true, includeContextAsTarget = false, useLog = true) {
  const targets = multiple ? (/** @type {T[]} */
  [...context.querySelectorAll(selector)]) : (() => {
    const target = context.querySelector(selector);
    return target ? [(/** @type {T} */target)] : [];
  })();

  /*
   * Prefer matching descendants over the context itself.
   *
   * The context is considered only when the selector produced
   * no descendant targets.
   */
  if (!targets.length && canUseContextAsTarget(context, selector, includeContextAsTarget)) {
    targets.push(/** @type {T} */context);
  }
  if (!targets.length && useLog) {
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
      component: "getElements",
      message: `Element with selector "${selector}" ` + "was not found in DOM.",
      details: {
        context: context.constructor.name,
        multiple,
        includeContextAsTarget
      }
    });
  }
  return targets;
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
 * @param {Document | Element} [context=document]
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
      (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
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
 * Sets or releases the document scroll lock.
 *
 * Applies `scrollbar-gutter: stable` to keep the layout stable while
 * the native scrollbar is hidden, preventing content shift.
 *
 * The function is idempotent: repeated calls with the same state
 * are no-ops.
 *
 * @param {boolean} locked - `true` to lock scrolling, `false` to restore.
 * @returns {void}
 */
function setDocumentScrollLocked(locked) {
  const gutterValue = locked ? "stable" : "";
  document.documentElement.style.scrollbarGutter = gutterValue;
  document.body.style.scrollbarGutter = gutterValue;
  document.body.style.overflow = locked ? "hidden" : "";
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
  document.documentElement.style.scrollbarGutter = "stable"; //html
  document.body.style.scrollbarGutter = "stable"; //body

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
 * @typedef {{
 *   background?: boolean | string
 * }} TImageParentMapOptions
 */

/**
 * Builds a mapping between image elements and their parent containers
 * Handles both <img> tags and background images
 *
 * @param {HTMLElement} container - The container which contains the images or image wrappers
 * @param {TImageParentMapOptions} options - imagesLoaded options
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

//!////// MASONRY ///////////
/**
 * `items` and `columns` are expected to be validated
 * by the preceding masonry calculation stages.
 *
 * In particular:
 * - all item widths are equal to `columns.width`;
 * - item dimensions are positive finite numbers;
 * - columns.count is a positive integer;
 * - columns.gap and columns.leftOffset are non-negative.
 */

/**
 * Recalculates Masonry layout after the container size changes.
 *
 * Errors are isolated from the ResizeObserver callback so that
 * a failed recalculation does not escape the observer lifecycle.
 *
 * @param {HTMLElement} container
 * Masonry container element.
 *
 * @param {TMasonryConfig} config
 * Normalized masonry configuration.
 *
 * @returns {void}
 */
function handleMasonryResize(container, config) {
  try {
    createMasonry(container, config);
  } catch (error) {
    ;(0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
      component: 'initMasonry',
      message: 'Masonry resize recalculation failed.',
      details: error
    });
  }
}

/**
 * Schedules a Masonry resize cycle.
 *
 * @param {TMasonryResizeSchedulerState} state
 * @returns {void}
 */
function scheduleMasonryResizeCycle(state) {
  if (state.cancelled || state.locked) return;
  state.locked = true;
  state.timeoutId = setTimeout(() => {
    state.timeoutId = null;
    requestMasonryResizeFrame(state);
  }, state.delay);
}

/**
 * Releases the current cycle and processes a pending request.
 *
 * @param {TMasonryResizeSchedulerState} state
 * @returns {void}
 */
function finishMasonryResizeCycle(state) {
  state.locked = false;
  if (state.cancelled || !state.pending) return;
  state.pending = false;
  scheduleMasonryResizeCycle(state);
}

/**
 * Runs Masonry recalculation in the next animation frame.
 *
 * @param {TMasonryResizeSchedulerState} state
 * @returns {void}
 */
function requestMasonryResizeFrame(state) {
  if (state.cancelled) {
    finishMasonryResizeCycle(state);
    return;
  }
  state.resizeRafId = requestAnimationFrame(() => {
    state.resizeRafId = null;
    try {
      if (!state.cancelled) {
        handleMasonryResize(state.container, state.config);
      }
    } finally {
      finishMasonryResizeCycle(state);
    }
  });
}

/**
 * Requests a Masonry recalculation.
 *
 * @param {TMasonryResizeSchedulerState} state
 * @returns {void}
 */
function requestMasonryResize(state) {
  if (state.cancelled) return;
  if (state.locked) {
    state.pending = true;
    return;
  }
  scheduleMasonryResizeCycle(state);
}

/**
 * Cancels pending Masonry resize work.
 *
 * @param {TMasonryResizeSchedulerState} state
 * @returns {void}
 */
function cancelMasonryResizeScheduler(state) {
  state.cancelled = true;
  state.pending = false;
  if (state.timeoutId !== null) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
  }
  if (state.resizeRafId !== null) {
    cancelAnimationFrame(state.resizeRafId);
    state.resizeRafId = null;
  }
  state.locked = false;
}

/**
 * Creates a rate-limited scheduler for Masonry resize calculations.
 *
 * @param {HTMLElement} container
 * @param {TMasonryConfig} config
 * @param {number} [delay=250]
 * @returns {{ schedule: () => void, cancel: () => void }}
 */
function createMasonryResizeScheduler(container, config, delay = 250) {
  /** @type {TMasonryResizeSchedulerState} */
  const state = {
    container,
    config,
    delay,
    locked: false,
    pending: false,
    cancelled: false,
    timeoutId: null,
    resizeRafId: null
  };
  return {
    schedule: () => requestMasonryResize(state),
    cancel: () => cancelMasonryResizeScheduler(state)
  };
}

/**
 * Validates the external input contract of the masonry layout calculation.
 *
 * This function validates only the calculation arguments themselves.
 * Individual item dimensions are validated separately by
 * `getMasonryItemWidth()`.
 *
 * @param {number} containerWidth
 * Available width of the masonry container, in pixels.
 *
 * @param {TMasonryItemMeasurement[]} items
 * Measured masonry item geometry.
 *
 * @param {number} gap
 * Horizontal and vertical gap between masonry items, in pixels.
 *
 * @throws {TypeError}
 * When `containerWidth` or `gap` is not a number,
 * or when `items` is not an array.
 *
 * @throws {RangeError}
 * When `containerWidth` is not greater than zero,
 * when `gap` is negative,
 * or when `items` is empty.
 */
function validateMasonryLayoutInput(containerWidth, items, gap) {
  if (!Number.isFinite(containerWidth)) {
    throw new TypeError(`[validateMasonryLayoutInput]: containerWidth must be a finite number, but received: ${containerWidth}`);
  }
  if (containerWidth <= 0) {
    throw new RangeError(`[validateMasonryLayoutInput]: containerWidth must be greater than zero, but received: ${containerWidth}`);
  }
  if (!Array.isArray(items)) {
    throw new TypeError('[validateMasonryLayoutInput]: items must be an array.');
  }
  if (items.length === 0) {
    throw new RangeError('[validateMasonryLayoutInput]: items must not be empty.');
  }
  if (!Number.isFinite(gap)) {
    throw new TypeError(`[validateMasonryLayoutInput]: gap must be a finite number, but received ${gap}`);
  }
  if (gap < 0) {
    throw new RangeError(`[validateMasonryLayoutInput]: gap must be greater than or equal to zero, but received ${gap}`);
  }
}

/**
 * Validates the declared image aspect ratio against the actual
 * intrinsic aspect ratio of the loaded image resource.
 *
 * The declared ratio is read directly from the HTML `width` and
 * `height` attributes. The actual ratio is calculated from
 * `naturalWidth` and `naturalHeight`.
 *
 * This function is diagnostic only. It does not modify the image
 * or trigger Masonry recalculation.
 *
 * @param {HTMLImageElement} image
 * Loaded image element to validate.
 *
 * @param {number} index
 * Zero-based index of the image within the Masonry collection.
 *
 * @returns {void}
 */
function validateImageAspectRatio(image, index) {
  /*
   * Read the dimensions declared explicitly in the HTML attributes.
   *
   * Do not use `image.width` or `image.height` here because those
   * properties represent the current rendered CSS dimensions.
   */
  const declaredWidth = Number(image.getAttribute("width"));
  const declaredHeight = Number(image.getAttribute("height"));

  /*
   * Read the intrinsic dimensions of the loaded image resource.
   */
  const actualWidth = image.naturalWidth;
  const actualHeight = image.naturalHeight;

  /*
   * The declared dimensions and intrinsic dimensions must both be
   * valid before an aspect ratio comparison can be performed.
   */
  if (!Number.isFinite(declaredWidth) || !Number.isFinite(declaredHeight) || declaredWidth <= 0 || declaredHeight <= 0 || !Number.isFinite(actualWidth) || !Number.isFinite(actualHeight) || actualWidth <= 0 || actualHeight <= 0) {
    return;
  }
  const declaredRatio = declaredWidth / declaredHeight;
  const actualRatio = actualWidth / actualHeight;

  /*
   * Compare aspect ratios instead of absolute dimensions.
   *
   * The tolerance prevents insignificant floating-point differences
   * from being reported as image dimension mismatches.
   */
  const ratioDifference = Math.abs(declaredRatio - actualRatio);
  if (ratioDifference <= _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.IMAGE_RATIO_TOLERANCE) {
    return;
  }
  ;(0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("warn", {
    component: "validateImageAspectRatio",
    message: `Image at index ${index} has a different declared ` + "and intrinsic aspect ratio.",
    details: {
      index,
      image,
      declaredWidth,
      declaredHeight,
      declaredRatio,
      actualWidth,
      actualHeight,
      actualRatio,
      ratioDifference,
      tolerance: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.IMAGE_RATIO_TOLERANCE
    }
  });
}

/**
 * Resolves image elements contained inside Masonry items.
 *
 * @param {TMasonryItemLayout[]} items
 * Calculated Masonry item layouts.
 *
 * @returns {HTMLImageElement[]}
 * Image elements found inside the supplied Masonry items.
 */
function getMasonryImages(items) {
  /** @type {HTMLImageElement[]} */
  const images = [];
  for (const {
    element
  } of items) {
    const image = element.querySelector('img');
    if (image instanceof HTMLImageElement) {
      images.push(image);
    } else {
      (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("warn", {
        component: "getMasonryImages",
        message: "Masonry item does not contain an HTMLImageElement.",
        details: {
          image,
          searchedTag: "img",
          parent: element
        }
      });
    }
  }
  return images;
}

/**
 * Reveals a Masonry item after its image has loaded.
 *
 * The visual transition is handled by CSS. JavaScript only changes
 * the item's state by adding the `image-loaded` class.
 *
 * The item is checked again when the timer fires because it may have
 * been removed from the document after the timer was scheduled.
 *
 * @param {HTMLElement} item - Masonry item to reveal.
 * @param {number} [delay=0] - Delay before revealing the item, in milliseconds.
 * @returns {void}
 */
function revealMasonryItem(item, delay = 0) {
  // Validate the item before scheduling asynchronous work.
  if (!(item instanceof HTMLElement) || !item.isConnected) {
    return;
  }

  // Ignore invalid delays rather than passing them to setTimeout.
  if (!Number.isFinite(delay) || delay < 0) {
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("warn", {
      component: "revealMasonryItem",
      message: "Invalid reveal delay; using 0 milliseconds.",
      details: {
        delay
      }
    });
    delay = 0;
  }
  setTimeout(() => {
    // The item may have been removed while the timer was waiting.
    if (!item.isConnected) return;
    item.classList.add("image-loaded");
  }, delay);
}

/**
 * Handles a successfully loaded Masonry image.
 *
 * Image diagnostics and visual reveal are intentionally kept
 * together here because both actions must happen after the image
 * has successfully acquired its intrinsic dimensions.
 *
 * @param {HTMLImageElement} image
 * Loaded Masonry image.
 *
 * @param {number} index
 * Zero-based image index.
 *
 * @param {number} [delay=0] for revealing loaded images
 *
 * @returns {void}
 */
function handleMasonryImageLoaded(image, index, delay = 0) {
  validateImageAspectRatio(image, index);
  const parentElem = image.parentElement;
  if (!parentElem || !parentElem.classList.contains('gallery__item')) {
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
      component: "validateMasonryImages",
      message: "Could not find the Masonry item parent element.",
      details: {
        imgIndex: index,
        image,
        parent: parentElem
      }
    });
    return;
  }
  revealMasonryItem(parentElem, delay);
}

/**
 * Calculates the number of masonry columns that fit inside
 * the available container width.
 *
 * The function also returns the horizontal free space remaining
 * after fitting the calculated columns and their inter-column gaps.
 *
 * This function performs no DOM access and does not mutate anything.
 * Horizontal distribution of the remaining space is intentionally
 * handled by a separate stage.
 *
 * Layout invariant:
 *
 *     containerWidth >= itemWidth
 *
 * At least one complete masonry item must physically fit inside
 * the container. If this invariant is violated, the function throws
 * instead of producing a negative `freeWidth`.
 *
 * @param {number} containerWidth
 * Available masonry container width, in pixels.
 *
 * @param {number} itemWidth
 * Width of a single masonry item/column, in pixels.
 *
 * @param {number} gap
 * Horizontal gap between masonry columns, in pixels.
 *
 * @returns {TMasonryColumnCalculation}
 * Calculated column count and remaining horizontal space.
 *
 * @throws {TypeError}
 * If any argument is not a finite number.
 *
 * @throws {RangeError}
 * If `containerWidth` or `itemWidth` is not greater than zero,
 * if `gap` is negative, or if the item does not fit inside
 * the container.
 */
function getMasonryColumnsNumber(containerWidth, itemWidth, gap) {
  if (!Number.isFinite(containerWidth) || !Number.isFinite(itemWidth) || !Number.isFinite(gap)) {
    throw new TypeError('[getMasonryColumnsNumber]: all arguments must be finite numbers.');
  }
  if (containerWidth <= 0) {
    throw new RangeError('[getMasonryColumnsNumber]: containerWidth must be greater than zero.');
  }
  if (itemWidth <= 0) {
    throw new RangeError('[getMasonryColumnsNumber]: itemWidth must be greater than zero.');
  }
  if (gap < 0) {
    throw new RangeError('[getMasonryColumnsNumber]: gap must be greater than or equal to zero.');
  }

  /*
   * Layout invariant:
   *
   * At least one complete masonry item must fit inside
   * the available container width.
   *
   * Do not clamp the resulting freeWidth to zero.
   * A negative freeWidth indicates an invalid layout state
   * and should be reported explicitly.
   */
  if (containerWidth < itemWidth) {
    throw new RangeError('[getMasonryColumnsNumber]: itemWidth must not exceed ' + 'containerWidth.');
  }

  /*
   * N columns require:
   *
   * N * itemWidth + (N - 1) * gap <= containerWidth
   *
   * Therefore:
   *
   * N = floor(
   *   (containerWidth + gap) /
   *   (itemWidth + gap)
   * )
   *
   * Math.max(1, ...) guarantees that at least one column
   * is returned when the item itself fits inside the container.
   */
  const count = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));

  /*
   * Calculate the exact horizontal space occupied by
   * all columns and the gaps between them.
   *
   * There are N - 1 gaps for N columns.
   */
  const usedWidth = count * itemWidth + (count - 1) * gap;

  /*
   * Because containerWidth >= itemWidth and `count` was calculated
   * using the fitting formula, freeWidth cannot be negative.
   */
  const freeWidth = containerWidth - usedWidth;
  return {
    count,
    freeWidth
  };
}

/**
 * Creates the complete horizontal configuration of the masonry columns.
 *
 * This function transforms the narrow result of
 * `getMasonryColumnsNumber()` into the complete `TMasonryColumns`
 * model required by the item positioning stage.
 *
 * The remaining horizontal space is distributed equally between
 * the left and right sides of the masonry layout.
 *
 * This function performs no DOM access and does not mutate anything.
 *
 * @param {number} containerWidth
 * Available masonry container width, in pixels.
 *
 * @param {number} itemWidth
 * Common masonry item width, in pixels.
 *
 * @param {number} gap
 * Horizontal and vertical gap between masonry items, in pixels.
 *
 * @returns {TMasonryColumns}
 * Complete horizontal masonry column configuration.
 *
 * @throws {TypeError}
 * If any numeric argument is not finite.
 *
 * @throws {RangeError}
 * If the supplied dimensions violate the masonry layout invariants.
 */
function createMasonryColumns(containerWidth, itemWidth, gap) {
  const {
    count,
    freeWidth
  } = getMasonryColumnsNumber(containerWidth, itemWidth, gap);
  return {
    count,
    width: itemWidth,
    gap,
    leftOffset: freeWidth / 2
  };
}

/**
 * Resolves the common width of masonry items.
 *
 * Masonry columns are based on a single shared item width.
 * Therefore, every measured item must have the same positive width.
 *
 * This function performs no DOM access and does not mutate its input.
 *
 * @param {TMasonryItemMeasurement[]} items
 * Measured masonry item geometry.
 *
 * @returns {number}
 * Common masonry item width in pixels.
 *
 * @throws {TypeError}
 * If `items` is not an array.
 *
 * @throws {Error}
 * If `items` is empty or an item has invalid dimensions.
 *
 * @throws {RangeError}
 * If masonry items have different widths.
 */
function getMasonryItemWidth(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('[getMasonryItemWidth]: items must be an array.');
  }
  if (items.length === 0) {
    throw new Error('[getMasonryItemWidth]: items must not be empty.');
  }
  const itemWidth = items[0]?.width;
  if (!Number.isFinite(itemWidth) || itemWidth <= 0) {
    throw new Error('[getMasonryItemWidth]: first masonry item has an invalid width.');
  }
  for (const [index, item] of items.entries()) {
    if (!Number.isFinite(item.width) || item.width <= 0 || !Number.isFinite(item.height) || item.height <= 0) {
      throw new Error(`[getMasonryItemWidth]: masonry item at index ${index} ` + 'must have valid positive width and height.');
    }
    if (item.width !== itemWidth) {
      throw new RangeError(`[getMasonryItemWidth]: all masonry items must have the same width. ` + `Expected ${itemWidth}px, but item at index ${index} ` + `has width ${item.width}px.`);
    }
  }
  return itemWidth;
}

/**
 * Calculates the position of every masonry item.
 *
 * Items are distributed using the shortest-column algorithm.
 *
 * The function assumes that its inputs have already been validated
 * by the masonry calculation pipeline.
 *
 * This function performs no DOM access and does not mutate the DOM.
 *
 * @param {TMasonryItemMeasurement[]} items
 * Validated masonry item measurements.
 *
 * @param {TMasonryColumns} columns
 * Validated masonry column configuration.
 *
 * @returns {TMasonryItemLayout[]}
 * Calculated layout state for every masonry item.
 */
function calculateMasonryItemLayouts(items, columns) {
  const columnHeights = new Array(columns.count).fill(0);
  return items.map(item => {
    let columnIndex = 0;
    for (let index = 1; index < columnHeights.length; index += 1) {
      if (columnHeights[index] < columnHeights[columnIndex]) {
        columnIndex = index;
      }
    }
    const left = columns.leftOffset + columnIndex * (columns.width + columns.gap);
    const top = columnHeights[columnIndex];
    columnHeights[columnIndex] = top + item.height + columns.gap;
    return {
      element: item.element,
      width: item.width,
      height: item.height,
      left,
      top
    };
  });
}

/**
 * Calculates the complete masonry layout from measured item geometry.
 *
 * The function determines the masonry column configuration and calculates
 * the `left` and `top` position of every valid masonry item.
 *
 * Items are distributed using the shortest-column algorithm.
 *
 * This function performs no DOM access and does not mutate the DOM.
 *
 * @param {number} containerWidth
 * Available width of the masonry container, in pixels.
 *
 * @param {TMasonryItemMeasurement[]} items
 * Measured masonry item geometry.
 *
 * @param {number} gap
 * Horizontal and vertical gap between masonry items, in pixels.
 *
 * @returns {TMasonryLayout}
 * Complete calculated masonry layout.
 *
 * @throws {Error}
 * When any input is invalid or when masonry items have inconsistent widths.
 */
function calculateMasonryLayout(containerWidth, items, gap) {
  validateMasonryLayoutInput(containerWidth, items, gap);
  const itemWidth = getMasonryItemWidth(items);
  const columns = createMasonryColumns(containerWidth, itemWidth, gap);
  const layoutItems = calculateMasonryItemLayouts(items, columns);
  return {
    containerWidth,
    columns,
    items: layoutItems
  };
}

/**
 * Applies a calculated masonry layout to the DOM.
 *
 * This function is the only masonry pipeline stage that mutates
 * the DOM. It applies the calculated position of every masonry item.
 *
 * The function does not calculate layout geometry and does not modify
 * item dimensions or visual properties unrelated to positioning.
 *
 * @param {TMasonryLayout} layout
 * Calculated masonry layout to apply.
 *
 * @returns {void}
 */
function applyMasonryLayout(layout) {
  for (const item of layout.items) {
    const {
      element,
      left,
      top
    } = item;
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }
}

/**
 * Measures the current layout dimensions of masonry items.
 *
 * The function assumes that the input collection has already been
 * resolved from the DOM by `getElements()`.
 *
 * Each connected element is measured using `offsetWidth` and
 * `offsetHeight`. Elements with invalid DOM state or invalid dimensions
 * are skipped and reported through the initialization error logger.
 *
 * The function does not:
 * - resolve DOM selectors;
 * - wait for image loading;
 * - calculate masonry columns;
 * - calculate item positions;
 * - mutate the DOM.
 *
 * @param {HTMLElement[]} items
 * Masonry item elements resolved from the DOM.
 *
 * @returns {TMasonryItemMeasurement[]}
 * Measured dimensions of all valid masonry items.
 *
 * @throws {TypeError}
 * If `items` is not an array.
 *
 * @throws {Error}
 * If the input array is empty or no valid masonry items remain
 * after measurement.
 */
function measureMasonryItems(items) {
  /*
   * The function receives the result of getElements(), therefore
   * the collection itself must be a valid array before processing.
   */
  if (!Array.isArray(items)) {
    throw new TypeError('[measureMasonryItems]: items must be an array.');
  }
  if (items.length === 0) {
    throw new RangeError('[measureMasonryItems]: items must not be empty.');
  }

  /** @type {TMasonryItemMeasurement[]} */
  const measurements = [];
  for (const [index, element] of items.entries()) {
    /*
     * A disconnected element no longer participates in the current
     * document layout and therefore cannot provide a meaningful
     * masonry measurement.
     */
    if (!element.isConnected) {
      (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
        component: 'measureMasonryItems',
        message: 'Masonry item is not connected to the DOM and ' + 'will be skipped.',
        details: {
          element,
          index
        }
      });
      continue;
    }
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    /*
     * A masonry item must have positive layout dimensions.
     *
     * Zero dimensions can occur when an element is hidden,
     * detached from the rendered layout, or otherwise prevented
     * from participating in normal layout calculation.
     */
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
        component: 'measureMasonryItems',
        message: 'Masonry item has invalid layout dimensions ' + 'and will be skipped.',
        details: {
          element,
          index,
          width,
          height
        }
      });
      continue;
    }
    measurements.push({
      element,
      width,
      height
    });
  }

  /*
   * An empty measurement result means that masonry cannot be
   * calculated. At this point the problem is no longer related
   * to an individual item, but to the complete input collection.
   */
  if (measurements.length === 0) {
    throw new Error('[measureMasonryItems]: no valid masonry items remain after measurement.');
  }
  return measurements;
}

/**
 * Creates and applies the current Masonry layout.
 *
 * This function orchestrates one complete synchronous Masonry
 * layout pass:
 *
 * 1. resolves Masonry items inside the container;
 * 2. measures the current item dimensions;
 * 3. reads the current container width;
 * 4. calculates the complete Masonry layout;
 * 5. applies the calculated positions to the DOM.
 *
 * The function delegates calculation to the pure Masonry
 * calculation pipeline and DOM mutation to `applyMasonryLayout()`.
 *
 * This function does not:
 * - wait for image loading;
 * - validate image intrinsic dimensions;
 * - observe container changes;
 * - manage observers;
 * - calculate columns directly;
 * - calculate item positions directly;
 * - animate Masonry items.
 *
 * @param {HTMLElement} container
 * Masonry container element.
 *
 * @param {TMasonryConfig} config
 * Normalized Masonry configuration.
 *
 * @returns {TMasonryLayout}
 * Snapshot of the Masonry layout that was calculated and applied.
 *
 * @throws {Error}
 * If Masonry items cannot be measured, the container has an invalid
 * width, or the Masonry layout calculation fails.
 */
function createMasonry(container, config) {
  const {
    itemSelector,
    gap = 0
  } = config;

  /** @type {HTMLElement[]} */
  const items = getElements(itemSelector, container);
  const measurements = measureMasonryItems(items);
  const containerWidth = container.offsetWidth;
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) {
    throw new RangeError(`[createMasonry]: masonry container must have a positive finite width: ${containerWidth}`);
  }
  const layout = calculateMasonryLayout(containerWidth, measurements, gap);
  applyMasonryLayout(layout);
  return layout;
}

/**
 * Registers Masonry images for asynchronous validation and reveal.
 *
 * Each image is registered at most once during the lifecycle of the
 * current Masonry instance.
 *
 * Already completed images are processed immediately. Images that
 * have not completed loading yet are processed through a one-time
 * `load` event listener.
 *
 * @param {HTMLImageElement[]} images
 * Masonry image elements to process.
 *
 * @param {WeakSet<HTMLImageElement>} validatedImages
 * Images already registered during the current Masonry lifecycle.
 *
 * @returns {void}
 */
function validateMasonryImages(images, validatedImages) {
  if (!Array.isArray(images)) {
    throw new TypeError('[validateMasonryImages]: images must be an array.');
  }
  for (const [index, image] of images.entries()) {
    /*
     * Prevent duplicate registration during subsequent Masonry
     * recalculations triggered by ResizeObserver.
     */
    if (validatedImages.has(image)) {
      continue;
    }
    validatedImages.add(image);

    /*
     * `complete` means that the browser has finished processing
     * the image request. It does not guarantee successful loading.
     *
     * `naturalWidth > 0` confirms that a valid intrinsic image
     * resource is available.
     */
    if (image.complete) {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        handleMasonryImageLoaded(image, index, _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.MASONRY_REVEAL_DELAY);
      } else {
        // `complete` with zero intrinsic dimensions means a failed load
        // that finished before registration (e.g. cached error response).
        (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("warn", {
          component: "validateMasonryImages",
          message: "Masonry image completed with no valid resource.",
          details: {
            index,
            src: image.currentSrc || image.src
          }
        });
      }
      continue;
    }

    /*
     * The image has not completed loading yet.
     *
     * The `load` event is the correct event for successful image
     * loading. The listener is automatically removed after firing.
     */
    image.addEventListener("load", () => {
      handleMasonryImageLoaded(image, index, _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.MASONRY_REVEAL_DELAY);
    }, {
      once: true
    });
    image.addEventListener('error', () => {
      (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
        component: "validateMasonryImages",
        message: "Masonry image failed to load.",
        details: {
          index,
          image
        }
      });
    }, {
      once: true
    });
  }
}

/**
 * Performs the initial Masonry layout, validates its images,
 * and starts observing container width changes.
 *
 * The container is already eligible for initialization because
 * visibility detection is handled by the shared observer in `index.js`.
 *
 * @param {TMasonryLifecycleState} state
 * @returns {void}
 */
function initializeMasonry(state) {
  // Calculate and apply the initial layout.
  const layout = createMasonry(state.container, state.config);
  const images = getMasonryImages(layout.items);

  // Register image load/error handlers only once per image.
  validateMasonryImages(images, state.validatedImages);

  /**
   * !Mark initialization as complete before observing the container.
   * This prevents resize handling from running as if Masonry were
   * still uninitialized.
   */
  state.isInitialized = true;

  // ResizeObserver is retained for subsequent container width changes.
  state.resizeObserver?.observe(state.container);
}

/**
 * Destroys the Masonry lifecycle and releases its resources.
 *
 * The shared IntersectionObserver is owned by the caller and is not
 * part of the Masonry lifecycle.
 *
 * @param {TMasonryLifecycleState} state
 * @returns {void}
 */
function destroyMasonry(state) {
  if (state.isDestroyed) return;
  state.isDestroyed = true;
  state.isInitialized = false;

  // Stop width observation and cancel any pending recalculation.
  state.resizeObserver?.disconnect();
  state.resizeScheduler.cancel();
}

/**
 * Handles Masonry container width changes.
 *
 * @param {ResizeObserverEntry[]} entries
 * @param {TMasonryLifecycleState} state
 * @returns {void}
 */
function handleMasonryResizeObservation(entries, state) {
  if (state.isDestroyed || !state.isInitialized) return;
  const entry = entries.find(item => item.target === state.container);
  if (!entry) return;
  const currentWidth = entry.contentRect.width;
  if (state.lastObservedWidth === null) {
    state.lastObservedWidth = currentWidth;
    return;
  }
  if (Math.abs(currentWidth - state.lastObservedWidth) < 0.5) {
    return;
  }
  state.lastObservedWidth = currentWidth;
  state.resizeScheduler.schedule();
}

/**
 * Initializes Masonry immediately and registers width-based
 * resize handling.
 *
 * Lazy activation is intentionally handled by the shared
 * IntersectionObserver in `index.js`.
 *
 * @param {HTMLElement} container - The Masonry gallery container.
 * @param {TMasonryConfig} config - Masonry layout configuration.
 * @returns {{ destroy: () => void }} Lifecycle cleanup handle.
 * @throws {TypeError} If the container is not a valid HTMLElement.
 */
function initMasonry(container, config) {
  if (!isHTMLElement(container)) {
    throw new TypeError("[initMasonry]: container must be an HTMLElement.");
  }
  if (!container.isConnected) {
    throw new Error("[initMasonry]: container must be connected to the DOM.");
  }

  /** @type {TMasonryLifecycleState} */
  const state = {
    container,
    config,
    isInitialized: false,
    isDestroyed: false,
    lastObservedWidth: null,
    validatedImages: new WeakSet(),
    resizeScheduler: createMasonryResizeScheduler(container, config, 250),
    resizeObserver: null
  };
  try {
    // Observe only width changes; visibility is handled elsewhere.
    state.resizeObserver = new ResizeObserver(entries => {
      handleMasonryResizeObservation(entries, state);
    });

    // Perform the first layout synchronously within this call.
    initializeMasonry(state);
  } catch (error) {
    /*
     * Initialization may fail after ResizeObserver has been created.
     * Release resources before propagating the error to the caller.
     */
    state.resizeObserver?.disconnect();
    state.resizeScheduler.cancel();
    throw error;
  }
  return {
    destroy: () => destroyMasonry(state)
  };
}

///////////////////////////////////////

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
  const missingKeys = (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.getInvalidKeys)(params, requiredKeys, {
    invalidValues: ["", undefined, null, 0]
  });
  if (missingKeys.length) {
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
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
      (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
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
 * Redirects the browser to the clicked language version of the current page.
 *
 * The language segment of the current pathname is replaced with the
 * clicked language code.
 *
 * The language code is expected to be the first path segment:
 * `/uk/`, `/uk/gates-installation-repair`, and so on.
 *
 * Query parameters and the URL hash are preserved because only the pathname
 * is modified. `location.replace()` avoids adding the previous language
 * version as a separate history entry.
 *
 * `location.replace()` is used intentionally: a language switch
 * navigates to a parallel version of the page, not to a new step
 * of the browsing session. The previous language version is kept
 * out of the session history, so the browser Back button does not
 * silently revert the user's language choice.
 *
 * @param {string} langActive - Currently active language code.
 * @param {string} clickedLang - Language code selected by the user.
 * @returns {void}
 */
function redirectToLanguage(langActive, clickedLang) {
  const currentUrl = new URL(window.location.href);
  const segments = currentUrl.pathname.split("/");

  // The first segment after the leading slash must match the active language.
  if (segments[1] !== langActive) {
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("warn", {
      component: "redirectToLanguage",
      message: "The active language does not match the first URL path segment.",
      details: {
        pathname: currentUrl.pathname,
        expectedLanguage: langActive,
        actualLanguage: segments[1]
      }
    });
    return;
  }

  // Validate the target language before modifying the URL.
  // Language codes must be a single non-empty path segment.
  if (typeof clickedLang !== "string" || clickedLang.length === 0 || clickedLang.includes("/")) {
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("warn", {
      component: "redirectToLanguage",
      message: "Invalid target language code.",
      details: {
        clickedLang
      }
    });
    return;
  }

  // Avoid reloading the page when the selected language is already active.
  if (langActive === clickedLang) return;

  // Replace only the language segment; preserve the remaining path.
  segments[1] = clickedLang;
  currentUrl.pathname = segments.join("/");

  // The query string and hash remain unchanged.
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
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
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

///////////////////////////////////////////////

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
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
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
  const missingKeys = (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.getInvalidKeys)(params, requiredKeys, {
    invalidValues: ["", undefined, null]
  });
  if (missingKeys.length) {
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
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
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
      component: "initLangSwitcher",
      message: `Element with selector: ${langSwitcherCurrent}${langActiveSelector} has no data-${dataSetKey} value...`
    });
    return;
  }
  if (!Array.isArray(langOptionArr) || !langOptionArr.length) {
    (0,_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
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
 * @typedef {{
 *   close: Function,
 *   prev: Function,
 *   next: Function
 * }} TCreateModalHandlersCallbacks
 */

/**
 * Creates modal event handlers
 * @param {Object} dom - Modal DOM elements
 * @param {ModalState} state - Modal state reference
 * @param {TCreateModalHandlersCallbacks} callbacks - Action callbacks
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
 * @description
 * Entry point. Initializes immediate UI components,
 * lazily initializes gallery features through one shared
 * IntersectionObserver, and starts GSAP animations on first scroll.
 */

/**
 *! DOM type aliases used by this module.
 *
 * @typedef {import("./types/dom.types.js").TActivateNavlinkParams} TActivateNavlinkParams
 *
 */






// ============================================
// DOM READY
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const pageType = document.body.dataset.type || "";
  const isIn = (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_4__.isKeyOf)(_partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkAnchors, pageType);

  /** @type {TActivateNavlinkParams} */
  const navLinkParams = {
    navLinkSelector: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.SELECTORS.navLinkSelector,
    pageType,
    activeClass: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkClassNameActive,
    anchorLink: isIn ? _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkAnchors[pageType] : "#"
  };

  /** @type {TActivateNavlinkParams} */
  const navLinkParamsHexagon = {
    navLinkSelector: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.SELECTORS.navHexagonSelector,
    pageType,
    activeClass: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkClassNameActive,
    anchorLink: isIn ? _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.linkAnchors[pageType] : "#"
  };
  try {
    // Navigation & Language (non-GSAP, immediate)
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.activateNavLink)(navLinkParams);
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.activateNavLink)(navLinkParamsHexagon);
    //initializing language switcher...
    (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.initLangSwitcher)(_partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.langSwitchData);

    // Locate the gallery without requiring it to exist on every page.
    const galleryContainer = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getDOMElement)(_partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.SELECTORS.gallerySelector, document, false);
    const hasGallery = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.isHTMLElement)(galleryContainer);

    /**
     *! One IntersectionObserver handles both gallery features.
     * A positive vertical rootMargin allows initialization shortly
     * before the gallery enters the visible viewport.
     */
    if (hasGallery) {
      (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.observeIntersection)(galleryContainer, {
        rootMargin: _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.MASONRY_INITIALIZE_MARGIN,
        once: true,
        //first Intersection

        onEnter: () => {
          // Masonry performs its initial layout immediately.
          try {
            (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.initMasonry)(galleryContainer, _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.MASONRY_CONFIG);
          } catch (error) {
            ;(0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_4__.initLog)("error", {
              component: "initMasonry",
              message: "Failed to initialize Masonry.",
              details: error
            });
          }

          /**
           *! Modal initialization is independent of Masonry layout.
           * Do not await it here: its Promise must not block the
           * observer callback or other initialization work.
           */
          ;(0,_modulesPack_gallery_thumbs_index_js__WEBPACK_IMPORTED_MODULE_2__.initThumbs)(galleryContainer, _partials_initialSelectors_js__WEBPACK_IMPORTED_MODULE_1__.galleryThumbsFolderName).catch(error => {
            ;(0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_4__.initLog)("error", {
              component: "initThumbs",
              message: "Failed to initThumbs...",
              details: error
            });
          });
        }
      });
    }

    /**
     * !GSAP initialization remains independent of the gallery observer.
     * The first scroll starts animations and automatically removes
     * this listener because the `once` option is enabled.
     */

    const lazyInitAnimations = () => {
      ;(0,_partials_animations_js__WEBPACK_IMPORTED_MODULE_3__.initAnimations)().catch(error => {
        ;(0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_4__.initLog)("error", {
          component: "initAnimations",
          message: "Failed to initialize GSAP animations.",
          details: error
        });
      });
    };

    //attaching the listener to the first scroll.
    //{ passive: true } is critical - it optimizes scrolling for the browser
    //If true, the listener will be automatically removed after being called.
    window.addEventListener("scroll", lazyInitAnimations, {
      passive: true,
      once: true
    });
  } catch (error) {
    ;(0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_4__.initLog)("error", {
      component: "DOMContentLoaded",
      message: "Page initialization failed.",
      details: error
    });
  }
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
/* harmony import */ var _helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../helpers/funcs.js */ "./src/js/helpers/funcs.js");






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
 * @param {string|Element} innGallery - CSS selector for the gallery container
 * @param {string} [thumbsFolder="thumbs"] - Subfolder containing thumbnail images
 * @returns {Promise<void>}
 * @throws {Error} If gallery container not found or no valid media elements
 *
 * @example
 * await initThumbs("#gallery-work", "thumbs");
 */
async function initThumbs(innGallery, thumbsFolder = THUMBS_FOLDER) {
  const gallery = typeof innGallery === "string" ? (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.getDOMElement)(innGallery, document) : innGallery;

  //narrowing type Element to HTMLElement...
  if (!gallery || !(0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.isHTMLElement)(gallery)) {
    throw new Error(`[initThumbs]: Gallery "${innGallery}" not found in DOM or not HTMLElement...`);
  }

  // Collect all valid media elements (pictures and standalone images)
  const mediaItems = collectMediaItems(gallery);
  if (mediaItems.length === 0) {
    (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.initLog)("warn", {
      component: "initThumbs",
      message: "the mediaItems array is empty",
      details: {
        gallery
      }
    });
    return;
  }
  console.log("[initThumbs] mediaItems: ", mediaItems);

  // Initialize modal system with media data
  //const modal = createModalController(mediaItems, { thumbsFolder });

  // Delegated click handler on gallery container
  /*	gallery.addEventListener("click", (event) => {
  		const mediaItem = event.target.closest("picture, img");
  
  		// Ignore if click wasn't on a media element or if img is inside picture
  		if (!mediaItem || (mediaItem.tagName === "IMG" && mediaItem.closest("picture"))) {
  			return;
  		}
  
  		const index = mediaItems.indexOf(mediaItem);
  		if (index !== -1) {
  			modal.open(index);
  		}
  	});*/
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
  /*** @type {HTMLElement[]}*/
  const pictures = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.getElements)("picture", gallery, true, false, false);

  // Get all images that are NOT inside a picture element
  /*** @type {HTMLElement[]}*/
  const allImages = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_1__.getElements)("img", gallery, true, false, false);
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
/* harmony export */   automationParallaxTimelineParams: function() { return /* binding */ automationParallaxTimelineParams; },
/* harmony export */   burgerNavTimelineParams: function() { return /* binding */ burgerNavTimelineParams; },
/* harmony export */   fadeInLeftTimelineParams: function() { return /* binding */ fadeInLeftTimelineParams; },
/* harmony export */   fadeInRightTimelineParams: function() { return /* binding */ fadeInRightTimelineParams; },
/* harmony export */   fadeInUpTimelineParams: function() { return /* binding */ fadeInUpTimelineParams; },
/* harmony export */   scaleInTimelineParams: function() { return /* binding */ scaleInTimelineParams; },
/* harmony export */   scrolledNavTimelineParams: function() { return /* binding */ scrolledNavTimelineParams; },
/* harmony export */   servicesParallaxTimelineParams: function() { return /* binding */ servicesParallaxTimelineParams; }
/* harmony export */ });
/* harmony import */ var _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./initialSelectors.js */ "./src/js/partials/initialSelectors.js");


/**
 * src/js/partials/animationParams.js
 *
 * @file animationParams.js
 * @description GSAP ANIMATION params
 */


/**
 *! GSAP ANIMATIONS type aliases used by this module.
 *
 * @typedef {import("../types/animations.types.js").TGsap} TGsap
 * @typedef {import("../types/animations.types.js").TGsapVars} TGsapVars
 * @typedef {import("../types/animations.types.js").TTween} TTween
 * @typedef {import("../types/animations.types.js").TTimeline} TTimeline
 * @typedef {import("../types/animations.types.js").TAnimation} TAnimation
 * @typedef {import("../types/animations.types.js").TAnimationKey} TAnimationKey
 * @typedef {import("../types/animations.types.js").TTargetMode} TTargetMode
 * @typedef {import("../types/animations.types.js").TScrollTriggerParams} TScrollTriggerParams
 * @typedef {import("../types/animations.types.js").TTimelineOperationType} TTimelineOperationType
 * @typedef {import("../types/animations.types.js").TTimelineStep} TTimelineStep
 * @typedef {import("../types/animations.types.js").TTimelineStepVars} TTimelineStepVars
 * @typedef {import("../types/animations.types.js").TBaseTimelineParams} TBaseTimelineParams
 * @typedef {import("../types/animations.types.js").TSingleTimelineParams} TSingleTimelineParams
 * @typedef {import("../types/animations.types.js").TGroupTimelineParams} TGroupTimelineParams
 * @typedef {import("../types/animations.types.js").TEachTimelineParams} TEachTimelineParams
 * @typedef {import("../types/animations.types.js").TTimelineParams} TTimelineParams
 *
 */

///////// ANIMATION CONFIGURATION //////////

const defaultParallaxScrollTrigger = {
  start: "top bottom",
  end: "bottom top",
  scrub: 1.5,
  invalidateOnRefresh: true
};

/**
 * Configuration for the Burger navigation Timeline.
 *
 * The Timeline is created in its initial paused state because it is
 * controlled interactively by Burger event handlers.
 *
 * `root` identifies the navigation Element that provides the DOM
 * search context for the Timeline steps.
 *
 * @type {TSingleTimelineParams}
 */
const burgerNavTimelineParams = {
  targetMode: "single",
  root: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.navMenuFixed,
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
 * Configuration for the Automation section parallax Timeline.
 *
 * The section Element is used as the Timeline DOM search root,
 * while the same selector is explicitly used as the ScrollTrigger
 * trigger.
 *
 * These two settings intentionally remain independent even when
 * they reference the same Element.
 *
 * @type {TSingleTimelineParams}
 */
const automationParallaxTimelineParams = {
  targetMode: "single",
  root: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.automationParallax,
  scrollTrigger: {
    trigger: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.automationParallax,
    ...defaultParallaxScrollTrigger
  },
  steps: [{
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.automationParallaxBg,
    type: "fromTo",
    fromVars: {
      yPercent: 10
    },
    vars: {
      yPercent: -10,
      ease: "none"
    }
  }]
};

/**
 * Configuration for the Services section parallax Timeline.
 *
 * The section Element is used as the Timeline DOM search root,
 * while the same selector is explicitly used as the ScrollTrigger
 * trigger.
 *
 * These two settings intentionally remain independent even when
 * they reference the same Element.
 *
 * @type {TSingleTimelineParams}
 */
const servicesParallaxTimelineParams = {
  targetMode: "single",
  root: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.servicesParallax,
  scrollTrigger: {
    trigger: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.servicesParallax,
    ...defaultParallaxScrollTrigger
  },
  steps: [{
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.servicesParallaxBg,
    type: "fromTo",
    fromVars: {
      yPercent: 10
    },
    vars: {
      yPercent: -10,
      ease: "none"
    }
  }]
};

/**
 * Configuration for independent fade-in-from-left Timelines.
 *
 * One Timeline is created for every Element matching `scope`.
 * Each scope Element becomes:
 *
 * - the DOM search root for its Timeline steps;
 * - the Timeline cache identity;
 * - the default ScrollTrigger trigger when the trigger selector
 *   resolves to the scope selector.
 *
 * @type {TEachTimelineParams}
 */
const fadeInLeftTimelineParams = {
  targetMode: "each",
  scope: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInLeft,
  scrollTrigger: {
    //will be used for each scope Element
    trigger: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInLeft,
    start: "top 80%",
    toggleActions: "play none none reverse",
    preventOverlaps: true
  },
  steps: [{
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInLeft,
    type: "to",
    vars: {
      opacity: 1,
      duration: 0.8,
      delay: 0.2
    }
  }, {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInLeft,
    type: "from",
    vars: {
      x: -60,
      y: 40,
      duration: 1,
      ease: "circ.out"
    },
    position: "<"
  }]
};

/**
 * Configuration for independent fade-in-from-right Timelines.
 *
 * One Timeline is created for every Element matching `scope`.
 * Each scope Element becomes:
 *
 * - the DOM search root for its Timeline steps;
 * - the Timeline cache identity;
 * - the default ScrollTrigger trigger when the trigger selector
 *   resolves to the scope selector.
 *
 * @type {TEachTimelineParams}
 */
const fadeInRightTimelineParams = {
  targetMode: "each",
  scope: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInRight,
  scrollTrigger: {
    //will be used for each scope Element
    trigger: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInRight,
    start: "top 80%",
    toggleActions: "play none none reverse",
    preventOverlaps: true
  },
  steps: [{
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInRight,
    type: "to",
    vars: {
      opacity: 1,
      duration: 0.8,
      delay: 0.2
    }
  }, {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInRight,
    type: "from",
    vars: {
      x: 60,
      y: 40,
      duration: 1,
      ease: "circ.out"
    },
    position: "<"
  }]
};

/**
 * Configuration for independent scale-in Timelines.
 *
 * One Timeline is created for every Element matching `scope`.
 * Each scope Element becomes:
 *
 * - the DOM search root for its Timeline steps;
 * - the Timeline cache identity;
 * - the default ScrollTrigger trigger when the trigger selector
 *   resolves to the scope selector.
 *
 * @type {TEachTimelineParams}
 */
const scaleInTimelineParams = {
  targetMode: "each",
  scope: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.scaleIn,
  scrollTrigger: {
    //will be used for each scope Element
    trigger: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.scaleIn,
    start: "top 80%",
    toggleActions: "play none none reverse",
    preventOverlaps: true
  },
  steps: [{
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.scaleIn,
    type: "to",
    vars: {
      opacity: 1,
      duration: 0.8
    }
  }, {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.scaleIn,
    type: "from",
    vars: {
      scale: 0.7,
      duration: 1.2,
      ease: "back.out(1)"
    },
    position: "<"
  }]
};

/**
 * Configuration for independent fade-in-up Timelines.
 *
 * One Timeline is created for every Element matching `scope`.
 * Each scope Element becomes:
 *
 * - the DOM search root for its Timeline steps;
 * - the Timeline cache identity;
 * - the default ScrollTrigger trigger when the trigger selector
 *   resolves to the scope selector.
 *
 * @type {TEachTimelineParams}
 */
const fadeInUpTimelineParams = {
  targetMode: "each",
  scope: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInUp,
  scrollTrigger: {
    //will be used for each scope Element
    trigger: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInUp,
    start: "top 80%",
    toggleActions: "play none none reverse",
    preventOverlaps: true
  },
  steps: [{
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInUp,
    type: "to",
    vars: {
      opacity: 1,
      duration: 0.8,
      delay: 0.2
    }
  }, {
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.fadeInUp,
    type: "from",
    vars: {
      y: 40,
      duration: 1,
      ease: "circ.out"
    },
    position: "<"
  }]
};

/**
 * Configuration for the navigation panel show-on-scroll Timeline.
 *
 * The Timeline is triggered when the Benefits section reaches 5% from
 * the top of the viewport and plays the navigation panel entrance
 * animation. The animation is reversed when the ScrollTrigger leaves
 * the active range.
 *
 * `root` identifies the navigation panel Element used as the Timeline
 * DOM search root and animation cache identity.
 *
 * The ScrollTrigger trigger is intentionally independent from `root`:
 * the navigation panel is animated, while the Benefits section controls
 * when the Timeline is activated.
 *
 * @type {TSingleTimelineParams}
 */
const scrolledNavTimelineParams = {
  targetMode: "single",
  root: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.scrolledNav,
  scrollTrigger: {
    trigger: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.benefitsSection,
    start: "top 5%",
    toggleActions: "play none none reverse",
    preventOverlaps: true
  },
  steps: [{
    target: _initialSelectors_js__WEBPACK_IMPORTED_MODULE_0__.SELECTORS.scrolledNav,
    type: "to",
    vars: {
      top: -10,
      duration: 0.7,
      ease: "back.out(1.5)",
      delay: 0.5
    }
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






//****** TYPE DEFINITIONS *******//

/**
 *! DOM type aliases used by this module.
 *
 * @typedef {import("../types/dom.types.js").TBurgerElements} TBurgerElements
 * @typedef {import("../types/dom.types.js").TDOMSelectorConfig} TDOMSelectorConfig
 * @typedef {import("../types/dom.types.js").TNavMenuSelector} TNavMenuSelector
 * @typedef {import("../types/dom.types.js").TBurgerHandlersData} TBurgerHandlersData
 *
 */

/**
 *! GSAP ANIMATIONS type aliases used by this module.
 *
 * @typedef {import("../types/animations.types.js").TPageName} TPageName
 * @typedef {import("../types/animations.types.js").TLinkAnchors} TLinkAnchors
 * @typedef {import("../types/animations.types.js").TPageAnimation} TPageAnimation
 * @typedef {import("../types/animations.types.js").TPageAnimations} TPageAnimations
 * @typedef {import("../types/animations.types.js").TGsap} TGsap
 * @typedef {import("../types/animations.types.js").TGsapVars} TGsapVars
 * @typedef {import("../types/animations.types.js").TTween} TTween
 * @typedef {import("../types/animations.types.js").TTimeline} TTimeline
 * @typedef {import("../types/animations.types.js").TAnimation} TAnimation
 * @typedef {import("../types/animations.types.js").TAnimationKey} TAnimationKey
 * @typedef {import("../types/animations.types.js").TTargetMode} TTargetMode
 * @typedef {import("../types/animations.types.js").TScrollTriggerParams} TScrollTriggerParams
 * @typedef {import("../types/animations.types.js").TTimelineOperationType} TTimelineOperationType
 * @typedef {import("../types/animations.types.js").TTimelineStep} TTimelineStep
 * @typedef {import("../types/animations.types.js").TTimelineStepVars} TTimelineStepVars
 * @typedef {import("../types/animations.types.js").TBaseTimelineParams} TBaseTimelineParams
 * @typedef {import("../types/animations.types.js").TSingleTimelineParams} TSingleTimelineParams
 * @typedef {import("../types/animations.types.js").TGroupTimelineParams} TGroupTimelineParams
 * @typedef {import("../types/animations.types.js").TEachTimelineParams} TEachTimelineParams
 * @typedef {import("../types/animations.types.js").TTimelineParams} TTimelineParams
 *
 */

/**
 * ! MASONRY type aliases used by this module.
 *
 * @typedef {import("../types/masonry.types.js").TMasonryConfig} TMasonryConfig
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

/// TIMELINE BUILDERS ///

/**
 * Validates the steps of a Timeline configuration.
 *
 * A Timeline must contain at least one step before it can be built.
 *
 * @param {TTimelineStep[]} steps
 * Timeline steps to validate.
 *
 * @param {string} [builderName="Animation Builder"]
 * Name of the builder used to identify the error source.
 *
 * @returns {void}
 *
 * @throws {TypeError}
 * When `steps` is not an Array.
 *
 * @throws {Error}
 * When `steps` is an empty Array.
 */
function validateTimelineSteps(steps, builderName = "Animation Builder") {
  if (!Array.isArray(steps)) {
    console.error("steps is not an Array", steps);
    throw new TypeError(`[${builderName}]: steps must be an Array.`);
  }
  if (!steps.length) {
    console.error("steps is an empty Array", steps);
    throw new Error(`[${builderName}]: steps cannot be empty.`);
  }
}

/**
 * Resolves the unique DOM root Element of a single Timeline.
 *
 * The root defines the DOM scope used to resolve all step targets.
 * It is independent from the Timeline's ScrollTrigger configuration.
 *
 * A single Timeline requires exactly one root Element.
 *
 * @param {string} rootSelector
 * CSS selector identifying the Timeline root.
 *
 * @returns {Element}
 * The resolved root Element.
 *
 * @throws {Error}
 * When no Element matches `rootSelector`.
 *
 * @throws {Error}
 * When multiple Elements match `rootSelector`.
 */
function resolveSingleTimelineRoot(rootSelector) {
  const roots = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getElements)(rootSelector, document, true, false);
  if (!roots.length) {
    throw new Error(`[resolveSingleTimelineRoot]: root selector ` + `"${rootSelector}" does not exist in DOM.`);
  }
  if (roots.length > 1) {
    throw new Error(`[resolveSingleTimelineRoot]: root selector ` + `"${rootSelector}" has multiple Elements in DOM, ` + `but exactly one is required.`);
  }
  return roots[0];
}

/**
 * Normalizes the GSAP vars of a Timeline step.
 *
 * The declarative Timeline step configuration allows `vars` and
 * `fromVars` to be optional. This function converts them into a
 * stable structure where both properties are always present.
 *
 * `vars` is used as:
 *
 * - the target vars for `set()`;
 * - the starting vars for `from()`;
 * - the destination vars for `to()`;
 * - the destination vars for `fromTo()`.
 *
 * `fromVars` is used only by and with `fromTo()`.
 *
 * A `fromVars` object requires `vars` because `fromTo()` needs
 * both an initial and a destination state.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @returns {TTimelineStepVars}
 * Normalized GSAP vars for the Timeline operation.
 *
 * @throws {Error}
 * When `fromVars` is provided without `vars`.
 *
 * @throws {Error}
 * When `vars` is empty.
 *
 * @example
 * // Normalize vars for a regular Timeline operation.
 * const stepVars = normalizeStepVars({
 *   target: ".title",
 *   type: "from",
 *   vars: {
 *     opacity: 0,
 *     y: 40,
 *   },
 * });
 *
 * @example
 * // Normalize both initial and destination vars for `fromTo()`.
 * const stepVars = normalizeStepVars({
 *   target: ".title",
 *   type: "fromTo",
 *   fromVars: {
 *     opacity: 0,
 *   },
 *   vars: {
 *     opacity: 1,
 *   },
 * });
 */
function normalizeStepVars(step) {
  if (step.fromVars && !step.vars) {
    throw new Error(`[normalizeStepVars]: step.vars is required when ` + `step.fromVars is provided. ` + `Target: "${step.target}".`);
  }
  const vars = {
    ...(step.vars ?? {})
  };
  const fromVars = {
    ...(step.fromVars ?? {})
  };
  if (!Object.keys(vars).length) {
    throw new Error(`[normalizeStepVars]: step.vars cannot be empty. ` + `Target: "${step.target}".`);
  }
  return {
    vars,
    fromVars
  };
}

/**
 * Adds one configured animation step to a GSAP Timeline.
 *
 * The operation is selected from `step.type`.
 *
 * This function is intentionally limited to dispatching the step
 * to the corresponding GSAP Timeline method. Target resolution,
 * Timeline creation, and ScrollTrigger configuration are handled
 * by higher-level builders.
 *
 * @param {TTimeline} timeline
 * Existing GSAP Timeline instance.
 *
 * @param {Element | Element[]} targets
 * Resolved Element or collection of Elements to animate.
 *
 * @param {TTimelineStep} step
 * Declarative configuration of the Timeline step.
 *
 * @returns {void}
 *
 * @throws {TypeError}
 * When `step.type` is not a supported Timeline operation.
 */
function addTimelineStep(timeline, targets, step) {
  const {
    vars,
    fromVars
  } = normalizeStepVars(step);
  switch (step.type) {
    case "set":
      timeline.set(targets, vars, step.position);
      break;
    case "from":
      timeline.from(targets, vars, step.position);
      break;
    case "to":
      timeline.to(targets, vars, step.position);
      break;
    case "fromTo":
      timeline.fromTo(targets, fromVars, vars, step.position);
      break;
    default:
      throw new TypeError(`[addTimelineStep]: unsupported step type "${step.type}".`);
  }
}

/**
 * Resolves and adds all configured animation steps to a GSAP Timeline.
 *
 * Each step target is resolved within the supplied DOM search root.
 * The resolved Elements are then passed to addTimelineStep(), which
 * appends the corresponding GSAP operation to the Timeline.
 *
 * The function is independent of Timeline mode (`single` or `group`).
 * The caller determines the appropriate DOM search root:
 *
 * - `Document` for group-wide target resolution;
 * - `Element` for single-root target resolution.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline that receives the animation steps.
 *
 * @param {TTimelineStep[]} steps
 * Declarative animation step configurations.
 *
 * @param {Element | Document} searchRoot
 * DOM root used to resolve step targets.
 *
 * @param {boolean} [includeContextAsTarget=true]
 * it happens that context (parent) Element has the same selector as target in search at steps[N].target
 * In this case the resulting array of the searched Elements will be unshift with context Element
 * as the target Element of the timeline
 *
 * @returns {void}
 *
 * @throws {Error}
 * When a step target cannot be resolved within `searchRoot`.
 */
function addTimelineSteps(timeline, steps, searchRoot, includeContextAsTarget = true) {
  for (const step of steps) {
    const targets = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getElements)(step.target, searchRoot, true, includeContextAsTarget);
    if (!targets.length) {
      throw new Error(`[addTimelineSteps]: target "${step.target}" ` + "was not found within the specified search root.");
    }
    addTimelineStep(timeline, targets, step);
  }
}

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
 */
function buildTimeline(gsap, params, key) {
  switch (params.targetMode) {
    case "single":
      return buildSingleTimeline(gsap, params, key);
    case "group":
      if (!key || typeof key !== "string") {
        throw new TypeError("[buildTimeline]: key as `string` is required " + `for group mode. But received: ${key}`);
      }
      return buildGroupTimeline(gsap, params, key);
    case "each":
      return buildEachTimelines(gsap, params);
    default:
      throw new TypeError(`[buildTimeline]: unsupported targetMode...".`);
  }
}

/**
 * Creates a GSAP Timeline with shared timeline-level configuration.
 *
 * This function centralizes the common Timeline initialization used by
 * all timeline builders.
 *
 * `paused` controls the initial playback state.
 *
 * `scrollTrigger`, when provided, is attached to the Timeline itself.
 * ScrollTrigger is intentionally configured at the Timeline level rather
 * than on individual child tweens.
 *
 * @param {TGsap} gsap - GSAP instance used to create the Timeline.
 * @param {TTimelineParams} params - Timeline configuration.
 * @returns {TTimeline} The newly created GSAP Timeline.
 */
function createTimeline(gsap, params) {
  return gsap.timeline({
    paused: params.paused ?? false,
    ...(params.scrollTrigger && {
      scrollTrigger: params.scrollTrigger
    })
  });
}

/**
 * Resolves Timeline parameters for a specific DOM context.
 *
 * In `each` mode, when the ScrollTrigger `trigger` explicitly matches
 * the configured `scope`, the selector is resolved to the current
 * scope Element.
 *
 * Other Timeline modes and ScrollTrigger configurations are returned
 * unchanged.
 *
 * @param {TTimelineParams} params - Timeline configuration.
 * @param {Element | Document} searchRoot - DOM context of the Timeline.
 * @returns {TTimelineParams} Resolved Timeline configuration.
 */
function resolveTimelineParams(params, searchRoot) {
  if (params.targetMode !== "each" || !(searchRoot instanceof Element) || !params.scrollTrigger) {
    return params;
  }
  const trigger = params.scrollTrigger.trigger;
  if (trigger === undefined || trigger !== params.scope) {
    return params;
  }
  return {
    ...params,
    scrollTrigger: {
      ...params.scrollTrigger,
      trigger: searchRoot
    }
  };
}

/***
 Builds, populates, and registers one GSAP Timeline.
 * This function centralizes the common Timeline construction pipeline
 * shared by all target-mode builders.
 * The construction process is:
 * 1. Validate Timeline steps.
 * 2. Create the Timeline with its common configuration.
 * 3. Resolve and add all configured steps within the supplied DOM root.
 * 4. Register the completed Timeline under the supplied cache key (string|Element).*
 *
 * Target-mode-specific logic is intentionally handled by the caller.
 * The caller is responsible for resolving the appropriate searchRoot
 * and determining the correct animationKey.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance used to create the Timeline.
 * @param {TTimelineParams} params
 * Complete Timeline configuration, including its steps and
 * optional Timeline-level configuration.
 * @param {Document | Element} searchRoot
 * DOM context used to resolve the selectors defined by
 * @param {TAnimationKey} animationKey
 * Cache key used to register the created Timeline.
 *
 * @throws {TypeError}
 * When params.steps is not an Array.
 * @throws {Error}
 * When params.steps is an empty Array or when a step target
 * cannot be resolved within searchRoot.
 *
 * @returns {TTimeline}
 * The created, populated, and registered GSAP Timeline.
 *
 * @example
 * Build and register a Timeline using a single Element as
 * the DOM search root and the same Element as its cache identity.
 * const timeline = buildAndRegisterTimeline(
 * gsap,
 * singleTimelineParams,
 * rootElement,
 * rootElement,
 * );
 *
 * @example
 * Build and register a group Timeline using the Document
 * as the search root and a named string as its cache identity.
 * const timeline = buildAndRegisterTimeline(
 * gsap,
 * groupTimelineParams,
 * document,
 * "heroAnimation",
 * );
 *
 */
function buildAndRegisterTimeline(gsap, params, searchRoot, animationKey) {
  validateTimelineSteps(params.steps, "buildAndRegisterTimeline");
  const timelineParams = resolveTimelineParams(params, searchRoot);
  const timeline = createTimeline(gsap, timelineParams);
  addTimelineSteps(timeline, timelineParams.steps, searchRoot, true);
  (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.registerAnimation)(animationKey, timeline);
  return timeline;
}

/**
 * Builds and registers one GSAP Timeline for a single DOM root.
 *
 * The single mode creates exactly one Timeline from exactly one
 * resolved root Element.
 *
 * The resolved root serves two purposes:
 *
 * 1. It defines the DOM search scope for all `params.steps`.
 * 2. It provides the default Element-based cache identity when
 *    an explicit `key` is not supplied.
 *
 * The root and `scrollTrigger.trigger` have independent responsibilities:
 *
 *     root
 *       ↓
 *     resolves step targets
 *
 *     scrollTrigger.trigger
 *       ↓
 *     controls Timeline playback
 *
 * The root Element may also become a step target when a step selector
 * matches the root itself and no matching descendants are found.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance used to create the Timeline.
 *
 * @param {TSingleTimelineParams} params
 * Configuration for the single Timeline.
 *
 * @param {TAnimationKey} [key]
 * Optional explicit cache key.
 * When omitted, the resolved root Element is used as the cache identity.
 *
 * @returns {TTimeline}
 * The created and registered GSAP Timeline.
 *
 * @throws {Error}
 * When `params.root` does not resolve to exactly one Element.
 *
 * @throws {TypeError}
 * When `params.steps` is not an Array.
 *
 * @throws {Error}
 * When `params.steps` is empty or a step target cannot be resolved.
 *
 * @example
 * const timeline = buildSingleTimeline(
 *   gsap,
 *   {
 *     targetMode: "single",
 *     root: ".hero",
 *     steps: [
 *       {
 *         target: ".hero__title",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *           y: 40,
 *           duration: 0.8,
 *         },
 *       },
 *     ],
 *   },
 * );
 *
 * @example
 * const timeline = buildSingleTimeline(
 *   gsap,
 *   singleTimelineParams,
 *   "heroAnimation",
 * );
 */
function buildSingleTimeline(gsap, params, key) {
  // Resolve the unique DOM root used as the step search context.
  const root = resolveSingleTimelineRoot(params.root);

  // Use the explicit key when provided; otherwise use the root
  // Element as the natural identity for the animation cache.
  return buildAndRegisterTimeline(gsap, params, root, key ?? root);
}

/**
 * Builds and registers one shared GSAP Timeline for a group of Elements.
 *
 * Group mode resolves all step selectors against the Document and passes
 * the complete matching Element collections to the same Timeline.
 *
 * Unlike `single` and `each` modes, group mode has no unique Element
 * that can serve as its implicit cache identity. A non-empty string
 * `key` is therefore required.
 *
 * The supplied key is used as the named identity in the animation cache.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance used to create the Timeline.
 *
 * @param {TGroupTimelineParams} params
 * Configuration for the shared group Timeline.
 *
 * @param {string} key
 * Non-empty string used as the Timeline's cache identity.
 *
 * @returns {TTimeline}
 * The created and registered GSAP Timeline.
 *
 * @throws {TypeError}
 * When `key` is not a non-empty string.
 *
 * @throws {TypeError}
 * When `params.steps` is not an Array.
 *
 * @throws {Error}
 * When `params.steps` is empty or a step target cannot be resolved.
 *
 * @example
 * const timeline = buildGroupTimeline(
 *   gsap,
 *   {
 *     targetMode: "group",
 *     steps: [
 *       {
 *         target: ".gallery-card",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *           y: 40,
 *           duration: 0.8,
 *         },
 *       },
 *     ],
 *   },
 *   "galleryCards",
 * );
 *
 * @example
 * const timeline = buildGroupTimeline(
 *   gsap,
 *   groupTimelineParams,
 *   "heroAnimation",
 * );
 */
function buildGroupTimeline(gsap, params, key) {
  // Group mode requires an explicit named cache identity because
  // there is no single Element representing the entire group.
  if (typeof key !== "string" || !key.trim()) {
    throw new TypeError("[buildGroupTimeline]: key must be a non-empty string.");
  }

  // Group targets are resolved against the entire Document.
  // `getElements()` cannot use Document as a context target, so
  // the context itself can never become an animation target.
  return buildAndRegisterTimeline(gsap, params, document, key);
}

/**
 * Builds and registers one independent GSAP Timeline for each
 * Element matching `params.scope`.
 *
 * Each matched scope Element becomes the DOM search context for
 * the Timeline created for that scope.
 *
 * For example:
 *
 *     scope: ".card"
 *
 * produces:
 *
 *     .card #1 → Timeline #1
 *     .card #2 → Timeline #2
 *     .card #3 → Timeline #3
 *
 * Each scope Element is also used as the cache identity of its
 * corresponding Timeline. This maps naturally to the WeakMap-based
 * animation cache.
 *
 * Step targets are resolved independently inside each scope Element,
 * preventing selectors from one scope from resolving against another.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance used to create the Timelines.
 *
 * @param {TEachTimelineParams} params
 * Configuration for the per-scope Timelines.
 *
 * @returns {TTimeline[]}
 * One independent Timeline for each matched scope Element.
 *
 * @throws {TypeError}
 * When `params.scope` is not a non-empty string.
 *
 * @throws {TypeError}
 * When `params.steps` is not an Array.
 *
 * @throws {Error}
 * When `params.steps` is empty.
 *
 * @throws {Error}
 * When no Elements match `params.scope`.
 *
 * @example
 * const timelines = buildEachTimelines(
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
 *           duration: 0.8,
 *         },
 *       },
 *     ],
 *   },
 * );
 *
 * @example
 * const timelines = buildEachTimelines(
 *   gsap,
 *   eachTimelineParams,
 * );
 */
function buildEachTimelines(gsap, params) {
  // `scope` is the selector that defines the independent Timeline
  // instances, so validate it before performing the DOM lookup.
  if (typeof params.scope !== "string" || !params.scope.trim()) {
    throw new TypeError("[buildEachTimelines]: scope must be a non-empty string.");
  }

  // Resolve every scope Element once. Each Element becomes the
  // search context and cache identity of its own Timeline.
  const scopeElements = (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.getElements)(params.scope, document, true, false);
  if (!scopeElements.length) {
    throw new Error(`[buildEachTimelines]: no Elements matched scope selector ` + `"${params.scope}".`);
  }
  return scopeElements.map(scopeElement => buildAndRegisterTimeline(gsap, params, scopeElement, scopeElement));
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

      //restoreDocumentScroll();

      (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setDocumentScrollLocked)(false);

      // Reverse the Timeline to hide the navigation.
      navMenuAnime.reverse();
      return;
    }

    // Preserve the scrollbar width while the navigation is open.

    //lockDocumentScroll();

    ;(0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setDocumentScrollLocked)(true);

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
  ;(0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setAttributes)([burgerHidden, burgerFixed, navMenuFixed], {
    "aria-expanded": false
  });

  // Reverse the Timeline to hide the fixed navigation.
  navMenuAnime.reverse();

  // Restore document scrolling.
  //restoreDocumentScroll();
  (0,_helpers_funcsDOM_js__WEBPACK_IMPORTED_MODULE_0__.setDocumentScrollLocked)(false);
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
    (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.initLog)("error", {
      component: "getCurrentPageName",
      message: "<body> does not have a data-type attribute.",
      details: {
        dataset: document.body?.dataset
      }
    });
    return null;
  }
  if (!isPageName(pageName, pageNames)) {
    (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.initLog)("error", {
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
 * and the error is reported through {@link initLog}.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initAnimations() {
  const gsapAll = await (0,_gsap_loader_js__WEBPACK_IMPORTED_MODULE_1__.getGSAP)();
  if (!gsapAll) {
    //initLog will log error in getGSAP()
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
      //parallax at gates-rollers-automation.html
      (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.tryUse)(buildSingleTimeline)(gsap, _animationParams_js__WEBPACK_IMPORTED_MODULE_4__.automationParallaxTimelineParams);
    },
    common: () => {
      //Hero section priority...
      /*			tryUse(buildGroupTimeline)(
      				gsap,
      				heroTimelineParams,
      				"heroAnimation",
      			);*/

      //initializing burger handlers, build and register animation timeline...
      (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.tryUse)(initBurgerMenu)(gsap, _initialSelectors_js__WEBPACK_IMPORTED_MODULE_3__.navMenuSelectorsData, _animationParams_js__WEBPACK_IMPORTED_MODULE_4__.burgerNavTimelineParams);

      // parallax on services section on all pages
      (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.tryUse)(buildSingleTimeline)(gsap, _animationParams_js__WEBPACK_IMPORTED_MODULE_4__.servicesParallaxTimelineParams);

      // separate timelines of Elements with common selector: fade-in-left
      (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.tryUse)(buildEachTimelines)(gsap, _animationParams_js__WEBPACK_IMPORTED_MODULE_4__.fadeInLeftTimelineParams);

      // separate timelines of Elements with common selector: fade-in-right
      (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.tryUse)(buildEachTimelines)(gsap, _animationParams_js__WEBPACK_IMPORTED_MODULE_4__.fadeInRightTimelineParams);

      // separate timelines of Elements with common selector: scale-in
      (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.tryUse)(buildEachTimelines)(gsap, _animationParams_js__WEBPACK_IMPORTED_MODULE_4__.scaleInTimelineParams);

      // separate timelines of Elements with common selector: fade-in-up
      (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.tryUse)(buildEachTimelines)(gsap, _animationParams_js__WEBPACK_IMPORTED_MODULE_4__.fadeInUpTimelineParams);

      //the navigation panel show-on-scroll Timeline
      (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_2__.tryUse)(buildSingleTimeline)(gsap, _animationParams_js__WEBPACK_IMPORTED_MODULE_4__.scrolledNavTimelineParams);
    }
  };
  runPageAnimations(pageAnimations, pageNames);

  /**
   *!! CRITICALLY IMPORTANT:
   * Since initialization now happens lazily upon scrolling,
   * we ask ScrollTrigger to immediately recalculate the coordinate map
   * for all registered triggers on the page, accounting for the current offset.
   */
  ScrollTrigger.refresh();
}

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
/* harmony export */   isRegisteredAnimation: function() { return /* binding */ isRegisteredAnimation; },
/* harmony export */   killAnimation: function() { return /* binding */ killAnimation; },
/* harmony export */   registerAnimation: function() { return /* binding */ registerAnimation; }
/* harmony export */ });
/* harmony import */ var _helpers_funcs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/funcs.js */ "./src/js/helpers/funcs.js");


/**
 * @file gsap-loader.js
 * @description Atomic lazy-loader for GSAP + ScrollTrigger.
 * Exports a global animation cache so that animations.js (or any consumer)
 * can register, retrieve, and kill tweens/timelines in one centralized place.
 */


/// TYPES ///
/**
 *! GSAP ANIMATIONS type aliases used by this module.
 *
 * @typedef {import("../types/animations.types.js").TAnimation} TAnimation
 * @typedef {import("../types/animations.types.js").TAnimationKey} TAnimationKey
 * @typedef {import("../types/animations.types.js").TGsapModules} TGsapModules
 *
 */

///////////////
/**
 * @type {Promise<TGsapModules | null> | null}
 * Cached Promise for the GSAP modules.
 *
 * The Promise is cached immediately, before the dynamic import resolves,
 * so concurrent callers share the same initialization.
 */
let gsapPromise = null;

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
 * Loads and caches GSAP and ScrollTrigger as a single initialization.
 *
 * A failed load resolves to `null`, matching the caller's existing
 * `if (!gsapAll)` guard.
 *
 * @returns {Promise<TGsapModules | null>}
 */
function getGSAP() {
  if (!gsapPromise) {
    // Cache the Promise, not only the resolved modules.
    gsapPromise = loadGSAP().catch(error => {
      (0,_helpers_funcs_js__WEBPACK_IMPORTED_MODULE_0__.initLog)("error", {
        component: "getGSAP",
        message: "Failed to load GSAP or ScrollTrigger.",
        details: error
      });
      gsapPromise = null;

      // Allow a later call to retry initialization after a failure.
      return null;
    });
  }
  return gsapPromise;
}

/**
 * Dynamically imports GSAP modules and registers ScrollTrigger.
 *
 * @returns {Promise<TGsapModules>}
 * @throws {Error} If GSAP or ScrollTrigger cannot be loaded.
 */
async function loadGSAP() {
  const {
    gsap,
    ScrollTrigger
  } = await __webpack_require__.e(/*! import() | gsap */ "gsap").then(__webpack_require__.bind(__webpack_require__, /*! ./gsap-all.js */ "./src/js/partials/gsap-all.js"));
  if (!gsap || !ScrollTrigger) {
    throw new Error("[getGSAP]: GSAP or ScrollTrigger was not imported.");
  }

  // Register the plugin after both modules have loaded successfully.
  gsap.registerPlugin(ScrollTrigger);
  return {
    gsap,
    ScrollTrigger
  };
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
  if (isRegisteredAnimation(key)) {
    throw new Error(`[registerAnimation]: the given key ${key} is already registered by another timeline`);
  }
  if (typeof key !== "string" && !(key instanceof Element)) {
    throw TypeError(`[registerAnimation]: the given key must be string or Element... given key: ${key}`);
  }
  if (typeof key === "string" && !key) {
    throw new TypeError(`[registerAnimation]: the given key: ${key} has no length: ${key.length}`);
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
 * Checks whether an animation is registered under the given key.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @returns {boolean} `true` when the key exists in the animation cache.
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

/***/ }),

/***/ "./src/js/partials/initialSelectors.js":
/*!*********************************************!*\
  !*** ./src/js/partials/initialSelectors.js ***!
  \*********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IMAGE_RATIO_TOLERANCE: function() { return /* binding */ IMAGE_RATIO_TOLERANCE; },
/* harmony export */   MASONRY_CONFIG: function() { return /* binding */ MASONRY_CONFIG; },
/* harmony export */   MASONRY_INITIALIZE_MARGIN: function() { return /* binding */ MASONRY_INITIALIZE_MARGIN; },
/* harmony export */   MASONRY_REVEAL_DELAY: function() { return /* binding */ MASONRY_REVEAL_DELAY; },
/* harmony export */   SELECTORS: function() { return /* binding */ SELECTORS; },
/* harmony export */   galleryThumbsFolderName: function() { return /* binding */ galleryThumbsFolderName; },
/* harmony export */   langSwitchData: function() { return /* binding */ langSwitchData; },
/* harmony export */   linkAnchors: function() { return /* binding */ linkAnchors; },
/* harmony export */   linkClassNameActive: function() { return /* binding */ linkClassNameActive; },
/* harmony export */   navMenuSelectorsData: function() { return /* binding */ navMenuSelectorsData; }
/* harmony export */ });


/**
 * @file initialSelectors.js
 * @description Initial Data with selectors
 */

//*** TYPE DEFINITIONS ***//

/**
 *! DOM type aliases used by this module.
 *
 * @typedef {import("../types/dom.types.js").TBurgerElements} TBurgerElements
 * @typedef {import("../types/dom.types.js").TDOMSelectorConfig} TDOMSelectorConfig
 * @typedef {import("../types/dom.types.js").TNavMenuSelector} TNavMenuSelector
 * @typedef {import("../types/animations.types.js").TPageName} TPageName
 */

/**
 *! MASONRY type aliases used by this module.
 *
 * @typedef {import("../types/masonry.types.js").TMasonryConfig} TMasonryConfig
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
const linkClassNameActive = "active";

// ============================================
// ANIMATIONS SELECTORS
// ============================================

/** @type {Object.<string, string>} Animation selectors map */
const SELECTORS = {
  gallerySelector: "#gallery-work",
  navLinkSelector: ".nav-link",
  navHexagonSelector: ".hexagon-comb-block__cell",
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

///////// MASONRY GALLERY CONSTANTS //////////

/**
 * Default configuration for the work gallery Masonry layout.
 *
 * @type {TMasonryConfig}
 */
const MASONRY_CONFIG = {
  itemSelector: ".gallery__item",
  gap: 16
};

//! is used for validateImageAspectRatio() in funcsDOM.js
const IMAGE_RATIO_TOLERANCE = 0.001;

//! delay for the masonry gallery images to reveal in ms...
const MASONRY_REVEAL_DELAY = 120;
const MASONRY_INITIALIZE_MARGIN = "200px 0px"; //"0px"

//is used for initThumbs() at index.js
const galleryThumbsFolderName = "thumbs";

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
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
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
/******/ 		__webpack_require__.O = function(result, chunkIds, fn) {
/******/ 			if(chunkIds) {
/******/ 				deferred.push([chunkIds, fn]);
/******/ 				return;
/******/ 			}
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if (__webpack_require__.O.j(chunkIds[j])) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
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
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = function(exports, definition) {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	__webpack_require__.f = {};
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function(chunkId) {
/******/ 		var promises = [];
/******/ 		__webpack_require__.f.j(chunkId, promises);
/******/ 		return Promise.all(promises);
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	// This function allow to reference async chunks
/******/ 	__webpack_require__.u = function(chunkId) { return chunkId + ".bundle.js"; };
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	__webpack_require__.g = (function() {
/******/ 		if (typeof globalThis === 'object') return globalThis;
/******/ 		try {
/******/ 			return this || new Function('return this')();
/******/ 		} catch (e) {
/******/ 			if (typeof window === 'object') return window;
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };
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
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
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
/******/ 					while (i > -1 && (!scriptUrl || !/^https?:/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:|[?#].*$/g, "").replace(/\/[^/]+$/, "/");
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
/******/ 										error.event = event;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(__webpack_require__.p + __webpack_require__.u(chunkId), loadingEnded, "chunk-" + chunkId, chunkId);
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