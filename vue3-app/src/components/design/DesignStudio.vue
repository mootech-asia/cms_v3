<template>
  <section class="design-studio" :data-screen-label="t('studio.title')">
    <header class="studio-header">
      <div>
        <div class="studio-eyebrow">{{ t('studio.eyebrow') }}</div>
        <div class="studio-title-row">
          <h1>{{ t('studio.title') }}</h1>
          <span class="studio-schema">{{ t('studio.schema') }} {{ design.version }}</span>
          <span v-if="dirty" class="studio-unsaved">{{ t('studio.unsaved') }}</span>
        </div>
        <p>{{ t('studio.intro') }}</p>
      </div>
      <div class="studio-header-actions">
        <label class="studio-lang-control">
          <span>{{ t('studio.language') }}</span>
          <select class="studio-select" :value="locale" @change="changeStudioLocale($event.target.value)">
            <option v-for="(option, key) in languages" :key="key" :value="key">{{ option.label }}</option>
          </select>
        </label>
        <button class="studio-button quiet" type="button" @click="emit('navigate', 'Lobby')">{{ t('studio.viewSite') }}</button>
        <button class="studio-button quiet" type="button" :disabled="!dirty" @click="resetDraft">{{ t('studio.resetDraft') }}</button>
        <button class="studio-button quiet" type="button" @click="importInput?.click()">{{ t('studio.import') }}</button>
        <button class="studio-button quiet" type="button" @click="exportConfig">{{ t('studio.export') }}</button>
        <button class="studio-button primary" type="button" :disabled="!dirty" @click="applyDraft">
          {{ t('studio.apply') }}
        </button>
        <input ref="importInput" class="studio-file-input" type="file" accept="application/json,.json" @change="importConfig" />
      </div>
    </header>

    <div v-if="notice" class="studio-notice" role="status">{{ notice }}</div>

    <div class="studio-workspace">
      <aside class="studio-module-panel" :aria-label="t('studio.moduleLibrary')">
        <section class="studio-factory-section" aria-labelledby="studio-factory-title">
          <div class="studio-panel-head studio-factory-heading">
            <div>
              <span id="studio-factory-title">{{ t('studio.siteFactory') }}</span>
              <small>{{ t('studio.siteFactorySub') }}</small>
            </div>
          </div>

          <div class="studio-factory-group" :class="{ open: factoryGroupOpen.previewSkin }">
            <button
              type="button"
              class="studio-factory-group-head"
              :aria-expanded="factoryGroupOpen.previewSkin"
              aria-controls="studio-factory-panel-previewSkin"
              :aria-label="`${factoryGroupOpen.previewSkin ? t('common.collapse') : t('common.expand')} ${t('studio.previewSkin')}`"
              @click="toggleFactoryGroup('previewSkin')"
            >
              <span class="studio-factory-group-title">{{ t('studio.previewSkin') }}</span>
              <span class="studio-factory-group-badge">{{ previewSkinLabel }}</span>
              <Icon name="chevD" class="studio-factory-caret" aria-hidden="true" />
            </button>
            <div v-show="factoryGroupOpen.previewSkin" id="studio-factory-panel-previewSkin" class="studio-factory-group-body">
              <label class="studio-factory-field">
                <span>{{ t('studio.previewSkin') }}</span>
                <div class="studio-skin-picker" ref="skinPickerRef">
                  <button
                    type="button"
                    ref="skinTriggerRef"
                    class="studio-skin-picker-trigger"
                    aria-haspopup="listbox"
                    :aria-expanded="skinMenuOpen"
                    @click="toggleSkinMenu"
                  >
                    <span
                      class="studio-skin-swatch"
                      :style="{ '--skin-color': activeSkinOption?.swatch, '--skin-surface': activeSkinOption?.surface }"
                      aria-hidden="true"
                    ></span>
                    <span class="studio-skin-picker-label">{{ previewSkinLabel }}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  <div
                    v-if="skinMenuOpen"
                    class="studio-skin-picker-menu"
                    role="listbox"
                    :aria-label="t('studio.previewSkin')"
                    @keydown="onSkinMenuKeydown"
                  >
                    <button
                      v-for="(skin, index) in skins"
                      :key="skin.id"
                      type="button"
                      :ref="(el) => (skinOptionRefs[index] = el)"
                      class="studio-skin-picker-option"
                      role="option"
                      :aria-selected="draftSkin === skin.id"
                      @click="selectDraftSkin(skin.id)"
                    >
                      <span
                        class="studio-skin-swatch"
                        :style="{ '--skin-color': skin.swatch, '--skin-surface': skin.surface }"
                        aria-hidden="true"
                      ></span>
                      <span class="studio-skin-picker-option-label">{{ skin.label }}</span>
                      <svg v-if="draftSkin === skin.id" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4 10-10" /></svg>
                    </button>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="studio-factory-group" :class="{ open: factoryGroupOpen.frontendLocales }">
            <button
              type="button"
              class="studio-factory-group-head"
              :aria-expanded="factoryGroupOpen.frontendLocales"
              aria-controls="studio-factory-panel-frontendLocales"
              :aria-label="`${factoryGroupOpen.frontendLocales ? t('common.collapse') : t('common.expand')} ${t('studio.frontendLocales')}`"
              @click="toggleFactoryGroup('frontendLocales')"
            >
              <span class="studio-factory-group-title">{{ t('studio.frontendLocales') }}</span>
              <span class="studio-factory-group-badge">{{ t('studio.visibleLocaleCount', '', { visible: visibleLocaleIds.length, total: localeIds.length }) }}</span>
              <Icon name="chevD" class="studio-factory-caret" aria-hidden="true" />
            </button>
            <div v-show="factoryGroupOpen.frontendLocales" id="studio-factory-panel-frontendLocales" class="studio-factory-group-body">
              <div class="studio-front-skin-control">
                <small class="studio-factory-group-sub">{{ t('studio.frontendLocalesSub') }}</small>

                <div class="studio-skin-list" :aria-label="t('studio.frontendLocales')">
                  <label
                    v-for="id in localeIds"
                    :key="id"
                    class="studio-skin-item"
                    :class="{ active: isLocaleVisible(id), locked: isOnlyVisibleLocale(id) }"
                  >
                    <input
                      class="studio-skin-checkbox"
                      type="checkbox"
                      :checked="isLocaleVisible(id)"
                      :disabled="isOnlyVisibleLocale(id)"
                      :aria-label="`${isLocaleVisible(id) ? t('studio.hide') : t('studio.show')} ${languages[id].label}`"
                      @change="toggleVisibleLocale(id)"
                    />
                    <span class="studio-skin-swatch studio-locale-flag" aria-hidden="true">
                      <LocaleFlag :code="id" />
                    </span>
                    <span class="studio-skin-copy">
                      <strong>{{ languages[id].label }}</strong>
                      <small>{{ id.toUpperCase() }}</small>
                    </span>
                    <span class="studio-skin-state">{{ isLocaleVisible(id) ? t('studio.show') : t('studio.hide') }}</span>
                    <span class="studio-visibility-toggle" :aria-checked="isLocaleVisible(id)" aria-hidden="true"><span /></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="studio-factory-group" :class="{ open: factoryGroupOpen.frontendSkins }">
            <button
              type="button"
              class="studio-factory-group-head"
              :aria-expanded="factoryGroupOpen.frontendSkins"
              aria-controls="studio-factory-panel-frontendSkins"
              :aria-label="`${factoryGroupOpen.frontendSkins ? t('common.collapse') : t('common.expand')} ${t('studio.frontendSkins')}`"
              @click="toggleFactoryGroup('frontendSkins')"
            >
              <span class="studio-factory-group-title">{{ t('studio.frontendSkins') }}</span>
              <span class="studio-factory-group-badge">{{ t('studio.visibleSkinCount', '', { visible: draftVisibleSkinIds.length, total: skins.length }) }}</span>
              <Icon name="chevD" class="studio-factory-caret" aria-hidden="true" />
            </button>
            <div v-show="factoryGroupOpen.frontendSkins" id="studio-factory-panel-frontendSkins" class="studio-factory-group-body">
              <div class="studio-front-skin-control">
                <small class="studio-factory-group-sub">{{ t('studio.frontendSkinsSub') }}</small>

                <div class="studio-skin-list" :aria-label="t('studio.frontendSkins')">
                  <label
                    v-for="skin in skins"
                    :key="skin.id"
                    class="studio-skin-item"
                    :class="{ active: isSkinVisible(skin.id), locked: isOnlyVisibleSkin(skin.id) }"
                  >
                    <input
                      class="studio-skin-checkbox"
                      type="checkbox"
                      :checked="isSkinVisible(skin.id)"
                      :disabled="isOnlyVisibleSkin(skin.id)"
                      :aria-label="`${isSkinVisible(skin.id) ? t('studio.hide') : t('studio.show')} ${skin.label}`"
                      @change="toggleVisibleSkin(skin.id)"
                    />
                    <span
                      class="studio-skin-swatch"
                      :style="{ '--skin-color': skin.swatch, '--skin-surface': skin.surface }"
                      aria-hidden="true"
                    ></span>
                    <span class="studio-skin-copy">
                      <strong>{{ skin.label }}</strong>
                      <small>{{ skin.theme }}</small>
                    </span>
                    <span class="studio-skin-state">{{ isSkinVisible(skin.id) ? t('studio.show') : t('studio.hide') }}</span>
                    <span class="studio-visibility-toggle" :aria-checked="isSkinVisible(skin.id)" aria-hidden="true"><span /></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="studio-factory-group" :class="{ open: factoryGroupOpen.homeComposition }">
            <button
              type="button"
              class="studio-factory-group-head"
              :aria-expanded="factoryGroupOpen.homeComposition"
              aria-controls="studio-factory-panel-homeComposition"
              :aria-label="`${factoryGroupOpen.homeComposition ? t('common.collapse') : t('common.expand')} ${t('studio.homeComposition')}`"
              @click="toggleFactoryGroup('homeComposition')"
            >
              <span class="studio-factory-group-title">{{ t('studio.homeComposition') }}</span>
              <span class="studio-factory-group-badge">{{ t('studio.visibleCount', '', { visible: visibleLayoutCount, total: layoutOrder.length }) }}</span>
              <Icon name="chevD" class="studio-factory-caret" aria-hidden="true" />
            </button>
            <div v-show="factoryGroupOpen.homeComposition" id="studio-factory-panel-homeComposition" class="studio-factory-group-body">
              <div class="studio-factory-group-actions">
                <button class="studio-text-button" type="button" @click="restoreLayoutDefaults">{{ t('studio.resetLayout') }}</button>
              </div>

              <ul class="studio-layout-list" :aria-label="t('studio.homeComposition')">
                <li
                  v-for="(sectionId, index) in layoutOrder"
                  :key="sectionId"
                  class="studio-layout-item"
                  :class="{
                    'is-hidden': hiddenSections.includes(sectionId),
                    'is-drag-over': layoutOverId === sectionId && layoutDragId !== sectionId,
                  }"
                  draggable="true"
                  @dragstart="startLayoutDrag(sectionId)"
                  @dragover.prevent="layoutOverId = sectionId"
                  @drop.prevent="dropLayoutSection(sectionId)"
                  @dragend="finishLayoutDrag"
                >
                  <span class="studio-layout-grip" :title="t('studio.dragToReorder')" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <circle cx="4" cy="3" r="1" /><circle cx="10" cy="3" r="1" />
                      <circle cx="4" cy="7" r="1" /><circle cx="10" cy="7" r="1" />
                      <circle cx="4" cy="11" r="1" /><circle cx="10" cy="11" r="1" />
                    </svg>
                  </span>
                  <span class="studio-layout-name">{{ layoutLabel(sectionId) }}</span>
                  <button
                    class="studio-visibility-toggle"
                    type="button"
                    role="switch"
                    :aria-checked="!hiddenSections.includes(sectionId)"
                    :aria-label="`${hiddenSections.includes(sectionId) ? t('studio.show') : t('studio.hide')} ${layoutLabel(sectionId)}`"
                    @click="toggleLayoutSection(sectionId)"
                  ><span /></button>
                  <span class="studio-layout-move">
                    <button type="button" :disabled="index === 0" :aria-label="`${t('studio.moveUp')} ${layoutLabel(sectionId)}`" @click="moveLayoutSection(index, index - 1)">↑</button>
                    <button type="button" :disabled="index === layoutOrder.length - 1" :aria-label="`${t('studio.moveDown')} ${layoutLabel(sectionId)}`" @click="moveLayoutSection(index, index + 1)">↓</button>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div class="studio-panel-head">
          <div>
            <span>{{ t('studio.moduleLibrary') }}</span>
            <small>{{ t('studio.moduleCount', '', { count: modules.length }) }}</small>
          </div>
          <button class="studio-text-button" type="button" @click="restoreDefaults">{{ t('studio.setFoundation') }}</button>
        </div>

        <div v-for="group in moduleGroups" :key="group.category" class="studio-module-group">
          <h2>{{ group.label }}</h2>
          <button
            v-for="module in group.items"
            :key="module.id"
            type="button"
            class="studio-module-button"
            :class="{ active: selectedModuleId === module.id }"
            @click="selectedModuleId = module.id"
          >
            <span class="studio-module-index">{{ moduleIndex(module.id) }}</span>
            <span class="studio-module-copy">
              <strong>{{ moduleLabel(module) }}</strong>
              <small>{{ variantText(variantById(draft[module.id]), 'name') }}</small>
            </span>
            <span class="studio-module-code">{{ draft[module.id].toUpperCase() }}</span>
          </button>
        </div>
      </aside>

      <main class="studio-editor">
        <div class="studio-editor-head">
          <div>
            <div class="studio-eyebrow">{{ t('studio.selectedModule') }}</div>
            <h2>{{ moduleLabel(selectedModule) }}</h2>
            <p>{{ moduleDescription(selectedModule) }}</p>
          </div>
        </div>

        <MediaUploadField
          v-if="selectedMediaSpec && selectedModuleId !== 'banner'"
          :key="selectedModuleId"
          :spec="selectedMediaSpec"
          @change="replacePreviewAsset"
        />

        <section v-if="selectedModuleId === 'banner'" class="studio-banner-library" :aria-label="t('studio.bannerSet')">
          <header>
            <div>
              <span>{{ t('studio.bannerSet') }}</span>
              <small>{{ t('studio.available', '', { count: bannerLibrary.length }) }}</small>
            </div>
            <small>{{ t('studio.selectArtwork') }}</small>
          </header>

          <div class="studio-banner-add">
            <button type="button" class="studio-button quiet" @click="openBannerFilePicker()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
              </svg>
              {{ t('studio.upload.addBanner') }}
            </button>
            <input
              type="text"
              class="studio-banner-url-input"
              :placeholder="t('studio.upload.pasteUrl')"
              @keydown.enter.prevent="addBannerFromUrl($event.target)"
            />
          </div>
          <input ref="bannerFileInput" class="studio-file-input" type="file" accept="image/*" @change="handleBannerFile" />

          <div class="studio-banner-list">
            <div v-for="banner in bannerLibrary" :key="banner.id" class="studio-banner-item">
              <span class="studio-banner-thumb">
                <img :src="banner.image" :alt="banner.label" :style="{ objectPosition: banner.position }" />
              </span>
              <strong>{{ banner.label }}</strong>
              <div class="studio-banner-actions">
                <button type="button" class="studio-icon-button" :aria-label="t('studio.upload.replace')" :title="t('studio.upload.replace')" @click="openBannerFilePicker(banner.id)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="studio-icon-button studio-icon-button-danger"
                  :aria-label="t('studio.upload.removeBanner')"
                  :title="t('studio.upload.removeBanner')"
                  :disabled="bannerLibrary.length <= 1"
                  @click="deleteBanner(banner.id)"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                class="studio-banner-url-input"
                :placeholder="t('studio.upload.pasteUrl')"
                @keydown.enter.prevent="applyBannerUrl(banner.id, $event.target)"
              />
            </div>
          </div>
        </section>

        <div class="studio-variant-grid" role="radiogroup" :aria-label="`${moduleLabel(selectedModule)} variants`">
          <button
            v-for="variant in variants"
            :key="variant.id"
            type="button"
            role="radio"
            class="studio-variant-card"
            :class="{ active: draft[selectedModuleId] === variant.id }"
            :aria-checked="draft[selectedModuleId] === variant.id"
            @click="draft[selectedModuleId] = variant.id"
          >
            <span class="studio-variant-topline">
              <span>{{ variant.id.toUpperCase() }}</span>
              <svg v-if="draft[selectedModuleId] === variant.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <strong>{{ variantText(variant, 'name') }}</strong>
            <small>{{ variantText(variant, 'character') }}</small>
          </button>
        </div>

      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import Icon from '@/components/ui/Icon.vue';
