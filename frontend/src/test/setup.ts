/**
 * SPEC-FR-1.1.1, SPEC-NFR-2
 */

import '@testing-library/jest-dom/vitest'
import '../index.scss'

import {cleanup} from '@testing-library/react'
import {afterAll, afterEach, beforeAll, vi} from 'vitest'

import {clearTestStorage} from '@/test/clearTestStorage'
import {server} from '@/test/msw-server'

/** @spec SPEC-NFR-2 - Polyfills для Gravity UI в jsdom */
class ResizeObserverStub {
  observe() {}

  unobserve() {}

  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub)

/** @spec SPEC-FR-6.1.1 - Leaflet не инициализируется в jsdom */
vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn(() => ({})),
    latLngBounds: vi.fn(() => ({
      pad: vi.fn(() => ({})),
      extend: vi.fn(() => ({})),
    })),
  },
}))

vi.mock('react-leaflet', () => import('@/test/mocks/react-leaflet'))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/**
 * @spec SPEC-NFR-2 - MSW server для smoke-тестов
 */
beforeAll(() => server.listen({onUnhandledRequest: 'error'}))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  clearTestStorage()
})
afterAll(() => server.close())
