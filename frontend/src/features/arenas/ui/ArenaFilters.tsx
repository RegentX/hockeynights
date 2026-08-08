/**
 * SPEC-FR-6.1.2
 * HOCFRONT-32 — каталожный поиск/chips как на /events
 */

import {Magnifier} from '@gravity-ui/icons'
import {Icon, Select, Text, TextInput} from '@gravity-ui/uikit'
import {useState} from 'react'

import type {ArenaFilters as ArenaFiltersType} from '@/entities/arena'
import {
  ARENA_CATALOG_CHIPS,
  countActiveArenaFilters,
  isArenaCatalogChipActive,
  toggleArenaCatalogChip,
} from '@/features/arenas/lib/arenaCatalogFilters'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export type ArenaCatalogView = 'list' | 'map'

/** @spec SPEC-FR-6.1.2 - Props фильтров арен */
export interface ArenaFiltersProps {
  /** @spec SPEC-FR-6.1.2 */
  filters: ArenaFiltersType
  /** @spec SPEC-FR-6.1.2 */
  onChange: (filters: ArenaFiltersType) => void
  /** @spec SPEC-FR-6.1.2 - Сбросить фильтры */
  onReset?: () => void
  /** Режим списка / поиска на карте */
  view?: ArenaCatalogView
  onViewChange?: (view: ArenaCatalogView) => void
}

const AMENITY_OPTIONS = [
  {value: '', content: 'Все удобства'},
  {value: 'parking', content: 'Парковка'},
  {value: 'shower', content: 'Душ'},
  {value: 'skate_sharpening', content: 'Заточка'},
  {value: 'rental', content: 'Прокат'},
  {value: 'cafe', content: 'Кафе'},
]

/**
 * @spec SPEC-FR-6.1.2 - Поиск, chips и расширенные фильтры арен
 */
export function ArenaFilters({
  filters,
  onChange,
  onReset,
  view = 'list',
  onViewChange,
}: ArenaFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const activeCount = countActiveArenaFilters(filters)

  const patch = (partial: Partial<ArenaFiltersType>) => onChange({...filters, ...partial})

  return (
    <div
      className="arenas-catalog__filters hockey-stack hockey-stack--gap-12"
      data-testid={testId('arenas', 'filters', 'filter')}
    >
      {onViewChange && (
        <div
          className="arenas-catalog__toolbar"
          data-testid={testId('arenas', 'filters', 'panel', 'toolbar')}
        >
          <div
            className="hockey-calendar-shell__view-toggle"
            role="group"
            aria-label="Режим просмотра"
            data-testid={testId('arenas', 'filters', 'panel', 'view')}
          >
            <button
              type="button"
              className={`hockey-calendar-shell__view-btn${view === 'list' ? ' is-active' : ''}`}
              onClick={() => onViewChange('list')}
              data-testid={testId('arenas', 'filters', 'btn', 'view-list')}
            >
              Список
            </button>
            <button
              type="button"
              className={`hockey-calendar-shell__view-btn${view === 'map' ? ' is-active' : ''}`}
              onClick={() => onViewChange('map')}
              data-testid={testId('arenas', 'filters', 'btn', 'view-map')}
            >
              Карта
            </button>
          </div>
          {view !== 'map' && (
            <HockeyButton
              view="outlined"
              size="s"
              onClick={() => onViewChange('map')}
              data-testid={testId('arenas', 'filters', 'btn', 'to-map')}
            >
              Поиск на карте
            </HockeyButton>
          )}
        </div>
      )}

      <div
        className="arenas-catalog__search-block"
        data-testid={testId('arenas', 'filters', 'panel', 'search-block')}
      >
        <div
          className="arenas-catalog__search"
          data-testid={testId('arenas', 'filters', 'card', 'search')}
        >
          <TextInput
            size="m"
            placeholder="Название, метро, район, город…"
            value={filters.query ?? ''}
            onUpdate={(value) => patch({query: value.trim() ? value : undefined})}
            hasClear
            startContent={
              <span className="arenas-catalog__search-icon" aria-hidden>
                <Icon data={Magnifier} size={16} />
              </span>
            }
            data-testid={testId('arenas', 'filters', 'field', 'search')}
          />
        </div>

        <div
          className="events-catalog__chips"
          data-testid={testId('arenas', 'filters', 'panel', 'chips')}
        >
          <div className="events-catalog__chips-head">
            <Text
              color="secondary"
              className="events-catalog__chips-label"
              data-testid={testId('arenas', 'filters', 'text', 'chips-title')}
            >
              Быстрый фильтр
            </Text>
            {activeCount > 0 && onReset && (
              <div className="hockey-row hockey-row--gap-8 hockey-row--align-center">
                <Text
                  color="secondary"
                  data-testid={testId('arenas', 'filters', 'text', 'active-count')}
                >
                  Фильтров: {activeCount}
                </Text>
                <HockeyButton
                  view="flat"
                  size="s"
                  onClick={onReset}
                  data-testid={testId('arenas', 'filters', 'btn', 'reset')}
                >
                  Сбросить
                </HockeyButton>
              </div>
            )}
          </div>
          <div
            className="events-catalog__chips-row"
            data-testid={testId('arenas', 'filters', 'row', 'chips')}
          >
            {ARENA_CATALOG_CHIPS.map((chip) => {
              const active = isArenaCatalogChipActive(chip.id, filters)
              return (
                <button
                  key={chip.id}
                  type="button"
                  className={`events-catalog__chip${active ? ' is-active' : ''}`}
                  onClick={() => onChange(toggleArenaCatalogChip(chip.id, filters))}
                  data-testid={testId('arenas', 'filters', 'btn', 'chip', chip.id)}
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
        data-testid={testId('arenas', 'filters', 'panel', 'advanced')}
      >
        <div className="hockey-row hockey-row--between hockey-row--align-center">
          <Text
            variant="subheader-2"
            data-testid={testId('arenas', 'filters', 'text', 'advanced-title')}
          >
            Фильтры
          </Text>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            data-testid={testId('arenas', 'filters', 'btn', 'advanced-toggle')}
          >
            {advancedOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
          </HockeyButton>
        </div>
        {advancedOpen && (
          <div
            className="hockey-grid hockey-grid--cards-280"
            data-testid={testId('arenas', 'filters', 'grid', 'advanced')}
          >
            <TextInput
              label="Район"
              value={filters.district ?? ''}
              onUpdate={(value) => patch({district: value.trim() ? value : undefined})}
              data-testid={testId('arenas', 'filters', 'field', 'district')}
            />
            <TextInput
              label="Метро"
              value={filters.metro ?? ''}
              onUpdate={(value) => patch({metro: value.trim() ? value : undefined})}
              data-testid={testId('arenas', 'filters', 'field', 'metro')}
            />
            <Select
              label="Удобство"
              value={[filters.amenity ?? '']}
              onUpdate={(value) => patch({amenity: value[0] || undefined})}
              options={AMENITY_OPTIONS}
              data-testid={testId('arenas', 'filters', 'select', 'amenity')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
