/**
 * Animations du portfolio + section Certifications
 * - barre de progression de lecture
 * - compteurs animés
 * - filtres animés
 * - effet 3D (tilt) sur les cartes
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Barre de progression de lecture ---------- */
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = "scaleX(" + Math.min(Math.max(ratio, 0), 1) + ")";
  }
  document.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- Section Certifications ---------- */
  const section = document.querySelector("#certifications");
  if (!section) return;

  const items = Array.from(section.querySelectorAll(".cert-item"));

  // Totaux calculés automatiquement à partir des cartes présentes dans la page
  const totals = {
    all: items.length,
    easy: items.filter(i => i.dataset.level === "easy").length,
    medium: items.filter(i => i.dataset.level === "medium").length,
    hard: items.filter(i => i.dataset.level === "hard").length,
    minutes: items.reduce((sum, i) => sum + (parseInt(i.dataset.minutes, 10) || 0), 0)
  };

  /* Compteurs animés (déclenchés quand ils deviennent visibles) */
  function animateCount(el, target) {
    if (reduceMotion || target === 0) {
      el.textContent = target;
      return;
    }
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counters = section.querySelectorAll(".cert-count");
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      animateCount(el, totals[el.dataset.target] || 0);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterObserver.observe(c));

  /* Filtres animés */
  const filters = section.querySelectorAll(".cert-filters li");
  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      section.querySelector(".cert-filters .filter-active").classList.remove("filter-active");
      btn.classList.add("filter-active");
      const level = btn.dataset.filter;

      items.forEach((item, index) => {
        const show = level === "all" || item.dataset.level === level;
        if (show) {
          item.classList.remove("is-hidden");
          // petit décalage pour un effet "cascade"
          setTimeout(() => item.classList.remove("is-leaving"), 30 + index * 40);
        } else {
          item.classList.add("is-leaving");
          setTimeout(() => {
            if (item.classList.contains("is-leaving")) item.classList.add("is-hidden");
          }, 350);
        }
      });
    });
  });

  /* Effet 3D au survol (souris uniquement) */
  const canTilt = !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canTilt) {
    section.querySelectorAll(".cert-card").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(700px) rotateX(" + (-y * 10).toFixed(2) + "deg) rotateY(" + (x * 12).toFixed(2) + "deg) translateY(-6px)";
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }
})();
