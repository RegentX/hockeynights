/**
 * SPEC-FR-2.3.2
 * HOCFRONT-20
 */

import {ChevronDown, ChevronUp} from '@gravity-ui/icons'
import {Button, Checkbox, Icon, Select, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'

import type {PlayerPosition, SkillLevel} from '@/entities/common'
import type {PlayersFilterParams} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const MOBILE_BREAKPOINT = '(max-width: 768px)'

const POSITION_OPTIONS = [
  {value: '', content: 'Все амплуа'},
  {value: 'forward', content: 'Нападающий'},
  {value: 'defense', content: 'Защитник'},
  {value: 'goalie', content: 'Вратарь'},
]

const SKILL_OPTIONS = [
  {value: '', content: 'Все уровни'},
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
  {value: 'unknown', content: 'Не указан'},
]

/** @spec HOCFRONT-20 - Props фильтров игроков */
export interface PlayerFiltersProps {
  /** @spec HOCFRONT-20 */
  filters: PlayersFilterParams
  /** @spec HOCFRONT-20 */
  onChange: (filters: PlayersFilterParams) => void
  /** @spec HOCFRONT-20 - Сбросить фильтры */
  onReset?: () => void
  /** @spec HOCFRONT-20 - Есть ли активные значения */
  isFiltered?: boolean
}

/**
 * @spec SPEC-FR-2.3.2 - Фильтры по амплуа, уровню, району и роли вратаря
 * @spec HOCFRONT-20 - Панель фильтров списка игроков: имя, амплуа, уровень, верификация, команда, город
 * @spec HOCFRONT-20 - На mobile: сворачиваемые фильтры
 */
export function PlayerFilters({filters, onChange, onReset, isFiltered}: PlayerFiltersProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(MOBILE_BREAKPOINT)
    const update = () => {
      const mobile = mq.matches
      setIsMobile(mobile)
      setIsExpanded((prev) => (mobile ? false : prev))
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: fetchTeams})

  const teamOptions = useMemo(
    () => [
      {value: '', content: 'Все команды'},
      ...teams.map((t) => ({value: t.id, content: t.name})),
    ],
    [teams],
  )

  const cityOptions = useMemo(() => {
    const uniqueCities = Array.from(new Set(['Москва', 'Санкт-Петербург']))
    return [
      {value: '', content: 'Все города'},
      ...uniqueCities.map((c) => ({value: c, content: c})),
    ]
  }, [])

  const showCollapsibleBody = !isMobile || isExpanded

  return (
    <div
      className={`player-filters${isFiltered ? ' player-filters--active' : ''}`}
      data-testid={testId('players', 'player-filters', 'panel')}
    >
      {isMobile && (
        <div
          className="player-filters__head"
          data-testid={testId('players', 'player-filters', 'head')}
        >
          <span
            className="player-filters__title"
            data-testid={testId('players', 'player-filters', 'text', 'title')}
          >
            Фильтры
          </span>
          <Button
            size="s"
            view="outlined"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            data-testid={testId('players', 'player-filters', 'btn', 'toggle')}
          >
            <Icon data={isExpanded ? ChevronUp : ChevronDown} />
            {isExpanded ? 'Скрыть' : 'Показать'}
          </Button>
        </div>
      )}

      {showCollapsibleBody && (
        <div
          className="player-filters__body"
          data-testid={testId('players', 'player-filters', 'form')}
        >
          <TextInput
            label="Имя"
            placeholder="Поиск по имени"
            value={filters.q ?? ''}
            onUpdate={(v) => onChange({...filters, q: v || undefined})}
            data-testid={testId('players', 'player-filters', 'field', 'name')}
          />
          <Select
            label="Амплуа"
            value={[filters.position ?? '']}
            onUpdate={(v) =>
              onChange({...filters, position: (v[0] || undefined) as PlayerPosition | undefined})
            }
            options={POSITION_OPTIONS}
            data-testid={testId('players', 'player-filters', 'select', 'position')}
          />
          <Select
            label="Уровень"
            value={[filters.skillLevel ?? '']}
            onUpdate={(v) =>
              onChange({...filters, skillLevel: (v[0] || undefined) as SkillLevel | undefined})
            }
            options={SKILL_OPTIONS}
            data-testid={testId('players', 'player-filters', 'select', 'skill-level')}
          />
          <TextInput
            label="Район"
            value={filters.district ?? ''}
            onUpdate={(v) => onChange({...filters, district: v || undefined})}
            data-testid={testId('players', 'player-filters', 'field', 'district')}
          />
          <Select
            label="Команда"
            value={[filters.teamId ?? '']}
            onUpdate={(v) => onChange({...filters, teamId: v[0] || undefined})}
            options={teamOptions}
            data-testid={testId('players', 'player-filters', 'select', 'team')}
          />
          <Select
            label="Город"
            value={[filters.city ?? '']}
            onUpdate={(v) => onChange({...filters, city: v[0] || undefined})}
            options={cityOptions}
            data-testid={testId('players', 'player-filters', 'select', 'city')}
          />
          <Checkbox
            checked={Boolean(filters.verified)}
            onUpdate={(checked) => onChange({...filters, verified: checked})}
            content="Только подтверждённые"
            data-testid={testId('players', 'player-filters', 'checkbox', 'verified')}
          />
          <Checkbox
            checked={Boolean(filters.goalieOnly)}
            onUpdate={(checked) => onChange({...filters, goalieOnly: checked})}
            content="Только вратари"
            data-testid={testId('players', 'player-filters', 'checkbox', 'goalie-only')}
          />
        </div>
      )}

      {isFiltered && onReset && (
        <div
          className="player-filters__actions"
          data-testid={testId('players', 'player-filters', 'actions')}
        >
          <HockeyButton
            view="outlined"
            size="s"
            onClick={onReset}
            data-testid={testId('players', 'player-filters', 'btn', 'reset')}
          >
            Сбросить фильтры
          </HockeyButton>
        </div>
      )}
    </div>
  )
}
