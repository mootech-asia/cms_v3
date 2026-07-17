<template>
  <section class="design-studio" :data-screen-label="t('studio.title')">
    <header class="studio-header">
      <div>
        <div class="studio-eyebrow">{{ t('studio.eyebrow') }}</div>
        <div class="studio-title-row">
          <h1>{{ t('studio.title') }}</h1>
          <span class="studio-schema">{{ t('studio.schema') }} {{ design.version }}</span>
          <span v-if="dirty" class="studio-unsaved">{{ t('studio.unsaved') }}</span>
        </div>
        <p>{{ t('studio.intro') }}</p>
      </div>
      <div class="studio-header-actions">
        <label class="studio-lang-control">
          <span>{{ t('studio.language') }}</span>
          <select class="studio-select" :value="locale" @change="setLocale($event.target.value)">
            <option v-for="(option, key) in languages" :key="key" :value="key">{{ option.label }}</option>
          </select>
        </label>
        <button class="studio-button quiet" type="button" @click="emit('navigate', 'Lobby')">{{ t('studio.viewSite') }}</button>
        <button class="studio-button quiet" type="button" @click="importInput?.click()">{{ t('studio.import') }}</button>
        <button class="studio-button quiet" type="button" @click="exportConfig">{{ t('studio.export') }}</button>
        <button class="studio-button primary" type="button" :disabled="!dirty" @click="applyDraft">
          {{ t('studio.apply') }}
        </button>
        <input ref="importInput" class="studio-file-input" type="file" accept="application/json,.json" @change="importConfig" />
      </div>
    </header>

    <div v-if="notice" class="studio-notice" role="status">{{ notice }}</div>

    <div class="studio-workspace">
      <aside class="studio-module-panel" :aria-label="t('studio.moduleLibrary')">
        <section class="studio-factory-section" aria-labelledby="studio-factory-title">
          <div class="studio-panel-head studio-factory-heading">
            <div>
              <span id="studio-factory-title">{{ t('studio.siteFactory') }}</span>
              <small>{{ t('studio.siteFactorySub') }}</small>
            </div>
          </div>

          <div class="studio-factory-group" :class="{ open: factoryGroupOpen.previewSkin }">
            <button
              type="button"
              class="studio-factory-group-head"
              :aria-expanded="factoryGroupOpen.previewSkin"
              aria-controls="studio-factory-panel-previewSkin"
              :aria-label="`${factoryGroupOpen.previewSkin ? t('common.collapse') : t('common.expand')} ${t('studio.previewSkin')}`"
              @click="toggleFactoryGroup('previewSkin')"
            >
              <span class="studio-factory-group-title">{{ t('studio.previewSkin') }}</span>
              <span class="studio-factory-group-badge">{{ previewSkinLabel }}</span>
              <svg class="studio-factory-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div v-show="factoryGroupOpen.previewSkin" id="studio-factory-panel-previewSkin" class="studio-factory-group-body">
              <label class="studio-factory-field">
                <span>{{ t('studio.previewSkin') }}</span>
                <select v-model="draftSkin" class="studio-select">
                  <option v-for="skin in skins" :key="skin.id" :value="skin.id">{{ skin.label }}</option>
                </select>
              </label>
            </div>
          </div>

          <div class="studio-factory-group" :class="{ open: factoryGroupOpen.frontendSkins }">
            <button
              type="button"
              class="studio-factory-group-head"
              :aria-expanded="factoryGroupOpen.frontendSkins"
              aria-controls="studio-factory-panel-frontendSkins"
              :aria-label="`${factoryGroupOpen.frontendSkins ? t('common.collapse') : t('common.expand')} ${t('studio.frontendSkins')}`"
              @click="toggleFactoryGroup('frontendSkins')"
            >
              <span class="studio-factory-group-title">{{ t('studio.frontendSkins') }}</span>
              <span class="studio-factory-group-badge">{{ t('studio.visibleSkinCount', '', { visible: draftVisibleSkinIds.length, total: skins.length }) }}</span>
              <svg class="studio-factory-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div v-show="factoryGroupOpen.frontendSkins" id="studio-factory-panel-frontendSkins" class="studio-factory-group-body">
              <div class="studio-front-skin-control">
                <small class="studio-factory-group-sub">{{ t('studio.frontendSkinsSub') }}</small>

                <div class="studio-skin-list" :aria-label="t('studio.frontendSkins')">
                  <label
                    v-for="skin in skins"
                    :key="skin.id"
                    class="studio-skin-item"
                    :class="{ active: isSkinVisible(skin.id), locked: isOnlyVisibleSkin(skin.id) }"
                  >
                    <input
                      class="studio-skin-checkbox"
                      type="checkbox"
                      :checked="isSkinVisible(skin.id)"
                      :disabled="isOnlyVisibleSkin(skin.id)"
                      :aria-label="`${isSkinVisible(skin.id) ? t('studio.hide') : t('studio.show')} ${skin.label}`"
                      @change="toggleVisibleSkin(skin.id)"
                    />
                    <span
                      class="studio-skin-swatch"
                      :style="{ '--skin-color': skin.swatch, '--skin-surface': skin.surface }"
                      aria-hidden="true"
                    ></span>
                    <span class="studio-skin-copy">
                      <strong>{{ skin.label }}</strong>
                      <small>{{ skin.theme }}</small>
                    </span>
                    <span class="studio-skin-state">{{ isSkinVisible(skin.id) ? t('studio.show') : t('studio.hide') }}</span>
                    <span class="studio-visibility-toggle" :aria-checked="isSkinVisible(skin.id)" aria-hidden="true"><span /></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="studio-factory-group" :class="{ open: factoryGroupOpen.homeComposition }">
            <button
              type="button"
              class="studio-factory-group-head"
              :aria-expanded="factoryGroupOpen.homeComposition"
              aria-controls="studio-factory-panel-homeComposition"
              :aria-label="`${factoryGroupOpen.homeComposition ? t('common.collapse') : t('common.expand')} ${t('studio.homeComposition')}`"
              @click="toggleFactoryGroup('homeComposition')"
            >
              <span class="studio-factory-group-title">{{ t('studio.homeComposition') }}</span>
              <span class="studio-factory-group-badge">{{ t('studio.visibleCount', '', { visible: visibleLayoutCount, total: layoutOrder.length }) }}</span>
              <svg class="studio-factory-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div v-show="factoryGroupOpen.homeComposition" id="studio-factory-panel-homeComposition" class="studio-factory-group-body">
              <div class="studio-factory-group-actions">
                <button class="studio-text-button" type="button" @click="restoreLayoutDefaults">{{ t('studio.resetLayout') }}</button>
              </div>

              <ul class="studio-layout-list" :aria-label="t('studio.homeComposition')">
                <li
                  v-for="(sectionId, index) in layoutOrder"
                  :key="sectionId"
                  class="studio-layout-item"
                  :class="{
                    'is-hidden': hiddenSections.includes(sectionId),
                    'is-drag-over': layoutOverId === sectionId && layoutDragId !== sectionId,
                  }"
                  draggable="true"
                  @dragstart="startLayoutDrag(sectionId)"
                  @dragover.prevent="layoutOverId = sectionId"
                  @drop.prevent="dropLayoutSection(sectionId)"
                  @dragend="finishLayoutDrag"
                >
                  <span class="studio-layout-grip" :title="t('studio.dragToReorder')" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <circle cx="4" cy="3" r="1" /><circle cx="10" cy="3" r="1" />
                      <circle cx="4" cy="7" r="1" /><circle cx="10" cy="7" r="1" />
                      <circle cx="4" cy="11" r="1" /><circle cx="10" cy="11" r="1" />
                    </svg>
                  </span>
                  <span class="studio-layout-name">{{ layoutLabel(sectionId) }}</span>
                  <button
                    class="studio-visibility-toggle"
                    type="button"
                    role="switch"
                    :aria-checked="!hiddenSections.includes(sectionId)"
                    :aria-label="`${hiddenSections.includes(sectionId) ? t('studio.show') : t('studio.hide')} ${layoutLabel(sectionId)}`"
                    @click="toggleLayoutSection(sectionId)"
                  ><span /></button>
                  <span class="studio-layout-move">
                    <button type="button" :disabled="index === 0" :aria-label="`${t('studio.moveUp')} ${layoutLabel(sectionId)}`" @click="moveLayoutSection(index, index - 1)">↑</button>
                    <button type="button" :disabled="index === layoutOrder.length - 1" :aria-label="`${t('studio.moveDown')} ${layoutLabel(sectionId)}`" @click="moveLayoutSection(index, index + 1)">↓</button>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div class="studio-factory-group" :class="{ open: factoryGroupOpen.frontendLocales }">
            <button
              type="button"
              class="studio-factory-group-head"
              :aria-expanded="factoryGroupOpen.frontendLocales"
              aria-controls="studio-factory-panel-frontendLocales"
              :aria-label="`${factoryGroupOpen.frontendLocales ? t('common.collapse') : t('common.expand')} ${t('studio.frontendLocales')}`"
              @click="toggleFactoryGroup('frontendLocales')"
            >
              <span class="studio-factory-group-title">{{ t('studio.frontendLocales') }}</span>
              <span class="studio-factory-group-badge">{{ t('studio.visibleLocaleCount', '', { visible: visibleLocaleIds.length, total: localeIds.length }) }}</span>
              <svg class="studio-factory-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div v-show="factoryGroupOpen.frontendLocales" id="studio-factory-panel-frontendLocales" class="studio-factory-group-body">
              <div class="studio-front-skin-control">
                <small class="studio-factory-group-sub">{{ t('studio.frontendLocalesSub') }}</small>

                <div class="studio-skin-list" :aria-label="t('studio.frontendLocales')">
                  <label
                    v-for="id in localeIds"
                    :key="id"
                    class="studio-skin-item"
                    :class="{ active: isLocaleVisible(id), locked: isOnlyVisibleLocale(id) }"
                  >
                    <input
                      class="studio-skin-checkbox"
                      type="checkbox"
                      :checked="isLocaleVisible(id)"
                      :disabled="isOnlyVisibleLocale(id)"
                      :aria-label="`${isLocaleVisible(id) ? t('studio.hide') : t('studio.show')} ${languages[id].label}`"
                      @change="toggleVisibleLocale(id)"
                    />
                    <span class="studio-skin-swatch studio-locale-flag" aria-hidden="true">
                      <svg v-if="id === 'zh'" width="18" height="12" viewBox="0 0 30 20">
                        <rect width="30" height="20" fill="#de2910" />
                        <polygon points="5.000,2.000 5.674,4.073 7.853,4.073 6.090,5.354 6.763,7.427 5.000,6.146 3.237,7.427 3.910,5.354 2.147,4.073 4.326,4.073" fill="#ffde00" />
                        <polygon points="9.143,2.514 9.620,1.966 9.246,1.343 9.914,1.628 10.391,1.080 10.328,1.803 10.996,2.088 10.288,2.251 10.224,2.975 9.851,2.352" fill="#ffde00" />
                        <polygon points="11.010,4.141 11.662,3.821 11.560,3.102 12.065,3.624 12.718,3.304 12.378,3.946 12.884,4.467 12.168,4.343 11.829,4.985 11.726,4.266" fill="#ffde00" />
                        <polygon points="11.038,6.725 11.765,6.699 11.964,6.001 12.213,6.683 12.939,6.657 12.367,7.105 12.616,7.787 12.014,7.382 11.442,7.830 11.641,7.131" fill="#ffde00" />
                        <polygon points="9.219,8.375 9.899,8.632 10.353,8.064 10.319,8.790 10.999,9.046 10.298,9.239 10.265,9.964 9.865,9.357 9.165,9.550 9.618,8.982" fill="#ffde00" />
                      </svg>
                      <svg v-else-if="id === 'en'" width="18" height="12" viewBox="0 0 60 40">
                        <rect width="60" height="40" fill="#012169" />
                        <path d="M0 0 60 40M60 0 0 40" stroke="#fff" stroke-width="6" />
                        <path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="10" />
                        <path d="M30 0v40M0 20h60" stroke="#C8102E" stroke-width="6" />
                      </svg>
                      <svg v-else-if="id === 'ko'" width="18" height="12" viewBox="0 0 60 40">
                        <rect width="60" height="40" fill="#fff" />
                        <circle cx="30" cy="20" r="8" fill="#cd2e3a" />
                        <path d="M22 20a8 8 0 0 1 16 0 4 4 0 0 1-8 0 4 4 0 0 0-8 0Z" fill="#0047a0" />
                        <g stroke="#000" stroke-width="1.4">
                          <path d="M11 11l4 6M13 9l4 6M15 7l4 6" />
                          <path d="M41 23l4 6M43 21l4 6M45 19l4 6" />
                          <path d="M45 11l-4 6M47 13l-4 6M49 15l-4 6" />
                          <path d="M11 29l4-6M13 31l4-6M15 33l4-6" />
                        </g>
                      </svg>
                      <svg v-else-if="id === 'th'" width="18" height="12" viewBox="0 0 30 20">
                        <rect width="30" height="20" fill="#fff" />
                        <rect width="30" height="4" fill="#a51931" />
                        <rect y="16" width="30" height="4" fill="#a51931" />
                        <rect y="4" width="30" height="3.33" fill="#f4f5f8" />
                        <rect y="12.67" width="30" height="3.33" fill="#f4f5f8" />
                        <rect y="7.33" width="30" height="5.34" fill="#2d2a4a" />
                      </svg>
                    </span>
                    <span class="studio-skin-copy">
                      <strong>{{ languages[id].label }}</strong>
                      <small>{{ id.toUpperCase() }}</small>
                    </span>
                    <span class="studio-skin-state">{{ isLocaleVisible(id) ? t('studio.show') : t('studio.hide') }}</span>
                    <span class="studio-visibility-toggle" :aria-checked="isLocaleVisible(id)" aria-hidden="true"><span /></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="studio-panel-head">
          <div>
            <span>{{ t('studio.moduleLibrary') }}</span>
            <small>{{ t('studio.moduleCount', '', { count: modules.length }) }}</small>
          </div>
          <button class="studio-text-button" type="button" @click="restoreDefaults">{{ t('studio.setFoundation') }}</button>
        </div>

        <div v-for="group in moduleGroups" :key="group.category" class="studio-module-group">
          <h2>{{ group.label }}</h2>
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
              <strong>{{ moduleLabel(module) }}</strong>
              <small>{{ variantText(variantById(draft[module.id]), 'name') }}</small>
            </span>
            <span class="studio-module-code">{{ draft[module.id].toUpperCase() }}</span>
          </button>
        </div>
      </aside>

      <main class="studio-editor">
        <div class="studio-editor-head">
          <div>
            <div class="studio-eyebrow">{{ t('studio.selectedModule') }}</div>
            <h2>{{ moduleLabel(selectedModule) }}</h2>
            <p>{{ moduleDescription(selectedModule) }}</p>
          </div>
          <div class="studio-device-control" :aria-label="t('studio.livePreview')">
            <button type="button" :class="{ active: previewMode === 'desktop' }" @click="previewMode = 'desktop'">{{ t('studio.desktop') }}</button>
            <button type="button" :class="{ active: previewMode === 'mobile' }" @click="previewMode = 'mobile'">{{ t('studio.mobile') }}</button>
          </div>
        </div>

        <MediaUploadField
          v-if="selectedMediaSpec"
          :key="selectedModuleId"
          :spec="selectedMediaSpec"
          @change="replacePreviewAsset"
        />

        <section v-if="selectedModuleId === 'banner'" class="studio-banner-library" :aria-label="t('studio.bannerSet')">
          <header>
            <div>
              <span>{{ t('studio.bannerSet') }}</span>
              <small>{{ t('studio.available', '', { count: bannerLibrary.length }) }}</small>
            </div>
            <small>{{ t('studio.selectArtwork') }}</small>
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

        <div class="studio-variant-grid" role="radiogroup" :aria-label="`${moduleLabel(selectedModule)} variants`">
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
            <strong>{{ variantText(variant, 'name') }}</strong>
            <small>{{ variantText(variant, 'character') }}</small>
          </button>
        </div>

        <section class="studio-preview-section">
          <div class="studio-preview-toolbar">
            <div>
              <span>{{ t('studio.livePreview') }}</span>
              <small>{{ variantText(selectedVariant, 'description') }}</small>
            </div>
            <button class="studio-text-button" type="button" :disabled="!dirty" @click="resetDraft">{{ t('studio.resetDraft') }}</button>
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
                  <span>{{ categoryLabel(selectedModule.category) }}</span>
                  <span>{{ t('studio.skinAware') }}</span>
                </div>

                <article v-if="selectedModuleId === 'game-card'" class="gcard studio-sample-game">
                  <div class="gcard-art">
                    <img :src="assets.game" :alt="t('studio.sample.gameTitle')" />
                    <span class="gcard-tag hot">{{ t('studio.sample.hot') }}</span>
                  </div>
                  <div class="gcard-meta">
                    <strong class="gcard-title">{{ t('studio.sample.gameTitle') }}</strong>
                    <span class="gcard-provider">{{ t('studio.sample.provider') }}</span>
                  </div>
                </article>

                <article v-else-if="selectedModuleId === 'promotion-card'" class="promo-card studio-sample-promo">
                  <span class="promo-card-tag">{{ t('studio.sample.vip') }}</span>
                  <div class="promo-card-art" :style="{ backgroundImage: `url(${assets.promo})` }" />
                  <h3 class="promo-card-title">{{ t('studio.sample.promoTitle') }}</h3>
                  <p class="promo-card-sub">{{ t('studio.sample.promoSub') }}</p>
                  <button class="promo-card-cta" type="button">{{ t('studio.sample.viewOffer') }}</button>
                </article>

                <article v-else-if="selectedModuleId === 'banner'" class="hero studio-sample-banner">
                  <img :src="assets.hero" :alt="t('studio.sample.bannerTitle')" :style="{ objectPosition: assets.heroPosition }" />
                  <div>
                    <span>{{ t('studio.sample.bannerEyebrow') }}</span>
                    <h3>{{ t('studio.sample.bannerTitle') }}</h3>
                    <p>{{ t('studio.sample.bannerSub') }}</p>
                  </div>
                </article>

                <div v-else-if="selectedModuleId === 'ticker'" class="promo-ribbon studio-sample-ticker">
                  <div class="promo-ribbon-viewport">
                    <div class="studio-ticker-track">
                      <span v-for="item in t('studio.sample.ticker')" :key="item"><b>✦</b> {{ item }}</span>
                    </div>
                  </div>
                  <time class="promo-ribbon-time">18:42:09</time>
                </div>

                <div v-else-if="selectedModuleId === 'button'" class="studio-sample-stack">
                  <button class="ui-button ui-button--primary" type="button">{{ t('studio.sample.confirmTransaction') }}</button>
                  <button class="ui-button" type="button">{{ t('studio.sample.reviewDetails') }}</button>
                  <button class="ui-button ui-button--quiet" type="button">{{ t('studio.sample.back') }}</button>
                </div>

                <div v-else-if="selectedModuleId === 'tabs'" class="studio-sample-tabs">
                  <div class="cat-tabs">
                    <button class="cat-tab active" type="button">{{ t('studio.sample.lobby') }}</button>
                    <button class="cat-tab" type="button">{{ t('studio.sample.hotGames') }}</button>
                    <button class="cat-tab" type="button">{{ t('studio.sample.live') }}</button>
                  </div>
                  <div class="studio-filter-row">
                    <button class="ui-tab active" type="button">{{ t('common.all') }}</button>
                    <button class="ui-tab" type="button">{{ t('common.favorites') }}</button>
                    <button class="ui-tab" type="button">Saba</button>
                  </div>
                </div>

                <form v-else-if="selectedModuleId === 'form'" class="studio-sample-form" @submit.prevent>
                  <label>
                    <span>{{ t('studio.sample.walletAddress') }}</span>
                    <input class="ap-input" value="0x2F5A...8C41" />
                  </label>
                  <label>
                    <span>{{ t('studio.sample.network') }}</span>
                    <select class="ap-input"><option>USDT-TRC20</option></select>
                  </label>
                  <label>
                    <span>{{ t('studio.sample.amount') }}</span>
                    <input class="ap-input" value="10,000" />
                  </label>
                </form>

                <div v-else-if="selectedModuleId === 'tag'" class="studio-sample-tags">
                  <span class="gcard-tag hot">{{ t('studio.sample.hot') }}</span>
                  <span class="gcard-tag">{{ t('studio.sample.vip') }}</span>
                  <span class="rec-pill ok">{{ t('studio.sample.approved') }}</span>
                  <span class="rec-pill pend">{{ t('studio.sample.pending') }}</span>
                  <span class="count">24</span>
                </div>

                <div v-else-if="selectedModuleId === 'table'" class="rec-table-scroll studio-sample-table">
                  <table class="rec-table">
                    <thead><tr><th>{{ t('studio.sample.asset') }}</th><th>{{ t('studio.sample.network') }}</th><th>{{ t('studio.sample.amount') }}</th><th>{{ t('studio.sample.status') }}</th></tr></thead>
                    <tbody>
                      <tr><td>USDT</td><td>TRC20</td><td>25,000</td><td><span class="rec-pill ok">{{ t('studio.sample.approved') }}</span></td></tr>
                      <tr><td>USDC</td><td>ERC20</td><td>12,400</td><td><span class="rec-pill pend">{{ t('studio.sample.pending') }}</span></td></tr>
                      <tr><td>BTC</td><td>Bitcoin</td><td>0.1842</td><td><span class="rec-pill ok">{{ t('studio.sample.approved') }}</span></td></tr>
                    </tbody>
                  </table>
                </div>

                <article v-else-if="selectedModuleId === 'profile'" class="ap-hero studio-sample-profile">
                  <div class="studio-profile-avatar" :class="{ 'has-image': assets.avatar }">
                    <img v-if="assets.avatar" :src="assets.avatar" :alt="t('studio.sample.memberIdentity')" />
                    <span v-else>PL</span>
                  </div>
                  <div class="studio-profile-copy">
                    <span>{{ t('studio.sample.memberIdentity') }}</span>
                    <h3>{{ t('studio.sample.player') }}</h3>
                    <p>{{ t('studio.sample.rewards') }}</p>
                  </div>
                  <div class="studio-profile-balance">
                    <span>{{ t('studio.sample.balance') }}</span>
                    <strong>1,286.96</strong>
                  </div>
                  <div class="studio-profile-progress"><span /></div>
                </article>

                <article v-else-if="selectedModuleId === 'panel'" class="ap-panel studio-sample-panel">
                  <div class="studio-panel-title"><span>{{ t('studio.sample.settlementOverview') }}</span><small>{{ t('studio.sample.updatedNow') }}</small></div>
                  <div class="studio-metric-grid">
                    <div><span>{{ t('studio.sample.volume') }}</span><strong>842K</strong></div>
                    <div><span>{{ t('studio.sample.players') }}</span><strong>18,420</strong></div>
                    <div><span>{{ t('studio.sample.success') }}</span><strong>99.8%</strong></div>
                  </div>
                </article>

                <nav v-else-if="selectedModuleId === 'navigation'" class="studio-sample-nav">
                  <div class="studio-sample-brand"><img :src="assets.logo" alt="Brand logo preview" /></div>
                  <a class="sb-item active" href="#" @click.prevent><span class="studio-nav-icon">⌂</span><span class="sb-label">{{ t('studio.sample.lobby') }}</span></a>
                  <a class="sb-item" href="#" @click.prevent><span class="studio-nav-icon">◇</span><span class="sb-label">{{ t('studio.sample.markets') }}</span></a>
                  <a class="sb-item" href="#" @click.prevent><span class="studio-nav-icon">□</span><span class="sb-label">{{ t('studio.sample.portfolio') }}</span></a>
                </nav>

                <div v-else-if="selectedModuleId === 'section-title'" class="studio-sample-headings">
                  <div class="studio-title-sample">
                    <span>{{ t('studio.sample.account') }}</span>
                    <h1 class="ap-h1">{{ t('studio.sample.portfolioOverview') }}</h1>
                    <p>{{ t('studio.sample.portfolioSub') }}</p>
                  </div>
                  <div class="section-head">
                    <h2 class="section-title">{{ t('studio.sample.recentlyPlayed') }} <span class="count">8</span></h2>
                  </div>
                  <div class="ap-section-h">{{ t('studio.sample.transactionSettings') }}</div>
                </div>

                <article v-else-if="selectedModuleId === 'modal'" class="modal studio-sample-modal">
                  <div class="modal-head"><strong>{{ t('studio.sample.confirmWithdrawal') }}</strong><button type="button" :aria-label="t('studio.sample.close')">×</button></div>
                  <div class="modal-body">
                    <p>{{ t('studio.sample.modalBody') }}</p>
                    <div class="studio-modal-detail"><span>USDT-TRC20</span><strong>10,000</strong></div>
                  </div>
                  <div class="modal-foot"><button class="ui-button" type="button">{{ t('studio.sample.cancel') }}</button><button class="ui-button ui-button--primary" type="button">{{ t('studio.sample.confirm') }}</button></div>
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
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import MediaUploadField from '@/components/design/MediaUploadField.vue';
import { HERO_SLIDES } from '@/data/index.js';
import { DEFAULT_DESIGN_MODULES } from '@/design/registry.js';
import { MEDIA_UPLOAD_SPECS } from '@/design/mediaSpecs.js';
import { useDesignStudio } from '@/composables/useDesignStudio.js';
import { useLocale } from '@/composables/useLocale.js';
import { useTweaks } from '@/composables/useTweaks.js';
import {
  DEFAULT_LOBBY_SECTION_ORDER,
  LOBBY_SECTION_LABELS,
  normalizeHiddenSections,
  normalizeLobbyOrder,
  normalizeVisibleSkinIds,
  readLobbyLayout,
  readVisibleSkinIds,
  readVisibleLocaleIds,
  writeLobbyLayout,
  writeVisibleSkinIds,
  writeVisibleLocaleIds,
} from '@/design/siteFactory.js';

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
const { locale, languages, setLocale, t } = useLocale();
const { t: tweaks, setTweak, skins } = useTweaks();

