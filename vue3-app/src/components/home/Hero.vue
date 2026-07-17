<template>
  <div class="hero" @touchstart="onTouchStart" @touchend="onTouchEnd">

    <div
      v-for="(s, i) in localizedSlides" :key="s.id || i"
      class="hero-slide"
      :class="{ active: i === idx }"
    >
      <div
        class="hero-bg"
        :style="{
          '--hero-image': `url(${s.image})`,
          '--hero-position': s.position || 'center',
          '--hero-size': s.size || 'cover',
          '--hero-mobile-position': s.mobilePosition || s.position || 'center',
          '--hero-mobile-size': s.mobileSize || s.size || 'cover',
          '--hero-overlay': s.overlay,
        }"
      />
      <div class="hero-content">
        <div>
          <h1 class="hero-title">{{ s.title }}</h1>
          <p  class="hero-sub">{{ s.sub }}</p>
        </div>
      </div>
    </div>

    <!-- 指示點 -->
    <div class="hero-dots">
      <button
        v-for="(_, i) in localizedSlides" :key="i"
        class="hero-dot"
        :class="{ active: i === idx }"
        :aria-label="`Slide ${i + 1}`"
        @click="goTo(i)"
      />
    </div>

    <!-- 左右箭頭 -->
    <div class="hero-controls">
      <button class="icon-btn" aria-label="Previous" @click="prev">
        <Icon name="arrL" />
      </button>
      <button class="icon-btn" aria-label="Next" @click="next">
        <Icon name="arrR" />
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import Icon          from '@/components/ui/Icon.vue';
import { HERO_SLIDES } from '@/data/index.js';
import { HERO_COPY } from '@/data/i18n.js';
import { useLocale } from '@/composables/useLocale.js';

const props = defineProps({
  banners: { type: Array, default: () => HERO_SLIDES },
});

const idx         = ref(0);
const touchStartX = ref(null);
const autoTimer   = ref(null);
const { text } = useLocale();

const slides = computed(() => (props.banners.length ? props.banners : HERO_SLIDES));
const len    = computed(() => slides.value.length);

const localizedSlides = computed(() => {
  const copy = text(HERO_COPY);
  return slides.value.map((slide, index) => ({ ...slide, ...(copy[index] || {}) }));
});

watch(len, (nextLen) => { if (idx.value >= nextLen) idx.value = 0; });

function resetAuto() {
  clearInterval(autoTimer.value);
  autoTimer.value = setInterval(() => { idx.value = (idx.value + 1) % len.value; }, 6500);
}

function next()      { idx.value = (idx.value + 1)             % len.value; resetAuto(); }
function prev()      { idx.value = (idx.value - 1 + len.value) % len.value; resetAuto(); }
function goTo(i)     { idx.value = i;                                       resetAuto(); }

function onTouchStart(e) { touchStartX.value = e.touches[0].clientX; }
function onTouchEnd(e)   {
  if (touchStartX.value === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX.value;
  if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  touchStartX.value = null;
}

onMounted(()   => resetAuto());
onUnmounted(() => clearInterval(autoTimer.value));
</script>
