<template>
  <AppLayout
    :sidebar-collapsed="sidebarCollapsed"
    :mobile-sidebar-open="mobileSidebarOpen"
    @close-sidebar="mobileSidebarOpen = false"
  >
    <!-- 側邊欄 -->
    <template #sidebar>
      <Sidebar
        v-model:collapsed="sidebarCollapsed"
        v-model:activeCat="activeCat"
        v-model:activeTab="catTab"
        :user="user"
        @sign-in="showSignIn = true"
        @close-menu="mobileSidebarOpen = false"
      />
    </template>

    <!-- 頂部列 -->
    <template #header>
      <TopBar
        :user="user"
        :balance="balance"
        @sign-in="showSignIn = true"
        @logout="user = null"
        @home="goHome"
        @navigate="(cat) => activeCat = cat"
      />
    </template>

    <!-- Account pages -->
    <PromotionDetail v-if="activeCat === 'Promotion Detail' && selectedPromotion"
      :promotion="selectedPromotion"
      @back="closePromotionDetail"
      @navigate="activeCat = $event"
    />
    <AccountOverview v-else-if="activeCat === 'Account Overview'"
      :user="user" :balance="balance" :nickname="nickname"
      @navigate="activeCat = $event"
    />
    <EditNickname v-else-if="activeCat === 'Edit Nickname'"
      :nickname="nickname"
      @save="nickname = $event"
      @navigate="activeCat = $event"
    />
    <DepositPage v-else-if="activeCat === 'DepositForm'"
      @navigate="activeCat = $event"
    />
    <WithdrawalPage v-else-if="activeCat === 'WithdrawalForm'"
      :user="user"
      @navigate="activeCat = $event"
    />
    <PersonalInfo v-else-if="activeCat === 'Personal Info'"
      :user="user"
      @navigate="activeCat = $event"
    />
    <SecurityCenter v-else-if="activeCat === 'Security Center'"
      @navigate="activeCat = $event"
      @logout="user = null; activeCat = 'Lobby'"
    />
    <BankingDetails v-else-if="activeCat === 'Banking Details'"
      @navigate="activeCat = $event"
    />
    <ChangeLoginPassword v-else-if="activeCat === 'Change Login Password'"
      @navigate="activeCat = $event"
    />
    <CustomerServicePage v-else-if="activeCat === 'Customer Service'"
      @navigate="activeCat = $event"
    />
    <RecordTable v-else-if="['Betting Record','Deposit Record','Withdrawal Record','Profit And Loss','Account Record'].includes(activeCat)"
      :title="activeCat"
      @navigate="activeCat = $event"
    />
    <SupportPage v-else-if="activeCat === 'Support'"
      @navigate="activeCat = $event"
    />

    <!-- 首頁區塊 -->
    <template v-else-if="activeCat === 'Lobby'">
      <Hero v-if="!isSupportView" />
      <PromoRibbon v-if="showPromos && !isSupportView" />
      <RewardsBanner v-if="user && !isSupportView" :user="user" />
      <Promos v-if="showPromos && !isSupportView" v-model:active="catTab" />

      <!-- Lobby tab -->
      <template v-if="catTab === 'Lobby'">
        <div class="lobby-section-list" :class="{ 'is-reordering': draggedSectionId }">
          <div
            v-for="sectionId in visibleLobbySectionOrder"
            :key="sectionId"
            class="lobby-sort-item"
            :class="{
              'is-dragging': draggedSectionId === sectionId,
              'is-drag-over': dragOverSectionId === sectionId && draggedSectionId !== sectionId,
            }"
              :data-sort-id="sectionId"
            >
            <button
              class="lobby-drag-handle"
              type="button"
              :aria-label="`${lobbySectionLabel(sectionId)} ${t('studio.dragToReorder')}`"
              :title="`${t('studio.dragToReorder')} ${lobbySectionLabel(sectionId)}`"
              @pointerdown="startSectionPointerDrag(sectionId, $event)"
              @pointermove="moveSectionPointerDrag"
              @pointerup="finishSectionPointerDrag"
              @pointercancel="finishSectionPointerDrag"
              @keydown.up.prevent="moveSectionBy(sectionId, -1)"
              @keydown.down.prevent="moveSectionBy(sectionId, 1)"
              @keydown.home.prevent="moveSectionBy(sectionId, -lobbySectionOrder.length)"
              @keydown.end.prevent="moveSectionBy(sectionId, lobbySectionOrder.length)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="3" r="1.25" /><circle cx="11" cy="3" r="1.25" />
                <circle cx="5" cy="8" r="1.25" /><circle cx="11" cy="8" r="1.25" />
                <circle cx="5" cy="13" r="1.25" /><circle cx="11" cy="13" r="1.25" />
              </svg>
            </button>

            <Rail
              v-if="sectionId === 'recently-played'"
              :title="lobbySectionLabel(sectionId)"
              :games="RECENTLY_PLAYED"
              :count="RECENTLY_PLAYED.length"
              :show-actions="false"
              @open="openGame = $event"
            />
            <Rail
              v-else-if="sectionId === 'slots'"
              :title="lobbySectionLabel(sectionId)"
              icon="fire"
              :games="GAMES.slots"
              see-all-tab="Slots"
              @see-all="catTab = $event"
              @open="openGame = $event"
            />
            <Rail
              v-else-if="sectionId === 'live-casino'"
              :title="lobbySectionLabel(sectionId)"
              icon="bolt"
              :games="GAMES.live"
              see-all-tab="Live"
              @see-all="catTab = $event"
              @open="openGame = $event"
            />
            <Leaderboard v-else-if="sectionId === 'top-wins'" />
            <Tournaments v-else-if="sectionId === 'live-sport'" />
            <Promotion v-else-if="sectionId === 'promotions'" @open="openPromotionDetail" />
            <Providers v-else-if="sectionId === 'providers'" />
          </div>
        </div>
      </template>

      <!-- Hot Games tab -->
      <CategoryView v-else-if="catTab === 'Hot Games'"
        :title="navLabel('Hot Games')" icon="fire"
        :games="[...GAMES.slots, ...GAMES.live, ...GAMES.originals]"
        :show-filter-tabs="false"
        :show-provider-tabs="false"
        :show-favorites="false"
        @open="openGame = $event"
      />

      <!-- Mini Games tab -->
      <CategoryView v-else-if="catTab === 'Mini Games'"
        :title="navLabel('Mini Games')" icon="star"
        :games="GAMES.originals"
        enable-load-more
        @open="openGame = $event"
      />

      <!-- Slots tab -->
      <CategoryView v-else-if="catTab === 'Slots'"
        :title="navLabel('Slots')" icon="fire"
        :games="GAMES.slots"
        enable-load-more
        @open="openGame = $event"
      />

      <!-- Live tab -->
      <CategoryView v-else-if="catTab === 'Live'"
        :title="navLabel('Live')" icon="bolt"
        :games="GAMES.live"
        enable-load-more
        @open="openGame = $event"
      />

      <!-- Fish tab -->
      <CategoryView v-else-if="catTab === 'Fish'"
        :title="navLabel('Fish')"
        :games="GAMES.slots"
        enable-load-more
        @open="openGame = $event"
      />

      <!-- Sports tab -->
      <Sports v-else-if="catTab === 'Sports'" />

      <!-- Promotion tab -->
      <Promotion v-else-if="catTab === 'Promotion'" enable-load-more @open="openPromotionDetail" />

      <!-- About Us / FAQ tab (inline) -->
      <SupportPage
        v-else-if="isSupportView"
        inline
        :initial-tab="catTab === 'FAQ' ? 'FAQ' : 'About'"
      />

      <!-- Fallback -->
      <div v-else style="color:var(--text-dim);padding:40px 0;text-align:center;font-family:var(--font-mono);font-size:13px">
        {{ navLabel(catTab) }} - {{ t('common.comingSoon') }}
      </div>
    </template>

    <!-- 其他主頁 -->
    <div v-else style="color:var(--text);padding:40px 0;font-family:var(--font-display)">
      <h2>{{ navLabel(activeCat) }}</h2>
    </div>

    <!-- 頁尾 -->
    <template #footer>
      <AppFooter
        v-if="activeCat === 'Lobby' && !isSupportView"
        @back-to-top="scrollToTop"
      />
    </template>

    <!-- 手機底部導覽 -->
    <template #mobile-nav>
      <MobileNav
        :cat-tab="catTab"
        :mobile-sidebar-open="mobileSidebarOpen"
        @browse="mobileSidebarOpen = !mobileSidebarOpen"
        @close-sidebar="mobileSidebarOpen = false"
        @navigate="({ cat, tab }) => { activeCat = cat; if (tab) catTab = tab; }"
      />
    </template>
  </AppLayout>

  <!-- Modals -->
  <GameModal
    v-if="openGame"
    :game="openGame"
    @close="openGame = null"
  />
  <SignInModal
    v-if="showSignIn"
    @close="showSignIn = false"
    @login="user = $event"
  />
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import AppLayout      from '@/layouts/AppLayout.vue';
import Sidebar        from '@/components/layout/Sidebar.vue';
import TopBar         from '@/components/layout/TopBar.vue';
import AppFooter      from '@/components/layout/AppFooter.vue';
import MobileNav      from '@/components/layout/MobileNav.vue';
import Hero           from '@/components/home/Hero.vue';
import PromoRibbon    from '@/components/home/PromoRibbon.vue';
import RewardsBanner  from '@/components/home/RewardsBanner.vue';
import Promos         from '@/components/home/Promos.vue';
import Rail           from '@/components/game/Rail.vue';
import CategoryView   from '@/components/game/CategoryView.vue';
import Leaderboard            from '@/components/lobby/Leaderboard.vue';
import Tournaments            from '@/components/lobby/Tournaments.vue';
import Sports                 from '@/components/lobby/Sports.vue';
import Promotion              from '@/components/lobby/Promotion.vue';
import PromotionDetail        from '@/components/lobby/PromotionDetail.vue';
import Providers              from '@/components/lobby/Providers.vue';
import GameModal              from '@/components/modal/GameModal.vue';
import SignInModal            from '@/components/modal/SignInModal.vue';
import AccountOverview        from '@/components/account/AccountOverview.vue';
import EditNickname           from '@/components/account/EditNickname.vue';
import DepositPage            from '@/components/account/DepositPage.vue';
import WithdrawalPage         from '@/components/account/WithdrawalPage.vue';
import PersonalInfo           from '@/components/account/PersonalInfo.vue';
import SecurityCenter         from '@/components/account/SecurityCenter.vue';
import BankingDetails         from '@/components/account/BankingDetails.vue';
import ChangeLoginPassword    from '@/components/account/ChangeLoginPassword.vue';
import CustomerServicePage    from '@/components/account/CustomerServicePage.vue';
import RecordTable            from '@/components/account/RecordTable.vue';
import SupportPage            from '@/components/account/SupportPage.vue';
import { useTweaks }          from '@/composables/useTweaks.js';
import { useDesignStudio }    from '@/composables/useDesignStudio.js';
import { useLocale }          from '@/composables/useLocale.js';
import { GAMES, RECENTLY_PLAYED } from '@/data/index.js';
import {
  DEFAULT_LOBBY_SECTION_ORDER,
  LOBBY_LAYOUT_STORAGE_KEY,
  LOBBY_SECTION_LABELS,
  LEGACY_LOBBY_ORDER_STORAGE_KEY,
  readLobbyLayout,
  readVisibleSkinIds,
  SKIN_VISIBILITY_STORAGE_KEY,
  writeLobbyLayout,
} from '@/design/siteFactory.js';