import LocaleFlag from '@/components/ui/LocaleFlag.vue';
import MediaUploadField from '@/components/design/MediaUploadField.vue';
import { DEFAULT_DESIGN_MODULES } from '@/design/registry.js';
import { MEDIA_UPLOAD_SPECS } from '@/design/mediaSpecs.js';
import { useDesignStudio } from '@/composables/useDesignStudio.js';
import { useLocale } from '@/composables/useLocale.js';
import { useTweaks } from '@/composables/useTweaks.js';
import { useClickOutside } from '@/composables/useClickOutside.js';
import {
  DEFAULT_LOBBY_SECTION_ORDER,
  LOBBY_SECTION_LABELS,
  normalizeHeroBanners,
  normalizeHiddenSections,
  normalizeLobbyOrder,
  normalizeVisibleLocaleIds,
  normalizeVisibleSkinIds,
  readHeroBanners,
  readLobbyLayout,
  readVisibleSkinIds,
  readVisibleLocaleIds,
  writeHeroBanners,
  writeLobbyLayout,
  writeVisibleSkinIds,
  writeVisibleLocaleIds,
  writeStudioDraft,
} from '@/design/siteFactory.js';

const MAX_BANNER_UPLOAD_BYTES = 300 * 1024;

const emit = defineEmits(['navigate', 'studio-change']);
const {
  design,
  modules,
  variants,
  applyConfig,
  makeDesignAttributes,
  makeDesignStyle,
  normalizeDesignModules,
} = useDesignStudio();
const { locale, languages, setLocale, t } = useLocale();
const { t: tweaks, setTweak, skins } = useTweaks();

