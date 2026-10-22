// Almacenamiento local en IndexedDB (sin dependencias).
const DB_NAME = 'trip-planner'
const STORE = 'kv'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function run(mode, fn) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = fn(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(req && req.result)
    tx.onerror = () => reject(tx.error)
  }))
}

export const getItem = key => run('readonly', s => s.get(key))
export const setItem = (key, value) => run('readwrite', s => s.put(value, key))
export const removeItem = key => run('readwrite', s => s.delete(key))

export const clearCache = () => run('readwrite', s => {
  const req = s.openCursor()
  req.onsuccess = () => {
    const c = req.result
    if (!c) return
    if (String(c.key).startsWith('cache:')) c.delete()
    c.continue()
  }
  return req
})

// Pide al navegador que no borre los datos (importante en iPhone).
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist()
  } catch { /* ignorar */ }
  return false
}
