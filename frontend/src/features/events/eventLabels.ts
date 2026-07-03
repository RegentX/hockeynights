import type {GameEvent} from '@/entities/event/types'
import type {PlayerPosition, SkillLevel} from '@/entities/common/types'

export const ACCESS_LABELS: Record<NonNullable<GameEvent['accessScope']>, string> = {
  club_only: 'Тренировка внутри клуба',
  limited: 'Тренировка для ограниченных лиц',
  public: 'Публичная тренировка',
}

export const TRAINING_FORMAT_LABELS: Record<NonNullable<GameEvent['trainingFormat']>, string> = {
  two_way: 'Двухсторонка',
  training: 'Тренировка',
  training_two_way: 'Тренировка + двухсторонка',
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Дебютант',
  amateur: 'Любитель',
  advanced: 'Продвинутый',
  league: 'Лига',
  unknown: 'Не указан',
}

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  goalie: 'Вратарь',
  defense: 'Защита',
  forward: 'Нападение',
  any: 'Универсал',
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  game: 'Игра',
  training: 'Тренировка',
  open_ice: 'Открытый лёд',
}

export const TRAINING_FORMAT_FILTER_OPTIONS = [
  {value: 'all', content: 'Любой формат'},
  {value: 'two_way', content: TRAINING_FORMAT_LABELS.two_way},
  {value: 'training', content: TRAINING_FORMAT_LABELS.training},
  {value: 'training_two_way', content: TRAINING_FORMAT_LABELS.training_two_way},
] as const

export const SKILL_LEVEL_FILTER_OPTIONS = [
  {value: 'all', content: 'Любой уровень'},
  {value: 'beginner', content: SKILL_LEVEL_LABELS.beginner},
  {value: 'amateur', content: SKILL_LEVEL_LABELS.amateur},
  {value: 'advanced', content: SKILL_LEVEL_LABELS.advanced},
  {value: 'league', content: SKILL_LEVEL_LABELS.league},
] as const
