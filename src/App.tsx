import { useState, useEffect, useCallback } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import Dashboard from './pages/Dashboard'
import LegalPage from './pages/LegalPage'
import { ToastContainer } from './components/ui/Toast'
import { useAuthStore } from './stores/auth'
import { useUIStore } from './stores/ui'

type Page = 'home' | 'login' | 'create-account' | 'dashboard' | 'privacy' | 'terms' | 'security-policy'

function App() {
  const [page, setPage] = useState<Page>('home')
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const theme = useUIStore((s) => s.theme)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // Hash-based routing
  useEffect(() => {
    const getPage = (): Page => {
      const hash = window.location.hash.replace('#/', '').replace('#', '') || 'home'
      const valid: Page[] = ['home', 'login', 'create-account', 'dashboard', 'privacy', 'terms', 'security-policy']
      return valid.includes(hash as Page) ? (hash as Page) : 'home'
    }

    const handleHash = () => {
      const p = getPage()
      if (p === 'dashboard' && !isAuthenticated) {
        setPage('login')
        window.location.hash = '#/login'
      } else {
        setPage(p)
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [isAuthenticated])

  // Redirect to dashboard after login
  useEffect(() => {
    if (isAuthenticated && (page === 'home' || page === 'login' || page === 'create-account')) {
      navigate('dashboard')
    }
  }, [isAuthenticated])

  const navigate = useCallback((p: string) => {
    window.location.hash = `#/${p}`
  }, [])

  const renderPage = () => {
    // Auth guard
    if (page === 'dashboard' && !isAuthenticated) {
      return <Login onNavigate={navigate} />
    }

    switch (page) {
      case 'home': return <Home onNavigate={navigate} />
      case 'login': return <Login onNavigate={navigate} />
      case 'create-account': return <CreateAccount onNavigate={navigate} />
      case 'dashboard': return <Dashboard onNavigate={navigate} />
      case 'privacy': return <LegalPage onNavigate={navigate} page="privacy" />
      case 'terms': return <LegalPage onNavigate={navigate} page="terms" />
      case 'security-policy': return <LegalPage onNavigate={navigate} page="security-policy" />
      default: return <Home onNavigate={navigate} />
    }
  }

  return (
    <>
      {renderPage()}
      <ToastContainer />
    </>
  )
}

export default App
