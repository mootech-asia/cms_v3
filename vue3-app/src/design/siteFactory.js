import { DEFAULT_SKIN, SKINS } from '../skins/index.js';
import { LANGS } from '../data/i18n.js';
import { HERO_SLIDES } from '../data/index.js';

export const LOBBY_LAYOUT_STORAGE_KEY = 'cms-v3:lobby-layout';
export const LEGACY_LOBBY_ORDER_STORAGE_KEY = 'cms-v3:lobby-section-order';
export const SKIN_VISIBILITY_STORAGE_KEY = 'cms-v3:visible-skins';
export const LOCALE_VISIBILITY_STORAGE_KEY = 'cms-v3:visible-locales';
export const STUDIO_DRAFT_STORAGE_KEY = 'cms-v3:studio-draft';
export const STUDIO_PREVIEW_QUERY_PARAM = 'studio-preview';

export function isStudioPreviewMode() {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).has(STUDIO_PREVIEW_QUERY_PARAM);
  } catch {
    return false;
  }
}

let studioDraftMemo = { raw: undefined, parsed: null };

export function readStudioDraft(storage = window.localStorage) {
  try {
    const raw = storage.getItem(STUDIO_DRAFT_STORAGE_KEY);
    if (raw === studioDraftMemo.raw) return studioDraftMemo.parsed;
    if (!raw) {
      studioDraftMemo = { raw, parsed: null };
      return null;
    }
    const parsed = JSON.parse(raw);
    const result = parsed && typeof parsed === 'object' ? parsed : null;
    studioDraftMemo = { raw, parsed: result };
    return result;
  } catch {
    return null;
  }
}

export function writeStudioDraft(draft, storage = window.localStorage) {
  try {
    storage.setItem(STUDIO_DRAFT_STORAGE_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
  } catch {
    // Live preview still degrades gracefully when persistent storage is unavailable.
  }
}

function readJSON(key, storage) {
  return JSON.parse(storage.getItem(key));
}

function writeJSON(key, value, storage) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // The draft/session state remains usable when persistent storage is unavailable.
  }
}

// Reads `storageKey`, preferring the studio draft's `draftField` while in
// studio preview mode. `normalize` shapes the raw value (draft or storage)
// into the public return type; `fallback` covers a missing/invalid value.
function readWithDraftOverride(storageKey, draftField, normalize, fallback, storage = window.localStorage) {
  if (isStudioPreviewMode()) {
    const draft = readStudioDraft(storage);
    if (draft?.[draftField]) return normalize(draft[draftField]);
  }
  try {
    return normalize(readJSON(storageKey, storage));
  } catch {
    return fallback();
  }
}

export const DEFAULT_LOBBY_SECTION_ORDER = Object.freeze([
  'recently-played',
  'slots',
  'live-casino',
  'live-sport',
  'top-wins',
  'promotions',
  'providers',
]);

export const LEGACY_DEFAULT_LOBBY_SECTION_ORDERS = Object.freeze([
  ['recently-played', 'slots', 'live-casino', 'top-wins', 'live-sport', 'promotions', 'providers'],
  ['recently-played', 'slots', 'live-casino', 'live-sport', 'promotions', 'top-wins', 'providers'],
]);

export const DEFAULT_VISIBLE_SKIN_IDS = Object.freeze(SKINS.map((skin) => skin.id));

export const LOBBY_SECTION_LABELS = Object.freeze({
  'recently-played': 'Recently played',
  slots: 'Slots',
  'live-casino': 'Live Casino',
  'top-wins': 'Top wins',
  'live-sport': 'Live sport',
  promotions: 'Promotions',
  providers: 'Providers',
});

export function normalizeLobbyOrder(value) {
  const input = Array.isArray(value) ? value : [];
  const known = input.filter((id) => DEFAULT_LOBBY_SECTION_ORDER.includes(id));
  const missing = DEFAULT_LOBBY_SECTION_ORDER.filter((id) => !known.includes(id));
  const normalized = [...new Set([...known, ...missing])];
  const isLegacyDefault = LEGACY_DEFAULT_LOBBY_SECTION_ORDERS.some((order) =>
    order.length === normalized.length && order.every((id, index) => id === normalized[index])
  );
  return isLegacyDefault ? [...DEFAULT_LOBBY_SECTION_ORDER] : normalized;
}

export function normalizeHiddenSections(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .filter((id) => DEFAULT_LOBBY_SECTION_ORDER.includes(id)))];
}

export const DEFAULT_VISIBLE_LOCALE_IDS = Object.freeze(Object.keys(LANGS));

