<template>
  <div class="promo-ribbon">
    <div class="promo-ribbon-viewport">
      <div class="track">
        <span v-for="(item, i) in doubled" :key="i" class="item">
          <span class="dot">✦</span>{{ item }}
        </span>
      </div>
    </div>
    <time class="promo-ribbon-time" :datetime="isoTime" :aria-label="t('common.localTime')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </svg>
      {{ displayTime }}
    </time>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { PROMO_RIBBON_COPY } from '@/data/i18n.js';
import { useLocale } from '@/composables/useLocale.js';

const { t, text } = useLocale();
const items = computed(() => text(PROMO_RIBBON_COPY));
const doubled = computed(() => [...items.value, ...items.value]);

const now = ref(new Date());
const displayTime = computed(() => [
  now.value.getHours(),
  now.value.getMinutes(),
  now.value.getSeconds(),
].map((value) => String(value).padStart(2, '0')).join(':'));
const isoTime = computed(() => now.value.toISOString());
let timer;

onMounted(() => {
  timer = window.setInterval(() => { now.value = new Date(); }, 1000);
});
onUnmounted(() => window.clearInterval(timer));
</script>
