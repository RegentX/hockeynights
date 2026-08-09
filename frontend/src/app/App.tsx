/**
 * SPEC-FR-1.2.2, SPEC-FR-12.1.1
 */

import {AppErrorBoundary} from '@/app/AppErrorBoundary'
import {AppRouter} from '@/app/providers/AppRouter'
import {QueryProvider} from '@/app/providers/QueryProvider'
import {ThemeProvider} from '@/app/providers/ThemeProvider'

/**
 * @spec SPEC-FR-1.2.2 - Корневой компонент React + Gravity UI
 * @spec SPEC-UI-4.1, SPEC-UI-4.2 - Hockey theme provider
 */
export function App() {
  return (
    <ThemeProvider>
      <AppErrorBoundary>
        <QueryProvider>
          <AppRouter />
        </QueryProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  )
}
