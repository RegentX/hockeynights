export type FavoriteTier = 'primary' | 'secondary'

export interface FavoriteActionPreset {
  id: string
  label: string
  description: string
  route: string
  icon: string
  tier: FavoriteTier
}

export const DEFAULT_FAVORITE_IDS = ['events', 'teams', 'arenas', 'sos'] as const

export const FAVORITE_ACTIONS_PRESET: FavoriteActionPreset[] = [
  {
    id: 'events',
    label: 'Мои события',
    description: 'Ближайшие игры',
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
    label: 'Аренда льда',
    description: 'Найти лёд',
    route: '/arenas',
    icon: '🧊',
    tier: 'primary',
  },
  {
    id: 'sos',
    label: 'SOS',
    description: 'Нужен игрок/вратарь',
    route: '/sos',
    icon: '🚨',
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
    id: 'highlights',
    label: 'Моменты',
    description: 'Видео и фото',
    route: '/highlights',
    icon: '🎬',
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
  {
    id: 'iq',
    label: 'IQ',
    description: 'Тесты и рейтинг',
    route: '/iq',
    icon: '🧠',
    tier: 'secondary',
  },
]
