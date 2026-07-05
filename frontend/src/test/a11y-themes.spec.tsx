/**
 * SPEC-UI-4.1, SPEC-UI-4.2, SPEC-UI-5.3, SPEC-UI-5.4
 * TASK-QA-03
 */

import {Button} from '@gravity-ui/uikit'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'

import {useHockeyTheme} from '@/shared/theme/HockeyThemeProvider'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {PositionLabel} from '@/shared/ui/PositionLabel'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {renderWithProviders} from '@/test/render'

function ThemeToggleProbe() {
  const {themeId, toggleTheme} = useHockeyTheme()
  return (
    <Button onClick={toggleTheme} aria-label="Переключить тему">
      {themeId}
    </Button>
  )
}

describe('TASK-QA-03 design system a11y', () => {
  /** @spec SPEC-UI-1.2 */
  it('SOS button has text label beyond color', () => {
    renderWithProviders(<HockeyButton variant="sos">SOS</HockeyButton>)
    expect(screen.getByRole('button', {name: /SOS/i})).toBeInTheDocument()
  })

  /** @spec SPEC-UI-1.4 */
  it('PositionLabel exposes aria-label', () => {
    renderWithProviders(<PositionLabel position="goalie" />)
    expect(screen.getByLabelText(/Амплуа: ВР/i)).toBeInTheDocument()
  })

  /** @spec SPEC-UI-3.1 */
  it('ScoreboardLoader has status role', () => {
    renderWithProviders(<ScoreboardLoader />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  /** @spec SPEC-UI-4.1, SPEC-UI-4.2 */
  it('theme toggle switches data-hockey-theme', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ThemeToggleProbe />)

    const before = document.documentElement.getAttribute('data-hockey-theme')
    expect(before === 'ice' || before === 'locker').toBe(true)

    await user.click(screen.getByRole('button', {name: /Переключить тему/i}))
    const after = document.documentElement.getAttribute('data-hockey-theme')
    expect(after).not.toBe(before)
  })

  /** @spec SPEC-UI-5.3 */
  it('decorative loader exposes ticker class for motion override', () => {
    const {container} = renderWithProviders(<ScoreboardLoader />)
    expect(container.querySelector('.hockey-scoreboard-ticker')).toBeTruthy()
  })
})
