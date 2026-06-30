/**
 * Мини-страница /terms
 */

import {screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {TermsOfUsePage} from '@/features/auth/TermsOfUsePage'
import {renderWithProviders} from '@/test/render'

describe('TermsOfUsePage', () => {
  it('renders full terms document on /terms route', () => {
    renderWithProviders(<TermsOfUsePage />, {routerProps: {initialEntries: ['/terms']}})

    expect(screen.getByTestId('auth-terms-page')).toBeInTheDocument()
    expect(screen.getByText('Пользовательское соглашение Hockey Nights')).toBeInTheDocument()
    expect(screen.getByText('4. Сообщения и контент')).toBeInTheDocument()
    expect(screen.getByTestId('auth-terms-link-back-register')).toHaveAttribute('href', '/register')
  })
})
