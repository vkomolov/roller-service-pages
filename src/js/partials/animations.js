"use strict";

/**
 * @file animations.js
 * @description GSAP animation factory integrated with gsap-loader.js caching.
 * All animations are registered in the global gsap-loader cache so they can
 * be killed individually or in bulk. No local WeakMap is used anymore.
 */

import {
	createMasonry,
	setAttributes,
	getElements,
	getDOMElement,
	requireElements,
	logInitError,
	lockDocumentScroll,
	restoreDocumentScroll,
	checkHtmlElement,
	isHTMLElement
} from "../helpers/funcsDOM.js";
import {
	getGSAP,
	registerAnimation,
	getAnimation,
	killAnimation
} from "./gsap-loader.js";
import {
	getInvalidKeys,
	isKeyOf,
	isInSet,
	createKeySet,
} from "../helpers/funcs.js";


import { gallerySelector, linkAnchors, SELECTORS, navMenuSelectorsData } from "./initialSelectors.js";
import { selector } from "gsap/gsap-core";
import { burgerNavTimelineParams, heroTimelineParams } from "./animationParams.js";

// ============================================
//****** TYPE DEFINITIONS *******//

/**
 * TBurgerElements: DOM elements required by the navigation menu.
 *
 * @typedef {Object} TBurgerElements
 * @property {Element} navMenuFixed
 * @property {Element} burgerHidden
 * @property {Element} burgerFixed
 * @property {Element[]} burgerNavAll
 */

/**
 * TDOMSelectorConfig: Configuration for a generic DOM element lookup.
 *
 * @typedef {Object} TDOMSelectorConfig
 * @property {string} key - Property name used in the resulting object.
 * @property {string} selector - CSS selector used to find the element(s).
 * @property {boolean} [multiple=false] - Whether all matching elements should be returned.
 */

/**
 * TNavMenuSelector: Configuration for navigation menu DOM element lookup.
 *
 * Specializes the generic selector configuration by restricting `key`
 * to the known properties of `TBurgerElements`.
 *
 * @typedef {Omit<TDOMSelectorConfig, "key"> & {
 *     key: keyof TBurgerElements
 * }} TNavMenuSelector
 */

/**
 * TBurgerHandlersData: Configuration for return {@link initBurgerHandlers}
 *
 * @typedef {{
 *   closeBurgerHandler: (e:MouseEvent) => void,
 *   attachBurgerListener: (burger: Element) => void,
 * }} TBurgerHandlersData
 */

/**
 * TLinkAnchors is the type of the exported linkAnchors object.
 *
 * @typedef {typeof import("./initialSelectors.js").linkAnchors} TLinkAnchors
 */

/**
 * TPageName is the page names defined by `linkAnchors`.
 *
 * @typedef {keyof TLinkAnchors} TPageName
 */

/**
 * TPageAnimation: A function that initializes animations
 * for a page or common layout.
 *
 * @typedef {() => void} TPageAnimation
 */

/**
 * TPageAnimations: Animation configuration for all pages.
 *
 * `common` is always required.
 * Page-specific animation functions are optional.
 *
 * @typedef {{
 *   common: TPageAnimation
 * } & Partial<Record<TPageName, TPageAnimation>>} TPageAnimations
 */

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


/// UTILITY FUNCTIONS ///

/**
 * Checks if a GSAP timeline has real (non-zero duration) animations.
 *
 * @param {TTimeline} timeline - The timeline to check
 * @returns {boolean} True if at least one child tween has duration > 0
 */
function hasTimelineRealAnimations(timeline) {
	return timeline.getChildren().some(child => child.duration() > 0);
}


/// SCROLL TIMELINE BUILDERS ///
/**
 * buildTimeline
 *
 * Main public builder responsible for selecting the appropriate
 * timeline construction strategy.
 *
 * Target modes:
 *
 * `single`
 *     One primary Element → one Timeline.
 *
 * `group`
 *     Multiple Elements → one shared Timeline.
 *     The supplied `key` becomes the cache identity.
 *
 * `each`
 *     Multiple scope Elements → one independent Timeline per scope.
 *     Each scope Element becomes the cache identity.
 *
 * The `key` is optional at the API level because it is meaningful
 * only for `group` mode.
 *
 * This dispatcher intentionally performs very little work:
 *
 *     validate basic configuration
 *           ↓
 *     select target-mode builder
 *
 * Keeping target-mode-specific logic outside this function prevents
 * its cyclomatic complexity from growing as the animation system
 * evolves.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {TTimelineParams} params
 * Complete timeline configuration.
 *
 * @param {TAnimationKey} [key]
 * Named cache key used by `group` mode.
 *
 * The argument is intentionally optional because `single` and
 * `each` use Element-based cache identities.
 *
 * @returns {TTimeline | TTimeline[]}
 * A single Timeline for `single`/`group`, or an array of independent
 * Timelines for `each`.
 *
 * @throws {Error}
 * When `steps` is empty.
 *
 * @throws {TypeError}
 * When an unsupported target mode is provided.
 *
 * @throws {TypeError}
 * When `group` mode does not receive a key.
 *
 * @sample
 * buildTimeline(
 *   gsap,
 *   {
 *     targetMode: "single",
 *     steps: [
 *       {
 *         target: ".hero-title",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *         },
 *       },
 *     ],
 *   }
 * );
 *
 * @sample
 * buildTimeline(
 *   gsap,
 *   {
 *     targetMode: "group",
 *     steps: [
 *       {
 *         target: ".gallery-item",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *         },
 *         scrollTrigger: {
 *           trigger: ".gallery",
 *           start: "top 80%",
 *         },
 *       },
 *     ],
 *   },
 *   "galleryItems"
 * );
 */
function buildTimeline(
	gsap,
	params,
	key
) {
	/**
	 * Validate the most basic invariant here as well as inside
	 * specialized builders.
	 *
	 * This makes the public entry point fail early and keeps the
	 * specialized builders independently safe.
	 */
	if (!params.steps.length) {
		throw new Error(
			"[buildTimeline]: steps cannot be empty."
		);
	}

	switch (params.targetMode) {
		case "single":
			return buildSingleTimeline(
				gsap,
				params,
				key
			);

		case "group":
			if (!key || typeof key !== "string") {
				throw new TypeError(
					"[buildTimeline]: key as `string` is required " +
					`for group mode. But received: ${key}`
				);
			}

			return buildGroupTimeline(
				gsap,
				key,
				params
			);

		case "each":
			return buildEachTimelines(
				gsap,
				params
			);

		default:
			throw new TypeError(
				`[buildTimeline]: unsupported targetMode...".`
			);
	}
}


