<template>
  <div class="studio-shell">
    <div class="studio-preview-topbar">
      <button
        type="button"
        class="studio-collapse-toggle"
        :aria-expanded="!controlsCollapsed"
        :aria-label="controlsCollapsed ? t('studio.showControls') : t('studio.hideControls')"
        @click="controlsCollapsed = !controlsCollapsed"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="studio-preview-topbar-title">{{ t('studio.livePreview') }}</span>
      <div class="studio-preview-topbar-actions">
        <div class="studio-device-control" :aria-label="t('studio.livePreview')">
          <button type="button" :class="{ active: deviceMode === 'desktop' }" @click="deviceMode = 'desktop'">{{ t('studio.previewDesktop') }}</button>
          <button type="button" :class="{ active: deviceMode === 'mobile' }" @click="deviceMode = 'mobile'">{{ t('studio.previewMobile390') }}</button>
        </div>
        <button type="button" class="studio-text-button" @click="manualRefresh">{{ t('studio.refreshPreview') }}</button>
      </div>
    </div>

    <div class="studio-shell-body">
      <aside class="studio-controls-col" :class="{ collapsed: controlsCollapsed }">
        <DesignStudio @navigate="openSite" @studio-change="scheduleReload" />
      </aside>

      <section class="studio-live-preview" :aria-label="t('studio.livePreview')">
        <div class="studio-live-preview-viewport" :class="{ mobile: deviceMode === 'mobile' }">
          <iframe
            :key="reloadToken"
            class="studio-live-preview-frame"
            :src="previewSrc"
            :title="t('studio.livePreview')"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';
import DesignStudio from '@/components/design/DesignStudio.vue';
import { useLocale } from '@/composables/useLocale.js';
import { STUDIO_PREVIEW_QUERY_PARAM } from '@/design/siteFactory.js';

const { t } = useLocale();

const deviceMode = ref('desktop');
const controlsCollapsed = ref(false);
const reloadToken = ref(Date.now());
// The query param stays constant so live preview (draft broadcast via
// localStorage) works without a reload; :key="reloadToken" below still forces
// a full iframe remount as a fallback when needed.
const previewSrc = `../?${STUDIO_PREVIEW_QUERY_PARAM}=1`;

let reloadTimer = null;

function scheduleReload() {
  if (reloadTimer) window.clearTimeout(reloadTimer);
  reloadTimer = window.setTimeout(() => {
    reloadToken.value = Date.now();
    reloadTimer = null;
  }, 500);
}

function manualRefresh() {
  if (reloadTimer) {
    window.clearTimeout(reloadTimer);
    reloadTimer = null;
  }
  reloadToken.value = Date.now();
}

function openSite() {
  window.location.assign(import.meta.env.BASE_URL);
}

onBeforeUnmount(() => {
  if (reloadTimer) window.clearTimeout(reloadTimer);
});
</script>
