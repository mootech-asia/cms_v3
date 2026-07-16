# cms_v3 全站設計系統與內容規格

> 基準分支：`claude/folder-upload-preview-url-5tzplm`
>
> 重構前備份：`backup/pre-design-system-20260716`
>
> 目前預設 skin：`blue`
>
> 本文件是全站 UI、內容層級與 skin 的唯一規格來源。新增頁面或 skin 前，應先在此補上角色與 token，再進入元件實作。

## 1. 全站架構

```text
AppLayout
├─ Sidebar
│  ├─ 搜尋
│  ├─ 主導覽
│  ├─ 語言
│  ├─ Deposit / Withdrawal
│  └─ Support / Telegram / Collapse
├─ TopBar
│  ├─ Logo
│  ├─ Theme
│  ├─ Balance / Points
│  └─ Member menu / Login / Register
├─ Main content
│  ├─ Lobby
│  ├─ Game categories
│  ├─ Account pages
│  ├─ Record pages
│  └─ Support pages
├─ AppFooter
└─ MobileNav
```

層級原則：

1. App shell 只負責整體版面、側欄、頂列、內容與頁尾。
2. Page 負責一個完整工作流程，例如 Deposit、Security Center。
3. Section 負責頁面內可獨立閱讀的區塊，例如 Recently played、Sportsbook。
4. Component 負責可重用的互動單元，例如 button、tab、game card、table。
5. Skin 只控制顏色、漸層、陰影和狀態色，不控制內容與版面結構。

## 2. 頁面與內容地圖

### 2.1 Lobby

主頁籤：

- Lobby
- Hot Games
- Mini Games
- Slots
- Sports
- Live
- Fish
- Promotion

Lobby 內容順序：

1. Hero
2. Promo Ribbon
3. Rewards Banner
4. Category Tabs
5. Recently played
6. Slots
7. Live Casino
8. Browse all games
9. Leaderboard
10. Tournaments
11. Promotions
12. Providers
13. Footer

遊戲分類頁：

- Hot Games：只顯示遊戲，不顯示 All、Favorites 或廠商。
- Mini Games：All、Favorites、20 個廠商、Load More。
- Slots：All、Favorites、20 個廠商、Load More。
- Live：All、Favorites、20 個廠商、Load More。
- Fish：All、Favorites、20 個廠商、Load More。
- Sports：All 與廠商、賽事卡、Load More。
- Promotion：活動卡、Load More。

廠商順序：

Saba、Bti、Evolution、Pragmatic Play、PG Soft、Microgaming、Playtech、NetEnt、JDB、CQ9、Jili、Spadegaming、Habanero、Yggdrasil、Red Tiger、NoLimit City、Relax Gaming、Hacksaw Gaming、Spribe、Ezugi。

### 2.2 Account

側欄入口：

- Account Overview
- Betting Record
- Deposit Record
- Profit And Loss
- Withdrawal Record
- Account Record
- Personal Info
- Security Center

Account Overview：

- Balance 與 Refresh
- Quick Actions：Deposit、Withdraw
- Banking Details
- Recent Transactions
- Delete account confirmation

個人與安全：

- Personal Info
- Security Center
- Change Login Password
- Banking Details
- Customer Service
- Logout

資金流程：

- Deposit
  - Bank Card / Crypto Wallet
  - Deposit Amount
  - Choose promotion
  - Deposit Info
  - Apply for Deposit / Complete
- Withdrawal
  - My Bank Accounts
  - Amount / Password
  - Submit

紀錄頁：

- Betting Record
- Deposit Record
- Profit And Loss
- Withdrawal Record
- Account Record

共同操作：

- Back
- Status
- Date range
- Confirm
- Auto refresh
- Total amount（有總額的頁面固定在內容底部）

### 2.3 Support

- About Us
- Exclusion turnover list
- FAQ
- Privacy Policy
- Preventing Gaming Addiction
- Deposit Limit Management
- Rules & Regulations
- Deposit & Withdrawal
- Help & Suggestions

## 3. 標題層級

### Hero Title

用途：首頁主視覺唯一主標。

- Token：`--type-hero`
- 字型：`--font-display`
- 字重：700
- 目前響應範圍：桌面 36–64px，手機 22–32px
- 一頁只允許一個。

### Page Title

用途：完整頁面的 H1。

現有內容：

- Account Overview
- Banking Details
- Change Login Password
- Customer Service
- Deposit
- Personal Info
- Security Center
- About Us
- Withdrawal
- Betting Record
- Deposit Record
- Profit And Loss
- Withdrawal Record
- Account Record

規格：

- Token：`--type-page-title` = 26px
- 字型：`--font-display`
- 字重：700
- Class：`.ap-h1`、`.sup-h1`

### Section Title

用途：頁面內主要區塊 H2。

現有內容：

- Recently played
- Slots
- Live Casino
- Hot Games
- Mini Games
- Fish
- Top wins · last hour
- Promotions
- Providers
- Sportsbook
- Live sport

規格：

- Token：`--type-section-title` = 22px
- 手機：18px
- 字型：`--font-display`
- 字重：700
- Class：`.section-title`