/**
 * buildSingleTimeline
 *
 * Builds one GSAP Timeline for a logical single-target animation.
 *
 * The function resolves the primary target from the first Timeline step.
 * The primary target serves as the default cache identity when no explicit
 * `key` is provided.
 *
 * The first step therefore establishes the following relationship:
 *
 *     params.steps[0].target
 *                ↓
 *          primary target
 *                ↓
 *     default animation key
 *
 * An explicit `key` overrides this default behavior and may be either:
 *
 * - a DOM Element, for Element-based animation caching;
 * - a string, for a named application-level animation.
 *
 * The primary target is also passed to `addTimelineStep()` as the
 * contextual target for ScrollTrigger configuration. Therefore, when
 * a step defines `scrollTrigger` without an explicit `trigger`, the
 * primary target can be used as the default trigger.
 *
 * Steps after the first one may target different Elements. This allows
 * one logical Timeline to coordinate several related DOM Elements while
 * retaining one primary cache identity.
 *
 * `params.paused` represents the initial runtime state of the Timeline.
 * It is intentionally applied to the Timeline itself rather than being
 * included in an individual Tween's vars.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {TSingleTimelineParams} params
 * Configuration for a single-target Timeline.
 *
 * `targetMode` must be `"single"`.
 *
 * @param {TAnimationKey} [key]
 * Optional cache key.
 *
 * When omitted, the first resolved target Element is used as the
 * animation key.
 *
 * @returns {TTimeline}
 * Created and registered GSAP Timeline.
 *
 * @throws {Error}
 * When `params.steps` is empty.
 *
 * @throws {Error}
 * When the target of any Timeline step cannot be resolved.
 *
 * @example
 * // The first target becomes the default cache key.
 * const timeline = buildSingleTimeline(
 *     gsap,
 *     {
 *         targetMode: "single",
 *         steps: [
 *             {
 *                 target: ".hero-title",
 *                 type: "from",
 *                 vars: {
 *                     opacity: 0,
 *                     y: 40,
 *                     duration: 0.8,
 *                 },
 *             },
 *             {
 *                 target: ".hero-text",
 *                 type: "from",
 *                 vars: {
 *                     opacity: 0,
 *                     y: 20,
 *                     duration: 0.6,
 *                 },
 *                 position: "<",
 *             },
 *         ],
 *     }
 * );
 *
 * @example
 * // Explicit string key creates a named cache entry.
 * const timeline = buildSingleTimeline(
 *     gsap,
 *     {
 *         targetMode: "single",
 *         steps: [
 *             {
 *                 target: ".hero",
 *                 type: "from",
 *                 vars: {
 *                     opacity: 0,
 *                 },
 *             },
 *         ],
 *     },
 *     "heroIntro"
 * );
 *
 * @example
 * // The primary Element is used as the default ScrollTrigger trigger.
 * const timeline = buildSingleTimeline(
 *     gsap,
 *     {
 *         targetMode: "single",
 *         steps: [
 *             {
 *                 target: ".service-title",
 *                 type: "from",
 *                 vars: {
 *                     opacity: 0,
 *                     y: 30,
 *                     duration: 0.8,
 *                 },
 *                 scrollTrigger: {
 *                     start: "top 80%",
 *                 },
 *             },
 *         ],
 *     }
 * );
 *
 * @example
 * // The Timeline starts paused and can later be controlled by
 * // event handlers using play(), reverse(), pause(), etc.
 * const timeline = buildSingleTimeline(
 *     gsap,
 *     {
 *         targetMode: "single",
 *         paused: true,
 *         steps: [
 *             {
 *                 target: ".burger-menu",
 *                 type: "to",
 *                 vars: {
 *                     top: -20,
 *                     duration: 0.8,
 *                     ease: "back.out(0.8)",
 *                 },
 *             },
 *         ],
 *     }
 * );
 */
function buildSingleTimeline(
	gsap,
	params,
	key
) {
	/**
	 * A Timeline without steps has no meaningful target or animation.
	 *
	 * Validate this before attempting to resolve the primary target.
	 */
	if (!params.steps.length) {
		throw new Error(
			"[buildSingleTimeline]: steps cannot be empty."
		);
	}

	/**
	 * The first step establishes the primary target.
	 *
	 * This Element is used as the default cache identity when the
	 * caller does not provide an explicit key.
	 */
	const firstStep = params.steps[0];

	const firstTargets = getElements(
		firstStep.target,
		document,
		false
	);

	if (!firstTargets.length) {
		throw new Error(
			`[buildSingleTimeline]: target "${firstStep.target}" ` +
			"was not found in DOM."
		);
	}

	const primaryTarget = firstTargets[0];

	/**
	 * Create the Timeline itself.
	 *
	 * `paused` is deliberately not passed to gsap.timeline() here.
	 * The initial playback state is applied after all Timeline steps
	 * have been constructed.
	 */
	const timeline = gsap.timeline();

	/**
	 * Add every declarative step to the Timeline.
	 *
	 * The primary target is passed as the contextual target so that
	 * addTimelineStep() can use it as the default ScrollTrigger
	 * trigger when a step defines ScrollTrigger without an explicit
	 * trigger.
	 */
	for (const step of params.steps) {
		const targets = getElements(
			step.target,
			document,
			false
		);

		if (!targets.length) {
			throw new Error(
				`[buildSingleTimeline]: target "${step.target}" ` +
				"was not found in DOM."
			);
		}

		addTimelineStep(
			timeline,
			targets[0],
			step,
			"single",
			primaryTarget
		);
	}

	/**
	 * An explicit key has priority over the automatically determined
	 * primary Element.
	 *
	 * Element keys are suitable for WeakMap-based caching.
	 * String keys are suitable for named application-level animations.
	 */
	const animationKey = key ?? primaryTarget;

	/**
	 * Apply the initial runtime state to the complete Timeline.
	 *
	 * `paused` describes the state of the interactive Timeline itself,
	 * not an individual Tween.
	 *
	 * This is especially useful for animations controlled later by
	 * event handlers through play() and reverse().
	 */
	if (params.paused) {
		timeline.pause();
	}

	/**
	 * Register the fully constructed Timeline only after its initial
	 * runtime state has been established.
	 *
	 * The cache therefore exposes the same Timeline instance that
	 * event handlers will subsequently control.
	 */
	registerAnimation(
		animationKey,
		timeline
	);

	return timeline;
}


