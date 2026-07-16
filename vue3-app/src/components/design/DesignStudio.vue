<template>
  <section class="design-studio" data-screen-label="Design Studio">
    <header class="studio-header">
      <div>
        <div class="studio-eyebrow">CMS v3 / Modular UI</div>
        <div class="studio-title-row">
          <h1>Design Studio</h1>
          <span class="studio-schema">Schema {{ design.version }}</span>
          <span v-if="dirty" class="studio-unsaved">Unsaved changes</span>
        </div>
        <p>Configure visual modules without changing page structure, content, or Skin color tokens.</p>
      </div>
      <div class="studio-header-actions">
        <button class="studio-button quiet" type="button" @click="emit('navigate', 'Lobby')">View site</button>
        <button class="studio-button quiet" type="button" @click="importInput?.click()">Import</button>
        <button class="studio-button quiet" type="button" @click="exportConfig">Export</button>
        <button class="studio-button primary" type="button" :disabled="!dirty" @click="applyDraft">
          Apply to site
        </button>
        <input ref="importInput" class="studio-file-input" type="file" accept="application/json,.json" @change="importConfig" />
      </div>
    </header>

    <div v-if="notice" class="studio-notice" role="status">{{ notice }}</div>

    <div class="studio-workspace">
      <aside class="studio-module-panel" aria-label="Design modules">
        <div class="studio-panel-head">
          <div>
            <span>Module library</span>
            <small>{{ modules.length }} modules</small>
          </div>
          <button class="studio-text-button" type="button" @click="restoreDefaults">Set all to Foundation</button>
        </div>

        <div v-for="group in moduleGroups" :key="group.category" class="studio-module-group">
          <h2>{{ group.category }}</h2>
          <button
            v-for="module in group.items"
            :key="module.id"
            type="button"
            class="studio-module-button"
            :class="{ active: selectedModuleId === module.id }"
            @click="selectedModuleId = module.id"
          >
            <span class="studio-module-index">{{ moduleIndex(module.id) }}</span>
            <span class="studio-module-copy">
              <strong>{{ module.label }}</strong>
              <small>{{ variantById(draft[module.id]).name }}</small>
            </span>
            <span class="studio-module-code">{{ draft[module.id].toUpperCase() }}</span>
          </button>
        </div>
      </aside>

      <main class="studio-editor">
        <div class="studio-editor-head">
          <div>
            <div class="studio-eyebrow">Selected module</div>
            <h2>{{ selectedModule.label }}</h2>
            <p>{{ selectedModule.description }}</p>
          </div>
          <div class="studio-device-control" aria-label="Preview viewport">
            <button type="button" :class="{ active: previewMode === 'desktop' }" @click="previewMode = 'desktop'">Desktop</button>
            <button type="button" :class="{ active: previewMode === 'mobile' }" @click="previewMode = 'mobile'">Mobile</button>
          </div>
        </div>

        <MediaUploadField
          v-if="selectedMediaSpec"
          :key="selectedModuleId"
          :spec="selectedMediaSpec"
          @change="replacePreviewAsset"
        />

        <section v-if="selectedModuleId === 'banner'" class="studio-banner-library" aria-label="Banner set">
          <header>
            <div>
              <span>Banner set</span>
              <small>{{ bannerLibrary.length }} available</small>
            </div>
            <small>Select artwork to preview</small>
          </header>
          <div class="studio-banner-list">
            <button
              v-for="banner in bannerLibrary"
              :key="banner.id"
              type="button"
              class="studio-banner-item"
              :class="{ active: assets.hero === banner.image }"
              @click="selectBanner(banner)"
            >
              <span class="studio-banner-thumb">
                <img :src="banner.image" :alt="banner.label" :style="{ objectPosition: banner.position }" />
              </span>
              <strong>{{ banner.label }}</strong>
            </button>
          </div>
        </section>

        <div class="studio-variant-grid" role="radiogroup" :aria-label="`${selectedModule.label} variants`">
          <button
            v-for="variant in variants"
            :key="variant.id"
            type="button"
            role="radio"
            class="studio-variant-card"
            :class="{ active: draft[selectedModuleId] === variant.id }"
            :aria-checked="draft[selectedModuleId] === variant.id"
            @click="draft[selectedModuleId] = variant.id"
          >
            <span class="studio-variant-topline">
              <span>{{ variant.id.toUpperCase() }}</span>
              <svg v-if="draft[selectedModuleId] === variant.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <strong>{{ variant.name }}</strong>
            <small>{{ variant.character }}</small>
          </button>
        </div>

        <section class="studio-preview-section">
          <div class="studio-preview-toolbar">
            <div>
              <span>Live preview</span>
              <small>{{ selectedVariant.description }}</small>
            </div>
            <button class="studio-text-button" type="button" :disabled="!dirty" @click="resetDraft">Reset draft</button>
          </div>

          <div class="studio-preview-stage">
            <div
              class="studio-preview-frame"
              :class="{ mobile: previewMode === 'mobile' }"
            >
              <div
                class="studio-preview-canvas"
                data-design-preview
                v-bind="previewAttributes"
                :style="previewStyle"
              >
                <div class="studio-preview-context">
                  <span>{{ selectedModule.category }}</span>
                  <span>Skin-aware semantic tokens</span>
                </div>

                <article v-if="selectedModuleId === 'game-card'" class="gcard studio-sample-game">
                  <div class="gcard-art">
                    <img :src="assets.game" alt="Neon Vault game cover" />
                    <span class="gcard-tag hot">Hot</span>
                  </div>
                  <div class="gcard-meta">
                    <strong class="gcard-title">Neon Vault</strong>
                    <span class="gcard-provider">Saba</span>
                  </div>
                </article>

                <article v-else-if="selectedModuleId === 'promotion-card'" class="promo-card studio-sample-promo">
                  <span class="promo-card-tag">VIP</span>
                  <div class="promo-card-art" :style="{ backgroundImage: `url(${assets.promo})` }" />
                  <h3 class="promo-card-title">Private Vault Rewards</h3>
                  <p class="promo-card-sub">Priority settlement and weekly member rewards.</p>
                  <button class="promo-card-cta" type="button">View offer</button>
                </article>

                <article v-else-if="selectedModuleId === 'banner'" class="hero studio-sample-banner">
                  <img :src="assets.hero" alt="Premium vault campaign" :style="{ objectPosition: assets.heroPosition }" />
                  <div>
                    <span>PRIVATE ACCESS</span>
                    <h3>$250,000 Vault</h3>
                    <p>Qualify through verified games and settle rewards instantly.</p>
                  </div>
                </article>

                <div v-else-if="selectedModuleId === 'ticker'" class="promo-ribbon studio-sample-ticker">
                  <div class="promo-ribbon-viewport">
                    <div class="studio-ticker-track">
                      <span><b>✦</b> Instant Crypto Payouts</span>
                      <span><b>✦</b> Provably Fair</span>
                      <span><b>✦</b> 24/7 Settlement</span>
                    </div>
                  </div>
                  <time class="promo-ribbon-time">18:42:09</time>
                </div>

                <div v-else-if="selectedModuleId === 'button'" class="studio-sample-stack">
                  <button class="ui-button ui-button--primary" type="button">Confirm transaction</button>
                  <button class="ui-button" type="button">Review details</button>
                  <button class="ui-button ui-button--quiet" type="button">Back</button>
                </div>

                <div v-else-if="selectedModuleId === 'tabs'" class="studio-sample-tabs">
                  <div class="cat-tabs">
                    <button class="cat-tab active" type="button">Lobby</button>
                    <button class="cat-tab" type="button">Hot Games</button>
                    <button class="cat-tab" type="button">Live</button>
                  </div>
                  <div class="studio-filter-row">
                    <button class="ui-tab active" type="button">All</button>
                    <button class="ui-tab" type="button">Favorites</button>
                    <button class="ui-tab" type="button">Saba</button>
                  </div>
                </div>

                <form v-else-if="selectedModuleId === 'form'" class="studio-sample-form" @submit.prevent>
                  <label>
                    <span>Wallet address</span>
                    <input class="ap-input" value="0x2F5A...8C41" />
                  </label>
                  <label>
                    <span>Network</span>
                    <select class="ap-input"><option>USDT-TRC20</option></select>
                  </label>
                  <label>
                    <span>Amount</span>
                    <input class="ap-input" value="10,000" />
                  </label>
                </form>

                <div v-else-if="selectedModuleId === 'tag'" class="studio-sample-tags">
                  <span class="gcard-tag hot">Hot</span>
                  <span class="gcard-tag">VIP</span>
                  <span class="rec-pill ok">Approved</span>
                  <span class="rec-pill pend">Pending</span>
                  <span class="count">24</span>
                </div>

                <div v-else-if="selectedModuleId === 'table'" class="rec-table-scroll studio-sample-table">
                  <table class="rec-table">
                    <thead><tr><th>Asset</th><th>Network</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>USDT</td><td>TRC20</td><td>25,000</td><td><span class="rec-pill ok">Approved</span></td></tr>
                      <tr><td>USDC</td><td>ERC20</td><td>12,400</td><td><span class="rec-pill pend">Pending</span></td></tr>
                      <tr><td>BTC</td><td>Bitcoin</td><td>0.1842</td><td><span class="rec-pill ok">Approved</span></td></tr>
                    </tbody>
                  </table>
                </div>

                <article v-else-if="selectedModuleId === 'profile'" class="ap-hero studio-sample-profile">
                  <div class="studio-profile-avatar" :class="{ 'has-image': assets.avatar }">
                    <img v-if="assets.avatar" :src="assets.avatar" alt="Profile avatar preview" />
                    <span v-else>PL</span>
                  </div>
                  <div class="studio-profile-copy">
                    <span>MEMBER IDENTITY</span>
                    <h3>player</h3>
                    <p>Rewards · Day 27, 03:26 UTC</p>
                  </div>
                  <div class="studio-profile-balance">
                    <span>Available balance</span>
                    <strong>1,286.96</strong>
                  </div>
                  <div class="studio-profile-progress"><span /></div>
                </article>

                <article v-else-if="selectedModuleId === 'panel'" class="ap-panel studio-sample-panel">
                  <div class="studio-panel-title"><span>Settlement overview</span><small>Updated now</small></div>
                  <div class="studio-metric-grid">
                    <div><span>Volume</span><strong>842K</strong></div>
                    <div><span>Players</span><strong>18,420</strong></div>
                    <div><span>Success</span><strong>99.8%</strong></div>
                  </div>
                </article>

                <nav v-else-if="selectedModuleId === 'navigation'" class="studio-sample-nav">
                  <div class="studio-sample-brand"><img :src="assets.logo" alt="Brand logo preview" /></div>
                  <a class="sb-item active" href="#" @click.prevent><span class="studio-nav-icon">⌂</span><span class="sb-label">Lobby</span></a>
                  <a class="sb-item" href="#" @click.prevent><span class="studio-nav-icon">◇</span><span class="sb-label">Markets</span></a>
                  <a class="sb-item" href="#" @click.prevent><span class="studio-nav-icon">□</span><span class="sb-label">Portfolio</span></a>
                </nav>

                <div v-else-if="selectedModuleId === 'section-title'" class="studio-sample-headings">
                  <div class="studio-title-sample">
                    <span>ACCOUNT</span>
                    <h1 class="ap-h1">Portfolio Overview</h1>
                    <p>Review balances, settlement activity, and account access.</p>
                  </div>
                  <div class="section-head">
                    <h2 class="section-title">Recently played <span class="count">8</span></h2>
                  </div>
                  <div class="ap-section-h">Transaction settings</div>
                </div>

                <article v-else-if="selectedModuleId === 'modal'" class="modal studio-sample-modal">
                  <div class="modal-head"><strong>Confirm withdrawal</strong><button type="button" aria-label="Close">×</button></div>
                  <div class="modal-body">
                    <p>Review the destination and network before confirming this transaction.</p>
                    <div class="studio-modal-detail"><span>USDT-TRC20</span><strong>10,000</strong></div>
                  </div>
                  <div class="modal-foot"><button class="ui-button" type="button">Cancel</button><button class="ui-button ui-button--primary" type="button">Confirm</button></div>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import MediaUploadField from '@/components/design/MediaUploadField.vue';
