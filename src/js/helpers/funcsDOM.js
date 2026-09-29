'use strict';

import imagesLoaded from 'imagesloaded';
import { getInvalidKeys } from "./funcs.js";

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
export function isStyleSupported(element, param, value) {
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
export function migrateElement(target, parentFrom, parentTo) {

	if (target.isConnected) {
		(target.parentElement === parentFrom ? parentTo : parentFrom).appendChild(
			target
		);
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
	if (listenerOwner instanceof HTMLElement && !listenerOwner.isConnected) {
		throw new Error(
			'Provided listenerOwner at lockedEventListener() is not a valid DOM element...'
		);
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
export function toggleClassOnIntersection(
	targetElement,
	triggerElement,
	activeClass,
	root = null,
	rootMargin = '-1px 0px 0px 0px'
) {
	if (!targetElement?.isConnected || !triggerElement?.isConnected) {
		throw new Error(
			'[toggleClassOnIntersection]: targetElement or triggerElement is not connected to the DOM.'
		);
	}

	let isClassActive = false;

	const observer = new IntersectionObserver(
		([entry]) => {
			const shouldActivate =
				entry.boundingClientRect.top <= 0 && !entry.isIntersecting;

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
		rootMargin = '0px',
		threshold = 0,
		onEnter,
		onLeave,
		onChange,
		once = false
	} = options;

	if (!targetElement?.isConnected) {
		throw new Error(
			'[observeIntersection]: targetElement is not connected to the DOM.'
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
 *  @param {Element[]} elements - target Elements to set attributes...
 * @param {Record<string, string | number | boolean | null | undefined>} [targetAttr={}] the list of
 * HTMLElements to be set with the attributes
 * @returns {void}
 */
export function setAttributes(elements = [], targetAttr = {}) {
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

			throw new Error(
				`[setAttributes]: ${errorMessage}`
			);
		}

		Object.entries(targetAttr).forEach(([attr, value]) => {
			element.setAttribute(
				attr,
				value !== null && value !== undefined ? value.toString() : ''
			);
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
			state.scrollbarWidth =
				window.innerWidth - document.documentElement.clientWidth;
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
		throw new Error(
			'[checkInDOM]: Container must be a DOM element connected to the document'
		);
	}
}

/**
 * Checks whether Element is an HTMLElement.
 * @param {unknown} element
 * @returns {element is HTMLElement}
 */
export function isHTMLElement(element) {
	return element instanceof HTMLElement;
}

/**
 * Checks whether Element is an HTMLElement.
 * Serves as a Type Guard for TypeScript/JSDoc.
 * @param {unknown} element
 * @returns {element is HTMLElement}
 */
export function checkHtmlElement(element) {
	const isHTMLElem = isHTMLElement(element);

	if (!isHTMLElem) {
		// Cast to any type inside JSDoc comment so TS allows reading properties
		const unsafeTarget = /** @type {*} */ (element);

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
export function canUseContextAsTarget(
	context,
	targetSelector,
	includeContextSelector,
) {
	return (
		includeContextSelector &&
		context instanceof Element &&
		context.matches(targetSelector)
	);
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
export function getDOMElement(selector, context = document) {
	const element = context.querySelector(selector);

	if (!element) {
		logInitError({
			component: "getDOMElement",
			message: `Element with selector "${selector}" was not found in the DOM.`,
			details: { parent: parent.constructor.name }
		});
		return;
	}

	// returning the element by casting it to the generic type T
	return /** @type {T} */ (element);
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
export function getElements(
	selector,
	context = document,
	multiple = true,
	includeContextAsTarget = false,
) {
	const targets = multiple
		? /** @type {T[]} */ (
			[...context.querySelectorAll(selector)]
		)
		: (() => {
			const target = context.querySelector(selector);

			return target
				? [/** @type {T} */ (target)]
				: [];
		})();

	/*
	 * Prefer matching descendants over the context itself.
	 *
	 * The context is considered only when the selector produced
	 * no descendant targets.
	 */
	if (
		!targets.length &&
		canUseContextAsTarget(
			context,
			selector,
			includeContextAsTarget,
		) && context instanceof Element
	) {
		console.log(`using canUseContextAsTarget with context: ${context.className}`);

		targets.push(
			/** @type {T} */ (context),
		);
	}

	if (!targets.length) {
		logInitError({
			component: "getElements",
			message:
				`Element with selector "${selector}" ` +
				"was not found in DOM.",
			details: {
				context: context.constructor.name,
				multiple,
				includeContextAsTarget,
			},
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
export function requireElements(
	selectors,
	context = document
) {
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
		multiple = false,
	} of selectors) {
		/**
		 * `getElements()` returns an array in both single and multiple modes.
		 *
		 * When `multiple` is false, the array contains one element.
		 * When `multiple` is true, it contains all matching elements.
		 */
		const result = getElements(
			selector,
			context,
			multiple
		);

		/**
		 * `getElements()` returns an empty array when nothing was found.
		 *
		 * For `requireElements()`, an absent required element is a fatal
		 * initialization error, therefore execution stops immediately.
		 */
		if (!result.length) {
			const errorMessage =
				`Required DOM element missing. ` +
				`Key: "${key}", Selector: "${selector}"`;

			logInitError({
				component: "requireElements",
				message: errorMessage,
			});

			throw new Error(
				`[requireElements]: ${errorMessage}`
			);
		}

		/**
		 * Store either the first element or the complete result array
		 * according to the selector configuration.
		 */
		elements[key] = multiple
			? result
			: result[0];
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
export function lockDocumentScroll() {
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
export function restoreDocumentScroll() {
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
			console.warn(
				`[getImageDimensions]: could not load the image with src: ${img.src}`
			);
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

	console.warn(
		`[getImagesLoaded] Removed ${brokenImages.length} broken image(s):`,
		brokenImages.map(b => b.src)
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

	instance.images.forEach(item => {
		const img = item.img;
		const parentElement = parentMap.get(img);

		if (!item.isLoaded) {
			brokenImages.push({
				src: img.src || img.currentSrc || 'unknown',
				element: parentElement
			});
		}
		else {
			loadedPromises.push(
				getImageDimensions(img).then(size => ({
					element: parentElement,
					size
				}))
			);
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
export async function getImagesLoaded(container, options = {}) {
	// Validate container or throws error...
	checkInDOM(container);

	// Return a promise that resolves when imagesLoaded completes
	return new Promise((resolve, reject) => {
		try {
			imagesLoaded(container, options, async (instance) => {
				try {
					const parentMap = buildImageParentMap(container, options);
					const results = await processImageResults(instance, parentMap);
					resolve(results);
				}
				catch (error) {
					reject(
						new Error(`[getImagesLoaded] Processing error: ${error.message}`)
					);
				}
			});
		}
		catch (error) {
			reject(
				new Error(`[getImagesLoaded] Initialization error: ${error.message}`)
			);
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
		...params
	};

	try {
		const container = document.querySelector(containerSelector);

		if (!container?.isConnected) {
			throw new Error(
				`[createMasonry]: Container with selector "${containerSelector}" not found in DOM`
			);
		}

		// Get loaded images data
		const imagesArr = await getImagesLoaded(container);

		// Validate that we have images
		if (!Array.isArray(imagesArr) || imagesArr.length === 0) {
			throw new Error(
				`[createMasonry]: No images found in container "${containerSelector}"`
			);
		}

		// Validate first image data structure and get dimensions
		const firstImage = imagesArr[0];
		if (!firstImage?.element || !firstImage?.size) {
			throw new Error(
				'[createMasonry]: Invalid image data structure returned from getImagesLoaded'
			);
		}

		const itemWidth = firstImage.size.offsetWidth;
		const containerWidth = container.clientWidth;

		// Validate dimensions
		if (!itemWidth || itemWidth === 0) {
			throw new Error('[createMasonry]: Image width is zero or undefined');
		}

		const { gap } = options;
		const { columns, freeWidth } = getColumnsNumber(
			containerWidth,
			itemWidth,
			gap
		);
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
	}
	catch (error) {
		// whether `error` is an actual error object
		if (error instanceof Error) {
			console.error('[createMasonry]:', error.message);
		} else {
			console.error('[createMasonry]: Unknown error', error);
		}

		// Re-throw to allow caller to handle
		throw error;
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
	const freeWidth =
		containerWidth - (columns * itemWidth + (columns - 1) * gap);

	return { columns, freeWidth };
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
export function activateNavLink(params) {
	// Check if all necessary arguments are provided, otherwise, log a warning.
	/** @type {(keyof TActivateNavlinkParams)[]} */
	const requiredKeys = [
		"navLinkSelector",
		"pageType",
		"activeClass",
		"anchorLink",
	];

	const missingKeys = getInvalidKeys(
		params,
		requiredKeys,
		{
			invalidValues: ["", undefined, null, 0]
		}
	);

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
			anchorLink,
		} = params;

	// Get all navigation link items using the provided selector.
	const navLinkItems = /** @type {HTMLAnchorElement[]} */ (
		getElements(navLinkSelector, document, true)
	);
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
export function logInitError(params) {
	const {component, message, details} = params;

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
function getLangClickHandler (dataSetKey, langActive) {
	/**
	 * the callback for the click listener at langListSelector "#lang-list"
	 * @param {MouseEvent}  event
	 */
	return (event) => {
		const eTarget = event.target;
		if (!(eTarget instanceof Element)) {
			// Cast to any type inside JSDoc comment so TS allows reading properties
			const unsafeTarget = /** @type {*} */ (eTarget);

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

		console.log("clickedLang:", clickedLang);

		redirectToLanguage(langActive, clickedLang);
	}
}

/**
 * @param {string} langActive
 * @param {string} clickedLang
 * @return {void}
 */
function redirectToLanguage(langActive, clickedLang) {
	const currentUrl = new URL(window.location.href);

	currentUrl.pathname =
		currentUrl.pathname.replace(
			`/${langActive}/`,
			`/${clickedLang}/`
		);


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
export function checkEventCurrentTarget(event) {
	const curTarget = event.currentTarget;

	if (!(isHTMLElement(curTarget))) {
		// Cast to any type inside JSDoc comment so TS allows reading properties
		const unsafeTarget = /** @type {*} */ (curTarget);

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
	return (event) => {
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
export function initLangSwitcher(params) {
	const requiredKeys = [
		"langSwitcherSelector",
		"langSwitcherCurrent",
		"langSwitcherButton",
		"langSwitcherItem",
		"langActiveSelector",
		"langListSelector",
		"langOptionArr",
		"dataSetKey",
	];

	const missingKeys = getInvalidKeys(
		params,
		requiredKeys,
		{
			invalidValues: ["", undefined, null],
		}
	);

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

	const [langSwitcher] = getElements(
		langSwitcherSelector
	);

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
		dataSetKey,
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
function getLangItems(langVerArr, params, ) {
	const{
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
	const nestedFolder = targetFolder.replace(/^\.?\/?|\/?\.?$/, '');

	return url.replace(new RegExp(`/${nestedFolder}/`), '/'); // If no match is found, return the original URL
}

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
export function detachModalListeners(root, handleClick, handleKeydown, touch) {
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
export async function cleanupModal(dom, state, fadeDuration = 300) {
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

