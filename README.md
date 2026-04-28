# ✨ Fae Password Manager

> Your magical vault for passwords — encrypted, private, and stored entirely under your control.

[![Deploy to GitHub Pages](https://github.com/Zari-16/Fae-password-manager/actions/workflows/deploy.yml/badge.svg)](https://github.com/Zari-16/Fae-password-manager/actions/workflows/deploy.yml)

---

## 🚀 Running the Website

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

Check your versions:

```bash
node --version
npm --version
```

---

### 1. Clone the Repository

```bash
git clone https://github.com/Zari-16/Fae-password-manager.git
cd Fae-password-manager
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Start the Development Server

```bash
npm run dev
```

Then open your browser and go to:

```
http://localhost:5173
```

The app will hot-reload automatically when you make changes.

---

### 4. Build for Production

```bash
npm run build
```

This generates an optimized static build in the `dist/` folder.

---

### 5. Preview the Production Build Locally

```bash
npm run preview
```

Then open:

```
http://localhost:4173
```

---

## 🌐 Deploying

### GitHub Pages (Automatic)

Every push to `main` triggers the GitHub Actions workflow and deploys automatically.

1. Push your changes to `main`
2. Go to your repo → **Settings** → **Pages**
3. Set **Source** to **GitHub Actions**
4. Your site will be live at:

```
https://zari-16.github.io/Fae-password-manager/
```

### GitHub Pages (Manual)

```bash
GITHUB_PAGES=true npm run build
```

Then upload the `dist/` folder to GitHub Pages.

### Vercel

```bash
npm install -g vercel
vercel --prod
```

The `vercel.json` config handles routing and security headers automatically.

---

## 📁 Project Structure

```
Fae-password-manager/
├── public/                  # Static assets (icons, PWA images)
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, TopBar
│   │   ├── ui/              # Modal, Toast, MagicBackground, PasswordStrengthMeter
│   │   └── vault/           # All dashboard views and forms
│   ├── pages/               # Home, Login, CreateAccount, Dashboard, LegalPage
│   ├── stores/              # Zustand state (auth, vault, ui)
│   ├── utils/               # Crypto (AES-256-GCM + PBKDF2), IndexedDB engine
│   └── types/               # TypeScript interfaces
├── extension/               # Browser extension starter (MV3)
├── .github/workflows/       # GitHub Actions CI/CD
├── vercel.json              # Vercel deployment config
├── vite.config.ts           # Vite + PWA config
└── tailwind.config.js       # Tailwind theme
```

---

## 🔐 Security Model

- **Zero-Knowledge** — passwords are encrypted on your device, we cannot access them
- **AES-256-GCM** — military-grade encryption for all vault data
- **PBKDF2-SHA256** — 310,000 iterations for master key derivation
- **Unique salt** (32 bytes) per account, **unique IV** (12 bytes) per encryption
- Master key lives in memory only — never stored, never transmitted
- Vault auto-locks after 15 minutes of inactivity
- Clipboard auto-clears after 30 seconds

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:5173` |
| `npm run build` | Build optimized production bundle to `dist/` |
| `npm run preview` | Preview production build at `localhost:4173` |
| `npm run lint` | Run ESLint checks |

---

## 🔮 Roadmap

- [ ] TOTP code generation (in-vault 2FA)
- [ ] WebAuthn / Passkey unlock
- [ ] Browser extension (Chrome / Firefox / Edge / Safari)
- [ ] End-to-end encrypted optional sync
- [ ] Breach monitoring (HaveIBeenPwned k-anonymity)
- [ ] Secure sharing via ECDH
- [ ] Emergency access
- [ ] Mobile biometric unlock (Face ID / Fingerprint)

---

## 📜 License

MIT — Free forever. Your security should never be paywalled.
