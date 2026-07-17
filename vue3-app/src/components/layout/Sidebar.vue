<template>
  <aside class="sidebar" :class="{ collapsed }">

    <!-- 搜尋 -->
    <div class="sidebar-search">
      <div class="search">
        <Icon name="search" :size="14" />
        <input :placeholder="t('lobby.search')" />
      </div>
    </div>

    <!-- 分組導覽 -->
    <nav class="sidebar-list">
      <section v-for="section in sections" :key="section.id" class="sb-section">
        <div class="sb-section-head">
          <button
            class="sb-section-toggle"
            :class="{ collapsed: !sectionOpen[section.id] }"
            :aria-expanded="sectionOpen[section.id]"
            @click="sectionOpen[section.id] = !sectionOpen[section.id]"
          >
            <span>{{ section.label }}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        <div v-show="sectionOpen[section.id]" class="sb-section-items">
          <a
            v-for="item in section.items" :key="item.name"
            href="#"
            class="sb-item"
            :class="{ active: isActive(item) }"
            :title="collapsed ? item.label : undefined"
            @click.prevent="handleNav(item)"
          >
            <span class="sb-icon">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path v-if="item.icon === 'home'" d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round" />
              <path v-else-if="item.icon === 'fire'" d="M13.5 3.5c.8 3.1-.4 4.8-1.8 6.2.1-2.1-1.1-3.4-2.1-4.2.2 3.2-3.6 4.8-3.6 9A6 6 0 0 0 18 14c0-3-1.7-5.8-4.5-10.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              <g v-else-if="item.icon === 'gamepad'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.1 3.4a2.2 2.2 0 0 1-3.5 1.1L14.5 16h-5l-1.7 1.7a2.2 2.2 0 0 1-3.5-1.1l-1.1-3.4A4 4 0 0 1 7 8Z" /><path d="M8 11v4M6 13h4" /><circle cx="16" cy="12" r=".8" fill="currentColor" stroke="none" /><circle cx="18" cy="14" r=".8" fill="currentColor" stroke="none" />
              </g>
              <g v-else-if="item.icon === 'slots'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h3v6H7zM14 9h3v6h-3z" />
              </g>
              <g v-else-if="item.icon === 'sports'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="m12 3 2.5 6M21 12l-6 2.5M12 21l-2.5-6M3 12l6-2.5" />
              </g>
              <g v-else-if="item.icon === 'live'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" />
              </g>
              <g v-else-if="item.icon === 'fish'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12c3.5-4.5 8.5-5.5 13-2l3-2v8l-3-2c-4.5 3.5-9.5 2.5-13-2Z" /><circle cx="14" cy="11" r=".7" fill="currentColor" stroke="none" />
              </g>
              <g v-else-if="item.icon === 'gift'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                <rect x="3" y="9" width="18" height="12" rx="1.5" /><path d="M12 9v12M3 13h18M12 9H8.5a2.5 2.5 0 1 1 2.2-3.7L12 9Zm0 0h3.5a2.5 2.5 0 1 0-2.2-3.7L12 9Z" />
              </g>
              <g v-else-if="item.icon === 'help'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2.9-1.2 1.8" /><path d="M12 17h.01" />
              </g>
              <g v-else-if="item.icon === 'grid'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
              </g>
              <g v-else-if="item.icon === 'ticket'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5L7.2 18l.9-5.4-3.9-3.8 5.4-.8L12 3Z" />
              </g>
              <g v-else-if="item.icon === 'down'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M12 4v12m0 0-4-4m4 4 4-4" /><path d="M4 20h16" />
              </g>
              <g v-else-if="item.icon === 'chart'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="m4 16 5-5 4 4 7-9" /><path d="M14 6h6v6" />
              </g>
              <g v-else-if="item.icon === 'swap'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M7 4v13m0 0-3-3m3 3 3-3" /><path d="M17 20V7m0 0 3 3m-3-3-3 3" />
              </g>
              <g v-else-if="item.icon === 'book'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h10M7 17h6" />
              </g>
              <g v-else-if="item.icon === 'person'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6 19a6 6 0 0 1 12 0" />
              </g>
              <g v-else-if="item.icon === 'shield'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                <path d="M12 3 4 6v6c0 4.5 3.3 8 8 9 4.7-1 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" />
              </g>
            </svg>
          </span>
            <span class="sb-label">{{ item.label }}</span>
          </a>
        </div>
      </section>
    </nav>

    <button
      v-if="!collapsed"
      class="sb-collapse sb-edge-handle sb-collapse-account"
      aria-label="Collapse sidebar"
      title="Collapse sidebar"
      @click="collapseSidebar"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m14 18-6-6 6-6" />
      </svg>
    </button>

    <!-- 語言 + 存提款 -->
    <div class="sidebar-extra">
      <div v-if="visibleLocaleIds.length > 1" class="sb-lang-wrap" ref="langRef">
        <button class="sb-lang" :class="{ open: langOpen }" @click="langOpen = !langOpen">
          <svg class="sb-lang-globe" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
          <span class="sb-flag" aria-hidden="true">
            <LocaleFlag :code="locale" />
          </span>
          <span class="sb-lang-label">{{ LANGS[locale].label }}</span>
          <svg class="sb-lang-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <div v-if="langOpen" class="sb-lang-menu">
          <button
            v-for="(v, k) in visibleLangs" :key="k"
            class="sb-lang-item" :class="{ active: locale === k }"
            @click="setLocale(k); langOpen = false"
          >
            <span class="sb-flag">
              <LocaleFlag :code="k" />
            </span>
            <span>{{ v.label }}</span>
            <svg v-if="locale === k" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12l5 5 9-10" />
            </svg>
          </button>
        </div>
      </div>

      <div class="sb-money">
        <button class="sb-deposit"  @click="handleDeposit">{{ t(['nav', 'Deposit']) }}</button>
        <button class="sb-withdraw" @click="handleWithdraw">{{ t(['nav', 'WithdrawalForm']) }}</button>
        <button class="sb-collapse sb-collapse-inline sb-collapse-money" aria-label="Collapse sidebar" @click="collapseSidebar">
          ‹
        </button>
      </div>
    </div>

    <!-- 折疊 -->
    <div class="sidebar-foot">
      <button class="sb-collapse sb-edge-handle sb-collapse-compact" aria-label="Expand sidebar" title="Expand sidebar" @click="emit('update:collapsed', false)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m10 6 6 6-6 6" />
        </svg>
      </button>
    </div>

  </aside>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue';
