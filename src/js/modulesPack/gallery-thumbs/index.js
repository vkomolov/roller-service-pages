"use strict";

import TouchSweep from "touchsweep";
import {
	createElementWithClass,
	replaceFilePath,
	createModalState,
	createModalHandlers,
	calculateNavIndex,
	attachModalListeners,
	detachModalListeners,
	cleanupModal
} from "../../helpers/funcsDOM.js";

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
export async function initThumbs(gallerySelector, thumbsFolder = THUMBS_FOLDER) {
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
	const modal = createModalController(mediaItems, { thumbsFolder });

	// Delegated click handler on gallery container
	gallery.addEventListener("click", (event) => {
		const mediaItem = event.target.closest("picture, img");

		// Ignore if click wasn't on a media element or if img is inside picture
		if (!mediaItem || (mediaItem.tagName === "IMG" && mediaItem.closest("picture"))) {
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
	const state = createModalState();
	const dom = buildModalDOM();
	const touch = initTouchHandling(dom.root, navigatePrev, navigateNext);

	// Navigation functions
	async function navigatePrev() {
		if (state.isLoading) return;
		try {
			await showImage(calculateNavIndex(state.currentIndex, items.length, 'prev'));
		} catch (error) {
			console.error('[Modal] Navigation failed:', error);
		}
	}

	async function navigateNext() {
		if (state.isLoading) return;
		try {
			await showImage(calculateNavIndex(state.currentIndex, items.length, 'next'));
		} catch (error) {
			console.error('[Modal] Navigation failed:', error);
		}
	}

	// Create handlers with bound callbacks
	const { handleKeydown, handleClick } = createModalHandlers(dom, state, {
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
			const { element, naturalSize } = await loadHiResImage(item, config.thumbsFolder);

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

		attachModalListeners(dom.root, handleClick, handleKeydown, touch);

		try {
			await showImage(startIndex);
		} catch (error) {
			console.error('[Modal] Failed to open:', error);
		}
	}

	async function closeModal() {
		if (!state.isOpen) return;
		state.isOpen = false;

		detachModalListeners(dom.root, handleClick, handleKeydown, touch);
		await cleanupModal(dom, state);
	}

	return { open: openModal };
}

//////// DOM BUILDING ////////

/**
 * Builds modal DOM structure with all necessary elements.
 * Uses createElementWithClass from funcsDOM for consistency.
 *
 * @returns {Object} Modal DOM elements reference object
 */
function buildModalDOM() {
	const root = createElementWithClass("div", MODAL_CLASSNAME);

	// Top bar with counter and close button
	const header = createElementWithClass("div", MODAL_BAR_CLASSNAME);
	const counter = createElementWithClass("span", MODAL_COUNTER_CLASSNAME);
	const closeBtn = createModalButton("×", "close", true);
	header.append(counter, closeBtn);

	// Navigation arrows (left/right)
	const navBar = createElementWithClass("div", MODAL_BAR_CLASSNAME, MODAL_BAR_ARROW_CLASSNAME);
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
 * @param {string} symbol - Button text/icon
 * @param {string} action - Action identifier (close, prev, next)
 * @param {boolean} [isAbsolute=false] - Whether button is absolutely positioned
 * @returns {HTMLButtonElement} Created button element
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
	btn.setAttribute("aria-label", action === "close" ? "Close modal" :
		action === "prev" ? "Previous image" :
			"Next image");

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
	const clone = /** @type {HTMLElement} */ (original.cloneNode(true));
	clone.classList.add(MODAL_IMAGE);

	// Remove fixed dimensions from thumbnail
	clone.removeAttribute("width");
	clone.removeAttribute("height");

	// Remove lazy loading - not needed in modal
	clone.removeAttribute("loading");
	clone.removeAttribute("decoding");

	// Get main image element
	/** @type {HTMLImageElement|null} */
	const mainImg = clone.tagName === "IMG"
		? /** @type {HTMLImageElement} */ (clone)
		: clone.querySelector("img");

	if (!mainImg) {
		throw new Error("No image element found in clone");
	}

	// Get original src and calculate hi-res URL
	const originalSrc = mainImg.getAttribute("src");
	const hiResUrl = replaceFilePath(originalSrc, thumbsFolder);

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
		sources.forEach((src) => {
			if (src.hasAttribute("srcset")) {
				const srcsetUrl = replaceFilePath(src.getAttribute("srcset"), thumbsFolder);
				src.setAttribute("srcset", srcsetUrl);
			}
		});
	}

	return { element: clone, naturalSize };
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

		img.addEventListener("load", onLoad, { once: true });
		img.addEventListener("error", onError, { once: true });

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
	const handler = new TouchSweep.default(element, {}, SWIPE_THRESHOLD);

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