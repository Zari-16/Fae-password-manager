import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '../components/layout/Sidebar'
import { TopBar } from '../components/layout/TopBar'
import { VaultView } from '../components/vault/VaultView'
import { CredentialForm } from '../components/vault/CredentialForm'
import { SecureNotesView } from '../components/vault/SecureNotesView'
import { PaymentCardsView } from '../components/vault/PaymentCardsView'
import { SecurityCenterView } from '../components/vault/SecurityCenterView'
import { GeneratorView } from '../components/vault/GeneratorView'
import { ImportExportView } from '../components/vault/ImportExportView'
import { SettingsView } from '../components/vault/SettingsView'
import { useUIStore } from '../stores/ui'
import { useVaultStore } from '../stores/vault'
import { useAuthStore } from '../stores/auth'

interface Props {
  onNavigate: (page: string) => void
}

// Auto-lock after 15 minutes of inactivity
const INACTIVITY_TIMEOUT = 15 * 60 * 1000

export default function Dashboard({ onNavigate }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const { activeView, editingCredentialId, sidebarOpen } = useUIStore()
  const { loadVault, isLoaded } = useVaultStore()
  const { lockVault } = useAuthStore()

  // Load vault on mount
  useEffect(() => {
    if (!isLoaded) loadVault()
  }, [isLoaded, loadVault])

  // Auto-lock on inactivity
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => { lockVault(); onNavigate('login') }, INACTIVITY_TIMEOUT)
    }
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(e => document.addEventListener(e, reset))
    reset()
    return () => { clearTimeout(timer); events.forEach(e => document.removeEventListener(e, reset)) }
  }, [lockVault, onNavigate])

  const renderView = () => {
    switch (activeView) {
      case 'vault': return <VaultView searchQuery={searchQuery} />
      case 'add-credential': return <CredentialForm />
      case 'edit-credential': return <CredentialForm editingId={editingCredentialId} />
      case 'secure-notes': return <SecureNotesView />
      case 'payment-cards': return <PaymentCardsView />
      case 'security-center': return <SecurityCenterView />
      case 'generator': return <GeneratorView />
      case 'import-export': return <ImportExportView />
      case 'settings': return <SettingsView onNavigate={onNavigate} />
      default: return <VaultView searchQuery={searchQuery} />
    }
  }

  return (
    <div className="min-h-screen bg-fae-dark flex">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-64 right-0 h-px bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-transparent" />
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #9333ea, transparent 70%)' }} />
      </div>

      <Sidebar onNavigate={onNavigate} />

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <TopBar onNavigate={onNavigate} searchQuery={searchQuery} onSearch={setSearchQuery} />

        <main className="flex-1 p-6 overflow-y-auto relative z-10">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Decrypting vault...</span>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  )
}
