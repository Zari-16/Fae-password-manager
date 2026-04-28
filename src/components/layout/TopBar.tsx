import { Search, Sun, Moon, Lock, Bell } from 'lucide-react'
import { useAuthStore } from '../../stores/auth'
import { useUIStore } from '../../stores/ui'

interface Props {
  onNavigate: (page: string) => void
  searchQuery: string
  onSearch: (q: string) => void
}

export function TopBar({ onNavigate, searchQuery, onSearch }: Props) {
  const { lockVault } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()

  const handleLock = () => {
    lockVault()
    onNavigate('login')
  }

  return (
    <header className="h-14 glass border-b border-white/10 flex items-center gap-4 px-4 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search vault..."
          className="input-fae pl-9 h-9 text-sm"
          autoComplete="off"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button className="btn-ghost p-2 rounded-lg relative">
          <Bell className="w-4 h-4" />
        </button>
        <button onClick={toggleTheme} className="btn-ghost p-2 rounded-lg">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={handleLock}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <Lock className="w-3.5 h-3.5" />
          Lock
        </button>
      </div>
    </header>
  )
}
