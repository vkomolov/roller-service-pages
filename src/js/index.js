'use strict';

/**
 * @file index.js
 * @description Entry point. Bootstraps non-GSAP UI first, then lazily loads
 * GSAP via gsap-loader.js, builds animations through animations.js, and
 * initializes the masonry gallery.
 */

import { activateNavLink, createMasonry, initLangSwitcher, lockedEventListener } from "./helpers/funcsDOM.js";
import { initThumbs } from "./modulesPack/gallery-thumbs/index.js";
import { getGsap, killAllAnimations, resetGsapCache } from "./partials/gsap-loader.js";
import { createAnimations } from "./partials/animations.js";

// ============================================
// INITIAL DATA
// ============================================

const linkAnchors = {
  index: "#about-us",
  gates: "#gatesSection",
  rollers: "#securityShuttersSection",
  automation: "#rollerShuttersAutomation",
  barriers: "#barrierSection",
  awnings: "#awningsSection",
  windows: "#windowSection",
  security: "#securitySurveillanceSection",
};

const linkClassNameActive = "active";
const navLinkSelector = ".nav-link";
const navHexagonSelector = ".hexagon-comb-block__cell";

const langSwitchData = {
  langSwitcherSelector: "#lang-switcher",
  iconLangSelector: ".lang-switcher__lang-icon",
  langActiveSelector: ".active",
  langListSelector: "#lang-list",
  langOptionArr: ["uk", "ru"],
  dataSetParam: "lang"
};

const gallerySelector = "#gallery-work";
const galleryThumbsFolderName = "thumbs";

// ============================================
// DOM READY
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  /** @type {string} */
  const pageType = document.body.dataset.type;

  // ------------------------------------------
  // Navigation & Language (non-GSAP, immediate)
  // ------------------------------------------
  activateNavLink(navLinkSelector, pageType, linkClassNameActive, linkAnchors[pageType] || "#");
  activateNavLink(navHexagonSelector, pageType, linkClassNameActive, linkAnchors[pageType] || "#");
  initLangSwitcher(langSwitchData);

  // ------------------------------------------
  // Lazy load GSAP + ScrollTrigger + animations module
  // ------------------------------------------
  const { gsap, ScrollTrigger } = await getGsap();
  const { animatePage, fadeInGallery } = createAnimations(gsap, ScrollTrigger);

  // ------------------------------------------
  // GSAP-dependent operations
  // ------------------------------------------
  const totalTl = animatePage();

  try {
    const imageItems = await createMasonry(gallerySelector, { gap: 20 });
    const timelines = fadeInGallery(imageItems);
    Object.assign(totalTl, timelines);

    await initThumbs(gallerySelector, galleryThumbsFolderName);
  } catch (error) {
    console.error("Gallery initialization failed:", error);
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