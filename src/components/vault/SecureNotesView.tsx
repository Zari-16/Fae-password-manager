import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, StickyNote, Edit, Trash2, X, Save } from 'lucide-react'
import { useVaultStore } from '../../stores/vault'
import { toast } from '../ui/Toast'
import type { SecureNote } from '../../types'

export function SecureNotesView() {
  const { secureNotes, addSecureNote, updateSecureNote, deleteSecureNote } = useVaultStore()
  const [editing, setEditing] = useState<SecureNote | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', tags: '' })

  const openCreate = () => { setForm({ title: '', content: '', tags: '' }); setCreating(true); setEditing(null) }
  const openEdit = (note: SecureNote) => {
    setForm({ title: note.title, content: note.content, tags: note.tags.join(', ') })
    setEditing(note); setCreating(false)
  }

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    try {
      if (editing) {
        await updateSecureNote(editing.id, { title: form.title, content: form.content, tags })
        toast.success('Note updated!')
      } else {
        await addSecureNote({ title: form.title, content: form.content, tags })
        toast.success('Note saved!')
      }
      setEditing(null); setCreating(false)
    } catch { toast.error('Failed to save note.') }
  }

  const del = async (id: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      await deleteSecureNote(id)
      toast.success('Note deleted.')
    }
  }

  const showForm = creating || editing !== null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white mb-1">Secure Notes</h1>
          <p className="text-sm text-gray-400">{secureNotes.length} encrypted notes</p>
        </div>
        <button onClick={openCreate} className="btn-fae flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-fae mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">{editing ? 'Edit Note' : 'New Note'}</h3>
            <button onClick={() => { setEditing(null); setCreating(false) }} className="btn-ghost p-1.5 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="input-fae"
            placeholder="Note title"
          />
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            className="input-fae resize-none h-32"
            placeholder="Note content..."
          />
          <input
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            className="input-fae"
            placeholder="Tags (comma separated)"
          />
          <div className="flex gap-2">
            <button onClick={() => { setEditing(null); setCreating(false) }}
              className="flex-1 py-2 rounded-xl glass border border-white/20 text-sm text-gray-300 hover:text-white transition-all">
              Cancel
            </button>
            <button onClick={save} className="btn-fae flex-1 flex items-center justify-center gap-2 py-2 text-sm">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </motion.div>
      )}

      {secureNotes.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
            <StickyNote className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No secure notes yet</h3>
          <p className="text-gray-400 text-sm mb-6">Store encrypted notes, secrets, and sensitive text.</p>
          <button onClick={openCreate} className="btn-fae flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Create First Note
          </button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {secureNotes.map((note, i) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card-fae group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-white">{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(note)} className="btn-ghost p-1.5 rounded-lg">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => del(note.id, note.title)} className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 line-clamp-3 mb-2">{note.content}</p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">{t}</span>)}
                </div>
              )}
              <div className="text-xs text-gray-600 mt-2">{new Date(note.updatedAt).toLocaleDateString()}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
