/**
 * SPEC-FR-12.1.2, SPEC-NFR-2
 */

import {setupWorker} from 'msw/browser'

import {handlers} from '@/mocks/handlers'

/** @spec SPEC-NFR-2 - MSW worker для Phase 1 */
export const worker = setupWorker(...handlers)

/**
 * @spec SPEC-FR-12.1.2 - Запуск mock API в браузере
 */
export async function startMockApi(): Promise<void> {
  await worker.start({onUnhandledRequest: 'bypass'})
}