/**
 * buildGroupTimeline
 *
 * Builds one shared Timeline for multiple Elements.
 *
 * Every step resolves its selector globally and passes all matching
 * Elements to GSAP as one target collection.
 *
 * The resulting Timeline represents the whole group and is therefore
 * registered under the supplied string cache key.
 *
 * Group mode intentionally does not provide an implicit
 * ScrollTrigger trigger. If a step declares ScrollTrigger without
 * an explicit `trigger`, resolveScrollTrigger() throws an error
 * because there is no unique Element representing the whole group.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {string} key
 * Named cache key for the group animation.
 *
 * @param {TGroupTimelineParams} params
 * Timeline configuration.
 *
 * @returns {TTimeline}
 * Created and registered Timeline.
 *
 * @throws {Error}
 * When `steps` is empty.
 *
 * @throws {Error}
 * When a step target cannot be resolved.
 *
 * @sample
 * buildGroupTimeline(
 *   gsap,
 *   "galleryCards",
 *   {
 *     targetMode: "group",
 *     steps: [
 *       {
 *         target: ".gallery-card",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *           y: 40,
 *         },
 *       },
 *     ],
 *   }
 * );
 *
 * @sample
 * buildGroupTimeline(
 *   gsap,
 *   "heroGroup",
 *   {
 *     targetMode: "group",
 *     steps: [
 *       {
 *         target: ".hero-title",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *         },
 *         scrollTrigger: {
 *           trigger: ".hero",
 *           start: "top 80%",
 *         },
 *       },
 *     ],
 *   }
 * );
 */
function buildGroupTimeline(
	gsap,
	key,
	params
) {
	if (!params.steps.length) {
		throw new Error(
			"[buildGroupTimeline]: steps cannot be empty."
		);
	}

	if (!key) {
		throw new TypeError(
			"[buildGroupTimeline]: key must be a non-empty string."
		);
	}

	const timeline = gsap.timeline();

	for (const step of params.steps) {
		const targets = getElements(
			step.target,
			document,
			true
		);

		if (!targets.length) {
			throw new Error(
				`[buildGroupTimeline]: target "${step.target}" ` +
				"was not found in DOM."
			);
		}

		/**
		 * No default trigger is supplied in group mode.
		 *
		 * Explicit step.scrollTrigger.trigger is still fully supported.
		 */
		addTimelineStep(
			timeline,
			targets,
			step,
			"group",
			undefined
		);
	}

	/**
	 * One shared Timeline represents the complete group,
	 * therefore the group name becomes its cache identity.
	 */
	registerAnimation(
		key,
		timeline
	);

	return timeline;
}

/**
 * buildEachTimelines
 *
 * Builds one independent Timeline for every Element matched
 * by `params.scope`.
 *
 * Example:
 *
 *     scope: ".card"
 *
 * produces:
 *
 *     card #1 → Timeline #1
 *     card #2 → Timeline #2
 *     card #3 → Timeline #3
 *
 * Every scope Element becomes:
 *
 * 1. the DOM context for resolving step targets;
 * 2. the default ScrollTrigger trigger;
 * 3. the cache identity used by registerAnimation().
 *
 * The resulting Element → Timeline relationship fits naturally
 * into the WeakMap-based animation cache.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {TEachTimelineParams} params
 * Timeline configuration with `targetMode: "each"`.
 *
 * @returns {TTimeline[]}
 * One independent Timeline for each scope Element.
 *
 * @throws {Error}
 * When `scope` is missing.
 *
 * @throws {Error}
 * When `steps` is empty.
 *
 * @throws {Error}
 * When no scope Elements are found.
 *
 * @sample
 * buildEachTimelines(
 *   gsap,
 *   {
 *     targetMode: "each",
 *     scope: ".card",
 *     steps: [
 *       {
 *         target: ".card__title",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *           y: 30,
 *         },
 *         scrollTrigger: {
 *           start: "top 80%",
 *         },
 *       },
 *     ],
 *   }
 * );
 *
 * @sample
 * buildEachTimelines(
 *   gsap,
 *   {
 *     targetMode: "each",
 *     scope: ".service-card",
 *     steps: [
 *       {
 *         target: ".service-card__image",
 *         type: "fromTo",
 *         fromVars: {
 *           scale: 0.8,
 *         },
 *         vars: {
 *           scale: 1,
 *           duration: 0.8,
 *         },
 *       },
 *       {
 *         target: ".service-card__text",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *         },
 *         position: "<0.2",
 *       },
 *     ],
 *   }
 * );
 */
function buildEachTimelines(
	gsap,
	params
) {
	if (!params.steps.length) {
		throw new Error(
			"[buildEachTimelines]: steps cannot be empty."
		);
	}

	if (!params.scope) {
		throw new Error(
			"[buildEachTimelines]: scope is required " +
			"when targetMode is 'each'."
		);
	}

	const scopes = getElements(
		params.scope,
		document,
		true
	);

	if (!scopes.length) {
		throw new Error(
			`[buildEachTimelines]: no elements matched scope "${params.scope}".`
		);
	}

	const timelines = [];

	for (const scope of scopes) {
		const timeline = buildTimelineForScope(
			gsap,
			scope,
			params.steps
		);

		/**
		 * Each scope receives its own cache entry.
		 *
		 * WeakMap<Element, TAnimation> provides the required
		 * Element → Timeline identity and allows the DOM Element
		 * to remain eligible for garbage collection.
		 */
		registerAnimation(
			scope,
			timeline
		);

		timelines.push(timeline);
	}

	return timelines;
}

/**
 * buildTimelineForScope
 *
 * Builds one Timeline for one scope Element.
 *
 *! This function is the core of `each` mode.
 *
 * Example:
 *
 *     scope: ".card"
 *
 *     current scope:
 *
 *     <article class="card">
 *         <h2 class="card__title"></h2>
 *         <p class="card__text"></p>
 *     </article>
 *
 * Then:
 *
 *     target: ".card__title"
 *
 * is resolved relative to the current `.card` Element.
 *
 * This allows every repeated component to have its own independent
 * Timeline while still using simple relative selectors.
 *
 * The current scope Element is also the default ScrollTrigger trigger
 * for steps that request ScrollTrigger without defining an explicit
 * `trigger`.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {Element} scope
 * Current scope Element.
 *
 * @param {TTimelineStep[]} steps
 * Timeline steps resolved relative to the scope.
 *
 * @returns {TTimeline}
 * Created Timeline.
 *
 * @throws {Error}
 * When `steps` is empty.
 *
 * @throws {Error}
 * When a step target cannot be found inside the scope.
 *
 * @sample
 * buildTimelineForScope(
 *   gsap,
 *   cardElement,
 *   [
 *     {
 *       target: ".card__title",
 *       type: "from",
 *       vars: {
 *         opacity: 0,
 *       },
 *       scrollTrigger: {
 *         start: "top 80%",
 *       },
 *     },
 *   ]
 * );
 *
 * @sample
 * buildTimelineForScope(
 *   gsap,
 *   cardElement,
 *   [
 *     {
 *       target: ".card__image",
 *       type: "from",
 *       vars: {
 *         y: 40,
 *       },
 *     },
 *     {
 *       target: ".card__text",
 *       type: "from",
 *       vars: {
 *         opacity: 0,
 *       },
 *       position: "<0.2",
 *     },
 *   ]
 * );
 */
