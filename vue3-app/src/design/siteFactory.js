import { DEFAULT_SKIN, SKINS } from '../skins/index.js';

export const LOBBY_LAYOUT_STORAGE_KEY = 'cms-v3:lobby-layout';
export const LEGACY_LOBBY_ORDER_STORAGE_KEY = 'cms-v3:lobby-section-order';
export const SKIN_VISIBILITY_STORAGE_KEY = 'cms-v3:visible-skins';

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

export function readLobbyLayout(storage = window.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(LOBBY_LAYOUT_STORAGE_KEY));
    if (saved && typeof saved === 'object') {
      return {
        order: normalizeLobbyOrder(saved.order),
        hidden: normalizeHiddenSections(saved.hidden),
      };
    }
    const legacyOrder = JSON.parse(storage.getItem(LEGACY_LOBBY_ORDER_STORAGE_KEY));
    return { order: normalizeLobbyOrder(legacyOrder), hidden: [] };
  } catch {
    return { order: [...DEFAULT_LOBBY_SECTION_ORDER], hidden: [] };
  }
}

export function writeLobbyLayout(layout, storage = window.localStorage) {
  const normalized = {
    order: normalizeLobbyOrder(layout?.order),
    hidden: normalizeHiddenSections(layout?.hidden),
  };
  try {
    storage.setItem(LOBBY_LAYOUT_STORAGE_KEY, JSON.stringify({ version: 1, ...normalized }));
    storage.setItem(LEGACY_LOBBY_ORDER_STORAGE_KEY, JSON.stringify(normalized.order));
  } catch {
    // The draft remains usable when persistent storage is unavailable.
  }
  return normalized;
}

export function readVisibleSkinIds(storage = window.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(SKIN_VISIBILITY_STORAGE_KEY));
    return normalizeVisibleSkinIds(saved);
  } catch {
    return [...DEFAULT_VISIBLE_SKIN_IDS];
  }
}

export function writeVisibleSkinIds(ids, storage = window.localStorage) {
  const normalized = normalizeVisibleSkinIds(ids);
  try {
    storage.setItem(SKIN_VISIBILITY_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Skin visibility still works for the current session when storage is unavailable.
  }
  return normalized;
}
