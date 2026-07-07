import type {ReactNode} from 'react'

import {HockeyThemeProvider} from '@/shared/theme/HockeyThemeProvider'
import {SmoothScrollProvider} from '@/shared/theme/SmoothScrollProvider'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({children}: ThemeProviderProps) {
  return (
    <HockeyThemeProvider>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </HockeyThemeProvider>
  )
}
