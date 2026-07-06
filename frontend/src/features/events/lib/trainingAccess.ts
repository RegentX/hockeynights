import type {GameEvent} from '@/entities/event'
import type {Team} from '@/entities/team'

export function getUserTeamIds(teams: Team[], userId: string): string[] {
  return teams.filter((team) => team.memberIds.includes(userId)).map((team) => team.id)
}

export function canViewTraining(
  event: GameEvent,
  userId: string,
  userTeamIds: string[],
  isAdmin = false,
): boolean {
  if (isAdmin) return true
  if (event.organizerUserId === userId) return true

  const scope = event.accessScope ?? 'public'
  if (scope === 'public') return true

  if (scope === 'limited') {
    if (!event.allowedUserIds?.length) return true
    return event.allowedUserIds.includes(userId)
  }

  if (scope === 'club_only') {
    if (!event.teamId) return false
    return userTeamIds.includes(event.teamId)
  }

  return true
}

export function resolveTrainingUserName(
  userId: string,
  event: GameEvent,
  playerNames: Record<string, string>,
): string {
  if (userId === event.organizerUserId) {
    return event.organizerDisplayName ?? playerNames[userId] ?? 'Организатор тренировки'
  }

  const participationName = event.participation.find((item) => item.userId === userId)?.displayName
  return playerNames[userId] ?? participationName ?? 'Участник'
}
