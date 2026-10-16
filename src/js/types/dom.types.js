"use strict";

/**
 * src/js/types/dom.types.js
 *
 * @file dom.types.js
 * @description DOM type aliases used by this module.
 */

//// TYPE DEFINITIONS /////

/**
 * TBurgerElements: DOM elements required by the navigation menu.
 *
 * @typedef {{
 *   navMenuFixed: Element,
 *   burgerHidden: Element,
 *   burgerFixed: Element,
 *   burgerNavAll: Element[],
 * }} TBurgerElements
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
 * TActivateNavlinkParams
 * Type definition for arguments of {@link activateNavLink}
 *
 * @typedef {Object} TActivateNavlinkParams
 * @property {string} navLinkSelector - The CSS selector to find the navigation link items.
 * @property {string} pageType - The type of the page to match with the pagesVersions attribute of the navigation items.
 * @property {string} activeClass - The class name to add to the matched navigation link items.
 * @property {string} anchorLink - The URL to set as the `href` attribute for the matched navigation items.
 */

/**
 * TBurgerHandlersData: Configuration for return initBurgerHandlers()
 *
 * @typedef {{
 *   closeBurgerHandler: (e:MouseEvent) => void,
 *   attachBurgerListener: (burger: Element) => void,
 * }} TBurgerHandlersData
 */

/**
 * ImageSize
 *
 * @typedef {Record<string, number>} ImageSize
 * @property {number} naturalWidth - Original image width in pixels
 * @property {number} naturalHeight - Original image height in pixels
 * @property {number} offsetWidth - Rendered width including padding/borders
 * @property {number} offsetHeight - Rendered height including padding/borders
 */

/**
 * LoadedImageResult
 *
 * @typedef {Record<string, unknown>} LoadedImageResult
 * @property {HTMLElement} element - The parent element containing the image
 * @property {ImageSize} size - Dimension information
 */

/**
 * TInitLangSwitcherParams
 * Type definition for arguments of {@link initLangSwitcher}
 *
 * @typedef {Object} TInitLangSwitcherParams
 * @property {string} langSwitcherSelector - Selector for the root container.
 * @property {string} langSwitcherCurrent - Selector for language button to open dropDown lang menu...
 * @property {string} langSwitcherButton - Selector for language button.
 * @property {string} langSwitcherItem - Selector for <li> in the drop-down list of not active language vers...
 * @property {string} langActiveSelector - Selector for active language element.
 * @property {string} langListSelector - Selector for options container.
 * @property {string[]} langOptionArr - Supported language codes.
 * @property {string} dataSetKey - Dataset parameter name.
 *
 */

/**
 * TGetLangItemsParams
 *
 * @description - the type of argument "params" for the function getLangItems()
 *
 * @typedef {Record<string, string>} TGetLangItemsParams
 * @property {string} langSwitcherItem - className of the language list item <li>
 * @property {string} langSwitcherButton - className of the buttons <button>
 * @property {string} dataSetKey - the key of the dataset
 *
 */

/**
 * TLogMessageParams
 *
 * @typedef {{
 *   component: string, //Component or module name.
 *   message: string, //Error description
 *   details?: unknown,  //Optional data
 * }} TLogMessageParams
 */

/**
 * ModalState
 *
 * @typedef {Object} ModalState
 * @property {number|null} currentIndex
 * @property {boolean} isOpen
 * @property {boolean} isLoading
 * @property {HTMLElement|null} currentImage
 */

// Mark this file as an ES module without introducing runtime dependencies.
export {};