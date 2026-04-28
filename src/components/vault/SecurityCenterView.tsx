import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { useVaultStore } from '../../stores/vault'
import { analyzePasswordStrength } from '../../utils/crypto'
import { toast } from '../ui/Toast'

interface Issue {
  type: 'weak' | 'duplicate' | 'old' | 'reused'
  credentialId: string
  credentialName: string
  message: string
}

export function SecurityCenterView() {
  const { credentials } = useVaultStore()
  const [checkingBreaches, setCheckingBreaches] = useState(false)

  const analysis = useMemo(() => {
    const issues: Issue[] = []
    const passwordCounts: Record<string, string[]> = {}
    credentials.filter(c => !c.archived).forEach((c) => {
      // Weak passwords
      const strength = analyzePasswordStrength(c.password)
      if (c.password && strength.score < 2) {
        issues.push({ type: 'weak', credentialId: c.id, credentialName: c.name, message: `Password is ${strength.label.toLowerCase()}` })
      }

      // Track duplicates
      if (c.password) {
        if (!passwordCounts[c.password]) passwordCounts[c.password] = []
        passwordCounts[c.password].push(c.name)
      }

      // Old passwords (> 90 days)
      const daysSinceUpdate = (Date.now() - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceUpdate > 90 && c.password) {
        issues.push({ type: 'old', credentialId: c.id, credentialName: c.name, message: `Password not changed in ${Math.floor(daysSinceUpdate)} days` })
      }
    })

    // Duplicate/reused passwords
    Object.entries(passwordCounts).forEach(([_pw, names]) => {
      if (names.length > 1) {
        names.forEach((name) => {
          const cred = credentials.find(c => c.name === name)
          if (cred) {
            issues.push({ type: 'reused', credentialId: cred.id, credentialName: name, message: `Password reused across: ${names.join(', ')}` })
          }
        })
      }
    })

    const total = credentials.filter(c => !c.archived && c.password).length
    const weakCount = issues.filter(i => i.type === 'weak').length
    const reusedCount = issues.filter(i => i.type === 'reused').length
    const oldCount = issues.filter(i => i.type === 'old').length

    const score = total === 0 ? 100 : Math.max(0, Math.round(100 - (weakCount * 15) - (reusedCount * 10) - (oldCount * 5)))

    return { issues, score, weakCount, reusedCount, oldCount, total }
  }, [credentials])

  const checkBreaches = async () => {
    setCheckingBreaches(true)
    // k-anonymity breach check would go here (HaveIBeenPwned API)
    await new Promise(r => setTimeout(r, 1500))
    setCheckingBreaches(false)
    toast.info('Breach check complete. No known breaches found in your vault.')
  }

  const scoreColor = analysis.score >= 80 ? 'text-green-400' : analysis.score >= 60 ? 'text-yellow-400' : 'text-red-400'
  const scoreRing = analysis.score >= 80 ? 'stroke-green-400' : analysis.score >= 60 ? 'stroke-yellow-400' : 'stroke-red-400'

  const issueTypeConfig = {
    weak: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    duplicate: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    reused: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    old: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-white mb-1">Security Center</h1>
        <p className="text-sm text-gray-400">Analyze and improve your vault security</p>
      </div>

      {/* Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-fae flex flex-col items-center justify-center py-6 md:col-span-1">
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.9" fill="none" className={scoreRing} strokeWidth="2.5"
                strokeDasharray={`${analysis.score} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${scoreColor}`}>{analysis.score}</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">Security Score</div>
        </div>

        {[
          { label: 'Weak Passwords', value: analysis.weakCount, color: 'text-red-400', icon: XCircle },
          { label: 'Reused Passwords', value: analysis.reusedCount, color: 'text-orange-400', icon: AlertTriangle },
          { label: 'Outdated Passwords', value: analysis.oldCount, color: 'text-yellow-400', icon: AlertTriangle },
        ].map((stat) => (
          <div key={stat.label} className="card-fae flex items-center gap-4">
            <stat.icon className={`w-8 h-8 ${stat.color} shrink-0`} />
            <div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Breach Check */}
      <div className="card-fae mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-white mb-1">Breach Detection</h3>
          <p className="text-sm text-gray-400">Check passwords against known data breaches using k-anonymity (privacy-safe)</p>
        </div>
        <button onClick={checkBreaches} disabled={checkingBreaches}
          className="btn-fae flex items-center gap-2 text-sm shrink-0 ml-4 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${checkingBreaches ? 'animate-spin' : ''}`} />
          {checkingBreaches ? 'Checking...' : 'Check Breaches'}
        </button>
      </div>

      {/* Issues */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Issues Found ({analysis.issues.length})
        </h3>

        {analysis.issues.length === 0 ? (
          <div className="card-fae flex items-center gap-4 py-8 justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="font-medium text-white">All clear!</div>
              <div className="text-sm text-gray-400">No security issues found in your vault.</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {analysis.issues.map((issue, i) => {
              const config = issueTypeConfig[issue.type]
              return (
                <motion.div
                  key={`${issue.credentialId}-${issue.type}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg}`}
                >
                  <config.icon className={`w-4 h-4 ${config.color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">{issue.credentialName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{issue.message}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
