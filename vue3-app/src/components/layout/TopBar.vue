<template>
  <header class="header" :class="{ scrolled }">
    <div class="container header-inner" style="justify-content: space-between">

      <!-- Logo -->
      <a href="#" class="topbar-brand" @click.prevent="emit('home')">
        <img src="/assets/logo.png" alt="100%" class="topbar-logo" />
      </a>

      <!-- 右側操作區 -->
      <div class="header-actions">

        <!-- Skin selector -->
        <div class="tb-skin-wrap" ref="skinRef">
          <button
            class="tb-icon-btn tb-skin-trigger"
            aria-label="Choose skin"
            title="Choose skin"
            aria-haspopup="listbox"
            :aria-expanded="skinMenuOpen"
            @click="skinMenuOpen = !skinMenuOpen; menuOpen = false"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m12 3 8 5-8 5-8-5 8-5Z" />
              <path d="m5.5 12 6.5 4 6.5-4" />
              <path d="m7.5 17 4.5 2.8 4.5-2.8" />
            </svg>
          </button>

          <div v-if="skinMenuOpen" class="tb-skin-menu" role="listbox" aria-label="Skin">
            <button
              v-for="option in skins"
              :key="option.id"
              class="tb-skin-option"
              :class="{ active: skin === option.id }"
              role="option"
              :aria-selected="skin === option.id"
              @click="selectSkin(option.id)"
            >
              <span
                class="tb-skin-swatch"
                :style="{ '--skin-color': option.swatch, '--skin-surface': option.surface }"
                aria-hidden="true"
              ></span>
              <span class="tb-skin-label">{{ option.label }}</span>
              <svg v-if="skin === option.id" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m5 12 4 4 10-10" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 已登入 -->
        <template v-if="user">
          <div class="tb-balance">
            <div class="tb-balance-rows">
              <div class="tb-balance-row">
                <span class="tb-balance-label">Balance:</span>
                <span class="tb-balance-num">{{ balanceFmt }}</span>
              </div>
              <div class="tb-balance-row">
                <span class="tb-balance-label">Points:</span>
                <span class="tb-balance-num">0.00</span>
              </div>
            </div>
          </div>

          <!-- 用戶頭像 + 下拉選單 -->
          <div class="tb-user-wrap" ref="menuRef">
            <button class="tb-user-circle" aria-label="Account" @click="menuOpen = !menuOpen; skinMenuOpen = false">
              <span class="tb-avatar circle">{{ initials }}</span>
              <span class="tb-tier-badge" aria-hidden="true">
                <svg width="10" height="11" viewBox="0 0 12 14" fill="currentColor">
                  <path d="M6 0 0 3.5v7L6 14l6-3.5v-7L6 0Z" />
                </svg>
              </span>
            </button>

            <div v-if="menuOpen" class="tb-menu">
              <div class="tb-menu-head">
                <div class="tb-avatar lg">{{ initials }}</div>
                <div>
                  <div class="tb-menu-name">{{ user.name }}</div>
                  <div class="tb-menu-email">{{ user.email }}</div>
                </div>
              </div>

              <a
                v-for="item in menuItems" :key="item.name"
                href="#"
                class="tb-menu-item tb-menu-item-2l"
                @click.prevent="navigate(item.go)"
              >
                <span class="tb-menu-ico">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <g v-if="item.icon === 'person'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6 19a6 6 0 0 1 12 0" />
                    </g>
                    <g v-else-if="item.icon === 'lock'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                      <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </g>
                    <g v-else-if="item.icon === 'key'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                      <circle cx="8" cy="12" r="3.5" /><path d="M11 12h9M17 12v3M20 12v2" />
                    </g>
                    <g v-else-if="item.icon === 'card'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" />
                    </g>
                  </svg>
                </span>
                <span class="tb-menu-2l-text">
                  <span class="tb-menu-2l-name">{{ item.name }}</span>
                </span>
              </a>

              <div class="tb-menu-sep"></div>

              <button class="tb-menu-item logout tb-menu-item-2l" @click="doLogout">
                <span class="tb-menu-ico">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                </span>
                <span class="tb-menu-2l-text"><span class="tb-menu-2l-name">Logout</span></span>
              </button>
            </div>
          </div>
        </template>

        <!-- 未登入 -->
        <template v-else>
          <button class="btn" @click="emit('sign-in')">Login</button>
          <button class="btn" @click="emit('sign-in')">Register</button>
        </template>

      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  user:    { type: Object, default: null },
  balance: { type: Number, default: 0   },
  skin:    { type: String, default: 'blue' },
  skins:   { type: Array, default: () => [] },
});

const emit = defineEmits(['sign-in', 'logout', 'home', 'navigate', 'change-skin']);

const scrolled     = ref(false);
const menuOpen     = ref(false);
const menuRef      = ref(null);
const skinMenuOpen = ref(false);
const skinRef      = ref(null);

const initials = computed(() => props.user ? props.user.name.slice(0, 2).toUpperCase() : '');
const balanceFmt = computed(() =>
  props.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
);

const menuItems = [
  { name: 'Personal Info',               icon: 'person', go: 'Personal Info'   },
  { name: 'Change Login Password',        icon: 'lock',   go: 'Security Center' },
  { name: 'Change Transaction Password',  icon: 'key',    go: 'Security Center' },
  { name: 'Banking Details',              icon: 'card',   go: 'WithdrawalForm'  },
];

function selectSkin(id) {
  emit('change-skin', id);
  skinMenuOpen.value = false;
}
function navigate(cat) { emit('navigate', cat); menuOpen.value = false; }
function doLogout()    { emit('logout');         menuOpen.value = false; }

function onScroll() { scrolled.value = window.scrollY > 8; }
function onDocClick(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) menuOpen.value = false;
  if (skinRef.value && !skinRef.value.contains(e.target)) skinMenuOpen.value = false;
}

onMounted(() => {
  window.addEventListener('scroll', onScroll);
  document.addEventListener('mousedown', onDocClick);
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  document.removeEventListener('mousedown', onDocClick);
});
</script>
