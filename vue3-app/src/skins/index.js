export const DEFAULT_SKIN = 'blue';

export const SKINS = Object.freeze([
  Object.freeze({ id: 'blue', label: 'Blue' }),
]);

export function normalizeSkin(value) {
  return SKINS.some((skin) => skin.id === value) ? value : DEFAULT_SKIN;
}
