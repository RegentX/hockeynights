/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 */

import type {Session, User} from '@/entities/user/types'
import type {HockeyProfile} from '@/entities/profile/types'

/** @spec SPEC-FR-2.1.1 - Mock пользователь по умолчанию */
export const mockUser: User = {
  id: 'user-001',
  displayName: 'Иван Петров',
  roles: ['player', 'captain'],
  city: 'Москва',
  createdAt: '2026-01-15T10:00:00Z',
}

/** @spec SPEC-FR-2.1.3 - Mock сессия */
export let mockSession: Session = {
  user: mockUser,
  isOnboarded: false,
}

/** @spec SPEC-FR-2.2.1 - Mock профиль */
export let mockProfile: HockeyProfile = {
  userId: 'user-001',
  fullName: 'Иван Петров',
  city: 'Москва',
  district: 'САО',
  metro: 'Динамо',
  position: 'forward',
  skillLevel: 'amateur',
  stickHand: 'left',
  availability: ['weekday_evening', 'sunday_morning'],
  preferredArenaIds: ['arena-001'],
  bio: 'Любитель, играю 2 раза в неделю',
  profileCompleteness: 72,
  karmaScore: 74,
  achievements: ['10 игр подряд без пропусков', '3 SOS-выручки', '5 отзывов без no-show'],
}

/**
 * @spec SPEC-FR-2.1.2 - Обновление ролей после onboarding
 */
export function completeOnboarding(displayName: string, roles: User['roles']): Session {
  mockUser.displayName = displayName
  mockUser.roles = roles
  mockSession = {
    user: {...mockUser, roles},
    isOnboarded: true,
  }
  return mockSession
}

/**
 * @spec SPEC-FR-2.2.1 - Обновление Hockey ID
 */
export function updateMockProfile(profile: Partial<HockeyProfile>): HockeyProfile {
  mockProfile = {...mockProfile, ...profile}
  return mockProfile
}