function buildTimelineForScope(
	gsap,
	scope,
	steps
) {
	if (!steps.length) {
		throw new Error(
			"[buildTimelineForScope]: steps cannot be empty."
		);
	}

	const timeline = gsap.timeline();

	for (const step of steps) {
		/**
		 * Resolve the step target relative to the current scope.
		 *
		 * This is what gives `each` mode its component-oriented
		 * behavior.
		 */
		const targets = getElements(
			step.target,
			scope,
			true
		);

		if (!targets.length) {
			throw new Error(
				`[buildTimelineForScope]: target "${step.target}" ` +
				"was not found inside the current scope."
			);
		}

		/**
		 * The current scope is the contextual default trigger.
		 *
		 * It is used only when this particular step has ScrollTrigger
		 * configuration without its own explicit trigger.
		 */
		addTimelineStep(
			timeline,
			targets,
			step,
			"each",
			scope
		);
	}

	return timeline;
}

/**
 * addTimelineStep
 *
 * Dispatches one timeline step to the appropriate GSAP operation.
 *
 * This function deliberately does not contain animation-building
 * logic itself. Its responsibility is only to select the correct
 * operation builder based on `step.type`.
 *
 * Keeping this dispatcher small prevents the complexity of ${@link buildTimeline()}
 * from growing as additional GSAP operation
 * types are introduced.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by the step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @throws {TypeError}
 * When `step.type` is not supported.
 *
 * @sample
 * addTimelineStep(
 *   timeline,
 *   heroElement,
 *   {
 *     target: ".hero",
 *     type: "to",
 *     vars: {
 *       opacity: 1,
 *     },
 *   },
 *   "single",
 *   heroElement
 * );
 *
 * @sample
 * addTimelineStep(
 *   timeline,
 *   cards,
 *   {
 *     target: ".card",
 *     type: "from",
 *     vars: {
 *       opacity: 0,
 *       y: 40,
 *     },
 *   },
 *   "group"
 * );
 */
function addTimelineStep(
	timeline,
	target,
	step,
	targetMode,
	defaultTrigger
) {
	switch (step.type) {
		case "set":
			addSetStep(
				timeline,
				target,
				step,
				targetMode,
				defaultTrigger
			);
			break;

		case "from":
			addFromStep(
				timeline,
				target,
				step,
				targetMode,
				defaultTrigger
			);
			break;

		case "to":
			addToStep(
				timeline,
				target,
				step,
				targetMode,
				defaultTrigger
			);
			break;

		case "fromTo":
			addFromToStep(
				timeline,
				target,
				step,
				targetMode,
				defaultTrigger
			);
			break;

		default:
			throw new TypeError(
				`[addTimelineStep]: unsupported step type "${step.type}".`
			);
	}
}

/**
 * resolveScrollTrigger
 *
 * Resolves the final ScrollTrigger configuration for a timeline step.
 *
 * This function intentionally distinguishes between:
 *
 * 1. absence of `scrollTrigger`;
 * 2. explicitly supplied `scrollTrigger.trigger`;
 * 3. an implicit trigger supplied by the current animation context.
 *
 * An explicit trigger always has priority.
 *
 * When `scrollTrigger` is absent, the function returns `undefined`.
 * This is important because a GSAP animation should remain a normal
 * non-scroll-triggered animation unless ScrollTrigger configuration
 * was explicitly requested.
 *
 * For `group` mode there is no unique Element representing the
 * complete target collection. Therefore an implicit trigger would
 * be ambiguous and is rejected.
 *
 * @param {TScrollTriggerParams | undefined} scrollTrigger
 * ScrollTrigger configuration declared by the current step.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element that may be used when the step does not
 * explicitly define `trigger`.
 *
 * @returns {TScrollTriggerParams | undefined}
 * Normalized ScrollTrigger configuration.
 *
 * @throws {Error}
 * When `group` mode declares ScrollTrigger without an explicit
 * `trigger`.
 *
 * @sample
 * const result = resolveScrollTrigger(
 *   {
 *     start: "top 80%",
 *   },
 *   "single",
 *   heroElement
 * );
 *
 * // result.trigger === heroElement
 *
 * @sample
 * const result = resolveScrollTrigger(
 *   {
 *     trigger: ".section",
 *     start: "top 80%",
 *   },
 *   "group"
 * );
 *
 * // Explicit selector is preserved unchanged.
 */
function resolveScrollTrigger(
	scrollTrigger,
	targetMode,
	defaultTrigger
) {
	/**
	 * No ScrollTrigger configuration means that the animation
	 * must remain a regular GSAP animation.
	 */
	if (!scrollTrigger) {
		return undefined;
	}

	/**
	 * An explicitly supplied trigger always has priority over
	 * any contextual default.
	 */
	if (scrollTrigger.trigger) {
		return {
			...scrollTrigger,
		};
	}

	/**
	 * A grouped Timeline represents multiple Elements as one
	 * animation instance. There is no unique implicit Element
	 * that can safely act as the trigger for the whole group.
	 */
	if (targetMode === "group") {
		throw new Error(
			"[resolveScrollTrigger]: group mode requires an explicit " +
			"ScrollTrigger.trigger."
		);
	}

	/**
	 * No contextual Element is available.
	 *
	 * We do not invent a trigger. The caller may intentionally
	 * configure ScrollTrigger using only properties such as
	 * `start`, `end`, `scrub`, etc.
	 */
	if (!defaultTrigger) {
		return {
			...scrollTrigger,
		};
	}

	/**
	 * Use the contextual Element as the implicit trigger.
	 */
	return {
		...scrollTrigger,
		trigger: defaultTrigger,
	};
}

