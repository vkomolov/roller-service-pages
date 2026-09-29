"use strict";

/**
 * @file gsap-loader.js
 * @description Atomic lazy-loader for GSAP + ScrollTrigger.
 * Exports a global animation cache so that animations.js (or any consumer)
 * can register, retrieve, and kill tweens/timelines in one centralized place.
 */

/*** TYPES ***/


/**
 * TAnimation - Tween or Timeline
 * @typedef {gsap.core.Tween | gsap.core.Timeline} TAnimation or use type: gsap.core.Animation for any GSAP Animation
 */

/**
 * TAnimationKey - Key used to identify a cached animation.
 *
 * String keys are used for application-level animations,
 * while Element keys are used for element-bound animations.
 *
 * @typedef {string | Element} TAnimationKey
 */


/**
 * @typedef {{
 *   gsap: typeof import('gsap').gsap,
 *   ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger,
 * }} TGsapModules
 */

///////////////

/** @type {TGsapModules|null} */
let gsapModules = null;

// ============================================
// CACHE & STATE
// ============================================
/**
 * It is used for registering the animations of a particular Element
 * Using WeakMap for GC in case of removal of elements from DOM and cleaning its animations
 * @type {WeakMap<Element, TAnimation>}
 */
const elementAnimations = new WeakMap();

/**
 * It is used for registering the "named" animations, which are not connected to a particular Element
 * @type {Map<string, TAnimation>}
 */
const namedAnimations = new Map();

// ============================================
// LOADER
// ============================================

/**
 * Loads and caches GSAP + ScrollTrigger as a single atomic chunk.
 * Returns the cached modules when called again.
 *
 * @returns {Promise<TGsapModules | null>}
 */
export async function getGSAP() {
	if (gsapModules) {
		return gsapModules;
	}

	const { gsap, ScrollTrigger } =
		await import(
			/* webpackChunkName: "gsap" */
			"./gsap-all.js"
			);

	if (!gsap || !ScrollTrigger) {
		console.error(
			"at getGSAP: no gsap or ScrollTrigger imported..."
		);

		return null;
	}

	gsap.registerPlugin(ScrollTrigger);

	gsapModules = {
		gsap,
		ScrollTrigger,
	};

	return gsapModules;
}



// ============================================
// ANIMATION CACHE API
// ============================================
/**
 * Registers a GSAP animation by element or application-level name.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @param {TAnimation} animation - GSAP animation instance.
 * @returns {void}
 */
export function registerAnimation(key, animation) {
	if (isRegisteredAnimation(key)) {
		throw new Error(`[registerAnimation]: the given key ${key} is already registered by another timeline`);
	}

	if (typeof key !== "string" && !(key instanceof Element)) {
		throw TypeError(`[registerAnimation]: the given key must be string or Element... given key: ${key}`);
	}

	if (typeof key === "string" && !key) {
		throw new TypeError(`[registerAnimation]: the given key: ${key} has no length: ${key.length}`);
	}

	if (typeof key === "string") {
		namedAnimations.set(key, animation);
		return;
	}

	elementAnimations.set(key, animation);
}

/**
 * Returns a registered animation.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @returns {TAnimation | undefined}
 */
export function getAnimation(key) {
	if (typeof key === "string") {
		return namedAnimations.get(key);
	}

	return elementAnimations.get(key);
}

/**
 * Returns a registered animation.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @returns {boolean}
 */
export function isRegisteredAnimation(key) {
	if (typeof key === "string") {
		return namedAnimations.has(key);
	}

	return elementAnimations.has(key);
}


/**
 * Kills and removes a registered animation.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @returns {void}
 */
export function killAnimation(key) {
	const animation = getAnimation(key);

	if (!animation) {
		return;
	}

	animation.kill();

	if (typeof key === "string") {
		namedAnimations.delete(key);
	} else {
		elementAnimations.delete(key);
	}
}

/**
 * Checks if GSAP is loaded.
 * @returns {boolean}
 */
export function isGsapLoaded() {
	return gsapModules !== null;
}