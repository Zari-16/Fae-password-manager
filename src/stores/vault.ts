import { create } from 'zustand'
import { saveVaultToDB, loadVaultFromDB } from '../utils/db'
import { useAuthStore } from './auth'
import type { Credential, SecureNote, PaymentCard, VaultData } from '../types'

interface VaultState {
  credentials: Credential[]
  secureNotes: SecureNote[]
  paymentCards: PaymentCard[]
  isLoaded: boolean
  isSaving: boolean

  loadVault: () => Promise<void>
  saveVault: () => Promise<void>

  addCredential: (cred: Omit<Credential, 'id' | 'createdAt' | 'updatedAt' | 'passwordHistory' | 'archived'>) => Promise<void>
  updateCredential: (id: string, updates: Partial<Credential>) => Promise<void>
  deleteCredential: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  archiveCredential: (id: string) => Promise<void>

  addSecureNote: (note: Omit<SecureNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateSecureNote: (id: string, updates: Partial<SecureNote>) => Promise<void>
  deleteSecureNote: (id: string) => Promise<void>

  addPaymentCard: (card: Omit<PaymentCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updatePaymentCard: (id: string, updates: Partial<PaymentCard>) => Promise<void>
  deletePaymentCard: (id: string) => Promise<void>

  importVaultData: (data: VaultData) => Promise<void>
  clearVault: () => void
}

function now() { return new Date().toISOString() }
function uid() { return crypto.randomUUID() }

export const useVaultStore = create<VaultState>()((set, get) => ({
  credentials: [],
  secureNotes: [],
  paymentCards: [],
  isLoaded: false,
  isSaving: false,

  loadVault: async () => {
    const masterKey = useAuthStore.getState().masterKey
    if (!masterKey) { set({ isLoaded: true }); return }
    try {
      const data = await loadVaultFromDB(masterKey)
      if (data) {
        set({
          credentials: data.credentials ?? [],
          secureNotes: data.secureNotes ?? [],
          paymentCards: data.paymentCards ?? [],
          isLoaded: true,
        })
      } else {
        set({ isLoaded: true })
      }
    } catch {
      set({ isLoaded: true })
    }
  },

  saveVault: async () => {
    const masterKey = useAuthStore.getState().masterKey
    if (!masterKey) return
    set({ isSaving: true })
    try {
      const { credentials, secureNotes, paymentCards } = get()
      await saveVaultToDB({ credentials, secureNotes, paymentCards }, masterKey)
    } finally {
      set({ isSaving: false })
    }
  },

  addCredential: async (cred) => {
    const newCred: Credential = {
      ...cred,
      id: uid(),
      archived: false,
      passwordHistory: [],
      createdAt: now(),
      updatedAt: now(),
    }
    set((s) => ({ credentials: [...s.credentials, newCred] }))
    await get().saveVault()
  },

  updateCredential: async (id, updates) => {
    set((s) => ({
      credentials: s.credentials.map((c) => {
        if (c.id !== id) return c
        const history = updates.password && updates.password !== c.password
          ? [{ password: c.password, changedAt: now() }, ...c.passwordHistory].slice(0, 10)
          : c.passwordHistory
        return { ...c, ...updates, passwordHistory: history, updatedAt: now() }
      }),
    }))
    await get().saveVault()
  },

  deleteCredential: async (id) => {
    set((s) => ({ credentials: s.credentials.filter((c) => c.id !== id) }))
    await get().saveVault()
  },

  toggleFavorite: async (id) => {
    set((s) => ({
      credentials: s.credentials.map((c) =>
        c.id === id ? { ...c, favorite: !c.favorite, updatedAt: now() } : c
      ),
    }))
    await get().saveVault()
  },

  archiveCredential: async (id) => {
    set((s) => ({
      credentials: s.credentials.map((c) =>
        c.id === id ? { ...c, archived: !c.archived, updatedAt: now() } : c
      ),
    }))
    await get().saveVault()
  },

  addSecureNote: async (note) => {
    const newNote: SecureNote = { ...note, id: uid(), createdAt: now(), updatedAt: now() }
    set((s) => ({ secureNotes: [...s.secureNotes, newNote] }))
    await get().saveVault()
  },

  updateSecureNote: async (id, updates) => {
    set((s) => ({
      secureNotes: s.secureNotes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: now() } : n
      ),
    }))
    await get().saveVault()
  },

  deleteSecureNote: async (id) => {
    set((s) => ({ secureNotes: s.secureNotes.filter((n) => n.id !== id) }))
    await get().saveVault()
  },

  addPaymentCard: async (card) => {
    const newCard: PaymentCard = { ...card, id: uid(), createdAt: now(), updatedAt: now() }
    set((s) => ({ paymentCards: [...s.paymentCards, newCard] }))
    await get().saveVault()
  },

  updatePaymentCard: async (id, updates) => {
    set((s) => ({
      paymentCards: s.paymentCards.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: now() } : c
      ),
    }))
    await get().saveVault()
  },

  deletePaymentCard: async (id) => {
    set((s) => ({ paymentCards: s.paymentCards.filter((c) => c.id !== id) }))
    await get().saveVault()
  },

  importVaultData: async (data) => {
    set({
      credentials: data.credentials ?? [],
      secureNotes: data.secureNotes ?? [],
      paymentCards: data.paymentCards ?? [],
    })
    await get().saveVault()
  },

  clearVault: () => {
    set({ credentials: [], secureNotes: [], paymentCards: [], isLoaded: false })
  },
}))