const draft = reactive(normalizeDesignModules(design.modules));
const initialLayout = readLobbyLayout();
const initialVisibleSkinIds = readVisibleSkinIds();
const appliedLayout = ref(initialLayout);
const appliedSkin = ref(tweaks.skin);
const appliedVisibleSkinIds = ref([...initialVisibleSkinIds]);
const draftSkin = ref(tweaks.skin);
const draftVisibleSkinIds = ref([...initialVisibleSkinIds]);
const layoutOrder = ref([...initialLayout.order]);
const hiddenSections = ref([...initialLayout.hidden]);
const layoutDragId = ref(null);
const layoutOverId = ref(null);
const selectedModuleId = ref(modules[0].id);
const notice = ref('');
const importInput = ref(null);
const localeIds = Object.keys(languages);
const visibleLocaleIds = ref(readVisibleLocaleIds());
const factoryGroupOpen = reactive({
  previewSkin: true,
  frontendLocales: false,
  frontendSkins: false,
  homeComposition: false,
});

const skinMenuOpen = ref(false);
const skinPickerRef = ref(null);
const skinTriggerRef = ref(null);
const skinOptionRefs = ref([]);
const activeSkinOption = computed(() => skins.find((option) => option.id === draftSkin.value));

const assets = reactive({
  game: `${import.meta.env.BASE_URL}assets/mock/game-04.webp`,
  promo: `${import.meta.env.BASE_URL}assets/mock/promo-4-v2.jpg`,
  avatar: '',
  logo: `${import.meta.env.BASE_URL}assets/logo.png`,
});
const initialBanners = readHeroBanners();
const bannerLibrary = ref(initialBanners);
const appliedBanners = ref([...initialBanners]);
const bannerFileInput = ref(null);
const pendingBannerId = ref(null);
const objectUrls = new Set();

