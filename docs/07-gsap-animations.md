# GSAP Animations

GSAP is a lazily loaded animation subsystem. Scroll-linked animations are described as
configuration objects, built into timelines by shared functions, and cached by element or
name.

## 1. Loading and initialization

The page resource list in `gulp/paths.js` deliberately does not include a static GSAP script.
`src/js/index.js` registers a one-time, passive `scroll` listener. On the first scroll it
calls `initAnimations()`:

1. `gsap-loader.js` dynamically imports `gsap-all.js`.
2. `gsap-all.js` re-exports GSAP and ScrollTrigger so Webpack can emit a single asynchronous
   chunk for them.
3. The loader registers ScrollTrigger with GSAP and caches the Promise, so concurrent calls
   share initialization.
4. `animations.js` builds common timelines and any timeline registered for the current
   `data-type` page.
5. It calls `ScrollTrigger.refresh()` after setup because initialization happens after
   scrolling may already have changed viewport positions.

If loading fails, the loader logs the failure, clears its cached Promise to allow a later
retry, and returns `null`. The caller then exits without creating timelines.

## 2. Where to edit

- **Selectors and constants:** `src/js/partials/initialSelectors.js`.
- **Animation parameters and step definitions:** `src/js/partials/animationParams.js`.
- **Timeline construction, page dispatch, and animation initialization:**
  `src/js/partials/animations.js`.
- **Dynamic import, cache, register/get/kill API:** `src/js/partials/gsap-loader.js`.
- **GSAP and ScrollTrigger aggregation module:** `src/js/partials/gsap-all.js`.
- **Initial state for reveal effects:** relevant SCSS rules, notably `src/scss/index.scss`.

Prefer changing a configuration object when only target, timing, easing, ScrollTrigger, or
step order changes. Change the builders only when a new kind of target resolution or timeline
behavior is needed.

## 3. Timeline configuration model

The builders support three target modes:

- `single`: resolve exactly one `root` element and build one timeline. The root scopes
  selectors and is the default cache identity.
- `group`: search the document and build a shared timeline registered by a string key.
- `each`: find every `scope` element and create a separate timeline for each one.

The `root`/`scope` that searches for step targets and `scrollTrigger.trigger` that controls
playback have independent roles. They may refer to the same element but need not. This matters
for `scrolledNavTimelineParams`: the navigation element is animated, but the Benefits section
triggers the timeline.

Each `steps` entry contains a CSS `target`, an operation `type` (`set`, `from`, `to`, or
`fromTo`), GSAP vars, and an optional timeline `position`. `fromTo` uses `fromVars` for its
initial state and `vars` for its destination. Timeline-level `scrollTrigger` options include
the trigger, start/end points, scrub, toggle actions, overlap behavior, and refresh behavior.

Current configuration objects include service and automation parallax, fade-in-left/right/up,
scale-in, and scrolled navigation. Common configurations are registered in the `common`
builder in `initAnimations()`; automation has a page-specific builder.

## 4. Adding an animation

1. Add or reuse the DOM selector in `initialSelectors.js`.
2. Add a typed configuration object to `animationParams.js`. Define its mode, root/scope,
   optional ScrollTrigger settings, and non-empty `steps`.
3. Import the configuration in `animations.js`.
4. Register its builder in `pageAnimations.common` for all pages, or under a valid page key
   from `linkAnchors` for a page-specific effect.
5. Add the matching `data-anime` attribute or structural selector in the HTML.
6. Set a deliberate initial visual state in CSS if the element must be hidden before GSAP
   starts. Ensure the final state remains visible when the animation runs.
7. Test a page with the target, one without it, and both scrolling directions. Confirm the
   trigger and target root are correct.

The builders validate that `steps` is a non-empty array, require non-empty vars, resolve
targets inside their search root, and register completed timelines in the shared cache. A
missing selector is an initialization error, not a valid zero-target animation.

## 5. Editing existing timelines

Keep timing values and ScrollTrigger behavior in the parameter object. Timeline positions such
as `"<"` place a step relative to the preceding step; changing positions can change overlap
and total duration. For reveal effects, the current configuration commonly uses a `to`
opacity step and a `from` transform step at `"<"` so both play together.

Change one behavior at a time and inspect the page at the trigger boundary. For parallax,
review the section's clipping, fixed background layer, and available vertical overflow in
SCSS as well as the GSAP `yPercent`, `start`, `end`, and `scrub` values.

The animation registry uses a `WeakMap` for element keys and a `Map` for string keys. Do not
register a second timeline under an already-used key; `registerAnimation()` rejects duplicate
keys. Use the registry's `getAnimation()` or `killAnimation()` APIs when lifecycle control is
needed.

## 6. GSAP versus CSS

**GSAP:** scroll-triggered reveal timelines, parallax, and the scrolled navigation timeline.
Their selector-based initial state may be in SCSS, but GSAP owns the animated transform and
opacity once initialized.

**CSS:** hero entrance keyframes in `critical.scss` and `global_styles/_animations.scss`,
hover/focus/active transitions, and CSS-driven burger menu state. These effects do not require
GSAP.

Do not make CSS transitions/keyframes and GSAP compete for the same property on the same
element. The gallery modal and Masonry image reveal also use CSS transitions; JavaScript
changes classes and performs layout rather than using GSAP.

## 7. Troubleshooting

- **No animation before scrolling:** GSAP starts on the first scroll by design. Check again
  after scrolling, and verify that the asynchronous chunk loads successfully.
- **Reveal target stays hidden:** confirm the first scroll occurred, the selector matches,
  the timeline is registered for this page, and the corresponding element has the expected
  `data-anime` value.
- **Timeline throws about a missing root/target:** compare the configured selector to actual
  generated markup; for `single`, the root must match exactly one element.
- **Wrong trigger timing:** distinguish the DOM search root from `scrollTrigger.trigger`;
  verify `start`, `end`, and the trigger element.
- **Animation runs twice or throws duplicate registration:** check whether the initialization
  path is invoked more than once or a cache key is being reused.
- **Parallax clips or jumps:** inspect the paired section and background CSS as well as the
  timeline parameters; `ScrollTrigger.refresh()` runs after initial animation setup.
