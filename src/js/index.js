'use strict';

import { activateNavLink, createMasonry, initLangSwitcher, lockedEventListener } from "./helpers/funcsDOM.js";
import { initThumbs } from "./modulesPack/gallery-thumbs/index.js";
import { animatePage, fadeInGallery } from "./partials/animations.js";

//INITIAL DATA
const linkAnchors = {
  index: "#",
  gates: "#gatesSection",
  rollers: "#securityShuttersSection",
  automation: "#rollerShuttersAutomation",
  barriers: "#barrierSection",
  awnings: "#awningsSection",
  windows: "#windowSection",
  security: "#securitySurveillanceSection",
};
const navLinkSelector = ".nav-link";
const navHexagonSelector = ".hexagon-comb-block__cell";
const langSwitchData = {
  langSwitcherSelector: "#lang-switcher",
  iconLangSelector: ".lang-switcher__lang-icon",
  langActiveSelector: ".active",
  langListSelector: "#lang-list",
  langOptionArr: ["ua", "ru"],
  dataSetParam: "lang"
}
const gallerySelector = "#gallery-work";
const galleryThumbsFolderName = "thumbs";

document.addEventListener("DOMContentLoaded", async () => {
  const pageType = document.body.dataset.type;

  /// Navigation ///
  //checking and lighten several duplicate navigations for the .active links:
  activateNavLink(navLinkSelector, pageType, "active", linkAnchors[pageType] || "#");
  activateNavLink(navHexagonSelector, pageType, "active", linkAnchors[pageType] || "#");

  //GSAP animation tweens
  const totalTl = animatePage();

  try {
    // Masonry + Gallery + Thumbs - consistent and readable
    const imageItems = await createMasonry(
      gallerySelector,
      { gap: 20 }
    );

    const timelines = fadeInGallery(imageItems);
    Object.assign(totalTl, timelines);

    await initThumbs(gallerySelector, galleryThumbsFolderName);
  } catch (error) {
    console.error("Gallery initialization failed:", error);
  }

  //initializing optional language versions interaction
  initLangSwitcher(langSwitchData);

  //listening to "resize" event to recompile the masonry gallery with the new parameters...
  lockedEventListener("resize", window, 2000)(async () => {
    try {
      await createMasonry(
        gallerySelector,
        { gap: 20 }
      );
    } catch (error) {
      console.error("Resize masonry failed:", error);
    }
  });

    ///////// END OF DOMContentLoaded Listener ////////////
});
