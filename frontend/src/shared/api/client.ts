/**
 * SPEC-FR-1.2.3, SPEC-FR-12.1.1, SPEC-FR-12.1.2, SPEC-FR-12.1.3
 */

import {extractApiErrorMessage} from '@/shared/api/parseApiError'
import {getApiBaseUrl} from '@/shared/config/apiMode'

/** @spec SPEC-FR-12.1.1 - Опции HTTP-запроса */
export interface RequestOptions {
  /** @spec SPEC-FR-12.1.1 */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** @spec SPEC-FR-12.1.1 */
  body?: unknown
  /** @spec SPEC-FR-12.1.1 */
  headers?: Record<string, string>
}

/**
 * @spec SPEC-FR-12.1.1 - Единый API client для mock и backend
 * @spec SPEC-FR-12.1.3 - Не меняет контракт при переключении режима
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {method = 'GET', body, headers = {}} = options
  const url = `${getApiBaseUrl()}${path}`

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    const apiMessage = extractApiErrorMessage(errorText)
    throw new Error(apiMessage ?? `API ${method} ${path} failed: ${response.status} ${errorText}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
