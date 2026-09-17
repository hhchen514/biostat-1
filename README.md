# 生物統計學(一) 互動教材

國立高雄科技大學　漁業生產與管理系

**線上網址：<https://hhchen514.github.io/biostat-1/>**

| Lab | 週次 | 網址 |
|---|---|---|
| 課程主目錄 | — | <https://hhchen514.github.io/biostat-1/> |
| Lab 01　資料的性質、收集與整理 | W1–W6 | <https://hhchen514.github.io/biostat-1/lab01-data-and-sampling/> |
| Lab 02　資料的描述 | W7–W10 | <https://hhchen514.github.io/biostat-1/lab02-descriptive/> |
| Lab 03　機率與機率分配 | W11–W15 | <https://hhchen514.github.io/biostat-1/lab03-probability/> |

## 目錄結構

```
web/
├── index.html                    課程主目錄（18 週進度、各 Lab 入口）
├── assets/
│   └── base.css                  共用設計系統（色彩 token、字體、版面元件）
├── lab01-data-and-sampling/      W1–6　資料的性質、收集與整理
│   ├── index.html
│   └── style.css                 本 lab 專屬元件
├── lab02-descriptive/            W7–10　資料的描述
│   ├── index.html
│   ├── style.css
│   └── script.js
└── lab03-probability/            W11–15　機率與機率分配
    ├── index.html
    ├── style.css
    └── script.js
```

## 部署到 GitHub Pages

repo：`git@github.com:hhchen514/biostat-1.git`（分支 `main`，Pages 由 `main` / `(root)` 發布）

### 日常更新（改完教材要上線時）

在 `web/` 目錄下執行：

```bash
git add -A && git commit -m "更新說明" && git push
```

推上去之後 GitHub Pages 會自動重新建置，**約 30 秒到 2 分鐘**生效。
瀏覽器可能有快取，確認時在網址後面加 `?v=2` 之類的參數強制重載。

驗證是否真的上線：

```bash
curl -s "https://hhchen514.github.io/biostat-1/lab03-probability/script.js?cb=$RANDOM" | grep -c ztTable
```

回傳大於 0 就代表新版已經生效。

### 首次建立（之後開生統二時照這個做）

```bash
cd web
git init
git branch -M main
git add .
git commit -m "生物統計學(二) 互動教材"
git remote add origin git@github.com:<帳號或組織>/<repo 名稱>.git
git push -u origin main
```

推上去之後到 repo 的 **Settings → Pages**，
Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)`，儲存。

> 用 SSH 網址（`git@github.com:`）而不是 HTTPS。
> GitHub 從 2021 年 8 月起就不接受密碼推送，HTTPS 要另外產生 token，SSH 金鑰比較省事。

### 網址是由帳號名稱決定的

Pages 網址的格式是 `https://<帳號或組織名稱>.github.io/<repo 名稱>/`，
帳號名稱直接出現在網址裡，**加副信箱或改顯示名稱都不會改變它**。

想換成別的網址只有三條路：

| 做法 | 結果 | 代價 |
|---|---|---|
| 改帳號名稱 | `<新名稱>.github.io/biostat-1/` | 舊的 `.github.io` 網址**不會轉址**，直接失效 |
| 轉移到 Organization | `<組織名稱>.github.io/biostat-1/` | 同上；但組織不綁個人信箱，日後交接容易 |
| 綁自訂網域 | 完全自訂，網址列看不到 github.io | 需要有網域；Settings → Pages → Custom domain |

**要換就趁早**——一旦網址寫進課程大綱、學生加了書籤，之後再改就會產生死連結。

## 注意事項

- 全部是靜態檔案，**不需要任何後端或建置工具**，直接推上去就能用。
- 字體由 Google Fonts 載入（Noto Sans TC／Noto Serif TC／IBM Plex Mono），需要網路連線。
  離線教室可考慮把字體檔下載到 `assets/fonts/` 並改寫 `base.css`。
- 設計已支援淺色／深色模式，會跟隨學生裝置的系統設定。
- 手機可用：768px 以下會自動切換為單欄版面。

## 改東西的時候

| 想改什麼 | 動哪個檔 |
|---|---|
| 配色、字體、按鈕、表格等共用外觀 | `assets/base.css` |
| 課程主目錄的內容與進度表 | `index.html` |
| 某個 lab 的內容與互動 | 該 lab 的 `index.html` |
| 某個 lab 專屬的樣式 | 該 lab 的 `style.css` |
| 某個 lab 的互動邏輯 | 該 lab 的 `script.js` |

## 另一種發布方式：Artifact

`_build-artifact.py` 會把某個 lab 的 CSS 與 JS 內嵌回單一 HTML 檔，
供不方便架站時直接分享：

```bash
python3 _build-artifact.py lab02-descriptive
```

輸出在 `../互動教材/`。**web/ 底下的版本是唯一的來源**，
改完之後重跑這個腳本即可，不要直接改產生出來的單檔。
