/**
 * HOCFRONT-5 — карточки демо-ролей для mock-входа.
 */

import type {OnboardingPayload} from '@/entities/user/types'
import {DEMO_PARTNER_MEMBERSHIPS} from '@/features/partners/constants'

export interface PersonaPreset {
  id: string
  title: string
  description: string
  destination: string
  icon: string
  payload: OnboardingPayload
}

const [leaguePartner, shopPartner] = DEMO_PARTNER_MEMBERSHIPS

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'player',
    title: 'Игрок',
    description: 'Профиль, команды, события и RSVP',
    destination: 'Обычный player workspace',
    icon: '🏒',
    payload: {displayName: 'Иван Петров', roles: ['player'], partnerMemberships: []},
  },
  {
    id: 'goalie',
    title: 'Вратарь',
    description: 'Игровой профиль с акцентом на вратарские сценарии',
    destination: 'Обычный player workspace',
    icon: '🥅',
    payload: {displayName: 'Алексей Вратарёв', roles: ['goalie'], partnerMemberships: []},
  },
  {
    id: 'captain',
    title: 'Капитан',
    description: 'Состав команды, посещаемость и лиговые игры',
    destination: 'Обычный player workspace',
    icon: '🛡',
    payload: {displayName: 'Сергей Капитанов', roles: ['captain'], partnerMemberships: []},
  },
  {
    id: 'coach',
    title: 'Тренер',
    description: 'Тренировки, roster и тренерский профиль',
    destination: 'Обычный player workspace',
    icon: '📋',
    payload: {displayName: 'Алексей Тренеров', roles: ['coach'], partnerMemberships: []},
  },
  {
    id: 'organizer',
    title: 'Организатор',
    description: 'События, календарь и организация игр',
    destination: 'Обычный player workspace',
    icon: '📅',
    payload: {displayName: 'Мария Организаторова', roles: ['organizer'], partnerMemberships: []},
  },
  {
    id: 'league-partner',
    title: 'Представитель лиги',
    description: 'Расписание, заявки и кабинет лиги',
    destination: 'Кабинет лиги',
    icon: '🏆',
    payload: {
      displayName: 'Партнёр лиги',
      roles: ['organizer'],
      partnerMemberships: [leaguePartner],
    },
  },
  {
    id: 'shop-partner',
    title: 'Представитель магазина',
    description: 'Каталог, промо и кабинет магазина',
    destination: 'Кабинет магазина',
    icon: '🛍',
    payload: {
      displayName: 'Партнёр магазина',
      roles: ['organizer'],
      partnerMemberships: [shopPartner],
    },
  },
  {
    id: 'admin',
    title: 'Администратор',
    description: 'Модерация, источники данных и admin prototype',
    destination: 'Admin prototype',
    icon: '⚙',
    payload: {displayName: 'Админ демо', roles: ['admin'], partnerMemberships: []},
  },
]
