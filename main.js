/* =====================================================================
   SANSKAR NANEGAONKAR · atmosphere engine
   - scroll = passage of a day (peach -> blue -> indigo)
   - drifting particles, cloud parallax, sun set, stars + lit windows rise
   - splitting char reveals, scroll-safe reveals, cursor glow, mobile nav
   ===================================================================== */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer  = window.matchMedia("(pointer:fine)").matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const root  = document.documentElement;

  const nav        = $("#nav");
  const navToggle  = $("#nav-toggle");
  const cloudsFar  = $("#clouds-far"),  cloudsMid = $("#clouds-mid"), cloudsNear = $("#clouds-near");

  /* ---------- 1. Splitting (chars on headings) ---------- */
  if (window.Splitting) {
    try { window.Splitting({ target: "[data-splitting]", by: "chars" }); } catch (e) {}
  }

  /* ---------- 2. Reveals (IntersectionObserver + scroll-safe fallback) ---------- */
  const revealSel = [".kicker", ".lede", ".two-col", ".quote", ".card",
                     ".groups", ".pubs", ".contact__links", ".hero__title"].join(",");
  const revealEls = $$(revealSel);
  let io = null;
  if (!reduceMotion) {
    revealEls.forEach((el) => { if (!el.classList.contains("hero__title")) el.classList.add("reveal"); });
  }
  function revealInView() {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    for (const el of revealEls) {
      if (el.classList.contains("is-in")) continue;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) {
        el.classList.add("is-in");
        if (io) io.unobserve(el);
      }
    }
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- 3. Scroll = passage of a day (batched in rAF) ---------- */
  // Keyframe skies: golden hour -> clear blue -> dusk -> night.
  const SKIES = [
    { p: 0.00, top: [255,184,140], mid: [222, 98, 98], bot: [ 74, 58, 96], sunY: 60,  sunOp: 0.95, stars: 0    },
    { p: 0.48, top: [126,200,227], mid: [120,150,195], bot: [ 58, 74,122], sunY: 76,  sunOp: 0.60, stars: 0    },
    { p: 0.80, top: [ 78, 92,150], mid: [ 45, 55,100], bot: [ 22, 33, 62], sunY: 94,  sunOp: 0.22, stars: 0.5  },
    { p: 1.00, top: [ 40, 46, 90], mid: [ 26, 26, 61], bot: [ 12, 14, 34], sunY: 108, sunOp: 0,    stars: 0.95 },
  ];
  const rgb = (c) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
  const mix = (a, b, t) => [lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t)];
  function skyAt(p) {
    let i = 0;
    while (i < SKIES.length - 1 && p > SKIES[i + 1].p) i++;
    const a = SKIES[i], b = SKIES[Math.min(i + 1, SKIES.length - 1)];
    const t = clamp((p - a.p) / ((b.p - a.p) || 1), 0, 1);
    return { top: mix(a.top,b.top,t), mid: mix(a.mid,b.mid,t), bot: mix(a.bot,b.bot,t),
             sunY: lerp(a.sunY,b.sunY,t), sunOp: lerp(a.sunOp,b.sunOp,t), stars: lerp(a.stars,b.stars,t) };
  }

  let lastY = window.scrollY, ticking = false;
  function frame() {
    const max = root.scrollHeight - window.innerHeight;
    const progress = max > 0 ? clamp(lastY / max, 0, 1) : 0;
    const s = skyAt(progress);
    root.style.setProperty("--sky-top", rgb(s.top));
    root.style.setProperty("--sky-mid", rgb(s.mid));
    root.style.setProperty("--sky-bot", rgb(s.bot));
    root.style.setProperty("--sun-y", s.sunY.toFixed(1) + "%");
    root.style.setProperty("--sun-op", s.sunOp.toFixed(3));
    root.style.setProperty("--stars-op", s.stars.toFixed(3));
    root.style.setProperty("--win-op", (0.3 + s.stars * 0.62).toFixed(3));
    // adaptive ink: dark on bright (golden hour, midday) -> cream on the dim/night crossover
    root.style.setProperty("--ink-t", clamp((progress - 0.55) / 0.2, 0, 1).toFixed(3));
    if (nav) nav.classList.toggle("is-scrolled", lastY > 30);
    if (!reduceMotion) {
      if (cloudsFar)  cloudsFar.style.transform  = `translate3d(0,${(lastY * 0.04).toFixed(1)}px,0)`;
      if (cloudsMid)  cloudsMid.style.transform  = `translate3d(0,${(lastY * 0.08).toFixed(1)}px,0)`;
      if (cloudsNear) cloudsNear.style.transform = `translate3d(0,${(lastY * 0.14).toFixed(1)}px,0)`;
    }
    revealInView();
    ticking = false;
  }
  function onScroll() { lastY = window.scrollY; if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  frame();

  /* ---------- 4. Intro splash (focus-managed, tap/keyboard/safety dismiss) ---------- */
  const intro = $("#intro"), enterBtn = $("#intro-enter");
  let introKey = null, introSafety = null, introExiting = false;
  function finishIntro() {
    if (!intro) return;
    intro.classList.add("is-gone");
    intro.style.display = "none";
    document.body.style.overflow = "";
    setTimeout(revealInView, 60);
  }
  function enterSite() {
    if (!intro || introExiting || intro.classList.contains("is-gone")) return;
    introExiting = true;
    if (introKey) document.removeEventListener("keydown", introKey);
    if (introSafety) clearTimeout(introSafety);
    intro.classList.add("is-exiting");
    const stroke = $(".intro__stroke");
    if (stroke && !reduceMotion) {
      // twilight brush paints across, then the curtain lifts to reveal the hero
      let len = 2600;
      try { if (typeof stroke.getTotalLength === "function") len = stroke.getTotalLength() || len; } catch (_) {}
      stroke.style.strokeDasharray = len;
      stroke.style.strokeDashoffset = len;
      void stroke.getBoundingClientRect();              // reflow so the draw transition runs
      stroke.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.6,.04,.35,1)";
      requestAnimationFrame(() => { stroke.style.strokeDashoffset = "0"; });
      // paint across (1.1s) → brief hold → lift the curtain to reveal the hero
      intro.style.transition = "opacity .55s ease-in 1.25s";
      requestAnimationFrame(() => { intro.style.opacity = "0"; });
      setTimeout(finishIntro, 1950);
    } else {
      intro.style.transition = "opacity .4s ease";
      requestAnimationFrame(() => { intro.style.opacity = "0"; });
      setTimeout(finishIntro, 420);
    }
  }
  const skipIntro = /[?&]nointro\b/.test(location.search);
  if (intro && skipIntro) {
    intro.classList.add("is-gone"); intro.style.display = "none";
  } else if (intro) {
    document.body.style.overflow = "hidden";
    // hide the brush stroke on load (it only paints across on ENTER)
    const introStroke0 = $(".intro__stroke");
    if (introStroke0 && typeof introStroke0.getTotalLength === "function") {
      let len0 = 2600; try { len0 = introStroke0.getTotalLength() || len0; } catch (_) {}
      introStroke0.style.strokeDasharray = len0;
      introStroke0.style.strokeDashoffset = len0;
    }
    if (enterBtn) {
      enterBtn.addEventListener("click", (e) => { e.stopPropagation(); enterSite(); });
      try { enterBtn.focus({ preventScroll: true }); } catch (_) {}
    }
    intro.addEventListener("click", enterSite);          // tap anywhere to enter
    introKey = (e) => {
      if ((e.key === "Enter" || e.key === "Escape" || e.key === " ") && !introExiting) {
        e.preventDefault(); enterSite();
      }
    };
    document.addEventListener("keydown", introKey);
    introSafety = setTimeout(enterSite, 9000);           // never trap a non-interacting user
  }

  /* ---------- 5. Mobile nav toggle ---------- */
  if (nav && navToggle) {
    const closeNav = () => { nav.classList.remove("nav--open"); navToggle.setAttribute("aria-expanded", "false"); };
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("nav--open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("#nav-links a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("nav--open")) { closeNav(); navToggle.focus(); }
    });
  }

  /* ---------- 6. Particle canvas (dust motes + petals), area-scaled, paused when hidden ---------- */
  const canvas = $("#particles");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, parts = [], rafId = 0;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(i) {
      const petal = (i % 8 === 0);
      return {
        x: Math.random() * w, y: Math.random() * h,
        r: petal ? 3 + Math.random() * 3 : 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: petal ? 0.2 + Math.random() * 0.45 : -0.05 + Math.random() * 0.18,
        a: 0.15 + Math.random() * 0.5,
        sway: Math.random() * Math.PI * 2, swaySpd: 0.004 + Math.random() * 0.01, petal,
      };
    }
    function seed() {
      const n = Math.round(clamp((w * h) / 24000, 40, 130));
      parts = Array.from({ length: n }, (_, i) => spawn(i));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.sway += p.swaySpd;
        p.x += p.vx + Math.sin(p.sway) * 0.3; p.y += p.vy;
        if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
        if (p.y < -10)    { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x > w + 10) p.x = -10; if (p.x < -10) p.x = w + 10;
        if (p.petal) {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.sway);
          ctx.fillStyle = `rgba(255,210,180,${p.a * 0.7})`;
          ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        } else {
          ctx.beginPath(); ctx.fillStyle = `rgba(255,245,225,${p.a})`;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    function start() { if (!rafId) rafId = requestAnimationFrame(tick); }
    function stop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }
    size(); seed(); start();
    window.addEventListener("resize", () => { size(); seed(); }, { passive: true });
    document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });
  }

  /* ---------- 7. Cursor glow (fine pointer, motion-on only) ---------- */
  const glow = $("#cursor-glow");
  if (glow && finePointer && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, on = false, gRaf = 0;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!on) { on = true; glow.classList.add("is-on"); }
    }, { passive: true });
    window.addEventListener("pointerleave", () => { on = false; glow.classList.remove("is-on"); });
    (function loop() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      glow.style.left = cx + "px"; glow.style.top = cy + "px";
      gRaf = requestAnimationFrame(loop);
    })();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(gRaf); gRaf = 0; }
      else if (!gRaf) gRaf = requestAnimationFrame(function l() { cx += (tx-cx)*0.12; cy += (ty-cy)*0.12; glow.style.left=cx+"px"; glow.style.top=cy+"px"; gRaf=requestAnimationFrame(l); });
    });
  }

  /* ---------- 8. Hero title cursor parallax ---------- */
  const heroName = $("#hero-name");
  if (heroName && !reduceMotion && finePointer) {
    window.addEventListener("pointermove", (e) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 16;
      const dy = (e.clientY / window.innerHeight - 0.5) * 10;
      heroName.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    }, { passive: true });
  }

  /* ---------- 9. Smooth anchor scroll (dynamic nav offset + AT focus) ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.getBoundingClientRect().height : 64;
      const y = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
    });
  });
})();