import { HERO_SLIDES } from '@/data/index.js';
import { DEFAULT_DESIGN_MODULES } from '@/design/registry.js';
import { MEDIA_UPLOAD_SPECS } from '@/design/mediaSpecs.js';
import { useDesignStudio } from '@/composables/useDesignStudio.js';

const emit = defineEmits(['navigate']);
const {
  design,
  modules,
  variants,
  applyConfig,
  makeDesignAttributes,
  makeDesignStyle,
  normalizeDesignModules,
} = useDesignStudio();

const draft = reactive(normalizeDesignModules(design.modules));
const selectedModuleId = ref(modules[0].id);
const previewMode = ref('desktop');
const notice = ref('');
const importInput = ref(null);

const assets = reactive({
  game: `${import.meta.env.BASE_URL}assets/mock/game-04.webp`,
  promo: `${import.meta.env.BASE_URL}assets/mock/promo-4.webp`,
  hero: `${import.meta.env.BASE_URL}assets/mock/hero-1.webp`,
  heroPosition: HERO_SLIDES[0].position || 'center',
  heroMobilePosition: HERO_SLIDES[0].mobilePosition || HERO_SLIDES[0].position || 'center',
  avatar: '',
  logo: `${import.meta.env.BASE_URL}assets/logo.png`,
});
const bannerLibrary = ref(HERO_SLIDES.map((slide, index) => ({
  id: `default-${index + 1}`,
  label: slide.title.replace('\n', ' '),
  image: slide.image,
  position: slide.position || 'center',
  mobilePosition: slide.mobilePosition || slide.position || 'center',
})));
const objectUrls = new Set();