const moduleGroups = computed(() => {
  const categories = [...new Set(modules.map((module) => module.category))];
  return categories.map((category) => ({
    category,
    label: categoryLabel(category),
    items: modules.filter((module) => module.category === category),
  }));
});

const selectedModule = computed(() => modules.find((module) => module.id === selectedModuleId.value));
const selectedVariant = computed(() => variantById(draft[selectedModuleId.value]));
const selectedMediaSpec = computed(() => MEDIA_UPLOAD_SPECS[selectedModuleId.value] || null);
const visibleLayoutCount = computed(() => layoutOrder.value.length - hiddenSections.value.length);
const previewSkinLabel = computed(() => skins.find((skin) => skin.id === draftSkin.value)?.label || draftSkin.value);
const dirty = computed(() =>
  JSON.stringify(draft) !== JSON.stringify(design.modules)
  || draftSkin.value !== appliedSkin.value
  || !sameVisibleSkinIds(draftVisibleSkinIds.value, appliedVisibleSkinIds.value)
  || JSON.stringify({ order: layoutOrder.value, hidden: hiddenSections.value }) !== JSON.stringify(appliedLayout.value)
  || JSON.stringify(bannerLibrary.value) !== JSON.stringify(appliedBanners.value)
);

watch(draftSkin, (skinId) => {
  const skin = skins.find((option) => option.id === skinId) || skins[0];
  if (!skin) return;
  document.documentElement.setAttribute('data-skin', skin.id);
  document.documentElement.setAttribute('data-theme', skin.theme);
}, { immediate: true });

