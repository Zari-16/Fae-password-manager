import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles, Eye, EyeOff, Shield, Copy, CheckCircle, ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { useAuthStore } from '../stores/auth'
import { PasswordStrengthMeter } from '../components/ui/PasswordStrengthMeter'
import { MagicBackground } from '../components/ui/MagicBackground'
import { toast } from '../components/ui/Toast'

interface Props {
  onNavigate: (page: string) => void
}

const schema = z.object({
  username: z.string().min(3, 'At least 3 characters').max(32).regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, _ and - only'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(12, 'At least 12 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((v) => v, 'You must accept the terms'),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

type Step = 'form' | 'recovery' | 'done'

export default function CreateAccount({ onNavigate }: Props) {
  const [step, setStep] = useState<Step>('form')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recoveryPhrase, setRecoveryPhrase] = useState('')
  const [copied, setCopied] = useState(false)
  const [savedPhrase, setSavedPhrase] = useState(false)
  const createAccount = useAuthStore((s) => s.createAccount)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('password', '')

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const result = await createAccount(data.username, data.email || '', data.password)
      setRecoveryPhrase(result.recoveryPhrase)
      setStep('recovery')
    } catch {
      toast.error('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyPhrase = async () => {
    await navigator.clipboard.writeText(recoveryPhrase)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Recovery phrase copied!')
  }

  const words = recoveryPhrase.split(' ')

  return (
    <div className="min-h-screen bg-fae-dark flex items-center justify-center p-4">
      <MagicBackground />

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-strong rounded-2xl p-8 shadow-2xl"
            >
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-fae-button mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-white mb-1">Create Your Vault</h1>
                <p className="text-gray-400 text-sm">Begin your magical journey</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                  <input
                    {...register('username')}
                    className="input-fae"
                    placeholder="your_username"
                    autoComplete="username"
                    spellCheck={false}
                  />
                  {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input-fae"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Master Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPw ? 'text' : 'password'}
                      className="input-fae pr-10"
                      placeholder="Create a strong master password"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={password} />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      className="input-fae pr-10"
                      placeholder="Confirm your master password"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    {...register('acceptTerms')}
                    type="checkbox"
                    id="terms"
                    className="mt-0.5 w-4 h-4 rounded accent-purple-500"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed">
                    I understand that Fae cannot recover my vault if I lose my master password.
                    I accept the{' '}
                    <button type="button" onClick={() => onNavigate('terms')} className="text-purple-400 hover:underline">Terms</button>
                    {' '}and{' '}
                    <button type="button" onClick={() => onNavigate('privacy')} className="text-purple-400 hover:underline">Privacy Policy</button>.
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-red-400 text-xs">{errors.acceptTerms.message}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-fae w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating vault...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Create Vault</>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have a vault?{' '}
                <button onClick={() => onNavigate('login')} className="text-purple-400 hover:text-purple-300">
                  Login
                </button>
              </p>
            </motion.div>
          )}

          {step === 'recovery' && (
            <motion.div
              key="recovery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-strong rounded-2xl p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white mb-2">Save Your Recovery Phrase</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This is the <strong className="text-yellow-400">only way</strong> to recover your account.
                  Store it somewhere safe — offline is best.
                </p>
              </div>

              <div className="glass-dark rounded-xl p-4 mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {words.map((word, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1.5">
                      <span className="text-gray-500 text-xs w-4">{i + 1}.</span>
                      <span className="text-white text-sm font-mono">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={copyPhrase}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl glass border border-white/20 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all mb-4"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Recovery Phrase'}
              </button>

              <div className="flex items-start gap-2.5 mb-5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <input
                  type="checkbox"
                  id="saved"
                  checked={savedPhrase}
                  onChange={(e) => setSavedPhrase(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-yellow-500"
                />
                <label htmlFor="saved" className="text-xs text-yellow-300 leading-relaxed">
                  I have saved my recovery phrase in a secure location. I understand I cannot recover my vault without it.
                </label>
              </div>

              <button
                onClick={() => onNavigate('dashboard')}
                disabled={!savedPhrase}
                className="btn-fae w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40"
              >
                <Lock className="w-4 h-4" /> Enter My Vault <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
