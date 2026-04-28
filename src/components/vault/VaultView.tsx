import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Lock, Star, Archive } from 'lucide-react'
import { useVaultStore } from '../../stores/vault'
import { useUIStore } from '../../stores/ui'
import { CredentialCard } from '../vault/CredentialCard'

interface Props {
  searchQuery: string
}

const FILTERS = ['All', 'Favorites', 'Login', 'Social', 'Finance', 'Work', 'Shopping', 'Email', 'Gaming', 'Other']

export function VaultView({ searchQuery }: Props) {
  const [filter, setFilter] = useState('All')
  const [showArchived, setShowArchived] = useState(false)
  const { credentials } = useVaultStore()
  const { setView } = useUIStore()

  const filtered = useMemo(() => {
    return credentials.filter((c) => {
      if (!showArchived && c.archived) return false
      if (filter === 'Favorites' && !c.favorite) return false
      if (filter !== 'All' && filter !== 'Favorites' && c.category !== filter) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.url.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [credentials, filter, searchQuery, showArchived])

  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    credentials.forEach((c) => { counts[c.category] = (counts[c.category] ?? 0) + 1 })
    return counts
  }, [credentials])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Your Vault</h1>
          <p className="text-sm text-gray-400 mt-0.5">{credentials.filter(c => !c.archived).length} credentials stored securely</p>
        </div>
        <button onClick={() => setView('add-credential')} className="btn-fae flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Credential
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                : 'glass text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            {f === 'Favorites' && <Star className="w-3 h-3 inline mr-1 text-yellow-400" />}
            {f}
            {f !== 'All' && f !== 'Favorites' && categories[f] ? (
              <span className="ml-1 opacity-60">({categories[f]})</span>
            ) : null}
          </button>
        ))}
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
            showArchived ? 'bg-gray-500/30 text-gray-300 border border-gray-500/40' : 'glass text-gray-500 border border-white/10'
          }`}
        >
          <Archive className="w-3 h-3" /> Archived
        </button>
      </div>

      {/* Credentials */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((cred, i) => (
            <CredentialCard key={cred.id} credential={cred} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery ? 'No results found' : 'Your vault is empty'}
          </h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            {searchQuery
              ? `No credentials match "${searchQuery}"`
              : 'Add your first credential to start securing your digital life.'}
          </p>
          {!searchQuery && (
            <button onClick={() => setView('add-credential')} className="btn-fae flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Your First Credential
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