const draft = reactive(normalizeDesignModules(design.modules));
const initialLayout = readLobbyLayout();
const initialVisibleSkinIds = readVisibleSkinIds();
const appliedLayout = ref(initialLayout);
const appliedSkin = ref(tweaks.skin);
const appliedVisibleSkinIds = ref([...initialVisibleSkinIds]);
const draftSkin = ref(tweaks.skin);
const draftVisibleSkinIds = ref([...initialVisibleSkinIds]);
const layoutOrder = ref([...initialLayout.order]);
const hiddenSections = ref([...initialLayout.hidden]);
const layoutDragId = ref(null);
const layoutOverId = ref(null);
const selectedModuleId = ref(modules[0].id);
const previewMode = ref('desktop');
const notice = ref('');
const importInput = ref(null);
const localeIds = Object.keys(languages);
const visibleLocaleIds = ref(readVisibleLocaleIds());
const factoryGroupOpen = reactive({
  previewSkin: true,
  frontendSkins: false,
  homeComposition: false,
  frontendLocales: false,
});

const assets = reactive({
  game: `${import.meta.env.BASE_URL}assets/mock/game-04.webp`,
  promo: `${import.meta.env.BASE_URL}assets/mock/promo-4-v2.jpg`,
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
    label: categoryLabel(category),
    items: modules.filter((module) => module.category === category),
  }));
});

