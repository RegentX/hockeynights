import {ARENAS_LABEL, EVENTS_LABEL} from '@/shared/config/navigationLabels'

export type FavoriteTier = 'primary' | 'secondary'

export interface FavoriteActionPreset {
  id: string
  label: string
  description: string
  route: string
  icon: string
  tier: FavoriteTier
}

/**
 * HOCFRONT-15 / TASK-01-05 — эти id не должны попадать в SideBoard «Избранное».
 * Маршруты /sos /iq /highlights остаются доступны по прямому URL.
 */
export const MVP_HIDDEN_FAVORITE_IDS = ['sos', 'iq', 'highlights'] as const

export const DEFAULT_FAVORITE_IDS = ['events', 'teams', 'arenas'] as const

export const FAVORITE_ACTIONS_PRESET: FavoriteActionPreset[] = [
  {
    id: 'events',
    label: EVENTS_LABEL,
    description: 'Ближайшие игры и тренировки',
    route: '/events',
    icon: '🏒',
    tier: 'primary',
  },
  {
    id: 'teams',
    label: 'Команда',
    description: 'Состав',
    route: '/teams',
    icon: '🛡',
    tier: 'primary',
  },
  {
    id: 'arenas',
    label: ARENAS_LABEL,
    description: 'Найти лёд',
    route: '/arenas',
    icon: '🧊',
    tier: 'primary',
  },
  {
    id: 'leagues',
    label: 'Лиги',
    description: 'Турниры и таблицы',
    route: '/leagues',
    icon: '🏆',
    tier: 'secondary',
  },
  {
    id: 'players',
    label: 'Игроки',
    description: 'Найти игрока',
    route: '/players',
    icon: '👤',
    tier: 'secondary',
  },
  {
    id: 'calendar',
    label: 'Календарь',
    description: 'Расписание',
    route: '/calendar',
    icon: '📅',
    tier: 'secondary',
  },
  {
    id: 'shop',
    label: 'Магазин',
    description: 'Экипировка',
    route: '/shop',
    icon: '🛒',
    tier: 'secondary',
  },
]

export function isMvpHiddenFavoriteId(id: string): boolean {
  return (MVP_HIDDEN_FAVORITE_IDS as readonly string[]).includes(id)
}

/** Убрать SOS / IQ / Highlight из сохранённого набора избранного */
export function sanitizeFavoriteIds(ids: string[]): string[] {
  return ids.filter((id) => !isMvpHiddenFavoriteId(id))
}