const { t } = useLocale();
const { t: tweaks, setTweak } = useTweaks();
useDesignStudio();

const openGame          = ref(null);
const sidebarCollapsed  = ref(false);
const mobileSidebarOpen = ref(false);
const activeCat         = ref('Lobby');
const catTab            = ref('Lobby');
const showSignIn        = ref(false);
const balance           = ref(1284.32);
const user              = ref(null);
const nickname          = ref('Meow');
const selectedPromotion = ref(null);
const promotionReturnTab = ref('Lobby');
const promotionReturnScroll = ref(0);

const lobbySectionOrder = ref([...DEFAULT_LOBBY_SECTION_ORDER]);
const hiddenLobbySections = ref([]);
const draggedSectionId = ref(null);
const dragOverSectionId = ref(null);
const touchDragPointerId = ref(null);

// showPromos 從 tweaks 驅動
const showPromos = computed(() => tweaks.showPromos);
const isSupportView = computed(() => ['About Us', 'FAQ'].includes(catTab.value));
const visibleLobbySectionOrder = computed(() =>
  lobbySectionOrder.value.filter((id) => !hiddenLobbySections.value.includes(id))
);

function navLabel(id) {
  return t(['nav', id], id);
}

function lobbySectionLabel(id) {
  return t(['lobby', 'sections', id], LOBBY_SECTION_LABELS[id] || id);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  activeCat.value = 'Lobby';
  catTab.value = 'Lobby';
  mobileSidebarOpen.value = false;
  nextTick(scrollToTop);
}

