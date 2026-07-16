<template>
  <section class="lobby-section" :class="{ 'is-collapsed': collapsed }" data-screen-label="Tournaments">
    <div class="section-head">
      <div class="section-title-group">
        <h2 class="section-title">
          <span class="live-pip"></span>Live sport
        </h2>
        <button
          class="section-collapse"
          :class="{ active: collapsed }"
          :aria-label="collapsed ? 'Expand live sport' : 'Collapse live sport'"
          :aria-expanded="!collapsed"
          @click="collapsed = !collapsed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>
      <div class="section-actions">
        <a href="#" class="see-all">All tournaments →</a>
      </div>
    </div>

    <div v-show="!collapsed" class="tourn-grid">
      <div
        v-for="(t, i) in TOURNAMENTS" :key="i"
        class="tourn"
        style="--tourn-hue: var(--accent)"
      >
        <span v-if="t.tag" class="tourn-tag" :class="{ hot: t.tag === 'ENDS SOON' }">{{ t.tag }}</span>
        <div class="tourn-prize-label">Prize pool</div>
        <div class="tourn-prize">{{ t.prize }}</div>
        <h3 class="tourn-title">{{ t.title }}</h3>
        <div class="tourn-foot">
          <div style="display:flex;gap:18px">
            <div class="tourn-meta">
              <span>Ends in</span><span>{{ t.endsIn }}</span>
            </div>
            <div class="tourn-meta">
              <span>Players</span><span>{{ t.players.toLocaleString() }}</span>
            </div>
          </div>
          <button class="btn primary">Join</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { TOURNAMENTS } from '@/data/index.js';

const collapsed = ref(false);
</script>
