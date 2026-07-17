<template>
  <section class="lobby-section" :class="{ 'is-collapsed': collapsed }" data-screen-label="Tournaments">
    <div class="section-head">
      <div class="section-title-group">
        <h2 class="section-title">
          <span class="live-pip"></span>{{ t(['lobby', 'sections', 'live-sport'], 'Live sport') }}
        </h2>
        <button
          class="section-collapse"
          :class="{ active: collapsed }"
          :aria-label="collapsed ? `${t('common.expand')} ${t(['lobby', 'sections', 'live-sport'], 'Live sport')}` : `${t('common.collapse')} ${t(['lobby', 'sections', 'live-sport'], 'Live sport')}`"
          :aria-expanded="!collapsed"
          @click="collapsed = !collapsed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>
      <div class="section-actions">
        <a href="#" class="see-all">{{ t('lobby.allTournaments') }} →</a>
      </div>
    </div>

    <div v-show="!collapsed" class="tourn-grid">
      <div
        v-for="(item, i) in localizedTournaments" :key="i"
        class="tourn"
        :class="{ 'tourn-hero': i === 0 }"
        style="--tourn-hue: var(--accent)"
      >
        <div
          v-if="i === 0"
          class="tourn-hero-bg"
          :style="{ backgroundImage: `url(${TOURNAMENT_HERO_IMAGE})` }"
          aria-hidden="true"
        ></div>
        <span v-if="item.tag" class="tourn-tag" :class="{ hot: i === 1 }">{{ item.tag }}</span>
        <div class="tourn-prize-label">{{ t('lobby.prizePool') }}</div>
        <div class="tourn-prize">{{ item.prize }}</div>
        <h3 class="tourn-title">{{ item.title }}</h3>
        <div class="tourn-foot">
          <div style="display:flex;gap:18px">
            <div class="tourn-meta">
              <span>{{ t('lobby.endsIn') }}</span><span>{{ item.endsIn }}</span>
            </div>
            <div class="tourn-meta">
              <span>{{ t('lobby.players') }}</span><span>{{ item.players.toLocaleString() }}</span>
            </div>
          </div>
          <button class="btn primary">{{ t('lobby.join') }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { TOURNAMENTS, TOURNAMENT_HERO_IMAGE } from '@/data/index.js';
import { TOURNAMENT_COPY } from '@/data/i18n.js';
import { useLocale } from '@/composables/useLocale.js';

const collapsed = ref(false);
const { t, text } = useLocale();
const localizedTournaments = computed(() => {
  const copy = text(TOURNAMENT_COPY);
  return TOURNAMENTS.map((item, index) => ({ ...item, ...(copy[index] || {}) }));
});
</script>
