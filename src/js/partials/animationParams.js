"use strict";

/**
 * src/js/partials/animationParams.js
 *
 * @file animationParams.js
 * @description GSAP ANIMATION params
 */

import {SELECTORS} from "./initialSelectors.js";

/**
 *! GSAP ANIMATIONS type aliases used by this module.
 *
 * @typedef {import("../types/animations.types.js").TGsap} TGsap
 * @typedef {import("../types/animations.types.js").TGsapVars} TGsapVars
 * @typedef {import("../types/animations.types.js").TTween} TTween
 * @typedef {import("../types/animations.types.js").TTimeline} TTimeline
 * @typedef {import("../types/animations.types.js").TAnimation} TAnimation
 * @typedef {import("../types/animations.types.js").TAnimationKey} TAnimationKey
 * @typedef {import("../types/animations.types.js").TTargetMode} TTargetMode
 * @typedef {import("../types/animations.types.js").TScrollTriggerParams} TScrollTriggerParams
 * @typedef {import("../types/animations.types.js").TTimelineOperationType} TTimelineOperationType
 * @typedef {import("../types/animations.types.js").TTimelineStep} TTimelineStep
 * @typedef {import("../types/animations.types.js").TTimelineStepVars} TTimelineStepVars
 * @typedef {import("../types/animations.types.js").TBaseTimelineParams} TBaseTimelineParams
 * @typedef {import("../types/animations.types.js").TSingleTimelineParams} TSingleTimelineParams
 * @typedef {import("../types/animations.types.js").TGroupTimelineParams} TGroupTimelineParams
 * @typedef {import("../types/animations.types.js").TEachTimelineParams} TEachTimelineParams
 * @typedef {import("../types/animations.types.js").TTimelineParams} TTimelineParams
 *
 */

///////// ANIMATION CONFIGURATION //////////


const defaultParallaxScrollTrigger = {
	start: "top bottom",
	end: "bottom top",
	scrub: 1.5,
	invalidateOnRefresh: true,
}

/**
 * Configuration for the Automation section parallax Timeline.
 *
 * The section Element is used as the Timeline DOM search root,
 * while the same selector is explicitly used as the ScrollTrigger
 * trigger.
 *
 * These two settings intentionally remain independent even when
 * they reference the same Element.
 *
 * @type {TSingleTimelineParams}
 */
export const automationParallaxTimelineParams = {
	targetMode: "single",

	root: SELECTORS.automationParallax,

	scrollTrigger: {
		trigger: SELECTORS.automationParallax,
		...defaultParallaxScrollTrigger,
	},

	steps: [
		{
			target: SELECTORS.automationParallaxBg,
			type: "fromTo",
			fromVars: {
				yPercent: 10,
			},
			vars: {
				yPercent: -10,
				ease: "none",
			},
		},
	],
};

/**
 * Configuration for the Services section parallax Timeline.
 *
 * The section Element is used as the Timeline DOM search root,
 * while the same selector is explicitly used as the ScrollTrigger
 * trigger.
 *
 * These two settings intentionally remain independent even when
 * they reference the same Element.
 *
 * @type {TSingleTimelineParams}
 */
export const servicesParallaxTimelineParams = {
	targetMode: "single",

	root: SELECTORS.servicesParallax,

	scrollTrigger: {
		trigger: SELECTORS.servicesParallax,
		...defaultParallaxScrollTrigger
	},

	steps: [
		{
			target: SELECTORS.servicesParallaxBg,
			type: "fromTo",
			fromVars: {
				yPercent: 10,
			},
			vars: {
				yPercent: -10,
				ease: "none",
			},
		},
	],
};

/**
 * Configuration for independent fade-in-from-left Timelines.
 *
 * One Timeline is created for every Element matching `scope`.
 * Each scope Element becomes:
 *
 * - the DOM search root for its Timeline steps;
 * - the Timeline cache identity;
 * - the default ScrollTrigger trigger when the trigger selector
 *   resolves to the scope selector.
 *
 * @type {TEachTimelineParams}
 */
export const fadeInLeftTimelineParams = {
	targetMode: "each",

	scope: SELECTORS.fadeInLeft,
	scrollTrigger: {  //will be used for each scope Element
		trigger: SELECTORS.fadeInLeft,
		start: "top 80%",
		toggleActions: "play none none reverse",
		preventOverlaps: true
	},

	steps: [
		{
			target: SELECTORS.fadeInLeft,
			type: "to",
			vars: {
				opacity: 1,
				duration: 0.8,
				delay: 0.2,
			},
		},
		{
			target: SELECTORS.fadeInLeft,
			type: "from",
			vars: {
				x: -60,
				y: 40,
				duration: 1,
				ease: "circ.out",
			},
			position: "<",
		},
	],
};