const moduleGroups = computed(() => {
  const categories = [...new Set(modules.map((module) => module.category))];
  return categories.map((category) => ({
    category,
    items: modules.filter((module) => module.category === category),
  }));
});

const selectedModule = computed(() => modules.find((module) => module.id === selectedModuleId.value));
const selectedVariant = computed(() => variantById(draft[selectedModuleId.value]));
const selectedMediaSpec = computed(() => MEDIA_UPLOAD_SPECS[selectedModuleId.value] || null);
const previewAttributes = computed(() => makeDesignAttributes(draft));
const previewStyle = computed(() => makeDesignStyle(draft));
const dirty = computed(() => JSON.stringify(draft) !== JSON.stringify(design.modules));

function variantById(id) {
  return variants.find((variant) => variant.id === id) || variants[0];
}

function moduleIndex(id) {
  return String(modules.findIndex((module) => module.id === id) + 1).padStart(2, '0');
}

function replaceDraft(value) {
  const normalized = normalizeDesignModules(value);
  modules.forEach((module) => { draft[module.id] = normalized[module.id]; });
}

function replacePreviewAsset(payload) {
  const spec = selectedMediaSpec.value;
  if (!spec) return;
  const { file, url } = payload;

  if (spec.assetKey === 'hero') {
    const banner = {
      id: `upload-${Date.now()}`,
      label: file.name.replace(/\.[^.]+$/, ''),
      image: url,
      position: 'center',
      mobilePosition: 'center',
    };
    bannerLibrary.value.push(banner);
    objectUrls.add(url);
    selectBanner(banner);
    return;
  }

  const previous = assets[spec.assetKey];
  if (previous?.startsWith('blob:')) {
    URL.revokeObjectURL(previous);
    objectUrls.delete(previous);
  }
  assets[spec.assetKey] = url;
  objectUrls.add(url);
}

