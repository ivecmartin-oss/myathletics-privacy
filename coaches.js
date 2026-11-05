'use strict';

(() => {
  const page = document.querySelector('.coaches-page');
  if (!page) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reveals = [...page.querySelectorAll('.coach-reveal')];
  const scenes = [...page.querySelectorAll('.coach-scene')];
  let observer;
  let pendingFrame = 0;

  const updateDepth = () => {
    pendingFrame = 0;
    if (preference.matches || document.getElementById('preview-content')?.hidden) return;
    const height = window.innerHeight;
    for (const scene of scenes) {
      const box = scene.getBoundingClientRect();
      if (box.bottom < 0 || box.top > height) continue;
      const offset = Math.max(-12, Math.min(12, (height / 2 - box.top - box.height / 2) * .035));
      scene.style.setProperty('--scene-shift', `${offset.toFixed(1)}px`);
    }
  };

  const queueDepth = () => {
    if (!preference.matches && !pendingFrame) pendingFrame = requestAnimationFrame(updateDepth);
  };

  const configure = () => {
    observer?.disconnect();
    if (pendingFrame) cancelAnimationFrame(pendingFrame);
    pendingFrame = 0;
    for (const scene of scenes) scene.style.removeProperty('--scene-shift');
    page.classList.remove('coach-motion-ready');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
      queueDepth();
    }, { threshold: .08 });
    for (const item of reveals) observer.observe(item);
    page.classList.add('coach-motion-ready');
    queueDepth();
  };

  window.addEventListener('scroll', queueDepth, { passive: true });
  window.addEventListener('resize', queueDepth, { passive: true });
  preference.addEventListener('change', configure);
  configure();
})();