const selectedModule = computed(() => modules.find((module) => module.id === selectedModuleId.value));
const selectedVariant = computed(() => variantById(draft[selectedModuleId.value]));
const selectedMediaSpec = computed(() => MEDIA_UPLOAD_SPECS[selectedModuleId.value] || null);
const previewAttributes = computed(() => makeDesignAttributes(draft));
const previewStyle = computed(() => makeDesignStyle(draft));
const visibleLayoutCount = computed(() => layoutOrder.value.length - hiddenSections.value.length);
const previewSkinLabel = computed(() => skins.find((skin) => skin.id === draftSkin.value)?.label || draftSkin.value);
const dirty = computed(() =>
  JSON.stringify(draft) !== JSON.stringify(design.modules)
  || draftSkin.value !== appliedSkin.value
  || !sameVisibleSkinIds(draftVisibleSkinIds.value, appliedVisibleSkinIds.value)
  || JSON.stringify({ order: layoutOrder.value, hidden: hiddenSections.value }) !== JSON.stringify(appliedLayout.value)
);

watch(draftSkin, (skinId) => {
  const skin = skins.find((option) => option.id === skinId) || skins[0];
  if (!skin) return;
  document.documentElement.setAttribute('data-skin', skin.id);
  document.documentElement.setAttribute('data-theme', skin.theme);
}, { immediate: true });

