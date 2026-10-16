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
document.addEventListener("DOMContentLoaded", async () => {
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

// Initialize Masonry (non-GSAP, lazy)
		const galleryContainer = getDOMElement(
			SELECTORS.gallerySelector,
			document,
			false,
		);

		if (isHTMLElement(galleryContainer)) {
			initMasonry(
				galleryContainer,
				masonryConfig,
			);
		}

		//initializing GSAP animations...
		await initAnimations();

		//initializing language switcher...
		initLangSwitcher(langSwitchData);

		//await initThumbs(gallerySelector, galleryThumbsFolderName);
	}
	catch (error) {
		console.error("[DOMContentLoaded]: initialization failed:", error);
	}
});