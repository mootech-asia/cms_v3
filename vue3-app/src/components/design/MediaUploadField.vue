<template>
  <section class="studio-media-upload" :aria-label="`${spec.label} upload`">
    <div class="studio-media-upload-head">
      <div>
        <span class="studio-media-label">{{ spec.label }}</span>
        <strong class="studio-media-size">Recommended {{ recommendedSize }}</strong>
      </div>
      <button class="studio-button studio-media-button" type="button" @click="input?.click()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
        </svg>
        {{ spec.actionLabel || 'Upload image' }}
      </button>
      <input ref="input" class="studio-file-input" type="file" accept="image/webp,image/jpeg,image/png,image/avif" @change="handleFile" />
    </div>

    <div class="studio-media-spec-grid">
      <span><small>Aspect ratio</small><strong>{{ spec.ratio }}</strong></span>
      <span><small>File formats</small><strong>{{ spec.formats }}</strong></span>
      <span><small>Maximum size</small><strong>{{ spec.maxSize }}</strong></span>
      <span v-if="actualSize" :class="{ warning: belowRecommended }">
        <small>Uploaded image</small><strong>{{ actualSize }}</strong>
      </span>
    </div>

    <p class="studio-media-note">{{ spec.note }}</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { formatRecommendedSize } from '@/design/mediaSpecs.js';

const props = defineProps({
  spec: { type: Object, required: true },
});

const emit = defineEmits(['change']);
const input = ref(null);
const dimensions = ref(null);
const recommendedSize = computed(() => formatRecommendedSize(props.spec));
const actualSize = computed(() => dimensions.value ? `${dimensions.value.width} × ${dimensions.value.height} px` : '');
const belowRecommended = computed(() => dimensions.value
  ? dimensions.value.width < props.spec.width || dimensions.value.height < props.spec.height
  : false);

async function handleFile(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
    dimensions.value = { width: image.naturalWidth, height: image.naturalHeight };
    emit('change', { file, url, ...dimensions.value });
  } catch {
    URL.revokeObjectURL(url);
    dimensions.value = null;
  } finally {
    event.target.value = '';
  }
}
</script>
