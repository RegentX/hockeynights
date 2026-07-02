/**
 * Мини-страница /terms
 */

import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'
import {Route, Routes} from 'react-router-dom'
import {TermsOfUsePage} from '@/features/auth/TermsOfUsePage'
import {renderWithProviders} from '@/test/render'

describe('TermsOfUsePage', () => {
  it('renders full terms document on /terms route', () => {
    renderWithProviders(<TermsOfUsePage />, {routerProps: {initialEntries: ['/terms']}})

    expect(screen.getByTestId('auth-terms-page')).toBeInTheDocument()
    expect(screen.getByText('Пользовательское соглашение Hockey Nights')).toBeInTheDocument()
    expect(screen.getByText('4. Сообщения и контент')).toBeInTheDocument()
    expect(screen.getByTestId('auth-terms-btn-collapse')).toBeInTheDocument()
  })

  it('navigates back on collapse', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
        <Route path="/terms" element={<TermsOfUsePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/', '/terms'], initialIndex: 1}},
    )

    expect(screen.getByTestId('auth-terms-page')).toBeInTheDocument()
    await user.click(screen.getByTestId('auth-terms-btn-collapse'))
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })
})
