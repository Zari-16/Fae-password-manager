import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, ArrowLeft, Fingerprint } from 'lucide-react'
import { useAuthStore } from '../stores/auth'
import { MagicBackground } from '../components/ui/MagicBackground'
import { toast } from '../components/ui/Toast'
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  authenticateBiometric,
  hasBiometricRegistered,
} from '../utils/webauthn'

interface Props {
  onNavigate: (page: string) => void
}

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function Login({ onNavigate }: Props) {
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isBiometricLoading, setIsBiometricLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const login = useAuthStore((s) => s.login)
  const username = useAuthStore((s) => s.username)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: username ?? '' },
  })

  const watchedUsername = watch('username', username ?? '')

  // Check if biometric is available and registered for this user
  useEffect(() => {
    isPlatformAuthenticatorAvailable().then((available) => {
      setBiometricAvailable(available)
    })
  }, [])

  const showBiometricButton = biometricAvailable &&
    isWebAuthnSupported() &&
    watchedUsername &&
    hasBiometricRegistered(watchedUsername)

  const onSubmit = async (data: FormData) => {
    if (attempts >= 5) {
      toast.error('Too many attempts. Please wait before trying again.')
      return
    }
    setIsLoading(true)
    try {
      const success = await login(data.username, data.password)
      if (success) {
        toast.success('Vault unlocked!')
        onNavigate('dashboard')
      } else {
        setAttempts((a) => a + 1)
        toast.error('Invalid username or password.')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const tryBiometric = async () => {
    if (!watchedUsername) {
      toast.warning('Enter your username first.')
      return
    }
    if (!isWebAuthnSupported()) {
      toast.error('WebAuthn is not supported in this browser.')
      return
    }
    if (!hasBiometricRegistered(watchedUsername)) {
      toast.info('No biometric registered for this account. Enable it in Settings after logging in.')
      return
    }

    setIsBiometricLoading(true)
    try {
      const verified = await authenticateBiometric(watchedUsername)
      if (verified) {
        // Biometric verified — but we still need the master key to decrypt the vault.
        // Biometric acts as a second factor / convenience unlock.
        // The master key must be re-derived, so we prompt for password only if no session exists.
        toast.success('Biometric verified! Enter your master password to decrypt the vault.')
      } else {
        toast.error('Biometric verification failed.')
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        toast.warning('Biometric prompt was dismissed.')
      } else {
        toast.error(err.message ?? 'Biometric authentication failed.')
      }
    } finally {
      setIsBiometricLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fae-dark flex items-center justify-center p-4">
      <MagicBackground />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Unlock your magical vault</p>
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
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Master Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  className="input-fae pr-10"
                  placeholder="Enter your master password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {attempts >= 3 && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
                {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining before lockout.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || attempts >= 5}
              className="btn-fae w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Unlocking...</>
              ) : (
                <><Lock className="w-4 h-4" /> Unlock Vault</>
              )}
            </button>
          </form>

          {/* Biometric button — only shown if registered and available */}
          {showBiometricButton && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-500">
                  <span className="px-2 bg-transparent">or</span>
                </div>
              </div>

              <button
                onClick={tryBiometric}
                disabled={isBiometricLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl glass border border-purple-500/30 text-sm text-purple-300 hover:text-white hover:bg-purple-500/10 transition-all disabled:opacity-50"
              >
                {isBiometricLoading ? (
                  <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                ) : (
                  <Fingerprint className="w-4 h-4" />
                )}
                {isBiometricLoading ? 'Verifying...' : 'Use Biometrics / Passkey'}
              </button>
            </>
          )}

          <div className="flex items-center justify-between mt-5 text-sm">
            <button onClick={() => onNavigate('create-account')} className="text-purple-400 hover:text-purple-300">
              Create account
            </button>
            <button onClick={() => toast.info('Use your recovery phrase to reset your account.')} className="text-gray-500 hover:text-gray-300">
              Forgot password?
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
