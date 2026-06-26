"use strict";

/**
 * @file gsap-loader.js
 * @description Atomic lazy-loader for GSAP + ScrollTrigger.
 * Exports a global animation cache so that animations.js (or any consumer)
 * can register, retrieve, and kill tweens/timelines in one centralized place.
 */

// ============================================
// CACHE & STATE
// ============================================

/** @type {{ gsap?: typeof import('gsap').gsap, ScrollTrigger?: typeof import('gsap/ScrollTrigger').ScrollTrigger }|null} */
let gsapCache = null;

/** @type {Promise<{ gsap: typeof import('gsap').gsap, ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }>|null} */
let gsapLoadPromise = null;

/** @type {Map<string, gsap.core.Tween|gsap.core.Timeline>} */
const activeAnimations = new Map();

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
 * }>}
 */
export async function getGsap() {
	if (gsapCache) return gsapCache;
	if (gsapLoadPromise) return gsapLoadPromise;

	gsapLoadPromise = import(
		'./gsap-all.js'
		).then(({ gsap, ScrollTrigger }) => {
		gsap.registerPlugin(ScrollTrigger);
		gsapCache = { gsap, ScrollTrigger };
		return gsapCache;
	});

	return gsapLoadPromise;
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
 * Caches the animation. Returns the cache key.
 * When an element is provided and has existing animation, it is killed.
 *
 * @param {gsap.core.Tween|gsap.core.Timeline} animation
 * @param {HTMLElement} [element] - Optional element for element-based kill
 * @returns {string} Cache key
 */
export function cacheAnimation(animation, element) {
	if (element) {
		for (const [key, anim] of activeAnimations.entries()) {
			if (anim.targets && anim.targets().includes(element)) {
				anim.kill();
				activeAnimations.delete(key);
			}
		}
	}

	const key = generateAnimId();
	activeAnimations.set(key, animation);
	return key;
}

/**
 * Kills animation by cache key.
 * @param {string} key
 */
export function killAnimationByKey(key) {
	const animation = activeAnimations.get(key);
	if (animation) {
		animation.kill();
		activeAnimations.delete(key);
	}
}

/**
 * Kills animation by element (finds in cache by target).
 * @param {HTMLElement} element
 */
export function killAnimation(element) {
	for (const [key, anim] of activeAnimations.entries()) {
		if (anim.targets && anim.targets().includes(element)) {
			anim.kill();
			activeAnimations.delete(key);
		}
	}
}

/**
 * Kills ALL cached animations and ScrollTriggers.
 * Safe cleanup that preserves GSAP cache.
 */
export function killAllAnimations() {
	const { ScrollTrigger } = gsapCache || {};

	activeAnimations.forEach(anim => anim.kill());
	activeAnimations.clear();

	if (ScrollTrigger) {
		ScrollTrigger.getAll().forEach(st => st.kill());
	}

	animationId = 0;
}

/**
 * Kills all animations AND clears GSAP cache.
 * Use for full page reload / SPA navigation.
 */
export function resetGsapCache() {
	killAllAnimations();
	gsapCache = null;
	gsapLoadPromise = null;
}

/**
 * Checks if GSAP is loaded.
 * @returns {boolean}
 */
export function isGsapLoaded() {
	return gsapCache !== null;
}

/**
 * Returns cached GSAP instance without reloading.
 * @returns {{ gsap: typeof import('gsap').gsap, ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }|null}
 */
export function getCachedGsap() {
	return gsapCache;
}