"use strict";

/**
 * @file animations.js
 * @description GSAP animation factory integrated with gsap-loader.js caching.
 * All animations are registered in the global gsap-loader cache so they can
 * be killed individually or in bulk. No local WeakMap is used anymore.
 */

import { createMasonry, setAttributes, requireElements, logInitError } from "../helpers/funcsDOM.js";
import { cacheAnimation, getGSAP } from "./gsap-loader.js";
import { isKeyOf } from "../helpers/funcs.js";
import { gallerySelector, SELECTORS } from "./initialSelectors.js";

// ============================================
//****** TYPE DEFINITIONS *******//

/**
 *
 * @typedef {{
 *   automation: () => {},
 *   common: () => {}
 * }} TPageAnimations
 *
 */

/**
 * @typedef {{
 * burgerHiddenSingle: Element,
 * burgerFixedSingle: Element,
 * navMenuFixedSingle: Element,
 * burgerNavAll: Element[],
 * }} TBurgerElements
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Checks if a GSAP timeline has real (non-zero duration) animations.
 *
 * @param {gsap.core.Timeline|gsap.core.Tween} timeline - The timeline to check
 * @returns {boolean} True if at least one child tween has duration > 0
 */
function hasRealAnimations(timeline) {
	return timeline.getChildren().some(child => child.duration() > 0);
}

// ============================================
// SCROLL TIMELINE BUILDERS
// ============================================

/**
 * Creates a scroll-triggered timeline with fade-in from opacity 0.
 * The resulting timeline is automatically cached via gsap-loader.js.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {HTMLElement} elem - Target element
 * @param {HTMLElement} triggerElem - ScrollTrigger trigger element
 * @param {Object} gsapToParams - Parameters for gsap.to (fade in)
 * @param {Object} gsapFromParams - Parameters for gsap.from (entrance motion)
 * @param {string} [nextAnimePos="<"] - Timeline position for second tween
 * @returns {gsap.core.Timeline|false} Created timeline or false if invalid
 */
function getScrollTimelineTwoTweens(gsap, elem, triggerElem, gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
	if (!(elem instanceof HTMLElement) || !(triggerElem instanceof HTMLElement)) {
		console.warn(`getScrollTimelineTwoTweens: invalid element (${elem}) or trigger (${triggerElem})`);
		return false;
	}

	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: triggerElem,
			start: "top 80%",
			toggleActions: "play none none reverse",
			preventOverlaps: true,
		}
	});

	tl.to(elem, { ...gsapToParams });
	tl.from(elem, { ...gsapFromParams }, nextAnimePos);

	// Register in gsap-loader cache; kills previous animation for this element automatically
	cacheAnimation(tl, elem);
	return tl;
}

/**
 * Creates multiple scroll-triggered timelines for an array of elements.
 * Each timeline is cached against its element via gsap-loader.js.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {HTMLElement[]} elemsArr - Array of target elements
 * @param {HTMLElement|null} triggerElem - Common trigger element (or null for per-element)
 * @param {string} propKey - Prefix for timeline keys in result object
 * @param {Object} gsapToParams - Parameters for gsap.to
 * @param {Object} gsapFromParams - Parameters for gsap.from
 * @param {string} [nextAnimePos="<"] - Timeline position
 * @returns {Object.<string, gsap.core.Timeline>} Object with timeline references
 */
function getAllScrollTwoTweens(gsap, elemsArr, triggerElem, propKey = "tlKey", gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
	const tlObj = {};
	let trigger = null;

	if (!Array.isArray(elemsArr)) {
		console.error(`getAllScrollTwoTweens: elemsArr is not an Array`);
		return tlObj;
	}

	if (triggerElem !== null) {
		if (!(triggerElem instanceof HTMLElement) || !document.body.contains(triggerElem)) {
			console.error(`getAllScrollTwoTweens: invalid trigger element`);
			return tlObj;
		}
		trigger = triggerElem;
	}

	elemsArr.forEach((elem, index) => {
		if (!(elem instanceof HTMLElement) || !document.body.contains(elem)) {
			console.warn(`getAllScrollTwoTweens: element at index ${index} is invalid`);
			return;
		}

		const tlKey = `${propKey}_${index}`;
		const tl = getScrollTimelineTwoTweens(gsap, elem, trigger || elem, gsapToParams, gsapFromParams, nextAnimePos);

		if (tl && hasRealAnimations(tl)) {
			tlObj[tlKey] = tl;
		}
	});

	return tlObj;
}

