# 🔮 How Fae Password Manager Works

This document explains how the app works — from the moment you open it to how your passwords are stored, encrypted, and retrieved.

---

## 🗺️ Overview

Fae is a **local-first, zero-knowledge password manager**. Everything happens on your device. There is no server that stores your passwords, no account on our end, and no way for anyone — including us — to read your vault.

```
Your Device
┌─────────────────────────────────────────┐
│                                         │
│   Master Password                       │
│        │                                │
│        ▼                                │
│   PBKDF2 Key Derivation                 │
│        │                                │
│        ▼                                │
│   256-bit Encryption Key (in memory)    │
│        │                                │
│        ▼                                │
│   AES-256-GCM Encrypt / Decrypt         │
│        │                                │
│        ▼                                │
│   IndexedDB (encrypted blob on disk)    │
│                                         │
└─────────────────────────────────────────┘
         ▲
         │  Nothing leaves this box
```

---

## 📄 Pages

### 🏠 Home Page
The landing page. It explains what Fae is, how it works, and why local-first storage is safer than cloud storage. From here you can:
- **Create a vault** — set up a new account
- **Login** — unlock an existing vault
- Read the **Privacy Policy**, **Terms of Use**, and **Security Practices**

---

### 🧙 Create Account
This is where your vault is born. Here is what happens step by step:

1. You enter a **username**, optional **email**, and a **master password**
2. A **password strength meter** shows your entropy score in real time
3. On submit, the app:
   - Generates a **random 32-byte salt** unique to your account
   - Runs **PBKDF2-SHA256** with 310,000 iterations to derive a 256-bit encryption key from your master password + salt
   - Encrypts a known sentinel value with that key to use as a **password verifier**
   - Stores the salt and verifier in IndexedDB — **never the password itself**
4. A **12-word recovery phrase** is generated and shown to you
   - You must save this before continuing
   - It is the only way to recover your account if you forget your master password
5. You are taken into your vault

---

### 🔓 Login
When you return to the app:

1. You enter your **username** and **master password**
2. The app loads your **salt** from IndexedDB
3. It re-derives the encryption key using PBKDF2 (same process as account creation)
4. It attempts to decrypt the **sentinel value** — if it matches, the password is correct
5. The key is held **in memory only** for the duration of your session
6. After **5 failed attempts**, login is locked out to prevent brute force

---

### 🏛️ Dashboard
The main app. It has a sidebar for navigation and a top bar with search and a lock button. All data shown here is **decrypted in memory** — nothing is written to the DOM in plaintext in a way that persists.

The vault **auto-locks after 15 minutes** of inactivity, wiping the key from memory and returning you to the login screen.

---

## 🔑 Vault Features

### Credentials
Each saved credential can store:
- Website name and URL
- Username and email
- Password (with show/hide toggle)
- Notes
- Tags and category
- TOTP secret (for 2FA codes)
- Custom fields
- Favorite flag

**Actions available on each credential:**
- Copy username or password to clipboard (auto-clears after 30 seconds)
- Reveal password temporarily
- Edit or delete
- Favorite or archive
- View password history (last 10 changes tracked automatically)

---

### 🔐 Password Generator
Generates cryptographically secure passwords using the **WebCrypto API** (`crypto.getRandomValues`). Options include:

- **Length** — slider from 8 to 64 characters
- **Character sets** — uppercase, lowercase, numbers, symbols
- **Avoid ambiguous characters** — removes characters like `l`, `1`, `O`, `0` that look similar
- **Passphrase mode** — generates a memorable multi-word passphrase (e.g. `frost-river-amber-eclipse`)

The entropy (in bits) is displayed so you can see exactly how strong the password is.

---

### 📝 Secure Notes
Store any sensitive text — API keys, software licences, private notes — encrypted in your vault alongside your passwords.

---

### 💳 Payment Cards
Store card details (number, expiry, CVV, cardholder name) with:
- Visual card display with card-type gradients
- Masked card number by default
- Reveal and copy actions

---

### 🛡️ Security Center
Analyses your entire vault and reports:

| Check | What it detects |
|-------|----------------|
| Weak passwords | Passwords with low entropy score |
| Reused passwords | The same password used on multiple sites |
| Outdated passwords | Passwords not changed in over 90 days |
| Breach detection | Checks against known data breaches using k-anonymity (your password is never sent — only the first 5 characters of its SHA-1 hash) |

A **security score out of 100** is calculated based on the issues found.

---

### 📦 Import / Export
- **Export** — downloads your entire vault as an encrypted JSON file. The file is unreadable without your master password.
- **Import** — restores from a backup file. Supports **merge** (adds new items without overwriting) or **replace** (overwrites current vault).

The export file always includes this notice:
> *"This file is encrypted. Only your master password can unlock it."*

---

### ⚙️ Settings
- Change your master password (re-derives the key and re-encrypts the vault)
- Toggle dark / light theme
- Set up two-factor authentication
- Delete your account and all vault data permanently

---

## 🔒 Encryption — In Depth

### Key Derivation
```
Master Password + Salt (32 bytes)
        │
        ▼
  PBKDF2-SHA256
  310,000 iterations
        │
        ▼
  256-bit AES Key (never stored)
```

### Vault Encryption
```
Vault Data (JSON string)
        │
        ▼
  Random IV (12 bytes, unique per save)
        │
        ▼
  AES-256-GCM Encrypt
        │
        ▼
  IV + Ciphertext (base64 stored in IndexedDB)
```

### Why AES-256-GCM?
- **AES-256** — 256-bit key, effectively unbreakable by brute force
- **GCM mode** — provides both encryption and authentication, meaning tampered data is detected and rejected
- **Unique IV per operation** — even if you save the same password twice, the ciphertext is different each time

### Why PBKDF2 with 310,000 iterations?
Deriving a key slowly is intentional. It means an attacker who steals your encrypted vault file would need 310,000 hash computations just to test a single password guess. This makes brute-force attacks computationally expensive.

---

## 🧠 What Stays in Memory vs What Is Stored

| Data | In Memory | In IndexedDB | Transmitted |
|------|-----------|--------------|-------------|
| Master password | During login only | ❌ Never | ❌ Never |
| Encryption key | While vault is unlocked | ❌ Never | ❌ Never |
| Vault data (plaintext) | While vault is unlocked | ❌ Never | ❌ Never |
| Vault data (encrypted) | ✅ Yes | ✅ Yes | ❌ Never |
| Salt | ✅ Yes | ✅ Yes | ❌ Never |
| Password verifier | ✅ Yes | ✅ Yes | ❌ Never |
| Recovery phrase | Shown once at creation | ❌ Never (encrypted) | ❌ Never |

---

## 📱 PWA — Installing as an App

Fae is a **Progressive Web App (PWA)**. You can install it on any device and use it like a native app:

- **Desktop (Chrome/Edge)** — click the install icon in the address bar
- **Android** — tap the browser menu → "Add to Home Screen"
- **iPhone/iPad** — tap the Share button → "Add to Home Screen"

Once installed, the app works **fully offline**. Your vault is always accessible even without an internet connection.

---

## 🔮 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| UI Framework | React 18 + TypeScript | Component model, type safety |
| Build Tool | Vite 5 | Fast dev server, optimized builds |
| Styling | Tailwind CSS | Utility-first, consistent design |
| Animations | Framer Motion | Smooth, physics-based transitions |
| State Management | Zustand | Lightweight, no boilerplate |
| Local Storage | IndexedDB via `idb` | Large encrypted blobs, async API |
| Cryptography | WebCrypto API | Native browser crypto, hardware accelerated |
| Forms | React Hook Form + Zod | Validation, type-safe schemas |
| PWA | vite-plugin-pwa + Workbox | Offline support, installable |

---

## 🌐 Deployment

The app is a fully static site — just HTML, CSS, and JavaScript. It can be hosted anywhere:

- **GitHub Pages** — free, auto-deploys on every push to `main` via GitHub Actions
- **Vercel** — zero-config deployment with security headers pre-configured in `vercel.json`
- **Any static host** — Netlify, Cloudflare Pages, S3, etc.

Because there is no backend, there is nothing to scale, no database to secure, and no server to maintain.
