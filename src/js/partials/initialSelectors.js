"use strict";

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

export const linkAnchors = {
	index: "#about-us",
	gates: "#gatesSection",
	rollers: "#securityShuttersSection",
	automation: "#rollerShuttersAutomation",
	barriers: "#barrierSection",
	awnings: "#awningsSection",
	windows: "#windowSection",
	security: "#securitySurveillanceSection",
};

export const langSwitchData = {
	langSwitcherSelector: "#lang-switcher",
	langSwitcherCurrent: ".lang-switcher__current",
	langSwitcherButton: ".lang-switcher__button",
	langSwitcherItem: ".lang-switcher__item",
	langActiveSelector: ".active",
	langListSelector: "#lang-list",
	langOptionArr: ["uk", "ru"],
	dataSetKey: "lang"
};

export const linkClassNameActive = "active";

// ============================================
// ANIMATIONS SELECTORS
// ============================================

/** @type {Object.<string, string>} Animation selectors map */
export const SELECTORS = {
	gallerySelector: "#gallery-work",
	navLinkSelector: ".nav-link",
	navHexagonSelector: ".hexagon-comb-block__cell",
	scrolledNav: "#scrolledNav",
	burgerNav: ".burger_nav",  //for multiple elements
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
	scaleIn: "[data-anime=scale-in]",
};

/**
 * @type {TNavMenuSelector[]}
 *
 * DOM elements required by Burger navigation handlers.
 */
export const navMenuSelectorsData = [
	{
		key: "navMenuFixed",
		selector: SELECTORS.navMenuFixed,
		multiple: false,
	},
	{
		key: "burgerHidden",
		selector: SELECTORS.burgerHidden,
		multiple: false,
	},
	{
		key: "burgerFixed",
		selector: SELECTORS.burgerFixed,
		multiple: false,
	},
	{
		key: "burgerNavAll",
		selector: SELECTORS.burgerNav,
		multiple: true,
	},
];

///////// MASONRY GALLERY CONSTANTS //////////

/**
 * Default configuration for the work gallery Masonry layout.
 *
 * @type {TMasonryConfig}
 */
export const MASONRY_CONFIG = {
	itemSelector: ".gallery__item",
	gap: 16,
};


//! is used for validateImageAspectRatio() in funcsDOM.js
export const IMAGE_RATIO_TOLERANCE = 0.001;



//! delay for the masonry gallery images to reveal in ms...
export const MASONRY_REVEAL_DELAY = 120;

export const MASONRY_INITIALIZE_MARGIN = "200px 0px"; //"0px"

//is used for initThumbs() at index.js
export const galleryThumbsFolderName = "thumbs";