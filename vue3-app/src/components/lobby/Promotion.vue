<template>
  <section class="lobby-section" :class="{ 'is-collapsed': collapsed }" data-screen-label="Promotion">
    <div class="section-head">
      <div class="section-title-group">
        <h2 class="section-title">{{ t(['lobby', 'sections', 'promotions'], 'Promotions') }}<span class="count">{{ offers.length }}</span></h2>
        <button
          class="section-collapse"
          :class="{ active: collapsed }"
          :aria-label="collapsed ? `${t('common.expand')} ${t(['lobby', 'sections', 'promotions'], 'Promotions')}` : `${t('common.collapse')} ${t(['lobby', 'sections', 'promotions'], 'Promotions')}`"
          :aria-expanded="!collapsed"
          @click="collapsed = !collapsed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>
    </div>

    <div v-show="!collapsed" class="promo-grid">
      <button
        v-for="o in visibleOffers" :key="o.id"
        class="promo-card promo-card-link"
        style="--promo-hue: var(--accent)"
        type="button"
        :aria-label="`${o.cta} ${o.title}`"
        @click="emit('open', o)"
      >
        <span class="promo-card-tag">{{ o.tag }}</span>
        <div
          class="promo-card-art"
          :style="{ backgroundImage: `url(${o.image})` }"
          aria-hidden="true"
        ></div>
        <h3 class="promo-card-title">{{ o.title }}</h3>
        <p class="promo-card-sub">{{ o.sub }}</p>
        <span class="promo-card-cta">{{ o.cta }} →</span>
      </button>
    </div>

    <div v-if="enableLoadMore && canLoadMore" v-show="!collapsed" class="cv-foot">
      <button class="cv-view-all" @click="loadMore">{{ t('common.loadMore') }}</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PROMOTION_OFFERS } from '@/data/promotions.js';
import { PROMOTION_COPY } from '@/data/i18n.js';
import { useLocale } from '@/composables/useLocale.js';

const props = defineProps({
  enableLoadMore: { type: Boolean, default: false },
  pageSize:       { type: Number,  default: 2 },
});
const emit = defineEmits(['open']);
const { t, text } = useLocale();

const collapsed = ref(false);
const visibleCount = ref(props.pageSize);

const offers = computed(() => {
  const copy = text(PROMOTION_COPY);
  return PROMOTION_OFFERS.map((offer) => ({ ...offer, ...(copy[offer.id] || {}) }));
});

const visibleOffers = computed(() =>
  props.enableLoadMore ? offers.value.slice(0, visibleCount.value) : offers.value
);
const canLoadMore = computed(() => visibleOffers.value.length < offers.value.length);

function loadMore() {
  visibleCount.value += props.pageSize;
}
</script>
