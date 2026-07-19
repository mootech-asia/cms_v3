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

  /* zh 字串（僅動態產生 markup 需要；3 個 modal 原始碼本身就是純英文寫死，不經 t()，故照抄英文原文） */
  var STR = {
    all: '全部',
    favorites: '我的最愛',
    loadMore: '載入更多',
    noFavorites: '尚未加入我的最愛，點擊遊戲愛心即可收藏。',
    noProviderGames: function (p) { return '目前沒有來自 ' + p + ' 的遊戲。'; },
    noGames: '目前沒有可顯示的遊戲。'
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
    'Hot Games': { title: '熱門遊戲', icon: 'fire', games: GAMES.slots.concat(GAMES.live, GAMES.originals), showFilterTabs: false, showProviderTabs: false, showFavorites: false, enableLoadMore: false, pageSize: 10 },
    'Mini Games': { title: '小遊戲', icon: 'star', games: GAMES.originals, showFilterTabs: true, showProviderTabs: true, showFavorites: true, enableLoadMore: true, pageSize: 10 },
    'Slots': { title: '老虎機', icon: 'fire', games: GAMES.slots, showFilterTabs: true, showProviderTabs: true, showFavorites: true, enableLoadMore: true, pageSize: 10 },
    'Live': { title: '真人', icon: 'bolt', games: GAMES.live, showFilterTabs: true, showProviderTabs: true, showFavorites: true, enableLoadMore: true, pageSize: 10 },
    'Fish': { title: '捕魚', icon: null, games: GAMES.slots, showFilterTabs: true, showProviderTabs: true, showFavorites: true, enableLoadMore: true, pageSize: 10 }
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
    return '<div class="modal-head">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div style="font-family:var(--font-display);font-weight:700;font-size:17px">' + escapeHtml(game.title) + '</div>' +
          '<span class="gcard-provider" style="font-size:12px">' + escapeHtml(game.provider) + '</span>' +
        '</div>' +
        '<button type="button" class="modal-close" aria-label="Close">' + CLOSE_ICON + '</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="game-modal-art">[ ' + escapeHtml(String(game.title).toUpperCase()) + ' GAMEPLAY PREVIEW ]</div>' +
        '<div style="color:var(--text-mid);font-size:13.5px;line-height:1.6">' + escapeHtml(game.title) + ' is a ' + escapeHtml(game.category) + ' game from ' + escapeHtml(game.provider) + '. ' +
          'Spin volatile reels, stack multipliers, and bank wins instantly to your crypto balance. Provably fair on every round.</div>' +
        '<div class="game-modal-stats">' +
          '<div class="game-modal-stat"><div class="game-modal-stat-label">RTP</div><div class="game-modal-stat-val">' + escapeHtml(game.rtp) + '%</div></div>' +
          '<div class="game-modal-stat"><div class="game-modal-stat-label">Max win</div><div class="game-modal-stat-val">' + escapeHtml(game.maxWin) + '</div></div>' +
          '<div class="game-modal-stat"><div class="game-modal-stat-label">Volatility</div><div class="game-modal-stat-val">High</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-foot"><button type="button" class="btn">Demo</button><button type="button" class="btn primary">Play for real →</button></div>';
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
    var headTitle = tab === 'forgot' ? 'Forgot Password' : (tab === 'signin' ? 'Welcome back' : 'Create your account');
    var head = '<div class="modal-head"><div style="font-family:var(--font-display);font-weight:700;font-size:17px">' + headTitle + '</div>' +
      '<button type="button" class="modal-close" aria-label="Close">' + CLOSE_ICON + '</button></div>';
    var body;
    if (tab === 'forgot') {
      body = '<form data-role="cms-form">' +
          '<div class="field"><label>Email</label><input type="email" name="email" placeholder="Enter your email" value="' + escapeAttr(state.email) + '"></div>' +
          '<button type="submit" class="reset-btn">Send Reset Link</button>' +
          '<div class="signin-foot">Remember your password? <a href="#" data-tab="signin">Back to Login</a></div>' +
        '</form>';
    } else {
      body = '<div class="signin-tabs">' +
          '<button type="button" class="signin-tab' + (tab === 'signin' ? ' active' : '') + '" data-tab="signin">Sign in</button>' +
          '<button type="button" class="signin-tab' + (tab === 'register' ? ' active' : '') + '" data-tab="register">Register</button>' +
        '</div>' +
        '<form data-role="cms-form">' +
          (tab === 'register' ? '<div class="field"><label>Username</label><input name="username" placeholder="player_one" value="' + escapeAttr(state.username) + '"></div>' : '') +
          '<div class="field"><label>Email</label><input type="email" name="email" placeholder="you@email.com" value="' + escapeAttr(state.email) + '"></div>' +
          '<div class="field"><label>Password</label><input type="password" name="pw" placeholder="••••••••"></div>' +
          (tab === 'register' ? '<div class="field"><label style="display:flex;align-items:center;gap:8px;color:var(--text-mid)"><input type="checkbox" checked style="margin:0"><span style="font-size:12px">I\'m 18+ and accept the Terms</span></label></div>' : '') +
          '<button type="submit" class="btn primary" style="width:100%;padding:12px;margin-top:6px">' + (tab === 'signin' ? 'Sign in →' : 'Create account →') + '</button>' +
        '</form>' +
        '<div class="signin-foot">' + (tab === 'signin'
          ? 'No account? <a href="#" data-tab="register">Register</a> · <a href="#" data-tab="forgot">Forgot?</a>'
          : 'Already a player? <a href="#" data-tab="signin">Sign in</a>') + '</div>';
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
    if (closeBtn) { var bg = closeBtn.closest('.modal-bg'); if (bg) hideModalEl(bg); return; }
    if (t.classList && t.classList.contains('modal-bg')) { hideModalEl(t); return; }

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

    var collapseSidebarBtn = t.closest('.sb-collapse-account, .sb-collapse-money');
    if (collapseSidebarBtn) { var shell1 = document.querySelector('.shell'); if (shell1) shell1.classList.add('collapsed'); return; }
    var expandSidebarBtn = t.closest('.sb-collapse-compact');
    if (expandSidebarBtn) { var shell2 = document.querySelector('.shell'); if (shell2) shell2.classList.remove('collapsed'); return; }

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
    closeUserMenu();
    closeSkinMenu();
  }

  /* ============================================================
   * Bootstrap
   * ========================================================== */
  document.addEventListener('DOMContentLoaded', function () {
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
