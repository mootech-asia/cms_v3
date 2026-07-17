import { reactive, readonly } from 'vue';
import {
  DEFAULT_DESIGN_MODULES,
  DESIGN_MODULES,
  DESIGN_SCHEMA_VERSION,
  DESIGN_STORAGE_KEY,
  DESIGN_VARIANTS,
  makeDesignAttributes,
  makeDesignStyle,
  normalizeDesignModules,
} from '@/design/registry.js';
import {
  isStudioPreviewMode,
  readStudioDraft,
  STUDIO_DRAFT_STORAGE_KEY,
} from '@/design/siteFactory.js';

const state = reactive({
  version: DESIGN_SCHEMA_VERSION,
  modules: { ...DEFAULT_DESIGN_MODULES },
  updatedAt: null,
});

let initialized = false;

function readSavedConfig() {
  try {
    const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

// In studio live-preview mode, draft module variants take priority over the
// applied config; when the draft has no modules yet, fall back to the real
// applied config so the preview matches the live site until edits happen.
function resolveActiveConfig() {
  if (isStudioPreviewMode()) {
    const draft = readStudioDraft();
    if (draft?.modules) return { modules: draft.modules, updatedAt: draft.updatedAt || null };
  }
  const saved = readSavedConfig();
  return { modules: saved?.modules, updatedAt: saved?.updatedAt || null };
}

function writeRootConfig(modules) {
  const root = document.documentElement;
  const attributes = makeDesignAttributes(modules);
  const style = makeDesignStyle(modules);

  Object.entries(attributes).forEach(([key, value]) => root.setAttribute(key, value));
  Object.entries(style).forEach(([key, value]) => root.style.setProperty(key, value));
}

function persist() {
  if (isStudioPreviewMode()) return;
  try {
    localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify({
      version: DESIGN_SCHEMA_VERSION,
      modules: state.modules,
      updatedAt: state.updatedAt,
    }));
  } catch {
    // The active design still works when storage is unavailable.
  }
}

function applyConfig(config, { save = true } = {}) {
  state.modules = normalizeDesignModules(config?.modules || config);
  state.updatedAt = new Date().toISOString();
  writeRootConfig(state.modules);
  if (save) persist();
}

function resetConfig() {
  applyConfig({ modules: DEFAULT_DESIGN_MODULES });
}

// Studio writes the live draft to STUDIO_DRAFT_STORAGE_KEY on every change;
// as a different browsing context (the preview iframe), this window receives
// a native `storage` event and re-applies without ever persisting itself.
function handlePreviewStorage(event) {
  if (event.key !== null && event.key !== STUDIO_DRAFT_STORAGE_KEY) return;
  const config = resolveActiveConfig();
  applyConfig({ modules: config.modules }, { save: false });
  state.updatedAt = config.updatedAt;
}

function initialize() {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;
  const config = resolveActiveConfig();
  state.modules = normalizeDesignModules(config.modules);
  state.updatedAt = config.updatedAt;
  writeRootConfig(state.modules);
  if (isStudioPreviewMode()) {
    window.addEventListener('storage', handlePreviewStorage);
  }
}

export function useDesignStudio() {
  initialize();

  return {
    design: readonly(state),
    modules: DESIGN_MODULES,
    variants: DESIGN_VARIANTS,
    applyConfig,
    resetConfig,
    makeDesignAttributes,
    makeDesignStyle,
    normalizeDesignModules,
  };
}
