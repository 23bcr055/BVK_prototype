/* ==========================================================
   GLOBAL ANIMATION INITIALIZER
   Works with or without GSAP
========================================================== */
(function () {
  document.addEventListener("DOMContentLoaded", initAnimations);

  function initAnimations() {
    const hasGSAP = typeof gsap !== "undefined";
    const hasScrollTrigger =
      hasGSAP && typeof ScrollTrigger !== "undefined";

    if (hasGSAP && hasScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    /* ======================================================
       HERO SECTION
    ====================================================== */
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.classList.add("glass");

      if (hasGSAP) {
        gsap.from(hero, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: "power3.out",
        });

        const heroItems = hero.querySelectorAll(".overlay > *");
        if (heroItems.length) {
          gsap.from(heroItems, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.2,
            delay: 0.3,
            ease: "power2.out",
          });
        }
      }
    }

    /* ======================================================
       CARDS (Glass + Scroll Animation)
    ====================================================== */
    const cards = document.querySelectorAll(
      ".card, .school-card, .feature-card, .testimonial-card, .counter-box"
    );

    cards.forEach((card, i) => {
      card.classList.add("glass");

      if (hasGSAP) {
        gsap.from(card, {
          scrollTrigger: hasScrollTrigger
            ? {
                trigger: card,
                start: "top 85%",
                once: true,
              }
            : null,
          opacity: 0,
          y: 40,
          duration: 0.6,
          delay: i * 0.08,
          ease: "power2.out",
        });
      }
    });

    /* ======================================================
       HEADINGS
    ====================================================== */
    const headers = document.querySelectorAll(
      ".section-header, h2, h3, h4"
    );

    headers.forEach((header) => {
      if (hasGSAP) {
        gsap.from(header, {
          scrollTrigger: hasScrollTrigger
            ? {
                trigger: header,
                start: "top 85%",
                once: true,
              }
            : null,
          opacity: 0,
          x: -40,
          duration: 0.7,
          ease: "power3.out",
        });
      }
    });

    /* ======================================================
       PARALLAX HERO VIDEO
    ====================================================== */
    const heroVideo = document.querySelector(".hero-video video");
    if (heroVideo && hasGSAP && hasScrollTrigger) {
      gsap.to(heroVideo, {
        y: 60,
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    /* ======================================================
       BUTTON HOVER MICRO-INTERACTIONS
    ====================================================== */
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      if (!hasGSAP) return;

      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, {
          y: -3,
          duration: 0.25,
          ease: "power2.out",
        });
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          y: 0,
          duration: 0.25,
          ease: "power2.out",
        });
      });
    });

    /* ======================================================
       COUNTER ANIMATION
    ====================================================== */
    const counters = document.querySelectorAll(".count");

    counters.forEach((counter) => {
      const target = +counter.dataset.target || 0;
      let current = 0;

      const animateCounter = () => {
        const increment = target / 100;
        const update = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.ceil(current).toLocaleString();
            requestAnimationFrame(update);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };
        update();
      };

      if (hasGSAP && hasScrollTrigger) {
        ScrollTrigger.create({
          trigger: counter,
          start: "top 80%",
          once: true,
          onEnter: animateCounter,
        });
      } else {
        animateCounter();
      }
    });

    /* ======================================================
       SMOOTH SCROLL
    ====================================================== */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetEl = document.querySelector(this.getAttribute("href"));
        if (!targetEl) return;

        e.preventDefault();

        if (hasGSAP) {
          gsap.to(window, {
            duration: 0.8,
            scrollTo: { y: targetEl, offsetY: 80 },
            ease: "power2.inOut",
          });
        } else {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    /* ======================================================
       HEADER SCROLL EFFECT
    ====================================================== */
    const header = document.querySelector(".header");
    if (header) {
      header.classList.add("glass");

      const toggleHeader = () => {
        header.classList.toggle(
          "header-scrolled",
          window.scrollY > 80
        );
      };

      window.addEventListener("scroll", toggleHeader);
      toggleHeader();
    }
  }
})();
