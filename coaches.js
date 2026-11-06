'use strict';

// Hero screenshots rotate every two seconds while the carousel is on screen.
(() => {
  const carousel = document.querySelector('[data-coach-carousel]');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.coach-carousel-slide')];
  if (slides.length < 2) return;
  const controls = carousel.querySelector('.coach-carousel-controls');
  const toggle = carousel.querySelector('.coach-carousel-toggle');
  const next = carousel.querySelector('.coach-carousel-next');
  const counter = carousel.querySelector('.coach-carousel-counter');
  const content = document.getElementById('preview-content');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const english = document.documentElement.lang === 'en';
  const interval = 2000;
  let active = 0;
  let paused = false;
  let focused = false;
  let explicitPlay = false;
  let visible = !('IntersectionObserver' in window);
  let timer;

  const render = () => {
    slides.forEach((slide, index) => {
      const distance = (index - active + slides.length) % slides.length;
      slide.dataset.position = distance === 0 ? 'center' : distance === 1 ? 'right' : distance === slides.length - 1 ? 'left' : distance < slides.length / 2 ? 'back-right' : 'back-left';
      slide.setAttribute('aria-hidden', String(distance !== 0));
    });
    counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };

  const schedule = () => {
    clearTimeout(timer);
    const label = reduced.matches
      ? (english ? 'Automatic rotation disabled: reduced motion' : 'Samodejna menjava izklopljena: reduced motion')
      : paused ? (english ? 'Resume screen rotation' : 'Nadaljuj menjavanje zaslonov')
        : (english ? 'Pause screen rotation' : 'Ustavi menjavanje zaslonov');
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.disabled = reduced.matches;
    toggle.querySelector('span').textContent = paused || reduced.matches ? '▶' : 'Ⅱ';
    if (paused || reduced.matches || document.hidden || !visible || content?.hidden || (focused && !explicitPlay)) return;
    timer = setTimeout(() => {
      active = (active + 1) % slides.length;
      render();
      schedule();
    }, interval);
  };

  toggle.addEventListener('click', () => {
    paused = !paused;
    explicitPlay = !paused;
    schedule();
  });
  next.addEventListener('click', () => {
    paused = true;
    explicitPlay = false;
    active = (active + 1) % slides.length;
    render();
    schedule();
  });
  carousel.addEventListener('focusin', () => {
    focused = true;
    explicitPlay = false;
    schedule();
  });
  carousel.addEventListener('focusout', event => {
    focused = carousel.contains(event.relatedTarget);
    explicitPlay = false;
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      schedule();
    }, { threshold: .2 }).observe(carousel);
  }
  if (content) new MutationObserver(schedule).observe(content, { attributes: true, attributeFilter: ['hidden'] });
  controls.hidden = false;
  render();
  schedule();
})();

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