function variantById(id) {
  return variants.find((variant) => variant.id === id) || variants[0];
}

function categoryLabel(category) {
  return t(['studio', 'categories', category], category);
}

function moduleLabel(module) {
  return t(['studio', 'modules', module?.id, 'label'], module?.label || '');
}

function moduleDescription(module) {
  return t(['studio', 'modules', module?.id, 'description'], module?.description || '');
}

function variantText(variant, field) {
  return t(['studio', 'variantCopy', variant?.id, field], variant?.[field] || '');
}

function layoutLabel(sectionId) {
  return t(['lobby', 'sections', sectionId], LOBBY_SECTION_LABELS[sectionId] || sectionId);
}

function sameVisibleSkinIds(a, b) {
  return JSON.stringify(normalizeVisibleSkinIds(a)) === JSON.stringify(normalizeVisibleSkinIds(b));
}

function isSkinVisible(skinId) {
  return draftVisibleSkinIds.value.includes(skinId);
}

function isOnlyVisibleSkin(skinId) {
  return isSkinVisible(skinId) && draftVisibleSkinIds.value.length <= 1;
}

function toggleFactoryGroup(key) {
  factoryGroupOpen[key] = !factoryGroupOpen[key];
}

function toggleVisibleSkin(skinId) {
  if (isOnlyVisibleSkin(skinId)) return;
  const next = isSkinVisible(skinId)
    ? draftVisibleSkinIds.value.filter((id) => id !== skinId)
    : [...draftVisibleSkinIds.value, skinId];
  draftVisibleSkinIds.value = normalizeVisibleSkinIds(next);
}

