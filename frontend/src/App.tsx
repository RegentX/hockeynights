/**
 * SPEC-FR-1.2.2, SPEC-FR-12.1.1
 */

import {BrowserRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {HockeyThemeProvider} from '@/shared/theme/HockeyThemeProvider'
import {SmoothScrollProvider} from '@/shared/theme/SmoothScrollProvider'
import {AppRoutes} from '@/app/routes'

const queryClient = new QueryClient()

/**
 * @spec SPEC-FR-1.2.2 - Корневой компонент React + Gravity UI
 * @spec SPEC-UI-4.1, SPEC-UI-4.2 - Hockey theme provider aboba
 */
export default function App() {
  return (
    <HockeyThemeProvider>
      <SmoothScrollProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </SmoothScrollProvider>
    </HockeyThemeProvider>
  )
}
