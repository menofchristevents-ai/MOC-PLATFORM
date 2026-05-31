/**
 * ══════════════════════════════════════════════════════════════════════
 *  MOC MOTION ARCHITECTURE  —  motion.js
 *  Men of Christ · menofchrist.nl
 *
 *  Stack: Lenis (smooth scroll) + GSAP + ScrollTrigger
 *  Rules:
 *    • Every animation uses ONLY `transform` and `opacity` — no layout props.
 *    • All cursor / parallax effects are DISABLED on touch devices via a
 *      `isFinePointer` guard. Mobile gets zero overhead.
 *    • Respects `prefers-reduced-motion`.
 *    • Does not touch bilingual logic, dark-mode toggle, or form handling.
 *
 *  Motion classes consumed:
 *    .cinematic-text   — clip-path + Y reveal from bottom (headlines)
 *    .parallax-wrap    — container for image reveal (overflow:hidden)
 *    .parallax-img     — scroll-linked Y + scale on images inside .parallax-wrap
 *    .stagger-grid     — parent; direct children tagged [data-stagger-item]
 *                        cascade-reveal with 80ms stagger
 *    .fade-up          — lightweight generic fade-up for body copy / cards
 *    .line-mask        — utility: overflow:hidden wrapper for per-line reveals
 *
 *  CDN dependencies (loaded before this script in each HTML file):
 *    Lenis      v1.0.42   —  @studio-freight/lenis
 *    GSAP       v3.12.5
 *    ScrollTrigger v3.12.5
 * ══════════════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────────────
     DEVICE CAPABILITY FLAGS
     ──────────────────────────────────────────────────────────────── */
  const isFinePointer        = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─────────────────────────────────────────────────────────────────
     EARLY EXIT — reduced motion: skip all GSAP animations.
     Lenis still initialises so scroll feels smooth; effects are off.
     ──────────────────────────────────────────────────────────────── */
  if (prefersReducedMotion) {
    document.querySelectorAll(
      ".cinematic-text, .fade-up, .stagger-grid > [data-stagger-item], .parallax-img"
    ).forEach(el => {
      el.style.opacity   = "1";
      el.style.transform = "none";
      el.style.clipPath  = "none";
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     0.  DYNAMIC LINKS — inject window.MOC_CONFIG into HTML elements
         Called FIRST in boot() so links are live before any animation.
     ══════════════════════════════════════════════════════════════ */
  function initDynamicLinks() {
    if (!window.MOC_CONFIG) {
      console.warn("[MOC Engine] config.js niet gevonden. Dynamische links worden overgeslagen.");
      return;
    }
    const cfg = window.MOC_CONFIG;

    const ticketBtn = document.getElementById("moc-ticket-btn");
    if (ticketBtn && cfg.eventbriteTicketsUrl) ticketBtn.href = cfg.eventbriteTicketsUrl;

    const promoLink = document.getElementById("moc-promo-link");
    if (promoLink && cfg.youtubePromoUrl) promoLink.href = cfg.youtubePromoUrl;

    const footerInsta = document.getElementById("moc-footer-instagram");
    if (footerInsta && cfg.instagramUrl) footerInsta.href = cfg.instagramUrl;

    const footerYT = document.getElementById("moc-footer-youtube");
    if (footerYT && cfg.youtubeChannelUrl) footerYT.href = cfg.youtubeChannelUrl;
  }

  /* ══════════════════════════════════════════════════════════════════
     1.  LENIS — BUTTERY SMOOTH SCROLL
         smoothTouch: false  →  native momentum on iOS/Android
         lerp: 0.1           →  organic deceleration feel
         duration: 1.2       →  slightly heavy, premium weight
     ══════════════════════════════════════════════════════════════ */
  let lenis;

  function initLenis() {
    if (typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration:        1.2,
      easing:          t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch:     false,
      touchMultiplier: 2,
      infinite:        false,
    });

    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", e => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80, duration: 1.6 });
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     2.  GSAP + SCROLLTRIGGER REGISTRATION
     ══════════════════════════════════════════════════════════════ */
  function initGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          if (arguments.length) { lenis.scrollTo(value, { immediate: true }); }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     3.  PAGE ENTRANCE — hero elements enter on load before scroll
     ══════════════════════════════════════════════════════════════ */
  function initPageEntrance() {
    if (prefersReducedMotion) return;

    const heroElements = document.querySelectorAll("[data-hero-enter]");
    if (!heroElements.length) return;

    gsap.set(heroElements, { y: 40, opacity: 0 });

    gsap.to(heroElements, {
      y:        0,
      opacity:  1,
      duration: 1.1,
      ease:     "power3.out",
      stagger:  0.12,
      delay:    0.1,
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     4.  CINEMATIC TEXT REVEAL  (.cinematic-text)
         Technique: clip-path from inset(0 0 100% 0) + Y translate.
     ══════════════════════════════════════════════════════════════ */
  function initCinematicText() {
    if (prefersReducedMotion) return;

    const els = document.querySelectorAll(".cinematic-text");
    if (!els.length) return;

    els.forEach(el => {
      gsap.set(el, {
        clipPath:   "inset(0 0 100% 0)",
        y:          60,
        opacity:    1,
        willChange: "transform, clip-path",
      });

      ScrollTrigger.create({
        trigger: el,
        start:   "top 88%",
        once:    true,
        onEnter() {
          const delay = parseFloat(el.dataset.delay || "0");
          gsap.to(el, {
            clipPath: "inset(0 0 0% 0)",
            y:        0,
            duration: 1.0,
            delay,
            ease:     "power4.out",
          });
        },
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     5.  PARALLAX IMAGE REVEALS  (.parallax-wrap / .parallax-img)

         Two-pass logic:
         ① Above-fold  (already in viewport at JS execution):
            — Skip clipPath initial state (avoids 1-frame invisible flash)
            — Subtle scale 1.08 → 1 with delay, no ScrollTrigger needed
         ② Below-fold  (enters viewport on scroll):
            — Full cinematic polygon wipe: bottom → top
            — Simultaneous scale 1.4 → 1 on the img
         Both get scroll-linked yPercent parallax for depth.

         Desktop only — mobile skips for performance.
     ══════════════════════════════════════════════════════════════ */
  function initParallax() {
    if (!isFinePointer || prefersReducedMotion) return;

    document.querySelectorAll(".parallax-wrap").forEach(wrap => {
      const rect   = wrap.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.9;
      const img    = wrap.querySelector(".parallax-img");

      if (inView) {
        /* ── Hero / above-fold: scale-only, no clipPath ── */
        if (img) {
          gsap.fromTo(img,
            { scale: 1.08 },
            { scale: 1, duration: 2.5, ease: "power3.out", delay: 0.3 }
          );
        }
      } else {
        /* ── Below-fold: cinematic polygon wipe + scale ── */
        gsap.fromTo(wrap,
          { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.5,
            ease:     "power4.inOut",
            scrollTrigger: { trigger: wrap, start: "top 80%", once: true },
          }
        );
        if (img) {
          gsap.fromTo(img,
            { scale: 1.4 },
            {
              scale:    1,
              duration: 2,
              ease:     "power3.out",
              scrollTrigger: { trigger: wrap, start: "top 80%", once: true },
            }
          );
        }
      }

      /* ── Scroll-linked parallax Y — all wraps (desktop) ── */
      if (img) {
        const speed = parseFloat(img.dataset.parallaxSpeed || "0.18");
        gsap.fromTo(img,
          { yPercent: -speed * 50 },
          {
            yPercent: speed * 50,
            ease:     "none",
            scrollTrigger: {
              trigger: wrap,
              start:   "top bottom",
              end:     "bottom top",
              scrub:   1.5,
            },
          }
        );
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     6.  STAGGER GRID  (.stagger-grid)
         Children tagged [data-stagger-item] cascade-reveal.
     ══════════════════════════════════════════════════════════════ */
  function initStaggerGrids() {
    if (prefersReducedMotion) return;

    document.querySelectorAll(".stagger-grid").forEach(grid => {
      const items = grid.querySelectorAll("[data-stagger-item]");
      if (!items.length) return;

      gsap.set(items, { y: 48, opacity: 0, willChange: "transform, opacity" });

      ScrollTrigger.create({
        trigger: grid,
        start:   "top 82%",
        once:    true,
        onEnter() {
          gsap.to(items, {
            y:        0,
            opacity:  1,
            duration: 0.85,
            ease:     "power3.out",
            stagger:  0.08,
          });
        },
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     7.  FADE-UP  (.fade-up)
         Lighter version for body copy, info cards, form elements.
     ══════════════════════════════════════════════════════════════ */
  function initFadeUps() {
    if (prefersReducedMotion) return;

    const els = document.querySelectorAll(".fade-up");
    if (!els.length) return;

    els.forEach(el => {
      gsap.set(el, { y: 32, opacity: 0, willChange: "transform, opacity" });

      ScrollTrigger.create({
        trigger: el,
        start:   "top 88%",
        once:    true,
        onEnter() {
          const delay = parseFloat(el.dataset.delay || "0");
          gsap.to(el, {
            y:        0,
            opacity:  1,
            duration: 0.8,
            delay,
            ease:     "power3.out",
          });
        },
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     8.  HEADER SCROLL BEHAVIOUR
     ══════════════════════════════════════════════════════════════ */
  function initHeader() {
    const header = document.querySelector("header");
    if (!header || prefersReducedMotion) return;

    ScrollTrigger.create({
      start:    "top -80px",
      end:      99999,
      onUpdate: self => {
        const scrollY = self.scroll();
        if (scrollY > 80) {
          header.style.boxShadow      = "0 4px 32px rgba(0,0,0,0.25)";
          header.style.backdropFilter = "blur(8px)";
        } else {
          header.style.boxShadow      = "none";
          header.style.backdropFilter = "none";
        }
      },
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     9.  SECTION RULE DRAW  (.section-rule)
     ══════════════════════════════════════════════════════════════ */
  function initSectionRules() {
    if (prefersReducedMotion) return;

    document.querySelectorAll(".section-rule").forEach(rule => {
      gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });

      ScrollTrigger.create({
        trigger: rule,
        start:   "top 90%",
        once:    true,
        onEnter() {
          gsap.to(rule, {
            scaleX:   1,
            duration: 1.0,
            ease:     "power3.inOut",
          });
        },
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     10.  CURSOR — DESKTOP ONLY
          Small bronze dot (14px) with mix-blend-mode: difference.
          Expands to 56px off-white on hover over links/buttons.
          GSAP quickTo for position lerp — CSS transition for size.
     ══════════════════════════════════════════════════════════════ */
  function initCursorHalo() {
    if (!isFinePointer || prefersReducedMotion) return;

    const style = document.createElement("style");
    style.textContent = `
      #moc-cursor {
        position: fixed;
        top: 0; left: 0;
        width: 14px; height: 14px;
        border-radius: 50%;
        background-color: #B07A43;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        will-change: transform;
        transition: width 0.3s ease, height 0.3s ease, background-color 0.3s ease;
      }
      body.is-hovering-link #moc-cursor {
        width: 56px;
        height: 56px;
        background-color: #F2EFEB;
      }
    `;
    document.head.appendChild(style);

    const cursor = document.createElement("div");
    cursor.id = "moc-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3.out" });

    document.addEventListener("mousemove", e => {
      xTo(e.clientX - 7);
      yTo(e.clientY - 7);
    });

    document.querySelectorAll("a, button, [data-magnetic]").forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("is-hovering-link"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("is-hovering-link"));
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) gsap.ticker.sleep();
      else gsap.ticker.wake();
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     11.  MAGNETIC BUTTONS  —  DESKTOP ONLY
     ══════════════════════════════════════════════════════════════ */
  function initMagnetic() {
    if (!isFinePointer || prefersReducedMotion) return;

    const STRENGTH = 0.32;

    document.querySelectorAll("[data-magnetic]").forEach(el => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

      el.addEventListener("mousemove", e => {
        const r  = el.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        xTo((e.clientX - cx) * STRENGTH);
        yTo((e.clientY - cy) * STRENGTH);
      });

      el.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     12.  CARD GLOW  (.glow-card)
          CSS ::after was removed; this function is now a no-op but
          kept for compatibility with any future glow implementations.
     ══════════════════════════════════════════════════════════════ */
  function initCardGlow() {
    // glow-card::after has been removed from CSS.
    // This function intentionally does nothing.
  }

  /* ══════════════════════════════════════════════════════════════════
     BOOT — run everything after DOM is ready
     initDynamicLinks() runs FIRST so all href injections are live
     before any animation or visual work begins.
     ══════════════════════════════════════════════════════════════ */
  function boot() {
    initDynamicLinks();
    initLenis();
    initGSAP();
    initPageEntrance();
    initCinematicText();
    initParallax();
    initStaggerGrids();
    initFadeUps();
    initHeader();
    initSectionRules();
    initMagnetic();
    initCardGlow();

    window.addEventListener("load", () => { ScrollTrigger.refresh(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
