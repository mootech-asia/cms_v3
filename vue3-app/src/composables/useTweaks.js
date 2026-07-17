import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { DEFAULT_SKIN, SKINS, getSkin, normalizeSkin } from '../skins/index.js';
import { isStudioPreviewMode, readStudioDraft, STUDIO_DRAFT_STORAGE_KEY } from '../design/siteFactory.js';

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
  const previewMode = isStudioPreviewMode();

  // In studio live-preview mode, the draft skin wins; with no draft yet, fall
  // back to the visitor's real persisted appearance so preview matches prod.
  try {
    const draft = previewMode ? readStudioDraft() : null;
    if (draft?.skin) {
      t.skin = normalizeSkin(draft.skin);
    } else {
      const savedTheme = localStorage.getItem('cms_theme');
      const savedSkin = localStorage.getItem('cms_skin');

      const restoredSkin =
        savedTheme === 'light' && (!savedSkin || savedSkin === 'blue')
          ? 'white'
          : savedSkin || t.skin;

      t.skin = normalizeSkin(restoredSkin);
    }
  } catch (e) { /* localStorage can be unavailable in private contexts */ }

  function setTweak(key, val) {
    t[key] = val;
  }

  watch(
    () => t.theme,
    (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      if (previewMode) return;
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

      const config = getSkin(skin);
      if (t.theme !== config.theme) t.theme = config.theme;

      const root = document.documentElement;
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-2');
      root.style.removeProperty('--accent-3');
      root.setAttribute('data-skin', skin);

      if (previewMode) return;
      try { localStorage.setItem('cms_skin', skin); } catch (e) { /* ignore */ }
    },
    { immediate: true }
  );

  watch(
    () => t.aspect,
    (aspect) => document.documentElement.style.setProperty('--card-aspect', aspect),
    { immediate: true }
  );

  // Live-reflect studio draft skin changes without any reload or persistence.
  if (previewMode) {
    const handlePreviewStorage = (event) => {
      if (event.key !== null && event.key !== STUDIO_DRAFT_STORAGE_KEY) return;
      const draft = readStudioDraft();
      if (draft?.skin) t.skin = normalizeSkin(draft.skin);
    };
    onMounted(() => window.addEventListener('storage', handlePreviewStorage));
    onUnmounted(() => window.removeEventListener('storage', handlePreviewStorage));
  }

  return { t, setTweak, skins: SKINS };
}