// ============================================
// BUILDER FUNCTIONS (accept gsap instance)
// ============================================

/**
 * Builds the hero section entrance animation timeline.
 * Cached globally so it can be killed on page transition.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @returns {gsap.core.Timeline} Hero animation timeline
 */
function buildHeroAnimation(gsap) {
	const tlHero = gsap.timeline();

	tlHero.to(SELECTORS.headingAccentHero, { opacity: 1, duration: 2, delay: 0.3 });
	tlHero.from(SELECTORS.headingAccentHero, { x: 80, duration: 0.8, ease: "circ.out" }, "<");
	tlHero.to(SELECTORS.headingHeroRest, { opacity: 1, duration: 2 }, "<");
	tlHero.from(SELECTORS.headingHeroRest, { x: -80, duration: 0.8, ease: "circ.out" }, "<");
	tlHero.to(SELECTORS.textBlockHero, { opacity: 1, duration: 2 }, "-=1.5");
	tlHero.from(SELECTORS.textBlockHero, { y: 80, duration: 0.8, ease: "circ.out" }, "<");
	tlHero.to(SELECTORS.biddingBlockHero, { opacity: 1, duration: 2 }, "<+0.3");
	tlHero.from(SELECTORS.biddingBlockHero, { y: 40, duration: 0.8, ease: "circ.out" }, "<");
	tlHero.to(SELECTORS.iconWrapperHero, { scale: 1, duration: 1.5, ease: "elastic.out" }, "<+0.2");

	cacheAnimation(tlHero);
	return tlHero;
}

/**
 * Builds the scrolled navigation show/hide animation.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {typeof import('gsap/ScrollTrigger').ScrollTrigger} ScrollTrigger - ScrollTrigger plugin
 */
function buildScrolledNav(gsap, ScrollTrigger) {
	const target = document.querySelector(SELECTORS.scrolledNav);
	if (!target) return;

	const tween = gsap.to(target, {
		top: -10,
		duration: 0.7,
		ease: "back.out(1.5)",
		delay: 0.5,
		scrollTrigger: {
			trigger: SELECTORS.benefitsSection,
			start: "top 5%",
			toggleActions: "play none none reverse",
			preventOverlaps: true,
		}
	});

	cacheAnimation(tween, target);
}

/**
 * Builds a parallax background effect using ScrollTrigger scrub.
 * Cached against the target element.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {typeof import('gsap/ScrollTrigger').ScrollTrigger} ScrollTrigger - ScrollTrigger plugin
 * @param {string} targetSelector - Selector for the parallax target
 * @param {string} triggerSelector - Selector for the trigger container
 * @returns {gsap.core.Tween|undefined} The parallax tween or undefined if elements missing
 */
function buildParallax(gsap, ScrollTrigger, targetSelector, triggerSelector) {
	const target = document.querySelector(targetSelector);
	const trigger = document.querySelector(triggerSelector);

	if (!target || !trigger) return;

	const tween = gsap.fromTo(target,
		{ yPercent: 10 },
		{
			yPercent: -10,
			ease: "none",
			scrollTrigger: {
				trigger,
				start: "top bottom",
				end: "bottom top",
				scrub: 1.5,
				invalidateOnRefresh: true,
			}
		}
	);

	//caching Tween to js/partials/gsap-loader.js
	cacheAnimation(tween, target);
	return tween;
}

/**
 * Builds fade-in animations for elements matching a selector.
 * Each element's timeline is cached individually.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {string} selector - CSS selector for target elements
 * @param {string} propKey - Key prefix for timeline references
 * @param {Object} fromParams - gsap.from parameters (entrance motion)
 * @returns {Object.<string, gsap.core.Timeline>} Timeline references object
 */
function buildFadeAnimations(gsap, selector, propKey, fromParams) {
	return getAllScrollTwoTweens(
		gsap,
		gsap.utils.toArray(document.querySelectorAll(selector)),
		null,
		propKey,
		{ opacity: 1, duration: 0.7, delay: 0.2 },
		fromParams
	);
}

/**
 * Builds gallery image fade-in animations.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @param {HTMLElement[]} elemsArr - Gallery image elements
 * @returns {Object.<string, gsap.core.Timeline>} Timeline references
 */
function buildGalleryFade(gsap, elemsArr) {
	return getAllScrollTwoTweens(
		gsap,
		elemsArr,
		document.querySelector(SELECTORS.galleryWork),
		"fadeInGallery",
		{ opacity: 1, duration: 0.8, delay: 0.2 },
		{ scale: 0.7, duration: 1, ease: "back.out" }
	);
}

