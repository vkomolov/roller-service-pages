"use strict";

/**
 * @file gallery-thumbs/index.js
 *
 */

import TouchSweep from "touchsweep";
//const TouchSweep = require("touchsweep");

import {
	createElementWithClass,
	replaceFilePath,
	createModalState,
	createModalHandlers,
	calculateNavIndex,
	attachModalListeners,
	detachModalListeners,
	cleanupModal,
	getDOMElement,
	isHTMLElement,
	getElements
} from "../../helpers/funcsDOM.js";

import {
	MODAL_MAX_WIDTH,
	MODAL_MAX_HEIGHT,
	SWIPE_THRESHOLD,
	THUMBS_FOLDER,
	FADE_DURATION,
	MODAL_CLASSNAME,
	MODAL_BAR_CLASSNAME,
	MODAL_BAR_ARROW_CLASSNAME,
	MODAL_BUTTON_CLASSNAME,
	MODAL_COUNTER_CLASSNAME,
	MODAL_LOADER_CLASSNAME,
	MODAL_VIEWPORT_CLASSNAME,
	MODAL_IMAGE,
	IS_LOADED,
} from "../../partials/initialSelectors.js"

import { initLog } from "../../helpers/funcs.js";


//////// TYPES /////////////
/**
 *! DOM type aliases used by this module.
 *
 * @typedef {import("../../types/dom.types.js").TModalDOM} TModalDOM,
 * @typedef {import("../../types/dom.types.js").TModalState} TModalState,
 * @typedef {import("../../types/dom.types.js").TModalHandlers} TModalHandlers,
 * @typedef {import("../../types/dom.types.js").TModalImageParams} TModalImageParams,
 * @typedef {import("../../types/dom.types.js").TModalControllerConfig} TModalControllerConfig,
 * @typedef {import("../../types/dom.types.js").TTouchController} TTouchController
 *
 */


/**
 * Initializes a thumbnail gallery with modal functionality.
 * Clicking any image opens a fullscreen modal with the hi-resolution version.
 * Navigation: click arrows, keyboard arrows/Escape, or swipe on mobile.
 *
 * @param {string|Element} innGallery - CSS selector for the gallery container
 * @param {string} [thumbsFolderName="thumbs"] - Subfolder containing thumbnail images
 * @returns {Promise<void>}
 * @throws {Error} If gallery container not found or no valid media elements
 *
 * @example
 * initThumbs("#gallery-work", "thumbs");
 */