function selectBanner(banner) {
  assets.hero = banner.image;
  assets.heroPosition = banner.position;
  assets.heroMobilePosition = banner.mobilePosition;
}

function showNotice(message) {
  notice.value = message;
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => { notice.value = ''; }, 2600);
}

function applyDraft() {
  applyConfig({ modules: draft });
  showNotice('Design modules applied to the site.');
}

function resetDraft() {
  replaceDraft(design.modules);
  showNotice('Draft reset to the applied configuration.');
}

function restoreDefaults() {
  replaceDraft(DEFAULT_DESIGN_MODULES);
  showNotice('All modules set to Foundation. Apply when ready.');
}

function exportConfig() {
  const payload = JSON.stringify({
    schema: 'cms-v3-design-modules',
    version: design.version,
    exportedAt: new Date().toISOString(),
    modules: normalizeDesignModules(draft),
  }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cms-v3-design-modules.json';
  link.click();
  URL.revokeObjectURL(url);
  showNotice('Design configuration exported.');
}

async function importConfig(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    replaceDraft(payload.modules || payload);
    showNotice('Configuration imported as a draft.');
  } catch {
    showNotice('Import failed. Select a valid CMS v3 design JSON file.');
  } finally {
    event.target.value = '';
  }
}

onBeforeUnmount(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
});
</script>