// ============================================
// BURGER MENU (returns handlers + tween)
// ============================================

/**
 * separate function for {@link createBurgerHandlers}
 * @return {TBurgerElements}
 */
const getSingleBurgerElements = () => {
	const {
		navMenuFixed,
		burgerHidden,
		burgerFixed,
		burgerNavAll
	} = requireElements([
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
			selector: SELECTORS.burgerNavAll,
			multiple: true,
		}
	]);

	//for jsDoc type checking Element... not Element[]
	const navMenuFixedSingle = Array.isArray(navMenuFixed) ? navMenuFixed[0] : navMenuFixed;
	const burgerFixedSingle = Array.isArray(burgerFixed) ? burgerFixed[0] : burgerFixed;
	const burgerHiddenSingle = Array.isArray(burgerHidden) ? burgerHidden[0] : burgerHidden;
	const burgerNavAllArr = Array.isArray(burgerNavAll) ? burgerNavAll : [burgerNavAll];

	return {
		navMenuFixedSingle,
		burgerFixedSingle,
		burgerHiddenSingle,
		burgerNavAll: burgerNavAllArr,
	}
}

/*function openBurger() {
	document.addEventListener("click", closeBurgerHandler);
}

function closeBurger() {
	document.removeEventListener("click", closeBurgerHandler);
}*/


/**
 * separate function for {@link createBurgerHandlers}
 * @param {Element} burger
 * @param {TBurgerElements} burgerElements
 * @param {gsap.core.Tween} navMenuAnime
 *
 * @returns {void}
 */
function initBurgerListener(burger, burgerElements, navMenuAnime)  {
	const {
		burgerHiddenSingle, burgerFixedSingle, navMenuFixedSingle
	} = burgerElements;
	burger.addEventListener("click", (e) => {
		if (!(e.target instanceof Element)) {
			return;
		}

		const burgerMenu = e.target.closest(SELECTORS.burgerNavAll);
		if (!burgerMenu) return;

		e.preventDefault();
		const isExpanded = burger.getAttribute("aria-expanded") === "true";

		setAttributes([burgerHiddenSingle, burgerFixedSingle, navMenuFixedSingle], {
			"aria-expanded": !isExpanded,
		});

		if (isExpanded) {
			burgerHiddenSingle.classList.remove("opened");
			burgerFixedSingle.classList.remove("opened");

			document.documentElement.style.scrollbarGutter = "initial";
			document.body.style.scrollbarGutter = "initial";
			document.body.style.overflow = "auto";

			navMenuAnime.reverse();
		}
		else {
			burgerHiddenSingle.classList.add("opened");
			burgerFixedSingle.classList.add("opened");
			document.documentElement.style.scrollbarGutter = "stable";
			document.body.style.scrollbarGutter = "stable";
			document.body.style.overflow = "hidden";

			navMenuAnime.play();
		}
	});
}

/**
 * Handles burger menu click in {@link createBurgerHandlers}
 *
 * Closes the burger navigation when the user clicks outside
 * of the burger navigation area.
 *
 * @param {MouseEvent} e - Mouse click event.
 * @param {TBurgerElements} burgerElements
 * @param {GSAPTween} navMenuAnime
 *
 * @returns {void}
 */
function closeBurgerClickHandler(e, burgerElements, navMenuAnime) {
	// Ensure the event target is a DOM element.
	if (!(e.target instanceof Element)) {
		return;
	}

	// Ignore clicks inside the burger navigation.
	if (e.target.closest(SELECTORS.burgerNavAll)) {
		return;
	}

	const {
		burgerHiddenSingle, burgerFixedSingle, navMenuFixedSingle
	} = burgerElements;

	const isNavActive =
		navMenuFixedSingle.getAttribute("aria-expanded") === "true";

	if (!isNavActive) {
		return;
	}

	// Changing aria-expanded for both burger menu buttons and the fixed navigation menu

	setAttributes(
		[burgerHiddenSingle, burgerFixedSingle, navMenuFixedSingle],
		{
			"aria-expanded": false,
		}
	);

	burgerHiddenSingle.classList.remove("opened");
	burgerFixedSingle.classList.remove("opened");

	/// animation of hiding the fixed navigation menu with top: -100%;
	navMenuAnime.reverse();
	//navMenuAnime.reversed(!navMenuAnime.reversed()); //toggle of animation
	document.body.style.overflow = "auto";
}

