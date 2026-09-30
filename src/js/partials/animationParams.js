"use strict";

import {SELECTORS} from "./initialSelectors.js";

/**
 * TGsap
 * GSAP instance.
 * @typedef {typeof import("gsap").gsap} TGsap
 */

/**
 * TGsapVars
 *
 * Generic GSAP vars object.
 *
 * `Record<string, any>` is intentionally used at this abstraction layer
 * because animation configuration may contain properties provided by
 * GSAP core, plugins, or ScrollTrigger.
 *
 * Keeping this type generic prevents the animation builder API from being
 * coupled to every possible GSAP plugin configuration.
 *
 * @typedef {Record<string, any>} TGsapVars
 */

/**
 * TTween
 *
 * GSAP Tween instance.
 *
 * @typedef {gsap.core.Tween} TTween
 */

/**
 * TTimeline
 *
 * GSAP Timeline instance.
 *
 * @typedef {gsap.core.Timeline} TTimeline
 */

/**
 * TAnimation
 *
 * Common GSAP animation type.
 *
 * Includes both Tween and Timeline instances.
 *
 * @typedef {gsap.core.Animation} TAnimation
 */

/**
 * TAnimationKey
 *
 * Cache identity used to register a GSAP animation.
 *
 * String keys are used for named application-level animations,
 * such as shared group Timelines.
 *
 * Element keys are used when an animation belongs to a concrete
 * DOM Element, such as a single root or an individual `each` scope.
 *
 * @typedef {string | Element} TAnimationKey
 */

/**
 * TTargetMode
 *
 * Defines how DOM targets are associated with GSAP Timelines.
 *
 * `single`
 *     One root Element → one Timeline.
 *
 * `group`
 *     Document → one shared Timeline.
 *
 * `each`
 *     Multiple scope Elements → one independent Timeline per scope.
 *
 * @typedef {"single" | "group" | "each"} TTargetMode
 */

/**
 * TScrollTriggerParams
 *
 * Configuration for a ScrollTrigger attached to a Timeline.
 *
 * `trigger` defines the Element whose scroll position controls
 * the Timeline. It is independent from the DOM search root used
 * to resolve Timeline step targets.
 *
 * Therefore:
 *
 *     root
 *       ↓
 *     resolves step targets
 *
 *     trigger
 *       ↓
 *     controls Timeline playback
 *
 * These may refer to the same Element, but one must not be
 * implicitly inferred from the other.
 *
 * @typedef {{
 *   trigger?: string | Element,
 *   start?: string | number,
 *   end?: string | number,
 *   toggleActions?: string,
 *   preventOverlaps?: boolean | string,
 *   fastScrollEnd?: boolean | number,
 *   markers?: boolean,
 *   scrub?: boolean | number,
 *   pin?: boolean | string | Element,
 *   invalidateOnRefresh?: boolean,
 * }} TScrollTriggerParams
 */

/**
 * TTimelineOperationType
 *
 * Supported GSAP Timeline operations.
 *
 * @typedef {"set" | "from" | "to" | "fromTo"} TTimelineOperationType
 */

/**
 * TTimelineStep
 *
 * Declarative configuration of one operation added to a GSAP Timeline.
 *
 * `target`
 *     CSS selector used to resolve the target Elements within
 *     the Timeline's search root.
 *
 * `type`
 *     GSAP Timeline operation to execute.
 *
 * `vars`
 *     GSAP vars used by `set()`, `from()`, and `to()`.
 *     For `fromTo()`, these are the destination vars.
 *
 * `fromVars`
 *     Initial GSAP vars used by `fromTo()`.
 *
 * `position`
 *     GSAP Timeline position parameter.
 *
 * ScrollTrigger configuration intentionally does not belong to an
 * individual step. It is configured at the Timeline level.
 *
 * @typedef {{
 *   target: string,
 *   type: TTimelineOperationType,
 *   vars?: TGsapVars,
 *   fromVars?: TGsapVars,
 *   position?: string | number,
 * }} TTimelineStep
 */

/**
 * TTimelineStepVars
 *
 * Normalized GSAP vars used internally when adding a Timeline step.
 *
 * Unlike `TTimelineStep`, both properties are always present after
 * normalization.
 *
 * `vars` contains the destination or primary vars.
 *
 * `fromVars` contains the initial vars used only by `fromTo()`.
 *
 * @typedef {{
 *   vars: TGsapVars,
 *   fromVars: TGsapVars,
 * }} TTimelineStepVars
 */

/**
 * TBaseTimelineParams
 *
 * Common Timeline configuration shared by all target modes.
 *
 * `paused`
 *     Controls the initial playback state of the Timeline.
 *
 * `scrollTrigger`
 *     Optional ScrollTrigger configuration attached to the complete
 *     Timeline.
 *
 * `steps`
 *     Declarative operations that are added to the Timeline.
 *
 * The DOM search root is intentionally not defined here because
 * different target modes derive their search context differently:
 *
 *     single → explicit `root`
 *     group  → `document`
 *     each   → each matched `scope` Element
 *
 * @typedef {{
 *   paused?: boolean,
 *   scrollTrigger?: TScrollTriggerParams,
 *   steps: TTimelineStep[],
 * }} TBaseTimelineParams
 */

