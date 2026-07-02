/**
 * SPEC-FR-12.1.2, SPEC-NFR-2
 */

import {setupServer} from 'msw/node'

import {handlers} from '@/mocks/handlers'

/** @spec SPEC-FR-12.1.2 - Node MSW server для тестов */
export const server = setupServer(...handlers)