/**
 * Creates burger menu animation and event handlers.
 * The open/close tween is cached against the nav menu element.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @returns {{burgerNavAll: Element[], closeBurgerHandler: Function, attachBurgerListener: Function}}
 */
function createBurgerHandlers(gsap) {
//// ============================================
// DOM REFERENCES (evaluated once at module load)
// ============================================

	const singleBurgerElements = getSingleBurgerElements();

	const {
	navMenuFixedSingle,
	burgerNavAll
} = singleBurgerElements;

//core.Tween
	const navMenuAnime = gsap.to(navMenuFixedSingle, {
		top: -20,
		duration: 0.8,
		ease: "back.out(0.8)",
		paused: true,
	});

	//caching core.Tween to
	cacheAnimation(navMenuAnime, navMenuFixedSingle);

	/**
	 * @param {MouseEvent} e - Mouse click event.
	 */
	const closeBurgerHandler = (e) => {
		closeBurgerClickHandler(e, singleBurgerElements, navMenuAnime);
	}
	/**
	 *
	 * @param {Element} burger
	 */
	const attachBurgerListener = (burger) => {
		initBurgerListener(
			burger,
			singleBurgerElements,
			navMenuAnime
		);
	}
	return { burgerNavAll, closeBurgerHandler, attachBurgerListener };
}

// ============================================
// MAIN FACTORY
// ============================================


export async function initAnimations() {

	const gsapAll = await getGSAP();
	if (!gsapAll) {
		logInitError({
			component: "initAnimations",
			message: `gsap is not loaded... omitting...`,
			details: gsapAll
		});
		console.warn(`[initAnimations]: gsap is not loaded... omitting...`)
		return;
	}

	const {
		gsap,
		ScrollTrigger
	} = gsapAll;

	const { burgerNavAll, closeBurgerHandler, attachBurgerListener } = createBurgerHandlers(gsap);

	const pageAnimations = {
		automation: () => {
			buildParallax(
				gsap,
				ScrollTrigger,
				SELECTORS.automationParallaxBg,
				SELECTORS.automationParallax
			);
		},

		common: () => {

			buildHeroAnimation(gsap);
			buildParallax(gsap, ScrollTrigger, SELECTORS.servicesParallaxBg, SELECTORS.servicesParallax);
			buildFadeAnimations(gsap, SELECTORS.fadeInLeft, "fadeInLeft", {
				x: -60,
				y: 40,
				duration: 1,
				ease: "circ.out"
			});
			buildFadeAnimations(gsap, SELECTORS.fadeInRight, "fadeInRight", {
				x: 60,
				y: 40,
				duration: 1,
				ease: "circ.out"
			});
			buildFadeAnimations(gsap, SELECTORS.scaleIn, "scaleIn", {
				scale: 0.7,
				duration: 1.2,
				ease: "back.out(1)"
			});
			buildFadeAnimations(gsap, SELECTORS.fadeInUp, "fadeInUp", {
				y: 40,
				duration: 1,
				ease: "circ.out"
			});

			buildScrolledNav(gsap, ScrollTrigger);

			//closing Burger menu when MouseClick fires outside of the Burger menu
			document.addEventListener("click", closeBurgerHandler);
			burgerNavAll.forEach(burger => attachBurgerListener(burger));
		}
	};


	const imageItems = await createMasonry(gallerySelector, { gap: 20 });
	fadeInGallery(imageItems);

		//const timelines = fadeInGallery(imageItems);
		//Object.assign(totalTl, timelines);




	function fadeInGallery(elemsArr = []) {
		return buildGalleryFade(gsap, elemsArr);
	}

	/**
	 * Runs all page animations.
	 * DOM readiness is guaranteed by index.js (DOMContentLoaded),
	 * so no redundant readyState checks are needed here.
	 *
	 * @returns {Object.<string, gsap.core.Timeline|gsap.core.Tween>} Map of all active timelines/tweens
	 */

	/*  function animatePage() {
			return onPageLoaded(pageAnimations);
		}*/

	/**
	 *
	 * @param animationData
	 * @return {void}
	 */
	function onPageLoaded(animationData) {
		const pageName = document.body.dataset.type || "";
		const totalTl = {};
		if (animationData.common) Object.assign(totalTl, animationData.common());
		if (pageName in animationData) Object.assign(totalTl, animationData[pageName]());
		requestAnimationFrame(() => ScrollTrigger.refresh());
	}
}