import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type {ReactNode} from 'react'

import {ApiError, ApiNotInterceptedError} from '@/shared/api/client'

interface QueryProviderProps {
  children: ReactNode
}

const MAX_RETRIES = 1

/**
 * Ретраим только то, что реально может починиться повтором.
 *
 * По умолчанию react-query делает 3 попытки с exponential backoff — из-за
 * этого любая ошибка загрузки становилась видимой пользователю только через
 * ~7 секунд молчания. Хуже всего это било по случаю «mock service worker не
 * контролирует страницу»: повтор там не помогает в принципе, а UI всё это
 * время не давал никакой обратной связи.
 */
function shouldRetry(failureCount: number, error: Error): boolean {
  // Повтор не вернёт контроль service worker'у — нужна перезагрузка
  if (error instanceof ApiNotInterceptedError) return false
  // 4xx не изменится от повтора: нет сущности, нет прав, невалидный запрос
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < MAX_RETRIES
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetry,
      retryDelay: 500,
    },
    mutations: {
      retry: false,
    },
  },
})

export function QueryProvider({children}: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
