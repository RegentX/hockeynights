/** In-memory Storage для jsdom / Node 26, где window.localStorage недоступен. */
export function createLocalStorageMock(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
  }
}

/** Подставляет localStorage/sessionStorage, если окружение их не предоставляет. */
export function ensureBrowserStorage(): void {
  if (typeof window === 'undefined') return

  if (typeof window.localStorage === 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
    })
  }

  if (typeof window.sessionStorage === 'undefined') {
    Object.defineProperty(window, 'sessionStorage', {
      value: createLocalStorageMock(),
      configurable: true,
    })
  }
}
