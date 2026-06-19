/**
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2, SPEC-FR-8.2.1
 * SPEC-FR-24.1.3
 */

import type {ParticipationRecord, PlayerListItem, PrivacySettings, PublicPlayerView} from '@/entities/profile/types'

/** @spec SPEC-FR-24.1.3 - Mock приватность публичных профилей */
export const mockPlayerPrivacy: Record<
  string,
  Pick<PrivacySettings, 'profileVisibility' | 'showContacts' | 'showParticipationHistory'>
> = {
  'user-002': {
    profileVisibility: 'public',
    showContacts: false,
    showParticipationHistory: true,
  },
  'user-003': {
    profileVisibility: 'teams_only',
    showContacts: false,
    showParticipationHistory: false,
  },
  'user-004': {
    profileVisibility: 'public',
    showContacts: true,
    showParticipationHistory: true,
  },
}

const mockParticipationByUser: Record<string, ParticipationRecord[]> = {
  'user-002': [
    {
      eventId: 'event-003',
      eventTitle: 'Прошедшая игра — Вымпел',
      eventDate: '2026-06-01T19:00:00+03:00',
      teamName: 'Медведи САО',
      role: 'goalie',
      confirmed: true,
    },
  ],
  'user-004': [
    {
      eventId: 'event-001',
      eventTitle: 'Товарищеская игра — Медведи САО',
      eventDate: '2026-06-07T20:00:00+03:00',
      teamName: 'Медведи САО',
      role: 'player',
      confirmed: true,
    },
  ],
}

/** @spec SPEC-FR-24.1.3 - Собрать публичное представление игрока */
export function buildPublicPlayerView(userId: string): PublicPlayerView | null {
  const player = mockPlayers.find((p) => p.userId === userId)
  if (!player) return null

  const privacy = mockPlayerPrivacy[userId] ?? {
    profileVisibility: 'public' as const,
    showContacts: false,
    showParticipationHistory: false,
  }

  if (privacy.profileVisibility === 'private') {
    return {
      player,
      visibility: 'hidden',
      contactsVisible: false,
      participationHistoryVisible: false,
    }
  }

  const visibility = privacy.profileVisibility === 'teams_only' ? 'limited' : 'full'

  return {
    player,
    visibility,
    contactsVisible: privacy.showContacts,
    participationHistoryVisible: privacy.showParticipationHistory,
    participationHistory: privacy.showParticipationHistory
      ? mockParticipationByUser[userId]
      : undefined,
  }
}

/** @spec SPEC-FR-2.3.1 - Mock список игроков */
export const mockPlayers: PlayerListItem[] = [
  {
    userId: 'user-002',
    displayName: 'Алексей Смирнов',
    fullName: 'Алексей Смирнов',
    city: 'Москва',
    district: 'СЗАО',
    metro: 'Сокол',
    position: 'goalie',
    skillLevel: 'advanced',
    stickHand: 'unknown',
    availability: ['weekday_evening'],
    preferredArenaIds: ['arena-001', 'arena-002'],
    profileCompleteness: 90,
    karmaScore: 88,
    goalieReliabilityScore: 92,
  },
  {
    userId: 'user-003',
    displayName: 'Дмитрий Козлов',
    fullName: 'Дмитрий Козлов',
    city: 'Москва',
    district: 'ЮАО',
    metro: 'Коломенская',
    position: 'defense',
    skillLevel: 'amateur',
    stickHand: 'right',
    availability: ['sunday_morning'],
    preferredArenaIds: ['arena-002'],
    profileCompleteness: 65,
    karmaScore: 71,
  },
  {
    userId: 'user-004',
    displayName: 'Сергей Волков',
    fullName: 'Сергей Волков',
    city: 'Москва',
    district: 'САО',
    metro: 'ЦСКА',
    position: 'forward',
    skillLevel: 'beginner',
    stickHand: 'left',
    availability: ['weekday_evening', 'sunday_morning'],
    preferredArenaIds: ['arena-001'],
    profileCompleteness: 55,
    karmaScore: 62,
  },
  {
    userId: 'user-005',
    displayName: 'Михаил Орлов',
    fullName: 'Михаил Орлов',
    city: 'Москва',
    district: 'САО',
    metro: 'Динамо',
    position: 'defense',
    skillLevel: 'advanced',
    stickHand: 'left',
    availability: ['weekday_evening'],
    preferredArenaIds: ['arena-001'],
    profileCompleteness: 80,
    karmaScore: 79,
  },
]