import Icon from '@/components/ui/Icon.vue';
import LocaleFlag from '@/components/ui/LocaleFlag.vue';
import { useLocale } from '@/composables/useLocale.js';
import { useClickOutside } from '@/composables/useClickOutside.js';
import { LOCALE_VISIBILITY_STORAGE_KEY, STUDIO_DRAFT_STORAGE_KEY, readVisibleLocaleIds } from '@/design/siteFactory.js';

const props = defineProps({
  collapsed:  { type: Boolean, default: false },
  activeCat:  { type: String,  default: 'Lobby' },
  activeTab:  { type: String,  default: 'Lobby' },
  user:       { type: Object,  default: null },
});

const emit = defineEmits([
  'update:collapsed',
  'update:activeCat',
  'update:activeTab',
  'sign-in',
  'close-menu',
]);

const sectionOpen = reactive({
  Menu: true,
  'My Account': true,
});

const langOpen = ref(false);
const langRef  = ref(null);
const { locale, languages: LANGS, setLocale, t } = useLocale();

const visibleLocaleIds = ref(readVisibleLocaleIds());
const visibleLangs = computed(() =>
  Object.fromEntries(Object.entries(LANGS).filter(([k]) => visibleLocaleIds.value.includes(k)))
);
function syncVisibleLocales(event) {
  if (event.key !== null && event.key !== LOCALE_VISIBILITY_STORAGE_KEY && event.key !== STUDIO_DRAFT_STORAGE_KEY) return;
  visibleLocaleIds.value = readVisibleLocaleIds();
}

useClickOutside(langRef, () => { langOpen.value = false; });