export async function initThumbs(innGallery, thumbsFolderName = THUMBS_FOLDER) {
	const gallery = typeof innGallery === "string"
		? getDOMElement(innGallery, document)
		: innGallery;

	//narrowing type Element to HTMLElement...
	if (!gallery || !isHTMLElement(gallery)) {
		throw new Error(`[initThumbs]: Gallery "${innGallery}" not found in DOM or not HTMLElement...`);
	}

	// Collect all valid media elements (pictures and standalone images)
	const mediaItems = collectMediaItems(gallery);

	if (mediaItems.length === 0) {
		initLog("warn", {
			component: "initThumbs",
			message: "the mediaItems array is empty",
			details: { gallery },
		});

		return;
	}

	// Initialize modal system with media data
	const modal = createModalController(mediaItems, { thumbsFolderName });

	// Delegate clicks from the gallery container.
	gallery.addEventListener("click", (event) => {
		const target = event.target;

		// Ignore clicks whose target is not an Element.
		if (!(target instanceof Element)) {
			return;
		}

		// Prefer <picture>; otherwise, use a standalone <img>.
		const mediaItem =
			target.closest("picture") ??
			target.closest("img")

		// Ignore clicks outside the gallery's media items.
		if (!mediaItem || !gallery.contains(mediaItem)) return;

		const index = mediaItems.indexOf(mediaItem);
		if (index !== -1) {
			//!The `void` operator explicitly indicates that the returned `Promise` is not expected here.
			void modal.open(index);
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
	/** @type {HTMLElement[]} */
	const elements = getElements(
		"picture, img",
		gallery,
		true,
		false,
		false
	);

	//filtering "PICTURE" Elements and standalone images (out of img inside "PICTURE"
	//keeping the same order of images inside gallery list...
	return elements.filter(
		element =>
			element.tagName === "PICTURE" ||
			!element.closest("picture")
	);
}

/**
 *
 * @param {TModalImageParams} params
 * @param {"left"|"right"} direction - "left", "right"
 *
 */
function initMediaNavigationHandler(params, direction) {
	if (!params?.state || !params?.items) {
		console.error("[initMediaNavigationHandler]: Critical data missing!", params);
		return () => {}; // Возвращаем безопасную "заглушку"
	}

	const {state, items} = params;
	return async () => {
		// Reading the current index at the moment of the click
		const curIndex = state.currentIndex;

		if (state.isLoading || curIndex === null) return;

		try {
			await showImage(calculateNavIndex(curIndex, items.length, direction), params);
		}
		catch (error) {
			console.error('[Modal] Navigation failed:', error);
		}
	}
}

/**
 * Displays the image at the specified index.
 * @param {number} index
 * @param {TModalImageParams} params
 * @returns {Promise<void>}
 */
async function showImage(index, params) {
	const {
		state,
		dom,
		items,
		thumbsFolderName
	} = params;

	if (!Number.isInteger(index) || index < 0 || index >= items.length) {
		throw new RangeError(`[showImage]: Invalid image index: ${index}`);
	}

	if (index === state.currentIndex && dom.currentImage) return;

	state.currentIndex = index;
	state.isLoading = true;

	const item = items[index];
	dom.counter.textContent = formatCounter(index, items.length, getAltText(item));

	// Fade out previous
	if (dom.currentImage) {
		dom.currentImage.style.opacity = "0";
		await delay(200);
		dom.currentImage.remove();
		dom.currentImage = null;
	}

	// Show loader
	dom.viewport.innerHTML =
		`<div class="${MODAL_LOADER_CLASSNAME}"></div>`;

	try {
		const {
			element,
			naturalSize
		} = await loadHiResImage(item, thumbsFolderName);

		const currentImage = element;
		dom.currentImage = currentImage;

		const dims = calculateViewportDimensions(
			naturalSize.width,
			naturalSize.height,
			dom.root
		);

		applyViewportDimensions(dom.viewport, dims);

		dom.viewport.innerHTML = '';
		dom.viewport.appendChild(dom.currentImage);

		requestAnimationFrame(() => {
			currentImage.classList.add(IS_LOADED);
			state.isLoading = false;
		});

	}
	catch (error) {
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


/**
 * Opens the modal and displays the image at the specified index.
 *
 * @param {number} index
 * @param {TModalHandlers} handlers
 * @param {TModalImageParams} params
 * @returns {Promise<void>}
 */
async function openModal(index, handlers, params) {
	const {
		state,
		dom,
	} = params;

	if (state.isOpen) return;
	state.isOpen = true;

	document.body.style.overflow = "hidden";
	document.body.appendChild(dom.root);

	attachModalListeners(dom.root, handlers);

	try {
		await showImage(index, params);
	}
	catch (error) {
		console.error('[Modal] Failed to open:', error);
	}
}

/**
 *
 * @param {TModalHandlers} handlers
 * @param {TModalImageParams} params
 * @returns {Promise<void>}
 */
async function closeModal(handlers, params) {

	if (!params?.state || !params?.dom) {
		initLog("error", {
			component: "closeModal",
			message: "state or dom is undefined...",
			details: {
				state: params?.state,
				dom: params?.dom,
			}
		})

		throw new Error("state or dom is undefined at closeModal()...");
	}
	const {state, dom} = params;

	if (!state.isOpen) return;

	detachModalListeners(dom.root, handlers);
	await cleanupModal(params, FADE_DURATION);

	state.isOpen = false;
}

/**
 * Creates the modal controller with all functionality.
 * Refactored for lower complexity - helper functions moved to funcsDOM.
 *
 * @param {HTMLElement[]} items - Array of media elements
 * @param {TModalControllerConfig} config - Configuration object
 * @returns {{open: Function}} Modal controller with open method
 */
function createModalController(items, config) {
	const state = createModalState();
	const dom = buildModalDOM();
	const mediaLength = items.length;
	const { thumbsFolderName } = config;

	if (!mediaLength) {
		initLog("warn", {
			component: "createModalController",
			message: `the given media items list is empty...`,
			details: items,
		});
	}

	/**@type TModalImageParams */
	const modalImageParams = {
		state,
		dom,
		items,
		thumbsFolderName
	}

	const navigatePrev = initMediaNavigationHandler(
		modalImageParams,
		"left"
	);
	const navigateNext = initMediaNavigationHandler(
		modalImageParams,
		"right"
	);
	const touch = initTouchHandling(
		dom.root,
		navigatePrev,
		navigateNext
	);

	// Create handlers with bound callbacks
	const { handleKeydown, handleClick } = createModalHandlers({
		close: () => closeModal(handlers, modalImageParams),
		prev: () => navigatePrev(),
		next: () => navigateNext()
	});

	/**@type TModalHandlers*/
	const handlers = {
		handleClick,
		handleKeydown,
		touch
	}

	/**
	 *
	 * @param {number} index of the image clicked
	 * @return {Promise<void>}
	 */
	async function openModalImage(index) {
		await openModal(index, handlers, modalImageParams);
	}
	return { open: openModalImage };
}

//////// DOM BUILDING ////////

/**
 * Builds modal DOM structure with all necessary elements.
 * Uses createElementWithClass from funcsDOM.js for consistency.
 *
 * @returns {TModalDOM} Modal DOM elements reference object
 */
function buildModalDOM() {
	const root = /** @type {HTMLDivElement} */ (
		createElementWithClass("div", MODAL_CLASSNAME)
	);


	// Top bar with counter and close button
	const header = createElementWithClass("div", MODAL_BAR_CLASSNAME);
	const counter = /** @type {HTMLSpanElement} */ (
		createElementWithClass("span", MODAL_COUNTER_CLASSNAME)
	);
	const closeBtn = createModalButton("×", "close", true);

	header.append(counter, closeBtn);

	// Navigation arrows (left/right)
	const navBar = createElementWithClass(
		"div",
		MODAL_BAR_CLASSNAME,
		MODAL_BAR_ARROW_CLASSNAME
	);
	const prevBtn = createModalButton("‹", "prev");
	const nextBtn = createModalButton("›", "next");

	navBar.append(prevBtn, nextBtn);

	// Main viewport for images
	const viewport = createElementWithClass("div", MODAL_VIEWPORT_CLASSNAME);

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
 * @param {string} symbol - Button text or icon.
 * @param {"close" | "prev" | "next"} action - Button action.
 * @param {boolean} [isAbsolute=false] - Whether the button is absolutely positioned.
 * @returns {HTMLButtonElement}
 */
function createModalButton(symbol, action, isAbsolute = false) {
	const btn = createElementWithClass(
		"button",
		MODAL_BUTTON_CLASSNAME,
		`${MODAL_BUTTON_CLASSNAME}--${action}`
	);
	btn.textContent = symbol;
	btn.dataset.action = action;
	btn.type = "button";
	btn.setAttribute(
		"aria-label",
		action === "close"
			? "Close modal"
			: action === "prev"
				? "Previous image"
				:	"Next image");

	if (isAbsolute) {
		btn.style.position = "absolute";
	}

	return btn;
}

//////// IMAGE LOADING ////////

/**
 * Loads an image URL and returns its natural dimensions.
 *
 * @param {string} url
 * @returns {Promise<{width: number, height: number}>}
 */
function loadImagePromise(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();

		image.onload = () => resolve({
			width: image.naturalWidth,
			height: image.naturalHeight,
		});

		image.onerror = () => {
			reject(new Error(`Failed to load image: ${url}`));
		};

		image.src = url;
	});
}

/**
 * Loads the high-resolution image, falling back to the thumbnail.
 *
 * @param {string} hiResUrl
 * @param {string} thumbnailUrl
 * @returns {Promise<{
 *   url: string,
 *   naturalSize: {width: number, height: number}
 * }>}
 */
async function loadWithFallback(hiResUrl, thumbnailUrl) {
	if (hiResUrl === thumbnailUrl) {
		return {
			url: thumbnailUrl,
			naturalSize: await loadImagePromise(thumbnailUrl),
		};
	}

	try {
		return {
			url: hiResUrl,
			naturalSize: await loadImagePromise(hiResUrl),
		};
	} catch {
		return {
			url: thumbnailUrl,
			naturalSize: await loadImagePromise(thumbnailUrl),
		};
	}
}

/**
 * Rewrites source candidates inside the cloned picture element.
 *
 * @param {HTMLElement} clone
 * @param {string} thumbsFolder
 */
function updatePictureSources(clone, thumbsFolder) {
	if (clone.tagName !== "PICTURE") return;

	const sources = getElements("source[srcset]", clone);

	sources.forEach((source) => {
		const srcset = source.getAttribute("srcset");
		if (!srcset) return;

		source.setAttribute(
			"srcset",
			replaceFilePath(srcset, thumbsFolder),
		);
	});
}

/**
 *
 * @param {HTMLElement} original
 * @return {HTMLElement}
 */
function getCleanedClone(original) {
	const clone = /** @type {HTMLElement} */ (
		original.cloneNode(true)
	);

	clone.classList.add(MODAL_IMAGE);

	clone.removeAttribute("width");
	clone.removeAttribute("height");
	clone.removeAttribute("loading");
	clone.removeAttribute("decoding");

	return clone;
}

/**
 * Returns the image element inside an img or picture element.
 *
 * @param {HTMLElement} element
 * @returns {HTMLImageElement}
 */
function getImageElement(element) {
	const image = element.tagName === "IMG"
		? /** @type {HTMLImageElement} */ (element)
		: getDOMElement("img", element, true);

	if (!image || !(image instanceof HTMLImageElement)) {
		throw new Error(
			"[getImageElement]: Expected an img or picture containing an img.",
		);
	}

	return image;
}


/**
 * Loads the high-resolution image, falling back to the thumbnail if needed.
 *
 * @param {HTMLElement} original
 * @param {string} thumbsFolder
 * @returns {Promise<{
 *   element: HTMLElement,
 *   naturalSize: {width: number, height: number}
 * }>}
 */
async function loadHiResImage(original, thumbsFolder) {
	const clone = getCleanedClone(original);
	const sourceImg = getImageElement(original);
	const mainImg = getImageElement(clone);

	const thumbnailUrl = sourceImg.currentSrc || sourceImg.src;
	const hiResUrl = replaceFilePath(thumbnailUrl, thumbsFolder);

	const { url, naturalSize } = await loadWithFallback(
		hiResUrl,
		thumbnailUrl,
	);

	if (url === hiResUrl) {
		updatePictureSources(clone, thumbsFolder);
	}

	mainImg.src = url;
	mainImg.width = naturalSize.width;
	mainImg.height = naturalSize.height;

	return { element: clone, naturalSize };
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
//TODO: to validate imgWidth and imgHeight...

	// Get modal styles for padding calculations
	const modalStyles = window.getComputedStyle(modal);
	const paddingX = parseFloat(modalStyles.paddingLeft) + parseFloat(modalStyles.paddingRight);
	const paddingY = parseFloat(modalStyles.paddingTop) + parseFloat(modalStyles.paddingBottom);

	// Available space for image (use full modal space minus padding)
	const availableWidth = modal.clientWidth - paddingX;
	const availableHeight = modal.clientHeight - paddingY;

	const scale = Math.min(
		1,
		availableWidth / imgWidth,
		availableHeight / imgHeight,
		MODAL_MAX_WIDTH / imgWidth,
		MODAL_MAX_HEIGHT / imgHeight
	);

	return {
		width: Math.round(imgWidth * scale),
		height: Math.round(imgHeight * scale)
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
 * @param {HTMLElement} element
 * @param {() => void} onSwipeLeft
 * @param {() => void} onSwipeRight
 * @returns {TTouchController}
 */
function initTouchHandling(element, onSwipeLeft, onSwipeRight) {
// Вытаскиваем реальный конструктор из Interop-объекта Webpack
	// Кастим к any, чтобы TS не ругался на отсутствие свойства .default в типах библиотеки
	const LibTarget = /** @type {*} */ (TouchSweep);
	const Constructor = LibTarget.default || LibTarget;

	const handler = new Constructor(
		element,
		{},
		SWIPE_THRESHOLD
	);

	// TouchSweep fires custom events on the element
	const handleSwipeLeft = () => onSwipeLeft();
	const handleSwipeRight = () => onSwipeRight();

	return {
		bind() {
			handler.bind();
			element.addEventListener("swipeleft", handleSwipeLeft);
			element.addEventListener("swiperight", handleSwipeRight);
		},

		unbind() {
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