### Group Title

用途：表單或卡片內群組 H3。

現有內容：

- Quick Actions
- Banking Details
- Recent Transactions
- Deposit Amount
- Choose promotion
- Deposit Info
- Last login
- Security Setting
- My Bank Accounts

規格：

- Token：`--type-group-title` = 16px
- 字重：700

### Card Title

用途：遊戲、活動、賽事等重複卡片。

- Token：`--type-card-title` = 15px
- 字重：600–700
- 不使用 Page Title 尺寸。

## 4. 字體系統

字型：

- Display：Space Grotesk
- Body：Inter
- Mono：JetBrains Mono

標準字級：

| Token | 大小 | 用途 |
|---|---:|---|
| `--type-caption` | 10.5px | badge、微型統計 |
| `--type-meta` | 11.5px | 時間、次要 metadata |
| `--type-label` | 12.5px | 表頭、表單 label |
| `--type-body-sm` | 13px | 緊湊內容、tab |
| `--type-button` | 13.5px | 一般操作按鈕 |
| `--type-body` | 14px | 全站正文 |
| `--type-card-title` | 15px | 卡片標題 |
| `--type-group-title` | 16px | 卡片群組標題 |
| `--type-section-title` | 22px | 區塊標題 |
| `--type-page-title` | 26px | 頁面標題 |

數字、金額、倒數、百分比、賠率使用 `--font-mono`。

## 5. 按鈕系統

### Primary

用途：提交、下一步、主要轉換。

現有文字：

- Deposit
- Submit
- Complete
- Next
- Apply for Deposit
- Confirm
- Join
- Wager more
- Play for real
- Sign in / Register

標準角色：`.ui-button.ui-button--primary`

舊 class 對應：

- `.btn.primary`
- `.ap-btn.primary`
- `.ap-grad`
- `.ap-btn-wide.ap-grad`
- `.rec-confirm`

Skin 控制：

- `--gradient-primary`
- `--text-on-accent`
- `--shadow-primary`

### Secondary

用途：一般操作、返回、取消。

現有文字：

- Back
- Cancel
- Demo
- Withdraw
- Refresh

標準角色：`.ui-button.ui-button--secondary`

舊 class 對應：

- `.btn`
- `.ap-btn`
- `.ap-back`
- `.ap-btn-wide.outline`
- `.cv-view-all`

Back / Load More 狀態：

- Normal：深色表面、灰字、低對比邊框。
- Hover：藍色外框、白字。
- Load More 維持 240 × 48px；手機 220 × 44px。

### Ghost

用途：低優先、取消、不搶主視覺。

舊 class：

- `.btn.ghost`
- `.ap-btn-wide.ghost`

### Destructive

用途：Delete、Logout 等不可逆操作。

規格：

- 必須使用 `--danger`。
- 不可沿用 primary 藍色。
- 執行前需確認。

### Icon Button

用途：關閉、箭頭、刷新、收藏、展開。

規格：

- 只放圖示。
- 必須有 `aria-label` 或 tooltip。
- 尺寸由 `--control-size-sm/md` 控制。

## 6. 頁籤與篩選

### Main Category Tab

內容：Lobby、Hot Games、Mini Games、Slots、Sports、Live、Fish、Promotion。

- Class：`.cat-tab`
- 桌面：等寬 8 欄。
- 手機：水平捲動，不換行。
- Active：skin accent 外框與 active surface。

### Filter Pill

內容：All、Favorites、廠商、狀態篩選。

- Class：`.cv-tab`、`.chip`
- 圓角：`--radius-pill`
- 字級：`--type-body-sm`
- 廠商列不換行，允許水平捲動。

### Segmented Tab

用途：Sign in / Register、Bank Card / Crypto Wallet。

- Class：`.signin-tab`、`.dp-method-tab`
- 外層必須是單一 segmented container。
- Active 只允許一個。

### Underline Tab

用途：About、Privacy、FAQ 等資訊頁。

- Class：`.sup-tab`
- Active 使用 accent 文字與底線。

## 7. 表格與資料列表

### Record Table

Class：`.rec-table`

使用頁面：

- Betting Record
- Deposit Record
- Profit And Loss
- Withdrawal Record
- Account Record

規格：

- 表頭背景：`--table-header-bg`
- 表頭文字：`--table-header-text`
- 表頭字級：`--type-label`
- 內容字級：`--type-body`
- 正值：`--positive`
- 負值：`--danger`
- Approved / Pending / Rejected 使用 status pill。
- Deposit / Withdrawal 的 total 使用 `margin-top: auto` 固定在內容底部。
- 窄螢幕允許水平捲動，不壓縮欄位文字。

### Leaderboard

目前由 CSS Grid 組成，語意上屬於資料表。

欄位：

- Rank
- Player
- Game
- Multiplier
- Bet
- Payout

後續若加入排序、欄位名稱或可存取性需求，應改為語意化 `table`。

### Sports Odds

賽事卡不是表格；每張卡包含：

- 聯賽
- 時間 / Live
- 主客隊
- 1 / X / 2 賠率

