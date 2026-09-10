# 生物統計學(一) 互動教材

國立高雄科技大學　漁業生產與管理系

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

## 發布到 GitHub Pages

```bash
cd web
git init
git add .
git commit -m "生物統計學(一) 互動教材"
git branch -M main
git remote add origin https://github.com/<你的帳號>/<repo 名稱>.git
git push -u origin main
```

推上去之後到 repo 的 **Settings → Pages**，
Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)`，儲存。

約一分鐘後即可由 `https://<你的帳號>.github.io/<repo 名稱>/` 開啟。

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