/**
 * createStepVars
 *
 * Creates a new GSAP vars object without mutating the original
 * configuration object.
 *
 * The optional ScrollTrigger configuration is merged into the
 * returned vars object only when it exists.
 *
 * This function also normalizes an `undefined` vars value into
 * an empty object, allowing callers to omit `step.vars`.
 *
 * The second argument is intentionally optional because some
 * GSAP operations do not need ScrollTrigger configuration.
 *
 * @param {TGsapVars | undefined} vars
 * Original GSAP vars object.
 *
 * @param {TScrollTriggerParams} [scrollTrigger]
 * Optional normalized ScrollTrigger configuration.
 *
 * @returns {TGsapVars}
 * New vars object suitable for passing to GSAP.
 *
 * @sample
 * const vars = createStepVars(
 *   {
 *     opacity: 1,
 *     duration: 1,
 *   }
 * );
 *
 * // {
 * //   opacity: 1,
 * //   duration: 1
 * // }
 *
 * @sample
 * const vars = createStepVars(
 *   {
 *     opacity: 1,
 *   },
 *   {
 *     trigger: heroElement,
 *     start: "top 80%",
 *   }
 * );
 *
 * // {
 * //   opacity: 1,
 * //   scrollTrigger: {
 * //     trigger: heroElement,
 * //     start: "top 80%",
 * //   }
 * // }
 */
function createStepVars(
	vars,
	scrollTrigger
) {
	/**
	 * Create a fresh object so that the original animation
	 * configuration remains immutable.
	 *
	 * Using `TGsapVars` allows us to add GSAP/plugin-specific
	 * properties such as `scrollTrigger`.
	 */
	const normalizedVars = {
		...(vars ?? {}),
	};

	if (scrollTrigger) {
		normalizedVars.scrollTrigger = scrollTrigger;
	}

	return normalizedVars;
}

/**
 * prepareStepVars
 *
 * Prepares all vars required to execute one timeline step.
 *
 * This function centralizes the repeated preparation logic shared
 * by `set`, `from`, `to`, and `fromTo` operations:
 *
 *     step.scrollTrigger
 *             ↓
 *     resolveScrollTrigger()
 *             ↓
 *     createStepVars()
 *
 * `fromTo()` needs two vars objects:
 *
 *     fromVars → initial values
 *     vars     → destination values
 *
 * Therefore this function always prepares both values. For normal
 * operations, callers simply use `vars` and ignore `fromVars`.
 *
 * ScrollTrigger is intentionally attached only to the destination
 * vars object because those vars are passed to the actual GSAP
 * tween configuration.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used when `scrollTrigger.trigger` is omitted.
 *
 * @returns {{
 *   vars: TGsapVars,
 *   fromVars: TGsapVars,
 *   scrollTrigger: TScrollTriggerParams | undefined,
 * }}
 * Prepared vars used by the step builders.
 *
 * @sample
 * const prepared = prepareStepVars(
 *   {
 *     target: ".title",
 *     type: "from",
 *     vars: {
 *       opacity: 0,
 *       y: 40,
 *     },
 *     scrollTrigger: {
 *       start: "top 80%",
 *     },
 *   },
 *   "single",
 *   titleElement
 * );
 *
 * // prepared.vars contains:
 * // {
 * //   opacity: 0,
 * //   y: 40,
 * //   scrollTrigger: {
 * //     start: "top 80%",
 * //     trigger: titleElement
 * //   }
 * // }
 *
 * @sample
 * const prepared = prepareStepVars(
 *   {
 *     target: ".title",
 *     type: "fromTo",
 *     fromVars: {
 *       opacity: 0,
 *     },
 *     vars: {
 *       opacity: 1,
 *     },
 *   },
 *   "single"
 * );
 *
 * // prepared.fromVars → { opacity: 0 }
 * // prepared.vars     → { opacity: 1 }
 */
function prepareStepVars(
	step,
	targetMode,
	defaultTrigger
) {
	const scrollTrigger = resolveScrollTrigger(
		step.scrollTrigger,
		targetMode,
		defaultTrigger
	);

	const vars = createStepVars(
		step.vars,
		scrollTrigger
	);

	const fromVars = createStepVars(
		step.fromVars
	);

	return {
		vars,
		fromVars,
		scrollTrigger,
	};
}

/**
 * addSetStep
 *
 * Adds one `set()` operation to an existing GSAP Timeline.
 *
 * All generic configuration processing is delegated to ${@link prepareStepVars()}
 * This function is therefore responsible
 * only for the GSAP-specific `timeline.set()` call.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by this step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @sample
 * addSetStep(
 *   timeline,
 *   heroElement,
 *   {
 *     target: ".hero",
 *     type: "set",
 *     vars: {
 *       opacity: 0,
 *     },
 *   },
 *   "single",
 *   heroElement
 * );
 *
 * @sample
 * addSetStep(
 *   timeline,
 *   cards,
 *   {
 *     target: ".card",
 *     type: "set",
 *     vars: {
 *       y: 40,
 *     },
 *     scrollTrigger: {
 *       trigger: ".cards-section",
 *       start: "top 80%",
 *     },
 *   },
 *   "group"
 * );
 */
function addSetStep(
	timeline,
	target,
	step,
	targetMode,
	defaultTrigger
) {
	const { vars } = prepareStepVars(
		step,
		targetMode,
		defaultTrigger
	);

	timeline.set(
		target,
		vars,
		step.position
	);
}

/**
 * addFromStep
 *
 * Adds one `from()` operation to an existing GSAP Timeline.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by this step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @sample
 * addFromStep(
 *   timeline,
 *   titleElement,
 *   {
 *     target: ".title",
 *     type: "from",
 *     vars: {
 *       opacity: 0,
 *       y: 50,
 *       duration: 0.8,
 *     },
 *   },
 *   "single",
 *   titleElement
 * );
 *
 * @sample
 * addFromStep(
 *   timeline,
 *   textElements,
 *   {
 *     target: ".text",
 *     type: "from",
 *     vars: {
 *       opacity: 0,
 *     },
 *     scrollTrigger: {
 *       start: "top 80%",
 *     },
 *   },
 *   "each",
 *   cardElement
 * );
 */
function addFromStep(
	timeline,
	target,
	step,
	targetMode,
	defaultTrigger
) {
	const { vars } = prepareStepVars(
		step,
		targetMode,
		defaultTrigger
	);

	timeline.from(
		target,
		vars,
		step.position
	);
}

/**
 * addToStep
 *
 * Adds one `to()` operation to an existing GSAP Timeline.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by this step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @sample
 * addToStep(
 *   timeline,
 *   buttonElement,
 *   {
 *     target: ".button",
 *     type: "to",
 *     vars: {
 *       scale: 1.1,
 *       duration: 0.4,
 *     },
 *   },
 *   "single",
 *   buttonElement
 * );
 *
 * @sample
 * addToStep(
 *   timeline,
 *   cards,
 *   {
 *     target: ".card",
 *     type: "to",
 *     vars: {
 *       opacity: 1,
 *     },
 *     scrollTrigger: {
 *       trigger: ".cards",
 *       start: "top 80%",
 *     },
 *   },
 *   "group"
 * );
 */
