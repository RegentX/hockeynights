/**
 * SPEC-FR-1.2.2, SPEC-FR-1.1.1
 */

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {render, type RenderOptions} from '@testing-library/react'
import type {ReactElement, ReactNode} from 'react'
import {MemoryRouter, type MemoryRouterProps} from 'react-router-dom'

import {HockeyThemeProvider} from '@/shared/theme/HockeyThemeProvider'

/** @spec SPEC-FR-1.2.2 - Опции render helper */
export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** @spec SPEC-FR-1.2.1 */
  routerProps?: MemoryRouterProps
}

/**
 * @spec SPEC-FR-1.2.2 - Render с Gravity UI, Query и Router
 */
export function renderWithProviders(
  ui: ReactElement,
  {routerProps, ...options}: RenderWithProvidersOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {retry: false},
      mutations: {retry: false},
    },
  })

  function Wrapper({children}: {children: ReactNode}) {
    return (
      <HockeyThemeProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter {...routerProps}>{children}</MemoryRouter>
        </QueryClientProvider>
      </HockeyThemeProvider>
    )
  }

  return render(ui, {wrapper: Wrapper, ...options})
}
