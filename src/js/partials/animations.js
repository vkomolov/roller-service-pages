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
	lockDocumentScroll,
	restoreDocumentScroll,
	setDocumentScrollLocked,
	checkHtmlElement,
	isHTMLElement,
} from "../helpers/funcsDOM.js";
import {
	getGSAP,
	registerAnimation,
	getAnimation,
	killAnimation, isRegisteredAnimation
} from "./gsap-loader.js";
import {
	getInvalidKeys,
	isKeyOf,
	isInSet,
	createKeySet,
	tryUse,
	initLog,
} from "../helpers/funcs.js";


import { linkAnchors, SELECTORS, navMenuSelectorsData } from "./initialSelectors.js";
import {
	burgerNavTimelineParams,
	heroTimelineParams,
	automationParallaxTimelineParams,
	servicesParallaxTimelineParams,
	fadeInLeftTimelineParams,
	fadeInRightTimelineParams,
	scaleInTimelineParams,
	fadeInUpTimelineParams,
	scrolledNavTimelineParams
} from "./animationParams.js";

//****** TYPE DEFINITIONS *******//

/**
 *! DOM type aliases used by this module.
 *
 * @typedef {import("../types/dom.types.js").TBurgerElements} TBurgerElements
 * @typedef {import("../types/dom.types.js").TDOMSelectorConfig} TDOMSelectorConfig
 * @typedef {import("../types/dom.types.js").TNavMenuSelector} TNavMenuSelector
 * @typedef {import("../types/dom.types.js").TBurgerHandlersData} TBurgerHandlersData
 *
 */

/**
 *! GSAP ANIMATIONS type aliases used by this module.
 *
 * @typedef {import("../types/animations.types.js").TPageName} TPageName
 * @typedef {import("../types/animations.types.js").TLinkAnchors} TLinkAnchors
 * @typedef {import("../types/animations.types.js").TPageAnimation} TPageAnimation
 * @typedef {import("../types/animations.types.js").TPageAnimations} TPageAnimations
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


/// TIMELINE BUILDERS ///

/**
 * Validates the steps of a Timeline configuration.
 *
 * A Timeline must contain at least one step before it can be built.
 *
 * @param {TTimelineStep[]} steps
 * Timeline steps to validate.
 *
 * @param {string} [builderName="Animation Builder"]
 * Name of the builder used to identify the error source.
 *
 * @returns {void}
 *
 * @throws {TypeError}
 * When `steps` is not an Array.
 *
 * @throws {Error}
 * When `steps` is an empty Array.
 */
function validateTimelineSteps(
	steps,
	builderName = "Animation Builder"
) {
	if (!Array.isArray(steps)) {
		console.error("steps is not an Array", steps);

		throw new TypeError(
			`[${builderName}]: steps must be an Array.`
		);
	}

	if (!steps.length) {
		console.error("steps is an empty Array", steps);

		throw new Error(
			`[${builderName}]: steps cannot be empty.`
		);
	}
}

/**
 * Resolves the unique DOM root Element of a single Timeline.
 *
 * The root defines the DOM scope used to resolve all step targets.
 * It is independent from the Timeline's ScrollTrigger configuration.
 *
 * A single Timeline requires exactly one root Element.
 *
 * @param {string} rootSelector
 * CSS selector identifying the Timeline root.
 *
 * @returns {Element}
 * The resolved root Element.
 *
 * @throws {Error}
 * When no Element matches `rootSelector`.
 *
 * @throws {Error}
 * When multiple Elements match `rootSelector`.
 */
function resolveSingleTimelineRoot(rootSelector) {
	const roots = getElements(
		rootSelector,
		document,
		true,
		false
	);

	if (!roots.length) {
		throw new Error(
			`[resolveSingleTimelineRoot]: root selector ` +
			`"${rootSelector}" does not exist in DOM.`
		);
	}

	if (roots.length > 1) {
		throw new Error(
			`[resolveSingleTimelineRoot]: root selector ` +
			`"${rootSelector}" has multiple Elements in DOM, ` +
			`but exactly one is required.`
		);
	}

	return roots[0];
}

