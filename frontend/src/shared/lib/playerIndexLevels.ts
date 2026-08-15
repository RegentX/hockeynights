import type {SkillLevel} from '@/shared/types/common'

/** Шкала игрового индекса и связанного уровня (3–9). */
export const PLAYER_INDEX_LEVELS = [
  {index: 3, skillLevel: 'beginner', label: 'Дебютант'},
  {index: 4, skillLevel: 'amateur', label: 'Любитель'},
  {index: 5, skillLevel: 'novice_theorist', label: 'Начинающий теоретик'},
  {index: 6, skillLevel: 'theorist', label: 'Теоретик'},
  {index: 7, skillLevel: 'confident_theorist', label: 'Уверенный теоретик'},
  {index: 8, skillLevel: 'practitioner', label: 'Практик'},
  {index: 9, skillLevel: 'master', label: 'Мастер'},
] as const

export type PlayerIndexSkillLevel = (typeof PLAYER_INDEX_LEVELS)[number]['skillLevel']
export type PlayerIndex = (typeof PLAYER_INDEX_LEVELS)[number]['index']

const INDEX_TO_LEVEL = new Map(PLAYER_INDEX_LEVELS.map((item) => [item.index, item] as const))
const SKILL_TO_INDEX = new Map(PLAYER_INDEX_LEVELS.map((item) => [item.skillLevel, item] as const))

/** Legacy skill → ближайший индекс игрока. */
const LEGACY_SKILL_TO_INDEX: Partial<Record<SkillLevel, PlayerIndex>> = {
  advanced: 7,
  league: 9,
  unknown: 4,
}

export function getPlayerIndexLevel(index: number) {
  return INDEX_TO_LEVEL.get(clampPlayerIndex(index))
}

export function skillLevelFromPlayerIndex(index: number): PlayerIndexSkillLevel {
  return getPlayerIndexLevel(index)?.skillLevel ?? 'amateur'
}

export function playerIndexFromSkillLevel(skillLevel: SkillLevel): PlayerIndex {
  const direct = SKILL_TO_INDEX.get(skillLevel as PlayerIndexSkillLevel)
  if (direct) return direct.index
  return LEGACY_SKILL_TO_INDEX[skillLevel] ?? 4
}

/** Подпись уровня: индекс важнее, иначе skillLevel. */
export function getPlayerLevelLabel(player: {
  playerIndex?: number
  skillLevel?: SkillLevel
}): string {
  if (player.playerIndex != null) {
    return getPlayerIndexLevel(player.playerIndex)?.label ?? String(player.playerIndex)
  }
  if (player.skillLevel && player.skillLevel !== 'unknown') {
    return getPlayerIndexLevel(playerIndexFromSkillLevel(player.skillLevel))?.label ?? '—'
  }
  return '—'
}

/** Игровой индекс: целое число от 3 до 9. */
export function clampPlayerIndex(value: number): PlayerIndex {
  return Math.min(9, Math.max(3, Math.round(value))) as PlayerIndex
}
