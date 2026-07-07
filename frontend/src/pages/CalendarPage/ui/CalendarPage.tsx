/**
 * SPEC-FR-4.2.1, SPEC-FR-4.2.2
 * SPEC-UI-2.6, SPEC-UI-3.1
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import type {CalendarFilters as CalendarFiltersType} from '@/entities/event'
import {fetchCalendar} from '@/entities/event'
import {CalendarFilters} from '@/features/calendar'
import {EventCard} from '@/features/events'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const MONTH_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

/**
 * @spec SPEC-UI-2.6 - Календарь как расписание табло
 * @spec SPEC-FR-4.2.1 - Календарь пользователя
 */
export function CalendarPage() {
  const [filters, setFilters] = useState<CalendarFiltersType>({})

  const {data: events = [], isLoading} = useQuery({
    queryKey: ['calendar', filters],
    queryFn: () => fetchCalendar(filters),
  })

  const byDay = useMemo(() => {
    const map = new Map<string, typeof events>()
    for (const event of events) {
      const key = new Date(event.startsAt).toDateString()
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    }
    return [...map.entries()].sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
  }, [events])

  return (
    <div className="hockey-stack hockey-stack--gap-16" data-testid={testId('calendar', 'page')}>
      <Text variant="header-1" data-testid={testId('calendar', 'page', 'text', 'title')}>
        Календарь
      </Text>
      <CalendarFilters filters={filters} onChange={setFilters} />

      {isLoading && (
        <div data-testid={testId('calendar', 'page', 'loader')}>
          <ScoreboardLoader label="Загрузка календаря" />
        </div>
      )}

      {!isLoading && events.length > 0 && (
        <div className="scoreboard-calendar" data-testid={testId('calendar', 'page', 'calendar')}>
          {byDay.map(([dayKey, dayEvents]) => {
            const date = new Date(dayKey)
            const daySlug = testId(dayKey)
            return (
              <div
                key={dayKey}
                className="scoreboard-calendar__day"
                data-testid={testId('calendar', 'page', 'panel', 'day', daySlug)}
              >
                <div
                  className="scoreboard-calendar__date"
                  data-testid={testId('calendar', 'page', 'panel', 'date', daySlug)}
                >
                  <div
                    className="scoreboard-calendar__date-day"
                    data-testid={testId('calendar', 'page', 'text', 'day', daySlug)}
                  >
                    {date.getDate()}
                  </div>
                  <div
                    className="scoreboard-calendar__date-month"
                    data-testid={testId('calendar', 'page', 'text', 'month', daySlug)}
                  >
                    {MONTH_SHORT[date.getMonth()]}
                  </div>
                </div>
                <div
                  className="scoreboard-calendar__events"
                  data-testid={testId('calendar', 'page', 'list', 'events', daySlug)}
                >
                  {dayEvents.map((event) => (
                    <EventCard key={event.id} event={event} compact />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div data-testid={testId('calendar', 'page', 'empty')}>
          <EmptyNetState title="Пустая сетка" copy="События не найдены по выбранным фильтрам." />
        </div>
      )}
    </div>
  )
}
