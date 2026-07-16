<template>
  <section class="lobby-section" :class="{ 'is-collapsed': collapsed }" :data-screen-label="title">
    <div class="section-head">
      <div class="section-title-group">
        <h2 class="section-title">
          <Icon v-if="icon" :name="icon" :size="18" />
          {{ title }}
          <span class="count">{{ count ?? games.length }}</span>
        </h2>
        <button
          class="section-collapse"
          :class="{ active: collapsed }"
          :aria-label="collapsed ? `Expand ${title}` : `Collapse ${title}`"
          :aria-expanded="!collapsed"
          @click="collapsed = !collapsed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>
      <div v-if="showActions" class="section-actions">
        <a
          v-if="seeAllTab"
          href="#"
          class="see-all"
          @click.prevent="emit('see-all', seeAllTab)"
        >See all →</a>
        <button class="arrow" :disabled="!canL" aria-label="Scroll left" @click="scroll(-1)">
          <Icon name="arrL" />
        </button>
        <button class="arrow" :disabled="!canR" aria-label="Scroll right" @click="scroll(1)">
          <Icon name="arrR" />
        </button>
      </div>
    </div>

    <div v-show="!collapsed" class="rail-wrap">
      <div class="rail" ref="railEl" @scroll="update">
        <GameCard
          v-for="g in games" :key="g.id"
          :game="g"
          @open="emit('open', $event)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Icon     from '@/components/ui/Icon.vue';
import GameCard from '@/components/game/GameCard.vue';

const props = defineProps({
  title:       { type: String,  required: true },
  games:       { type: Array,   default: () => [] },
  count:       { type: Number,  default: null },
  icon:        { type: String,  default: null },
  showActions: { type: Boolean, default: true },
  seeAllTab:   { type: String,  default: null },
});
const emit = defineEmits(['open', 'see-all']);

const collapsed = ref(false);
const railEl = ref(null);
const canL   = ref(false);
const canR   = ref(true);

function update() {
  const el = railEl.value;
  if (!el) return;
  canL.value = el.scrollLeft > 4;
  canR.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
}

function scroll(dir) {
  const el = railEl.value;
  if (!el) return;
  el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
}

onMounted(() => {
  update();
  window.addEventListener('resize', update);
});
onUnmounted(() => window.removeEventListener('resize', update));
</script>
