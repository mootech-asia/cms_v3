<template>
  <section class="lobby-section" data-screen-label="Promotion">
    <div class="section-head">
      <h2 class="section-title">Promotions<span class="count">{{ offers.length }}</span></h2>
    </div>

    <div class="promo-grid">
      <article
        v-for="(o, i) in visibleOffers" :key="i"
        class="promo-card"
        style="--promo-hue: var(--accent)"
      >
        <span class="promo-card-tag">{{ o.tag }}</span>
        <div class="promo-card-art" aria-hidden="true"></div>
        <h3 class="promo-card-title">{{ o.title }}</h3>
        <p class="promo-card-sub">{{ o.sub }}</p>
        <button class="promo-card-cta">{{ o.cta }} →</button>
      </article>
    </div>

    <div v-if="enableLoadMore && canLoadMore" class="cv-foot">
      <button class="cv-view-all" @click="loadMore">Load More</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  enableLoadMore: { type: Boolean, default: false },
  pageSize:       { type: Number,  default: 2 },
});

const visibleCount = ref(props.pageSize);

const offers = [
  { tag: 'WELCOME',  title: '100% First Deposit',  sub: 'Match up to 10,000 USDT on your first top-up.',                       cta: 'View', hue: 200 },
  { tag: 'DAILY',    title: '15% Daily Reload',     sub: 'Every day, every deposit — instant cashback to balance.',             cta: 'View', hue: 280 },
  { tag: 'REFERRAL', title: 'Refer & Earn 25%',     sub: 'Lifetime commission from every friend you bring.',                   cta: 'View', hue: 340 },
  { tag: 'VIP',      title: 'Up to 20% Cashback',   sub: 'Weekly cashback scales with your VIP tier — no max cap.',            cta: 'View', hue: 50  },
];

const visibleOffers = computed(() =>
  props.enableLoadMore ? offers.slice(0, visibleCount.value) : offers
);
const canLoadMore = computed(() => visibleOffers.value.length < offers.length);

function loadMore() {
  visibleCount.value += props.pageSize;
}
</script>
