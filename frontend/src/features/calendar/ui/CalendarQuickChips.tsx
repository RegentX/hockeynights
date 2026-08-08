/**
 * HOCFRONT-28CAL-C — быстрые chips календаря
 */

import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

import {type CalendarUiState, countActiveCalendarFilters, localDateKey} from '../lib/calendarState'

const CHIPS: {id: 'today' | 'week' | 'mine' | 'needs-goalie'; label: string}[] = [
  {id: 'today', label: 'Сегодня'},
  {id: 'week', label: 'Неделя'},
  {id: 'mine', label: 'Мои записи'},
  {id: 'needs-goalie', label: 'Ищут вратаря'},
]

export interface CalendarQuickChipsProps {
  state: CalendarUiState
  onChange: (next: CalendarUiState) => void
  onReset: () => void
}

export function CalendarQuickChips({state, onChange, onReset}: CalendarQuickChipsProps) {
  const activeCount = countActiveCalendarFilters(state)

  function toggle(chipId: (typeof CHIPS)[number]['id']) {
    if (chipId === 'today') {
      const active = state.range === 'today'
      onChange({
        ...state,
        range: active ? null : 'today',
        date: active ? state.date : localDateKey(),
      })
      return
    }
    if (chipId === 'week') {
      onChange({...state, range: state.range === 'week' ? null : 'week'})
      return
    }
    if (chipId === 'mine') {
      onChange({...state, mineOnly: !state.mineOnly})
      return
    }
    onChange({...state, needsGoalie: !state.needsGoalie})
  }

  function isActive(chipId: (typeof CHIPS)[number]['id']): boolean {
    if (chipId === 'today') return state.range === 'today'
    if (chipId === 'week') return state.range === 'week'
    if (chipId === 'mine') return state.mineOnly
    return state.needsGoalie
  }

  return (
    <div className="hockey-calendar-chips" data-testid={testId('calendar', 'chips', 'panel')}>
      <div className="hockey-calendar-chips__row" data-testid={testId('calendar', 'chips', 'row')}>
        {CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`hockey-calendar-chips__chip${isActive(chip.id) ? ' is-active' : ''}`}
            onClick={() => toggle(chip.id)}
            data-testid={testId('calendar', 'chips', 'btn', chip.id)}
          >
            {chip.label}
          </button>
        ))}
        {activeCount > 0 && (
          <>
            <span
              className="hockey-calendar-chips__count"
              data-testid={testId('calendar', 'chips', 'text', 'active')}
            >
              Фильтров: {activeCount}
            </span>
            <HockeyButton
              view="flat"
              size="s"
              onClick={onReset}
              data-testid={testId('calendar', 'chips', 'btn', 'reset')}
            >
              Сбросить
            </HockeyButton>
          </>
        )}
      </div>
    </div>
  )
}
