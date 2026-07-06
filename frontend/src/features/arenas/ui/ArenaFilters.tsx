/**
 * SPEC-FR-6.1.2
 */

import {Checkbox, Select, TextInput} from '@gravity-ui/uikit'

import type {ArenaFilters as ArenaFiltersType} from '@/entities/arena'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/** @spec SPEC-FR-6.1.2 - Props фильтров арен */
export interface ArenaFiltersProps {
  /** @spec SPEC-FR-6.1.2 */
  filters: ArenaFiltersType
  /** @spec SPEC-FR-6.1.2 */
  onChange: (filters: ArenaFiltersType) => void
  /** @spec SPEC-FR-6.1.2 - Сбросить фильтры */
  onReset?: () => void
  /** @spec SPEC-FR-6.1.2 - Есть ли активные значения */
  isFiltered?: boolean
}

const BOOKING_MODE_OPTIONS = [
  {value: '', content: 'Все способы записи'},
  {value: 'slot_calendar', content: 'Слоты по времени'},
  {value: 'external_portal', content: 'Портал записи'},
]

const AMENITY_OPTIONS = [
  {value: '', content: 'Все удобства'},
  {value: 'parking', content: 'Парковка'},
  {value: 'shower', content: 'Душ'},
  {value: 'skate_sharpening', content: 'Заточка'},
  {value: 'rental', content: 'Прокат'},
]

/**
 * @spec SPEC-FR-6.1.2 - Фильтры арен: поиск, район, метро, удобства, свободные слоты
 * @spec SPEC-UI-2.2 - Поиск по названию/метро/району
 */
export function ArenaFilters({filters, onChange, onReset, isFiltered}: ArenaFiltersProps) {
  return (
    <div className="arena-filters" data-testid={testId('arenas', 'filters', 'filter')}>
      <div className="hockey-grid hockey-grid--filters">
        <TextInput
          className="arena-filters__search"
          label="Поиск"
          placeholder="Название, метро, район"
          value={filters.query ?? ''}
          onUpdate={(v) => onChange({...filters, query: v || undefined})}
          data-testid={testId('arenas', 'filters', 'field', 'search')}
        />
        <TextInput
          label="Район"
          value={filters.district ?? ''}
          onUpdate={(v) => onChange({...filters, district: v || undefined})}
          data-testid={testId('arenas', 'filters', 'field', 'district')}
        />
        <TextInput
          label="Метро"
          value={filters.metro ?? ''}
          onUpdate={(v) => onChange({...filters, metro: v || undefined})}
          data-testid={testId('arenas', 'filters', 'field', 'metro')}
        />
        <Select
          label="Удобство"
          value={[filters.amenity ?? '']}
          onUpdate={(v) => onChange({...filters, amenity: v[0] || undefined})}
          options={AMENITY_OPTIONS}
          data-testid={testId('arenas', 'filters', 'select', 'amenity')}
        />
        <Select
          label="Запись"
          value={[filters.bookingMode ?? '']}
          onUpdate={(v) =>
            onChange({
              ...filters,
              bookingMode: (v[0] as ArenaFiltersType['bookingMode']) || undefined,
            })
          }
          options={BOOKING_MODE_OPTIONS}
          data-testid={testId('arenas', 'filters', 'select', 'booking-mode')}
        />
        <Checkbox
          checked={Boolean(filters.hasFreeSlots)}
          onUpdate={(checked) => onChange({...filters, hasFreeSlots: checked})}
          content="Есть свободные слоты"
          data-testid={testId('arenas', 'filters', 'checkbox', 'free-slots')}
        />
      </div>
      {isFiltered && onReset && (
        <div className="arena-filters__actions">
          <HockeyButton
            view="outlined"
            size="s"
            onClick={onReset}
            data-testid={testId('arenas', 'filters', 'btn', 'reset')}
          >
            Сбросить фильтры
          </HockeyButton>
        </div>
      )}
    </div>
  )
}