/**
 * Normalizes the GSAP vars of a Timeline step.
 *
 * The declarative Timeline step configuration allows `vars` and
 * `fromVars` to be optional. This function converts them into a
 * stable structure where both properties are always present.
 *
 * `vars` is used as:
 *
 * - the target vars for `set()`;
 * - the starting vars for `from()`;
 * - the destination vars for `to()`;
 * - the destination vars for `fromTo()`.
 *
 * `fromVars` is used only by and with `fromTo()`.
 *
 * A `fromVars` object requires `vars` because `fromTo()` needs
 * both an initial and a destination state.
 *
 * @param {TTimelineStep} step
 * Timeline step configuration.
 *
 * @returns {TTimelineStepVars}
 * Normalized GSAP vars for the Timeline operation.
 *
 * @throws {Error}
 * When `fromVars` is provided without `vars`.
 *
 * @throws {Error}
 * When `vars` is empty.
 *
 * @example
 * // Normalize vars for a regular Timeline operation.
 * const stepVars = normalizeStepVars({
 *   target: ".title",
 *   type: "from",
 *   vars: {
 *     opacity: 0,
 *     y: 40,
 *   },
 * });
 *
 * @example
 * // Normalize both initial and destination vars for `fromTo()`.
 * const stepVars = normalizeStepVars({
 *   target: ".title",
 *   type: "fromTo",
 *   fromVars: {
 *     opacity: 0,
 *   },
 *   vars: {
 *     opacity: 1,
 *   },
 * });
 */
function normalizeStepVars(step) {
	if (step.fromVars && !step.vars) {
		throw new Error(
			`[normalizeStepVars]: step.vars is required when ` +
			`step.fromVars is provided. ` +
			`Target: "${step.target}".`
		);
	}

	const vars = {
		...(step.vars ?? {}),
	};

	const fromVars = {
		...(step.fromVars ?? {}),
	};

	if (!Object.keys(vars).length) {
		throw new Error(
			`[normalizeStepVars]: step.vars cannot be empty. ` +
			`Target: "${step.target}".`
		);
	}

	return {
		vars,
		fromVars,
	};
}

/**
 * Adds one configured animation step to a GSAP Timeline.
 *
 * The operation is selected from `step.type`.
 *
 * This function is intentionally limited to dispatching the step
 * to the corresponding GSAP Timeline method. Target resolution,
 * Timeline creation, and ScrollTrigger configuration are handled
 * by higher-level builders.
 *
 * @param {TTimeline} timeline
 * Existing GSAP Timeline instance.
 *
 * @param {Element | Element[]} targets
 * Resolved Element or collection of Elements to animate.
 *
 * @param {TTimelineStep} step
 * Declarative configuration of the Timeline step.
 *
 * @returns {void}
 *
 * @throws {TypeError}
 * When `step.type` is not a supported Timeline operation.
 */
function addTimelineStep(
	timeline,
	targets,
	step,
) {
	const { vars, fromVars } = normalizeStepVars(step);

	switch (step.type) {
		case "set":
			timeline.set(
				targets,
				vars,
				step.position,
			);
			break;

		case "from":
			timeline.from(
				targets,
				vars,
				step.position,
			);
			break;

		case "to":
			timeline.to(
				targets,
				vars,
				step.position,
			);
			break;

		case "fromTo":
			timeline.fromTo(
				targets,
				fromVars,
				vars,
				step.position,
			);
			break;

		default:
			throw new TypeError(
				`[addTimelineStep]: unsupported step type "${step.type}".`,
			);
	}
}

