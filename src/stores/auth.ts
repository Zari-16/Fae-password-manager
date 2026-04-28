import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  deriveKey,
  generateSalt,
  saltToBase64,
  base64ToSalt,
  generateRecoveryPhrase,
  encryptData,
  decryptData,
} from '../utils/crypto'
import { saveMeta, loadMeta } from '../utils/db'

interface AccountRecord {
  username: string
  email: string
  saltB64: string
  verifier: string // encrypted sentinel to verify password
  recoveryPhraseEncrypted: string
  mfaEnabled: boolean
  mfaSecret: string | null
  createdAt: string
}

interface AuthState {
  isAuthenticated: boolean
  username: string | null
  email: string | null
  masterKey: CryptoKey | null
  mfaEnabled: boolean
  mfaSecret: string | null
  sessionStarted: number | null
  // Actions
  createAccount: (username: string, email: string, password: string) => Promise<{ recoveryPhrase: string }>
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  lockVault: () => void
  setMFA: (enabled: boolean, secret?: string) => void
  getAccount: (username: string) => Promise<AccountRecord | null>
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
}

const SENTINEL = 'fae-vault-authenticated-v1'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      username: null,
      email: null,
      masterKey: null,
      mfaEnabled: false,
      mfaSecret: null,
      sessionStarted: null,

      getAccount: async (username: string): Promise<AccountRecord | null> => {
        const raw = await loadMeta(`account:${username.toLowerCase()}`)
        if (!raw) return null
        return JSON.parse(raw) as AccountRecord
      },

      createAccount: async (username: string, email: string, password: string) => {
        const salt = generateSalt()
        const saltB64 = saltToBase64(salt)
        const masterKey = await deriveKey(password, salt)

        const recoveryPhrase = generateRecoveryPhrase(12)
        const verifier = await encryptData(SENTINEL, masterKey)
        const recoveryPhraseEncrypted = await encryptData(recoveryPhrase, masterKey)

        const account: AccountRecord = {
          username,
          email,
          saltB64,
          verifier,
          recoveryPhraseEncrypted,
          mfaEnabled: false,
          mfaSecret: null,
          createdAt: new Date().toISOString(),
        }

        await saveMeta(`account:${username.toLowerCase()}`, JSON.stringify(account))

        set({
          isAuthenticated: true,
          username,
          email,
          masterKey,
          mfaEnabled: false,
          mfaSecret: null,
          sessionStarted: Date.now(),
        })

        return { recoveryPhrase }
      },

      login: async (username: string, password: string): Promise<boolean> => {
        try {
          const raw = await loadMeta(`account:${username.toLowerCase()}`)
          if (!raw) return false

          const account: AccountRecord = JSON.parse(raw)
          const salt = base64ToSalt(account.saltB64)
          const masterKey = await deriveKey(password, salt)

          // Verify password by decrypting sentinel
          const decrypted = await decryptData(account.verifier, masterKey)
          if (decrypted !== SENTINEL) return false

          set({
            isAuthenticated: true,
            username: account.username,
            email: account.email,
            masterKey,
            mfaEnabled: account.mfaEnabled,
            mfaSecret: account.mfaSecret,
            sessionStarted: Date.now(),
          })
          return true
        } catch {
          return false
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          username: null,
          email: null,
          masterKey: null,
          sessionStarted: null,
        })
      },

      lockVault: () => {
        set({
          isAuthenticated: false,
          masterKey: null,
          sessionStarted: null,
        })
      },

      setMFA: async (enabled: boolean, secret?: string) => {
        const { username } = get()
        if (!username) return
        set({ mfaEnabled: enabled, mfaSecret: secret ?? null })

        const raw = await loadMeta(`account:${username.toLowerCase()}`)
        if (raw) {
          const account: AccountRecord = JSON.parse(raw)
          account.mfaEnabled = enabled
          account.mfaSecret = secret ?? null
          await saveMeta(`account:${username.toLowerCase()}`, JSON.stringify(account))
        }
      },

      changePassword: async (oldPassword: string, newPassword: string): Promise<boolean> => {
        const { username } = get()
        if (!username) return false
        try {
          const raw = await loadMeta(`account:${username.toLowerCase()}`)
          if (!raw) return false
          const account: AccountRecord = JSON.parse(raw)
          const oldSalt = base64ToSalt(account.saltB64)
          const oldKey = await deriveKey(oldPassword, oldSalt)
          const decrypted = await decryptData(account.verifier, oldKey)
          if (decrypted !== SENTINEL) return false

          const newSalt = generateSalt()
          const newKey = await deriveKey(newPassword, newSalt)
          const newVerifier = await encryptData(SENTINEL, newKey)
          const recoveryPhrase = await decryptData(account.recoveryPhraseEncrypted, oldKey)
          const newRecoveryEncrypted = await encryptData(recoveryPhrase, newKey)

          account.saltB64 = saltToBase64(newSalt)
          account.verifier = newVerifier
          account.recoveryPhraseEncrypted = newRecoveryEncrypted
          await saveMeta(`account:${username.toLowerCase()}`, JSON.stringify(account))
          set({ masterKey: newKey })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'fae-auth-session',
      partialize: (state) => ({
        username: state.username,
        email: state.email,
        mfaEnabled: state.mfaEnabled,
        // masterKey is NOT persisted — must re-derive on each session
      }),
    }
  )
)