/**
 * TSingleTimelineParams
 *
 * Configuration for one independent Timeline.
 *
 * `root` is required because a single Timeline must have exactly
 * one explicit DOM search root.
 *
 * The resolved root Element is also used as the default cache
 * identity when no explicit key is supplied to `buildSingleTimeline()`.
 *
 * @typedef {{
 *   targetMode: "single",
 *   root: string,
 * } & TBaseTimelineParams} TSingleTimelineParams
 */

/**
 * TGroupTimelineParams
 *
 * Configuration for one shared Timeline.
 *
 * Group mode resolves all step selectors against the Document.
 * Therefore, no explicit DOM `root` is required or accepted.
 *
 * The Timeline represents the complete group and must therefore
 * be registered under an explicit string cache key.
 *
 * @typedef {{
 *   targetMode: "group",
 * } & TBaseTimelineParams} TGroupTimelineParams
 */

/**
 * TEachTimelineParams
 *
 * Configuration for independent Timelines created for every Element
 * matching `scope`.
 *
 * `scope` defines the Elements that establish independent Timeline
 * instances.
 *
 * For each matched scope Element:
 *
 *     scope Element
 *         ↓
 *     DOM search root
 *         ↓
 *     one Timeline
 *         ↓
 *     scope Element as cache identity
 *
 * The scope Element is used as the Timeline search context and
 * cache identity. ScrollTrigger configuration remains independent
 * and is not implicitly modified by this type.
 *
 * @typedef {{
 *   targetMode: "each",
 *   scope: string,
 * } & TBaseTimelineParams} TEachTimelineParams
 */

/**
 * TTimelineParams
 *
 * Discriminated union containing the complete configuration accepted
 * by the Timeline builder system.
 *
 * `targetMode` determines which specialized builder is used:
 *
 *     "single" → TSingleTimelineParams
 *     "group"  → TGroupTimelineParams
 *     "each"   → TEachTimelineParams
 *
 * @typedef {TSingleTimelineParams | TGroupTimelineParams | TEachTimelineParams} TTimelineParams
 */

///////// ANIMATION CONFIGURATION //////////

const defaultParallaxScrollTrigger = {
	start: "top bottom",
	end: "bottom top",
	scrub: 1.5,
	invalidateOnRefresh: true,
}

/**
 * Configuration for the Burger navigation Timeline.
 *
 * The Timeline is created in its initial paused state because it is
 * controlled interactively by Burger event handlers.
 *
 * `root` identifies the navigation Element that provides the DOM
 * search context for the Timeline steps.
 *
 * @type {TSingleTimelineParams}
 */
export const burgerNavTimelineParams = {
	targetMode: "single",

	root: SELECTORS.navMenuFixed,
	paused: true,
	steps: [
		{
			target: SELECTORS.navMenuFixed,
			type: "to",
			vars: {
				top: -20,
				duration: 0.8,
				ease: "back.out(0.8)",
			},
		},
	],
};

/**
 * Configuration for the Hero section entrance Timeline.
 *
 * The Timeline coordinates multiple independent Hero Elements
 * through one shared Timeline and is therefore configured with
 * `targetMode: "group"`.
 *
 * Group mode resolves all step selectors against the Document.
 *
 * @type {TGroupTimelineParams}
 */
export const heroTimelineParams = {
	targetMode: "group",

	steps: [
		// Hero heading accent
		{
			target: SELECTORS.headingAccentHero,
			type: "to",
			vars: {
				opacity: 1,
				duration: 2,
				delay: 0.3,
			},
		},
		{
			target: SELECTORS.headingAccentHero,
			type: "from",
			vars: {
				x: 80,
				duration: 0.8,
				ease: "circ.out",
			},
			position: "<",
		},

		// Remaining part of the Hero heading
		{
			target: SELECTORS.headingHeroRest,
			type: "to",
			vars: {
				opacity: 1,
				duration: 2,
			},
			position: "<",
		},
		{
			target: SELECTORS.headingHeroRest,
			type: "from",
			vars: {
				x: -80,
				duration: 0.8,
				ease: "circ.out",
			},
			position: "<",
		},

		// Hero text block
		{
			target: SELECTORS.textBlockHero,
			type: "to",
			vars: {
				opacity: 1,
				duration: 2,
			},
			position: "-=1.5",
		},
		{
			target: SELECTORS.textBlockHero,
			type: "from",
			vars: {
				y: 80,
				duration: 0.8,
				ease: "circ.out",
			},
			position: "<",
		},

		// Hero bidding block
		{
			target: SELECTORS.biddingBlockHero,
			type: "to",
			vars: {
				opacity: 1,
				duration: 2,
			},
			position: "<+0.3",
		},
		{
			target: SELECTORS.biddingBlockHero,
			type: "from",
			vars: {
				y: 40,
				duration: 0.8,
				ease: "circ.out",
			},
			position: "<",
		},

		// Hero icon
		{
			target: SELECTORS.iconWrapperHero,
			type: "to",
			vars: {
				scale: 1,
				duration: 1.5,
				ease: "elastic.out",
			},
			position: "<+0.2",
		},
	],
};

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

