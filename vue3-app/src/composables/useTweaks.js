import { reactive, watch } from 'vue';
import { DEFAULT_SKIN, SKINS, normalizeSkin } from '../skins/index.js';

export const TWEAK_DEFAULTS = {
  theme:            'dark',
  skin:             DEFAULT_SKIN,
  density:          'comfy',
  aspect:            1.1,
  showPromos:        true,
  sidebarCollapsed:  false,
};

export function useTweaks(defaults = TWEAK_DEFAULTS) {
  const t = reactive({ ...defaults });

  // Restore the visitor's last appearance settings.
  try {
    const savedTheme = localStorage.getItem('cms_theme');
    const savedSkin = localStorage.getItem('cms_skin');

    if (savedTheme === 'dark' || savedTheme === 'light') t.theme = savedTheme;
    t.skin = normalizeSkin(savedSkin || t.skin);
  } catch (e) { /* localStorage can be unavailable in private contexts */ }

  function setTweak(key, val) {
    t[key] = val;
  }

  watch(
    () => t.theme,
    (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('cms_theme', theme); } catch (e) { /* ignore */ }
    },
    { immediate: true }
  );

  // A skin owns all visual color tokens. Removing old inline accent values keeps
  // subsequent skins free to replace the complete palette.
  watch(
    () => t.skin,
    (value) => {
      const skin = normalizeSkin(value);

      if (value !== skin) {
        t.skin = skin;
        return;
      }

      const root = document.documentElement;
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-2');
      root.style.removeProperty('--accent-3');
      root.setAttribute('data-skin', skin);

      try { localStorage.setItem('cms_skin', skin); } catch (e) { /* ignore */ }
    },
    { immediate: true }
  );

  watch(
    () => t.aspect,
    (aspect) => document.documentElement.style.setProperty('--card-aspect', aspect),
    { immediate: true }
  );

  return { t, setTweak, skins: SKINS };
}
