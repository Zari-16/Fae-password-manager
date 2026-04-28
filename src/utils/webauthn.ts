// WebAuthn / Passkey biometric unlock
// Uses the browser's built-in authenticator (Face ID, fingerprint, Windows Hello, etc.)
// The credential is tied to the device — no passwords transmitted

const RP_ID = window.location.hostname
const RP_NAME = 'Fae Password Manager'
const CREDENTIAL_KEY = 'fae-webauthn-credential'

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i)
  return buffer.buffer
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function isWebAuthnSupported(): boolean {
  return !!(window.PublicKeyCredential && navigator.credentials)
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

// Register a new biometric credential for the user
export async function registerBiometric(username: string): Promise<boolean> {
  if (!isWebAuthnSupported()) throw new Error('WebAuthn not supported in this browser.')

  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = crypto.getRandomValues(new Uint8Array(16))

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { id: RP_ID, name: RP_NAME },
      user: {
        id: userId,
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },   // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // device biometric only
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  }) as PublicKeyCredential | null

  if (!credential) return false

  // Store the credential ID so we can use it for future authentication
  const credId = bufferToBase64url(credential.rawId)
  localStorage.setItem(`${CREDENTIAL_KEY}:${username.toLowerCase()}`, credId)
  return true
}

// Authenticate using a previously registered biometric credential
export async function authenticateBiometric(username: string): Promise<boolean> {
  if (!isWebAuthnSupported()) throw new Error('WebAuthn not supported in this browser.')

  const storedCredId = localStorage.getItem(`${CREDENTIAL_KEY}:${username.toLowerCase()}`)
  if (!storedCredId) throw new Error('No biometric credential registered for this account.')

  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId: RP_ID,
      allowCredentials: [{
        id: base64urlToBuffer(storedCredId),
        type: 'public-key',
        transports: ['internal'],
      }],
      userVerification: 'required',
      timeout: 60000,
    },
  }) as PublicKeyCredential | null

  // If the browser returned a credential, the user verified successfully
  return assertion !== null
}

export function hasBiometricRegistered(username: string): boolean {
  return !!localStorage.getItem(`${CREDENTIAL_KEY}:${username.toLowerCase()}`)
}

export function removeBiometricCredential(username: string): void {
  localStorage.removeItem(`${CREDENTIAL_KEY}:${username.toLowerCase()}`)
}
