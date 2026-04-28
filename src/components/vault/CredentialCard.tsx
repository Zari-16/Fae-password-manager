import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Eye, EyeOff, Copy, Edit, Trash2, Star, ExternalLink,
  MoreVertical, Archive, CheckCircle, Clock
} from 'lucide-react'
import { useVaultStore } from '../../stores/vault'
import { useUIStore } from '../../stores/ui'
import { copyWithAutoClear } from '../../utils/crypto'
import { toast } from '../ui/Toast'
import type { Credential } from '../../types'

const CATEGORY_COLORS: Record<string, string> = {
  Login: 'badge-purple',
  Social: 'badge-pink',
  Finance: 'badge-green',
  Work: 'badge-blue',
  Shopping: 'badge-yellow',
  Email: 'badge-blue',
  Gaming: 'badge-purple',
  Other: 'badge-blue',
}

interface Props {
  credential: Credential
  index: number
}

export function CredentialCard({ credential, index }: Props) {
  const [showPw, setShowPw] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const { deleteCredential, toggleFavorite, archiveCredential } = useVaultStore()
  const { setView } = useUIStore()

  const copy = async (text: string, label: string) => {
    await copyWithAutoClear(text, 30)
    setCopied(label)
    toast.success(`${label} copied! Clears in 30s.`)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = async () => {
    if (confirm(`Delete "${credential.name}"? This cannot be undone.`)) {
      await deleteCredential(credential.id)
      toast.success('Credential deleted.')
    }
  }

  const favicon = credential.url
    ? `https://www.google.com/s2/favicons?domain=${new URL(credential.url.startsWith('http') ? credential.url : `https://${credential.url}`).hostname}&sz=32`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="card-fae group relative"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0 overflow-hidden">
          {favicon ? (
            <img src={favicon} alt="" className="w-5 h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <span className="text-lg">{credential.name[0]?.toUpperCase()}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{credential.name}</h3>
            {credential.favorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-current shrink-0" />}
            <span className={`${CATEGORY_COLORS[credential.category] ?? 'badge-blue'} ml-auto shrink-0`}>
              {credential.category}
            </span>
          </div>

          {credential.url && (
            <a
              href={credential.url.startsWith('http') ? credential.url : `https://${credential.url}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-purple-400 flex items-center gap-1 mb-2 w-fit"
            >
              {credential.url} <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Username */}
            {credential.username && (
              <div className="flex items-center gap-2 glass rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-500 w-16 shrink-0">Username</span>
                <span className="text-sm text-gray-200 truncate flex-1">{credential.username}</span>
                <button onClick={() => copy(credential.username, 'Username')}
                  className="text-gray-500 hover:text-white shrink-0">
                  {copied === 'Username' ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Password */}
            {credential.password && (
              <div className="flex items-center gap-2 glass rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-500 w-16 shrink-0">Password</span>
                <span className="text-sm text-gray-200 flex-1 font-mono">
                  {showPw ? credential.password : '••••••••••'}
                </span>
                <button onClick={() => setShowPw(!showPw)}
                  className="text-gray-500 hover:text-white shrink-0">
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => copy(credential.password, 'Password')}
                  className="text-gray-500 hover:text-white shrink-0">
                  {copied === 'Password' ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {credential.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {credential.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setView('edit-credential', credential.id)}
            className="btn-ghost p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit className="w-4 h-4" />
          </button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="btn-ghost p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 w-44 glass-strong rounded-xl shadow-xl z-20 py-1 border border-white/10">
                <button onClick={() => { toggleFavorite(credential.id); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  {credential.favorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button onClick={() => { archiveCredential(credential.id); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5" />
                  {credential.archived ? 'Unarchive' : 'Archive'}
                </button>
                {credential.passwordHistory.length > 0 && (
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Password History
                  </button>
                )}
                <div className="border-t border-white/10 my-1" />
                <button onClick={() => { handleDelete(); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Updated time */}
      <div className="mt-2 text-xs text-gray-600">
        Updated {new Date(credential.updatedAt).toLocaleDateString()}
      </div>
    </motion.div>
  )
}
