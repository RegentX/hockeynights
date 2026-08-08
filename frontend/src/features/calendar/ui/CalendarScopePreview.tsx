/**
 * HOCFRONT-28CAL-D/E — превью графика + ссылка в полный календарь
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useState} from 'react'
import {Link} from 'react-router'

import {EVENT_TYPE_LABELS} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

import type {CalendarScope} from '../lib/calendarState'
import {loadCalendarEvents} from '../lib/loadCalendarEvents'

export interface CalendarScopePreviewProps {
  scope: CalendarScope
  scopeId?: string
  title?: string
  limit?: number
  /** Скрыто по приватности */
  hidden?: boolean
  hiddenCopy?: string
  testIdPrefix?: string
}

function buildOpenHref(scope: CalendarScope, scopeId?: string): string {
  const params = new URLSearchParams({view: 'agenda'})
  if (scope !== 'me') {
    params.set('scope', scope)
    if (scopeId) params.set('scopeId', scopeId)
  }
  return `${routes.calendar}?${params.toString()}`
}

export function CalendarScopePreview({
  scope,
  scopeId = '',
  title = 'Мой график',
  limit = 3,
  hidden = false,
  hiddenCopy = 'Календарь скрыт настройками приватности.',
  testIdPrefix = 'calendar',
}: CalendarScopePreviewProps) {
  const {data: events = [], isLoading} = useQuery({
    queryKey: ['calendar-preview', scope, scopeId],
    queryFn: () =>
      loadCalendarEvents({
        view: 'agenda',
        date: '',
        scope,
        scopeId,
        type: '',
        status: '',
        range: null,
        mineOnly: false,
        needsGoalie: false,
        lens: 'player',
      }),
    enabled: !hidden && (scope === 'me' || Boolean(scopeId)),
  })

  const [nowMs] = useState(() => Date.now())
  const upcoming = events
    .filter((event) => new Date(event.endsAt).getTime() >= nowMs)
    .slice(0, limit)

  const openHref = buildOpenHref(scope, scopeId)

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId(testIdPrefix, 'schedule-preview', 'panel')}
    >
      <div className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap">
        <Text
          variant="subheader-2"
          data-testid={testId(testIdPrefix, 'schedule-preview', 'text', 'title')}
        >
          {title}
        </Text>
        {!hidden && (
          <Link
            to={openHref}
            data-testid={testId(testIdPrefix, 'schedule-preview', 'link', 'open')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId(testIdPrefix, 'schedule-preview', 'btn', 'open')}
            >
              Открыть календарь
            </HockeyButton>
          </Link>
        )}
      </div>

      {hidden && (
        <div data-testid={testId(testIdPrefix, 'schedule-preview', 'empty', 'private')}>
          <EmptyNetState title="Календарь недоступен" copy={hiddenCopy} />
        </div>
      )}

      {!hidden && isLoading && (
        <div data-testid={testId(testIdPrefix, 'schedule-preview', 'loader')}>
          <ScoreboardLoader label="Загрузка графика…" />
        </div>
      )}

      {!hidden && !isLoading && upcoming.length === 0 && (
        <div data-testid={testId(testIdPrefix, 'schedule-preview', 'empty')}>
          <EmptyNetState title="Пока пусто" copy="Ближайших игр и тренировок нет." />
        </div>
      )}

      {!hidden && !isLoading && upcoming.length > 0 && (
        <ul
          className="hockey-stack hockey-stack--gap-8"
          data-testid={testId(testIdPrefix, 'schedule-preview', 'list')}
        >
          {upcoming.map((event) => {
            const when = new Date(event.startsAt).toLocaleString('ru-RU', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <li
                key={event.id}
                data-testid={testId(testIdPrefix, 'schedule-preview', 'row', event.id)}
              >
                <Text
                  variant="body-2"
                  data-testid={testId(testIdPrefix, 'schedule-preview', 'text', 'event', event.id)}
                >
                  {when} · {EVENT_TYPE_LABELS[event.type] ?? event.type} · {event.title}
                </Text>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
