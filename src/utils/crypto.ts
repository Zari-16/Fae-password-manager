// AES-256-GCM encryption with PBKDF2 key derivation
// Keys never leave the device — zero-knowledge model

const PBKDF2_ITERATIONS = 310_000 // OWASP 2023 recommendation
const SALT_BYTES = 32
const IV_BYTES = 12

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES))
}

export async function encryptData(data: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(data)
  )
  const combined = new Uint8Array(IV_BYTES + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), IV_BYTES)
  return bufferToBase64(combined)
}

export async function decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
  const combined = base64ToBuffer(encryptedData)
  const iv = combined.slice(0, IV_BYTES)
  const encrypted = combined.slice(IV_BYTES)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
  return new TextDecoder().decode(decrypted)
}

export async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await deriveKey(password, salt)
  const sentinel = await encryptData('fae-vault-v1', key)
  return sentinel
}

export function bufferToBase64(buffer: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < buffer.length; i++) binary += String.fromCharCode(buffer[i])
  return btoa(binary)
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i)
  return buffer
}

export function saltToBase64(salt: Uint8Array): string {
  return bufferToBase64(salt)
}

export function base64ToSalt(base64: string): Uint8Array {
  return base64ToBuffer(base64)
}

// Password strength analysis
export function analyzePasswordStrength(password: string) {
  if (!password) return { score: 0 as const, label: '', color: 'bg-gray-700', entropy: 0 }

  let charsetSize = 0
  if (/[a-z]/.test(password)) charsetSize += 26
  if (/[A-Z]/.test(password)) charsetSize += 26
  if (/[0-9]/.test(password)) charsetSize += 10
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32

  const entropy = Math.log2(Math.pow(charsetSize || 1, password.length))

  let score: 0 | 1 | 2 | 3 | 4 = 0
  if (entropy >= 80) score = 4
  else if (entropy >= 60) score = 3
  else if (entropy >= 40) score = 2
  else if (entropy >= 20) score = 1

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500']

  return { score, label: labels[score], color: colors[score], entropy: Math.round(entropy) }
}

// Secure random password generation
export function generatePassword(options: {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  avoidAmbiguous: boolean
}): string {
  let charset = ''
  if (options.uppercase) charset += options.avoidAmbiguous ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.lowercase) charset += options.avoidAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
  if (options.numbers) charset += options.avoidAmbiguous ? '23456789' : '0123456789'
  if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz'

  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => charset[x % charset.length]).join('')
}

// Diceware-style passphrase
const WORDLIST = [
  'apple','bridge','castle','dragon','ember','forest','garden','harbor','island','jungle',
  'knight','lantern','meadow','noble','ocean','palace','quest','river','silver','tower',
  'unicorn','valley','winter','xenon','yellow','zenith','amber','breeze','crystal','dawn',
  'eclipse','flame','glacier','horizon','iris','jasper','karma','lotus','mystic','nebula',
  'oracle','prism','quartz','raven','storm','twilight','umbra','violet','whisper','aurora',
  'bloom','cipher','dusk','echo','frost','glow','haze','ivory','jade','kindle',
  'lunar','mist','nova','onyx','pearl','quiet','rose','sage','thorn','ultra',
  'veil','wave','xylem','yarn','zeal','arch','bolt','calm','deep','edge'
]

export function generatePassphrase(wordCount = 6): string {
  const array = new Uint32Array(wordCount)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => WORDLIST[x % WORDLIST.length]).join('-')
}

// Clipboard auto-clear
export async function copyWithAutoClear(text: string, seconds = 30): Promise<void> {
  await navigator.clipboard.writeText(text)
  setTimeout(async () => {
    try {
      const current = await navigator.clipboard.readText()
      if (current === text) await navigator.clipboard.writeText('')
    } catch { /* clipboard read may be denied */ }
  }, seconds * 1000)
}

// Generate TOTP secret (base32)
export function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const array = new Uint32Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => chars[x % chars.length]).join('')
}

// Generate recovery phrase (BIP39-style word list subset)
const RECOVERY_WORDS = [
  'abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse',
  'access','accident','account','accuse','achieve','acid','acoustic','acquire','across','act',
  'action','actor','actress','actual','adapt','add','addict','address','adjust','admit',
  'adult','advance','advice','aerobic','afford','afraid','again','agent','agree','ahead',
  'aim','air','airport','aisle','alarm','album','alcohol','alert','alien','alley',
  'allow','almost','alone','alpha','already','also','alter','always','amateur','amazing',
  'among','amount','amused','analyst','anchor','ancient','anger','angle','angry','animal',
  'ankle','announce','annual','another','answer','antenna','antique','anxiety','apart','april',
  'arch','arctic','area','arena','argue','arm','armed','armor','army','around',
  'arrange','arrest','arrive','arrow','art','artefact','artist','artwork','ask','aspect'
]

export function generateRecoveryPhrase(wordCount = 12): string {
  const array = new Uint32Array(wordCount)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => RECOVERY_WORDS[x % RECOVERY_WORDS.length]).join(' ')
}
