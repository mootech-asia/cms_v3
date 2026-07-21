// CMS_前台_v3 — 純靜態站 vanilla JS 行為層
// 行為規格對照 vue3-app/src/ 對應元件（Hero / Promos / Rail / CategoryView /
// Leaderboard / RewardsBanner / 三個 modal / useFavorites / useTweaks / account/*）。
// 全域式 <script>（非 module），不使用 fetch/import，file:// 可直開。
// 任何一段初始化失敗都不能讓其他功能或 console 冒出錯誤，因此每段都包在 safe() 裡。
(function () {
  'use strict';

  var DATA = window.CMS_DATA || {};
  var GAMES = DATA.GAMES || { slots: [], live: [], originals: [], table: [] };
  var PROVIDERS = DATA.PROVIDERS || [];
  var WINNERS = DATA.WINNERS || [];

  var CURRENT_PAGE = (location.pathname.split('/').pop() || '').trim();
  if (!CURRENT_PAGE) CURRENT_PAGE = 'index.html';

  function safe(fn) {
    try { fn(); } catch (e) { /* 靜默吞掉——不可讓單一功能失敗拖垮整頁或觸發 console error */ }
  }

  function escapeHtml(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var escapeAttr = escapeHtml;

  function fmtNum(n) {
    return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ============================================================
   * 共用 icon（僅列出「動態產生的 markup」會用到的圖示；其餘既有
   * 靜態頁面裡的 svg 一律原樣保留，不重新產生）
   * ========================================================== */
  var ICON_PATHS = {
    fire: '<path d="M12 2c1 4 5 5 5 10a5 5 0 1 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9Z" fill="currentColor"/>',
    star: '<path d="m12 3 2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.4 1.4-6.4L3 9.6l6.4-.6L12 3Z" fill="currentColor"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor"/>'
  };
  function iconSvg(name, size) {
    var p = ICON_PATHS[name];
    if (!p) return '';
    size = size || 18;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24">' + p + '</svg>';
  }
  var CV_HEART = '<svg class="cv-heart" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 6l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.3 1-1a5.5 5.5 0 0 0 0-7.8Z" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> ';
  function gcardHeartSvg(isFav) {
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path ' +
      'd="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 6l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.3 1-1a5.5 5.5 0 0 0 0-7.8Z" ' +
      'fill="' + (isFav ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var CHECK_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>';
  var CLOSE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round"/></svg>';
  var TIER_ICON = '<svg width="10" height="11" viewBox="0 0 12 14" fill="currentColor"><path d="M6 0 0 3.5v7L6 14l6-3.5v-7L6 0Z"/></svg>';
  var MENU_ICONS = {
    person: '<svg width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6 19a6 6 0 0 1 12 0"/></g></svg>',
    lock: '<svg width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></g></svg>',
    key: '<svg width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="8" cy="12" r="3.5"/><path d="M11 12h9M17 12v3M20 12v2"/></g></svg>',
    card: '<svg width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></g></svg>',
    logout: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    cs: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 16 0v4a3 3 0 0 1-3 3h-2v-7h5M4 12v4a3 3 0 0 0 3 3h2v-7H4"/></svg>'
  };

  /* STR（動態 markup 用字串）已移到下方 i18n 區塊之後，改由 tr() 依當前語系解析。 */

  /* ============================================================
   * i18n（移植自 vue3-app/src/composables/useLocale.js + data/i18n.js）：
   * 靜態站以 data-i18n / data-i18n-title 屬性標註可翻譯文字，t(path) 從
   * window.CMS_I18N 依當前語系取值（fallback zh）；切語系寫入 localStorage
   * 後重載整頁套用（純靜態多頁站本就整頁導覽，重載最單純可靠）。
   * ========================================================== */
  var I18N = window.CMS_I18N || { LANGS: { zh: { label: '中文', shortLabel: '中', htmlLang: 'zh-Hant' } }, TRANSLATIONS: { zh: {} } };
  var LOCALE_KEY = I18N.LOCALE_STORAGE_KEY || 'cms-v3:locale';
  var FALLBACK_LOCALE = 'zh';
  function readLocale() {
    try { var s = localStorage.getItem(LOCALE_KEY); return (I18N.LANGS && I18N.LANGS[s]) ? s : FALLBACK_LOCALE; }
    catch (e) { return FALLBACK_LOCALE; }
  }
  var LOCALE = readLocale();
  function localeRoot(loc) {
    return {
      t: (I18N.TRANSLATIONS || {})[loc],
      HERO_COPY: (I18N.HERO_COPY || {})[loc],
      PROMO_RIBBON_COPY: (I18N.PROMO_RIBBON_COPY || {})[loc],
      PROMOTION_COPY: (I18N.PROMOTION_COPY || {})[loc],
      TOURNAMENT_COPY: (I18N.TOURNAMENT_COPY || {})[loc]
    };
  }
  function resolvePath(root, path) {
    var parts = String(path).replace(/\[(\d+)\]/g, '.$1').split('.');
    var cur = root;
    for (var i = 0; i < parts.length; i++) { if (cur == null) return undefined; cur = cur[parts[i]]; }
    return cur;
  }
  function tr(path, fallback) {
    var v = resolvePath(localeRoot(LOCALE), path);
    if (v == null) v = resolvePath(localeRoot(FALLBACK_LOCALE), path);
    return (v == null || typeof v !== 'string') ? (fallback != null ? fallback : path) : v;
  }
  function setLocale(loc) {
    if (!I18N.LANGS || !I18N.LANGS[loc] || loc === LOCALE) { closeLangMenu(); return; }
    try { localStorage.setItem(LOCALE_KEY, loc); } catch (e) {}
    location.reload();
  }
  function applyI18n(scope) {
    var root = scope || document;
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n]'), function (el) {
      var val = tr(el.getAttribute('data-i18n'), null);
      if (val == null) return;
      var suffix = el.getAttribute('data-i18n-suffix') || '';
      el.textContent = val + suffix;
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n-title]'), function (el) {
      var val = tr(el.getAttribute('data-i18n-title'), null);
      if (val != null) el.textContent = val;
    });
    /* 混合內容：只替換元素的第一個非空白文字節點，保留子元素(icon/計數)與原空白 */
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n-text]'), function (el) {
      var val = tr(el.getAttribute('data-i18n-text'), null);
      if (val == null) return;
      for (var i = 0; i < el.childNodes.length; i++) {
        var node = el.childNodes[i];
        if (node.nodeType === 3 && node.nodeValue.replace(/\s+/g, ' ').trim()) {
          var m = node.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/);
          node.nodeValue = (m ? m[1] : '') + val + (m ? m[2] : '');
          break;
        }
      }
    });
    /* 語言切換器觸發鈕的目前語系標籤（"中文"/"English"/… 非 TRANSLATIONS 值，直接取 LANGS） */
    var langLabel = (I18N.LANGS || {})[LOCALE];
    Array.prototype.forEach.call(root.querySelectorAll('.sb-lang-label'), function (el) {
      if (langLabel && langLabel.label) el.textContent = langLabel.label;
    });
  }
  function initI18n() {
    var info = (I18N.LANGS || {})[LOCALE];
    document.documentElement.lang = (info && info.htmlLang) || 'zh-Hant';
    applyI18n(document);
  }

  /* 動態產生 markup 用的字串：由 tr() 依當前語系解析（切語系會 reload，載入時解析即可）。
     3 個 modal 原始碼本身仍是純英文寫死，未經 tr()。 */
  var STR = {
    all: tr('t.common.all', '全部'),
    favorites: tr('t.common.favorites', '我的最愛'),
    loadMore: tr('t.common.loadMore', '載入更多'),
    noFavorites: tr('t.lobby.noFavorites', '尚未加入我的最愛，點擊遊戲愛心即可收藏。'),
    noProviderGames: function (p) { return tr('t.lobby.noProviderGames', '目前沒有來自 {provider} 的遊戲。').replace('{provider}', p); },
    noGames: tr('t.lobby.noGames', '目前沒有可顯示的遊戲。')
  };

  /* ============================================================
   * useFavorites 對照（同一組 localStorage key，行為完全相同）
   * ========================================================== */
  var FAV_KEY = 'lobby_favs_v1';
  var favs = (function () {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); }
    catch (e) { return new Set(); }
  })();
  function isFav(id) { return favs.has(id); }
  function toggleFav(id) {
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favs))); } catch (e) {}
    document.dispatchEvent(new CustomEvent('cms:favorites-changed'));
  }

  /* ============================================================
   * 卡片 <-> CMS_DATA 比對（title+provider+image 檔名三者組合在
   * 同一分類陣列內是唯一的，見 phase2 report / data.js 生成演算法）
   * ========================================================== */
  var GAME_INDEX = null;
  function buildGameIndex() {
    var map = {};
    ['slots', 'live', 'originals', 'table'].forEach(function (cat) {
      (GAMES[cat] || []).forEach(function (g) {
        var base = (g.image || '').split('/').pop();
        map[g.title + '|' + g.provider + '|' + base] = g;
      });
    });
    return map;
  }
  function resolveGameFromCard(card) {
    if (!GAME_INDEX) GAME_INDEX = buildGameIndex();
    var titleEl = card.querySelector('.gcard-title');
    var provEl = card.querySelector('.gcard-provider');
    var imgEl = card.querySelector('.gcard-art-image');
    var title = titleEl ? titleEl.textContent.trim() : '';
    var provider = provEl ? provEl.textContent.trim() : '';
    var src = imgEl ? (imgEl.getAttribute('src') || '') : '';
    var base = src.split('/').pop();
    var found = GAME_INDEX[title + '|' + provider + '|' + base];
    if (found) return found;
    return {
      id: 'card-' + (title + '|' + provider).replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
      title: title || 'Game', provider: provider || '—', category: 'slots',
      rtp: '96.00', maxWin: '1000x', image: src, tag: null, players: 0
    };
  }

  function gameCardHTML(g, showFav) {
    var fav = favs.has(g.id);
    var tagHtml = g.tag
      ? '<span class="gcard-tag' + (g.tag === 'Hot' ? ' hot' : '') + (g.tag === 'New' ? ' new' : '') + '">' + escapeHtml(g.tag) + '</span>'
      : '';
    var favHtml = showFav
      ? '<button type="button" class="gcard-fav' + (fav ? ' on' : '') + '" aria-label="' + (fav ? 'Remove favorite' : 'Add favorite') + '">' + gcardHeartSvg(fav) + '</button>'
      : '';
    var playersHtml = g.category === 'live'
      ? '<div class="gcard-players"><span class="live-dot"></span>' + Number(g.players || 0).toLocaleString() + ' playing</div>'
      : '';
    return '<article class="gcard" style="cursor:pointer">' +
      '<div class="gcard-art">' +
        '<img class="gcard-art-image" src="' + escapeAttr(g.image) + '" alt="" loading="lazy" decoding="async">' +
        tagHtml + favHtml + playersHtml +
      '</div>' +
      '<div class="gcard-meta"><div class="gcard-title">' + escapeHtml(g.title) + '</div><div class="gcard-provider">' + escapeHtml(g.provider) + '</div></div>' +
    '</article>';
  }

  /* ============================================================
   * CategoryView（All / Favorites / Provider tabs + load more）
   * 同一份 renderer 同時用於：
   *   (a) 5 個已預先烘焙的頁面（hot-games / mini-games / slots / live / fish）
   *       ——載入時立刻用 CMS_DATA 重繪一次，換取完整互動能力
   *   (b) Promos 分類 tab 點擊時的動態重繪
   * ========================================================== */
  var CATEGORY_PARAMS = {
    'Hot Games': { title: tr('t.nav.Hot Games', '熱門遊戲'), icon: 'fire', games: GAMES.slots.concat(GAMES.live, GAMES.originals), showFilterTabs: false, showProviderTabs: false, showFavorites: false, enableLoadMore: false, pageSize: 10 },
    'Mini Games': { title: tr('t.nav.Mini Games', '小遊戲'), icon: 'star', games: GAMES.originals, showFilterTabs: true, showProviderTabs: true, showFavorites: true, enableLoadMore: true, pageSize: 10 },
    'Slots': { title: tr('t.nav.Slots', '老虎機'), icon: 'fire', games: GAMES.slots, showFilterTabs: true, showProviderTabs: true, showFavorites: true, enableLoadMore: true, pageSize: 10 },
    'Live': { title: tr('t.nav.Live', '真人'), icon: 'bolt', games: GAMES.live, showFilterTabs: true, showProviderTabs: true, showFavorites: true, enableLoadMore: true, pageSize: 10 },
    'Fish': { title: tr('t.nav.Fish', '捕魚'), icon: null, games: GAMES.slots, showFilterTabs: true, showProviderTabs: true, showFavorites: true, enableLoadMore: true, pageSize: 10 }
  };

  function renderCategoryView(section) {
    var params = section._cvParams, state = section._cvState;
    if (!params || !state) return;
    var filtered = params.games;
    if (state.filter === 'Favorites') {
      filtered = params.games.filter(function (g) { return favs.has(g.id); });
    } else if (params.showProviderTabs && state.filter !== 'All') {
      filtered = params.games.filter(function (g) { return g.provider === state.filter; });
    }
    var shown = params.enableLoadMore ? filtered.slice(0, state.visibleCount) : filtered;
    var canLoadMore = params.enableLoadMore && shown.length < filtered.length;
    var favCount = params.games.filter(function (g) { return favs.has(g.id); }).length;

    var titleHtml = (params.icon ? iconSvg(params.icon, 18) + ' ' : '') + escapeHtml(params.title) + ' <span class="count">' + filtered.length + '</span>';
    var headHtml = '<div class="section-head"><h2 class="section-title">' + titleHtml + '</h2></div>';

    var tabsHtml = '';
    if (params.showFilterTabs) {
      var tabBtns = '<button type="button" class="cv-tab' + (state.filter === 'All' ? ' active' : '') + '" data-filter="All">' + STR.all + '</button>';
      if (params.showFavorites) {
        tabBtns += '<button type="button" class="cv-tab' + (state.filter === 'Favorites' ? ' active' : '') + '" data-filter="Favorites">' +
          CV_HEART + STR.favorites + (favCount > 0 ? '<span class="cv-tab-count">' + favCount + '</span>' : '') + '</button>';
      }
      if (params.showProviderTabs) {
        PROVIDERS.forEach(function (p) {
          tabBtns += '<button type="button" class="cv-tab' + (state.filter === p ? ' active' : '') + '" data-filter="' + escapeAttr(p) + '">' + escapeHtml(p) + '</button>';
        });
      }
      tabsHtml = '<div class="cv-tabs">' + tabBtns + '</div>';
    }

    var bodyHtml;
    if (shown.length === 0) {
      var emptyText = state.filter === 'Favorites' ? STR.noFavorites
        : (params.showProviderTabs && state.filter !== 'All') ? STR.noProviderGames(state.filter)
        : STR.noGames;
      bodyHtml = '<div class="cv-empty">' + escapeHtml(emptyText) + '</div>';
    } else {
      bodyHtml = '<div class="grid">' + shown.map(function (g) { return gameCardHTML(g, params.showFavorites); }).join('') + '</div>';
    }

    var footHtml = canLoadMore
      ? '<div class="cv-foot"><button type="button" class="cv-view-all">' + STR.loadMore + '</button></div>'
      : '';

    section.setAttribute('data-screen-label', params.title);
    section.innerHTML = headHtml + tabsHtml + bodyHtml + footHtml;
  }

  function mountCategoryView(section, tabName) {
    var params = CATEGORY_PARAMS[tabName];
    if (!params) return;
    section._cvParams = params;
    section._cvState = { filter: 'All', visibleCount: params.pageSize || 10 };
    renderCategoryView(section);
  }

  /* ============================================================
   * Promos（cat-tabs）+ 動態重繪／導頁
   * ========================================================== */
  var TAB_NAMES = ['Lobby', 'Hot Games', 'Mini Games', 'Slots', 'Sports', 'Live', 'Fish', 'Promotion'];
  var TAB_PAGE = { 'Lobby': 'index.html', 'Hot Games': 'hot-games.html', 'Mini Games': 'mini-games.html', 'Slots': 'slots.html', 'Sports': 'sports.html', 'Live': 'live.html', 'Fish': 'fish.html', 'Promotion': 'promotion.html' };
  var PAGE_TO_TAB = { 'hot-games.html': 'Hot Games', 'mini-games.html': 'Mini Games', 'slots.html': 'Slots', 'live.html': 'Live', 'fish.html': 'Fish' };
  var CMS_BACKED = { 'Hot Games': 1, 'Mini Games': 1, 'Slots': 1, 'Live': 1, 'Fish': 1 };

  var catTabsEl = null, contentTarget = null, originalContentNode = null;

  function swapToCategoryView(name) {
    if (!contentTarget) return;
    var section = document.createElement('section');
    section.className = 'lobby-section';
    contentTarget.replaceWith(section);
    contentTarget = section;
    mountCategoryView(section, name);
  }

  function restoreOriginalContent() {
    if (!originalContentNode || !contentTarget) return;
    var fresh = originalContentNode.cloneNode(true);
    contentTarget.replaceWith(fresh);
    contentTarget = fresh;
  }

  function setActiveTab(name) {
    if (!catTabsEl) return;
    Array.prototype.forEach.call(catTabsEl.querySelectorAll('.cat-tab'), function (b, i) {
      b.classList.toggle('active', TAB_NAMES[i] === name);
    });
  }

  function handleCatTabClick(name) {
    if (!name) return;
    setActiveTab(name);
    if (CMS_BACKED[name]) {
      swapToCategoryView(name);
    } else if (name === 'Lobby') {
      if (CURRENT_PAGE === 'index.html') restoreOriginalContent();
      else location.href = 'index.html';
    } else {
      var target = TAB_PAGE[name];
      if (target && target !== CURRENT_PAGE) location.href = target;
    }
  }

  function initPromosAndCategoryViews() {
    catTabsEl = document.querySelector('.cat-tabs');
    if (!catTabsEl) return;
    contentTarget = catTabsEl.nextElementSibling;
    if (contentTarget) originalContentNode = contentTarget.cloneNode(true);

    var ownTab = PAGE_TO_TAB[CURRENT_PAGE];
    if (ownTab && contentTarget && CATEGORY_PARAMS[ownTab]) {
      mountCategoryView(contentTarget, ownTab);
    }
  }

  /* ============================================================
   * Hero 輪播（僅存在於 8 個 Lobby 家族頁面；直接綁定，非委派——
   * Hero 永遠在 cat-tabs 之前，不會被 Promos 動態重繪影響到）
   * ========================================================== */
  function initHero() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var len = slides.length;
    if (!len) return;
    var idx = 0;
    for (var i = 0; i < slides.length; i++) { if (slides[i].classList.contains('active')) { idx = i; break; } }
    var timer = null;

    function apply() {
      slides.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
    }
    function resetAuto() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { idx = (idx + 1) % len; apply(); }, 6500);
    }
    function next() { idx = (idx + 1) % len; apply(); resetAuto(); }
    function prev() { idx = (idx - 1 + len) % len; apply(); resetAuto(); }
    function goTo(i) { idx = i; apply(); resetAuto(); }

    var prevBtn = hero.querySelector('.hero-controls .icon-btn[aria-label="Previous"]');
    var nextBtn = hero.querySelector('.hero-controls .icon-btn[aria-label="Next"]');
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });

    var touchStartX = null;
    hero.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
      touchStartX = null;
    });

    resetAuto();
  }

  /* ============================================================
   * Rail 橫向捲動（箭頭 enable/disable 隨 scrollLeft；用 capture 階段
   * 監聽 scroll，DOM 被 Promos 重繪整個換掉也不用重新綁定）
   * ========================================================== */
  function updateRailArrows(rail) {
    var section = rail.closest('.lobby-section');
    if (!section) return;
    var arrows = section.querySelectorAll('.section-actions .arrow');
    if (arrows.length < 2) return;
    var canL = rail.scrollLeft > 4;
    var canR = rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4;
    arrows[0].disabled = !canL;
    arrows[1].disabled = !canR;
  }
  function initRails() {
    var rails = document.querySelectorAll('.rail');
    if (!rails.length) return;
    Array.prototype.forEach.call(rails, updateRailArrows);
    Array.prototype.forEach.call(document.querySelectorAll('.rail .gcard'), function (c) { c.style.cursor = 'pointer'; });
    window.addEventListener('resize', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.rail'), updateRailArrows);
    });
    document.addEventListener('scroll', function (e) {
      var t = e.target;
      if (t && t.classList && t.classList.contains('rail')) updateRailArrows(t);
    }, true);
  }

  /* ============================================================
   * Leaderboard（每 2.8s 插入一筆新紀錄，維持 10 筆，重新排名）
   * ========================================================== */
  function initLeaderboard() {
    if (!WINNERS.length) return;
    if (!document.querySelector('.leaderboard')) return;
    setInterval(function () {
      var board = document.querySelector('.leaderboard');
      if (!board) return;
      var pick = WINNERS[Math.floor(Math.random() * WINNERS.length)];
      var noise = Math.random() * 80 + 5;
      var mult = Math.random() * 50 + 1.5;
      var payout = noise * mult;
      var row = document.createElement('div');
      row.className = 'lb-row fresh';
      row.innerHTML =
        '<span class="lb-rank top">01</span>' +
        '<div class="lb-user"><div class="lb-avatar" style="--avatar-bg: linear-gradient(135deg, oklch(0.55 0.2 ' + pick.hue + '), oklch(0.4 0.18 ' + ((pick.hue + 80) % 360) + '))">' + escapeHtml(pick.avatar) + '</div>' + escapeHtml(pick.user) + '</div>' +
        '<span class="lb-game">' + escapeHtml(pick.game) + '</span>' +
        '<span class="lb-num">' + noise.toFixed(2) + '</span>' +
        '<span class="lb-num">' + mult.toFixed(2) + '×</span>' +
        '<span class="lb-payout">+' + fmtNum(payout) + '</span>';

      var head = board.querySelector('.lb-head');
      Array.prototype.forEach.call(board.querySelectorAll('.lb-row'), function (r) { r.classList.remove('fresh'); });
      if (head) head.insertAdjacentElement('afterend', row); else board.appendChild(row);

      var allRows = Array.prototype.slice.call(board.querySelectorAll('.lb-row'));
      allRows.forEach(function (r, i) {
        var rankEl = r.querySelector('.lb-rank');
        if (rankEl) { rankEl.textContent = String(i + 1).padStart(2, '0'); rankEl.classList.toggle('top', i < 3); }
      });
      for (var i = 10; i < allRows.length; i++) allRows[i].remove();
    }, 2800);
  }

  /* ============================================================
   * RewardsBanner 倒數（畫面上是 display:none，但原始元件仍持續跑
   * 計時邏輯——這裡照樣跑，純為行為對齊，不影響可視驗證）
   * PromoRibbon 時鐘（不在指定 P0/P1 清單內，但同頁常駐、成本很低，
   * 一併補上以提高整體對齊度）
   * ========================================================== */
  function initRewardsCountdown() {
    var el = document.querySelector('.rb-timer-val');
    if (!el) return;
    var h = 20, m = 33, s = 6;
    setInterval(function () {
      s -= 1;
      if (s < 0) { s = 59; m -= 1; }
      if (m < 0) { m = 59; h -= 1; }
      if (h < 0) { h = 23; }
      el.textContent = 'Next in ' + String(h).padStart(2, '0') + 'h : ' + String(m).padStart(2, '0') + 'm : ' + String(s).padStart(2, '0') + 's';
    }, 1000);
  }
  function initPromoRibbonClock() {
    var el = document.querySelector('.promo-ribbon-time');
    if (!el) return;
    var span = document.createElement('span');
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3 && n.textContent.trim()) { span.textContent = n.textContent; el.replaceChild(span, n); }
    });
    if (!span.isConnected) el.appendChild(span);
    setInterval(function () {
      var now = new Date();
      span.textContent = ' ' + [now.getHours(), now.getMinutes(), now.getSeconds()].map(function (v) { return String(v).padStart(2, '0'); }).join(':');
      el.setAttribute('datetime', now.toISOString());
    }, 1000);
  }

  /* ============================================================
   * 通用 section 收合（Rail / Leaderboard / Promotion / Providers /
   * Tournaments 共用 .section-collapse，v-show 對照為直接切換
   * inline display，無需額外 CSS）
   * ========================================================== */
  function toggleSectionCollapse(btn) {
    var section = btn.closest('.lobby-section');
    if (!section) return;
    var collapsed = section.classList.toggle('is-collapsed');
    btn.classList.toggle('active', collapsed);
    btn.setAttribute('aria-expanded', String(!collapsed));
    Array.prototype.forEach.call(section.children, function (child) {
      if (!child.classList.contains('section-head')) child.style.display = collapsed ? 'none' : '';
    });
  }

  /* ============================================================
   * 三個 Modal：GameModal / SignInModal / CustomerServiceModal
   * ========================================================== */
  function showModalEl(el) { if (el) el.style.display = ''; }
  function hideModalEl(el) { if (el) el.style.display = 'none'; }

  function gameModalHTML(game) {
    var categoryLabel = tr('t.modal.game.category.' + game.category, game.category);
    var desc = tr('t.modal.game.descTemplate', '{title} is a {category} game from {provider}. Spin volatile reels, stack multipliers, and bank wins instantly to your crypto balance. Provably fair on every round.')
      .replace('{title}', escapeHtml(game.title)).replace('{category}', escapeHtml(categoryLabel)).replace('{provider}', escapeHtml(game.provider));
    return '<div class="modal-head">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div style="font-family:var(--font-display);font-weight:700;font-size:17px">' + escapeHtml(game.title) + '</div>' +
          '<span class="gcard-provider" style="font-size:12px">' + escapeHtml(game.provider) + '</span>' +
        '</div>' +
        '<button type="button" class="modal-close" aria-label="' + escapeAttr(tr('t.modal.close', 'Close')) + '">' + CLOSE_ICON + '</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="game-modal-art">[ ' + escapeHtml(String(game.title).toUpperCase()) + ' ' + escapeHtml(tr('t.modal.game.previewSuffix', 'GAMEPLAY PREVIEW')) + ' ]</div>' +
        '<div style="color:var(--text-mid);font-size:13.5px;line-height:1.6">' + desc + '</div>' +
        '<div class="game-modal-stats">' +
          '<div class="game-modal-stat"><div class="game-modal-stat-label">' + escapeHtml(tr('t.modal.game.rtp', 'RTP')) + '</div><div class="game-modal-stat-val">' + escapeHtml(game.rtp) + '%</div></div>' +
          '<div class="game-modal-stat"><div class="game-modal-stat-label">' + escapeHtml(tr('t.modal.game.maxWin', 'Max win')) + '</div><div class="game-modal-stat-val">' + escapeHtml(game.maxWin) + '</div></div>' +
          '<div class="game-modal-stat"><div class="game-modal-stat-label">' + escapeHtml(tr('t.modal.game.volatility', 'Volatility')) + '</div><div class="game-modal-stat-val">' + escapeHtml(tr('t.modal.game.volatilityHigh', 'High')) + '</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-foot"><button type="button" class="btn">' + escapeHtml(tr('t.modal.game.demo', 'Demo')) + '</button><button type="button" class="btn primary">' + escapeHtml(tr('t.modal.game.playReal', 'Play for real →')) + '</button></div>';
  }
  function openGameModal(game) {
    var el = document.getElementById('cms-modal-game');
    if (!el) return;
    var modal = el.querySelector('.modal');
    if (modal) modal.innerHTML = gameModalHTML(game);
    showModalEl(el);
  }

  var SIGNIN_STATE = { tab: 'signin', email: 'player@100.gg', username: '' };
  function signInModalHTML(state) {
    var tab = state.tab;
    var headTitle = tab === 'forgot' ? tr('t.modal.signin.forgotPasswordTitle', 'Forgot Password') : (tab === 'signin' ? tr('t.modal.signin.welcomeBack', 'Welcome back') : tr('t.modal.signin.createAccountTitle', 'Create your account'));
    var head = '<div class="modal-head"><div style="font-family:var(--font-display);font-weight:700;font-size:17px">' + escapeHtml(headTitle) + '</div>' +
      '<button type="button" class="modal-close" aria-label="' + escapeAttr(tr('t.modal.close', 'Close')) + '">' + CLOSE_ICON + '</button></div>';
    var body;
    if (tab === 'forgot') {
      body = '<form data-role="cms-form">' +
          '<div class="field"><label>' + escapeHtml(tr('t.modal.signin.emailLabel', 'Email')) + '</label><input type="email" name="email" placeholder="' + escapeAttr(tr('t.modal.signin.resetEmailPlaceholder', 'Enter your email')) + '" value="' + escapeAttr(state.email) + '"></div>' +
          '<button type="submit" class="reset-btn">' + escapeHtml(tr('t.modal.signin.sendResetLink', 'Send Reset Link')) + '</button>' +
          '<div class="signin-foot">' + escapeHtml(tr('t.modal.signin.rememberPassword', 'Remember your password?')) + ' <a href="#" data-tab="signin">' + escapeHtml(tr('t.modal.signin.backToLogin', 'Back to Login')) + '</a></div>' +
        '</form>';
    } else {
      body = '<div class="signin-tabs">' +
          '<button type="button" class="signin-tab' + (tab === 'signin' ? ' active' : '') + '" data-tab="signin">' + escapeHtml(tr('t.modal.signin.signInTab', 'Sign in')) + '</button>' +
          '<button type="button" class="signin-tab' + (tab === 'register' ? ' active' : '') + '" data-tab="register">' + escapeHtml(tr('t.nav.Register', 'Register')) + '</button>' +
        '</div>' +
        '<form data-role="cms-form">' +
          (tab === 'register' ? '<div class="field"><label>' + escapeHtml(tr('t.modal.signin.usernameLabel', 'Username')) + '</label><input name="username" placeholder="player_one" value="' + escapeAttr(state.username) + '"></div>' : '') +
          '<div class="field"><label>' + escapeHtml(tr('t.modal.signin.emailLabel', 'Email')) + '</label><input type="email" name="email" placeholder="you@email.com" value="' + escapeAttr(state.email) + '"></div>' +
          '<div class="field"><label>' + escapeHtml(tr('t.modal.signin.passwordLabel', 'Password')) + '</label><input type="password" name="pw" placeholder="••••••••"></div>' +
          (tab === 'register' ? '<div class="field"><label style="display:flex;align-items:center;gap:8px;color:var(--text-mid)"><input type="checkbox" checked style="margin:0"><span style="font-size:12px">' + escapeHtml(tr('t.modal.signin.ageTerms', "I'm 18+ and accept the Terms")) + '</span></label></div>' : '') +
          '<button type="submit" class="btn primary" style="width:100%;padding:12px;margin-top:6px">' + escapeHtml(tab === 'signin' ? tr('t.modal.signin.signInSubmit', 'Sign in →') : tr('t.modal.signin.createAccountSubmit', 'Create account →')) + '</button>' +
        '</form>' +
        '<div class="signin-foot">' + (tab === 'signin'
          ? escapeHtml(tr('t.modal.signin.noAccount', 'No account?')) + ' <a href="#" data-tab="register">' + escapeHtml(tr('t.nav.Register', 'Register')) + '</a> · <a href="#" data-tab="forgot">' + escapeHtml(tr('t.modal.signin.forgot', 'Forgot?')) + '</a>'
          : escapeHtml(tr('t.modal.signin.alreadyPlayer', 'Already a player?')) + ' <a href="#" data-tab="signin">' + escapeHtml(tr('t.modal.signin.signInTab', 'Sign in')) + '</a>') + '</div>';
    }
    return head + '<div class="modal-body">' + body + '</div>';
  }
  function renderSignInModal() {
    var el = document.getElementById('cms-modal-signin');
    if (!el) return;
    var modal = el.querySelector('.modal');
    if (modal) modal.innerHTML = signInModalHTML(SIGNIN_STATE);
  }
  function openSignInModal(tab) {
    SIGNIN_STATE.tab = tab || 'signin';
    renderSignInModal();
    showModalEl(document.getElementById('cms-modal-signin'));
  }
  function captureSignInFormValues() {
    var el = document.getElementById('cms-modal-signin');
    if (!el) return;
    var emailInp = el.querySelector('input[name="email"]');
    var userInp = el.querySelector('input[name="username"]');
    if (emailInp) SIGNIN_STATE.email = emailInp.value;
    if (userInp) SIGNIN_STATE.username = userInp.value;
  }

  function initCustomerServiceFab() {
    if (!document.getElementById('cms-modal-customerservice')) return;
    if (document.querySelector('.cms-cs-fab')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tb-icon-btn cms-cs-fab';
    btn.setAttribute('aria-label', '客服中心');
    btn.setAttribute('title', '客服中心');
    btn.setAttribute('data-action', 'open-cs');
    btn.innerHTML = MENU_ICONS.cs;
    document.body.appendChild(btn);
  }

  /* ============================================================
   * TopBar：登入/登出、頭像選單、外觀（skin）選單、餘額浮動
   * ========================================================== */
  var SKINS = [
    { id: 'white', label: 'Pearl Signature', theme: 'light', swatch: '#4d4941', surface: '#f5f2e9' },
    { id: 'sage-atelier', label: 'Sage Atelier', theme: 'light', swatch: '#9ab7ac', surface: '#ecefe9' },
    { id: 'night-esports-green', label: 'Emerald Nocturne', theme: 'dark', swatch: '#9fe2d1', surface: '#0d1316' },
    { id: 'arctic-cyan', label: 'Arctic Cyan', theme: 'dark', swatch: '#62c8d8', surface: '#071116' },
    { id: 'midnight-gold', label: 'Midnight Gold', theme: 'dark', swatch: '#d2b465', surface: '#080d16' },
    { id: 'obsidian-copper', label: 'Obsidian Copper', theme: 'dark', swatch: '#d8a06b', surface: '#0d0e0f' },
    { id: 'crimson-noir', label: 'Crimson Noir', theme: 'dark', swatch: '#df7b89', surface: '#11090d' },
    { id: 'blue', label: 'Sapphire Royale', theme: 'dark', swatch: '#2473ff', surface: '#05080f' },
    { id: 'cosmic-spectrum-purple', label: 'Cosmic Amethyst', theme: 'dark', swatch: '#6a48ff', surface: '#0b0a25' }
  ];
  var currentSkinId = 'blue';

  function findSkin(id) {
    for (var i = 0; i < SKINS.length; i++) if (SKINS[i].id === id) return SKINS[i];
    return null;
  }
  function applySkin(id, silent) {
    var skin = findSkin(id) || findSkin('blue');
    document.documentElement.setAttribute('data-skin', skin.id);
    document.documentElement.setAttribute('data-theme', skin.theme);
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--accent-2');
    document.documentElement.style.removeProperty('--accent-3');
    currentSkinId = skin.id;
    if (!silent) {
      try { localStorage.setItem('cms_theme', skin.theme); localStorage.setItem('cms_skin', skin.id); } catch (e) {}
    }
    var menu = document.querySelector('.tb-skin-menu');
    if (menu) renderSkinMenu(menu);
  }
  function restoreSkin() {
    var saved = null;
    try {
      var savedTheme = localStorage.getItem('cms_theme');
      var savedSkin = localStorage.getItem('cms_skin');
      if (savedTheme || savedSkin) {
        saved = (savedTheme === 'light' && (!savedSkin || savedSkin === 'blue')) ? 'white' : savedSkin;
      }
    } catch (e) {}
    if (saved && findSkin(saved)) applySkin(saved, true);
    else currentSkinId = document.documentElement.getAttribute('data-skin') || 'blue';
    /* useTweaks.js applies TWEAK_DEFAULTS.aspect (1.1) as --card-aspect on every
       boot; without it the cards fall back to main.css's 0.74 and render ~75px
       taller than the Vue reference. */
    document.documentElement.style.setProperty('--card-aspect', '1.1');
  }
  function renderSkinMenu(menu) {
    menu.className = 'tb-skin-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', 'Skin');
    menu.innerHTML = SKINS.map(function (s) {
      var active = s.id === currentSkinId;
      return '<button type="button" class="tb-skin-option' + (active ? ' active' : '') + '" role="option" aria-selected="' + active + '" data-skin="' + s.id + '">' +
        '<span class="tb-skin-swatch" style="--skin-color:' + s.swatch + ';--skin-surface:' + s.surface + '" aria-hidden="true"></span>' +
        '<span class="tb-skin-label">' + escapeHtml(s.label) + '</span>' +
        (active ? CHECK_ICON : '') +
      '</button>';
    }).join('');
  }
  function closeSkinMenu() {
    var m = document.querySelector('.tb-skin-menu'); if (m) m.remove();
    var trig = document.querySelector('.tb-skin-trigger'); if (trig) trig.setAttribute('aria-expanded', 'false');
  }
  function toggleSkinMenu(trigger) {
    var wrap = trigger.closest('.tb-skin-wrap');
    if (!wrap) return;
    var existing = wrap.querySelector('.tb-skin-menu');
    if (existing) { closeSkinMenu(); return; }
    closeUserMenu();
    var menu = document.createElement('div');
    wrap.appendChild(menu);
    renderSkinMenu(menu);
    trigger.setAttribute('aria-expanded', 'true');
  }

  var USER = { loggedIn: true, name: 'PlayerOne', email: 'player@100.gg' };
  var BALANCE = 1284.32;

  function loggedOutHTML() {
    return '<button type="button" class="btn" data-action="open-signin">登入</button>' +
      '<button type="button" class="btn primary" data-action="open-signin">註冊</button>';
  }
  function loggedInHTML() {
    var initials = escapeHtml(USER.name.slice(0, 2).toUpperCase());
    return '<div class="tb-balance"><div class="tb-balance-rows">' +
        '<div class="tb-balance-row"><span class="tb-balance-label">餘額：</span><span class="tb-balance-num">' + fmtNum(BALANCE) + '</span></div>' +
        '<div class="tb-balance-row"><span class="tb-balance-label">點數：</span><span class="tb-balance-num">0.00</span></div>' +
      '</div></div>' +
      '<div class="tb-user-wrap">' +
        '<button type="button" class="tb-user-circle" aria-label="帳戶"><span class="tb-avatar circle">' + initials + '</span><span class="tb-tier-badge" aria-hidden="true">' + TIER_ICON + '</span></button>' +
      '</div>';
  }
  function setAuthSection(html) {
    var headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;
    var skinWrap = headerActions.querySelector('.tb-skin-wrap');
    var node = skinWrap ? skinWrap.nextSibling : headerActions.firstChild;
    while (node) { var next = node.nextSibling; headerActions.removeChild(node); node = next; }
    headerActions.insertAdjacentHTML('beforeend', html);
  }
  function renderAuthSection() { setAuthSection(USER.loggedIn ? loggedInHTML() : loggedOutHTML()); }

  function userMenuHTML() {
    var initials = escapeHtml(USER.name.slice(0, 2).toUpperCase());
    var items = [
      { label: '個人資料', href: 'personal-info.html', icon: MENU_ICONS.person },
      { label: '變更登入密碼', href: 'security-center.html', icon: MENU_ICONS.lock },
      { label: '變更交易密碼', href: 'security-center.html', icon: MENU_ICONS.key },
      { label: '銀行資料', href: 'withdrawal.html', icon: MENU_ICONS.card }
    ];
    var itemsHtml = items.map(function (it) {
      return '<a href="' + it.href + '" class="tb-menu-item tb-menu-item-2l"><span class="tb-menu-ico">' + it.icon + '</span>' +
        '<span class="tb-menu-2l-text"><span class="tb-menu-2l-name">' + it.label + '</span></span></a>';
    }).join('');
    return '<div class="tb-menu">' +
        '<div class="tb-menu-head"><div class="tb-avatar lg">' + initials + '</div><div><div class="tb-menu-name">' + escapeHtml(USER.name) + '</div><div class="tb-menu-email">' + escapeHtml(USER.email) + '</div></div></div>' +
        itemsHtml +
        '<div class="tb-menu-sep"></div>' +
        '<button type="button" class="tb-menu-item logout tb-menu-item-2l" data-action="logout"><span class="tb-menu-ico">' + MENU_ICONS.logout + '</span><span class="tb-menu-2l-text"><span class="tb-menu-2l-name">登出</span></span></button>' +
      '</div>';
  }
  function closeUserMenu() { var m = document.querySelector('.tb-menu'); if (m) m.remove(); }
  function toggleUserMenu(circleBtn) {
    var existing = document.querySelector('.tb-menu');
    if (existing) { closeUserMenu(); return; }
    closeSkinMenu();
    var wrap = circleBtn.closest('.tb-user-wrap');
    if (wrap) wrap.insertAdjacentHTML('beforeend', userMenuHTML());
  }

  function doLogout() {
    USER.loggedIn = false;
    renderAuthSection();
    closeUserMenu();
  }
  function doLogin(name, email) {
    USER.loggedIn = true;
    USER.name = name || 'player';
    USER.email = email || 'player@100.gg';
    renderAuthSection();
    hideModalEl(document.getElementById('cms-modal-signin'));
  }

  function initBalanceFloat() {
    if (!document.querySelector('.tb-balance-rows')) return;
    setInterval(function () {
      if (!USER.loggedIn) return;
      BALANCE = +(BALANCE + (Math.random() * 4 - 1.7)).toFixed(2);
      var el = document.querySelector('.tb-balance-rows .tb-balance-row:first-child .tb-balance-num');
      if (el) el.textContent = fmtNum(BALANCE);
    }, 5500);
  }

  /* ============================================================
   * 手機底部導覽 Browse 按鈕 <-> 側欄遮罩
   * ========================================================== */
  function initMobileNav() {
    var browseBtn = document.querySelector('.mobile-nav .mnav-btn:not([href])');
    var shell = document.querySelector('.shell');
    if (browseBtn && shell) {
      browseBtn.addEventListener('click', function () { shell.classList.toggle('mobile-open'); });
    }
    var backdrop = document.querySelector('.sidebar-backdrop');
    if (backdrop && shell) {
      backdrop.addEventListener('click', function () { shell.classList.remove('mobile-open'); });
    }
  }

  /* ============================================================
   * 全域委派點擊（大部分互動走這裡；DOM 被整段換掉也不必重新綁定）
   * ========================================================== */
  function onDocumentClick(e) {
    var t = e.target;

    var closeBtn = t.closest('.modal-close');
    if (closeBtn) { var bg = closeBtn.closest('.modal-bg'); if (bg) { if (bg.hasAttribute('data-transient')) bg.remove(); else hideModalEl(bg); } return; }
    if (t.classList && t.classList.contains('modal-bg')) { if (t.hasAttribute('data-transient')) t.remove(); else hideModalEl(t); return; }
    var dialogCloseBtn = t.closest('[data-dialog-close]');
    if (dialogCloseBtn) { var dcbg = dialogCloseBtn.closest('.modal-bg'); if (dcbg) dcbg.remove(); return; }
    var gmFootBtn = t.closest('#cms-modal-game .modal-foot .btn');
    if (gmFootBtn) { hideModalEl(document.getElementById('cms-modal-game')); return; }

    var openSignin = t.closest('[data-action="open-signin"]');
    if (openSignin) { openSignInModal('signin'); return; }
    var openCs = t.closest('[data-action="open-cs"]');
    if (openCs) { showModalEl(document.getElementById('cms-modal-customerservice')); return; }
    var logoutBtn = t.closest('[data-action="logout"]');
    if (logoutBtn) { doLogout(); return; }

    var userCircle = t.closest('.tb-user-circle');
    if (userCircle) { toggleUserMenu(userCircle); return; }
    var skinTrigger = t.closest('.tb-skin-trigger');
    if (skinTrigger) { toggleSkinMenu(skinTrigger); return; }
    var skinOption = t.closest('.tb-skin-option');
    if (skinOption) { applySkin(skinOption.getAttribute('data-skin')); closeSkinMenu(); return; }
    var langTrigger = t.closest('.sb-lang');
    if (langTrigger) { toggleLangMenu(langTrigger); return; }
    var langItem = t.closest('.sb-lang-item');
    if (langItem) { var loc = langItem.getAttribute('data-locale'); closeLangMenu(); if (loc) setLocale(loc); return; }

    var collapseSidebarBtn = t.closest('.sb-collapse-account, .sb-collapse-money');
    if (collapseSidebarBtn) { var shell1 = document.querySelector('.shell'); if (shell1) shell1.classList.add('collapsed'); return; }
    var expandSidebarBtn = t.closest('.sb-collapse-compact');
    if (expandSidebarBtn) { var shell2 = document.querySelector('.shell'); if (shell2) shell2.classList.remove('collapsed'); return; }

    var sectionToggleBtn = t.closest('.sb-section-toggle');
    if (sectionToggleBtn) {
      var sec = sectionToggleBtn.closest('.sb-section');
      var itemsWrap = sec ? sec.querySelector('.sb-section-items') : null;
      var nowCollapsed = sectionToggleBtn.classList.toggle('collapsed');
      sectionToggleBtn.setAttribute('aria-expanded', String(!nowCollapsed));
      if (itemsWrap) itemsWrap.style.display = nowCollapsed ? 'none' : '';
      return;
    }

    var backToTopBtn = t.closest('.footer-min-logo');
    if (backToTopBtn) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var apBackBtn = t.closest('.ap-back');
    if (apBackBtn) { location.href = 'account-overview.html'; return; }
    var outlineBackBtn = t.closest('.ap-btn-wide.outline');
    if (outlineBackBtn && outlineBackBtn.textContent.trim() === 'Back') { location.href = 'account-overview.html'; return; }

    var sectionCollapseBtn = t.closest('.section-collapse');
    if (sectionCollapseBtn) { toggleSectionCollapse(sectionCollapseBtn); return; }

    var arrowBtn = t.closest('.rail-wrap .arrow, .section-actions .arrow');
    if (arrowBtn && !arrowBtn.disabled) {
      var wrap = arrowBtn.closest('.lobby-section');
      var rail = wrap ? wrap.querySelector('.rail') : null;
      if (rail) {
        var dir = arrowBtn.getAttribute('aria-label') === 'Scroll left' ? -1 : 1;
        rail.scrollBy({ left: dir * rail.clientWidth * 0.85, behavior: 'smooth' });
      }
      return;
    }

    var seeAllLink = t.closest('.lobby-section-list .see-all');
    if (seeAllLink) {
      e.preventDefault();
      var links = Array.prototype.slice.call(document.querySelectorAll('.lobby-section-list .see-all'));
      var idx = links.indexOf(seeAllLink);
      var seeAllName = ['Slots', 'Live'][idx];
      if (seeAllName) handleCatTabClick(seeAllName);
      return;
    }

    var catTab = t.closest('.cat-tabs .cat-tab');
    if (catTab && catTabsEl) {
      var tabs = Array.prototype.slice.call(catTabsEl.querySelectorAll('.cat-tab'));
      handleCatTabClick(TAB_NAMES[tabs.indexOf(catTab)]);
      return;
    }

    var cvTab = t.closest('.cv-tab');
    if (cvTab) {
      var cvSection = cvTab.closest('.lobby-section');
      if (cvSection && cvSection._cvParams) {
        cvSection._cvState.filter = cvTab.getAttribute('data-filter');
        cvSection._cvState.visibleCount = cvSection._cvParams.pageSize || 10;
        renderCategoryView(cvSection);
      }
      return;
    }
    var loadMoreBtn = t.closest('.cv-view-all');
    if (loadMoreBtn) {
      var lmSection = loadMoreBtn.closest('.lobby-section');
      if (lmSection && lmSection._cvParams) {
        lmSection._cvState.visibleCount += (lmSection._cvParams.pageSize || 10);
        renderCategoryView(lmSection);
      }
      return;
    }

    var favBtn = t.closest('.gcard-fav');
    if (favBtn) {
      var favCard = favBtn.closest('.gcard');
      var favGame = resolveGameFromCard(favCard);
      toggleFav(favGame.id);
      var nowFav = isFav(favGame.id);
      favBtn.classList.toggle('on', nowFav);
      favBtn.setAttribute('aria-label', nowFav ? 'Remove favorite' : 'Add favorite');
      favBtn.innerHTML = gcardHeartSvg(nowFav);
      return;
    }
    var gcard = t.closest('.gcard');
    if (gcard) { openGameModal(resolveGameFromCard(gcard)); return; }

    var signinTabBtn = t.closest('#cms-modal-signin .signin-tab');
    if (signinTabBtn) { captureSignInFormValues(); SIGNIN_STATE.tab = signinTabBtn.getAttribute('data-tab'); renderSignInModal(); return; }
    var signinTabLink = t.closest('#cms-modal-signin [data-tab]');
    if (signinTabLink) { e.preventDefault(); captureSignInFormValues(); SIGNIN_STATE.tab = signinTabLink.getAttribute('data-tab'); renderSignInModal(); return; }

    // 外部點擊關閉下拉選單（放在具體 trigger 判斷之後，才不會一開就被自己關掉）
    var openMenu = document.querySelector('.tb-menu');
    if (openMenu && !t.closest('.tb-user-wrap')) closeUserMenu();
    var openSkin = document.querySelector('.tb-skin-menu');
    if (openSkin && !t.closest('.tb-skin-wrap')) closeSkinMenu();
    var openLang = document.querySelector('.sb-lang-menu');
    if (openLang && !t.closest('.sb-lang-wrap')) closeLangMenu();

    // 其餘裝飾用 href="#"（尚未特化處理者）避免跳頁
    var hashLink = t.closest('a[href="#"]');
    if (hashLink) { e.preventDefault(); return; }
  }

  function onDocumentSubmit(e) {
    var form = e.target;
    if (!form || !form.closest || !form.closest('#cms-modal-signin')) return;
    e.preventDefault();
    var emailInp = form.querySelector('input[name="email"]');
    var userInp = form.querySelector('input[name="username"]');
    var email = emailInp ? emailInp.value : '';
    var username = userInp ? userInp.value : '';
    var name = (SIGNIN_STATE.tab === 'register' && username) ? username : ((email.split('@')[0]) || 'player');
    doLogin(name, email || 'player@100.gg');
  }

  function onDocumentKeydown(e) {
    if (e.key !== 'Escape') return;
    hideModalEl(document.getElementById('cms-modal-game'));
    hideModalEl(document.getElementById('cms-modal-signin'));
    hideModalEl(document.getElementById('cms-modal-customerservice'));
    var transientDialog = document.querySelector('.modal-bg[data-transient]');
    if (transientDialog) transientDialog.remove();
    closeUserMenu();
    closeSkinMenu();
    closeLangMenu();
  }

  /* ============================================================
   * 共用小工具：頁面內一次性對話框（confirm / success / warning），
   * 與既有三個常駐 modal 不同——用完即從 DOM 移除，不重複佔位。
   * ========================================================== */
  function showDialog(bodyHtml, extraClass) {
    var bg = document.createElement('div');
    bg.className = 'modal-bg' + (extraClass ? ' ' + extraClass : '');
    bg.setAttribute('data-transient', '1');
    bg.innerHTML = bodyHtml;
    document.body.appendChild(bg);
    return bg;
  }
  function resultDialogHTML(type, title, message, extraBtnHtml) {
    var warn = type !== 'success';
    var icon = warn
      ? '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v6M12 17h.01"/></svg>'
      : '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
    return '<div class="pi-success" data-dialog-panel>' +
        '<div class="pi-success-check' + (warn ? ' warn' : '') + '">' + icon + '</div>' +
        '<div class="pi-success-title">' + escapeHtml(title) + '</div>' +
        (message ? '<div class="pi-success-sub">' + escapeHtml(message) + '</div>' : '') +
        '<button type="button" class="ap-btn-wide ap-grad" data-dialog-close>' + (warn ? 'Got It' : 'Continue') + '</button>' +
        (extraBtnHtml || '') +
      '</div>';
  }

  /* ============================================================
   * Sidebar：選單分組收合(sb-section-toggle) / 語言選單(sb-lang，
   * 目前僅中文一種語系，誠實呈現單一已選項，不捏造多語系資料)
   * ========================================================== */
  function renderLangMenu(menu) {
    menu.className = 'sb-lang-menu';
    menu.setAttribute('role', 'listbox');
    var langs = I18N.LANGS || { zh: { label: '中文' } };
    menu.innerHTML = Object.keys(langs).map(function (key) {
      var active = key === LOCALE;
      return '<button type="button" class="sb-lang-item' + (active ? ' active' : '') + '"' +
        ' role="option" aria-selected="' + (active ? 'true' : 'false') + '" data-locale="' + key + '">' +
        '<span class="sb-flag" aria-hidden="true"></span><span>' + escapeHtml(langs[key].label) + '</span>' +
        (active ? CHECK_ICON : '') + '</button>';
    }).join('');
  }
  function closeLangMenu() { var m = document.querySelector('.sb-lang-menu'); if (m) m.remove(); }
  function toggleLangMenu(trigger) {
    var wrap = trigger.closest('.sb-lang-wrap');
    if (!wrap) return;
    var existing = wrap.querySelector('.sb-lang-menu');
    if (existing) { closeLangMenu(); return; }
    closeUserMenu(); closeSkinMenu();
    var menu = document.createElement('div');
    wrap.appendChild(menu);
    renderLangMenu(menu);
  }

  /* ============================================================
   * Account Overview：暱稱編輯 / 餘額 refresh 動畫 / 銀行卡輪播＋刪除確認 /
   * 快速動作導覽 — 1:1 對照 vue3-app AccountOverview.vue（3 張銀行卡資料是
   * 原元件內寫死的展示資料並非本次新增，delete 確認框樣板同樣照搬原始碼）
   * ========================================================== */
  var ACCOUNT_BANKS = [
    { bank: 'KB Bank', num: '**** **** **** 1234' },
    { bank: 'Shinhan Bank', num: '**** **** **** 5678' },
    { bank: 'Woori Bank', num: '**** **** **** 9012' }
  ];
  function initAccountOverviewPage() {
    var bankHead = document.querySelector('.ap-bank-head');
    var panel = bankHead ? bankHead.closest('.ap-panel') : null;
    if (!panel) return;
    var bankIdx = 0;
    var banks = ACCOUNT_BANKS.slice();

    function renderBanks() {
      var countEl = panel.querySelector('.ap-bank-count');
      var rows = panel.querySelectorAll('.ap-bank-row');
      if (!banks.length) {
        if (rows[0]) rows[0].outerHTML = '<div class="ap-bank-empty">No bank accounts yet.</div>';
        var navEl = panel.querySelector('.ap-bank-nav'); if (navEl) navEl.style.display = 'none';
        return;
      }
      var b = banks[bankIdx];
      if (countEl) countEl.textContent = (bankIdx + 1) + '/' + banks.length;
      if (rows[0]) { var numEl = rows[0].querySelector('.ap-bank-num'); if (numEl) numEl.textContent = b.num; }
      if (rows[1]) { var nameEl = rows[1].querySelector('span'); if (nameEl) nameEl.textContent = b.bank; }
    }
    function openDeleteConfirm() {
      var b = banks[bankIdx];
      if (!b) return;
      var dlg = showDialog(
        '<div class="confirm-dialog" data-dialog-panel>' +
          '<div class="confirm-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg></div>' +
          '<div class="confirm-title">Delete Account?</div>' +
          '<div class="confirm-sub">Are you sure you want to remove <strong>' + escapeHtml(b.bank) + '</strong>? This action cannot be undone.</div>' +
          '<div class="confirm-actions">' +
            '<button type="button" class="ap-btn-wide outline" data-dialog-close>Cancel</button>' +
            '<button type="button" class="ap-btn-wide confirm-del-btn" data-action="confirm-delete-bank">Delete</button>' +
          '</div>' +
        '</div>'
      );
      var delConfirmBtn = dlg.querySelector('[data-action="confirm-delete-bank"]');
      if (delConfirmBtn) delConfirmBtn.addEventListener('click', function () {
        banks.splice(bankIdx, 1);
        bankIdx = Math.max(0, bankIdx - 1);
        renderBanks();
        dlg.remove();
      });
    }

    var arrows = panel.querySelectorAll('.ap-bank-arrow');
    if (arrows[0]) arrows[0].addEventListener('click', function () { bankIdx = (bankIdx - 1 + banks.length) % banks.length; renderBanks(); });
    if (arrows[1]) arrows[1].addEventListener('click', function () { bankIdx = (bankIdx + 1) % banks.length; renderBanks(); });
    var delBtn = panel.querySelector('.ap-bank-del');
    if (delBtn) delBtn.addEventListener('click', openDeleteConfirm);

    Array.prototype.forEach.call(document.querySelectorAll('.ap-panel .ap-btn'), function (btn) {
      var label = btn.textContent.trim();
      if (label === 'Deposit') btn.addEventListener('click', function () { location.href = 'deposit.html'; });
      if (label === 'Withdraw') btn.addEventListener('click', function () { location.href = 'withdrawal.html'; });
    });

    var pencilBtn = document.querySelector('.ap-pencil');
    if (pencilBtn) pencilBtn.addEventListener('click', function () {
      var nickWrap = pencilBtn.closest('.ap-hero-nick');
      var nickEl = nickWrap ? nickWrap.querySelector('span:not(.muted)') : null;
      var cur = nickEl ? nickEl.textContent.trim() : '';
      var next = window.prompt('Nickname', cur);
      if (next && next.trim() && nickEl) nickEl.textContent = next.trim();
    });
    var refreshBtn = document.querySelector('.ap-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', function () {
      refreshBtn.classList.add('spinning');
      setTimeout(function () { refreshBtn.classList.remove('spinning'); }, 700);
    });

    var addBankLink = document.querySelector('.ap-add-bank');
    if (addBankLink) addBankLink.addEventListener('click', function (e) { e.preventDefault(); location.href = 'withdrawal.html'; });
    var viewMoreLink = document.querySelector('.ap-view-more');
    if (viewMoreLink) viewMoreLink.addEventListener('click', function (e) { e.preventDefault(); location.href = 'account-record.html'; });
  }

  /* ============================================================
   * Security Center：sc-item 導覽（對照 SecurityCenter.vue items[].go /
   * .logout；'Change Login Password'/'Change Transaction Password' 兩項
   * 原始碼本身也未定義去向，維持無動作)
   * ========================================================== */
  function initSecurityCenterPage() {
    var items = document.querySelectorAll('.sc-item');
    if (!items.length) return;
    var GO_MAP = { 'Personal Info': 'personal-info.html', 'Banking Details': 'withdrawal.html' };
    Array.prototype.forEach.call(items, function (btn) {
      var nameEl = btn.querySelector('.sc-item-name');
      var name = nameEl ? nameEl.textContent.trim() : '';
      if (name === 'Logout') { btn.addEventListener('click', doLogout); return; }
      var target = GO_MAP[name];
      if (target) btn.addEventListener('click', function () { location.href = target; });
    });
  }

  /* ============================================================
   * Personal Info：Submit -> success 對話框（樣板取自 PersonalInfo.vue
   * 的 v-if="done" 區塊，原始碼本身無實際存檔動作，僅顯示成功訊息）
   * ========================================================== */
  function initPersonalInfoPage() {
    var card = document.querySelector('.pi-card');
    if (!card) return;
    var submitBtn = card.querySelector('.ap-btn-wide.ap-grad');
    if (!submitBtn) return;
    submitBtn.addEventListener('click', function () {
      showDialog(resultDialogHTML('success', 'Success!', 'Profile updated successfully.'));
    });
  }

  /* ============================================================
   * Record 系列頁面（5 頁共用元件 RecordTable.vue）：
   *  - 狀態篩選：純 DOM 顯示/隱藏（所有列本來就已完整渲染在畫面上，
   *    對照原始碼 rows computed 也只是篩選同一份固定資料，無需另外複製資料）
   *  - 日期欄位點擊喚出原生日期選擇器（tryPicker 對照）
   *  - 自動刷新倒數（Deposit/Withdrawal/Profit and Loss 三種類型才有）
   *  - rec-confirm 按鈕原始碼本身也未接任何動作（日期範圍從未真的套用到
   *    rows 篩選），維持現狀，不捏造篩選邏輯
   * ========================================================== */
  function initRecordPage() {
    var table = document.querySelector('.rec-table');
    if (!table) return;

    var statusBtn = document.querySelector('.rec-status-btn');
    if (statusBtn) {
      var wrap = statusBtn.closest('.rec-status-wrap');
      var closeStatusMenu = function () { var m = wrap.querySelector('.rec-status-menu'); if (m) m.remove(); };
      var applyStatusFilter = function (val) {
        Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
          if (val === 'All') { tr.style.display = ''; return; }
          var pill = tr.querySelector('.rec-pill');
          tr.style.display = (pill && pill.textContent.trim() === val) ? '' : 'none';
        });
        statusBtn.textContent = 'Status : ' + val;
      };
      statusBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var existing = wrap.querySelector('.rec-status-menu');
        if (existing) { closeStatusMenu(); return; }
        var menu = document.createElement('div');
        menu.className = 'rec-status-menu';
        menu.innerHTML = ['All', 'Pending', 'Approved', 'Rejected'].map(function (s) {
          return '<button type="button" class="rec-status-opt" data-status="' + s + '">' + s + '</button>';
        }).join('');
        wrap.appendChild(menu);
        menu.addEventListener('click', function (e2) {
          var opt = e2.target.closest('.rec-status-opt');
          if (!opt) return;
          applyStatusFilter(opt.getAttribute('data-status'));
          closeStatusMenu();
        });
      });
      document.addEventListener('click', function (e) { if (!e.target.closest('.rec-status-wrap')) closeStatusMenu(); });
    }

    Array.prototype.forEach.call(document.querySelectorAll('.rec-date-cell'), function (cell) {
      cell.addEventListener('click', function () {
        var inp = cell.querySelector('input');
        if (!inp) return;
        try { inp.showPicker(); } catch (e) { inp.focus(); }
      });
    });

    var refreshBtn = document.querySelector('.rec-refresh-btn');
    if (refreshBtn) {
      var secEl = refreshBtn.parentElement ? refreshBtn.parentElement.querySelector('strong') : null;
      var secs = secEl ? (parseInt(secEl.textContent, 10) || 20) : 20;
      setInterval(function () {
        secs = secs <= 1 ? 20 : secs - 1;
        if (secEl) secEl.textContent = String(secs);
      }, 1000);
      refreshBtn.addEventListener('click', function () { secs = 20; if (secEl) secEl.textContent = String(secs); });
    }
  }

  /* ============================================================
   * Support 頁：9 個分頁 + FAQ 手風琴 + Exclusion turnover list 篩選。
   * 內容逐字取自 vue3-app SupportPage.vue 的 SUP_CONTENT / EXCLUSION /
   * FAQ_GROUPS（純文字資料搬移，非新增資料模型）。
   * ========================================================== */
  var SUP_CONTENT = {
    Support: [{ panel: 'Please contact our Customer Center.', body: [] }],
    Notice: [
      { panel: 'Urgent Notice — 100% Official Telegram Change.', body: [
        { p: 'Impersonators pretending to be 100% are increasing.\n100% provides guidance through only one official Telegram. If there is any problem with the existing Telegram, we will only provide guidance through this channel or live chat.' },
        { p: '100% Official Telegram notice room: https://t.me/100kor' },
        { p: 'If you cannot reach us through the existing Telegram, please verify through live chat that it is not an impersonator before proceeding with your inquiry.' }
      ]},
      { panel: 'How to inquire about deposit accounts', body: [
        { p: 'For deposit account inquiries, please contact us via live chat or the Customer Center Telegram after signing up.' }
      ]}
    ],
    About: [{ panel: 'About 100%', body: [
      { p: '100% is legally registered as a sportsbook, online betting, and casino operator, and holds a license issued by the relevant authorities.' },
      { p: '100% provides the best products and services to users around the world and has established itself as one of the most popular sites.' }
    ]}],
    Privacy: [
      { panel: 'Privacy Policy', body: [
        { p: 'This policy describes how the information and data you provide to 100% are used between 100% and the customer.' },
        { p: 'By submitting your information and using the site, you consent to the use of your information in accordance with this Privacy Policy.' }
      ]},
      { panel: 'Information Collection & Use', body: [
        { p: 'We collect, use, and dispose of information and data about you, including the following:' },
        { ol: ['All information you create and submit by email or on the website;', 'Transaction history related to the website;', 'Details of your site visits, such as traffic data and location data.'] }
      ]}
    ],
    Info: [{ panel: 'Additional Notes', body: [
      { p: '100% is not responsible for the content or accuracy of internal or external websites.\nAll information provided by the company is based on fact. The company reserves the right to correct obvious errors.' }
    ]}],
    Addiction: [
      { panel: 'Preventing Gaming Addiction', body: [
        { p: '100% encourages members to enjoy gaming while also preventing gaming addiction.' },
        { ul: ['Self-assessment', 'Betting management', 'Deposit limit management', 'Child protection', 'Help & suggestions'] }
      ]},
      { panel: 'Deposit Limit Management', body: [
        { p: 'If you wish to change or lower your deposit limit, please contact a customer agent via live chat.' }
      ]},
      { panel: 'Help & Suggestions', body: [
        { p: 'GamCare — 0808 8020 133 (free call in the UK) or www.gamcare.org.uk' },
        { p: 'GambleAware — www.gambleaware.org' },
        { p: 'Gamblers Anonymous — www.gamblersanonymous.org' }
      ]}
    ],
    Rules: [
      { panel: 'Rules & Regulations', body: [
        { p: 'We at 100% strictly penalize members who sign up with the intent to use the site through abnormal methods. If a member is deemed to be in violation of the stated rules, 100% has the right to confiscate the member’s account without prior warning.' }
      ]},
      { panel: 'Deposit & Withdrawal', body: [
        { ul: [
          'If you deposit to the wrong account without confirming beforehand, 100% accepts no responsibility for that amount.',
          'Deposit and withdrawal requests can only be made with account information registered under your own name.',
          'To prevent illegal money laundering and financial fraud, the full deposit amount must be wagered before withdrawal is possible.'
        ]}
      ]}
    ]
  };
  var SUP_EXCLUSION = [
    { name: 'Sicbo', type: 'Slot', vendor: 'AG', pct: '100%' },
    { name: 'Ema Black Jack D21', type: 'Live', vendor: 'AG', pct: '100%' },
    { name: '1000 Diamond Bet Roulette', type: 'Slot', vendor: 'PT', pct: '100%' },
    { name: 'Lightning Roulette', type: 'Live', vendor: 'EVO', pct: '100%' },
    { name: 'Crazy Time', type: 'Live', vendor: 'EVO', pct: '100%' },
    { name: 'Sweet Bonanza', type: 'Slot', vendor: 'PP', pct: '50%' }
  ];
  var SUP_FAQ_GROUPS = [
    { title: 'General Information', faqs: [
      { q: 'About 100%', a: '100% is an overseas betting site that provides trusted and verified games. From sports, slot games, live casinos to mini games.' },
      { q: 'Are the games provided on the site fair?', a: '100% is a legally registered company, and game results are absolutely fair, just, and based on facts.' },
      { q: 'Is my personal information safe?', a: 'All personal data is encrypted in transit and at rest. We never share your information with third parties without consent.' }
    ]},
    { title: 'Account Management', faqs: [
      { q: 'How do I change my password?', a: 'Go to Security Center from your account menu, enter your current password and your new password twice, then confirm.' },
      { q: 'I lost my password, how can I get it reissued?', a: 'Click "Forgot?" on the login window, enter your username and registered email, and we will send password reset instructions.' }
    ]}
  ];
  function supPanelHTML(blocks) {
    return blocks.map(function (block) {
      var bodyHtml = '';
      if (block.body && block.body.length) {
        bodyHtml = '<div class="sup-panel-body">' + block.body.map(function (blk) {
          if (blk.p) return '<p class="sup-p">' + escapeHtml(blk.p).replace(/\n/g, '<br>') + '</p>';
          if (blk.ul) return '<ul class="sup-ul">' + blk.ul.map(function (li) { return '<li>' + escapeHtml(li) + '</li>'; }).join('') + '</ul>';
          if (blk.ol) return '<ol class="sup-ol">' + blk.ol.map(function (li) { return '<li>' + escapeHtml(li) + '</li>'; }).join('') + '</ol>';
          return '';
        }).join('') + '</div>';
      }
      return '<div class="sup-panel"><div class="sup-panel-h">' + escapeHtml(block.panel) + '</div>' + bodyHtml + '</div>';
    }).join('');
  }
  function supFaqHTML(openMap) {
    return SUP_FAQ_GROUPS.map(function (g, gi) {
      var items = g.faqs.map(function (f, fi) {
        var key = gi + '-' + fi;
        var open = !!openMap[key];
        return '<div class="sup-faq' + (open ? ' open' : '') + '" data-faq-key="' + key + '">' +
            '<button type="button" class="sup-faq-q"><span>' + escapeHtml(f.q) + '</span>' +
              '<svg class="sup-faq-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
            '</button>' +
            (open ? '<div class="sup-faq-a">' + escapeHtml(f.a) + '</div>' : '') +
          '</div>';
      }).join('');
      return '<div class="sup-group"><h2 class="sup-group-title">' + escapeHtml(g.title) + '</h2><div class="sup-faq-list">' + items + '</div></div>';
    }).join('');
  }
  function supExclusionListHTML(filter, query) {
    var list = SUP_EXCLUSION.filter(function (e) {
      return (filter === 'All' || e.type === filter) && e.name.toLowerCase().indexOf((query || '').toLowerCase()) !== -1;
    });
    if (!list.length) return '<div class="sup-panel"><div class="sup-panel-body"><p class="sup-p">No results.</p></div></div>';
    return list.map(function (e) {
      return '<div class="sup-panel"><div class="sup-panel-h">' + escapeHtml(e.name) + '</div><div class="sup-panel-body"><ul class="sup-ul">' +
        '<li>Game type: ' + escapeHtml(e.type) + '</li><li>Game Vendor: ' + escapeHtml(e.vendor) + '</li><li>Exclusion Percentage: ' + escapeHtml(e.pct) + '</li>' +
      '</ul></div></div>';
    }).join('');
  }
  function supExclusionHTML(filter, query) {
    var types = ['All'];
    SUP_EXCLUSION.forEach(function (e) { if (types.indexOf(e.type) === -1) types.push(e.type); });
    return '<div class="sup-ex">' +
        '<div class="sup-ex-filters">' +
          '<select class="sup-ex-select">' + types.map(function (t) { return '<option' + (t === filter ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select>' +
          '<div class="sup-ex-search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>' +
            '<input class="sup-ex-query" placeholder="Game Name" value="' + escapeAttr(query || '') + '"></div>' +
        '</div>' +
        '<div class="sup-ex-list">' + supExclusionListHTML(filter, query) + '</div>' +
      '</div>';
  }
  function initSupportPage() {
    var tabsWrap = document.querySelector('.sup-tabs');
    if (!tabsWrap) return;
    var openMap = { '0-0': true, '0-1': true };
    var exState = { filter: 'All', query: '' };

    function renderTab(tab) {
      Array.prototype.forEach.call(tabsWrap.querySelectorAll('.sup-tab'), function (b) {
        b.classList.toggle('active', b.textContent.replace('ⓘ', '').trim() === tab);
      });
      var node = tabsWrap.nextElementSibling;
      while (node) { var next = node.nextElementSibling; node.remove(); node = next; }
      var html;
      if (tab === 'FAQ') html = supFaqHTML(openMap);
      else if (tab === 'Exclusion turnover list') html = supExclusionHTML(exState.filter, exState.query);
      else html = supPanelHTML(SUP_CONTENT[tab] || []);
      tabsWrap.insertAdjacentHTML('afterend', html);
    }

    tabsWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.sup-tab');
      if (!btn) return;
      renderTab(btn.textContent.replace('ⓘ', '').trim());
    });
    document.addEventListener('click', function (e) {
      var faqQ = e.target.closest('.sup-faq-q');
      if (!faqQ) return;
      var faqEl = faqQ.closest('[data-faq-key]');
      if (!faqEl) return;
      var key = faqEl.getAttribute('data-faq-key');
      openMap[key] = !openMap[key];
      renderTab('FAQ');
    });
    document.addEventListener('change', function (e) {
      if (e.target.classList && e.target.classList.contains('sup-ex-select')) {
        exState.filter = e.target.value;
        renderTab('Exclusion turnover list');
      }
    });
    document.addEventListener('input', function (e) {
      if (e.target.classList && e.target.classList.contains('sup-ex-query')) {
        exState.query = e.target.value;
        var listWrap = document.querySelector('.sup-ex-list');
        if (listWrap) listWrap.innerHTML = supExclusionListHTML(exState.filter, exState.query);
      }
    });

    renderTab('FAQ');
  }

  /* ============================================================
   * Sports 頁：分頁篩選(cv-tab)＋載入更多，比賽資料/演算法逐字對照
   * vue3-app Sports.vue（baseMatches 常數 + provider 演算法），供應商
   * 清單沿用既有 CMS_DATA.PROVIDERS，不新增資料模型。sport-odd 按鈕
   * 原始碼本身也未接任何點擊（純展示賠率），維持現狀。
   * ========================================================== */
  var SPORTS_BASE_MATCHES = [
    { league: 'Champions League', home: 'Real Madrid', away: 'Bayern', start: 'Today · 20:00', odds: ['1.85', '3.40', '4.20'], score: '1 - 0' },
    { league: 'Premier League', home: 'Arsenal', away: 'Man City', start: 'Today · 22:30', odds: ['2.95', '3.20', '2.40'] },
    { league: 'NBA', home: 'Lakers', away: 'Celtics', start: 'Tomorrow · 03:30', odds: ['1.65', '—', '2.25'] },
    { league: 'La Liga', home: 'Barcelona', away: 'Atletico', start: 'Sat · 21:00', odds: ['1.55', '4.10', '5.60'] },
    { league: 'Serie A', home: 'Inter', away: 'Juventus', start: 'Sun · 19:45', odds: ['2.10', '3.30', '3.60'] },
    { league: 'NFL', home: 'Chiefs', away: 'Eagles', start: 'Sun · 23:00', odds: ['1.90', '—', '1.95'] }
  ];
  function buildSportsMatches() {
    var all = [];
    PROVIDERS.forEach(function (provider, providerIndex) {
      [0, 1].forEach(function (variant) {
        var template = SPORTS_BASE_MATCHES[(providerIndex + variant * 3) % SPORTS_BASE_MATCHES.length];
        var live = variant === 0 && providerIndex % 5 === 0;
        var odds = template.odds.map(function (odd, oddIndex) {
          if (odd === '—') return odd;
          return (+odd + providerIndex * 0.03 + variant * 0.08 + oddIndex * 0.02).toFixed(2);
        });
        all.push({
          league: template.league, home: template.home, away: template.away, start: template.start,
          provider: provider, live: live,
          min: (34 + providerIndex) + "'",
          score: template.score || ((providerIndex % 3) + ' - ' + ((providerIndex + 1) % 3)),
          odds: odds
        });
      });
    });
    return all;
  }
  function sportCardHTML(m) {
    var scoreHtml = m.live ? '<div class="sport-score">' + escapeHtml(m.score) + '</div>' : '';
    var headRight = m.live
      ? '<span class="sport-live"><span class="dot"></span>LIVE ' + escapeHtml(m.min) + '</span>'
      : '<span class="sport-time">' + escapeHtml(m.start) + '</span>';
    return '<article class="sport-card' + (m.live ? ' live' : '') + '">' +
        '<div class="sport-head"><span class="sport-league">' + escapeHtml(m.league) + '</span>' + headRight + '</div>' +
        '<div class="sport-teams">' +
          '<div class="sport-team"><div class="sport-team-logo" style="--logo-hue:200">' + escapeHtml(m.home.slice(0, 2).toUpperCase()) + '</div><span>' + escapeHtml(m.home) + '</span></div>' +
          scoreHtml +
          '<div class="sport-team"><span>' + escapeHtml(m.away) + '</span><div class="sport-team-logo" style="--logo-hue:340">' + escapeHtml(m.away.slice(0, 2).toUpperCase()) + '</div></div>' +
        '</div>' +
        '<div class="sport-odds">' +
          '<button type="button" class="sport-odd"><span>1</span><strong>' + escapeHtml(m.odds[0]) + '</strong></button>' +
          '<button type="button" class="sport-odd"' + (m.odds[1] === '—' ? ' disabled' : '') + '><span>X</span><strong>' + escapeHtml(m.odds[1]) + '</strong></button>' +
          '<button type="button" class="sport-odd"><span>2</span><strong>' + escapeHtml(m.odds[2]) + '</strong></button>' +
        '</div>' +
      '</article>';
  }
  function initSportsPage() {
    var tabsWrap = document.querySelector('.sports-grid') ? document.querySelector('.cv-tabs') : null;
    var grid = document.querySelector('.sports-grid');
    if (!tabsWrap || !grid) return;
    var foot = grid.nextElementSibling && grid.nextElementSibling.classList.contains('cv-foot') ? grid.nextElementSibling : null;
    var allMatches = buildSportsMatches();
    var state = { filter: 'All', visibleCount: 8 };

    function render() {
      var filtered = state.filter === 'All' ? allMatches : allMatches.filter(function (m) { return m.provider === state.filter; });
      var shown = filtered.slice(0, state.visibleCount);
      grid.innerHTML = shown.map(sportCardHTML).join('');
      if (foot) foot.style.display = shown.length < filtered.length ? '' : 'none';
      var countEl = document.querySelector('.section-title .count');
      if (countEl) countEl.textContent = filtered.length;
    }

    tabsWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.cv-tab');
      if (!btn) return;
      Array.prototype.forEach.call(tabsWrap.querySelectorAll('.cv-tab'), function (b) { b.classList.toggle('active', b === btn); });
      state.filter = btn.textContent.trim();
      state.visibleCount = 8;
      render();
    });
    if (foot) {
      var loadMoreBtn = foot.querySelector('.cv-view-all');
      if (loadMoreBtn) loadMoreBtn.addEventListener('click', function () { state.visibleCount += 4; render(); });
    }
    render();
  }

  /* ============================================================
   * 優惠卡片（index.html 首頁 4 張 + promotion.html 載入更多剩餘 2 張）：
   * 對照 vue3-app data/promotions.js PROMOTION_OFFERS（4 筆，逐字保留，
   * 未新增/未省略），點擊導向各自 actionTarget 對照的真實頁面；
   * promotion.html 缺少的第 3、4 張卡片 markup 逐字取自 index.html 已
   * 渲染的同一組資料，非新增視覺／資料。
   * ========================================================== */
  var PROMOTION_ACTION_PAGES = ['deposit.html', 'deposit.html', 'account-overview.html', 'account-overview.html'];
  var PROMOTION_EXTRA_CARDS_HTML = [
    '<button class="promo-card promo-card-link" type="button" aria-label="查看 推薦好友賺 25%" style="--promo-hue: var(--accent);"><span class="promo-card-tag">推薦</span><div class="promo-card-art" aria-hidden="true" style="background-image: url(&quot;assets/mock/promo-3-v2.jpg&quot;);"></div><h3 class="promo-card-title">推薦好友賺 25%</h3><p class="promo-card-sub">邀請好友後可獲得長期佣金。</p><span class="promo-card-cta">查看 →</span></button>',
    '<button class="promo-card promo-card-link" type="button" aria-label="查看 最高 20% 返水" style="--promo-hue: var(--accent);"><span class="promo-card-tag">VIP</span><div class="promo-card-art" aria-hidden="true" style="background-image: url(&quot;assets/mock/promo-4-v2.jpg&quot;);"></div><h3 class="promo-card-title">最高 20% 返水</h3><p class="promo-card-sub">每週依 VIP 等級返水，無上限。</p><span class="promo-card-cta">查看 →</span></button>'
  ];
  function initPromotionCards() {
    var grid = document.querySelector('.promo-grid');
    if (!grid) return;
    var cards = grid.querySelectorAll('.promo-card.promo-card-link');
    if (!cards.length) return;

    function bindCard(card, index) {
      var target = PROMOTION_ACTION_PAGES[index] || 'promotion.html';
      card.addEventListener('click', function () { location.href = target; });
    }
    Array.prototype.forEach.call(cards, bindCard);

    var foot = grid.nextElementSibling;
    var loadMoreBtn = (foot && foot.classList.contains('cv-foot')) ? foot.querySelector('.cv-view-all') : null;
    if (loadMoreBtn && cards.length < 4) {
      loadMoreBtn.addEventListener('click', function () {
        var startIndex = grid.querySelectorAll('.promo-card.promo-card-link').length;
        PROMOTION_EXTRA_CARDS_HTML.forEach(function (html, i) {
          grid.insertAdjacentHTML('beforeend', html);
          bindCard(grid.lastElementChild, startIndex + i);
        });
        foot.style.display = 'none';
      });
    }
  }

  /* ============================================================
   * Deposit 頁：provider 分頁(A-D，連動可用付款方式數) + 金額速選 +
   * 優惠方案選擇(啟用送出按鈕) + 送出結果對話框。文案/演算法逐字對照
   * vue3-app DepositPage.vue；為控制改動範圍，簡化省略原始碼 step
   * 2/3（轉帳明細畫面／QR 中繼畫面），送出後直接顯示對應結果訊息。
   * ========================================================== */
  function initDepositPage() {
    var providerTabs = document.querySelectorAll('.ui-tablist--underline .ui-tab--underline');
    var methodTabs = document.querySelectorAll('.dp-method-tabs button');
    var amountBtns = document.querySelectorAll('.ap-amount-btn');
    var customInput = document.querySelector('.ap-form-card .ap-input');
    var promoCards = document.querySelectorAll('.ap-promo-card');
    var applyBtn = document.querySelector('.ap-form-card .ap-btn-wide.ap-grad');
    if (!providerTabs.length || !applyBtn) return;

    var METHOD_COUNT = { a: 4, b: 3, c: 2, d: 1 };
    var PROVIDER_LETTERS = ['a', 'b', 'c', 'd'];
    var state = { provider: 'a' };

    function syncProviderMethods() {
      var count = METHOD_COUNT[state.provider] || 4;
      var visibleMethods = Array.prototype.slice.call(methodTabs, 0, count);
      Array.prototype.forEach.call(methodTabs, function (btn, i) { btn.style.display = i < count ? '' : 'none'; });
      var stillVisible = Array.prototype.some.call(visibleMethods, function (btn) { return btn.classList.contains('active'); });
      if (!stillVisible && visibleMethods[0]) {
        Array.prototype.forEach.call(methodTabs, function (b) { b.classList.remove('active'); });
        visibleMethods[0].classList.add('active');
      }
    }
    Array.prototype.forEach.call(providerTabs, function (btn, i) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(providerTabs, function (b) { b.classList.toggle('active', b === btn); });
        state.provider = PROVIDER_LETTERS[i] || 'a';
        syncProviderMethods();
      });
    });
    Array.prototype.forEach.call(methodTabs, function (btn) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(methodTabs, function (b) { b.classList.toggle('active', b === btn); });
      });
    });

    Array.prototype.forEach.call(amountBtns, function (btn) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(amountBtns, function (b) { b.classList.toggle('active', b === btn); });
        if (customInput) customInput.value = '₩ ' + btn.textContent.trim();
      });
    });
    if (customInput) {
      customInput.addEventListener('input', function () {
        var digits = customInput.value.replace(/[^\d]/g, '');
        customInput.value = '₩ ' + (digits ? Number(digits).toLocaleString() : '');
        Array.prototype.forEach.call(amountBtns, function (b) { b.classList.remove('active'); });
      });
    }

    Array.prototype.forEach.call(promoCards, function (card) {
      var radio = card.querySelector('input[type="radio"]');
      if (!radio) return;
      radio.addEventListener('change', function () {
        Array.prototype.forEach.call(promoCards, function (c) { c.classList.toggle('active', c === card); });
        applyBtn.disabled = false;
      });
    });

    var RESULT_MESSAGES = {
      a: { type: 'success', title: 'Success!', message: '' },
      b: { type: 'warning', title: 'Application Notice', message: 'The maximum number of application attempts has been reached. Please contact customer support for assistance.' },
      c: { type: 'warning', title: 'Application Notice', message: 'Your application has been temporarily suspended due to too many failed transaction attempts. Please contact customer support for assistance.' },
      d: { type: 'warning', title: 'Application Notice', message: 'The requested amount has reached the maximum limit. Please contact customer support for assistance.' }
    };
    applyBtn.addEventListener('click', function () {
      if (applyBtn.disabled) return;
      var res = RESULT_MESSAGES[state.provider] || RESULT_MESSAGES.a;
      var extraBtn = res.type !== 'success'
        ? '<button type="button" class="ap-btn-wide outline" data-dialog-close data-action="goto-cs">Contact Customer Support</button>'
        : '';
      var dlg = showDialog(resultDialogHTML(res.type, res.title, res.message, extraBtn));
      var csBtn = dlg.querySelector('[data-action="goto-cs"]');
      if (csBtn) csBtn.addEventListener('click', function () { location.href = 'customer-service.html'; });
    });
  }

  /* ============================================================
   * Withdrawal 頁：主分頁(Withdraw / Account Management) x 方式子分頁
   * (Bank / Crypto) 共 4 種組合，靜態頁只烘焙其中一種，其餘 3 種畫面
   * markup 逐欄位對照 vue3-app WithdrawalPage.vue 動態產生（欄位名稱/
   * placeholder 全數照抄原始碼，非新增資料模型）。送出/註冊皆比照原始
   * 邏輯做必填驗證與筆數上限，成功訊息逐字取自原始碼 dialog 文案。
   * ========================================================== */
  function initWithdrawalPage() {
    var primaryTabs = document.querySelectorAll('.ui-tablist--underline .ui-tab--underline');
    var panelHost = document.querySelector('.wd-panel');
    if (!primaryTabs.length || !panelHost) return;

    var state = { primary: 'withdraw', withdrawMethod: 'crypto', manageMethod: 'bank' };
    var bankAccounts = [{ bank: 'Shinhan Bank', number: '********5123', date: '2025-01-08 21:22:25' }];
    var cryptoWallets = [];
    var BANKS = ['Shinhan Bank', 'KB Bank', 'Woori Bank', 'Hana Bank', 'NH Bank'];

    function methodTabsHTML(group) {
      if (group === 'withdraw') {
        return '<div class="wd-method-tabs" role="tablist" aria-label="Withdrawal method">' +
          '<button type="button" data-method="bank" class="' + (state.withdrawMethod === 'bank' ? 'active' : '') + '" role="tab"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>Bank Card</button>' +
          '<button type="button" data-method="crypto" class="' + (state.withdrawMethod === 'crypto' ? 'active' : '') + '" role="tab"><span class="wd-coin-mark">B</span>Crypto Wallet</button>' +
        '</div>';
      }
      return '<div class="wd-method-tabs" role="tablist" aria-label="Account type">' +
        '<button type="button" data-method="bank" class="' + (state.manageMethod === 'bank' ? 'active' : '') + '" role="tab"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>Bank Account</button>' +
        '<button type="button" data-method="crypto" class="' + (state.manageMethod === 'crypto' ? 'active' : '') + '" role="tab"><span class="wd-coin-mark">B</span>Crypto Wallet</button>' +
      '</div>';
    }
    function withdrawBankPanelHTML() {
      return '<h2 class="ap-section-h"><span class="ap-mark"></span>Bank Card</h2>' +
        '<div class="wd-account-card"><div class="wd-bank-logo">SH</div><div class="wd-account-copy"><strong>Shinhan Bank</strong><span>********5123</span><span>2025-01-08 21:22:25</span></div></div>' +
        '<div class="wd-balance-list"><div class="wd-balance-row"><span>Central Wallet:</span><strong>0.00</strong></div><div class="wd-balance-row"><span>Available Amount:</span><strong>0.00</strong></div></div>' +
        '<h2 class="ap-section-h"><span class="ap-mark"></span>Withdrawal Amount &amp; Password</h2>' +
        '<div class="wd-form-grid">' +
          '<label>Withdrawal Amount:</label><input class="ap-input" data-f="amount" inputmode="numeric" placeholder="100,000 ~ 20,000,000">' +
          '<label>Transaction Password:</label><input class="ap-input" data-f="password" type="password" placeholder="Please fill in the transaction password">' +
        '</div>' +
        '<button type="button" class="ap-btn-wide ap-grad" data-action="submit-withdraw" disabled>Submit</button>';
    }
    function withdrawCryptoPanelHTML() {
      var wallets = cryptoWallets.length ? cryptoWallets.map(function (w) {
        return '<div class="wd-account-card"><span class="wd-wallet-logo">' + escapeHtml(w.type.slice(0, 1)) + '</span><div class="wd-account-copy"><strong>' + escapeHtml(w.type) + '</strong><span>' + escapeHtml(w.address) + '</span><span>' + escapeHtml(w.date) + '</span></div></div>';
      }).join('') : (
        '<div class="wd-empty-wallet"><span class="wd-empty-symbol">B</span><strong>Empty wallet list</strong>' +
        '<button type="button" class="wd-empty-action" data-action="goto-manage-crypto"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Add wallet</button></div>'
      );
      return '<h2 class="ap-section-h"><span class="ap-mark"></span>Crypto Wallet</h2>' + wallets +
        '<div class="wd-balance-list"><div class="wd-balance-row"><span>Central Wallet:</span><strong>0.00</strong></div><div class="wd-balance-row"><span>Available Amount:</span><strong>0.00</strong></div></div>' +
        '<h2 class="ap-section-h"><span class="ap-mark"></span>Withdrawal Amount &amp; Password</h2>' +
        '<div class="wd-form-grid">' +
          '<label>Wallet Type:</label><select class="ap-input" data-f="wtype"><option value="" disabled selected>Please select wallet type</option><option>USDT-TRC20</option><option>USDT-ERC20</option><option>BTC</option></select>' +
          '<label>Wallet Address:</label><input class="ap-input" data-f="waddr" placeholder="Please fill in wallet address">' +
          '<label>Withdrawal Amount:</label><input class="ap-input" data-f="amount" inputmode="numeric" placeholder="100,000 ~ 20,000,000">' +
          '<label>Transaction Password:</label><input class="ap-input" data-f="password" type="password" placeholder="Please fill in the transaction password">' +
        '</div>' +
        '<button type="button" class="ap-btn-wide ap-grad" data-action="submit-withdraw" disabled>Submit</button>';
    }
    function manageBankPanelHTML() {
      var rows = bankAccounts.map(function (a) {
        return '<div class="wd-account-card"><div class="wd-bank-logo">SH</div><div class="wd-account-copy"><strong>' + escapeHtml(a.bank) + '</strong><span>' + escapeHtml(a.number) + '</span><span>' + escapeHtml(a.date) + '</span></div></div>';
      }).join('');
      return '<h2 class="ap-section-h"><span class="ap-mark"></span>Registered Withdrawal Accounts <span class="wd-count">(' + bankAccounts.length + '/5)</span></h2>' + rows +
        '<div class="wd-form-grid wd-management-form">' +
          '<label>Select Bank:</label><select class="ap-input" data-f="bank"><option value="" disabled selected>Please Select a Bank</option>' + BANKS.map(function (b) { return '<option>' + b + '</option>'; }).join('') + '</select>' +
          '<label>Name on Card:</label><input class="ap-input" value="T***" disabled>' +
          '<label>Account Number:</label><input class="ap-input" data-f="account" inputmode="numeric" placeholder="Please enter account/card/phone number">' +
          '<label>Transaction Password:</label><input class="ap-input" data-f="password" type="password" placeholder="Please fill in the transaction password">' +
        '</div>' +
        '<button type="button" class="ap-btn-wide ap-grad" data-action="register-bank" disabled>Submit</button>';
    }
    function manageCryptoPanelHTML() {
      var rows = cryptoWallets.length ? cryptoWallets.map(function (w) {
        return '<div class="wd-account-card"><span class="wd-wallet-logo">' + escapeHtml(w.type.slice(0, 1)) + '</span><div class="wd-account-copy"><strong>' + escapeHtml(w.type) + '</strong><span>' + escapeHtml(w.address) + '</span><span>' + escapeHtml(w.date) + '</span></div></div>';
      }).join('') : '<div class="wd-compact-empty"><span class="wd-empty-symbol">B</span><span>No registered crypto wallet</span></div>';
      return '<h2 class="ap-section-h"><span class="ap-mark"></span>Registered Crypto Wallets <span class="wd-count">(' + cryptoWallets.length + '/5)</span></h2>' + rows +
        '<div class="wd-form-grid wd-management-form">' +
          '<label>Wallet Type:</label><select class="ap-input" data-f="wtype"><option value="" disabled selected>Please select wallet type</option><option>USDT-TRC20</option><option>USDT-ERC20</option><option>BTC</option></select>' +
          '<label>Wallet Address:</label><input class="ap-input" data-f="waddr" placeholder="Please fill in wallet address">' +
          '<label>Transaction Password:</label><input class="ap-input" data-f="password" type="password" placeholder="Please fill in the transaction password">' +
        '</div>' +
        '<button type="button" class="ap-btn-wide ap-grad" data-action="register-crypto" disabled>Submit</button>';
    }
    function checkReady() {
      var btn = panelHost.querySelector('[data-action="submit-withdraw"], [data-action="register-bank"], [data-action="register-crypto"]');
      if (!btn) return;
      var inputs = panelHost.querySelectorAll('[data-f]');
      var ready = inputs.length > 0;
      Array.prototype.forEach.call(inputs, function (inp) { if (!inp.value || !String(inp.value).trim()) ready = false; });
      btn.disabled = !ready;
    }
    function renderPanel() {
      var group = state.primary;
      var method = group === 'withdraw' ? state.withdrawMethod : state.manageMethod;
      var tabsHost = panelHost.parentElement.querySelector('.wd-method-tabs');
      if (tabsHost) tabsHost.outerHTML = methodTabsHTML(group);
      panelHost.innerHTML = (group === 'withdraw')
        ? (method === 'bank' ? withdrawBankPanelHTML() : withdrawCryptoPanelHTML())
        : (method === 'bank' ? manageBankPanelHTML() : manageCryptoPanelHTML());
      checkReady();
    }

    Array.prototype.forEach.call(primaryTabs, function (btn, i) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(primaryTabs, function (b) { b.classList.toggle('active', b === btn); });
        state.primary = i === 0 ? 'withdraw' : 'management';
        renderPanel();
      });
    });

    document.addEventListener('click', function (e) {
      var scope = e.target.closest('.wd-panel') || e.target.closest('.wd-method-tabs');
      if (!scope) return;
      var methodBtn = e.target.closest('.wd-method-tabs button[data-method]');
      if (methodBtn) {
        if (state.primary === 'withdraw') state.withdrawMethod = methodBtn.getAttribute('data-method');
        else state.manageMethod = methodBtn.getAttribute('data-method');
        renderPanel();
        return;
      }
      var addWalletBtn = e.target.closest('[data-action="goto-manage-crypto"]');
      if (addWalletBtn) {
        state.primary = 'management'; state.manageMethod = 'crypto';
        Array.prototype.forEach.call(primaryTabs, function (b, i) { b.classList.toggle('active', i === 1); });
        renderPanel();
        return;
      }
      var submitBtn = e.target.closest('[data-action="submit-withdraw"]');
      if (submitBtn && !submitBtn.disabled) {
        var methodLabel = (state.withdrawMethod === 'bank') ? 'Bank card' : 'Crypto wallet';
        showDialog(resultDialogHTML('success', 'Success!', methodLabel + ' withdrawal request submitted successfully.'));
        return;
      }
      var regBankBtn = e.target.closest('[data-action="register-bank"]');
      if (regBankBtn && !regBankBtn.disabled) {
        if (bankAccounts.length >= 5) { showDialog(resultDialogHTML('warning', 'Account Limit', 'A maximum of five withdrawal accounts can be registered.')); return; }
        var bankSel = panelHost.querySelector('[data-f="bank"]');
        var acctInp = panelHost.querySelector('[data-f="account"]');
        var last4 = (acctInp.value || '').replace(/\D/g, '').slice(-4) || acctInp.value.slice(-4);
        bankAccounts.push({ bank: bankSel.value, number: '********' + last4, date: new Date().toISOString().slice(0, 19).replace('T', ' ') });
        renderPanel();
        showDialog(resultDialogHTML('success', 'Success!', 'Withdrawal account registered successfully.'));
        return;
      }
      var regCryptoBtn = e.target.closest('[data-action="register-crypto"]');
      if (regCryptoBtn && !regCryptoBtn.disabled) {
        if (cryptoWallets.length >= 5) { showDialog(resultDialogHTML('warning', 'Wallet Limit', 'A maximum of five crypto wallets can be registered.')); return; }
        var wtypeSel = panelHost.querySelector('[data-f="wtype"]');
        var waddrInp = panelHost.querySelector('[data-f="waddr"]');
        var addr = (waddrInp.value || '').trim();
        cryptoWallets.push({ type: wtypeSel.value, address: addr.slice(0, 8) + '...' + addr.slice(-6), date: new Date().toISOString().slice(0, 19).replace('T', ' ') });
        renderPanel();
        showDialog(resultDialogHTML('success', 'Success!', 'Crypto wallet registered successfully.'));
        return;
      }
    });
    document.addEventListener('input', function (e) { if (e.target.closest && e.target.closest('.wd-panel')) checkReady(); });
    document.addEventListener('change', function (e) { if (e.target.closest && e.target.closest('.wd-panel')) checkReady(); });

    // 靜態頁面初次渲染的 method-tabs/wd-panel markup沒有 data-method / data-action
    // 掛勾（那是 Vue SSR 當下 crypto 分支的純展示 HTML），開場先用同一套
    // renderPanel() 正規化一次（內容應與已渲染畫面一致，僅補上事件掛勾用的屬性）。
    renderPanel();
  }

  /* ============================================================
   * Bootstrap
   * ========================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    safe(initI18n);
    safe(restoreSkin);
    safe(initHero);
    safe(initRails);
    safe(initPromosAndCategoryViews);
    safe(initLeaderboard);
    safe(initRewardsCountdown);
    safe(initPromoRibbonClock);
    safe(initCustomerServiceFab);
    safe(initBalanceFloat);
    safe(initMobileNav);
    safe(initAccountOverviewPage);
    safe(initSecurityCenterPage);
    safe(initPersonalInfoPage);
    safe(initRecordPage);
    safe(initSupportPage);
    safe(initSportsPage);
    safe(initPromotionCards);
    safe(initDepositPage);
    safe(initWithdrawalPage);
    safe(function () { document.addEventListener('click', onDocumentClick); });
    safe(function () { document.addEventListener('submit', onDocumentSubmit); });
    safe(function () { document.addEventListener('keydown', onDocumentKeydown); });
    safe(function () {
      document.addEventListener('cms:favorites-changed', function () {
        Array.prototype.forEach.call(document.querySelectorAll('.lobby-section'), function (section) {
          if (section._cvParams) renderCategoryView(section);
        });
      });
    });
  });
})();