function openPromotionDetail(promotion) {
  selectedPromotion.value = promotion;
  promotionReturnTab.value = catTab.value;
  promotionReturnScroll.value = window.scrollY;
  activeCat.value = 'Promotion Detail';
  mobileSidebarOpen.value = false;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function closePromotionDetail() {
  activeCat.value = 'Lobby';
  catTab.value = promotionReturnTab.value;
  selectedPromotion.value = null;
  nextTick(() => window.scrollTo({ top: promotionReturnScroll.value, behavior: 'instant' }));
}

function saveLobbySectionOrder() {
  try {
    writeLobbyLayout({ order: lobbySectionOrder.value, hidden: hiddenLobbySections.value });
  } catch {
    // Storage can be unavailable in private browsing; ordering still works for this session.
  }
}

function restoreLobbySectionOrder() {
  const layout = readLobbyLayout();
  lobbySectionOrder.value = layout.order;
  hiddenLobbySections.value = layout.hidden;
}

function enforceVisibleSkinPolicy() {
  const visibleSkinIds = readVisibleSkinIds();
  if (!visibleSkinIds.includes(tweaks.skin)) setTweak('skin', visibleSkinIds[0]);
}

function syncSiteFactory(event) {
  if (event.key === null || [LOBBY_LAYOUT_STORAGE_KEY, LEGACY_LOBBY_ORDER_STORAGE_KEY].includes(event.key)) {
    restoreLobbySectionOrder();
  }
  if (event.key === null || event.key === SKIN_VISIBILITY_STORAGE_KEY) {
    enforceVisibleSkinPolicy();
  }
}

function reorderSection(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const next = [...lobbySectionOrder.value];
  const sourceIndex = next.indexOf(sourceId);
  const targetIndex = next.indexOf(targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, sourceId);
  lobbySectionOrder.value = next;
  dragOverSectionId.value = targetId;
}

function moveSectionTo(targetId) {
  reorderSection(draggedSectionId.value, targetId);
}

function finishSectionDrag() {
  if (draggedSectionId.value) saveLobbySectionOrder();
  draggedSectionId.value = null;
  dragOverSectionId.value = null;
  touchDragPointerId.value = null;
}

function startSectionPointerDrag(sectionId, event) {
  draggedSectionId.value = sectionId;
  touchDragPointerId.value = event.pointerId;
  event.currentTarget.setPointerCapture(event.pointerId);
}

function moveSectionPointerDrag(event) {
  if (touchDragPointerId.value !== event.pointerId || !draggedSectionId.value) return;
  const edge = 72;
  if (event.clientY < edge) window.scrollBy({ top: -18, behavior: 'auto' });
  if (event.clientY > window.innerHeight - edge) window.scrollBy({ top: 18, behavior: 'auto' });
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-sort-id]');
  if (target?.dataset.sortId) moveSectionTo(target.dataset.sortId);
}

function finishSectionPointerDrag(event) {
  if (touchDragPointerId.value !== null && touchDragPointerId.value !== event.pointerId) return;
  finishSectionDrag();
}

function moveSectionBy(sectionId, delta) {
  const currentIndex = lobbySectionOrder.value.indexOf(sectionId);
  if (currentIndex < 0) return;
  const targetIndex = Math.max(0, Math.min(lobbySectionOrder.value.length - 1, currentIndex + delta));
  if (currentIndex === targetIndex) return;
  const next = [...lobbySectionOrder.value];
  next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, sectionId);
  lobbySectionOrder.value = next;
  saveLobbySectionOrder();
}

// 模擬餘額浮動
let balanceTimer;
onMounted(() => {
  restoreLobbySectionOrder();
  enforceVisibleSkinPolicy();
  window.addEventListener('storage', syncSiteFactory);
  balanceTimer = setInterval(() => { balance.value = +(balance.value + (Math.random() * 4 - 1.7)).toFixed(2); }, 5500);
});
onUnmounted(() => {
  clearInterval(balanceTimer);
  window.removeEventListener('storage', syncSiteFactory);
});
</script>
