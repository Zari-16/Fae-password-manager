import { motion, AnimatePresence } from 'framer-motion'
import {
  Vault, Plus, FolderOpen, StickyNote, CreditCard, Shield,
  Download, Settings, LogOut, Lock, Sparkles, Wand2, Menu, X
} from 'lucide-react'
import { useAuthStore } from '../../stores/auth'
import { useVaultStore } from '../../stores/vault'
import { useUIStore } from '../../stores/ui'
import type { DashboardView } from '../../types'

const navItems: { icon: typeof Vault; label: string; view: DashboardView; badge?: string }[] = [
  { icon: Vault, label: 'Vault', view: 'vault' },
  { icon: Plus, label: 'Add Credential', view: 'add-credential' },
  { icon: FolderOpen, label: 'Categories', view: 'vault' },
  { icon: StickyNote, label: 'Secure Notes', view: 'secure-notes' },
  { icon: CreditCard, label: 'Payment Cards', view: 'payment-cards' },
  { icon: Shield, label: 'Security Center', view: 'security-center' },
  { icon: Wand2, label: 'Generator', view: 'generator' },
  { icon: Download, label: 'Import / Export', view: 'import-export' },
  { icon: Settings, label: 'Settings', view: 'settings' },
]

interface Props {
  onNavigate: (page: string) => void
}

export function Sidebar({ onNavigate }: Props) {
  const { username, lockVault } = useAuthStore()
  const { credentials } = useVaultStore()
  const { activeView, setView, sidebarOpen, toggleSidebar } = useUIStore()

  const handleLock = () => {
    lockVault()
    onNavigate('login')
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 z-30 flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-fae-button flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm gradient-text">Fae Vault</div>
              <div className="text-xs text-gray-500">{credentials.length} items</div>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
              {username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{username}</div>
              <div className="text-xs text-green-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Vault unlocked
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.view + item.label}
              onClick={() => setView(item.view)}
              className={`nav-item w-full ${activeView === item.view && item.view !== 'vault' || (activeView === 'vault' && item.view === 'vault' && item.label === 'Vault') ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              {item.badge && <span className="ml-auto badge-purple">{item.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={handleLock}
            className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Lock className="w-4 h-4 shrink-0" />
            Lock Vault
          </button>
          <button
            onClick={() => { useAuthStore.getState().logout(); onNavigate('home') }}
            className="nav-item w-full text-gray-500 hover:text-gray-300"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-20 lg:hidden btn-ghost p-2 rounded-xl glass"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  )
}
