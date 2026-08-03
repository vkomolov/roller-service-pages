"use strict";

/**
 * @file gsap-loader.js
 * @description Atomic lazy-loader for GSAP + ScrollTrigger.
 * Exports a global animation cache so that animations.js (or any consumer)
 * can register, retrieve, and kill tweens/timelines in one centralized place.
 */

const gsapAllPath = "./gsap-all.js"; //gsap-all.js must be on the same with gsap-loader.js

/** @type {{
 * gsap: typeof import('gsap').gsap,
 * ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
 * }
 * |null
 * } */
let gsapModules = null;

// ============================================
// CACHE & STATE
// ============================================
/**
 * could be new Map on {@link resetGsapAnimationCache}
 */
/** @type {Map<string|Element, gsap.core.Tween|gsap.core.Timeline>} */
let gsapAnimationCache = new Map();  //

/** @type {number} */
let animationId = 0;

// ============================================
// LOADER
// ============================================

/**
 * Loading and caching GSAP + ScrollTrigger as a single atomic chunk.
 * Returns the cached result when called again.
 *
 * @returns {Promise<{
 *   gsap: typeof import('gsap').gsap,
 *   ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
 * }|null>}
 */
export async function getGSAP() {
	if (gsapModules) return gsapModules;

	const { gsap, ScrollTrigger } = await import(gsapAllPath);
	if (!gsap || !ScrollTrigger) {
		console.error("at getGSAP: no gsap or ScrollTrigger imported...");
		return null;
	}

	gsap.registerPlugin(ScrollTrigger);
	gsapModules = { gsap, ScrollTrigger };

		return gsapModules;
	}


// ============================================
// ANIMATION CACHE API
// ============================================

/**
 * Generates a unique cache key for an animation.
 * @returns {string}
 */
export function generateAnimId() {
	return `anim_${++animationId}`;
}

/**
 * Caches the animation. Returns the cache key: string|Element (the target Element, to animated)
 * When an Element is provided and has existing animation, it will be re-written with new animation of the same key
 *
 * @param {gsap.core.Tween|gsap.core.Timeline} animation
 * @param {Element|string} [element] - Optional element for element-based kill (can be Element or unique key)
 * @returns {string|Element} Cache key
 */
export function cacheAnimation(animation, element) {
	if (element) {
		//checking animation in gsapAnimationCache <Map> and kill if it exists by key: element
		killAnimation(element);

		gsapAnimationCache.set(element, animation);
		return element;
	}

	const key = generateAnimId();
	gsapAnimationCache.set(key, animation);
	return key;
}

/**
 * Kills animation by cache key (can be the Element, which is to be animated...
 * It is used with {@link gsapAnimationCache}
 * @param {string|Element} key
 */
export function killAnimation(key) {
	const animation = gsapAnimationCache.get(key);
	if (animation) {
		animation.kill();
		gsapAnimationCache.delete(key);
	}
}


/**
 * Kills ALL cached animations and ScrollTriggers.
 * Safe cleanup that preserves GSAP cache.
 */
export function killAllAnimations() {
	const { ScrollTrigger } = gsapModules || {};

	gsapAnimationCache.forEach(anim => anim.kill());
	gsapAnimationCache.clear();

	if (ScrollTrigger) {
		ScrollTrigger.getAll().forEach(st => st.kill());
	}

	animationId = 0;
}

/**
 * Kills all registered animations and recreates the animation cache.
 * Does not unload GSAP modules.
 */
export function resetGsapAnimationCache() {
	killAllAnimations();
	gsapAnimationCache = new Map();
}

/**
 * Checks if GSAP is loaded.
 * @returns {boolean}
 */
export function isGsapLoaded() {
	return gsapModules !== null;
}