// Broadcast the live draft to the preview iframe via localStorage so it can
// reflect every control change instantly, without needing "Apply".
let draftBroadcastTimer = null;
watch(
  () => ({
    modules: { ...draft },
    skin: draftSkin.value,
    visibleSkinIds: normalizeVisibleSkinIds(draftVisibleSkinIds.value),
    layout: {
      order: normalizeLobbyOrder(layoutOrder.value),
      hidden: normalizeHiddenSections(hiddenSections.value),
    },
    visibleLocaleIds: normalizeVisibleLocaleIds(visibleLocaleIds.value),
    banners: normalizeHeroBanners(bannerLibrary.value),
  }),
  (snapshot) => {
    if (draftBroadcastTimer) window.clearTimeout(draftBroadcastTimer);
    draftBroadcastTimer = window.setTimeout(() => {
      writeStudioDraft(snapshot);
      draftBroadcastTimer = null;
    }, 150);
  },
  { deep: true, immediate: true }
);

async function toggleSkinMenu() {
  skinMenuOpen.value = !skinMenuOpen.value;
  if (skinMenuOpen.value) {
    await nextTick();
    const activeIndex = skins.findIndex((option) => option.id === draftSkin.value);
    (skinOptionRefs.value[activeIndex] || skinOptionRefs.value[0])?.focus();
  }
}

