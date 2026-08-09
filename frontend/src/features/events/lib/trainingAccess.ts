import type {GameEvent} from '@/entities/event'
import type {Team} from '@/entities/team'

export function getUserTeamIds(teams: Team[], userId: string): string[] {
  return teams.filter((team) => team.memberIds.includes(userId)).map((team) => team.id)
}

/** Клубы, в команды которых входит пользователь. */
export function getUserClubIds(teams: Team[], userId: string): string[] {
  return [
    ...new Set(
      teams
        .filter((team) => team.memberIds.includes(userId) && Boolean(team.clubId))
        .map((team) => team.clubId as string),
    ),
  ]
}

export interface TrainingAccessOptions {
  isAdmin?: boolean
  /** Админ клуба / partner club membership для event.clubId */
  canManageClub?: boolean
  /** Клубы пользователя через любую команду клуба */
  userClubIds?: string[]
}

export function canViewTraining(
  event: GameEvent,
  userId: string,
  userTeamIds: string[],
  isAdminOrOptions: boolean | TrainingAccessOptions = false,
): boolean {
  const options: TrainingAccessOptions =
    typeof isAdminOrOptions === 'boolean' ? {isAdmin: isAdminOrOptions} : (isAdminOrOptions ?? {})

  if (options.isAdmin) return true
  if (event.organizerUserId === userId) return true

  const scope = event.accessScope ?? 'public'
  if (scope === 'public' || scope === 'public_open') return true

  if (scope === 'limited') {
    if (!event.allowedUserIds?.length) return true
    return event.allowedUserIds.includes(userId)
  }

  if (scope === 'club_only' || scope === 'private_club') {
    if (options.canManageClub) return true
    if (event.clubId && options.userClubIds?.includes(event.clubId)) return true
    if (event.teamId && userTeamIds.includes(event.teamId)) return true
    return false
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
