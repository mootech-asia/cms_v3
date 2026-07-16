<template>
  <article class="gcard" style="cursor: default">
    <div class="gcard-art">
      <span v-if="game.tag"
        class="gcard-tag"
        :class="{ hot: game.tag === 'Hot', new: game.tag === 'New' }"
      >{{ game.tag }}</span>

      <button v-if="showFav"
        class="gcard-fav"
        :class="{ on: isFav }"
        :aria-label="isFav ? 'Remove favorite' : 'Add favorite'"
        @click.stop="emit('fav', game.id)"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 6l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.3 1-1a5.5 5.5 0 0 0 0-7.8Z"
            :fill="isFav ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <span class="ph-label">{{ game.title.toUpperCase() }} ART</span>

      <div v-if="game.category === 'live'" class="gcard-players">
        <span class="live-dot"></span>{{ game.players?.toLocaleString() }} playing
      </div>
    </div>

    <div class="gcard-meta">
      <div class="gcard-title">{{ game.title }}</div>
      <div class="gcard-provider">{{ game.provider }}</div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  game:    { type: Object,  required: true },
  isFav:   { type: Boolean, default: false },
  showFav: { type: Boolean, default: false },
});
const emit = defineEmits(['fav']);
</script>
