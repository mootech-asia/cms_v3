<template>
  <section class="lobby-section ap-page promotion-detail" data-screen-label="Promotion Details">
    <button class="ap-back" type="button" @click="emit('back')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m14 6-6 6 6 6" />
      </svg>
      {{ t(['lobby', 'promotionDetail', 'back']) }}
    </button>

    <header class="pd-header">
      <span class="promo-card-tag">{{ promo.tag }}</span>
      <h1 class="ap-h1">{{ promo.title }}</h1>
      <p>{{ promo.sub }}</p>
    </header>

    <div class="pd-artwork">
      <img :src="promo.image" :alt="t(['lobby', 'promotionDetail', 'artworkAlt'], '', { title: promo.title })" />
    </div>

    <dl class="pd-facts">
      <div>
        <dt>{{ t(['lobby', 'promotionDetail', 'reward']) }}</dt>
        <dd>{{ promo.reward }}</dd>
      </div>
      <div>
        <dt>{{ t(['lobby', 'promotionDetail', 'eligibility']) }}</dt>
        <dd>{{ promo.eligibility }}</dd>
      </div>
      <div>
        <dt>{{ t(['lobby', 'promotionDetail', 'availability']) }}</dt>
        <dd>{{ promo.validity }}</dd>
      </div>
    </dl>

    <div class="pd-layout">
      <main class="pd-content">
        <section>
          <h2 class="ap-section-h"><span class="ap-mark"></span>{{ t(['lobby', 'promotionDetail', 'offerDetails']) }}</h2>
          <p>{{ promo.description }}</p>
          <ul class="pd-list">
            <li v-for="item in promo.highlights" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h2 class="ap-section-h"><span class="ap-mark"></span>{{ t(['lobby', 'promotionDetail', 'howToClaim']) }}</h2>
          <ol class="pd-steps">
            <li v-for="(step, index) in promo.steps" :key="step">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <p>{{ step }}</p>
            </li>
          </ol>
        </section>

        <section>
          <h2 class="ap-section-h"><span class="ap-mark"></span>{{ t(['lobby', 'promotionDetail', 'termsConditions']) }}</h2>
          <ul class="pd-list muted">
            <li v-for="term in promo.terms" :key="term">{{ term }}</li>
          </ul>
        </section>
      </main>

      <aside class="pd-action" aria-label="Promotion action">
        <span>{{ promo.tag }}</span>
        <strong>{{ promo.reward }}</strong>
        <p>{{ t(['lobby', 'promotionDetail', 'actionHint']) }}</p>
        <button class="ui-button ui-button--primary" type="button" @click="emit('navigate', promo.actionTarget)">
          {{ promo.actionLabel }}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { PROMOTION_OFFERS } from '@/data/promotions.js';
import { PROMOTION_COPY } from '@/data/i18n.js';
import { useLocale } from '@/composables/useLocale.js';

const props = defineProps({
  promotion: { type: Object, required: true },
});

const emit = defineEmits(['back', 'navigate']);
const { locale, t } = useLocale();

const promo = computed(() => {
  const base = PROMOTION_OFFERS.find((offer) => offer.id === props.promotion.id) || props.promotion;
  const copy = PROMOTION_COPY[locale.value] || PROMOTION_COPY.zh;
  return { ...base, ...(copy[base.id] || {}) };
});
</script>
