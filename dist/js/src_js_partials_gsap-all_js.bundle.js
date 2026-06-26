"use strict";
(self["webpackChunkgulp5_starting_kit_2024"] = self["webpackChunkgulp5_starting_kit_2024"] || []).push([["src_js_partials_gsap-all_js"],{

/***/ "./src/js/partials/gsap-all.js":
/*!*************************************!*\
  !*** ./src/js/partials/gsap-all.js ***!
  \*************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ScrollTrigger: function() { return /* reexport safe */ gsap_ScrollTrigger__WEBPACK_IMPORTED_MODULE_1__.ScrollTrigger; },
/* harmony export */   gsap: function() { return /* reexport safe */ gsap__WEBPACK_IMPORTED_MODULE_0__.gsap; }
/* harmony export */ });
/* harmony import */ var gsap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gsap */ "./node_modules/gsap/index.js");
/* harmony import */ var gsap_ScrollTrigger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gsap/ScrollTrigger */ "./node_modules/gsap/ScrollTrigger.js");
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



/***/ })

}]);
//# sourceMappingURL=src_js_partials_gsap-all_js.bundle.js.map