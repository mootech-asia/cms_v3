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
    swatch: '#2473ff',
    surface: '#ffffff',
  }),
  Object.freeze({
    id: 'blue',
    label: 'Blue',
    theme: 'dark',
    swatch: '#2473ff',
    surface: '#05080f',
  }),
  Object.freeze({
    id: 'night-esports-green',
    label: 'Night Esports Green',
    theme: 'dark',
    swatch: '#22e06f',
    surface: '#050806',
  }),
  Object.freeze({
    id: 'cosmic-spectrum-purple',
    label: '宇宙繽紛紫',
    theme: 'dark',
    swatch: '#a855f7',
    surface: '#0b0714',
  }),
]);

export function getSkin(value) {
  return SKINS.find((skin) => skin.id === value)
    || SKINS.find((skin) => skin.id === DEFAULT_SKIN);
}

export function normalizeSkin(value) {
  return getSkin(value).id;
}
