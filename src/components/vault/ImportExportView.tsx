import { useState, useRef } from 'react'
import { Download, Upload, AlertTriangle, CheckCircle, FileJson } from 'lucide-react'
import { useVaultStore } from '../../stores/vault'
import { useAuthStore } from '../../stores/auth'
import { exportEncryptedVault, importEncryptedVault } from '../../utils/db'
import { toast } from '../ui/Toast'

export function ImportExportView() {
  const [importing, setImporting] = useState(false)
  const [mergeMode, setMergeMode] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const { credentials, secureNotes, paymentCards, importVaultData } = useVaultStore()
  const { masterKey } = useAuthStore()

  const handleExport = async () => {
    if (!masterKey) { toast.error('Vault is locked.'); return }
    try {
      const json = await exportEncryptedVault(masterKey, { credentials, secureNotes, paymentCards })
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fae-vault-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Vault exported! Keep this file safe.')
    } catch { toast.error('Export failed.') }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !masterKey) return
    setImporting(true)
    try {
      const text = await file.text()
      const imported = await importEncryptedVault(text, masterKey)
      if (mergeMode) {
        const merged = {
          credentials: [...credentials, ...imported.credentials.filter(ic => !credentials.find(c => c.id === ic.id))],
          secureNotes: [...secureNotes, ...imported.secureNotes.filter(in_ => !secureNotes.find(n => n.id === in_.id))],
          paymentCards: [...paymentCards, ...imported.paymentCards.filter(ip => !paymentCards.find(p => p.id === ip.id))],
        }
        await importVaultData(merged)
      } else {
        await importVaultData(imported)
      }
      toast.success(`Vault imported! ${imported.credentials.length} credentials loaded.`)
    } catch { toast.error('Import failed. Wrong master password or invalid file.') }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = '' }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-white mb-1">Import / Export</h1>
        <p className="text-sm text-gray-400">Backup and restore your encrypted vault</p>
      </div>

      {/* Export */}
      <div className="card-fae mb-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white mb-1">Export Vault</h3>
            <p className="text-sm text-gray-400 mb-3">
              Download an encrypted backup of your vault. Only your master password can unlock it.
            </p>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 mb-3 flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              This file is encrypted. Only your master password can unlock it.
            </div>
            <div className="text-xs text-gray-500 mb-3">
              {credentials.length} credentials · {secureNotes.length} notes · {paymentCards.length} cards
            </div>
            <button onClick={handleExport} className="btn-fae flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Export Encrypted Vault
            </button>
          </div>
        </div>
      </div>

      {/* Import */}
      <div className="card-fae">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white mb-1">Import Vault</h3>
            <p className="text-sm text-gray-400 mb-3">
              Restore from a Fae encrypted backup file. Requires your master password.
            </p>

            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300 mb-3 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Replace mode will overwrite your current vault. Use Merge to combine.
            </div>

            <div className="flex gap-3 mb-3">
              {[
                { value: true, label: 'Merge (recommended)' },
                { value: false, label: 'Replace vault' },
              ].map(opt => (
                <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={mergeMode === opt.value} onChange={() => setMergeMode(opt.value)}
                    className="accent-purple-500" />
                  <span className="text-sm text-gray-300">{opt.label}</span>
                </label>
              ))}
            </div>

            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/20 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <FileJson className="w-4 h-4" />
              {importing ? 'Importing...' : 'Choose Backup File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
