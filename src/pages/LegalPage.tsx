import { ArrowLeft } from 'lucide-react'
import { MagicBackground } from '../components/ui/MagicBackground'

interface Props {
  onNavigate: (page: string) => void
  page: 'privacy' | 'terms' | 'security-policy'
}

const content = {
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'January 2025',
    sections: [
      {
        heading: 'Our Core Commitment',
        body: 'Fae Password Manager is built on a zero-knowledge architecture. We do not collect, store, or have access to your passwords, vault data, or any sensitive credentials. Your data is encrypted on your device before any storage occurs.',
      },
      {
        heading: 'Data We Do Not Collect',
        body: 'We do not collect: passwords, vault contents, master passwords, encryption keys, personal credentials, payment information stored in your vault, or any plaintext sensitive data.',
      },
      {
        heading: 'Local Storage Only',
        body: 'All vault data is stored exclusively in your browser\'s IndexedDB using AES-256-GCM encryption. Your master password never leaves your device. We have no servers that store your vault.',
      },
      {
        heading: 'GDPR Compliance',
        body: 'We comply with the General Data Protection Regulation (GDPR). Since we do not process personal data on our servers, the data controller is you — the user. You have full control over your data at all times.',
      },
      {
        heading: 'CCPA Compliance',
        body: 'Under the California Consumer Privacy Act (CCPA), you have the right to know what data is collected. We collect no personal data. Your vault data never reaches our systems.',
      },
      {
        heading: 'Cookies',
        body: 'We use only essential functional cookies required for the application to operate. No tracking cookies, no advertising cookies, no third-party analytics that receive personal data.',
      },
      {
        heading: 'Data Minimization',
        body: 'We follow Privacy by Design principles. We collect the absolute minimum data necessary. Optional fields like email are stored locally only and used solely for account recovery purposes.',
      },
      {
        heading: 'Contact',
        body: 'For privacy inquiries, please open an issue on our GitHub repository. We are committed to transparency.',
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    lastUpdated: 'January 2025',
    sections: [
      {
        heading: 'Acceptance',
        body: 'By using Fae Password Manager, you agree to these terms. If you do not agree, please do not use the application.',
      },
      {
        heading: 'Zero-Knowledge Acknowledgment',
        body: 'You understand and accept that Fae uses zero-knowledge encryption. This means: (1) We cannot access your vault data. (2) If you lose your master password and recovery phrase, your vault data cannot be recovered. (3) This is a security feature, not a limitation.',
      },
      {
        heading: 'Your Responsibilities',
        body: 'You are responsible for: maintaining the security of your master password, storing your recovery phrase safely, keeping your device secure, and creating regular encrypted backups of your vault.',
      },
      {
        heading: 'No Warranty',
        body: 'Fae Password Manager is provided "as is" without warranty of any kind. We make no guarantees about availability, accuracy, or fitness for a particular purpose.',
      },
      {
        heading: 'Limitation of Liability',
        body: 'To the maximum extent permitted by law, Fae and its contributors shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the application.',
      },
      {
        heading: 'Open Source',
        body: 'Fae Password Manager is open source software. You may review, audit, and contribute to the codebase. The source code is available on GitHub.',
      },
      {
        heading: 'Changes',
        body: 'We may update these terms. Continued use of the application after changes constitutes acceptance of the new terms.',
      },
    ],
  },
  'security-policy': {
    title: 'Security Practices',
    lastUpdated: 'January 2025',
    sections: [
      {
        heading: 'Encryption Standard',
        body: 'All vault data is encrypted using AES-256-GCM, the same standard used by governments and financial institutions worldwide. Each encryption operation uses a unique 12-byte initialization vector (IV) to prevent pattern analysis.',
      },
      {
        heading: 'Key Derivation',
        body: 'Your master password is never stored. Instead, we use PBKDF2 with SHA-256 and 310,000 iterations (exceeding OWASP 2023 recommendations) to derive a 256-bit encryption key. A unique 32-byte random salt per account prevents rainbow table attacks.',
      },
      {
        heading: 'Zero-Knowledge Architecture',
        body: 'Encryption and decryption happen exclusively on your device using the WebCrypto API. Your master password and derived keys never leave your device. Even if our infrastructure were compromised, attackers would only find encrypted data they cannot read.',
      },
      {
        heading: 'Memory Security',
        body: 'Vault data is decrypted only in memory and cleared when you lock the vault. We implement automatic vault locking after 15 minutes of inactivity. Clipboard contents are automatically cleared after 30 seconds.',
      },
      {
        heading: 'Attack Mitigations',
        body: 'We implement: Content Security Policy (CSP) headers, XSS sanitization, clickjacking protection via X-Frame-Options, HTTPS enforcement, brute-force lockout after 5 failed attempts, and no unsafe-eval or inline scripts.',
      },
      {
        heading: 'Breach Detection',
        body: 'Our breach detection uses the k-anonymity model (similar to HaveIBeenPwned). Only the first 5 characters of a SHA-1 hash are sent to check for breaches — your actual passwords are never transmitted.',
      },
      {
        heading: 'Responsible Disclosure',
        body: 'If you discover a security vulnerability, please report it responsibly by opening a private security advisory on our GitHub repository. We commit to acknowledging reports within 48 hours and resolving critical issues within 7 days.',
      },
      {
        heading: 'Audit',
        body: 'Our source code is fully open source and available for public audit. We encourage security researchers to review our cryptographic implementation. We follow OWASP guidelines and industry best practices.',
      },
    ],
  },
}

export default function LegalPage({ onNavigate, page }: Props) {
  const data = content[page]

  return (
    <div className="min-h-screen bg-fae-dark text-white">
      <MagicBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <h1 className="text-4xl font-serif font-bold gradient-text mb-2">{data.title}</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: {data.lastUpdated}</p>

        <div className="space-y-8">
          {data.sections.map((section) => (
            <div key={section.heading} className="card-fae">
              <h2 className="text-lg font-semibold text-white mb-3">{section.heading}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
