'use strict';

/**
 * @file index.js
 * @description
 * Entry point. Initializes non-GSAP UI components,
 * registers lazy Masonry layout handling, then initializes
 * GSAP animations and the language switcher.
 */


/**
 *! DOM type aliases used by this module.
 *
 * @typedef {import("./types/dom.types.js").TActivateNavlinkParams} TActivateNavlinkParams
 *
 */

import {
	activateNavLink,
	initLangSwitcher,
	initMasonry, getDOMElement, isHTMLElement
} from "./helpers/funcsDOM.js";

import {
	linkAnchors,
	SELECTORS,
	linkClassNameActive,
	langSwitchData,
	galleryThumbsFolderName,
	masonryConfig
} from "./partials/initialSelectors.js";

import { initThumbs } from "./modulesPack/gallery-thumbs/index.js";
import { initAnimations } from "./partials/animations.js";
import { isKeyOf } from "./helpers/funcs.js";

// ============================================
// DOM READY
// ============================================
document.addEventListener("DOMContentLoaded", () => {
	const pageType = document.body.dataset.type || "";
	const isIn = isKeyOf(linkAnchors, pageType);

	/** @type {TActivateNavlinkParams} */
	const navLinkParams = {
		navLinkSelector: SELECTORS.navLinkSelector,
		pageType,
		activeClass: linkClassNameActive,
		anchorLink: isIn ? linkAnchors[pageType] : "#"
	};

	/** @type {TActivateNavlinkParams} */
	const navLinkParamsHexagon = {
		navLinkSelector: SELECTORS.navHexagonSelector,
		pageType,
		activeClass: linkClassNameActive,
		anchorLink: isIn ? linkAnchors[pageType] : "#",
	};

	try {
		// Navigation & Language (non-GSAP, immediate)
		activateNavLink(navLinkParams);
		activateNavLink(navLinkParamsHexagon);
		//initializing language switcher...
		initLangSwitcher(langSwitchData);

// Initialize Masonry (non-GSAP, lazy)
		const galleryContainer = getDOMElement(
			SELECTORS.gallerySelector,
			document,
			false,
		);

		const lazyInit = async () => {
			// Removing the listener immediately so as not to react to subsequent scrolls
			window.removeEventListener("scroll", lazyInit);

			try {
				// Initializing the Masonry layout
				if (isHTMLElement(galleryContainer)) {
					initMasonry(
						galleryContainer,
						masonryConfig,
					);
				}
				//Downloading the GSAP chunk and trigger the animations:
				await initAnimations();


				//await initThumbs(gallerySelector, galleryThumbsFolderName);

			}
			catch (lazyError) {
				console.error("[LazyInit]: failed:", lazyError);
			}
		}

		//attaching the listener to the first scroll.
		//{ passive: true } is critical - it optimizes scrolling for the browser
		//If true, the listener will be automatically removed after being called.
		window.addEventListener("scroll", lazyInit, { passive: true });
	}
	catch (error) {
		console.error("[DOMContentLoaded]: initialization failed:", error);
	}
});