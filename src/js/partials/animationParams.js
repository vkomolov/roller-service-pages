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
 * `Record<string, any>` is intentionally used here because this
 * configuration represents generic GSAP vars and may contain
 * properties provided by GSAP core, plugins, or ScrollTrigger.
 *
 * The type is kept generic at this abstraction layer instead of
 * coupling the application-specific animation configuration to
 * every possible GSAP plugin type.
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
 * This includes both Tween and Timeline instances.
 *
 * @typedef {gsap.core.Animation} TAnimation
 */

/**
 * TAnimationKey
 *
 * Cache key used to identify a registered animation.
 *
 * Element keys are used when the animation belongs to a concrete
 * DOM Element.
 *
 * String keys are used for application-level animations such as
 * grouped animations.
 *
 * @typedef {string | Element} TAnimationKey
 */

/**
 * TTargetMode
 *
 * Defines how target Elements are associated with timelines.
 *
 * `single`
 *     One primary Element and one Timeline.
 *
 * `group`
 *     Multiple Elements and one shared Timeline.
 *
 * `each`
 *     Multiple scope Elements and one independent Timeline
 *     for every scope.
 *
 * @typedef {"single" | "group" | "each"} TTargetMode
 */

/**
 * TScrollTriggerParams
 *
 * ScrollTrigger configuration for a single timeline step.
 *
 * `trigger` is optional because the builder may resolve it from
 * the current animation context.
 *
 * The resolution rules are:
 *
 * - Explicit `trigger` has the highest priority.
 * - `single` may use its primary target Element.
 * - `each` may use its current scope Element.
 * - `group` does not have an implicit trigger and therefore
 *   requires an explicit `trigger`.
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
 * }} TScrollTriggerParams
 */

/**
 * TTimelineStep
 *
 * Declarative description of one operation in a GSAP Timeline.
 *
 * The order of objects inside the `steps` array is significant:
 * it defines the order in which operations are added to the
 * Timeline.
 *
 * `target`
 *     CSS selector of the Elements animated by this step.
 *
 * `type`
 *     GSAP operation used to build the step.
 *
 * `vars`
 *     Vars used by `set()`, `from()`, and `to()`, and as the
 *     destination vars for `fromTo()`.
 *
 * `fromVars`
 *     Initial vars used only by `fromTo()`.
 *
 * `position`
 *     GSAP Timeline position parameter.
 *
 * `scrollTrigger`
 *     Optional ScrollTrigger configuration attached to the
 *     current GSAP tween.
 *
 * @typedef {{
 *   target: string,
 *   type: "set" | "from" | "to" | "fromTo",
 *   vars?: TGsapVars,
 *   fromVars?: TGsapVars,
 *   position?: string | number,
 *   scrollTrigger?: TScrollTriggerParams,
 * }} TTimelineStep
 */

/**
 * TSingleTimelineParams Configuration for a single-target Timeline.
 *
 * @typedef {{
 *   targetMode: "single",
 *   paused?: boolean,
 *   steps: TTimelineStep[],
 * }} TSingleTimelineParams
 */

/**
 * TGroupTimelineParams Configuration for a grouped Timeline.
 *
 * @typedef {{
 *   targetMode: "group",
 *   paused?: boolean,
 *   steps: TTimelineStep[],
 * }} TGroupTimelineParams
 */

/**
 * TEachTimelineParams Configuration for per-element Timelines.
 *
 * @typedef {{
 *   targetMode: "each",
 *   scope: string,
 *   paused?: boolean,
 *   steps: TTimelineStep[],
 * }} TEachTimelineParams
 */

/**
 * TTimelineParams Complete configuration accepted by buildTimeline().
 *
 * @typedef {TSingleTimelineParams | TGroupTimelineParams | TEachTimelineParams} TTimelineParams
 */

///////// FUNCTIONS //////////

/**
 * Configuration for the Burger navigation Timeline.
 *
 * The Timeline is created in its initial paused state because it is
 * controlled interactively by Burger event handlers.
 *
 * @type {TSingleTimelineParams}
 */
export const burgerNavTimelineParams = {
	targetMode: "single",

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
 * Configuration for the Hero section entrance animation Timeline.
 *
 * The Timeline coordinates multiple independent DOM targets and is
 * therefore configured with `targetMode: "group"`.
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



