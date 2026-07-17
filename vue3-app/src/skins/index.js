import '../assets/skins/white.css';
import '../assets/skins/blue.css';
import '../assets/skins/night-esports-green.css';
import '../assets/skins/cosmic-spectrum-purple.css';
import '../assets/skins/curated-collection.css';

export const DEFAULT_SKIN = 'blue';

export const SKINS = Object.freeze([
  Object.freeze({
    id: 'white',
    label: 'Pearl Signature',
    theme: 'light',
    swatch: '#4d4941',
    surface: '#f5f2e9',
  }),
  Object.freeze({
    id: 'sage-atelier',
    label: 'Sage Atelier',
    theme: 'light',
    swatch: '#9ab7ac',
    surface: '#ecefe9',
  }),
  Object.freeze({
    id: 'night-esports-green',
    label: 'Emerald Nocturne',
    theme: 'dark',
    swatch: '#9fe2d1',
    surface: '#0d1316',
  }),
  Object.freeze({
    id: 'arctic-cyan',
    label: 'Arctic Cyan',
    theme: 'dark',
    swatch: '#62c8d8',
    surface: '#071116',
  }),
  Object.freeze({
    id: 'midnight-gold',
    label: 'Midnight Gold',
    theme: 'dark',
    swatch: '#d2b465',
    surface: '#080d16',
  }),
  Object.freeze({
    id: 'obsidian-copper',
    label: 'Obsidian Copper',
    theme: 'dark',
    swatch: '#d8a06b',
    surface: '#0d0e0f',
  }),
  Object.freeze({
    id: 'crimson-noir',
    label: 'Crimson Noir',
    theme: 'dark',
    swatch: '#df7b89',
    surface: '#11090d',
  }),
  Object.freeze({
    id: 'blue',
    label: 'Sapphire Royale',
    theme: 'dark',
    swatch: '#2473ff',
    surface: '#05080f',
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
