/* Portfolio – Peter Chesneau : interactions et animations */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Barre de progression ---------- */
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  /* ---------- Header, bouton retour, progression ---------- */
  const header = $(".site-header");
  const toTop = $("#toTop");
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 500);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Menu mobile : fermeture après clic ---------- */
  const navCollapse = $("#mainNav");
  $$("#mainNav a").forEach(a => a.addEventListener("click", () => {
    if (navCollapse.classList.contains("show") && window.bootstrap) {
      window.bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
    }
  }));

  /* ---------- Scrollspy ---------- */
  const links = $$('.navbar .nav-link');
  const sections = links.map(l => $(l.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => spy.observe(s));

  /* ---------- Apparition au défilement ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(r => io.observe(r));
  } else {
    reveals.forEach(r => r.classList.add("is-visible"));
  }

  /* ---------- Texte qui se tape (hero) ---------- */
  const typed = $("#typed");
  if (typed && !reduceMotion) {
    const items = typed.dataset.items.split("|");
    let i = 0, j = items[0].length, deleting = true;
    function tick() {
      const word = items[i];
      typed.textContent = word.slice(0, j);
      let delay = deleting ? 35 : 80;
      if (!deleting && j === word.length) { deleting = true; delay = 1800; }
      else if (deleting && j === 0) { deleting = false; i = (i + 1) % items.length; delay = 300; }
      else { j += deleting ? -1 : 1; }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 2200);
  }

  /* ---------- Barres de compétences ---------- */
  const bars = $$(".bar > span");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const bo = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.width = e.target.dataset.level + "%"; obs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    bars.forEach(b => bo.observe(b));
  } else {
    bars.forEach(b => (b.style.width = b.dataset.level + "%"));
  }

  /* ---------- Filtres animés (projets + certifications) ---------- */
  $$(".filter-bar").forEach(bar => {
    const items = $$(".filter-item", $(bar.dataset.target));
    $$("button", bar).forEach(btn => btn.addEventListener("click", () => {
      $$("button", bar).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      items.forEach((item, idx) => {
        const show = f === "all" || item.dataset.cat === f;
        if (show) {
          item.classList.remove("is-hidden");
          item.classList.add("is-visible");
          setTimeout(() => item.classList.remove("is-leaving"), 30 + idx * 35);
        } else {
          item.classList.add("is-leaving");
          setTimeout(() => { if (item.classList.contains("is-leaving")) item.classList.add("is-hidden"); }, 350);
        }
      });
    }));
  });

  /* ---------- Compteurs (certifications) ---------- */
  const certItems = $$("#certGrid .cert-item");
  const totals = {
    all: certItems.length,
    easy: certItems.filter(i => i.dataset.cat === "easy").length,
    medium: certItems.filter(i => i.dataset.cat === "medium").length,
    hard: certItems.filter(i => i.dataset.cat === "hard").length,
    minutes: certItems.reduce((s, i) => s + (parseInt(i.dataset.minutes, 10) || 0), 0)
  };
  function count(el, target) {
    if (reduceMotion || !target) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 1600;
    (function step(now) {
      const t = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }
  const co = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { count(e.target, totals[e.target.dataset.target] || 0); obs.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  $$(".cert-count").forEach(c => co.observe(c));

  /* ---------- Effet 3D au survol (souris uniquement) ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".tilt").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = "transform .1s ease-out";
        el.style.transform = "perspective(800px) rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 9).toFixed(2) + "deg) translateY(-5px)";
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .35s ease";
        el.style.transform = "";
      });
    });
  }

  /* ---------- Défilement 3D : les sections arrivent par la droite et repartent par la gauche ---------- */
  if (!reduceMotion) {
    const scenes = $$("main > section").map(sec => ({ sec, box: $(".container", sec) })).filter(o => o.box);
    scenes.forEach(o => o.box.classList.add("fx3d"));
    const smooth = t => t * t * (3 - 2 * t);
    const clamp = v => Math.min(Math.max(v, 0), 1);
    let ticking = false;

    function update3D() {
      ticking = false;
      const vh = window.innerHeight, vw = window.innerWidth;
      const small = vw < 768;
      const shift = vw * (small ? 0.22 : 0.38);   // décalage horizontal max
      const angle = small ? 22 : 34;               // rotation max (degrés)
      scenes.forEach(({ sec, box }) => {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;        // hors écran : on ne calcule pas
        const a = smooth(clamp((r.top - vh * 0.08) / (vh * 0.7)));    // arrivée (par la droite)
        const b = smooth(clamp((vh * 0.45 - r.bottom) / (vh * 0.5))); // départ (vers la gauche)
        const x = a * shift - b * shift;
        const ry = -a * angle + b * angle;
        const z = -(a + b) * 220;
        const sc = 1 - (a + b) * 0.06;
        box.style.transform = (a + b) < 0.001 ? "" :
          "perspective(1500px) translate3d(" + x.toFixed(1) + "px,0," + z.toFixed(1) + "px) rotateY(" + ry.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
        box.style.opacity = (1 - Math.max(a, b) * 0.9).toFixed(3);
      });
    }
    function request3D() { if (!ticking) { ticking = true; requestAnimationFrame(update3D); } }
    window.addEventListener("scroll", request3D, { passive: true });
    window.addEventListener("resize", request3D);
    window.addEventListener("load", request3D);
    update3D();
  }
})();
