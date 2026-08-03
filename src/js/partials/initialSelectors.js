"use strict";

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
	burgerNavAll: ".burger_nav",  //multiple elements
	burgerFixed: ".burger_nav:not(.hidden)",
	burgerHidden: ".burger_nav.hidden",
	navMenuHidden: ".header__nav.abs",
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

export const