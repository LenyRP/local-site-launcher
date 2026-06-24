const DB_NAME = 'localllaunch'
const STORE = 'leads'
const VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(db, mode) {
  return db.transaction(STORE, mode).objectStore(STORE)
}

export function newLead(partial = {}) {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    status: 'found',
    createdAt: now,
    updatedAt: now,
    business: {},
    images: {},
    services: null,
    sectionTitles: null,
    hours: null,
    reviews: [],
    menu: [],
    files: [],
    buildConfig: null,
    publish: null,
    ghl: null,
    ...partial,
  }
}

export async function listLeads() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const r = tx(db, 'readonly').getAll()
    r.onsuccess = () => resolve(r.result || [])
    r.onerror = () => reject(r.error)
  })
}

export async function getLead(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const r = tx(db, 'readonly').get(id)
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
}

export async function saveLead(lead) {
  const db = await openDB()
  const record = { ...lead, updatedAt: Date.now() }
  return new Promise((resolve, reject) => {
    const r = tx(db, 'readwrite').put(record)
    r.onsuccess = () => resolve(record)
    r.onerror = () => reject(r.error)
  })
}

export async function deleteLead(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const r = tx(db, 'readwrite').delete(id)
    r.onsuccess = () => resolve()
    r.onerror = () => reject(r.error)
  })
}
