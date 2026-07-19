# CMS_前台_v3 — Project Context

## 工作規則

### 溝通
- 用繁體中文回覆
- 回覆簡短，做完再說結果，不逐步解釋過程
- 我說「ok」代表繼續下一步

### Git
- 直接 commit 到 main，不開分支
- 每次 commit 前先 `npm run build` 確認無錯誤
- commit message 用英文，格式：`Phase X: 簡短描述`
- 每個 phase 完成後立即 push

### 程式碼風格
- Vue 3 Composition API，全用 `<script setup>`
- 不加不必要的 comment
- 不做超出當前 phase 範圍的重構或抽象
- CSS class name 沿用原始 prototype，不自創新 class

### 執行方式
- 盡一切可能調用外掛、skill、subagent、MCP 工具、外部程式加速任務，
  並一律以最省 token 的方式進行（業主鐵則）
- 分 phase 進行，每個 phase 完成後列出本次新增的檔案
- 遇到 build error 自己修，不需要問我
- 不確定的設計決策，給一個推薦選項，不要列多個讓我選

---

## 專案說明

本 repo 為業主生成系統交付出去的其中一個獨立專案（一個交付版型 = 一個專案）；
工廠與模板規範在 `mootech-asia/cms_system_v2`，全部資產屬於業主個人、不屬於公司。

Gaming Lobby CMS 前台，原始 prototype 為 CDN React + 純 HTML/CSS。

**2026-07-19 起 main 的現行形態是純 HTML+CSS+JS 靜態站**（repo 根目錄的 20 個
`.html` + `assets/`，免建置、可直接開 `index.html`，行為層是 `assets/js/site.js`
vanilla JS）。中間曾重構為 Vue 3（`vue3-app/`，已完成全部 9 個 Phase）；該版本
**已完整移出 main**，保存於分支 `工程師框架版本`（含 `vue3-app/studio` 設計後台）。
以下「技術棧／目錄結構」兩節描述的是 `工程師框架版本` 分支的 Vue 3 版，留作該分支
的參考文件；main 上實際運作的是純靜態版，其結構見 repo 根目錄 + `scripts/` 內
`verify-static-site.js` 的頁面清單。

### 技術棧（`工程師框架版本` 分支 / `vue3-app/`，非 main 現行形態）
- Vue 3 + Vite 5
- Composition API / `<script setup>`
- 無 vue-router：頁面切換用 `activeCat` ref（字串）做路由
- 無 Pinia：state 在 App.vue，用 props/emits 傳遞
- CSS：直接沿用原始 `styles.css`（4449 行），不修改

### 目錄結構
```
vue3-app/src/
├── main.js
├── App.vue                        # 根元件，統一 activeCat 路由
├── assets/
│   ├── main.css                   # 原始 styles.css 完整複製
│   └── layout.css                 # shell/sidebar/header CSS 變數
├── layouts/
│   └── AppLayout.vue              # named slots: sidebar/header/default/footer/mobile-nav
├── components/
│   ├── ui/
│   │   └── Icon.vue               # 所有 SVG icon 統一管理
│   ├── layout/
│   │   ├── Sidebar.vue
│   │   ├── TopBar.vue
│   │   ├── AppFooter.vue
│   │   └── MobileNav.vue
│   ├── home/
│   │   ├── Hero.vue               # 輪播 + 觸控滑動 + 自動播放
│   │   ├── PromoRibbon.vue        # CSS 跑馬燈
│   │   ├── RewardsBanner.vue      # 進度條 + 倒數計時
│   │   └── Promos.vue             # 8 個分類 tab
│   ├── game/
│   │   ├── GameCard.vue
│   │   ├── Rail.vue               # 橫向捲動軌道
│   │   ├── FilteredGrid.vue       # 搜尋 + 篩選 + 排序
│   │   └── CategoryView.vue       # All/Favorites tab + 展開收合
│   ├── lobby/
│   │   ├── Leaderboard.vue        # 每 2.8s 更新
│   │   ├── Tournaments.vue
│   │   ├── Sports.vue             # 比賽卡片 + odds 按鈕
│   │   ├── Promotion.vue
│   │   └── Providers.vue
│   ├── modal/
│   │   ├── GameModal.vue
│   │   ├── SignInModal.vue        # signin/register/forgot tabs
│   │   └── CustomerServiceModal.vue
│   └── account/
│       ├── AccountOverview.vue    # 銀行卡輪播 + 交易記錄
│       ├── DepositPage.vue        # 2 步驟入款流程
│       ├── WithdrawalPage.vue
│       ├── PersonalInfo.vue
│       ├── SecurityCenter.vue
│       ├── CustomerServicePage.vue
│       ├── RecordTable.vue        # 5 種記錄類型，共用元件
│       └── SupportPage.vue        # 9 個 tab，FAQ accordion
├── composables/
│   ├── useFavorites.js            # localStorage 收藏
│   └── useTweaks.js               # theme/accent/aspect → CSS vars
└── data/
    └── index.js                   # GAMES, PROVIDERS, HEROES, WINNERS, TOURNAMENTS, RECENTLY_PLAYED
```

