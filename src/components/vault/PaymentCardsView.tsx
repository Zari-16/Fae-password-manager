import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, CreditCard, Edit, Trash2, X, Save, Eye, EyeOff, Copy } from 'lucide-react'
import { useVaultStore } from '../../stores/vault'
import { copyWithAutoClear } from '../../utils/crypto'
import { toast } from '../ui/Toast'
import type { PaymentCard } from '../../types'

const CARD_TYPES = ['visa', 'mastercard', 'amex', 'discover', 'other'] as const

const CARD_GRADIENTS: Record<string, string> = {
  visa: 'from-blue-600 to-blue-900',
  mastercard: 'from-red-500 to-orange-600',
  amex: 'from-green-600 to-teal-800',
  discover: 'from-orange-500 to-yellow-600',
  other: 'from-purple-600 to-pink-700',
}

function maskCard(num: string) {
  const clean = num.replace(/\s/g, '')
  if (clean.length < 4) return num
  return '•••• •••• •••• ' + clean.slice(-4)
}

export function PaymentCardsView() {
  const { paymentCards, addPaymentCard, updatePaymentCard, deletePaymentCard } = useVaultStore()
  const [editing, setEditing] = useState<PaymentCard | null>(null)
  const [creating, setCreating] = useState(false)
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState<{ name: string; cardholderName: string; number: string; expiry: string; cvv: string; type: PaymentCard['type']; notes: string }>({ name: '', cardholderName: '', number: '', expiry: '', cvv: '', type: 'visa', notes: '' })

  const openCreate = () => {
    setForm({ name: '', cardholderName: '', number: '', expiry: '', cvv: '', type: 'visa', notes: '' })
    setCreating(true); setEditing(null)
  }
  const openEdit = (card: PaymentCard) => {
    setForm({ name: card.name, cardholderName: card.cardholderName, number: card.number, expiry: card.expiry, cvv: card.cvv, type: card.type, notes: card.notes })
    setEditing(card); setCreating(false)
  }

  const save = async () => {
    if (!form.name.trim()) { toast.error('Card name is required'); return }
    try {
      if (editing) {
        await updatePaymentCard(editing.id, form)
        toast.success('Card updated!')
      } else {
        await addPaymentCard(form)
        toast.success('Card saved!')
      }
      setEditing(null); setCreating(false)
    } catch { toast.error('Failed to save card.') }
  }

  const del = async (id: string) => {
    if (confirm('Delete this card?')) { await deletePaymentCard(id); toast.success('Card deleted.') }
  }

  const toggleShow = (id: string) => setShowNumbers(s => ({ ...s, [id]: !s[id] }))

  const showForm = creating || editing !== null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white mb-1">Payment Cards</h1>
          <p className="text-sm text-gray-400">{paymentCards.length} cards stored securely</p>
        </div>
        <button onClick={openCreate} className="btn-fae flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-fae mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">{editing ? 'Edit Card' : 'Add Card'}</h3>
            <button onClick={() => { setEditing(null); setCreating(false) }} className="btn-ghost p-1.5 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Card Nickname</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-fae" placeholder="My Visa Card" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Cardholder Name</label>
              <input value={form.cardholderName} onChange={e => setForm(f => ({ ...f, cardholderName: e.target.value }))} className="input-fae" placeholder="JOHN DOE" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Card Number</label>
              <input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} className="input-fae font-mono" placeholder="1234 5678 9012 3456" autoComplete="off" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Expiry</label>
              <input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} className="input-fae" placeholder="MM/YY" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">CVV</label>
              <input value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value }))} className="input-fae" placeholder="•••" type="password" autoComplete="off" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Card Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PaymentCard['type'] }))} className="input-fae">
                {CARD_TYPES.map(t => <option key={t} value={t} className="bg-fae-dark capitalize">{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditing(null); setCreating(false) }}
              className="flex-1 py-2 rounded-xl glass border border-white/20 text-sm text-gray-300 hover:text-white transition-all">Cancel</button>
            <button onClick={save} className="btn-fae flex-1 flex items-center justify-center gap-2 py-2 text-sm">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </motion.div>
      )}

      {paymentCards.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No payment cards yet</h3>
          <p className="text-gray-400 text-sm mb-6">Store your card details securely, encrypted in your vault.</p>
          <button onClick={openCreate} className="btn-fae flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add First Card
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paymentCards.map((card, i) => (
            <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative rounded-2xl p-5 bg-gradient-to-br ${CARD_GRADIENTS[card.type]} shadow-lg overflow-hidden group`}
            >
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white, transparent 50%)' }} />
              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-white/60 text-xs uppercase tracking-wider">{card.type}</div>
                    <div className="text-white font-medium">{card.name}</div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(card)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => del(card.id)} className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/30 text-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white font-mono text-lg tracking-widest">
                    {showNumbers[card.id] ? card.number : maskCard(card.number)}
                  </span>
                  <button onClick={() => toggleShow(card.id)} className="text-white/60 hover:text-white">
                    {showNumbers[card.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { copyWithAutoClear(card.number, 30); toast.success('Card number copied!') }}
                    className="text-white/60 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between text-white/80 text-sm">
                  <span>{card.cardholderName}</span>
                  <span>{card.expiry}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
