import { useState, useCallback } from 'react'
import { RefreshCw, Copy, CheckCircle, Sliders } from 'lucide-react'
import { generatePassword, generatePassphrase, copyWithAutoClear } from '../../utils/crypto'
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter'
import { toast } from '../ui/Toast'

export function GeneratorView() {
  const [mode, setMode] = useState<'password' | 'passphrase'>('password')
  const [length, setLength] = useState(20)
  const [wordCount, setWordCount] = useState(6)
  const [opts, setOpts] = useState({
    uppercase: true, lowercase: true, numbers: true, symbols: true, avoidAmbiguous: true,
  })
  const [generated, setGenerated] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    if (mode === 'password') {
      setGenerated(generatePassword({ length, ...opts }))
    } else {
      setGenerated(generatePassphrase(wordCount))
    }
    setCopied(false)
  }, [mode, length, wordCount, opts])

  const copy = async () => {
    if (!generated) return
    await copyWithAutoClear(generated, 30)
    setCopied(true)
    toast.success('Copied! Clears in 30s.')
    setTimeout(() => setCopied(false), 2000)
  }

  const toggle = (key: keyof typeof opts) => setOpts((o) => ({ ...o, [key]: !o[key] }))

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-white mb-1">Password Generator</h1>
        <p className="text-sm text-gray-400">Generate cryptographically secure passwords</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        {(['password', 'passphrase'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'glass text-gray-400 border border-white/10'
            }`}
          >
            {m === 'password' ? '🔑 Password' : '📝 Passphrase'}
          </button>
        ))}
      </div>

      {/* Generated output */}
      <div className="card-fae mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 font-mono text-lg text-white break-all min-h-[2rem]">
            {generated || <span className="text-gray-500 text-sm">Click generate to create a password</span>}
          </div>
          <button onClick={copy} disabled={!generated}
            className="btn-ghost p-2 rounded-lg shrink-0 disabled:opacity-30">
            {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        {generated && <PasswordStrengthMeter password={generated} />}
      </div>

      {/* Options */}
      <div className="card-fae mb-5 space-y-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4" /> Options
        </h3>

        {mode === 'password' ? (
          <>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Length</span>
                <span className="text-purple-300 font-mono">{length}</span>
              </div>
              <input
                type="range" min={8} max={64} value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>8</span><span>64</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'uppercase', label: 'Uppercase (A-Z)' },
                { key: 'lowercase', label: 'Lowercase (a-z)' },
                { key: 'numbers', label: 'Numbers (0-9)' },
                { key: 'symbols', label: 'Symbols (!@#...)' },
                { key: 'avoidAmbiguous', label: 'Avoid Ambiguous' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opts[key as keyof typeof opts]}
                    onChange={() => toggle(key as keyof typeof opts)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                  <span className="text-sm text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </>
        ) : (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Word Count</span>
              <span className="text-purple-300 font-mono">{wordCount}</span>
            </div>
            <input
              type="range" min={4} max={12} value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Passphrases are easier to remember and often stronger than random passwords.
            </p>
          </div>
        )}
      </div>

      <button onClick={generate} className="btn-fae w-full flex items-center justify-center gap-2 py-3">
        <RefreshCw className="w-4 h-4" /> Generate
      </button>
    </div>
  )
}
