'use strict';
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('navigation');
if (toggle && nav) {
  toggle.hidden = false;
  document.documentElement.classList.add('js');
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => { toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true')); });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); } });
  document.addEventListener('click', event => { if (!nav.contains(event.target) && !toggle.contains(event.target)) close(); });
  window.matchMedia('(min-width: 1000px)').addEventListener('change', close);
}
