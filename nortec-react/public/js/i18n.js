const LANGUAGE_KEY = 'nortec-language';
const SUPPORTED = new Set(['en', 'es']);

function resolveLanguage() {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && SUPPORTED.has(stored)) return stored;
  return 'en';
}

function setTextForLanguage(lang) {
  document.querySelectorAll('[data-en][data-es]').forEach((el) => {
    const value = el.getAttribute(`data-${lang}`) ?? '';
    if (el.dataset.i18nHtml === 'true') {
      el.innerHTML = value;
      return;
    }
    el.textContent = value;
  });

  document.querySelectorAll('[data-en-placeholder][data-es-placeholder]').forEach((el) => {
    const value = el.getAttribute(`data-${lang}-placeholder`) ?? '';
    el.setAttribute('placeholder', value);
  });

  document.querySelectorAll('[data-en-title][data-es-title]').forEach((el) => {
    const value = el.getAttribute(`data-${lang}-title`) ?? '';
    el.setAttribute('title', value);
  });
}

function syncToggles(lang) {
  document.querySelectorAll('[data-lang-option]').forEach((btn) => {
    const isActive = btn.dataset.langOption === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function applyLanguage(lang) {
  const next = SUPPORTED.has(lang) ? lang : 'en';
  localStorage.setItem(LANGUAGE_KEY, next);
  document.documentElement.lang = next;
  setTextForLanguage(next);
  syncToggles(next);
  window.dispatchEvent(new CustomEvent('nortec:langchange', { detail: { lang: next } }));
}

function wireToggles() {
  document.querySelectorAll('[data-lang-option]').forEach((btn) => {
    if (btn.dataset.langWired === '1') return;
    btn.dataset.langWired = '1';
    btn.addEventListener('click', () => {
      applyLanguage(btn.dataset.langOption || 'en');
    });
  });
}

export function getCurrentLanguage() {
  return resolveLanguage();
}

export function refreshI18n() {
  const lang = resolveLanguage();
  setTextForLanguage(lang);
  syncToggles(lang);
}

export function initI18n() {
  wireToggles();
  applyLanguage(resolveLanguage());
}

