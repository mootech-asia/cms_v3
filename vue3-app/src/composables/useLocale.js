import { readonly, ref } from 'vue';
import { LANGS, LOCALE_STORAGE_KEY, TRANSLATIONS } from '@/data/i18n.js';

const fallbackLocale = 'zh';
const locale = ref(fallbackLocale);
let initialized = false;

function readSavedLocale() {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return LANGS[saved] ? saved : fallbackLocale;
  } catch {
    return fallbackLocale;
  }
}

function writeLocale(value) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, value);
  } catch {
    // Language switching still works for the current session.
  }
}

function applyDocumentLocale(value) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = LANGS[value]?.htmlLang || LANGS[fallbackLocale].htmlLang;
}

function resolvePath(source, path) {
  const segments = Array.isArray(path) ? path : String(path).split('.');
  return segments.reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), source);
}

function format(value, params = {}) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => (
    params[key] === undefined ? `{${key}}` : String(params[key])
  ));
}

function translate(path, fallback = '', params) {
  const value = resolvePath(TRANSLATIONS[locale.value], path);
  const fallbackValue = resolvePath(TRANSLATIONS[fallbackLocale], path);
  const hasCallerFallback = fallback !== undefined && fallback !== null && fallback !== '';
  return format(value ?? (hasCallerFallback ? fallback : undefined) ?? fallbackValue ?? fallback, params);
}

function translateRecord(records, fallback = '') {
  return records?.[locale.value] ?? records?.[fallbackLocale] ?? records?.en ?? fallback;
}

function setLocale(value) {
  if (!LANGS[value]) return;
  locale.value = value;
  applyDocumentLocale(value);
  writeLocale(value);
}

function initialize() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  locale.value = readSavedLocale();
  applyDocumentLocale(locale.value);
}

export function useLocale() {
  initialize();

  return {
    locale: readonly(locale),
    languages: LANGS,
    setLocale,
    t: translate,
    text: translateRecord,
  };
}