### activeCat 路由對照
| activeCat 值 | 顯示頁面 |
|---|---|
| `'Lobby'` | 首頁（Hero + Promos + Rails + catTab 子路由） |
| `'Account Overview'` | AccountOverview |
| `'DepositForm'` | DepositPage |
| `'WithdrawalForm'` | WithdrawalPage |
| `'Personal Info'` | PersonalInfo |
| `'Security Center'` | SecurityCenter |
| `'Customer Service'` | CustomerServicePage |
| `'Support'` | SupportPage |
| `'Betting Record'` / `'Deposit Record'` / `'Withdrawal Record'` / `'Profit And Loss'` / `'Account Record'` | RecordTable（:title 傳入） |

### catTab 路由對照（僅在 activeCat === 'Lobby' 時有效）
| catTab 值 | 顯示內容 |
|---|---|
| `'Lobby'` | 3 條 Rail + FilteredGrid + Leaderboard + Tournaments + Promotion + Providers |
| `'Hot Games'` | CategoryView（slots + live + originals） |
| `'Mini Games'` | CategoryView（originals） |
| `'Slots'` | CategoryView（slots） |
| `'Live'` | CategoryView（live） |
| `'Fish'` | CategoryView（slots） |
| `'Sports'` | Sports |
| `'Promotion'` | Promotion |

### 原始 Prototype
已刪除（原 `components.jsx`、`account-pages.jsx`、`styles.css`、`index.html` 等），需要時可從 git 歷史找回。

---

## main 現行形態：純 HTML+CSS+JS 靜態站（2026-07-19 起）

沒有 vue-router、沒有 activeCat：每個 `activeCat`/`catTab` 組合都是 repo 根目錄一個
真實 `.html` 檔，用真的 `<a href>` 導覽。對照表（沿用上面 activeCat/catTab 語意）：

| 檔名 | 對應舊 activeCat / catTab |
|---|---|
| `index.html` | Lobby / Lobby |
| `hot-games.html` `mini-games.html` `slots.html` `live.html` `fish.html` `sports.html` `promotion.html` | Lobby / 對應 catTab |
| `account-overview.html` | Account Overview |
| `deposit.html` / `withdrawal.html` | DepositForm / WithdrawalForm |
| `personal-info.html` / `security-center.html` / `customer-service.html` / `support.html` | 同名 |
| `betting-record.html` `deposit-record.html` `withdrawal-record.html` `profit-loss.html` `account-record.html` | 對應 RecordTable title |

行為層（輪播、tab、modal、收藏、換膚等）在 `assets/js/site.js`，資料在
`assets/js/data.js`（`window.CMS_DATA`）。CSS 直接沿用 `assets/main.css`/`layout.css`
（不變）。三個 modal（Game/SignIn/CustomerService）以隱藏 markup 內嵌在每頁
`</body>` 前。

**本地驗證**：`npm install && npm run serve`（純檔案伺服器，或直接開 `index.html`
file://）、`npm run verify`（結構檢查）、`npm run verify:behavior`（Playwright 行為
檢查，需先 `npm run serve`）。

**若要改回 Vue 3 開發**：checkout 分支 `工程師框架版本`，`vue3-app/` 是完整原始碼
（含 `studio/` 設計後台）。該分支與 main 已分岔，彼此不會自動同步。

**⚠️ main 尚未真的切換**：上述變更目前只在分支 `claude/factory-web-refactor-ewrpuv`
（已 push），還沒併進 `main`。**併入前務必注意：`.github/workflows/deploy-pages.yml`
是 push 到 main 就直接 build + deploy，沒有像 v2 那樣的 candidate/promote 手動關卡**
——一旦這個分支併入 main，正式站會立刻自動變成純靜態版（且不再有 `/studio` 設計後台，
因為 `vue3-app/` 已移出）。併入前請先確認業主是否已經想好設計後台要怎麼處理。

## 目前版本狀態

Vue 3 重構 Phase 1–9 全部完成（保存於分支 `工程師框架版本`）。
2026-07-19：main 已切換為純 HTML+CSS+JS 靜態站（見上節），20 頁結構+行為皆已驗證。
下一步依需求決定：新功能、視覺調整、或另起新專案。