const sections = computed(() => [
  {
    id: 'Menu',
    label: t(['nav', 'Menu'], 'Menu'),
    items: [
      { name: 'Lobby',      label: t(['nav', 'Lobby'], 'Lobby'),           icon: 'home',    cat: 'Lobby', tab: 'Lobby',      public: true },
      { name: 'Hot Games',  label: t(['nav', 'Hot Games'], 'Hot Games'),   icon: 'fire',    cat: 'Lobby', tab: 'Hot Games',  public: true },
      { name: 'Mini Games', label: t(['nav', 'Mini Games'], 'Mini Games'), icon: 'gamepad', cat: 'Lobby', tab: 'Mini Games', public: true },
      { name: 'Slots',      label: t(['nav', 'Slots'], 'Slots'),           icon: 'slots',   cat: 'Lobby', tab: 'Slots',      public: true },
      { name: 'Sports',     label: t(['nav', 'Sports'], 'Sports'),         icon: 'sports',  cat: 'Lobby', tab: 'Sports',     public: true },
      { name: 'Live',       label: t(['nav', 'Live'], 'Live'),             icon: 'live',    cat: 'Lobby', tab: 'Live',       public: true },
      { name: 'Fish',       label: t(['nav', 'Fish'], 'Fish'),             icon: 'fish',    cat: 'Lobby', tab: 'Fish',       public: true },
      { name: 'Promotion',  label: t(['nav', 'Promotion'], 'Promotion'),   icon: 'gift',    cat: 'Lobby', tab: 'Promotion',  public: true },
    ],
  },
  {
    id: 'My Account',
    label: t(['nav', 'My Account'], 'My Account'),
    items: [
      { name: 'Account Overview',  label: t(['nav', 'Account Overview'], 'Account Overview'),   icon: 'grid'   },
      { name: 'Betting Record',    label: t(['nav', 'Betting Record'], 'Betting Record'),       icon: 'ticket' },
      { name: 'Deposit Record',    label: t(['nav', 'Deposit Record'], 'Deposit Record'),       icon: 'down'   },
      { name: 'Profit And Loss',   label: t(['nav', 'Profit And Loss'], 'Profit And Loss'),     icon: 'chart'  },
      { name: 'Withdrawal Record', label: t(['nav', 'Withdrawal Record'], 'Withdrawal Record'), icon: 'swap'   },
      { name: 'Account Record',    label: t(['nav', 'Account Record'], 'Account Record'),       icon: 'book'   },
      { name: 'Personal Info',     label: t(['nav', 'Personal Info'], 'Personal Info'),         icon: 'person' },
      { name: 'Security Center',   label: t(['nav', 'Security Center'], 'Security Center'),     icon: 'shield' },
      { name: 'FAQ',               label: t(['nav', 'FAQ'], 'FAQ'),                             icon: 'help', cat: 'Lobby', tab: 'FAQ', public: true },
    ],
  },
]);

function isActive(item) {
  if (item.tab) return props.activeCat === 'Lobby' && props.activeTab === item.tab;
  return props.activeCat === item.name;
}

function closeMenu() {
  langOpen.value = false;
  emit('close-menu');
}

function collapseSidebar() {
  emit('update:collapsed', true);
  closeMenu();
}

function handleNav(item) {
  if (!item.public && !props.user) {
    emit('sign-in');
    closeMenu();
    return;
  }
  emit('update:activeCat', item.cat || item.name);
  if (item.tab) emit('update:activeTab', item.tab);
  closeMenu();
}

function handleDeposit() {
  if (!props.user) {
    emit('sign-in');
    closeMenu();
    return;
  }
  emit('update:activeCat', 'DepositForm');
  closeMenu();
}
function handleWithdraw() {
  if (!props.user) {
    emit('sign-in');
    closeMenu();
    return;
  }
  emit('update:activeCat', 'WithdrawalForm');
  closeMenu();
}

onMounted(() => {
  window.addEventListener('storage', syncVisibleLocales);
  syncVisibleLocales({ key: null });
});
onUnmounted(() => {
  window.removeEventListener('storage', syncVisibleLocales);
});
</script>
