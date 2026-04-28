import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Shield, Lock, Zap, Globe, Smartphone, ChevronDown,
  CheckCircle, Star, ArrowRight,
  Key, RefreshCw,
  Heart, MessageSquarePlus, Send, X, Mail, Instagram, Linkedin, ExternalLink
} from 'lucide-react'
import { MagicBackground } from '../components/ui/MagicBackground'

interface Feedback {
  id: string
  name: string
  role: string
  text: string
  stars: number
  date: string
}

const FEEDBACK_KEY = 'fae-public-feedback'

function loadFeedback(): Feedback[] {
  try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) ?? '[]') } catch { return [] }
}

function saveFeedback(list: Feedback[]) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list))
}

interface Props {
  onNavigate: (page: string) => void
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } }),
}

const features = [
  { icon: Shield, title: 'Zero-Knowledge', desc: 'Your passwords are encrypted locally. We mathematically cannot access your data.', color: 'text-purple-400' },
  { icon: Lock, title: 'AES-256-GCM', desc: 'Military-grade encryption with PBKDF2 key derivation. 310,000 iterations.', color: 'text-pink-400' },
  { icon: Zap, title: 'Instant Search', desc: 'Find any credential in milliseconds with real-time fuzzy search.', color: 'text-blue-400' },
  { icon: Globe, title: 'Works Everywhere', desc: 'Desktop, mobile, tablet. Install as a PWA for a native app experience.', color: 'text-green-400' },
  { icon: Smartphone, title: 'Biometric Unlock', desc: 'Face ID and fingerprint support via WebAuthn for seamless access.', color: 'text-yellow-400' },
  { icon: RefreshCw, title: 'Auto Backup', desc: 'Export your encrypted vault anytime. Only your master password unlocks it.', color: 'text-cyan-400' },
]

const steps = [
  { n: '01', title: 'Create Your Vault', desc: 'Choose a strong master password. We derive a 256-bit encryption key from it using PBKDF2.' },
  { n: '02', title: 'Add Credentials', desc: 'Store passwords, notes, and cards. Everything is encrypted before touching storage.' },
  { n: '03', title: 'Access Anywhere', desc: 'Your encrypted vault lives on your device. Install as a PWA for offline access.' },
]

const faqs = [
  { q: 'What happens if I forget my master password?', a: 'Your vault is encrypted with your master password. Without it, the data cannot be decrypted — this is by design. Use your recovery phrase to reset your account shell.' },
  { q: 'Can Fae see my passwords?', a: 'No. Encryption happens entirely on your device. We never receive your master password or any plaintext credentials. This is mathematically guaranteed.' },
  { q: 'Where is my data stored?', a: 'Your encrypted vault is stored in your browser\'s IndexedDB — on your device only. No cloud servers, no central database.' },
  { q: 'Is Fae free?', a: 'Yes. Fae is completely free and open source. Your security should never be paywalled.' },
  { q: 'What encryption does Fae use?', a: 'AES-256-GCM for vault encryption, PBKDF2 with SHA-256 and 310,000 iterations for key derivation, and unique salts and IVs per operation.' },
]

