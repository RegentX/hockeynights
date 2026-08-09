/**
 * HOCFRONT-34A — поиск, chips и расширенные фильтры лиг (как /arenas)
 */

import {Magnifier} from '@gravity-ui/icons'
import {Icon, Select, Text, TextInput} from '@gravity-ui/uikit'
import {useState} from 'react'

import type {SkillLevel} from '@/entities/common'
import type {LeagueFilters as LeagueFiltersType} from '@/entities/league'
import {
  countActiveLeagueFilters,
  isLeagueCatalogChipActive,
  LEAGUE_CATALOG_CHIPS,
  toggleLeagueCatalogChip,
} from '@/features/leagues/lib/leagueCatalogFilters'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface LeagueFiltersProps {
  filters: LeagueFiltersType
  onChange: (filters: LeagueFiltersType) => void
  onReset?: () => void
}

const LEVEL_OPTIONS: Array<{value: '' | SkillLevel; content: string}> = [
  {value: '', content: 'Любой уровень'},
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
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

/**
 * HOCFRONT-34A - Поиск, chips и расширенные фильтры каталога лиг
 */
export function LeagueFilters({filters, onChange, onReset}: LeagueFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const activeCount = countActiveLeagueFilters(filters)

  const patch = (partial: Partial<LeagueFiltersType>) => onChange({...filters, ...partial})

  return (
    <div
      className="leagues-catalog__filters hockey-stack hockey-stack--gap-12"
      data-testid={testId('leagues', 'filters', 'filter')}
    >
      <div
        className="arenas-catalog__search-block"
        data-testid={testId('leagues', 'filters', 'panel', 'search-block')}
      >
        <div
          className="arenas-catalog__search"
          data-testid={testId('leagues', 'filters', 'card', 'search')}
        >
          <TextInput
            size="m"
            placeholder="Название лиги…"
            value={filters.query ?? ''}
            onUpdate={(value) => patch({query: value.trim() ? value : undefined})}
            hasClear
            startContent={
              <span className="arenas-catalog__search-icon" aria-hidden>
                <Icon data={Magnifier} size={16} />
              </span>
            }
            data-testid={testId('leagues', 'filters', 'field', 'search')}
          />
        </div>

        <div
          className="events-catalog__chips"
          data-testid={testId('leagues', 'filters', 'panel', 'chips')}
        >
          <div className="events-catalog__chips-head">
            <Text
              color="secondary"
              className="events-catalog__chips-label"
              data-testid={testId('leagues', 'filters', 'text', 'chips-title')}
            >
              Быстрый фильтр
            </Text>
            {activeCount > 0 && onReset && (
              <div className="hockey-row hockey-row--gap-8 hockey-row--align-center">
                <Text
                  color="secondary"
                  data-testid={testId('leagues', 'filters', 'text', 'active-count')}
                >
                  Фильтров: {activeCount}
                </Text>
                <HockeyButton
                  view="flat"
                  size="s"
                  onClick={onReset}
                  data-testid={testId('leagues', 'filters', 'btn', 'reset')}
                >
                  Сбросить
                </HockeyButton>
              </div>
            )}
          </div>
          <div
            className="events-catalog__chips-row"
            data-testid={testId('leagues', 'filters', 'row', 'chips')}
          >
            {LEAGUE_CATALOG_CHIPS.map((chip) => {
              const active = isLeagueCatalogChipActive(chip.id, filters)
              return (
                <button
                  key={chip.id}
                  type="button"
                  className={`events-catalog__chip${active ? ' is-active' : ''}`}
                  onClick={() => onChange(toggleLeagueCatalogChip(chip.id, filters))}
                  data-testid={testId('leagues', 'filters', 'btn', 'chip', chip.id)}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div
        className="hockey-stack hockey-stack--gap-10"
        data-testid={testId('leagues', 'filters', 'panel', 'advanced')}
      >
        <div className="hockey-row hockey-row--between hockey-row--align-center">
          <Text
            variant="subheader-2"
            data-testid={testId('leagues', 'filters', 'text', 'advanced-title')}
          >
            Фильтры
          </Text>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            data-testid={testId('leagues', 'filters', 'btn', 'advanced-toggle')}
          >
            {advancedOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
          </HockeyButton>
        </div>
        {advancedOpen && (
          <div
            className="hockey-grid hockey-grid--cards-280"
            data-testid={testId('leagues', 'filters', 'grid', 'advanced')}
          >
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
                  recruitingStatus:
                    (value[0] as LeagueFiltersType['recruitingStatus']) || undefined,
                })
              }
              options={RECRUITING_OPTIONS}
              data-testid={testId('leagues', 'filters', 'select', 'recruiting')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
