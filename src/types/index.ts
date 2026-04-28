export interface Credential {
  id: string
  name: string
  url: string
  username: string
  email: string
  password: string
  notes: string
  tags: string[]
  category: string
  customFields: { key: string; value: string }[]
  totpSeed?: string
  favorite: boolean
  archived: boolean
  passwordHistory: { password: string; changedAt: string }[]
  createdAt: string
  updatedAt: string
}

export interface SecureNote {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface PaymentCard {
  id: string
  name: string
  cardholderName: string
  number: string
  expiry: string
  cvv: string
  type: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other'
  notes: string
  createdAt: string
  updatedAt: string
}

export interface VaultData {
  credentials: Credential[]
  secureNotes: SecureNote[]
  paymentCards: PaymentCard[]
}

export type DashboardView =
  | 'vault'
  | 'add-credential'
  | 'edit-credential'
  | 'secure-notes'
  | 'payment-cards'
  | 'security-center'
  | 'generator'
  | 'import-export'
  | 'settings'
  | 'devices'

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
  entropy: number
}