/**
 * Resolves and adds all configured animation steps to a GSAP Timeline.
 *
 * Each step target is resolved within the supplied DOM search root.
 * The resolved Elements are then passed to addTimelineStep(), which
 * appends the corresponding GSAP operation to the Timeline.
 *
 * The function is independent of Timeline mode (`single` or `group`).
 * The caller determines the appropriate DOM search root:
 *
 * - `Document` for group-wide target resolution;
 * - `Element` for single-root target resolution.
 *
 * @param {TTimeline} timeline
 * GSAP Timeline that receives the animation steps.
 *
 * @param {TTimelineStep[]} steps
 * Declarative animation step configurations.
 *
 * @param {Element | Document} searchRoot
 * DOM root used to resolve step targets.
 *
 * @param {boolean} [includeContextAsTarget=true]
 * it happens that context (parent) Element has the same selector as target in search at steps[N].target
 * In this case the resulting array of the searched Elements will be unshift with context Element
 * as the target Element of the timeline
 *
 * @returns {void}
 *
 * @throws {Error}
 * When a step target cannot be resolved within `searchRoot`.
 */
function addTimelineSteps(
	timeline,
	steps,
	searchRoot,
	includeContextAsTarget = true
) {
	for (const step of steps) {
		const targets = getElements(
			step.target,
			searchRoot,
			true,
			includeContextAsTarget
		);

		if (!targets.length) {
			throw new Error(
				`[addTimelineSteps]: target "${step.target}" ` +
				"was not found within the specified search root.",
			);
		}

		addTimelineStep(
			timeline,
			targets,
			step,
		);
	}
}

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
 */
