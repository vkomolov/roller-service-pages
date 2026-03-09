'use strict';

import { activateNavLink, createMasonry, initLangSwitcher, lockedEventListener } from "./helpers/funcsDOM.js";
import { initThumbs } from "./modulesPack/gallery-thumbs/gallery-thumbs-index.js";
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

document.addEventListener("DOMContentLoaded", () => {
  const pageType = document.body.dataset.type;

  //checking and lighten several duplicate navigations for the .active links:
  activateNavLink(navLinkSelector, pageType, "active", linkAnchors[pageType] || "#");
  activateNavLink(navHexagonSelector, pageType, "active", linkAnchors[pageType] || "#");

  //GSAP animation tweens
  const totalTl = animatePage();

  createMasonry("#gallery-work", {
    gap: 20,
  })
    .then(imagesArr =>  {
      return fadeInGallery(imagesArr);
    })
    .then(timelines => {
      Object.assign(totalTl, timelines);
      //log("total timelines: ", totalTl);
    })

    //TODO: фильтровать из "/thumbs", "/thumbs/" в "thumbs"

    .then(() => initThumbs("#gallery-work", "thumbs"))
    .catch(error => {
      console.error(error);
    });

  //initializing optional language versions interaction
  initLangSwitcher({
    langSwitcherSelector: "#lang-switcher",
    iconLangSelector: ".lang-switcher__lang-icon",
    langActiveSelector: ".active",
    langListSelector: "#lang-list",
    langOptionArr: ["ua", "ru"],
    dataSetParam: "lang"
  });

  //listening to "resize" event to recompile the masonry gallery with the new parameters...
  lockedEventListener("resize", window, 2000)(() => {
    createMasonry("#gallery-work", {
      gap: 20,
    })
      .catch(error => {
        console.error(error);
      })
    //.then(res =>  log(res, "elements: "));
  });

    ///////// END OF DOMContentLoaded Listener ////////////
});
