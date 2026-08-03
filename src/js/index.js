'use strict';

/**
 * @file index.js
 * @description Entry point. Bootstraps non-GSAP UI first, then lazily loads
 * GSAP via gsap-loader.js, builds animations through animations.js, and
 * initializes the masonry gallery.
 */

import {
  activateNavLink,
  createMasonry,
  initLangSwitcher,
  lockedEventListener
} from "./helpers/funcsDOM.js";

import {
  linkAnchors,
  linkClassNameActive,
  navLinkSelector,
  navHexagonSelector,
  langSwitchData,
  gallerySelector,
  galleryThumbsFolderName
} from "./partials/initialSelectors.js";

import { initThumbs } from "./modulesPack/gallery-thumbs/index.js";
import { initAnimations } from "./partials/animations.js";
import { isKeyOf } from "./helpers/funcs.js";

// ============================================
// DOM READY
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  const pageType = document.body.dataset.type || "";
  const isIn = isKeyOf(linkAnchors, pageType);
  const navLinkParams = {
    navLinkSelector,
    pageType,
    activeClass: linkClassNameActive,
    anchorLink: isIn ? linkAnchors[pageType] : "#",
  }
  const navLinkParamsHexagon = {
    navLinkSelector: navHexagonSelector,
    pageType,
    activeClass: linkClassNameActive,
    anchorLink: isIn ? linkAnchors[pageType] : "#",
  }

  try {
    // ------------------------------------------
    // Navigation & Language (non-GSAP, immediate)
    // ------------------------------------------
    activateNavLink(navLinkParams);
    activateNavLink(navLinkParamsHexagon);

    //initializing GSAP animations...
    await initAnimations();


    //initializing language switcher...
    initLangSwitcher(langSwitchData);


    await initThumbs(gallerySelector, galleryThumbsFolderName);
  } catch (error) {
    console.error("[DOMContentLoaded]: initialization failed:", error);
  }

  // ------------------------------------------
  // Resize listener
  // ------------------------------------------
  lockedEventListener("resize", window, 1500)(async () => {
    try {
      await createMasonry(gallerySelector, { gap: 20 });
    } catch (error) {
      console.error("Resize masonry failed:", error);
    }
  });

  // ------------------------------------------
  // Optional: full cleanup on page unload
  // Useful for SPA navigation or hot-reload scenarios
  // ------------------------------------------
  window.addEventListener("beforeunload", () => {
    killAllAnimations();
    resetGsapCache();
  });
});