賠率使用 `--font-mono`，hover 使用 skin accent。

## 8. Surface、圓角與間距

Surface：

- Page：`--bg`
- Elevated：`--bg-elev`
- Card：`--bg-card`
- Card hover：`--bg-card-hi`

圓角：

| Token | 大小 | 用途 |
|---|---:|---|
| `--radius-xs` | 6px | badge、小計數 |
| `--radius-sm` | 8px | 小型控制 |
| `--radius-control` | 10px | button、input |
| `--radius-card` | 12px | 小卡片 |
| `--radius` | 14px | 一般卡片 |
| `--radius-panel` | 20px | 大型 panel |
| `--radius-pill` | 999px | pill、segmented tab |

間距使用 4px 基準：

4、8、12、16、20、24、28、32、40、48、64px。

## 9. Blue Skin

Blue skin 負責：

- 背景與 surface
- 文字與邊框
- 主色、輔助色
- Primary gradient
- Active tab
- Table header
- Status colors
- Shadow 與 glow

Blue skin 不負責：

- 元件寬高
- Grid / Flex
- 字級
- 內容字串
- 頁面順序
- RWD breakpoint

目前藍色核心：

- Primary：#2473ff
- Primary light：#38bdf8
- Primary dark：#1e5fd8
- Accent 3：#fbbf24
- Dark page：#05080f
- Dark card：#0f1623

切換介面：

```js
document.documentElement.setAttribute('data-skin', 'blue')
document.documentElement.setAttribute('data-theme', 'dark')
```

程式內切換：

```js
const { setTweak, skins } = useTweaks()

setTweak('skin', 'blue')
```

`useTweaks` 會驗證 skin 名稱、寫入 `data-skin`，並使用 `cms_skin` 保存選擇；無效名稱會回到 `blue`。

新增 skin：

1. 複製 `src/assets/skins/blue.css`。
2. 將 selector 改為新的 `data-skin` 名稱。
3. 只修改 skin tokens，不放尺寸、grid 或內容規則。
4. 在 `src/skins/index.js` 匯入 CSS 並註冊 `id / label`。
5. 不修改頁面元件 CSS。
6. 檢查 dark / light、hover、active、disabled、focus。

## 10. 檔案責任

```text
src/assets/design-system/tokens.css
  結構 token：字型、字級、間距、圓角、控制尺寸、layout 尺寸

src/assets/design-system/components.css
  共用 UI 角色：button、tab、title、table、focus

src/assets/skins/blue.css
  藍色 skin：顏色、漸層、陰影、狀態色

src/assets/layout.css
  App shell、sidebar、header、container、mobile nav

src/assets/main.css
  既有頁面與元件專屬樣式；重構期間逐步縮小

src/assets/load-more.css
  Load More 的尺寸與 Back-style 狀態

src/skins/index.js
  可用 skin 清單與預設 skin

src/composables/useTweaks.js
  theme、skin、density、aspect 與 localStorage
```

## 11. 已落地的整理

目前分支已完成：

- 建立重構前備份分支 `backup/pre-design-system-20260716`。
- 將字體、字級、間距、圓角、控制尺寸與 layout 尺寸集中至 `tokens.css`。
- 將藍色、surface、狀態色、漸層、陰影、表頭與互動狀態集中至 `blue.css`。
- 將 title、button、quiet control、tab、table 舊 class 對應到共用 UI contract。
- 移除 `main.css` / `layout.css` 重複的根變數與 shell / container 定義。
- 合併 Sidebar tab、Account primary、wide button、Rewards Banner 等重複基礎規則。
- Primary 漸層、record table header、record total、Back / Load More 已改讀 skin token。
- `useTweaks` 已由單一 accent 色改為完整 skin，並保留 dark / light theme。
- 保留 Rewards 兩欄進度對齊、藍色表頭、record total 置底與 compact Load More 尺寸。

響應式 override、light theme 特例與頁面專屬 layout 仍可保留重複 selector；它們屬於明確 context，不應為追求零重複而合併。

## 12. 本次稽核發現

盤點時：

- `main.css` 約 4,653 行。
- 字級存在三十多種寫法。
- `10px` 圓角重複約 29 次。
- pill 圓角重複約 21 次。
- `.tb-balance-rows` 被定義 7 次。
- `.rewards-banner`、`.promo-grid`、`.rec-date-cell` 等被定義 4–5 次。
- `.btn`、`.ap-btn-wide`、`.cat-tab`、`.cv-tab` 的最終樣式依賴後段覆蓋。
- Primary 藍色漸層被硬編碼多次。
- Layout 的 `.shell`、`.shell-main`、`.container` 同時存在於 `layout.css` 與 `main.css`。

整理原則：

1. 先把值抽成 token。
2. 再把相同互動狀態合併。
3. 頁面專屬 layout 留在頁面 selector。
4. 不用 `!important` 作為新架構的預設手段。
5. 每次移除舊 rule 前，先確認新 token / component rule 已覆蓋同一狀態。
6. 視覺重構與內容功能修改分開提交。