function isLocaleVisible(localeId) {
  return visibleLocaleIds.value.includes(localeId);
}

function isOnlyVisibleLocale(localeId) {
  return isLocaleVisible(localeId) && visibleLocaleIds.value.length <= 1;
}

function toggleVisibleLocale(localeId) {
  if (isOnlyVisibleLocale(localeId)) return;
  const next = isLocaleVisible(localeId)
    ? visibleLocaleIds.value.filter((id) => id !== localeId)
    : [...visibleLocaleIds.value, localeId];
  visibleLocaleIds.value = writeVisibleLocaleIds(next);
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

function moveLayoutSection(from, to) {
  if (to < 0 || to >= layoutOrder.value.length || from === to) return;
  const next = [...layoutOrder.value];
  const [section] = next.splice(from, 1);
  next.splice(to, 0, section);
  layoutOrder.value = next;
}

function startLayoutDrag(sectionId) {
  layoutDragId.value = sectionId;
}

function dropLayoutSection(targetId) {
  const sourceIndex = layoutOrder.value.indexOf(layoutDragId.value);
  const targetIndex = layoutOrder.value.indexOf(targetId);
  if (sourceIndex >= 0 && targetIndex >= 0) moveLayoutSection(sourceIndex, targetIndex);
  finishLayoutDrag();
}

function finishLayoutDrag() {
  layoutDragId.value = null;
  layoutOverId.value = null;
}

function toggleLayoutSection(sectionId) {
  hiddenSections.value = hiddenSections.value.includes(sectionId)
    ? hiddenSections.value.filter((id) => id !== sectionId)
    : [...hiddenSections.value, sectionId];
}

function restoreLayoutDefaults() {
  layoutOrder.value = [...DEFAULT_LOBBY_SECTION_ORDER];
  hiddenSections.value = [];
}

function applyDraft() {
  applyConfig({ modules: draft });
  const savedVisibleSkinIds = writeVisibleSkinIds(draftVisibleSkinIds.value);
  const nextSkin = savedVisibleSkinIds.includes(draftSkin.value) ? draftSkin.value : savedVisibleSkinIds[0];
  setTweak('skin', nextSkin);
  const savedLayout = writeLobbyLayout({ order: layoutOrder.value, hidden: hiddenSections.value });
  draftSkin.value = nextSkin;
  appliedSkin.value = nextSkin;
  appliedVisibleSkinIds.value = [...savedVisibleSkinIds];
  appliedLayout.value = savedLayout;
  showNotice(t('studio.noticeApplied'));
}

function resetDraft() {
  replaceDraft(design.modules);
  draftSkin.value = appliedSkin.value;
  draftVisibleSkinIds.value = [...appliedVisibleSkinIds.value];
  layoutOrder.value = [...appliedLayout.value.order];
  hiddenSections.value = [...appliedLayout.value.hidden];
  showNotice(t('studio.noticeReset'));
}

function restoreDefaults() {
  replaceDraft(DEFAULT_DESIGN_MODULES);
  restoreLayoutDefaults();
  showNotice(t('studio.noticeFoundation'));
}

function exportConfig() {
  const payload = JSON.stringify({
    schema: 'cms-v3-site-factory',
    version: design.version,
    exportedAt: new Date().toISOString(),
    skin: draftSkin.value,
    visibleSkins: normalizeVisibleSkinIds(draftVisibleSkinIds.value),
    layout: {
      order: normalizeLobbyOrder(layoutOrder.value),
      hidden: normalizeHiddenSections(hiddenSections.value),
    },
    modules: normalizeDesignModules(draft),
  }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cms-v3-site-factory.json';
  link.click();
  URL.revokeObjectURL(url);
  showNotice(t('studio.noticeExported'));
}

async function importConfig(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    replaceDraft(payload.modules || payload);
    if (skins.some((skin) => skin.id === payload.skin)) draftSkin.value = payload.skin;
    if (payload.visibleSkins) draftVisibleSkinIds.value = normalizeVisibleSkinIds(payload.visibleSkins);
    if (payload.layout) {
      layoutOrder.value = normalizeLobbyOrder(payload.layout.order);
      hiddenSections.value = normalizeHiddenSections(payload.layout.hidden);
    }
    showNotice(t('studio.noticeImported'));
  } catch {
    showNotice(t('studio.noticeImportFailed'));
  } finally {
    event.target.value = '';
  }
}

onBeforeUnmount(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  const skin = skins.find((option) => option.id === appliedSkin.value) || skins[0];
  if (skin) {
    document.documentElement.setAttribute('data-skin', skin.id);
    document.documentElement.setAttribute('data-theme', skin.theme);
  }
});
</script>