function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => loadFeedback())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', text: '', stars: 5 })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!form.name.trim() || !form.text.trim()) return
    const newFeedback: Feedback = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      role: form.role.trim(),
      text: form.text.trim(),
      stars: form.stars,
      date: new Date().toLocaleDateString(),
    }
    const updated = [newFeedback, ...feedbacks]
    saveFeedback(updated)
    setFeedbacks(updated)
    setForm({ name: '', role: '', text: '', stars: 5 })
    setShowForm(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section id="feedback" className="relative z-10 py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12"
        >
          <h2 className="text-4xl font-serif font-bold mb-3">
            What People <span className="gradient-text">Are Saying</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Real feedback from real users. No fake reviews — only what people actually share.
          </p>
        </motion.div>

        {/* Submit button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-fae flex items-center gap-2 text-sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Share Your Feedback
          </button>
        </div>

        {/* Success message */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-md mx-auto mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm text-center flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Thank you! Your feedback has been posted.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="max-w-lg mx-auto card-fae mb-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Leave Feedback</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Star rating */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, stars: s }))}>
                      <Star className={`w-6 h-6 transition-colors ${
                        s <= form.stars ? 'text-yellow-400 fill-current' : 'text-gray-600'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Your Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-fae text-sm"
                    placeholder="Jane D."
                    maxLength={40}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Role / Title</label>
                  <input
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="input-fae text-sm"
                    placeholder="Developer"
                    maxLength={40}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Your Feedback *</label>
                <textarea
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  className="input-fae text-sm resize-none h-24"
                  placeholder="Share your experience with Fae..."
                  maxLength={300}
                />
                <div className="text-xs text-gray-600 text-right mt-1">{form.text.length}/300</div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.text.trim()}
                className="btn-fae w-full flex items-center justify-center gap-2 text-sm py-2.5 disabled:opacity-40"
              >
                <Send className="w-4 h-4" /> Post Feedback
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback cards */}
        {feedbacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center py-12"
          >
            <MessageSquarePlus className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-500 text-sm">No feedback yet. Be the first to share your experience!</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedbacks.map((fb, i) => (
              <motion.div
                key={fb.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="card-fae"
              >
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${
                      s <= fb.stars ? 'text-yellow-400 fill-current' : 'text-gray-700'
                    }`} />
                  ))}
                </div>
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">"{fb.text}"</p>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-medium text-white text-sm">{fb.name}</div>
                    {fb.role && <div className="text-xs text-gray-500">{fb.role}</div>}
                  </div>
                  <div className="text-xs text-gray-600">{fb.date}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function Home({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-fae-dark text-white overflow-x-hidden">
      <MagicBackground />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-fae-button flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-bold text-lg gradient-text">Fae</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('login')} className="btn-ghost text-sm px-4 py-2">
            Login
          </button>
          <button onClick={() => onNavigate('create-account')} className="btn-fae text-sm">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 text-center pt-10">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-500/30 text-purple-300 text-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Zero-Knowledge · Local-First · Open Source
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight"
        >
          Your Magical{' '}
          <span className="gradient-text">Password Vault</span>
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
        >
          Encrypted, private, and stored entirely under your control.
          No servers. No cloud. No compromise.
        </motion.p>

        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => onNavigate('create-account')}
            className="btn-fae flex items-center gap-2 text-base px-8 py-3"
          >
            <Sparkles className="w-5 h-5" />
            Create Your Vault
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 px-8 py-3 rounded-xl glass border border-white/20 text-white hover:bg-white/10 transition-all text-base"
          >
            <Lock className="w-5 h-5" />
            Unlock Vault
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="flex flex-wrap justify-center gap-8 mt-16 text-center"
        >
          {[
            { value: 'AES-256', label: 'Encryption' },
            { value: '310K', label: 'PBKDF2 Iterations' },
            { value: '100%', label: 'Local Storage' },
            { value: '0', label: 'Servers Involved' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={5}
          className="mt-16"
        >
          <a href="#features" className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors">
            <span className="text-xs">Discover more</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Everything You Need,{' '}
              <span className="gradient-text">Nothing You Don't</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Built by security engineers who believe privacy is a right, not a feature.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card-fae group"
              >
                <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Simple as <span className="gradient-text">Magic</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-6 card-fae"
              >
                <div className="text-4xl font-serif font-bold gradient-text opacity-60 shrink-0 w-12">{s.n}</div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Deep Dive */}
      <section id="security" className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Security <span className="gradient-text">Transparency</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We believe you deserve to know exactly how your data is protected.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-fae space-y-4"
            >
              <h3 className="font-semibold text-purple-300 flex items-center gap-2">
                <Key className="w-4 h-4" /> Encryption Model
              </h3>
              {[
                'AES-256-GCM symmetric encryption',
                'PBKDF2-SHA256 with 310,000 iterations',
                'Unique 32-byte salt per account',
                'Unique 12-byte IV per encryption',
                'Keys derived in-memory, never stored',
                'WebCrypto API — hardware accelerated',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  {item}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="card-fae space-y-4"
            >
              <h3 className="font-semibold text-pink-300 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Zero-Knowledge Guarantees
              </h3>
              {[
                'Master password never transmitted',
                'No plaintext data on any server',
                'Vault decrypted only in memory',
                'Memory cleared on vault lock',
                'No analytics containing secrets',
                'Clipboard auto-clears after 30s',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <FeedbackSection />

      {/* Contact */}
      <section id="contact" className="relative z-10 py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10"
          >
            <h2 className="text-4xl font-serif font-bold mb-3">
              Get in <span className="gradient-text">Touch</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Have a question, suggestion, or just want to say hi? Reach out anytime.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-fae space-y-4"
          >
            {/* Profile */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                ✨
              </div>
              <div>
                <div className="font-semibold text-white">Fae</div>
                <a
                  href="https://zari-16.github.io/Profile/"
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-0.5"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Contact links */}
            <div className="space-y-3">
              <a
                href="mailto:maudarbuxzariyat@gmail.com"
                className="flex items-center gap-4 p-3 rounded-xl glass border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">Email</div>
                  <div className="text-sm text-white truncate">maudarbuxzariyat@gmail.com</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-400 transition-colors shrink-0" />
              </a>

              <a
                href="https://www.instagram.com/_.itz.fae_?igsh=MW40M3l6bW5iOTJwag=="
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-xl glass border border-white/10 hover:border-pink-500/40 hover:bg-white/10 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0">
                  <Instagram className="w-4 h-4 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">Instagram</div>
                  <div className="text-sm text-white">@_.itz.fae_</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-pink-400 transition-colors shrink-0" />
              </a>

              <a
                href="https://www.linkedin.com/in/zariyat1608"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-xl glass border border-white/10 hover:border-blue-500/40 hover:bg-white/10 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5">LinkedIn</div>
                  <div className="text-sm text-white">zariyat1608</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors shrink-0" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif font-bold text-center mb-12"
          >
            <span className="gradient-text">Frequently Asked</span> Questions
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={faq.q}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="card-fae group cursor-pointer"
              >
                <summary className="font-medium text-white list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="card-fae p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-fae-button opacity-10 rounded-2xl" />
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-float" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Start for Free, <span className="gradient-text">Forever</span>
            </h2>
            <p className="text-gray-400 mb-8">
              No credit card. No account required on our servers. Just you and your encrypted vault.
            </p>
            <button
              onClick={() => onNavigate('create-account')}
              className="btn-fae flex items-center gap-2 mx-auto text-base px-8 py-3"
            >
              Create Your Vault <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-fae-button flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-serif font-bold gradient-text">Fae Password Manager</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <button onClick={() => onNavigate('privacy')} className="hover:text-gray-300 transition-colors">Privacy Policy</button>
              <button onClick={() => onNavigate('terms')} className="hover:text-gray-300 transition-colors">Terms of Use</button>
              <button onClick={() => onNavigate('security-policy')} className="hover:text-gray-300 transition-colors">Security</button>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              Made with <Heart className="w-3.5 h-3.5 text-pink-500 mx-1" /> for privacy
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