function closeSkinMenu() {
  skinMenuOpen.value = false;
  skinTriggerRef.value?.focus();
}

function selectDraftSkin(id) {
  draftSkin.value = id;
  skinMenuOpen.value = false;
  skinTriggerRef.value?.focus();
}

function onSkinMenuKeydown(event) {
  const options = skinOptionRefs.value.filter(Boolean);
  if (!options.length) return;
  const currentIndex = options.indexOf(document.activeElement);

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    options[(currentIndex + 1 + options.length) % options.length]?.focus();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    options[(currentIndex - 1 + options.length) % options.length]?.focus();
  } else if (event.key === 'Home') {
    event.preventDefault();
    options[0]?.focus();
  } else if (event.key === 'End') {
    event.preventDefault();
    options[options.length - 1]?.focus();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeSkinMenu();
  }
}

useClickOutside(skinPickerRef, () => { skinMenuOpen.value = false; });

function changeStudioLocale(value) {
  setLocale(value);
  emit('studio-change');
}

function variantById(id) {
  return variants.find((variant) => variant.id === id) || variants[0];
}

function categoryLabel(category) {
  return t(['studio', 'categories', category], category);
}

function moduleLabel(module) {
  return t(['studio', 'modules', module?.id, 'label'], module?.label || '');
}

function moduleDescription(module) {
  return t(['studio', 'modules', module?.id, 'description'], module?.description || '');
}

function variantText(variant, field) {
  return t(['studio', 'variantCopy', variant?.id, field], variant?.[field] || '');
}

function layoutLabel(sectionId) {
  return t(['lobby', 'sections', sectionId], LOBBY_SECTION_LABELS[sectionId] || sectionId);
}

