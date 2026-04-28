// k-anonymity breach check using HaveIBeenPwned Pwned Passwords API
// Only the first 5 characters of the SHA-1 hash are sent — the full password never leaves the device

async function sha1(text: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

export interface BreachResult {
  credentialId: string
  credentialName: string
  breachCount: number
}

// Check a single password — returns how many times it appeared in breaches
export async function checkPasswordBreach(password: string): Promise<number> {
  if (!password) return 0
  const hash = await sha1(password)
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' }, // prevents traffic analysis
  })

  if (!response.ok) throw new Error('Breach API unavailable')

  const text = await response.text()
  const lines = text.split('\n')

  for (const line of lines) {
    const [hashSuffix, countStr] = line.split(':')
    if (hashSuffix.trim().toUpperCase() === suffix) {
      return parseInt(countStr.trim(), 10)
    }
  }
  return 0
}

// Check all credentials in the vault — returns only those that are breached
export async function checkVaultBreaches(
  credentials: { id: string; name: string; password: string }[]
): Promise<BreachResult[]> {
  const results: BreachResult[] = []
  const unique = new Map<string, { id: string; name: string }>()

  // Deduplicate by password to avoid redundant API calls
  for (const c of credentials) {
    if (c.password && !unique.has(c.password)) {
      unique.set(c.password, { id: c.id, name: c.name })
    }
  }

  for (const [password, { id, name }] of unique) {
    try {
      const count = await checkPasswordBreach(password)
      if (count > 0) {
        results.push({ credentialId: id, credentialName: name, breachCount: count })
      }
      // Small delay to be respectful to the API
      await new Promise((r) => setTimeout(r, 100))
    } catch {
      throw new Error('Breach check failed — check your internet connection.')
    }
  }

  return results
}
