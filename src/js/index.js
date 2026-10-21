'use strict';

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

import {
	activateNavLink,
	initLangSwitcher,
	initMasonry,
	getDOMElement,
	isHTMLElement,
	observeIntersection,
} from "./helpers/funcsDOM.js";

import {
	linkAnchors,
	SELECTORS,
	linkClassNameActive,
	langSwitchData,
	galleryThumbsFolderName,
	MASONRY_CONFIG,
	MASONRY_INITIALIZE_MARGIN,
} from "./partials/initialSelectors.js";

import { initThumbs } from "./modulesPack/gallery-thumbs/index.js";
import { initAnimations } from "./partials/animations.js";
import { initLog, isKeyOf } from "./helpers/funcs.js";

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

// Locate the gallery without requiring it to exist on every page.
		const galleryContainer = getDOMElement(
			SELECTORS.gallerySelector,
			document,
			false,
		);

		const hasGallery = isHTMLElement(galleryContainer);

		/**
		 *! One IntersectionObserver handles both gallery features.
		 * A positive vertical rootMargin allows initialization shortly
		 * before the gallery enters the visible viewport.
		 */
		if (hasGallery) {
			observeIntersection(galleryContainer, {
				rootMargin: MASONRY_INITIALIZE_MARGIN,
				once: true, //first Intersection

				onEnter: () => {
					// Masonry performs its initial layout immediately.
					try {
						initMasonry(galleryContainer, MASONRY_CONFIG);
					}
					catch (error) {
						initLog("error", {
							component: "initMasonry",
							message: "Failed to initialize Masonry.",
							details: error,
						});
					}

					/**
					 *! Modal initialization is independent of Masonry layout.
					 * Do not await it here: its Promise must not block the
					 * observer callback or other initialization work.
					 */
					initThumbs(
						galleryContainer,
						galleryThumbsFolderName,
					).catch((error) => {
						initLog("error", {
							component: "initThumbs",
							message: "Failed to initThumbs...",
							details: error,
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
			initAnimations().catch((error) => {
				initLog("error", {
					component: "initAnimations",
					message: "Failed to initialize GSAP animations.",
					details: error,
				});
			});
		};


		//attaching the listener to the first scroll.
		//{ passive: true } is critical - it optimizes scrolling for the browser
		//If true, the listener will be automatically removed after being called.
		window.addEventListener("scroll", lazyInitAnimations, {
			passive: true,
			once: true,
		});
	}
	catch (error) {
		initLog("error", {
			component: "DOMContentLoaded",
			message: "Page initialization failed.",
			details: error,
		});
	}
});