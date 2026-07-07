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
- 分 phase 進行，每個 phase 完成後列出本次新增的檔案
- 遇到 build error 自己修，不需要問我
- 不確定的設計決策，給一個推薦選項，不要列多個讓我選

---

## 專案說明

Gaming Lobby CMS 前台，原始 prototype 為 CDN React + 純 HTML/CSS。
Vue 3 重構版本放在 `vue3-app/` 目錄，已完成全部 9 個 Phase。

### 技術棧
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

### 原始 Prototype 位置
- `components.jsx` — 主要元件（Sidebar, TopBar, Hero, GameCard, Rail 等）
- `account-pages.jsx` — 帳戶頁面（AccountOverview, DepositPage, WithdrawalPage 等）
- `styles.css` — 完整 CSS（4449 行）
- `index.html` — App 入口與整合

---

## 目前版本狀態

Phase 1–9 全部完成，所有元件已實作並推上 main。
下一步依需求決定：新功能、視覺調整、或另起新專案。