export function normalizeVisibleLocaleIds(value) {
  const ids = Array.isArray(value) ? value : [];
  const known = new Set(ids);
  const normalized = DEFAULT_VISIBLE_LOCALE_IDS.filter((id) => known.has(id));
  return normalized.length ? normalized : [...DEFAULT_VISIBLE_LOCALE_IDS];
}

export function readVisibleLocaleIds(storage = window.localStorage) {
  return readWithDraftOverride(
    LOCALE_VISIBILITY_STORAGE_KEY,
    'visibleLocaleIds',
    normalizeVisibleLocaleIds,
    () => [...DEFAULT_VISIBLE_LOCALE_IDS],
    storage,
  );
}

export function writeVisibleLocaleIds(ids, storage = window.localStorage) {
  const normalized = normalizeVisibleLocaleIds(ids);
  writeJSON(LOCALE_VISIBILITY_STORAGE_KEY, normalized, storage);
  return normalized;
}

export function normalizeVisibleSkinIds(value) {
  const ids = Array.isArray(value) ? value : [];
  const known = new Set(ids);
  const normalized = SKINS
    .map((skin) => skin.id)
    .filter((id) => known.has(id));

  if (normalized.length) return normalized;
  return DEFAULT_VISIBLE_SKIN_IDS.includes(DEFAULT_SKIN)
    ? [...DEFAULT_VISIBLE_SKIN_IDS]
    : [SKINS[0].id];
}

function normalizeLobbyLayout(saved, storage) {
  if (saved && typeof saved === 'object') {
    return {
      order: normalizeLobbyOrder(saved.order),
      hidden: normalizeHiddenSections(saved.hidden),
    };
  }
  const legacyOrder = readJSON(LEGACY_LOBBY_ORDER_STORAGE_KEY, storage);
  return { order: normalizeLobbyOrder(legacyOrder), hidden: [] };
}

export function readLobbyLayout(storage = window.localStorage) {
  return readWithDraftOverride(
    LOBBY_LAYOUT_STORAGE_KEY,
    'layout',
    (saved) => normalizeLobbyLayout(saved, storage),
    () => ({ order: [...DEFAULT_LOBBY_SECTION_ORDER], hidden: [] }),
    storage,
  );
}

export function writeLobbyLayout(layout, storage = window.localStorage) {
  const normalized = {
    order: normalizeLobbyOrder(layout?.order),
    hidden: normalizeHiddenSections(layout?.hidden),
  };
  writeJSON(LOBBY_LAYOUT_STORAGE_KEY, { version: 1, ...normalized }, storage);
  writeJSON(LEGACY_LOBBY_ORDER_STORAGE_KEY, normalized.order, storage);
  return normalized;
}

export function readVisibleSkinIds(storage = window.localStorage) {
  return readWithDraftOverride(
    SKIN_VISIBILITY_STORAGE_KEY,
    'visibleSkinIds',
    normalizeVisibleSkinIds,
    () => [...DEFAULT_VISIBLE_SKIN_IDS],
    storage,
  );
}

export function writeVisibleSkinIds(ids, storage = window.localStorage) {
  const normalized = normalizeVisibleSkinIds(ids);
  writeJSON(SKIN_VISIBILITY_STORAGE_KEY, normalized, storage);
  return normalized;
}

export const HERO_BANNERS_STORAGE_KEY = 'cms-v3:hero-banners';

export function defaultHeroBanners() {
  return HERO_SLIDES.map((slide, index) => ({
    id: `default-${index + 1}`,
    label: slide.title.replace('\n', ' '),
    image: slide.image,
    position: slide.position || 'center',
    mobilePosition: slide.mobilePosition || slide.position || 'center',
  }));
}

export function normalizeHeroBanners(value) {
  const list = Array.isArray(value) ? value : [];
  const normalized = list
    .filter((item) => item && typeof item.image === 'string' && item.image)
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id ? item.id : `banner-${index + 1}`,
      label: typeof item.label === 'string' && item.label ? item.label : `Banner ${index + 1}`,
      image: item.image,
      position: typeof item.position === 'string' && item.position ? item.position : 'center',
      mobilePosition: typeof item.mobilePosition === 'string' && item.mobilePosition
        ? item.mobilePosition
        : (item.position || 'center'),
    }));
  return normalized.length ? normalized : defaultHeroBanners();
}

export function readHeroBanners(storage = window.localStorage) {
  return readWithDraftOverride(
    HERO_BANNERS_STORAGE_KEY,
    'banners',
    (saved) => (saved ? normalizeHeroBanners(saved) : defaultHeroBanners()),
    defaultHeroBanners,
    storage,
  );
}

export function writeHeroBanners(banners, storage = window.localStorage) {
  const normalized = normalizeHeroBanners(banners);
  writeJSON(HERO_BANNERS_STORAGE_KEY, normalized, storage);
  return normalized;
}
