'use strict';

// Nastavitve začasnega predogleda: kodo in izklop urejajte samo tukaj.
const MYATHLETICS_PREVIEW = Object.freeze({
  enabled: true, // false = neposreden dostop do domače strani
  code: '6842', // Vedno štiri števke; ohranite narekovaje tudi pri začetni ničli.
  rememberDays: 7
});

(() => {
  const gate = document.getElementById('preview-access');
  const content = document.getElementById('preview-content');
  if (!gate || !content) return;

  const storageKey = 'myathletics.preview-access.v1';
  const lifetime = MYATHLETICS_PREVIEW.rememberDays * 24 * 60 * 60 * 1000;
  const english = document.documentElement.lang === 'en';
  const form = gate.querySelector('form');
  const input = gate.querySelector('input');
  const feedback = document.getElementById('preview-feedback');

  const unlock = (moveFocus = false) => {
    content.hidden = false;
    content.removeAttribute('inert');
    gate.remove();
    if (moveFocus) document.getElementById('main')?.focus({ preventScroll: true });
  };

  if (!MYATHLETICS_PREVIEW.enabled) {
    unlock();
    return;
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    const now = Date.now();
    if (saved && Number.isFinite(saved.expiresAt) && saved.expiresAt > now && saved.expiresAt <= now + lifetime) {
      unlock();
      return;
    }
    localStorage.removeItem(storageKey);
  } catch {
    // A blocked or unavailable localStorage must not prevent code entry.
  }

  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 4);
    input.removeAttribute('aria-invalid');
    feedback.textContent = '';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!/^[0-9]{4}$/.test(input.value)) {
      feedback.textContent = english ? 'Enter a four-digit code.' : 'Vnesi štirimestno kodo.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    if (input.value !== MYATHLETICS_PREVIEW.code) {
      feedback.textContent = english ? 'Incorrect code. Please try again.' : 'Napačna koda. Poskusi znova.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      input.select();
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify({ expiresAt: Date.now() + lifetime }));
    } catch {
      // Access still works for this visit when browser storage is disabled.
    }
    unlock(true);
  });
})();
