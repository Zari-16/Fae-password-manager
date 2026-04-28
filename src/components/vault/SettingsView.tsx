import { useState, useEffect } from 'react'
import { Eye, EyeOff, Sun, Moon, Shield, Trash2, Key, Fingerprint, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/auth'
import { useUIStore } from '../../stores/ui'
import { useVaultStore } from '../../stores/vault'
import { clearVaultDB } from '../../utils/db'
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter'
import { toast } from '../ui/Toast'
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  hasBiometricRegistered,
  removeBiometricCredential,
} from '../../utils/webauthn'

interface Props {
  onNavigate: (page: string) => void
}

export function SettingsView({ onNavigate }: Props) {
  const { username, email, changePassword, logout } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()
  const { clearVault } = useVaultStore()
  const [showPwForm, setShowPwForm] = useState(false)
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' })
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricRegistered, setBiometricRegistered] = useState(false)
  const [registeringBiometric, setRegisteringBiometric] = useState(false)

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setBiometricAvailable)
    if (username) setBiometricRegistered(hasBiometricRegistered(username))
  }, [username])

  const handleRegisterBiometric = async () => {
    if (!username) return
    setRegisteringBiometric(true)
    try {
      const ok = await registerBiometric(username)
      if (ok) { setBiometricRegistered(true); toast.success('Biometric registered! You can now unlock with Face ID or fingerprint.') }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') toast.warning('Biometric setup was cancelled.')
      else toast.error(err.message ?? 'Failed to register biometric.')
    } finally { setRegisteringBiometric(false) }
  }

  const handleRemoveBiometric = () => {
    if (!username) return
    removeBiometricCredential(username)
    setBiometricRegistered(false)
    toast.success('Biometric credential removed.')
  }

  const handleChangePw = async () => {
    if (pwForm.new !== pwForm.confirm) { toast.error("New passwords don't match"); return }
    if (pwForm.new.length < 12) { toast.error('Password must be at least 12 characters'); return }
    setSaving(true)
    try {
      const ok = await changePassword(pwForm.old, pwForm.new)
      if (ok) { toast.success('Password changed! Re-encrypting vault...'); setShowPwForm(false); setPwForm({ old: '', new: '', confirm: '' }) }
      else toast.error('Current password is incorrect.')
    } catch { toast.error('Failed to change password.') }
    finally { setSaving(false) }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account and all vault data? This CANNOT be undone.')) return
    if (!confirm('Are you absolutely sure? All your passwords will be permanently deleted.')) return
    await clearVaultDB()
    clearVault()
    logout()
    onNavigate('home')
    toast.success('Account deleted.')
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Account */}
      <div className="card-fae space-y-3">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Account</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
            {username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-white">{username}</div>
            <div className="text-sm text-gray-400">{email || 'No email set'}</div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card-fae space-y-3">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Theme</div>
            <div className="text-xs text-gray-400">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</div>
          </div>
          <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-sm text-gray-300 hover:text-white transition-all">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="card-fae space-y-3">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Security</h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Master Password</div>
            <div className="text-xs text-gray-400">Change your vault encryption password</div>
          </div>
          <button onClick={() => setShowPwForm(!showPwForm)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/20 text-xs text-gray-300 hover:text-white transition-all">
            <Key className="w-3.5 h-3.5" /> Change
          </button>
        </div>

        {showPwForm && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="relative">
              <input type={showOld ? 'text' : 'password'} value={pwForm.old}
                onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))}
                className="input-fae pr-10" placeholder="Current password" autoComplete="current-password" />
              <button type="button" onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={pwForm.new}
                onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))}
                className="input-fae pr-10" placeholder="New password (min 12 chars)" autoComplete="new-password" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthMeter password={pwForm.new} />
            <input type="password" value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              className="input-fae" placeholder="Confirm new password" autoComplete="new-password" />
            <div className="flex gap-2">
              <button onClick={() => setShowPwForm(false)}
                className="flex-1 py-2 rounded-xl glass border border-white/20 text-sm text-gray-300 hover:text-white transition-all">Cancel</button>
              <button onClick={handleChangePw} disabled={saving}
                className="btn-fae flex-1 py-2 text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}

        {isWebAuthnSupported() && biometricAvailable && (
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div>
              <div className="text-sm font-medium text-white flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-purple-400" /> Biometric Unlock
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {biometricRegistered ? 'Face ID / fingerprint unlock is enabled' : 'Use Face ID or fingerprint to verify your identity'}
              </div>
            </div>
            {biometricRegistered ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <button onClick={handleRemoveBiometric}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-all">
                  Remove
                </button>
              </div>
            ) : (
              <button onClick={handleRegisterBiometric} disabled={registeringBiometric}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-purple-500/30 text-xs text-purple-300 hover:text-white hover:bg-purple-500/10 transition-all disabled:opacity-50">
                <Fingerprint className="w-3.5 h-3.5" />
                {registeringBiometric ? 'Setting up...' : 'Enable'}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
            <div className="text-xs text-gray-400">Add an extra layer of security</div>
          </div>
          <button onClick={() => toast.info('MFA setup coming soon.')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/20 text-xs text-gray-300 hover:text-white transition-all">
            <Shield className="w-3.5 h-3.5" /> Setup
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card-fae border border-red-500/20 space-y-3">
        <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Delete Account</div>
            <div className="text-xs text-gray-400">Permanently delete all vault data. Cannot be undone.</div>
          </div>
          <button onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card-fae space-y-2">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">About</h3>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Fae Password Manager v1.0.0</div>
          <div>AES-256-GCM · PBKDF2-SHA256 · Zero-Knowledge</div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => onNavigate('privacy')} className="text-purple-400 hover:underline">Privacy Policy</button>
            <button onClick={() => onNavigate('terms')} className="text-purple-400 hover:underline">Terms of Use</button>
            <button onClick={() => onNavigate('security-policy')} className="text-purple-400 hover:underline">Security</button>
          </div>
        </div>
      </div>
    </div>
  )
}
