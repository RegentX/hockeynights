import {describe, expect, it} from 'vitest'

import {isTeamRsvpConfirmed, teamRsvpStatusLabel} from './teamRsvpStatus'

describe('teamRsvpStatusLabel', () => {
  it('does not show accepted for pending or declined', () => {
    expect(teamRsvpStatusLabel('pending')).toBe('Ответ не отправлен')
    expect(teamRsvpStatusLabel(undefined)).toBe('Ответ не отправлен')
    expect(teamRsvpStatusLabel('declined')).toBe('Не смогу')
    expect(teamRsvpStatusLabel('declined', 'Травма')).toBe('Не смогу · Травма')
    expect(teamRsvpStatusLabel('confirmed')).toBe('Вы идёте')
    expect(isTeamRsvpConfirmed('pending')).toBe(false)
    expect(isTeamRsvpConfirmed('declined')).toBe(false)
    expect(isTeamRsvpConfirmed('confirmed')).toBe(true)
  })
})