function buildTimeline(
	gsap,
	params,
	key
) {
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
				params,
				key,
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
 * Creates a GSAP Timeline with shared timeline-level configuration.
 *
 * This function centralizes the common Timeline initialization used by
 * all timeline builders.
 *
 * `paused` controls the initial playback state.
 *
 * `scrollTrigger`, when provided, is attached to the Timeline itself.
 * ScrollTrigger is intentionally configured at the Timeline level rather
 * than on individual child tweens.
 *
 * @param {TGsap} gsap - GSAP instance used to create the Timeline.
 * @param {TTimelineParams} params - Timeline configuration.
 * @returns {TTimeline} The newly created GSAP Timeline.
 */
function createTimeline(gsap, params) {
	return gsap.timeline({
		paused: params.paused ?? false,

		...(params.scrollTrigger && {
			scrollTrigger: params.scrollTrigger,
		}),
	});
}

/**
 * Resolves Timeline parameters for a specific DOM context.
 *
 * In `each` mode, when the ScrollTrigger `trigger` explicitly matches
 * the configured `scope`, the selector is resolved to the current
 * scope Element.
 *
 * Other Timeline modes and ScrollTrigger configurations are returned
 * unchanged.
 *
 * @param {TTimelineParams} params - Timeline configuration.
 * @param {Element | Document} searchRoot - DOM context of the Timeline.
 * @returns {TTimelineParams} Resolved Timeline configuration.
 */
function resolveTimelineParams(params, searchRoot) {
	if (
		params.targetMode !== "each" ||
		!(searchRoot instanceof Element) ||
		!params.scrollTrigger
	) {
		return params;
	}

	const trigger = params.scrollTrigger.trigger;

	if (
		trigger === undefined ||
		trigger !== params.scope
	) {
		return params;
	}

	return {
		...params,
		scrollTrigger: {
			...params.scrollTrigger,
			trigger: searchRoot,
		},
	};
}

/***
 Builds, populates, and registers one GSAP Timeline.
 * This function centralizes the common Timeline construction pipeline
 * shared by all target-mode builders.
 * The construction process is:
 * 1. Validate Timeline steps.
 * 2. Create the Timeline with its common configuration.
 * 3. Resolve and add all configured steps within the supplied DOM root.
 * 4. Register the completed Timeline under the supplied cache key (string|Element).*
 *
 * Target-mode-specific logic is intentionally handled by the caller.
 * The caller is responsible for resolving the appropriate searchRoot
 * and determining the correct animationKey.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance used to create the Timeline.
 * @param {TTimelineParams} params
 * Complete Timeline configuration, including its steps and
 * optional Timeline-level configuration.
 * @param {Document | Element} searchRoot
 * DOM context used to resolve the selectors defined by
 * @param {TAnimationKey} animationKey
 * Cache key used to register the created Timeline.
 *
 * @throws {TypeError}
 * When params.steps is not an Array.
 * @throws {Error}
 * When params.steps is an empty Array or when a step target
 * cannot be resolved within searchRoot.
 *
 * @returns {TTimeline}
 * The created, populated, and registered GSAP Timeline.
 *
 * @example
 * Build and register a Timeline using a single Element as
 * the DOM search root and the same Element as its cache identity.
 * const timeline = buildAndRegisterTimeline(
 * gsap,
 * singleTimelineParams,
 * rootElement,
 * rootElement,
 * );
 *
 * @example
 * Build and register a group Timeline using the Document
 * as the search root and a named string as its cache identity.
 * const timeline = buildAndRegisterTimeline(
 * gsap,
 * groupTimelineParams,
 * document,
 * "heroAnimation",
 * );
 *
 */
function buildAndRegisterTimeline(
	gsap,
	params,
	searchRoot,
	animationKey,
) {
	validateTimelineSteps(
		params.steps,
		"buildAndRegisterTimeline",
	);

	const timelineParams = resolveTimelineParams(params, searchRoot);

	const timeline = createTimeline(gsap, timelineParams);

	addTimelineSteps(
		timeline,
		timelineParams.steps,
		searchRoot,
		true
	);

	registerAnimation(
		animationKey,
		timeline,
	);
	return timeline;
}

/**
 * Builds and registers one GSAP Timeline for a single DOM root.
 *
 * The single mode creates exactly one Timeline from exactly one
 * resolved root Element.
 *
 * The resolved root serves two purposes:
 *
 * 1. It defines the DOM search scope for all `params.steps`.
 * 2. It provides the default Element-based cache identity when
 *    an explicit `key` is not supplied.
 *
 * The root and `scrollTrigger.trigger` have independent responsibilities:
 *
 *     root
 *       ↓
 *     resolves step targets
 *
 *     scrollTrigger.trigger
 *       ↓
 *     controls Timeline playback
 *
 * The root Element may also become a step target when a step selector
 * matches the root itself and no matching descendants are found.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance used to create the Timeline.
 *
 * @param {TSingleTimelineParams} params
 * Configuration for the single Timeline.
 *
 * @param {TAnimationKey} [key]
 * Optional explicit cache key.
 * When omitted, the resolved root Element is used as the cache identity.
 *
 * @returns {TTimeline}
 * The created and registered GSAP Timeline.
 *
 * @throws {Error}
 * When `params.root` does not resolve to exactly one Element.
 *
 * @throws {TypeError}
 * When `params.steps` is not an Array.
 *
 * @throws {Error}
 * When `params.steps` is empty or a step target cannot be resolved.
 *
 * @example
 * const timeline = buildSingleTimeline(
 *   gsap,
 *   {
 *     targetMode: "single",
 *     root: ".hero",
 *     steps: [
 *       {
 *         target: ".hero__title",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *           y: 40,
 *           duration: 0.8,
 *         },
 *       },
 *     ],
 *   },
 * );
 *
 * @example
 * const timeline = buildSingleTimeline(
 *   gsap,
 *   singleTimelineParams,
 *   "heroAnimation",
 * );
 */
function buildSingleTimeline(
	gsap,
	params,
	key,
) {
	// Resolve the unique DOM root used as the step search context.
	const root = resolveSingleTimelineRoot(
		params.root,
	);

	// Use the explicit key when provided; otherwise use the root
	// Element as the natural identity for the animation cache.
	return buildAndRegisterTimeline(
		gsap,
		params,
		root,
		key ?? root,
	);
}

/**
 * Builds and registers one shared GSAP Timeline for a group of Elements.
 *
 * Group mode resolves all step selectors against the Document and passes
 * the complete matching Element collections to the same Timeline.
 *
 * Unlike `single` and `each` modes, group mode has no unique Element
 * that can serve as its implicit cache identity. A non-empty string
 * `key` is therefore required.
 *
 * The supplied key is used as the named identity in the animation cache.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance used to create the Timeline.
 *
 * @param {TGroupTimelineParams} params
 * Configuration for the shared group Timeline.
 *
 * @param {string} key
 * Non-empty string used as the Timeline's cache identity.
 *
 * @returns {TTimeline}
 * The created and registered GSAP Timeline.
 *
 * @throws {TypeError}
 * When `key` is not a non-empty string.
 *
 * @throws {TypeError}
 * When `params.steps` is not an Array.
 *
 * @throws {Error}
 * When `params.steps` is empty or a step target cannot be resolved.
 *
 * @example
 * const timeline = buildGroupTimeline(
 *   gsap,
 *   {
 *     targetMode: "group",
 *     steps: [
 *       {
 *         target: ".gallery-card",
 *         type: "from",
 *         vars: {
 *           opacity: 0,
 *           y: 40,
 *           duration: 0.8,
 *         },
 *       },
 *     ],
 *   },
 *   "galleryCards",
 * );
 *
 * @example
 * const timeline = buildGroupTimeline(
 *   gsap,
 *   groupTimelineParams,
 *   "heroAnimation",
 * );
 */
function buildGroupTimeline(
	gsap,
	params,
	key,
) {
	// Group mode requires an explicit named cache identity because
	// there is no single Element representing the entire group.
	if (
		typeof key !== "string" ||
		!key.trim()
	) {
		throw new TypeError(
			"[buildGroupTimeline]: key must be a non-empty string.",
		);
	}

	// Group targets are resolved against the entire Document.
	// `getElements()` cannot use Document as a context target, so
	// the context itself can never become an animation target.
	return buildAndRegisterTimeline(
		gsap,
		params,
		document,
		key,
	);
}

/**
 * Builds and registers one independent GSAP Timeline for each
 * Element matching `params.scope`.
 *
 * Each matched scope Element becomes the DOM search context for
 * the Timeline created for that scope.
 *
 * For example:
 *
 *     scope: ".card"
 *
 * produces:
 *
 *     .card #1 → Timeline #1
 *     .card #2 → Timeline #2
 *     .card #3 → Timeline #3
 *
 * Each scope Element is also used as the cache identity of its
 * corresponding Timeline. This maps naturally to the WeakMap-based
 * animation cache.
 *
 * Step targets are resolved independently inside each scope Element,
 * preventing selectors from one scope from resolving against another.
 *
 * @param {TGsap} gsap
 * Initialized GSAP instance used to create the Timelines.
 *
 * @param {TEachTimelineParams} params
 * Configuration for the per-scope Timelines.
 *
 * @returns {TTimeline[]}
 * One independent Timeline for each matched scope Element.
 *
 * @throws {TypeError}
 * When `params.scope` is not a non-empty string.
 *
 * @throws {TypeError}
 * When `params.steps` is not an Array.
 *
 * @throws {Error}
 * When `params.steps` is empty.
 *
 * @throws {Error}
 * When no Elements match `params.scope`.
 *
 * @example
 * const timelines = buildEachTimelines(
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
 *           duration: 0.8,
 *         },
 *       },
 *     ],
 *   },
 * );
 *
 * @example
 * const timelines = buildEachTimelines(
 *   gsap,
 *   eachTimelineParams,
 * );
 */
function buildEachTimelines(
	gsap,
	params,
) {
	// `scope` is the selector that defines the independent Timeline
	// instances, so validate it before performing the DOM lookup.
	if (
		typeof params.scope !== "string" ||
		!params.scope.trim()
	) {
		throw new TypeError(
			"[buildEachTimelines]: scope must be a non-empty string.",
		);
	}

	// Resolve every scope Element once. Each Element becomes the
	// search context and cache identity of its own Timeline.
	const scopeElements = getElements(
		params.scope,
		document,
		true,
		false,
	);

	if (!scopeElements.length) {
		throw new Error(
			`[buildEachTimelines]: no Elements matched scope selector ` +
			`"${params.scope}".`,
		);
	}

	return scopeElements.map(
		(scopeElement) =>
			buildAndRegisterTimeline(
				gsap,
				params,
				scopeElement,
				scopeElement,
			),
	);
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

			//restoreDocumentScroll();

			setDocumentScrollLocked(false);

			// Reverse the Timeline to hide the navigation.
			navMenuAnime.reverse();

			return;
		}

		// Preserve the scrollbar width while the navigation is open.

		//lockDocumentScroll();

		setDocumentScrollLocked(true);

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
	//restoreDocumentScroll();
	setDocumentScrollLocked(false);
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
		initLog("error",{
			component: "getCurrentPageName",
			message: "<body> does not have a data-type attribute.",
			details: {
				dataset: document.body?.dataset
			}
		});

		return null;
	}

	if (!isPageName(pageName, pageNames)) {
		initLog("error", {
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
 * and the error is reported through {@link initLog}.
 *
 * @async
 * @returns {Promise<void>}
 */
export async function initAnimations() {
	const gsapAll = await getGSAP();

	if (!gsapAll) {
		//initLog will log error in getGSAP()
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
			//parallax at gates-rollers-automation.html
			tryUse(buildSingleTimeline)(
				gsap,
				automationParallaxTimelineParams
			);
		},
		common: () => {
			//Hero section priority...
/*			tryUse(buildGroupTimeline)(
				gsap,
				heroTimelineParams,
				"heroAnimation",
			);*/

			//initializing burger handlers, build and register animation timeline...
			tryUse(initBurgerMenu)(
				gsap,
				navMenuSelectorsData,
				burgerNavTimelineParams
			);

			// parallax on services section on all pages
			tryUse(buildSingleTimeline)(
				gsap,
				servicesParallaxTimelineParams,
			);

			// separate timelines of Elements with common selector: fade-in-left
			tryUse(buildEachTimelines)(
				gsap,
				fadeInLeftTimelineParams,
			);

			// separate timelines of Elements with common selector: fade-in-right
			tryUse(buildEachTimelines)(
				gsap,
				fadeInRightTimelineParams
			);

			// separate timelines of Elements with common selector: scale-in
			tryUse(buildEachTimelines)(
				gsap,
				scaleInTimelineParams
			);

			// separate timelines of Elements with common selector: fade-in-up
			tryUse(buildEachTimelines)(
				gsap,
				fadeInUpTimelineParams
			);

			//the navigation panel show-on-scroll Timeline
			tryUse(buildSingleTimeline)(
				gsap,
				scrolledNavTimelineParams,
			);
		}
	};

	runPageAnimations(pageAnimations, pageNames);

	/**
	 *!! CRITICALLY IMPORTANT:
	 * Since initialization now happens lazily upon scrolling,
	 * we ask ScrollTrigger to immediately recalculate the coordinate map
	 * for all registered triggers on the page, accounting for the current offset.
	 */
	ScrollTrigger.refresh();
}


// TODO: LOWER IS TO REMAKE or DELETE


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
/*function buildFadeAnimations(gsap, selector, propKey, fromParams) {
	return getAllScrollTwoTweens(
		gsap,
		gsap.utils.toArray(document.querySelectorAll(selector)),
		null,
		propKey,
		{ opacity: 1, duration: 0.7, delay: 0.2 },
		fromParams
	);
}*/

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
/*function getAllScrollTwoTweens(gsap, elemsArr, triggerElem, propKey = "tlKey", gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
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
}*/

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
/*function getScrollTimelineTwoTweens(gsap, elem, triggerElem, gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
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
}*/

/**
 * Builds gallery image fade-in animations.
 *
 * @param {TGsap} gsap - GSAP instance
 * @param {HTMLElement[]} elemsArr - Gallery image elements
 */
/*function buildGalleryFade(gsap, elemsArr) {


	initAllTimelinesFromTo(
		gsap,
		elemsArr,
		document.querySelector(SELECTORS.galleryWork),  //"#gallery-work"
		{ opacity: 1, duration: 0.8, delay: 0.2 },
		{ scale: 0.7, duration: 1, ease: "back.out" }
	);
}*/

// ============================================
// BURGER MENU (returns handlers + tween)
// ===========================================

/*function openBurger() {
	document.addEventListener("click", closeBurgerHandler);
}

function closeBurger() {
	document.removeEventListener("click", closeBurgerHandler);
}*/

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

