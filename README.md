# KamCo Store App

A cross-platform e-commerce storefront for the [KamCo API](https://github.com/companysibex-png/KamCo) — **one React codebase** that ships to every platform:

| Platform | How | Status |
|---|---|---|
| 🌐 **Web** | Static hosting (GitHub Pages included) | ✅ CI/CD ready |
| 📱 **PWA** | `vite-plugin-pwa` — installable, offline-capable, auto-updating | ✅ built in |
| 🤖 **Android (TWA)** | Bubblewrap — trusted web activity from the live PWA URL | ✅ config ready |
| 🤖 **Android (native shell)** | Capacitor project (`android/`) — open in Android Studio | ✅ included |
| 🍎 **iOS** | Capacitor project (`ios/`) — open in Xcode on a Mac | ✅ included |
| 🪟 **Windows** | PWABuilder → MSIX from the live PWA URL | ✅ documented |

![React](https://img.shields.io/badge/React-19-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Vite](https://img.shields.io/badge/Vite-8-646CFF) ![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8) ![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF)

## ✨ Features

- **Bilingual UI (fa / en)** with a one-tap language switch and full **RTL ↔ LTR** flip; bundled Vazirmatn font, Persian numerals & currency formatting
- **Product catalog** — search, category filter, price/name sorting, pagination
- **Cart & checkout** — quantity stepper, stock-aware, order creation against the KamCo API
- **Auth** — login / register, JWT persisted with expiry, order history with status badges
- **Demo mode** — if the API is unreachable the app transparently falls back to sample data and shows a banner, so the deployed PWA always works
- **PWA** — service worker precaches the app shell, offline usage, install prompt on Android/Windows/iOS

## 🚀 Quick start (web)

```bash
npm install
cp .env.example .env      # point VITE_API_URL at your KamCo API (optional)
npm run dev               # http://localhost:5173
```

Without a running API the app runs in **Demo Mode** automatically.

## 🌐 Deploy the PWA (GitHub Pages)

The site is already deployed from the `gh-pages` branch (built with the Pages base path).

To add **automatic CI/CD on every push**, move `docs/deploy-pages.yml` to
`.github/workflows/deploy-pages.yml` (GitHub requires a token with the `workflow`
scope to push workflow files, which is why it ships in `docs/`), then set
**Settings → Pages → Source: GitHub Actions**.

Manual alternative on any static host: `npm run build` → deploy `dist/`.

## 🤖 Android — two options

### Option A: TWA (lightest — wraps the live PWA)

Requires the PWA URL above to be live, then:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://<username>.github.io/KamCo-App/manifest.webmanifest
bubblewrap build   # produces app-release-signed.apk / .aab
```

`twa-manifest.json` in this repo is pre-filled (package `com.kamco.store.twa`). You must also serve the
`assetlinks.json` from the PWA host — Bubblewrap prints the exact snippet and GitHub Pages serves
`.well-known/` paths fine.

### Option B: Capacitor native shell (full control)

```bash
npm run build
npx cap sync android
npx cap open android   # opens Android Studio → Run
```

The `android/` project is already generated (package `com.kamco.store`).

## 🍎 iOS

```bash
npm run build
npx cap sync ios
npx cap open ios   # requires macOS + Xcode
```

## 🪟 Windows (MSIX via PWABuilder)

1. Publish the PWA (GitHub Pages step above)
2. Open <https://www.pwabuilder.com> → enter the live URL → **Windows → MSIX**
3. Side-load or submit to the Microsoft Store

## 🔧 Configuration

| Setting | Where |
|---|---|
| API base URL | `.env` → `VITE_API_URL` (falls back to `http://localhost:5000`) |
| Capacitor app id / name | `capacitor.config.ts` |
| TWA package id / host | `twa-manifest.json` |
| Theme color / icons | `vite.config.ts` + `public/icons/` |

## 🗂 Structure

```
src/
├── api/          # typed API client + transparent demo-mode fallback
├── components/   # header, product card, SVG product art, demo banner
├── context/      # auth (JWT) + cart (localStorage-persisted)
├── i18n/         # fa/en dictionaries, RTL/LTR provider
├── pages/        # products, detail, cart, login, orders
└── styles/       # design tokens, light theme, logical (RTL-safe) CSS
```

## 📄 License

MIT — see [LICENSE](LICENSE).
