<template>
  <section class="lobby-section" :data-screen-label="title">
    <div class="section-head">
      <h2 class="section-title">
        <Icon v-if="icon" :name="icon" :size="18" />
        {{ title }}
        <span class="count">{{ filtered.length }}</span>
      </h2>
    </div>

    <div
      v-if="showFilterTabs"
      class="cv-tabs"
      style="display:flex;flex-wrap:nowrap;overflow-x:auto;white-space:nowrap;scrollbar-width:none"
    >
      <button
        v-for="tb in tabs" :key="tb"
        class="cv-tab"
        style="flex:0 0 auto"
        :class="{ active: filter === tb }"
        @click="setFilter(tb)"
      >
        <svg v-if="tb === 'Favorites'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20s-7-4.6-9.3-9C1.2 8 2.6 4.5 6 4.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.4 0 4.8 3.5 3.3 6.5C19 15.4 12 20 12 20Z"/>
        </svg>
        {{ tb }}
        <span v-if="tb === 'Favorites' && favs.size > 0" class="cv-tab-count">{{ favs.size }}</span>
      </button>
    </div>

    <div v-if="shown.length === 0" class="cv-empty">
      {{ emptyText }}
    </div>
    <div v-else class="grid">
      <GameCard
        v-for="g in shown" :key="g.id"
        :game="g"
        :is-fav="favs.has(g.id)"
        :show-fav="true"
        @open="emit('open', $event)"
        @fav="toggle"
      />
    </div>

    <div v-if="enableLoadMore && canLoadMore" class="cv-foot">
      <button class="cv-view-all" @click="loadMore">
        Load More
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useFavorites } from '@/composables/useFavorites.js';
import { PROVIDERS } from '@/data/index.js';
import Icon     from '@/components/ui/Icon.vue';
import GameCard from '@/components/game/GameCard.vue';

const props = defineProps({
  title:            { type: String, required: true },
  icon:             { type: String, default: null },
  games:            { type: Array,  default: () => [] },
  enableLoadMore:   { type: Boolean, default: false },
  pageSize:         { type: Number,  default: 10 },
  showFilterTabs:   { type: Boolean, default: true },
  showProviderTabs: { type: Boolean, default: true },
});
const emit = defineEmits(['open']);

const { favs, toggle } = useFavorites();

const filter       = ref('All');
const visibleCount = ref(props.pageSize);
const tabs         = computed(() => props.showProviderTabs ? ['All', 'Favorites', ...PROVIDERS] : ['All', 'Favorites']);

const filtered = computed(() => {
  if (filter.value === 'Favorites') return props.games.filter(g => favs.value.has(g.id));
  if (props.showProviderTabs && filter.value !== 'All') return props.games.filter(g => g.provider === filter.value);
  return props.games;
});

const shown = computed(() =>
  props.enableLoadMore ? filtered.value.slice(0, visibleCount.value) : filtered.value
);

const canLoadMore = computed(() => shown.value.length < filtered.value.length);

const emptyText = computed(() => {
  if (filter.value === 'Favorites') return 'No favorites yet - tap the heart on any game to save it here.';
  if (props.showProviderTabs && filter.value !== 'All') return `No games from ${filter.value} yet.`;
  return 'No games to show.';
});

function setFilter(tab) {
  filter.value = tab;
  visibleCount.value = props.pageSize;
}

function loadMore() {
  visibleCount.value += props.pageSize;
}

watch(
  () => [props.title, props.games, props.showFilterTabs, props.showProviderTabs],
  () => {
    filter.value = 'All';
    visibleCount.value = props.pageSize;
  }
);
</script>
