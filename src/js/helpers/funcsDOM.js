'use strict';

import { getInvalidKeys } from "./funcs.js";

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

			initLog("error",{
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

		initLog("error", {
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
export function getDOMElement(selector, context = document, useLog = true) {
	const element = context.querySelector(selector);

	if (!element) {
		useLog && initLog("error",{
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
		targets.push(
			/** @type {T} */ (context),
		);
	}

	if (!targets.length) {
		initLog("error",{
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

			initLog("error", {
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
function validateMasonryLayoutInput(
	containerWidth,
	items,
	gap
) {
	if (!Number.isFinite(containerWidth)) {
		throw new TypeError(
			`[validateMasonryLayoutInput]: containerWidth must be a finite number, but received: ${containerWidth}`
		);
	}

	if (containerWidth <= 0) {
		throw new RangeError(
			`[validateMasonryLayoutInput]: containerWidth must be greater than zero, but received: ${containerWidth}`
		);
	}

	if (!Array.isArray(items)) {
		throw new TypeError(
			'[validateMasonryLayoutInput]: items must be an array.'
		);
	}

	if (items.length === 0) {
		throw new RangeError(
			'[validateMasonryLayoutInput]: items must not be empty.'
		);
	}

	if (!Number.isFinite(gap)) {
		throw new TypeError(
			`[validateMasonryLayoutInput]: gap must be a finite number, but received ${gap}`
		);
	}

	if (gap < 0) {
		throw new RangeError(
			`[validateMasonryLayoutInput]: gap must be greater than or equal to zero, but received ${gap}`
		);
	}
}

const IMAGE_RATIO_TOLERANCE = 0.001;

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
function validateImageAspectRatio(
	image,
	index,
) {
	/*
	 * Read the dimensions declared explicitly in the HTML attributes.
	 *
	 * Do not use `image.width` or `image.height` here because those
	 * properties represent the current rendered CSS dimensions.
	 */
	const declaredWidth =
		Number(
			image.getAttribute("width"),
		);

	const declaredHeight =
		Number(
			image.getAttribute("height"),
		);

	/*
	 * Read the intrinsic dimensions of the loaded image resource.
	 */
	const actualWidth =
		image.naturalWidth;

	const actualHeight =
		image.naturalHeight;

	/*
	 * The declared dimensions and intrinsic dimensions must both be
	 * valid before an aspect ratio comparison can be performed.
	 */
	if (
		!Number.isFinite(declaredWidth) ||
		!Number.isFinite(declaredHeight) ||
		declaredWidth <= 0 ||
		declaredHeight <= 0 ||
		!Number.isFinite(actualWidth) ||
		!Number.isFinite(actualHeight) ||
		actualWidth <= 0 ||
		actualHeight <= 0
	) {
		return;
	}

	const declaredRatio =
		declaredWidth /
		declaredHeight;

	const actualRatio =
		actualWidth /
		actualHeight;

	/*
	 * Compare aspect ratios instead of absolute dimensions.
	 *
	 * The tolerance prevents insignificant floating-point differences
	 * from being reported as image dimension mismatches.
	 */
	const ratioDifference =
		Math.abs(
			declaredRatio -
			actualRatio,
		);

	if (
		ratioDifference <=
		IMAGE_RATIO_TOLERANCE
	) {
		return;
	}

	initLog("warn", {
		component: "validateImageAspectRatio",
		message:
			`Image at index ${index} has a different declared ` +
			"and intrinsic aspect ratio.",
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
			tolerance: IMAGE_RATIO_TOLERANCE,
		},
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

	for (const { element } of items) {
		const image = element.querySelector('img');

		if (image instanceof HTMLImageElement) {
			images.push(image);
		}
		else {
			initLog("warn", {
				component: "getMasonryImages",
				message: "Masonry item does not contain an HTMLImageElement.",
				details: {
					image,
					searchedTag: "img",
					parent: element,
				},
			});
		}
	}

	return images;
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
 * @returns {void}
 */
function handleMasonryImageLoaded(
	image,
	index
) {
	validateImageAspectRatio(
		image,
		index,
	);

	const parentElem =
		image.parentElement;

	if (
		!parentElem ||
		!parentElem.classList.contains(
			'gallery__item',
		)
	) {
		initLog("error", {
			component: "validateMasonryImages",
			message:
				"Could not find the Masonry item parent element.",
			details: {
				imgIndex: index,
				image,
				parent: parentElem,
			},
		});

		return;
	}

	revealMasonryItem(parentElem, 500);
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
function validateMasonryImages(
	images,
	validatedImages,
) {
	if (!Array.isArray(images)) {
		throw new TypeError(
			'[validateMasonryImages]: images must be an array.',
		);
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
			if (
				image.naturalWidth > 0 &&
				image.naturalHeight > 0
			) {
				handleMasonryImageLoaded(
					image,
					index,
				);
			}

			continue;
		}

		/*
		 * The image has not completed loading yet.
		 *
		 * The `load` event is the correct event for successful image
		 * loading. The listener is automatically removed after firing.
		 */
		image.addEventListener(
			'load',
			() => {
				handleMasonryImageLoaded(
					image,
					index,
				);
			},
			{
				once: true,
			},
		);

		image.addEventListener(
			'error',
			() => {
				initLog("error", {
					component: "validateMasonryImages",
					message:
						"Masonry image failed to load.",
					details: {
						index,
						image,
					},
				});
			},
			{
				once: true,
			},
		);

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
export function measureMasonryItems(items) {
	/*
	 * The function receives the result of getElements(), therefore
	 * the collection itself must be a valid array before processing.
	 */
	if (!Array.isArray(items)) {
		throw new TypeError(
			'[measureMasonryItems]: items must be an array.'
		);
	}

	if (items.length === 0) {
		throw new RangeError(
			'[measureMasonryItems]: items must not be empty.'
		);
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
			initLog("error", {
				component: 'measureMasonryItems',
				message:
					'Masonry item is not connected to the DOM and ' +
					'will be skipped.',
				details: {
					element,
					index,
				},
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
		if (
			!Number.isFinite(width) ||
			!Number.isFinite(height) ||
			width <= 0 ||
			height <= 0
		) {
			initLog("error",{
				component: 'measureMasonryItems',
				message:
					'Masonry item has invalid layout dimensions ' +
					'and will be skipped.',
				details: {
					element,
					index,
					width,
					height,
				},
			});

			continue;
		}

		measurements.push({
			element,
			width,
			height,
		});
	}

	/*
	 * An empty measurement result means that masonry cannot be
	 * calculated. At this point the problem is no longer related
	 * to an individual item, but to the complete input collection.
	 */
	if (measurements.length === 0) {
		throw new Error(
			'[measureMasonryItems]: no valid masonry items remain after measurement.'
		);
	}

	return measurements;
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
export function getMasonryColumnsNumber(
	containerWidth,
	itemWidth,
	gap,
) {
	if (
		!Number.isFinite(containerWidth) ||
		!Number.isFinite(itemWidth) ||
		!Number.isFinite(gap)
	) {
		throw new TypeError(
			'[getMasonryColumnsNumber]: all arguments must be finite numbers.'
		);
	}

	if (containerWidth <= 0) {
		throw new RangeError(
			'[getMasonryColumnsNumber]: containerWidth must be greater than zero.'
		);
	}

	if (itemWidth <= 0) {
		throw new RangeError(
			'[getMasonryColumnsNumber]: itemWidth must be greater than zero.'
		);
	}

	if (gap < 0) {
		throw new RangeError(
			'[getMasonryColumnsNumber]: gap must be greater than or equal to zero.'
		);
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
		throw new RangeError(
			'[getMasonryColumnsNumber]: itemWidth must not exceed ' +
			'containerWidth.'
		);
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
	const count = Math.max(
		1,
		Math.floor(
			(containerWidth + gap) /
			(itemWidth + gap)
		),
	);

	/*
	 * Calculate the exact horizontal space occupied by
	 * all columns and the gaps between them.
	 *
	 * There are N - 1 gaps for N columns.
	 */
	const usedWidth =
		count * itemWidth +
		(count - 1) * gap;

	/*
	 * Because containerWidth >= itemWidth and `count` was calculated
	 * using the fitting formula, freeWidth cannot be negative.
	 */
	const freeWidth =
		containerWidth - usedWidth;

	return {
		count,
		freeWidth,
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
function createMasonryColumns(
	containerWidth,
	itemWidth,
	gap,
) {
	const { count, freeWidth } =
		getMasonryColumnsNumber(
			containerWidth,
			itemWidth,
			gap,
		);

	return {
		count,
		width: itemWidth,
		gap,
		leftOffset: freeWidth / 2,
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
		throw new TypeError(
			'[getMasonryItemWidth]: items must be an array.'
		);
	}

	if (items.length === 0) {
		throw new Error(
			'[getMasonryItemWidth]: items must not be empty.'
		);
	}

	const itemWidth = items[0]?.width;

	if (
		!Number.isFinite(itemWidth) ||
		itemWidth <= 0
	) {
		throw new Error(
			'[getMasonryItemWidth]: first masonry item has an invalid width.'
		);
	}

	for (const [index, item] of items.entries()) {
		if (
			!Number.isFinite(item.width) ||
			item.width <= 0 ||
			!Number.isFinite(item.height) ||
			item.height <= 0
		) {
			throw new Error(
				`[getMasonryItemWidth]: masonry item at index ${index} ` +
				'must have valid positive width and height.'
			);
		}

		if (item.width !== itemWidth) {
			throw new RangeError(
				`[getMasonryItemWidth]: all masonry items must have the same width. ` +
				`Expected ${itemWidth}px, but item at index ${index} ` +
				`has width ${item.width}px.`
			);
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
	const columnHeights =
		new Array(columns.count).fill(0);

	return items.map((item) => {
		let columnIndex = 0;

		for (
			let index = 1;
			index < columnHeights.length;
			index += 1
		) {
			if (
				columnHeights[index] <
				columnHeights[columnIndex]
			) {
				columnIndex = index;
			}
		}

		const left =
			columns.leftOffset +
			columnIndex *
			(columns.width + columns.gap);

		const top =
			columnHeights[columnIndex];

		columnHeights[columnIndex] =
			top +
			item.height +
			columns.gap;

		return {
			element: item.element,
			width: item.width,
			height: item.height,
			left,
			top,
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
export function calculateMasonryLayout(
	containerWidth,
	items,
	gap
) {
	validateMasonryLayoutInput(
		containerWidth,
		items,
		gap
	);

	const itemWidth = getMasonryItemWidth(items);

	const columns = createMasonryColumns(
		containerWidth,
		itemWidth,
		gap
	);

	const layoutItems = calculateMasonryItemLayouts(
		items,
		columns
	);

	return {
		containerWidth,
		columns,
		items: layoutItems,
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
export function applyMasonryLayout(layout) {
	for (const item of layout.items) {
		const { element, left, top } = item;

		element.style.left = `${left}px`;
		element.style.top = `${top}px`;
	}
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
export function createMasonry(
	container,
	config,
) {
	/** @type {HTMLElement[]} */
	const items =
		getElements(
			config.itemSelector,
			container,
		);

	const measurements =
		measureMasonryItems(items);

	const containerWidth =
		container.offsetWidth;

	if (
		!Number.isFinite(containerWidth) ||
		containerWidth <= 0
	) {
		throw new RangeError(
			`[createMasonry]: masonry container must have a positive finite width: ${containerWidth}`,
		);
	}

	const layout =
		calculateMasonryLayout(
			containerWidth,
			measurements,
			config.gap,
		);

	applyMasonryLayout(layout);

	return layout;
}

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
function handleMasonryResize(
	container,
	config,
) {
	try {
		createMasonry(
			container,
			config,
		);
	} catch (error) {
		initLog("error",{
			component: 'initMasonry',
			message: 'Masonry resize recalculation failed.',
			details: error,
		});
	}
}

/**
 * Initializes lazy Masonry layout activation and resize handling.
 *
 * Masonry is created when the container approaches the viewport.
 * After successful initialization, container size changes are observed
 * and the Masonry layout is recalculated automatically.
 *
 * Image validation is performed independently from the Masonry layout
 * calculation. Each image is registered for validation at most once
 * during the lifecycle of this Masonry instance.
 *
 * @param {HTMLElement} container
 * Masonry container element.
 *
 * @param {TMasonryConfig} config
 * Normalized Masonry configuration.
 *
 * @param {string} [rootMargin="300px 0px"]
 * Distance from the viewport at which Masonry is initialized.
 *
 * @returns {{
 *   destroy: () => void
 * }}
 * Masonry lifecycle controller.
 */
export function initMasonry(
	container,
	config,
	rootMargin = '0px 0px',
) {
	let isInitialized = false;
	let isFirstResizeNotification = true;

	/*
	 * Tracks images that have already been registered for validation
	 * during this Masonry lifecycle.
	 *
	 * WeakSet is used because image elements must not be kept alive
	 * solely by the validation registry after they leave the DOM.
	 */
	const validatedImages =	new WeakSet();

	const resizeObserver = new ResizeObserver(() => {
			/*
			 * ResizeObserver is created before the initial Masonry layout,
			 * but recalculation must not start until the first layout has
			 * been created successfully.
			 */
			if (!isInitialized) {
				return;
			}

		if (isFirstResizeNotification) {
			/*
   * ResizeObserver may report the current geometry immediately
   * after observation starts.
   *
   * The initial Masonry layout has already been calculated just
   * before observe() was called, so this first notification does
   * not require another layout pass.
   */
			isFirstResizeNotification = false;
			return;
		}

			handleMasonryResize(
				container,
				config,
			);
		});
	const intersectionObserver = new IntersectionObserver((entries) => {
				const entry = entries[0];

				if (!entry?.isIntersecting) {
					return;
				}

				try {
					/*
					 * Perform the initial Masonry layout synchronously.
					 *
					 * The Masonry lifecycle is marked as initialized only after
					 * the initial layout and image validation registration complete
					 * successfully.
					 */
					const layout = createMasonry(container, config);

					isInitialized = true;

					/*
					 * The layout snapshot already contains the exact Masonry
					 * items used during the current layout pass.
					 *
					 * Therefore, resolving the Masonry item collection from
					 * the container again is unnecessary.
					 */
					const images = getMasonryImages(layout.items);

					/*
					 * Image validation is independent from Masonry layout
					 * creation and does not block the layout pipeline.
					 *
					 * validatedImages prevents the same image from being
					 * registered more than once during this lifecycle.
					 */
					validateMasonryImages(
						images,
						validatedImages,
					);

					/*
					 * The initial layout has been created successfully,
					 * therefore the intersection observer is no longer needed.
					 */
					intersectionObserver.unobserve(
						container,
					);

					intersectionObserver.disconnect();

					/*
					 * Start observing container size changes only after
					 * successful Masonry initialization.
					 */
					resizeObserver.observe(
						container,
					);
				} catch (error) {
					/*
					 * Initialization errors are isolated from the observer
					 * callback and reported through the common initialization
					 * logging mechanism.
					 */
					initLog("error", {
						component: 'initMasonry',
						message:
							'Masonry initialization failed.',
						details: error,
					});
				}
			},
			{
				rootMargin,
			},
		);

	intersectionObserver.observe(
		container,
	);

	return {
		/**
		 * Destroys all observers associated with this Masonry instance.
		 *
		 * @returns {void}
		 */
		destroy() {
			intersectionObserver.disconnect();
			resizeObserver.disconnect();
		},
	};
}

/**
 * Reveals a Masonry item after its image has loaded.
 *
 * The visual transition itself is handled by CSS. JavaScript only
 * changes the item's state by adding the corresponding CSS class.
 *
 * @param {HTMLElement} item
 * @param {number} [delay=0]
 *
 * @returns {void}
 */
function revealMasonryItem(item, delay = 0) {
	setTimeout(() => {
		item.classList.add('image-loaded');
	}, delay);
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
			initLog("error",{
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
 * @param {"warn"|"log"|"error"} logType
 * @param {TLogMessageParams} params
 * @returns {void}
 */
export function initLog(logType, params) {
	const { component = 'Unknown', message = '', details } = params;

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

			initLog("error", {
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
		initLog("error",{
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

		initLog("error",{
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
		initLog("error",{
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
		initLog("error",{
			component: "initLangSwitcher",
			message: `Element with selector: ${langSwitcherCurrent}${langActiveSelector} has no data-${dataSetKey} value...`
		});
		return;
	}

	if (!Array.isArray(langOptionArr) || !langOptionArr.length) {
		initLog("error",{
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

