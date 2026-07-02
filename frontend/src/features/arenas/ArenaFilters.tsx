/**
 * SPEC-FR-6.1.2
 */

import {Checkbox, Select, TextInput} from '@gravity-ui/uikit'

import type {ArenaFilters as ArenaFiltersType} from '@/entities/arena/types'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-6.1.2 - Props фильтров арен */
export interface ArenaFiltersProps {
  /** @spec SPEC-FR-6.1.2 */
  filters: ArenaFiltersType
  /** @spec SPEC-FR-6.1.2 */
  onChange: (filters: ArenaFiltersType) => void
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
 * @spec SPEC-FR-6.1.2 - Фильтры арен по району, метро, удобствам и свободным слотам
 */
export function ArenaFilters({filters, onChange}: ArenaFiltersProps) {
  return (
    <div
      className="hockey-grid hockey-grid--filters"
      data-testid={testId('arenas', 'filters', 'filter')}
    >
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
  )
}
