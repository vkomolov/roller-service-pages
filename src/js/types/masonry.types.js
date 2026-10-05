"use strict";

/**
 * src/js/types/masonry.types.js
 *
 * @file masonry.types.js
 * @description MASONRY type aliases used by this module.
 */

//// TYPE DEFINITIONS /////

/**
 * TMasonryOptions: Public options for masonry initialization.
 *
 * `gap` is optional because the masonry API provides a default value.
 *
 * @typedef {Object} TMasonryOptions
 *
 * @property {string} itemSelector
 * CSS selector used to resolve masonry items inside the container.
 *
 * @property {number} [gap=0]
 * Gap between masonry columns and rows, in pixels.
 */

/**
 * TMasonryConfig: Normalized masonry configuration used internally by the masonry pipeline.
 *
 * Unlike TMasonryOptions, all optional values have already been resolved
 * to their effective runtime values.
 *
 * @typedef {Object} TMasonryConfig
 *
 * @property {string} itemSelector
 * CSS selector used to resolve masonry items.
 *
 * @property {number} gap
 * Normalized gap between masonry items, in pixels.
 * Must be greater than or equal to zero.
 */

/**
 * TMasonryItemMeasurement: Measured layout geometry of a single masonry item.
 *
 * This model represents the physical dimensions reported by the DOM
 * before any masonry position is calculated.
 *
 * It intentionally contains no `top`, `left`, or column information.
 *
 * @typedef {Object} TMasonryItemMeasurement
 *
 * @property {HTMLElement} element
 * The DOM element representing the masonry item.
 *
 * @property {number} width
 * Current layout width of the masonry item, in pixels.
 * Must be greater than zero.
 *
 * @property {number} height
 * Current layout height of the masonry item, in pixels.
 * Must be greater than zero.
 */

/**
 * TMasonryColumnCalculation: Result of the horizontal masonry column calculation.
 *
 * This is intentionally narrower than TMasonryColumns.
 * It contains only the values produced directly by getColumnsNumber().
 *
 * @typedef {Object} TMasonryColumnCalculation
 *
 * @property {number} count
 * Number of masonry columns.
 * Must be at least one.
 *
 * @property {number} freeWidth
 * Horizontal space remaining after fitting the calculated columns
 * and their gaps inside the container.
 * Must be greater than or equal to zero.
 */

/**
 * TMasonryColumns: Calculated horizontal configuration of the masonry columns.
 *
 * This model represents the complete column geometry required
 * to calculate item positions.
 *
 * @typedef {Object} TMasonryColumns
 *
 * @property {number} count
 * Number of masonry columns.
 * Must be at least one.
 *
 * @property {number} width
 * Width of each masonry column/item, in pixels.
 * Must be greater than zero.
 *
 * @property {number} gap
 * Horizontal and vertical gap between masonry items, in pixels.
 * Must be greater than or equal to zero.
 *
 * @property {number} leftOffset
 * Horizontal offset from the left edge of the container used
 * to center the masonry columns within the available space.
 * Must be greater than or equal to zero.
 */

/**
 * TMasonryItemLayout: Complete calculated layout state of a single masonry item.
 *
 * This model combines the measured item geometry with its calculated
 * masonry position.
 *
 * @typedef {Object} TMasonryItemLayout
 *
 * @property {HTMLElement} element
 * The DOM element representing the masonry item.
 *
 * @property {number} width
 * Measured layout width of the item, in pixels.
 * Must be greater than zero.
 *
 * @property {number} height
 * Measured layout height of the item, in pixels.
 * Must be greater than zero.
 *
 * @property {number} left
 * Calculated horizontal position of the item relative to
 * the masonry container, in pixels.
 *
 * @property {number} top
 * Calculated vertical position of the item relative to
 * the masonry container, in pixels.
 */

/**
 * TMasonryLayout: Complete snapshot of the current masonry layout.
 *
 * The model contains both the horizontal column configuration
 * and the calculated position of every masonry item.
 *
 * It can be generated during initial layout and regenerated
 * after container resizing using the same calculation pipeline.
 *
 * @typedef {Object} TMasonryLayout
 *
 * @property {number} containerWidth
 * Width of the masonry container at the moment the layout
 * was calculated, in pixels.
 * Must be greater than zero.
 *
 * @property {TMasonryColumns} columns
 * Calculated horizontal configuration of the masonry columns.
 *
 * @property {TMasonryItemLayout[]} items
 * Calculated layout state of all valid masonry items.
 */



// Mark this file as an ES module without introducing runtime dependencies.
export {};