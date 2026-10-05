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
 * @typedef {import("./types/dom.types.js").TNavLinkParams} TNavLinkParams
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


/**
 *
 * @param {TNavLinkParams} params
 *
 * @return {TActivateNavlinkParams}
 */
function getNavLinkParams(params) {
	const { navLinkSelector, pageType, activeClass, anchorLink } = params;

	return {
		navLinkSelector,
		pageType,
		activeClass,
		anchorLink,
	}
}

// ============================================
// DOM READY
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
	const pageType = document.body.dataset.type || "";
	const isIn = isKeyOf(linkAnchors, pageType);

	const navLinkParams = getNavLinkParams({
		navLinkSelector: SELECTORS.navLinkSelector,
		pageType,
		activeClass: linkClassNameActive,
		anchorLink: isIn ? linkAnchors[pageType] : "#"
	});

	const navLinkParamsHexagon = getNavLinkParams({
		navLinkSelector: SELECTORS.navHexagonSelector,
		pageType,
		activeClass: linkClassNameActive,
		anchorLink: isIn ? linkAnchors[pageType] : "#",
	});


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