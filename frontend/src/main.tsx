/**
 * SPEC-FR-1.2.2, SPEC-FR-12.1.2, SPEC-NFR-2
 */

import '@gravity-ui/uikit/styles/fonts.css'
import '@gravity-ui/uikit/styles/styles.css'
import './index.scss'

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {startMockApi} from '@/mocks/browser'
import {getApiMode} from '@/shared/config/apiMode'

import App from './App.tsx'

/**
 * @spec SPEC-NFR-2 - Bootstrap с MSW в mock-режиме
 */
async function bootstrap() {
  if (getApiMode() === 'mock') {
    await startMockApi()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
