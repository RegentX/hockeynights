/**
 * HOCFRONT-25 — данные для FIFA-карточки игрока
 */

import type {PlayerPosition} from '@/entities/common'
import type {PlayerListItem} from '@/entities/profile'

export interface FifaPlayerCardView {
  userId: string
  firstName: string
  lastName: string
  fullName: string
  jerseyNumber: string
  age: number
  position: PlayerPosition
  positionLabel: string
  overall: number
  avatarUrl: string
  skillLabel: string
  gamesPlayed: number
  goals: number
  assists: number
  plusMinus: number
  savePct?: number
  goalsAgainstAvg?: number
  karmaScore: number
}

const POSITION_LABELS: Record<PlayerPosition, string> = {
  goalie: 'G',
  defense: 'D',
  forward: 'F',
  any: 'UTL',
}

const SKILL_LABELS: Record<string, string> = {
  beginner: 'Дебютант',
  amateur: 'Любитель',
  advanced: 'Продвинутый',
  league: 'Лига',
  unknown: '—',
}

function hashSeed(userId: string): number {
  return userId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
}

export function splitDisplayName(fullName: string): {firstName: string; lastName: string} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return {firstName: 'Игрок', lastName: ''}
  if (parts.length === 1) return {firstName: parts[0], lastName: ''}
  return {firstName: parts[0], lastName: parts.slice(1).join(' ')}
}

export function buildFifaPlayerCardView(
  player: Pick<
    PlayerListItem,
    | 'userId'
    | 'displayName'
    | 'fullName'
    | 'position'
    | 'skillLevel'
    | 'karmaScore'
    | 'avatarUrl'
    | 'goalieReliabilityScore'
    | 'participationHistory'
  >,
): FifaPlayerCardView {
  const seed = hashSeed(player.userId)
  const nameSource = player.fullName || player.displayName
  const {firstName, lastName} = splitDisplayName(nameSource)
  const jerseyNumber = String(player.userId.replace(/\D/g, '').slice(-2) || '00').padStart(2, '0')
  const age = 22 + (seed % 15)
  const gamesPlayed = Math.max(player.participationHistory?.length ?? 0, 8 + (seed % 40))
  const overall = Math.min(99, Math.max(55, Math.round(player.karmaScore * 0.9 + (seed % 8))))
  const isGoalie = player.position === 'goalie'
  const goals = isGoalie ? 0 : 2 + (seed % 28)
  const assists = isGoalie ? 0 : 3 + (seed % 32)
  const plusMinus = isGoalie ? 0 : (seed % 21) - 10
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1) || 'H'}`
  const avatarUrl =
    player.avatarUrl ||
    `https://placehold.co/400x560/1a2f4a/ffffff?text=${encodeURIComponent(initials.toUpperCase())}`

  return {
    userId: player.userId,
    firstName,
    lastName,
    fullName: nameSource,
    jerseyNumber,
    age,
    position: player.position,
    positionLabel: POSITION_LABELS[player.position] ?? 'UTL',
    overall,
    avatarUrl,
    skillLabel: SKILL_LABELS[player.skillLevel] ?? player.skillLevel,
    gamesPlayed,
    goals,
    assists,
    plusMinus,
    savePct: isGoalie ? Number((0.88 + (seed % 10) / 100).toFixed(3)) : undefined,
    goalsAgainstAvg: isGoalie ? Number((1.8 + (seed % 20) / 10).toFixed(2)) : undefined,
    karmaScore: player.karmaScore,
  }
}

export function buildFallbackFifaCard(
  userId: string,
  displayName: string,
  position: PlayerPosition = 'forward',
): FifaPlayerCardView {
  return buildFifaPlayerCardView({
    userId,
    displayName,
    fullName: displayName,
    position,
    skillLevel: 'amateur',
    karmaScore: 70,
  })
}
