import '../assets/skins/white.css';
import '../assets/skins/blue.css';
import '../assets/skins/night-esports-green.css';
import '../assets/skins/cosmic-spectrum-purple.css';

export const DEFAULT_SKIN = 'blue';

export const SKINS = Object.freeze([
  Object.freeze({
    id: 'white',
    label: 'Pearl Signature',
    theme: 'light',
    swatch: '#343a42',
    surface: '#ffffff',
  }),
  Object.freeze({
    id: 'blue',
    label: 'Sapphire Royale',
    theme: 'dark',
    swatch: '#2473ff',
    surface: '#05080f',
  }),
  Object.freeze({
    id: 'night-esports-green',
    label: 'Emerald Nocturne',
    theme: 'dark',
    swatch: '#9fe2d1',
    surface: '#0d1316',
  }),
  Object.freeze({
    id: 'cosmic-spectrum-purple',
    label: 'Cosmic Amethyst',
    theme: 'dark',
    swatch: '#6a48ff',
    surface: '#0b0a25',
  }),
]);

export function getSkin(value) {
  return SKINS.find((skin) => skin.id === value)
    || SKINS.find((skin) => skin.id === DEFAULT_SKIN);
}

export function normalizeSkin(value) {
  return getSkin(value).id;
}
