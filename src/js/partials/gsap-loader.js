"use strict";

/**
 * @file gsap-loader.js
 * @description Atomic lazy-loader for GSAP + ScrollTrigger.
 * Exports a global animation cache so that animations.js (or any consumer)
 * can register, retrieve, and kill tweens/timelines in one centralized place.
 */

import {initLog} from "../helpers/funcs.js";

/// TYPES ///
/**
 *! GSAP ANIMATIONS type aliases used by this module.
 *
 * @typedef {import("../types/animations.types.js").TAnimation} TAnimation
 * @typedef {import("../types/animations.types.js").TAnimationKey} TAnimationKey
 * @typedef {import("../types/animations.types.js").TGsapModules} TGsapModules
 *
 */

///////////////
/**
 * @type {Promise<TGsapModules | null> | null}
 * Cached Promise for the GSAP modules.
 *
 * The Promise is cached immediately, before the dynamic import resolves,
 * so concurrent callers share the same initialization.
 */
let gsapPromise = null;

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
 * Loads and caches GSAP and ScrollTrigger as a single initialization.
 *
 * A failed load resolves to `null`, matching the caller's existing
 * `if (!gsapAll)` guard.
 *
 * @returns {Promise<TGsapModules | null>}
 */
export function getGSAP() {
	if (!gsapPromise) {
		// Cache the Promise, not only the resolved modules.
		gsapPromise = loadGSAP().catch((error) => {
			initLog("error", {
				component: "getGSAP",
				message: "Failed to load GSAP or ScrollTrigger.",
				details: error,
			});

			gsapPromise = null;

			// Allow a later call to retry initialization after a failure.
			return null;
		});
	}

	return gsapPromise;
}

/**
 * Dynamically imports GSAP modules and registers ScrollTrigger.
 *
 * @returns {Promise<TGsapModules>}
 * @throws {Error} If GSAP or ScrollTrigger cannot be loaded.
 */
async function loadGSAP() {
	const { gsap, ScrollTrigger } = await import(
		/* webpackChunkName: "gsap" */
		"./gsap-all.js"
		);

	if (!gsap || !ScrollTrigger) {
		throw new Error(
			"[getGSAP]: GSAP or ScrollTrigger was not imported."
		);
	}

	// Register the plugin after both modules have loaded successfully.
	gsap.registerPlugin(ScrollTrigger);

	return { gsap, ScrollTrigger };
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
 * Checks whether an animation is registered under the given key.
 *
 * @param {TAnimationKey} key - Animation name or DOM element.
 * @returns {boolean} `true` when the key exists in the animation cache.
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
