/**
 * SPEC-UI-4.1, SPEC-UI-4.2, SPEC-FR-1.2.2
 */

import {ThemeProvider} from '@gravity-ui/uikit'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

/** @spec SPEC-UI-4.1 - Ice & Energy (dark) */
/** @spec SPEC-UI-4.2 - Locker Room (light) */
export type HockeyThemeId = 'locker' | 'ice'

const STORAGE_KEY = 'hockey-social-theme'

/** @spec SPEC-FR-1.2.2 */
export interface HockeyThemeContextValue {
  /** @spec SPEC-UI-4.1 */
  themeId: HockeyThemeId
  /** @spec SPEC-UI-4.2 */
  setThemeId: (id: HockeyThemeId) => void
  /** @spec SPEC-UI-4.1 */
  toggleTheme: () => void
}

const HockeyThemeContext = createContext<HockeyThemeContextValue | null>(null)

function readStoredTheme(): HockeyThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ice' || stored === 'locker') return stored
  } catch {
    /* ignore */
  }
  return 'ice'
}

/** @spec SPEC-FR-1.2.2 - Props провайдера темы */
export interface HockeyThemeProviderProps {
  children: ReactNode
}

/**
 * @spec SPEC-UI-4.1 - Тёмная тема Ice & Energy
 * @spec SPEC-UI-4.2 - Светлая тема Locker Room
 * @spec SPEC-FR-1.2.2 - ThemeProvider Gravity UI
 */
export function HockeyThemeProvider({children}: HockeyThemeProviderProps) {
  const [themeId, setThemeIdState] = useState<HockeyThemeId>(readStoredTheme)

  const setThemeId = useCallback((id: HockeyThemeId) => {
    setThemeIdState(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeId(themeId === 'locker' ? 'ice' : 'locker')
  }, [themeId, setThemeId])

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-hockey-theme', themeId)
  }, [themeId])

  const value = useMemo(
    () => ({themeId, setThemeId, toggleTheme}),
    [themeId, setThemeId, toggleTheme],
  )

  return (
    <HockeyThemeContext.Provider value={value}>
      <ThemeProvider theme={themeId === 'ice' ? 'dark' : 'light'}>{children}</ThemeProvider>
    </HockeyThemeContext.Provider>
  )
}

/** @spec SPEC-FR-1.2.2 */
export function useHockeyTheme(): HockeyThemeContextValue {
  const ctx = useContext(HockeyThemeContext)
  if (!ctx) {
    throw new Error('useHockeyTheme must be used within HockeyThemeProvider')
  }
  return ctx
}
