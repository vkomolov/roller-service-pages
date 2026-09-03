"use strict";

/**
 * @file initialSelectors.js
 * @description Initial Data with selectors
 */

//*** TYPE DEFINITIONS ***//

/**
 * TBurgerElements DOM elements required by the navigation menu.
 *
 * @typedef {Object} TBurgerElements
 * @property {Element} navMenuFixed
 * @property {Element} burgerHidden
 * @property {Element} burgerFixed
 * @property {Element[]} burgerNavAll
 */

/**
 * TDOMSelectorConfig: Configuration for a generic DOM element lookup.
 *
 * @typedef {Object} TDOMSelectorConfig
 * @property {string} key - Property name used in the resulting object.
 * @property {string} selector - CSS selector used to find the element(s).
 * @property {boolean} [multiple=false] - Whether all matching elements should be returned.
 */

/**
 * TNavMenuSelector: Configuration for navigation menu DOM element lookup.
 *
 * Specializes the generic selector configuration by restricting `key`
 * to the known properties of `TBurgerElements`.
 *
 * @typedef {Omit<TDOMSelectorConfig, "key"> & {
 *     key: keyof TBurgerElements
 * }} TNavMenuSelector
 */

/**
 * Page names defined by the linkAnchors registry.
 *
 * @typedef {keyof typeof linkAnchors} TPageName
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

export const linkClassNameActive = "active";
export const navLinkSelector = ".nav-link";
export const navHexagonSelector = ".hexagon-comb-block__cell";

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

export const gallerySelector = "#gallery-work";
export const galleryThumbsFolderName = "thumbs";

// ============================================
// ANIMATIONS SELECTORS
// ============================================

/** @type {Object.<string, string>} Animation selectors map */
export const SELECTORS = {
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
	galleryWork: "#gallery-work",
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


