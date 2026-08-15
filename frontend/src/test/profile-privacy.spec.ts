import {describe, expect, it} from 'vitest'

import {
  canViewProfileByVisibility,
  normalizePrivacySettings,
  redactPlayerForViewer,
  resolvePrivacyViewer,
  resolveVisibleContacts,
  resolveVisibleFields,
} from '@/entities/profile'
import {listPlayersForViewer} from '@/mocks/data/players'
import {getAgeYears, getPlayerLevelLabel} from '@/shared/lib/profileIdentity'

describe('profilePrivacy', () => {
  it('без согласия на ПДн контакты всегда private', () => {
    const privacy = normalizePrivacySettings({
      profileVisibility: 'public',
      personalDataProcessingConsent: false,
      fields: {
        birthDate: 'public',
        city: 'public',
        heightWeight: 'public',
        position: 'public',
        skillLevel: 'public',
        teams: 'public',
        bio: 'public',
        achievements: 'public',
        participationHistory: 'public',
        calendar: 'public',
        phone: 'public',
        email: 'public',
        telegram: 'public',
        maxMessenger: 'public',
      },
    })

    expect(privacy.fields.phone).toBe('private')
    expect(privacy.fields.email).toBe('private')
    expect(privacy.showContacts).toBe(false)
  })

  it('скрывает контакты от публичного зрителя без согласия', () => {
    const fields = normalizePrivacySettings({
      profileVisibility: 'public',
      personalDataProcessingConsent: false,
    }).fields

    expect(
      resolveVisibleContacts({phone: '+7 999', email: 'a@b.ru'}, fields, 'public', false),
    ).toBeUndefined()
  })

  it('показывает public-контакты при согласии', () => {
    const privacy = normalizePrivacySettings({
      profileVisibility: 'public',
      personalDataProcessingConsent: true,
      fields: {
        birthDate: 'public',
        city: 'public',
        heightWeight: 'private',
        position: 'public',
        skillLevel: 'public',
        teams: 'public',
        bio: 'public',
        achievements: 'public',
        participationHistory: 'public',
        calendar: 'public',
        phone: 'public',
        email: 'private',
        telegram: 'teams_only',
        maxMessenger: 'private',
      },
    })

    expect(
      resolveVisibleContacts(
        {
          phone: '+7 999',
          email: 'hidden@example.ru',
          telegram: '@team',
          maxMessenger: 'max',
        },
        privacy.fields,
        'public',
        true,
      ),
    ).toEqual({phone: '+7 999'})

    const visible = resolveVisibleFields(privacy.fields, 'public')
    expect(visible.phone).toBe(true)
    expect(visible.email).toBe(false)
    expect(visible.heightWeight).toBe(false)
    expect(visible.telegram).toBe(false)
  })

  it('redactPlayerForViewer убирает амплуа, уровень и город из payload', () => {
    const privacy = normalizePrivacySettings({
      profileVisibility: 'public',
      personalDataProcessingConsent: false,
      fields: {
        birthDate: 'private',
        city: 'private',
        heightWeight: 'private',
        position: 'private',
        skillLevel: 'private',
        teams: 'private',
        bio: 'private',
        achievements: 'private',
        participationHistory: 'private',
        calendar: 'private',
        phone: 'private',
        email: 'private',
        telegram: 'private',
        maxMessenger: 'private',
      },
    })
    const visible = resolveVisibleFields(privacy.fields, 'public')
    const redacted = redactPlayerForViewer(
      {
        userId: 'user-test',
        displayName: 'Тест',
        fullName: 'Тест',
        city: 'Москва',
        position: 'goalie',
        skillLevel: 'master',
        playerIndex: 9,
        stickHand: 'left',
        birthDate: '1990-01-01',
        heightCm: 180,
        weightKg: 80,
        availability: [],
        preferredArenaIds: ['arena-001'],
        profileCompleteness: 50,
        karmaScore: 50,
        goalieReliabilityScore: 90,
        teamName: 'Медведи',
        teamIds: ['team-001'],
      },
      visible,
    )

    expect(redacted.city).toBe('')
    expect(redacted.position).toBe('any')
    expect(redacted.skillLevel).toBe('unknown')
    expect(redacted.playerIndex).toBeUndefined()
    expect(redacted.stickHand).toBeUndefined()
    expect(redacted.goalieReliabilityScore).toBeUndefined()
    expect(redacted.contacts).toBeUndefined()
  })

  it('teams_only / private / verified_only закрывают профиль чужому зрителю', () => {
    expect(canViewProfileByVisibility('private', 'public', true)).toBe(false)
    expect(canViewProfileByVisibility('teams_only', 'public', true)).toBe(false)
    expect(canViewProfileByVisibility('teams_only', 'teammate', false)).toBe(true)
    expect(canViewProfileByVisibility('verified_only', 'public', false)).toBe(false)
    expect(canViewProfileByVisibility('verified_only', 'public', true)).toBe(true)
    expect(resolvePrivacyViewer('user-003', 'user-001', ['team-001'], ['team-001'])).toBe(
      'teammate',
    )
  })

  it('каталог не отдаёт private-профиль чужому зрителю', () => {
    const visible = listPlayersForViewer({
      userId: 'user-001',
      teamIds: ['team-001'],
      verified: true,
    })
    expect(visible.some((player) => player.userId === 'user-008')).toBe(false)
    expect(visible.some((player) => player.userId === 'user-003')).toBe(true)
  })
})

describe('profile identity helpers', () => {
  it('считает возраст по календарной дате, а не UTC midnight', () => {
    const now = new Date(2026, 10, 18, 22, 0, 0)
    expect(getAgeYears('1981-11-19', now)).toBe(44)
  })

  it('подписывает legacy skillLevel без playerIndex', () => {
    expect(getPlayerLevelLabel({skillLevel: 'advanced'})).toBe('Уверенный теоретик')
    expect(getPlayerLevelLabel({skillLevel: 'league'})).toBe('Мастер')
    expect(getPlayerLevelLabel({skillLevel: 'unknown'})).toBe('—')
  })
})
