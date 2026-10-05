"use strict";

/**
 * src/js/types/animations.types.js
 *
 * @file animations.types.js
 * @description GSAP ANIMATIONS type aliases used by this module.
 */

//// TYPE DEFINITIONS /////

/**
 * TLinkAnchors is the type of the exported linkAnchors object.
 *
 * @typedef {typeof import("../partials/initialSelectors.js").linkAnchors} TLinkAnchors
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


// Mark this file as an ES module without introducing runtime dependencies.
export {};