function addToStep(
	timeline,
	target,
	step,
	targetMode,
	defaultTrigger
) {
	const { vars } = prepareStepVars(
		step,
		targetMode,
		defaultTrigger
	);

	timeline.to(
		target,
		vars,
		step.position
	);
}

/**
 * addFromToStep
 *
 * Adds one `fromTo()` operation to an existing GSAP Timeline.
 *
 * `fromVars` defines the initial animation state and `vars`
 * defines the destination state.
 *
 * ScrollTrigger configuration is attached to the destination
 * vars object through `prepareStepVars()`.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline instance.
 *
 * @param {Element | Element[]} target
 * Element or collection of Elements animated by this step.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @param {TTargetMode} targetMode
 * Current target mode.
 *
 * @param {Element} [defaultTrigger]
 * Contextual Element used as an implicit ScrollTrigger trigger.
 *
 * @returns {void}
 *
 * @sample
 * addFromToStep(
 *   timeline,
 *   heroElement,
 *   {
 *     target: ".hero",
 *     type: "fromTo",
 *     fromVars: {
 *       opacity: 0,
 *       y: 80,
 *     },
 *     vars: {
 *       opacity: 1,
 *       y: 0,
 *       duration: 1,
 *     },
 *   },
 *   "single",
 *   heroElement
 * );
 *
 * @sample
 * addFromToStep(
 *   timeline,
 *   cardElement,
 *   {
 *     target: ".card__image",
 *     type: "fromTo",
 *     fromVars: {
 *       scale: 0.8,
 *     },
 *     vars: {
 *       scale: 1,
 *       duration: 0.7,
 *     },
 *     scrollTrigger: {
 *       start: "top 80%",
 *     },
 *   },
 *   "each",
 *   cardElement
 * );
 */
function addFromToStep(
	timeline,
	target,
	step,
	targetMode,
	defaultTrigger
) {
	const {
		fromVars,
		vars,
	} = prepareStepVars(
		step,
		targetMode,
		defaultTrigger
	);

	timeline.fromTo(
		target,
		fromVars,
		vars,
		step.position
	);
}

//////////////////// GSAP ANIMATIONS ////////////////////////////
/**
 * Initializes all page animations and animation-related event handlers.
 *
 * The function is the main runtime entry point for the site's animation system.
 * It lazily loads GSAP and ScrollTrigger, resolves the current page names,
 * creates shared burger-navigation handlers, and runs both common and
 * page-specific animation builders.
 *
 * Animation execution is delegated to {@link runPageAnimations}, which
 * determines which page-specific animations should run based on the
 * resolved page names.
 *
 * If GSAP or ScrollTrigger cannot be loaded, initialization is aborted
 * and the error is reported through {@link logInitError}.
 *
 * @async
 * @returns {Promise<void>}
 */
export async function initAnimations() {

	const gsapAll = await getGSAP();

	if (!gsapAll) {
		logInitError({
			component: "initAnimations",
			message: `gsap is not loaded... omitting...`,
			details: gsapAll
		});

		return;
	}

	const {
		gsap,
		ScrollTrigger
	} = gsapAll;

	/**
	 * Runtime collection of valid page names.
	 *
	 * The collection is derived from the page navigation anchors and is used
	 * by {@link runPageAnimations} to determine which page-specific
	 * animations should be initialized.
	 *
	 * @type {Set<TPageName>}
	 */
	const pageNames = createPageNameSet(linkAnchors);


	/**
	 * Animation builders available for the current application.
	 *
	 * `common` contains animations and interaction handlers shared by all pages.
	 * Page-specific builders are keyed by {@link TPageName}.
	 *
	 * @type {TPageAnimations}
	 */
	const pageAnimations = {
		automation: () => {
/*			buildParallax(
				gsap,
				SELECTORS.automationParallaxBg,
				SELECTORS.automationParallax
			);*/
		},
		common: () => {
			//Hero section priority...
			buildHeroTimeline(
				gsap,
				"heroAnimation",
				heroTimelineParams
			);

			//initializing burger handlers, build and register animation timeline...
			initBurgerMenu(
				gsap,
				navMenuSelectorsData,
				burgerNavTimelineParams
			);


	/*		buildParallax(gsap, SELECTORS.servicesParallaxBg, SELECTORS.servicesParallax);
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
			buildScrolledNav(gsap);*/
		}
	};

	runPageAnimations(pageAnimations, pageNames);
}

/**
 * Initializes common and page-specific animations.
 *
 * Common animations are always executed.
 * Page-specific animations are executed only when a corresponding
 * animation function has been registered for the current page.
 *
 * @param {TPageAnimations} animations
 * @param {ReadonlySet<string>} pageNames
 *
 * @returns {void}
 */
function runPageAnimations(animations, pageNames) {
	const pageName = getCurrentPageName(pageNames);

	// Common animations are mandatory.
	animations.common();

	// Stop when the current page name is missing or invalid.
	if (!pageName) {
		return;
	}

	const pageAnimation = animations[pageName];

	// Page-specific animations are optional.
	if (!pageAnimation) {
		return;
	}

	pageAnimation();
}

/**
 * Initializes the complete Burger navigation subsystem.
 *
 * This function acts as the composition layer for Burger navigation.
 *
 * It coordinates:
 *
 * 1. DOM dependency resolution;
 * 2. Timeline construction;
 * 3. Event callback creation;
 * 4. Burger listener attachment;
 * 5. Outside-click listener attachment.
 *
 * The individual responsibilities remain delegated:
 *
 *     requireElements()
 *         → resolves DOM dependencies
 *
 *     buildTimeline()
 *         → builds and registers the animation
 *
 *     initBurgerHandlers()
 *         → creates event callbacks
 *
 *     initBurgerListener()
 *         → handles Burger trigger interaction
 *
 *     closeBurgerClickHandler()
 *         → handles outside-click behavior
 *
 * This function intentionally contains no animation implementation
 * and no event-handling logic of its own.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance.
 *
 * @param {TNavMenuSelector[]} selectors
 * Selector configuration for Burger navigation DOM dependencies.
 *
 * @param {TSingleTimelineParams} timelineParams
 * Declarative configuration for the Burger navigation Timeline.
 *
 * @returns {void}
 */
