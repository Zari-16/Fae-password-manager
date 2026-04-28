# Browser Extension Architecture

Starter architecture for the Fae Password Manager browser extension (Chrome/Firefox/Edge/Safari).

## Structure

```
extension/
├── manifest.json          # Extension manifest (MV3)
├── background/
│   └── service-worker.ts  # Background service worker
├── content/
│   └── autofill.ts        # Page autofill injection
├── popup/
│   ├── index.html         # Extension popup
│   └── popup.tsx          # Popup React app
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## manifest.json (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "Fae Password Manager",
  "version": "1.0.0",
  "description": "Zero-knowledge password manager",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/autofill.js"],
    "run_at": "document_idle"
  }],
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  }
}
```

## Security Model

- Extension communicates with the main PWA via `chrome.storage.local` for encrypted vault sync
- Message passing for autofill requests
- The vault key is NEVER stored in extension storage
- Credentials injected via secure DOM manipulation, never stored in content script memory
