"use strict";

/**
 * @file animations.js
 * @description GSAP animation factory integrated with gsap-loader.js caching.
 * All animations are registered in the global gsap-loader cache so they can
 * be killed individually or in bulk. No local WeakMap is used anymore.
 */

import { setAttributes } from "../helpers/funcsDOM.js";
import { cacheAnimation } from "./gsap-loader.js";

// ============================================
// SELECTORS
// ============================================

/** @type {Object.<string, string>} Animation selectors map */
const SELECTORS = {
  scrolledNav: "#scrolledNav",
  burgerBase: ".burger_nav",
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

// ============================================
// DOM REFERENCES (evaluated once at module load)
// ============================================

const navMenuFixed = document.querySelector(SELECTORS.navMenuHidden);
const burgerHidden = document.querySelector(SELECTORS.burgerHidden);
const burgerFixed = document.querySelector(SELECTORS.burgerFixed);
const burgerAll = Array.from(document.querySelectorAll(SELECTORS.burgerBase));

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
 * Creates burger menu animation and event handlers.
 * The open/close tween is cached against the nav menu element.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP instance
 * @returns {{navMenuAnime: gsap.core.Tween, burgerClickHandler: Function, burgerInitListener: Function}}
 */
function createBurgerHandlers(gsap) {
  const navMenuAnime = gsap.to(navMenuFixed, {
    top: -20,
    duration: 0.8,
    ease: "back.out(0.8)",
    paused: true,
  });

  cacheAnimation(navMenuAnime, navMenuFixed);

  const burgerClickHandler = (e) => {
    if (!(e.target.closest(SELECTORS.burgerBase))) {
      const isNavActive = navMenuFixed.getAttribute("aria-expanded") === "true";
      if (isNavActive) {
        setAttributes([burgerHidden, burgerFixed, navMenuFixed], {
          "aria-expanded": !isNavActive,
        });
        burgerHidden.classList.remove("opened");
        burgerFixed.classList.remove("opened");
        navMenuAnime.reverse();
        document.body.style.overflow = "auto";
      }
    }
  };

  const burgerInitListener = (burger) => {
    burger.addEventListener("click", (e) => {
      const burgerMenu = e.target.closest(SELECTORS.burgerBase);
      if (!burgerMenu) return;

      e.preventDefault();
      const isExpanded = burger.getAttribute("aria-expanded") === "true";

      setAttributes([burgerHidden, burgerFixed, navMenuFixed], {
        "aria-expanded": !isExpanded,
      });

      if (isExpanded) {
        burgerHidden.classList.remove("opened");
        burgerFixed.classList.remove("opened");
        document.documentElement.style.scrollbarGutter = "initial";
        document.body.style.scrollbarGutter = "initial";
        document.body.style.overflow = "auto";
        navMenuAnime.reverse();
      } else {
        burgerHidden.classList.add("opened");
        burgerFixed.classList.add("opened");
        document.documentElement.style.scrollbarGutter = "stable";
        document.body.style.scrollbarGutter = "stable";
        document.body.style.overflow = "hidden";
        navMenuAnime.play();
      }
    });
  };

  return { navMenuAnime, burgerClickHandler, burgerInitListener };
}

// ============================================
// MAIN FACTORY
// ============================================

/**
 * Creates all page animations. Must be called AFTER GSAP is dynamically loaded.
 * All animations are registered in gsap-loader.js for centralized cleanup.
 *
 * @param {typeof import('gsap').gsap} gsap - GSAP core instance
 * @param {typeof import('gsap/ScrollTrigger').ScrollTrigger} ScrollTrigger - ScrollTrigger plugin
 * @returns {{animatePage: Function, fadeInGallery: Function}} Animation API
 *
 * @example
 * const { gsap, ScrollTrigger } = await getGsap();
 * const { animatePage, fadeInGallery } = createAnimations(gsap, ScrollTrigger);
 * const totalTl = animatePage();
 */
export function createAnimations(gsap, ScrollTrigger) {
  const { burgerClickHandler, burgerInitListener } = createBurgerHandlers(gsap);

  const pageAnimations = {
    automation: () => {
      const tlData = {};
      const rollerParallax = buildParallax(gsap, ScrollTrigger, SELECTORS.automationParallaxBg, SELECTORS.automationParallax);
      if (rollerParallax) tlData.rollerParallax = rollerParallax;
      return tlData;
    },

    common: () => {
      const tlData = {};

      const tlHero = buildHeroAnimation(gsap);
      if (hasRealAnimations(tlHero)) tlData.tlHero = tlHero;

      const servicesParallax = buildParallax(gsap, ScrollTrigger, SELECTORS.servicesParallaxBg, SELECTORS.servicesParallax);
      if (servicesParallax) tlData.servicesParallax = servicesParallax;

      Object.assign(tlData, buildFadeAnimations(gsap, SELECTORS.fadeInLeft, "fadeInLeft", { x: -60, y: 40, duration: 1, ease: "circ.out" }));
      Object.assign(tlData, buildFadeAnimations(gsap, SELECTORS.fadeInRight, "fadeInRight", { x: 60, y: 40, duration: 1, ease: "circ.out" }));
      Object.assign(tlData, buildFadeAnimations(gsap, SELECTORS.scaleIn, "scaleIn", { scale: 0.7, duration: 1.2, ease: "back.out(1)" }));
      Object.assign(tlData, buildFadeAnimations(gsap, SELECTORS.fadeInUp, "fadeInUp", { y: 40, duration: 1, ease: "circ.out" }));

      buildScrolledNav(gsap, ScrollTrigger);

      document.addEventListener("click", burgerClickHandler);
      burgerAll.forEach(burgerInitListener);

      return tlData;
    }
  };

  function fadeInGallery(elemsArr = []) {
    return buildGalleryFade(gsap, elemsArr);
  }

  /**
   * Runs all page animations.
   * DOM readiness is guaranteed by index.js (DOMContentLoaded + async GSAP load),
   * so no redundant readyState checks are needed here.
   *
   * @returns {Object.<string, gsap.core.Timeline|gsap.core.Tween>} Map of all active timelines/tweens
   */
  function animatePage() {
    return onPageLoaded(pageAnimations);
  }

  function onPageLoaded(animationData) {
    const pageName = document.body.dataset.type;
    const totalTl = {};
    if (animationData.common) Object.assign(totalTl, animationData.common());
    if (pageName in animationData) Object.assign(totalTl, animationData[pageName]());
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return totalTl;
  }

  return { animatePage, fadeInGallery };
}