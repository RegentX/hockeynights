/**
 * HOCFRONT-34A — краткие фильтры каталога лиг (поиск, регион, уровень, набор)
 */

import {Magnifier} from '@gravity-ui/icons'
import {Icon, Select, TextInput} from '@gravity-ui/uikit'

import type {SkillLevel} from '@/entities/common'
import type {LeagueFilters as LeagueFiltersType} from '@/entities/league'
import {LEAGUE_REGION_LABELS} from '@/entities/league'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface LeagueFiltersProps {
  filters: LeagueFiltersType
  onChange: (filters: LeagueFiltersType) => void
  onReset?: () => void
}

const REGION_OPTIONS = [
  {value: '', content: 'Москва и Россия'},
  {value: 'moscow', content: LEAGUE_REGION_LABELS.moscow},
  {value: 'russia', content: LEAGUE_REGION_LABELS.russia},
]

const LEVEL_OPTIONS: Array<{value: '' | SkillLevel; content: string}> = [
  {value: '', content: 'Любой уровень'},
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
]

const RECRUITING_OPTIONS: Array<{
  value: '' | NonNullable<LeagueFiltersType['recruitingStatus']>
  content: string
}> = [
  {value: '', content: 'Любой статус набора'},
  {value: 'open', content: 'Набор открыт'},
  {value: 'waitlist', content: 'Лист ожидания'},
  {value: 'closed', content: 'Набор закрыт'},
]

function hasActiveFilters(filters: LeagueFiltersType): boolean {
  return Object.values(filters).some((v) => v !== undefined && v !== '')
}

/**
 * HOCFRONT-34A - Поиск по названию + регион/уровень/набор одной строкой
 */
export function LeagueFilters({filters, onChange, onReset}: LeagueFiltersProps) {
  const isFiltered = hasActiveFilters(filters)
  const patch = (partial: Partial<LeagueFiltersType>) => onChange({...filters, ...partial})

  return (
    <div
      className="league-filters hockey-stack hockey-stack--gap-12"
      data-testid={testId('leagues', 'filters', 'filter')}
    >
      <TextInput
        size="m"
        placeholder="Название лиги…"
        value={filters.query ?? ''}
        onUpdate={(value) => patch({query: value.trim() ? value : undefined})}
        hasClear
        startContent={
          <span className="league-filters__search-icon" aria-hidden>
            <Icon data={Magnifier} size={16} />
          </span>
        }
        data-testid={testId('leagues', 'filters', 'field', 'search')}
      />

      <div
        className="hockey-grid hockey-grid--cards-280"
        data-testid={testId('leagues', 'filters', 'grid')}
      >
        <Select
          label="Регион"
          value={[filters.region ?? '']}
          onUpdate={(value) =>
            patch({region: (value[0] as LeagueFiltersType['region']) || undefined})
          }
          options={REGION_OPTIONS}
          data-testid={testId('leagues', 'filters', 'select', 'region')}
        />
        <Select
          label="Уровень"
          value={[filters.level ?? '']}
          onUpdate={(value) => patch({level: (value[0] as SkillLevel) || undefined})}
          options={LEVEL_OPTIONS}
          data-testid={testId('leagues', 'filters', 'select', 'level')}
        />
        <Select
          label="Набор команд"
          value={[filters.recruitingStatus ?? '']}
          onUpdate={(value) =>
            patch({
              recruitingStatus: (value[0] as LeagueFiltersType['recruitingStatus']) || undefined,
            })
          }
          options={RECRUITING_OPTIONS}
          data-testid={testId('leagues', 'filters', 'select', 'recruiting')}
        />
      </div>

      {isFiltered && onReset && (
        <div data-testid={testId('leagues', 'filters', 'panel', 'actions')}>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={onReset}
            data-testid={testId('leagues', 'filters', 'btn', 'reset')}
          >
            Сбросить фильтры
          </HockeyButton>
        </div>
      )}
    </div>
  )
}
