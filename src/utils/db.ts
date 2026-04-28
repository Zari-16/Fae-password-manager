import { openDB, type IDBPDatabase } from 'idb'
import { encryptData, decryptData } from '../utils/crypto'
import type { VaultData } from '../types'

const DB_NAME = 'fae-vault-db'
const DB_VERSION = 1
const STORE_VAULT = 'vault'
const STORE_META = 'meta'

let db: IDBPDatabase | null = null

async function getDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        database.createObjectStore(STORE_VAULT)
        database.createObjectStore(STORE_META)
      },
    })
  }
  return db
}

export async function saveVaultToDB(data: VaultData, key: CryptoKey): Promise<void> {
  const database = await getDB()
  const encrypted = await encryptData(JSON.stringify(data), key)
  await database.put(STORE_VAULT, encrypted, 'data')
}

export async function loadVaultFromDB(key: CryptoKey): Promise<VaultData | null> {
  const database = await getDB()
  const encrypted = await database.get(STORE_VAULT, 'data')
  if (!encrypted) return null
  const decrypted = await decryptData(encrypted, key)
  return JSON.parse(decrypted) as VaultData
}

export async function saveMeta(key: string, value: string): Promise<void> {
  const database = await getDB()
  await database.put(STORE_META, value, key)
}

export async function loadMeta(key: string): Promise<string | null> {
  const database = await getDB()
  return (await database.get(STORE_META, key)) ?? null
}

export async function clearVaultDB(): Promise<void> {
  const database = await getDB()
  await database.clear(STORE_VAULT)
}

export async function exportEncryptedVault(key: CryptoKey, data: VaultData): Promise<string> {
  const encrypted = await encryptData(JSON.stringify(data), key)
  return JSON.stringify({
    version: 1,
    app: 'fae-password-manager',
    encrypted,
    notice: 'This file is encrypted. Only your master password can unlock it.',
  })
}

export async function importEncryptedVault(json: string, key: CryptoKey): Promise<VaultData> {
  const parsed = JSON.parse(json)
  if (parsed.app !== 'fae-password-manager') throw new Error('Invalid vault file')
  const decrypted = await decryptData(parsed.encrypted, key)
  return JSON.parse(decrypted) as VaultData
}