/**
 * Configuration for independent fade-in-from-right Timelines.
 *
 * One Timeline is created for every Element matching `scope`.
 * Each scope Element becomes:
 *
 * - the DOM search root for its Timeline steps;
 * - the Timeline cache identity;
 * - the default ScrollTrigger trigger when the trigger selector
 *   resolves to the scope selector.
 *
 * @type {TEachTimelineParams}
 */
export const fadeInRightTimelineParams = {
	targetMode: "each",

	scope: SELECTORS.fadeInRight,
	scrollTrigger: {  //will be used for each scope Element
		trigger: SELECTORS.fadeInRight,
		start: "top 80%",
		toggleActions: "play none none reverse",
		preventOverlaps: true
	},

	steps: [
		{
			target: SELECTORS.fadeInRight,
			type: "to",
			vars: {
				opacity: 1,
				duration: 0.8,
				delay: 0.2,
			},
		},
		{
			target: SELECTORS.fadeInRight,
			type: "from",
			vars: {
				x: 60,
				y: 40,
				duration: 1,
				ease: "circ.out",
			},
			position: "<",
		},
	],
};

/**
 * Configuration for independent scale-in Timelines.
 *
 * One Timeline is created for every Element matching `scope`.
 * Each scope Element becomes:
 *
 * - the DOM search root for its Timeline steps;
 * - the Timeline cache identity;
 * - the default ScrollTrigger trigger when the trigger selector
 *   resolves to the scope selector.
 *
 * @type {TEachTimelineParams}
 */
export const scaleInTimelineParams = {
	targetMode: "each",

	scope: SELECTORS.scaleIn,
	scrollTrigger: {  //will be used for each scope Element
		trigger: SELECTORS.scaleIn,
		start: "top 80%",
		toggleActions: "play none none reverse",
		preventOverlaps: true
	},

	steps: [
		{
			target: SELECTORS.scaleIn,
			type: "to",
			vars: {
				opacity: 1,
				duration: 0.8,
			},
		},
		{
			target: SELECTORS.scaleIn,
			type: "from",
			vars: {
				scale: 0.7,
				duration: 1.2,
				ease: "back.out(1)",
			},
			position: "<",
		},
	],
};

/**
 * Configuration for independent fade-in-up Timelines.
 *
 * One Timeline is created for every Element matching `scope`.
 * Each scope Element becomes:
 *
 * - the DOM search root for its Timeline steps;
 * - the Timeline cache identity;
 * - the default ScrollTrigger trigger when the trigger selector
 *   resolves to the scope selector.
 *
 * @type {TEachTimelineParams}
 */
export const fadeInUpTimelineParams = {
	targetMode: "each",

	scope: SELECTORS.fadeInUp,
	scrollTrigger: {  //will be used for each scope Element
		trigger: SELECTORS.fadeInUp,
		start: "top 80%",
		toggleActions: "play none none reverse",
		preventOverlaps: true
	},

	steps: [
		{
			target: SELECTORS.fadeInUp,
			type: "to",
			vars: {
				opacity: 1,
				duration: 0.8,
				delay: 0.2,
			},
		},
		{
			target: SELECTORS.fadeInUp,
			type: "from",
			vars: {
				y: 40,
				duration: 1,
				ease: "circ.out",
			},
			position: "<",
		},
	],
};

/**
 * Configuration for the navigation panel show-on-scroll Timeline.
 *
 * The Timeline is triggered when the Benefits section reaches 5% from
 * the top of the viewport and plays the navigation panel entrance
 * animation. The animation is reversed when the ScrollTrigger leaves
 * the active range.
 *
 * `root` identifies the navigation panel Element used as the Timeline
 * DOM search root and animation cache identity.
 *
 * The ScrollTrigger trigger is intentionally independent from `root`:
 * the navigation panel is animated, while the Benefits section controls
 * when the Timeline is activated.
 *
 * @type {TSingleTimelineParams}
 */
export const scrolledNavTimelineParams = {
	targetMode: "single",

	root: SELECTORS.scrolledNav,

	scrollTrigger: {
		trigger: SELECTORS.benefitsSection,
		start: "top 5%",
		toggleActions: "play none none reverse",
		preventOverlaps: true,
	},

	steps: [
		{
			target: SELECTORS.scrolledNav,
			type: "to",
			vars: {
				top: -10,
				duration: 0.7,
				ease: "back.out(1.5)",
				delay: 0.5,
			},
		},
	],
};

