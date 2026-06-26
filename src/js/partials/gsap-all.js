/**
 * gsap-all.js — Aggregation module for lazy-loading GSAP.
 *
 * Problem: two separate `import('gsap')` and `import('gsap/ScrollTrigger')`
 * cause Webpack to create TWO async chunks. This means an extra request
 * and breaks atomic loading.
 *
 * Solution: collect all GSAP dependencies into a single re-export module
 * and import it via one `import('./gsap-all.js')` with the magic comment
 * `webpackChunkName: "gsap"` — Webpack will bundle everything into a single
 * gsap.bundle.js chunk.
 *
 * Why not `splitChunks.cacheGroups.gsap`:
 *   - `splitChunks` with `chunks: 'all'` pulls GSAP out of the async chunk
 *     into an entry chunk
 *   - entry chunk contains a runtime stub and is incompatible with
 *     `__webpack_require__.e()`
 *   - this leads to fragile loading: an entry chunk masquerading as an async chunk
 *
 * Why this approach:
 *   - One `import()` → one async chunk → one HTTP request
 *   - Chunk format: pure modules without runtime, handled by
 *     `webpackJsonpCallback`
 *   - More reliable, predictable, does not depend on Webpack runtime internals
 *
 * Usage in gsap-loader.js:
 *   import(/* webpackChunkName: "gsap" *\/ './gsap-all.js')
 */
export { gsap } from 'gsap';
export { ScrollTrigger } from 'gsap/ScrollTrigger';

