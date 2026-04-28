import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, RefreshCw, Plus, X, Star } from 'lucide-react'
import { useVaultStore } from '../../stores/vault'
import { useUIStore } from '../../stores/ui'
import { generatePassword } from '../../utils/crypto'
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter'
import { toast } from '../ui/Toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  totpSeed: z.string().optional(),
  favorite: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

const CATEGORIES = ['Login', 'Social', 'Finance', 'Work', 'Shopping', 'Email', 'Gaming', 'Other']

interface Props {
  editingId?: string | null
}

export function CredentialForm({ editingId }: Props) {
  const [showPw, setShowPw] = useState(false)
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([])
  const { addCredential, updateCredential, credentials } = useVaultStore()
  const { setView } = useUIStore()

  const editing = editingId ? credentials.find((c) => c.id === editingId) : null

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editing ? {
      name: editing.name,
      url: editing.url,
      username: editing.username,
      email: editing.email,
      password: editing.password,
      notes: editing.notes,
      category: editing.category,
      tags: editing.tags.join(', '),
      totpSeed: editing.totpSeed,
      favorite: editing.favorite,
    } : { category: 'Login', favorite: false },
  })

  useEffect(() => {
    if (editing) setCustomFields(editing.customFields)
  }, [editing])

  const password = watch('password', '')

  const generatePw = () => {
    const pw = generatePassword({ length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true, avoidAmbiguous: true })
    setValue('password', pw)
  }

  const onSubmit = async (data: FormData) => {
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    const payload = {
      name: data.name,
      url: data.url ?? '',
      username: data.username ?? '',
      email: data.email ?? '',
      password: data.password ?? '',
      notes: data.notes ?? '',
      category: data.category ?? 'Login',
      tags,
      customFields,
      totpSeed: data.totpSeed,
      favorite: data.favorite ?? false,
    }
    try {
      if (editing) {
        await updateCredential(editing.id, payload)
        toast.success('Credential updated!')
      } else {
        await addCredential(payload)
        toast.success('Credential saved!')
      }
      setView('vault')
    } catch {
      toast.error('Failed to save credential.')
    }
  }

  const addCustomField = () => setCustomFields((f) => [...f, { key: '', value: '' }])
  const removeCustomField = (i: number) => setCustomFields((f) => f.filter((_, idx) => idx !== i))
  const updateCustomField = (i: number, field: 'key' | 'value', val: string) => {
    setCustomFields((f) => f.map((cf, idx) => idx === i ? { ...cf, [field]: val } : cf))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-bold text-white">
          {editing ? 'Edit Credential' : 'Add Credential'}
        </h2>
        <button onClick={() => setView('vault')} className="btn-ghost p-2 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="card-fae space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Basic Info</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-300 mb-1.5">Name *</label>
              <input {...register('name')} className="input-fae" placeholder="e.g. GitHub" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-300 mb-1.5">URL</label>
              <input {...register('url')} className="input-fae" placeholder="https://github.com" />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Username</label>
              <input {...register('username')} className="input-fae" placeholder="username" autoComplete="off" />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Email</label>
              <input {...register('email')} type="email" className="input-fae" placeholder="you@example.com" autoComplete="off" />
            </div>
          </div>
        </div>

        <div className="card-fae space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Password</h3>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  className="input-fae pr-10"
                  placeholder="Enter or generate password"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="button" onClick={generatePw}
                className="px-3 py-2 rounded-xl glass border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                title="Generate password">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <PasswordStrengthMeter password={password ?? ''} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">TOTP Secret (optional)</label>
            <input {...register('totpSeed')} className="input-fae font-mono text-sm" placeholder="JBSWY3DPEHPK3PXP" autoComplete="off" />
            <p className="text-xs text-gray-500 mt-1">For 2FA codes — stored encrypted in your vault</p>
          </div>
        </div>

        <div className="card-fae space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Organization</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Category</label>
              <select {...register('category')} className="input-fae">
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-fae-dark">{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Tags</label>
              <input {...register('tags')} className="input-fae" placeholder="work, personal" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-300 mb-1.5">Notes</label>
              <textarea {...register('notes')} className="input-fae resize-none h-20" placeholder="Additional notes..." />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input {...register('favorite')} type="checkbox" id="fav" className="w-4 h-4 rounded accent-yellow-500" />
            <label htmlFor="fav" className="text-sm text-gray-300 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400" /> Mark as favorite
            </label>
          </div>
        </div>

        {/* Custom Fields */}
        <div className="card-fae space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Custom Fields</h3>
            <button type="button" onClick={addCustomField}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>
          {customFields.map((cf, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={cf.key}
                onChange={(e) => updateCustomField(i, 'key', e.target.value)}
                className="input-fae flex-1"
                placeholder="Field name"
              />
              <input
                value={cf.value}
                onChange={(e) => updateCustomField(i, 'value', e.target.value)}
                className="input-fae flex-1"
                placeholder="Value"
              />
              <button type="button" onClick={() => removeCustomField(i)}
                className="text-gray-400 hover:text-red-400 px-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setView('vault')} className="flex-1 py-2.5 rounded-xl glass border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm">
            Cancel
          </button>
          <button type="submit" className="btn-fae flex-1 py-2.5 text-sm">
            {editing ? 'Save Changes' : 'Save Credential'}
          </button>
        </div>
      </form>
    </div>
  )
}
