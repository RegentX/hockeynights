import {describe, expect, it} from 'vitest'

import {
  normalizePrivacySettings,
  resolveVisibleContacts,
  resolveVisibleFields,
} from '@/entities/profile'

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
})
