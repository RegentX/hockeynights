/**
 * SPEC-FR-1.2.3, SPEC-FR-12.1.1, SPEC-FR-12.1.2, SPEC-FR-12.1.3
 */

import {getApiBaseUrl, getApiMode} from '@/shared/config/apiMode'

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
 * Запрос не дошёл до mock/backend API и был обслужен dev-сервером
 * (SPA-fallback отдаёт index.html со статусом 200).
 *
 * В mock-режиме это значит, что MSW не перехватил запрос: service worker
 * не контролирует страницу (hard-reload / первый запуск / SW выгружен)
 * либо на путь нет handler'а. Без этой проверки `response.json()` падал
 * с «Unexpected token '<'», и UI показывал ошибку загрузки без причины.
 */
export class ApiNotInterceptedError extends Error {
  readonly method: string
  readonly path: string

  constructor(method: string, path: string) {
    super(
      `API ${method} ${path}: запрос не дошёл до ${getApiMode() === 'mock' ? 'mock API' : 'backend'} — ` +
        'dev-сервер вернул HTML вместо JSON. ' +
        (getApiMode() === 'mock'
          ? 'Скорее всего mock service worker не контролирует страницу — обновите страницу (Cmd/Ctrl+R).'
          : 'Проверьте VITE_BACKEND_URL и доступность бэкенда.'),
    )
    this.name = 'ApiNotInterceptedError'
    this.method = method
    this.path = path
  }
}

/** Ответ — HTML/текст вместо ожидаемого JSON */
function isNonJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type') ?? ''
  return contentType !== '' && !contentType.includes('json')
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
    throw new Error(`API ${method} ${path} failed: ${response.status} ${errorText}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  // 200 + text/html = SPA-fallback dev-сервера, а не ответ API
  if (isNonJsonResponse(response)) {
    throw new ApiNotInterceptedError(method, path)
  }

  return response.json() as Promise<T>
}
