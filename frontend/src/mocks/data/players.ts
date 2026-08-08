/**
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2, SPEC-FR-8.2.1
 * SPEC-FR-24.1.3
 */

import type {
  HockeyProfile,
  ParticipationRecord,
  PlayerListItem,
  PrivacySettings,
  PublicPlayerView,
} from '@/entities/profile'

/** @spec SPEC-FR-24.1.3 - Mock приватность публичных профилей */
export const mockPlayerPrivacy: Record<
  string,
  Pick<
    PrivacySettings,
    'profileVisibility' | 'showContacts' | 'showParticipationHistory' | 'calendarVisibility'
  >
> = {
  'user-002': {
    profileVisibility: 'public',
    showContacts: false,
    showParticipationHistory: true,
    calendarVisibility: 'public',
  },
  'user-003': {
    profileVisibility: 'teams_only',
    showContacts: false,
    showParticipationHistory: false,
    calendarVisibility: 'private',
  },
  'user-004': {
    profileVisibility: 'public',
    showContacts: true,
    showParticipationHistory: true,
    calendarVisibility: 'teams_only',
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
      eventType: 'game',
      arenaName: 'Ледовый дворец на Ходынке',
      opponent: 'Вымпел',
      result: '2:1',
      durationMinutes: 90,
      note: '22 сейва, 1 пропущенный.',
      chatId: 'chat-2',
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
      eventType: 'game',
      arenaName: 'Ледовый дворец на Ходынке',
      opponent: 'Вымпел',
      result: '3:2',
      durationMinutes: 90,
      chatId: 'chat-2',
    },
  ],
}

type PlayerPrivacy = Pick<
  PrivacySettings,
  'profileVisibility' | 'showContacts' | 'showParticipationHistory' | 'calendarVisibility'
>

function buildViewFromPlayer(
  player: PlayerListItem,
  privacy: PlayerPrivacy,
  participationHistory?: ParticipationRecord[],
): PublicPlayerView {
  if (privacy.profileVisibility === 'private') {
    return {
      player,
      visibility: 'hidden',
      contactsVisible: false,
      participationHistoryVisible: false,
      calendarVisible: false,
    }
  }

  const visibility = privacy.profileVisibility === 'teams_only' ? 'limited' : 'full'
  // MVP: teams_only ≠ private. Точный ACL «только сокомандникам» — на бэке.
  const calendarVisible = privacy.calendarVisibility !== 'private'

  return {
    player,
    visibility,
    contactsVisible: privacy.showContacts,
    participationHistoryVisible: privacy.showParticipationHistory,
    participationHistory: privacy.showParticipationHistory ? participationHistory : undefined,
    calendarVisible,
  }
}

/** @spec SPEC-FR-24.1.3 - Публичный вид текущего пользователя (Hockey ID /profile/me) */
export function buildPublicPlayerViewFromProfile(
  profile: HockeyProfile,
  privacy: PlayerPrivacy,
): PublicPlayerView {
  const player: PlayerListItem = {
    ...profile,
    displayName: profile.fullName,
  }
  return buildViewFromPlayer(player, privacy, profile.participationHistory)
}

/** @spec SPEC-FR-24.1.3 - Собрать публичное представление игрока */
export function buildPublicPlayerView(userId: string): PublicPlayerView | null {
  const player = mockPlayers.find((p) => p.userId === userId)
  if (!player) return null

  const privacy = mockPlayerPrivacy[userId] ?? {
    profileVisibility: 'public',
    showContacts: false,
    showParticipationHistory: false,
    calendarVisibility: 'public',
  }

  return buildViewFromPlayer(player, privacy, mockParticipationByUser[userId])
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
    avatarUrl: 'https://placehold.co/400x560/0d253f/ffffff?text=AS',
    verificationStatus: 'verified',
    teamName: 'Медведи САО',
    teamIds: ['team-002'],
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
    avatarUrl: 'https://placehold.co/400x560/1a2f4a/ffffff?text=DK',
    verificationStatus: 'verified',
    teamName: 'Медведи САО',
    teamIds: ['team-001', 'team-002'],
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
    avatarUrl: 'https://placehold.co/400x560/122a45/ffffff?text=SV',
    verificationStatus: 'unverified',
    teamName: 'Медведи САО',
    teamIds: ['team-001', 'team-003'],
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
    avatarUrl: 'https://placehold.co/400x560/163a5c/ffffff?text=MO',
    verificationStatus: 'pending',
    teamName: 'Медведи САО',
    teamIds: ['team-001'],
  },
  {
    userId: 'user-001',
    displayName: 'Иван Петров',
    fullName: 'Иван Петров',
    city: 'Москва',
    district: 'САО',
    metro: 'Динамо',
    position: 'forward',
    skillLevel: 'amateur',
    stickHand: 'right',
    availability: ['weekday_evening'],
    preferredArenaIds: ['arena-001'],
    profileCompleteness: 85,
    karmaScore: 84,
    avatarUrl: 'https://placehold.co/400x560/1c3d5a/ffffff?text=IP',
    verificationStatus: 'verified',
    teamName: 'Медведи САО',
    teamIds: ['team-001'],
  },
  {
    userId: 'user-006',
    displayName: 'Артём Белов',
    fullName: 'Артём Белов',
    city: 'Москва',
    district: 'ВАО',
    metro: 'Измайлово',
    position: 'forward',
    skillLevel: 'amateur',
    stickHand: 'left',
    availability: ['weekday_evening', 'sunday_morning'],
    preferredArenaIds: ['arena-001'],
    profileCompleteness: 70,
    karmaScore: 68,
    avatarUrl: 'https://placehold.co/400x560/1a334d/ffffff?text=AB',
    verificationStatus: 'verified',
    teamName: 'Медведи САО',
    teamIds: ['team-002'],
  },
  {
    userId: 'user-007',
    displayName: 'Павел Новиков',
    fullName: 'Павел Новиков',
    city: 'Москва',
    district: 'ЮЗАО',
    metro: 'Юго-Западная',
    position: 'goalie',
    skillLevel: 'beginner',
    stickHand: 'unknown',
    availability: ['sunday_morning'],
    preferredArenaIds: ['arena-002'],
    profileCompleteness: 48,
    karmaScore: 55,
    goalieReliabilityScore: 61,
    avatarUrl: 'https://placehold.co/400x560/0f2a40/ffffff?text=PN',
    verificationStatus: 'unverified',
  },
  {
    userId: 'user-008',
    displayName: 'Кирилл Соколов',
    fullName: 'Кирилл Соколов',
    city: 'Казань',
    district: 'Центр',
    metro: undefined,
    position: 'defense',
    skillLevel: 'advanced',
    stickHand: 'right',
    availability: ['weekday_evening'],
    preferredArenaIds: ['arena-001'],
    profileCompleteness: 76,
    karmaScore: 73,
    avatarUrl: 'https://placehold.co/400x560/163248/ffffff?text=KS',
    verificationStatus: 'verified',
  },
  {
    userId: 'user-009',
    displayName: 'Артур Лебедев',
    fullName: 'Артур Лебедев',
    city: 'Санкт-Петербург',
    district: 'Приморский',
    metro: 'Пионерская',
    position: 'forward',
    skillLevel: 'amateur',
    stickHand: 'right',
    availability: ['weekday_evening'],
    preferredArenaIds: ['arena-003'],
    profileCompleteness: 72,
    karmaScore: 80,
    avatarUrl: 'https://placehold.co/400x560/1a3a52/ffffff?text=AL',
    verificationStatus: 'verified',
  },
]
