/**
 * SPEC-FR-12.1.1, SPEC-FR-1.1.1
 */

import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-12.1.1 - GET helper через единый API client
 */
export function mockApiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path)
}

/**
 * @spec SPEC-FR-12.1.1 - POST helper через единый API client
 */
export function mockApiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {method: 'POST', body})
}

/**
 * @spec SPEC-FR-12.1.1 - PATCH helper через единый API client
 */
export function mockApiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {method: 'PATCH', body})
}

/**
 * @spec SPEC-FR-12.1.1 - PUT helper через единый API client
 */
export function mockApiPut<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {method: 'PUT', body})
}
