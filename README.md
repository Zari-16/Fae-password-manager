# ✨ Fae Password Manager

> Your magical vault for passwords — encrypted, private, and stored entirely under your control.

[![Deploy to GitHub Pages](https://github.com/your-username/Fae-password-manager/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/Fae-password-manager/actions/workflows/deploy.yml)

## 🔐 Security Model

- **Zero-Knowledge**: Your passwords are encrypted on your device. We mathematically cannot access them.
- **AES-256-GCM** encryption for all vault data
- **PBKDF2-SHA256** with 310,000 iterations for key derivation
- **Unique salt** (32 bytes) per account, **unique IV** (12 bytes) per encryption
- Keys derived in-memory, never stored or transmitted
- Vault decrypted only in memory, cleared on lock
- Clipboard auto-clears after 30 seconds

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + Glassmorphism |
| Animation | Framer Motion |
| State | Zustand |
| Storage | IndexedDB (via idb) |
| Crypto | WebCrypto API |
| Forms | React Hook Form + Zod |
| PWA | vite-plugin-pwa + Workbox |

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Dashboard navigation
│   │   └── TopBar.tsx           # Search + actions bar
│   ├── ui/
│   │   ├── MagicBackground.tsx  # Animated particles
│   │   ├── Modal.tsx            # Reusable modal
│   │   ├── PasswordStrengthMeter.tsx
│   │   └── Toast.tsx            # Notification system
│   └── vault/
│       ├── CredentialCard.tsx   # Vault item display
│       ├── CredentialForm.tsx   # Add/edit credential
│       ├── VaultView.tsx        # Main vault list
│       ├── GeneratorView.tsx    # Password generator
│       ├── SecurityCenterView.tsx
│       ├── SecureNotesView.tsx
│       ├── PaymentCardsView.tsx
│       ├── ImportExportView.tsx
│       └── SettingsView.tsx
├── pages/
│   ├── Home.tsx                 # Marketing/landing page
│   ├── Login.tsx                # Vault unlock
│   ├── CreateAccount.tsx        # Account creation + recovery
│   ├── Dashboard.tsx            # Main app shell
│   └── LegalPage.tsx            # Privacy/Terms/Security
├── stores/
│   ├── auth.ts                  # Auth + key derivation
│   ├── vault.ts                 # Vault CRUD
│   └── ui.ts                    # Theme + navigation
├── utils/
│   ├── crypto.ts                # AES-256-GCM + PBKDF2
│   └── db.ts                    # IndexedDB vault engine
└── types/
    └── index.ts                 # TypeScript interfaces
```

## 🛠️ Development

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
npm run preview
```

## 🚀 Deploy to GitHub Pages

### Automatic (GitHub Actions)

1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Enable GitHub Pages in repo Settings → Pages → Source: GitHub Actions

### Manual

```bash
GITHUB_PAGES=true npm run build
# Upload dist/ to GitHub Pages
```

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

The `vercel.json` config handles routing and security headers automatically.

## 🔮 Roadmap

- [ ] TOTP code generation (in-vault 2FA)
- [ ] WebAuthn / Passkey unlock
- [ ] Browser extension (Chrome/Firefox/Edge/Safari)
- [ ] End-to-end encrypted optional sync
- [ ] Secure sharing via ECDH
- [ ] Emergency access
- [ ] Mobile biometric unlock (Face ID / Fingerprint)
- [ ] Breach monitoring (HaveIBeenPwned k-anonymity)
- [ ] Admin analytics dashboard

## 📜 License

MIT — Free forever. Your security should never be paywalled.