function sameVisibleSkinIds(a, b) {
  return JSON.stringify(normalizeVisibleSkinIds(a)) === JSON.stringify(normalizeVisibleSkinIds(b));
}

function isSkinVisible(skinId) {
  return draftVisibleSkinIds.value.includes(skinId);
}

function isOnlyVisibleSkin(skinId) {
  return isSkinVisible(skinId) && draftVisibleSkinIds.value.length <= 1;
}

function toggleFactoryGroup(key) {
  factoryGroupOpen[key] = !factoryGroupOpen[key];
}

function toggleVisibleSkin(skinId) {
  if (isOnlyVisibleSkin(skinId)) return;
  const next = isSkinVisible(skinId)
    ? draftVisibleSkinIds.value.filter((id) => id !== skinId)
    : [...draftVisibleSkinIds.value, skinId];
  draftVisibleSkinIds.value = normalizeVisibleSkinIds(next);
}

function isLocaleVisible(localeId) {
  return visibleLocaleIds.value.includes(localeId);
}

function isOnlyVisibleLocale(localeId) {
  return isLocaleVisible(localeId) && visibleLocaleIds.value.length <= 1;
}

function toggleVisibleLocale(localeId) {
  if (isOnlyVisibleLocale(localeId)) return;
  const next = isLocaleVisible(localeId)
    ? visibleLocaleIds.value.filter((id) => id !== localeId)
    : [...visibleLocaleIds.value, localeId];
  visibleLocaleIds.value = writeVisibleLocaleIds(next);
}

function moduleIndex(id) {
  return String(modules.findIndex((module) => module.id === id) + 1).padStart(2, '0');
}

function replaceDraft(value) {
  const normalized = normalizeDesignModules(value);
  modules.forEach((module) => { draft[module.id] = normalized[module.id]; });
}

function replacePreviewAsset(payload) {
  const spec = selectedMediaSpec.value;
  if (!spec) return;
  const { url } = payload;

  const previous = assets[spec.assetKey];
  if (previous?.startsWith('blob:')) {
    URL.revokeObjectURL(previous);
    objectUrls.delete(previous);
  }
  assets[spec.assetKey] = url;
  objectUrls.add(url);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function openBannerFilePicker(bannerId = null) {
  pendingBannerId.value = bannerId;
  bannerFileInput.value?.click();
}

async function handleBannerFile(event) {
  const [file] = event.target.files || [];
  event.target.value = '';
  if (!file) return;

  if (file.size > MAX_BANNER_UPLOAD_BYTES) {
    showNotice(t('studio.upload.tooLarge'));
    pendingBannerId.value = null;
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    if (pendingBannerId.value) {
      replaceBannerImage(pendingBannerId.value, dataUrl);
    } else {
      addBanner(dataUrl, file.name.replace(/\.[^.]+$/, ''));
    }
  } finally {
    pendingBannerId.value = null;
  }
}

function replaceBannerImage(bannerId, image) {
  bannerLibrary.value = bannerLibrary.value.map((banner) => (
    banner.id === bannerId ? { ...banner, image } : banner
  ));
}

function applyBannerUrl(bannerId, inputEl) {
  const value = inputEl?.value?.trim();
  if (!value) return;
  replaceBannerImage(bannerId, value);
  inputEl.value = '';
}

function addBanner(image, label) {
  bannerLibrary.value = [...bannerLibrary.value, {
    id: `banner-${Date.now()}`,
    label: label || t('studio.bannerSet'),
    image,
    position: 'center',
    mobilePosition: 'center',
  }];
}

function addBannerFromUrl(inputEl) {
  const value = inputEl?.value?.trim();
  if (!value) return;
  addBanner(value, '');
  inputEl.value = '';
}

function deleteBanner(bannerId) {
  if (bannerLibrary.value.length <= 1) return;
  bannerLibrary.value = bannerLibrary.value.filter((banner) => banner.id !== bannerId);
}

function showNotice(message) {
  notice.value = message;
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => { notice.value = ''; }, 2600);
}

function moveLayoutSection(from, to) {
  if (to < 0 || to >= layoutOrder.value.length || from === to) return;
  const next = [...layoutOrder.value];
  const [section] = next.splice(from, 1);
  next.splice(to, 0, section);
  layoutOrder.value = next;
}