function initBurgerMenu(
	gsap,
	selectors,
	timelineParams
) {
	/**
	 * Resolve all Burger-related DOM dependencies once.
	 *
	 * The type assertion is intentionally placed at the boundary
	 * between the generic DOM utility and the Burger-specific subsystem.
	 */
	const burgerElementsData =
		/** @type {TBurgerElements} */
		(requireElements(selectors));

	/**
	 * Extract the Burger trigger collection.
	 *
	 * These Elements are needed only to attach the callbacks created
	 * by initBurgerHandlers().
	 */
	const {
		burgerNavAll
	} = burgerElementsData;

	/**
	 * Build the Burger navigation Timeline.
	 *
	 * The Timeline is already configured with its declared initial
	 * runtime state and registered in the animation cache by the builder.
	 */
	const navMenuAnime = buildSingleTimeline(
		gsap,
		timelineParams
	);

	/**
	 * Initialize callbacks that control the Burger navigation.
	 *
	 * initBurgerHandlers() does not attach listeners itself.
	 * It only creates callback functions with the required dependencies
	 * closed over.
	 */
	const {
		closeBurgerHandler,
		attachBurgerListener
	} = initBurgerHandlers(
		burgerElementsData,
		navMenuAnime
	);

	/**
	 * Attach the Burger click handler to every resolved trigger.
	 *
	 * DOM lookup is not repeated here because all required Elements
	 * were resolved once at the beginning of this function.
	 */
	burgerNavAll.forEach(
		(burger) => attachBurgerListener(burger)
	);

	/**
	 * Attach the document-level outside-click handler.
	 */
	document.addEventListener(
		"click",
		closeBurgerHandler
	);
}


/**
 * Initializes Burger navigation event callbacks.
 *
 * This function is intentionally limited to event-handler composition.
 * It does not:
 *
 * - resolve DOM elements;
 * - create GSAP animations;
 * - register animations in the animation cache;
 * - attach event listeners.
 *
 * All required runtime dependencies are supplied by the caller.
 *
 * The function creates closures around `burgerElementsData` and
 * `navMenuAnime`, allowing the returned callbacks to be used directly
 * with DOM event APIs.
 *
 * @param {TBurgerElements} burgerElementsData
 * Resolved DOM elements required by Burger navigation.
 *
 * @param {TTimeline} navMenuAnime
 * GSAP Timeline controlling the fixed navigation menu.
 *
 * @returns {{
 *     closeBurgerHandler: (e: MouseEvent) => void,
 *     attachBurgerListener: (burger: Element) => void
 * }}
 * Event callbacks used by the Burger navigation initializer.
 */
function initBurgerHandlers(
	burgerElementsData,
	navMenuAnime
) {
	/**
	 * Creates the document-level click callback.
	 *
	 * The callback delegates the actual behavior to
	 * `closeBurgerClickHandler()`.
	 *
	 * @param {MouseEvent} e
	 * Mouse click event.
	 *
	 * @returns {void}
	 */
	const closeBurgerHandler = (e) => {
		closeBurgerClickHandler(
			e,
			burgerElementsData,
			navMenuAnime
		);
	};

	/**
	 * Creates a callback that attaches the Burger click handler
	 * to one specific Burger trigger.
	 *
	 * The actual interaction logic remains inside
	 * `initBurgerListener()`.
	 *
	 * @param {Element} burger
	 * Burger navigation trigger.
	 *
	 * @returns {void}
	 */
	const attachBurgerListener = (burger) => {
		initBurgerListener(
			burger,
			burgerElementsData,
			navMenuAnime
		);
	};

	return {
		closeBurgerHandler,
		attachBurgerListener,
	};
}


/**
 * Initializes the click listener for one Burger navigation trigger.
 *
 * The listener toggles the ARIA state of the Burger controls,
 * controls document scrolling, and drives the supplied GSAP Timeline.
 *
 * Opening the navigation plays the Timeline.
 * Closing the navigation reverses the Timeline.
 *
 * @param {Element} burger
 * Burger navigation trigger element.
 *
 * @param {TBurgerElements} burgerElementsData
 * Resolved DOM elements required by the navigation.
 *
 * @param {TTimeline} navMenuAnime
 * GSAP Timeline controlling the fixed navigation menu.
 *
 * @returns {void}
 */
function initBurgerListener(
	burger,
	burgerElementsData,
	navMenuAnime
) {
	const {
		burgerHidden,
		burgerFixed,
		navMenuFixed,
	} = burgerElementsData;

	burger.addEventListener("click", (e) => {
		// Prevent the browser's default action for the Burger control.
		e.preventDefault();

		const isExpanded =
			burger.getAttribute("aria-expanded") === "true";

		// Keep all Burger-related ARIA states synchronized.
		setAttributes(
			[
				burgerHidden,
				burgerFixed,
				navMenuFixed,
			],
			{
				"aria-expanded": !isExpanded,
			}
		);

		if (isExpanded) {

			// Restore the default scrollbar behavior.
			restoreDocumentScroll();

			// Reverse the Timeline to hide the navigation.
			navMenuAnime.reverse();

			return;
		}

		// Preserve the scrollbar width while the navigation is open.
		lockDocumentScroll();

		// Play the Timeline to reveal the navigation.
		navMenuAnime.play();
	});
}

/**
 * Handles a document click used to close the Burger navigation.
 *
 * The navigation is closed only when:
 *
 * 1. the event target is a DOM Element;
 * 2. the click occurs outside the Burger navigation;
 * 3. the navigation is currently expanded.
 *
 * @param {MouseEvent} e
 * Document click event.
 *
 * @param {TBurgerElements} burgerElementsData
 * Resolved Burger navigation DOM elements.
 *
 * @param {TTimeline} navMenuAnime
 * GSAP Timeline controlling the fixed navigation menu.
 *
 * @returns {void}
 */
function closeBurgerClickHandler(
	e,
	burgerElementsData,
	navMenuAnime
) {
	// Ignore events whose target is not a DOM Element.
	if (!(e.target instanceof Element)) {
		return;
	}

	// Ignore clicks originating inside the Burger navigation.
	if (e.target.closest(SELECTORS.burgerNav)) {
		return;
	}

	const {
		burgerHidden,
		burgerFixed,
		navMenuFixed,
	} = burgerElementsData;

	const isNavActive =
		navMenuFixed.getAttribute("aria-expanded") === "true";

	// Nothing to close when the navigation is already collapsed.
	if (!isNavActive) {
		return;
	}

	// Synchronize the ARIA state of all Burger controls.
	setAttributes(
		[
			burgerHidden,
			burgerFixed,
			navMenuFixed,
		],
		{
			"aria-expanded": false,
		}
	);

	// Reverse the Timeline to hide the fixed navigation.
	navMenuAnime.reverse();

	// Restore document scrolling.
	document.body.style.overflow = "auto";
}



/**
 * Creates a runtime collection of registered page names.
 *
 * The type assertion is intentionally localized here because
 * `Object.keys()` widens its result to `string[]`.
 *
 * @param {typeof linkAnchors} anchors
 *
 * @returns {Set<TPageName>}
 */
