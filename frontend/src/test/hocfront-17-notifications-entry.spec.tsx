/**
 * HOCFRONT-17 — позитивный smoke: точка входа «Уведомления» в shared header.
 */

import {screen} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {NotificationsBellLink} from '@/shared/ui/NotificationsBellLink'
import {renderWithProviders} from '@/test/render'

vi.mock('lottie-react', () => ({
  useLottie: () => ({
    View: <span data-testid="app-shell-lottie-stub" />,
    animationItem: null,
  }),
}))

describe('HOCFRONT-17 notifications header entry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders app-shell notifications link to /notifications', () => {
    renderWithProviders(<NotificationsBellLink unreadCount={0} />)

    const link = screen.getByTestId('app-shell-link-notifications')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/notifications')
    expect(link).toHaveAttribute('aria-label', 'Уведомления')
  })

  it('shows unread badge when count > 0', () => {
    renderWithProviders(<NotificationsBellLink unreadCount={3} />)

    expect(screen.getByTestId('app-shell-badge-notifications')).toHaveTextContent('3')
    expect(screen.getByTestId('app-shell-link-notifications')).toHaveAttribute(
      'aria-label',
      'Уведомления, непрочитанных: 3',
    )
  })
})