function startLayoutDrag(sectionId) {
  layoutDragId.value = sectionId;
}

function dropLayoutSection(targetId) {
  const sourceIndex = layoutOrder.value.indexOf(layoutDragId.value);
  const targetIndex = layoutOrder.value.indexOf(targetId);
  if (sourceIndex >= 0 && targetIndex >= 0) moveLayoutSection(sourceIndex, targetIndex);
  finishLayoutDrag();
}

function finishLayoutDrag() {
  layoutDragId.value = null;
  layoutOverId.value = null;
}

function toggleLayoutSection(sectionId) {
  hiddenSections.value = hiddenSections.value.includes(sectionId)
    ? hiddenSections.value.filter((id) => id !== sectionId)
    : [...hiddenSections.value, sectionId];
}

function restoreLayoutDefaults() {
  layoutOrder.value = [...DEFAULT_LOBBY_SECTION_ORDER];
  hiddenSections.value = [];
}

function applyDraft() {
  applyConfig({ modules: draft });
  const savedVisibleSkinIds = writeVisibleSkinIds(draftVisibleSkinIds.value);
  const nextSkin = savedVisibleSkinIds.includes(draftSkin.value) ? draftSkin.value : savedVisibleSkinIds[0];
  setTweak('skin', nextSkin);
  const savedLayout = writeLobbyLayout({ order: layoutOrder.value, hidden: hiddenSections.value });
  const savedBanners = writeHeroBanners(bannerLibrary.value);
  draftSkin.value = nextSkin;
  appliedSkin.value = nextSkin;
  appliedVisibleSkinIds.value = [...savedVisibleSkinIds];
  appliedLayout.value = savedLayout;
  appliedBanners.value = savedBanners;
  showNotice(t('studio.noticeApplied'));
  emit('studio-change');
}

function resetDraft() {
  replaceDraft(design.modules);
  draftSkin.value = appliedSkin.value;
  draftVisibleSkinIds.value = [...appliedVisibleSkinIds.value];
  layoutOrder.value = [...appliedLayout.value.order];
  hiddenSections.value = [...appliedLayout.value.hidden];
  bannerLibrary.value = [...appliedBanners.value];
  showNotice(t('studio.noticeReset'));
}

function restoreDefaults() {
  replaceDraft(DEFAULT_DESIGN_MODULES);
  restoreLayoutDefaults();
  showNotice(t('studio.noticeFoundation'));
}

function exportConfig() {
  const payload = JSON.stringify({
    schema: 'cms-v3-site-factory',
    version: design.version,
    exportedAt: new Date().toISOString(),
    skin: draftSkin.value,
    visibleSkins: normalizeVisibleSkinIds(draftVisibleSkinIds.value),
    layout: {
      order: normalizeLobbyOrder(layoutOrder.value),
      hidden: normalizeHiddenSections(hiddenSections.value),
    },
    banners: normalizeHeroBanners(bannerLibrary.value),
    modules: normalizeDesignModules(draft),
  }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cms-v3-site-factory.json';
  link.click();
  URL.revokeObjectURL(url);
  showNotice(t('studio.noticeExported'));
}

async function importConfig(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    replaceDraft(payload.modules || payload);
    if (skins.some((skin) => skin.id === payload.skin)) draftSkin.value = payload.skin;
    if (payload.visibleSkins) draftVisibleSkinIds.value = normalizeVisibleSkinIds(payload.visibleSkins);
    if (payload.layout) {
      layoutOrder.value = normalizeLobbyOrder(payload.layout.order);
      hiddenSections.value = normalizeHiddenSections(payload.layout.hidden);
    }
    if (payload.banners) bannerLibrary.value = normalizeHeroBanners(payload.banners);
    showNotice(t('studio.noticeImported'));
  } catch {
    showNotice(t('studio.noticeImportFailed'));
  } finally {
    event.target.value = '';
  }
}

onBeforeUnmount(() => {
  if (draftBroadcastTimer) window.clearTimeout(draftBroadcastTimer);
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  const skin = skins.find((option) => option.id === appliedSkin.value) || skins[0];
  if (skin) {
    document.documentElement.setAttribute('data-skin', skin.id);
    document.documentElement.setAttribute('data-theme', skin.theme);
  }
});
</script>
