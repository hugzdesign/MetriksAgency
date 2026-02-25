const initPreloader = () => {
  const preloader = document.querySelector(".preloader");
  const splitScreen = document.querySelector(".split-screen");

  if (splitScreen) {
    splitScreen.classList.add("is-zoomed");
  }

  if (!preloader) {
    return;
  }

  setTimeout(() => {
    preloader.classList.add("is-leaving");
    if (splitScreen) {
      splitScreen.classList.remove("is-zoomed");
    }
    setTimeout(() => {
      preloader.style.display = "none";
    }, 800);
  }, 1500);
};

const initAnimations = () => {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  const heroTitle = document.querySelector(".hero-title");
  const brandAnchor = document.querySelector(".brand-anchor");
  const hero = document.querySelector(".landing-hero");

  const setCompact = (isCompact) => {
    if (!heroTitle) {
      return;
    }
    heroTitle.classList.toggle("is-compact", isCompact);
    const label = isCompact
      ? heroTitle.dataset.compact
      : heroTitle.dataset.full;
    heroTitle.setAttribute("aria-label", label);
  };

  const createTitleAnimation = () => {
    if (!heroTitle || !hero || !brandAnchor) {
      return;
    }
    window.gsap.set(heroTitle, { x: 0, y: 0, scale: 1 });
    const titleRect = heroTitle.getBoundingClientRect();
    const anchorRect = brandAnchor.getBoundingClientRect();
    const x = anchorRect.left - titleRect.left;
    const y = anchorRect.top - titleRect.top;

    window.ScrollTrigger.create({
      trigger: hero,
      start: "top 85%",
      onEnter: () => {
        setCompact(true);
        window.gsap.to(heroTitle, {
          x,
          y,
          scale: 0.22,
          duration: 0.28,
          ease: "power4.out",
        });
      },
      onLeaveBack: () => {
        setCompact(false);
        window.gsap.to(heroTitle, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.28,
          ease: "power4.out",
        });
      },
    });
  };

  createTitleAnimation();

  window.addEventListener("resize", () => {
    window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    createTitleAnimation();
  });
};

const initRebranding = () => {
  const gallery = document.querySelector(".rebrand-gallery");
  const logo = document.querySelector(".rebrand-logo-img");
  const arrows = document.querySelectorAll(".rebrand-arrow");

  if (!gallery || !logo || arrows.length === 0) {
    return;
  }

  const rebrandingData = [
    {
      id: "hac",
      name: "HAC",
      logo: "logo HAC.png",
      formats: {
        tall: [
          "HAC REBRANDING/Groupe.png",
          "HAC REBRANDING/Jour de Match.png",
          "HAC REBRANDING/Compo1.png",
          "HAC REBRANDING/Compo2.png",
          "HAC REBRANDING/Coup d'envoi.png",
          "HAC REBRANDING/goal.png",
          "HAC REBRANDING/mi-temps.png",
          "HAC REBRANDING/goal2.png",
          "HAC REBRANDING/goal3.png",
          "HAC REBRANDING/Victoire.png",
          "HAC REBRANDING/Victoire 2.png",
          "HAC REBRANDING/Fin du match.png",
          "HAC REBRANDING/Prochain Match.png",
        ],
        story: [],
      },
    },
    {
      id: "fcv",
      name: "FC Versailles",
      logo: "logo Versailles.png",
      formats: {
        tall: [
          "FCV REBRANDING/MatchDay.png",
          "FCV REBRANDING/NextMatch.png",
          "FCV REBRANDING/Versailles compo.png",
          "FCV REBRANDING/Versailles compo1.png",
          "FCV REBRANDING/Victoire.png",
        ],
        story: ["FCV REBRANDING/GOAL Story.png", "FCV REBRANDING/GOAL Story2.png"],
      },
    },
    {
      id: "stb",
      name: "STB Le Havre",
      logo: "logo stb.png",
      formats: {
        tall: [
          "STB REBRANDING/Calendrier.jpg",
          "STB REBRANDING/Compo publication.jpg",
          "STB REBRANDING/GameTime STB.jpg",
          "STB REBRANDING/Next Game.jpg",
          "STB REBRANDING/Post insta.jpg",
          "STB REBRANDING/POTM.jpg",
          "STB REBRANDING/Score du match.jpg",
        ],
        story: ["STB REBRANDING/Compo story.jpg", "STB REBRANDING/STB COMPO STORY.jpg"],
      },
    },
  ];

  let currentIndex = 0;

  const renderGallery = (club) => {
    const orderedImages = [...club.formats.tall, ...club.formats.story];
    gallery.innerHTML = orderedImages
      .map((src) => `<img src="${src}" alt="${club.name} rebranding" />`)
      .join("");
    logo.src = club.logo;
    logo.alt = `Logo ${club.name}`;
  };

  const updateClub = (direction) => {
    gallery.classList.add("is-fading");
    setTimeout(() => {
      currentIndex =
        direction === "next"
          ? (currentIndex + 1) % rebrandingData.length
          : (currentIndex - 1 + rebrandingData.length) % rebrandingData.length;
      renderGallery(rebrandingData[currentIndex]);
      requestAnimationFrame(() => {
        gallery.classList.remove("is-fading");
      });
    }, 200);
  };

  arrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
      updateClub(arrow.dataset.direction);
    });
  });

  renderGallery(rebrandingData[currentIndex]);
};

const initSplitTransition = () => {
  const splitScreen = document.querySelector(".split-screen");
  const logo = document.querySelector(".split-logo-fixed");
  const fade = document.querySelector(".page-fade");
  const buttons = document.querySelectorAll(".split-button");

  if (!splitScreen || buttons.length === 0) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const panel = button.closest(".split-panel");
      if (!panel) {
        return;
      }

      buttons.forEach((btn) => btn.setAttribute("aria-disabled", "true"));
      splitScreen.classList.add("is-transitioning");
      panel.classList.add("is-selected");
      if (logo) {
        logo.classList.add("is-hidden");
      }

      setTimeout(() => {
        if (fade) {
          fade.classList.add("is-active");
        }
      }, 700);

      setTimeout(() => {
        window.location.href = button.getAttribute("href");
      }, 900);
    });
  });
};

window.addEventListener("load", () => {
  initPreloader();
  initRebranding();
  initAnimations();
  initSplitTransition();
});