function createPageNameSet(anchors) {
	return new Set(
		/** @type {TPageName[]} */
		(Object.keys(anchors))
	);
}

/**
 * Builds and registers the Hero section entrance animation Timeline.
 *
 * @param {TGsap} gsap
 * @param {string} key
 * @param {TGroupTimelineParams} params
 * @returns {TTimeline}
 */
function buildHeroTimeline(gsap, key, params) {
//Есть ли смысл создавать функцию, которая возвращает выполнение иной функции?
	return buildGroupTimeline(gsap, key, params);
}



// ============================================
// BUILDER FUNCTIONS (accept gsap instance)
// ============================================

/**
 * Builds and registers the hero section entrance animation timeline.
 *
 * The builder assumes that GSAP has already been successfully initialized.
 * DOM target resolution is delegated to GSAP.
 *
 * @param {TGsap} gsap - Initialized GSAP instance.
 * @param {string} tlName - Cache key for the created animation.
 * @returns {TTimeline}
 */
function buildHeroTimelineVer(gsap, tlName) {
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

	registerAnimation(tlName, tlHero);

	return tlHero;
}

/**
 * Builds the scrolled navigation show/hide animation.
 *
 * @param {TGsap} gsap - GSAP instance
 * @throws {Error} if the Element with the given selector is not found in DOM...
 * @returns {TTween}
 */
function buildScrolledNav(gsap) {
	/**
	 * target is used for registering animation with {@link registerAnimation} args: (Element|string, core.Tween)
	 * we cannot use selector as the key because of multiple Elements with the same selector...
	 * therefore we use separate Element as the key for the current animation
	 * in order to avoid the Element which is not found in DOM we throw Error
	 * finally buildScrolledNav
	 */
	const target = getDOMElement(SELECTORS.scrolledNav);
	if (!target) {
		throw TypeError(`[buildScrolledNav]: target ${SELECTORS.scrolledNav} not found in DOM...`);
	}

	const tween = gsap.to(
		SELECTORS.scrolledNav,
		{
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

	registerAnimation(target, tween);

	return tween;
}

/**
 * Builds a parallax background effect using GSAP's ScrollTrigger plugin.
 *
 * ScrollTrigger must be registered with GSAP before this function is called.
 * The created tween is registered in the animation cache using the target
 * element as its key.
 *
 * @param {TGsap} gsap - GSAP instance.
 * @param {string} targetSelector - Selector for the parallax target.
 * @param {string} triggerSelector - Selector for the ScrollTrigger container.
 *
 * @throws {Error} if target with the given selector is not in DOM
 *
 * @returns {TTween}
 */
function buildParallax(gsap, targetSelector, triggerSelector) {
	/**
	 * Use the target Element as the animation identity.
	 * Parallax animations are created by a generic builder, so a unique
	 * application-level name is neither required nor naturally available.
	 */
	const target = getDOMElement(targetSelector);
	if (!target) {
		throw new Error(
			`[buildParallax]: target selector "${targetSelector}" does not exist in DOM.`
		);
	}

	const tween = gsap.fromTo(target,
		{ yPercent: 10 },
		{
			yPercent: -10,
			ease: "none",
			scrollTrigger: {
				trigger: triggerSelector,
				start: "top bottom",
				end: "bottom top",
				scrub: 1.5,
				invalidateOnRefresh: true,
			}
		}
	);


	//caching Tween to js/partials/gsap-loader.js
	registerAnimation(target, tween);

	return tween;
}

/**
 * Builds fade-in animations for elements matching a selector.
 * Each element's timeline is cached individually to js/partials/gsap-loader.js
 *
 * @param {TGsap} gsap - GSAP instance
 * @param {string} targetSelector - CSS selector for target elements
 * @param {Object} fromParams - gsap.from parameters (entrance motion)
 * @returns {TTimeline[]}
 */
function buildFadeAnimations(gsap, targetSelector, fromParams) {


	return initAllTimelinesFromTo(
		gsap,
		targetSelector,
		{ gsapFrom: fromParams },
		{ opacity: 1, duration: 0.7, delay: 0.2 },
	);
}


/**
 * Builds gallery image fade-in animations.
 *
 * @param {TGsap} gsap - GSAP instance
 * @param {HTMLElement[]} elemsArr - Gallery image elements
 * @returns {TTimeline} Timeline references
 */
function buildGalleryFade(gsap, elemsArr) {


	initAllTimelinesFromTo(
		gsap,
		elemsArr,
		document.querySelector(SELECTORS.galleryWork),
		{ opacity: 1, duration: 0.8, delay: 0.2 },
		{ scale: 0.7, duration: 1, ease: "back.out" }
	);
}

// ============================================
// BURGER MENU (returns handlers + tween)
// ===========================================

/*function openBurger() {
	document.addEventListener("click", closeBurgerHandler);
}

function closeBurger() {
	document.removeEventListener("click", closeBurgerHandler);
}*/


/**
 * Returns the current page name from the `<body data-type="...">`
 * attribute.
 *
 * The value is validated against the supplied runtime collection
 * of registered page names.
 *
 * @param {ReadonlySet<string>} pageNames
 *
 * @returns {TPageName | null}
 */
function getCurrentPageName(pageNames) {
	const pageName = document.body?.dataset?.type || null;

	if (!pageName) {
		logInitError({
			component: "getCurrentPageName",
			message: "<body> does not have a data-type attribute.",
			details: {
				dataset: document.body?.dataset
			}
		});

		return null;
	}

	if (!isPageName(pageName, pageNames)) {
		logInitError({
			component: "getCurrentPageName",
			message: `Unknown page name "${pageName}".`,
			details: {
				registeredPages: [...pageNames]
			}
		});

		return null;
	}

	return pageName;
}

/**
 * Checks whether a string is a registered page name.
 *
 * This function also acts as a TypeScript type guard and narrows
 * the value from `string` to `TPageName`.
 *
 * @param {string} value
 * @param {ReadonlySet<string>} pageNames intentionally wider
 *
 * @returns {value is TPageName}
 */
function isPageName(value, pageNames) {
	return pageNames.has(value);
}






//const imageItems = await createMasonry(gallerySelector, { gap: 20 });
//fadeInGallery(imageItems);

//const timelines = fadeInGallery(imageItems);
//Object.assign(totalTl, timelines);
/*function fadeInGallery(elemsArr = []) {
	return buildGalleryFade(gsap, elemsArr);
}*/

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
/*function onPageLoaded(animationData) {
	const pageName = document.body.dataset.type || "";
	const totalTl = {};
	if (animationData.common) Object.assign(totalTl, animationData.common());
	if (pageName in animation)....

 */