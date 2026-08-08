/**
 * HOCFRONT-28CAL-B/C — agenda выбранного дня + CTA
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {fetchEventRsvp} from '@/entities/event'
import {
  EVENT_TYPE_LABELS,
  eventDetailsPath,
  formatEventPriceRub,
  registrationStatusLabel,
  teamRsvpStatusLabel,
  TrainingRegistrationControl,
} from '@/features/events'
import {TeamRsvpResponseControl} from '@/features/radar'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'

import {eventDateKey, groupEventsByDay} from '../lib/calendarDays'
import {parseDateKey} from '../lib/calendarState'
import {downloadEventIcs} from '../lib/icsExport'
import {eventFillRatio} from '../lib/loadCalendarEvents'

export interface CalendarAgendaProps {
  selectedDate: string
  events: GameEvent[]
  currentUserId: string
  showActions?: boolean
  showOrganizerMeta?: boolean
}

export function CalendarAgenda({
  selectedDate,
  events,
  currentUserId,
  showActions = true,
  showOrganizerMeta = false,
}: CalendarAgendaProps) {
  const byDay = groupEventsByDay(events)
  const dayEvents = byDay.get(selectedDate) ?? []
  const parsed = parseDateKey(selectedDate)
  const dayLabel = parsed
    ? parsed.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : selectedDate

  const upcoming = events.filter((event) => eventDateKey(event.startsAt) > selectedDate).slice(0, 8)

  return (
    <div className="hockey-calendar-agenda" data-testid={testId('calendar', 'agenda', 'panel')}>
      <div className="hockey-calendar-agenda__section">
        <div className="hockey-calendar-agenda__section-head">
          <Text
            variant="subheader-2"
            data-testid={testId('calendar', 'agenda', 'text', 'day-title')}
          >
            {dayLabel}
          </Text>
          <Text color="secondary" data-testid={testId('calendar', 'agenda', 'text', 'day-count')}>
            {dayEvents.length
              ? `${dayEvents.length} ${dayEvents.length === 1 ? 'событие' : 'события'}`
              : 'свободно'}
          </Text>
        </div>

        {dayEvents.length === 0 ? (
          <div data-testid={testId('calendar', 'agenda', 'empty', 'day')}>
            <EmptyNetState
              title="День свободен"
              copy="На эту дату записей нет. Выберите другой день в сетке."
            />
          </div>
        ) : (
          <div
            className="hockey-calendar-agenda__list"
            data-testid={testId('calendar', 'agenda', 'list', 'day')}
          >
            {dayEvents.map((event) => (
              <AgendaEventCard
                key={event.id}
                event={event}
                currentUserId={currentUserId}
                showActions={showActions}
                showOrganizerMeta={showOrganizerMeta}
              />
            ))}
          </div>
        )}
      </div>

      {upcoming.length > 0 && (
        <div
          className="hockey-calendar-agenda__section"
          data-testid={testId('calendar', 'agenda', 'panel', 'upcoming')}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('calendar', 'agenda', 'text', 'upcoming-title')}
          >
            Дальше
          </Text>
          <div
            className="hockey-calendar-agenda__list"
            data-testid={testId('calendar', 'agenda', 'list', 'upcoming')}
          >
            {upcoming.map((event) => (
              <AgendaEventCard
                key={event.id}
                event={event}
                currentUserId={currentUserId}
                showActions={showActions}
                showOrganizerMeta={showOrganizerMeta}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AgendaEventCard({
  event,
  currentUserId,
  showActions,
  showOrganizerMeta,
}: {
  event: GameEvent
  currentUserId: string
  showActions: boolean
  showOrganizerMeta: boolean
}) {
  const start = new Date(event.startsAt)
  const timeStr = start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
  const dateShort = start.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})
  const myAttendance = event.participation.find((entry) => entry.userId === currentUserId)?.status
  const {data: rsvpBoard} = useQuery({
    queryKey: ['event-rsvp', event.id],
    queryFn: () => fetchEventRsvp(event.id),
    enabled: Boolean(event.hasTeamRsvp),
  })
  const myRsvp = rsvpBoard?.players.find((player) => player.userId === currentUserId)
  const statusLabel = event.hasTeamRsvp
    ? rsvpBoard
      ? teamRsvpStatusLabel(myRsvp?.status, myRsvp?.declineReason)
      : 'Загрузка…'
    : registrationStatusLabel(myAttendance, event.registrationStatus)
  const detailsPath = eventDetailsPath(event)
  const fillPercent = Math.round(eventFillRatio(event) * 100)
  const goalieOpen = event.requiredSlots.some(
    (slot) => slot.position === 'goalie' && slot.filledCount < slot.count,
  )
  const typeLabel = EVENT_TYPE_LABELS[event.type] ?? event.type
  const priceLabel = formatEventPriceRub(event.pricePerPlayer)
  const statusTone = event.hasTeamRsvp
    ? myRsvp?.status === 'confirmed'
      ? 'going'
      : myRsvp?.status === 'declined'
        ? 'need'
        : 'wait'
    : myAttendance === 'going'
      ? 'going'
      : myAttendance === 'maybe'
        ? 'wait'
        : goalieOpen
          ? 'need'
          : 'open'

  return (
    <article
      className={`hockey-calendar-event hockey-calendar-event--${event.type}`}
      data-testid={testId('calendar', 'agenda', 'card', event.id)}
    >
      <div
        className="hockey-calendar-event__time"
        data-testid={testId('calendar', 'agenda', 'text', 'time', event.id)}
      >
        <span className="hockey-calendar-event__clock">{timeStr}</span>
        <span className="hockey-calendar-event__date">{dateShort}</span>
      </div>

      <div className="hockey-calendar-event__body">
        <div className="hockey-calendar-event__top">
          <span
            className={`hockey-calendar-event__type hockey-calendar-event__type--${event.type}`}
            data-testid={testId('calendar', 'agenda', 'badge', 'type', event.id)}
          >
            {typeLabel}
          </span>
          <span
            className={`hockey-calendar-event__status hockey-calendar-event__status--${statusTone}`}
            data-testid={testId('calendar', 'agenda', 'text', 'status', event.id)}
          >
            {statusLabel}
          </span>
        </div>

        <Link
          to={detailsPath}
          className="hockey-calendar-event__title-link"
          data-testid={testId('calendar', 'agenda', 'link', 'event', event.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('calendar', 'agenda', 'text', 'title', event.id)}
          >
            {event.title}
          </Text>
        </Link>

        <Text
          color="secondary"
          className="hockey-calendar-event__meta"
          data-testid={testId('calendar', 'agenda', 'text', 'meta', event.id)}
        >
          {event.arenaName ?? event.arenaId}
          {event.district ? ` · ${event.district}` : ''}
          {` · ${priceLabel}`}
        </Text>

        {showOrganizerMeta && (
          <Text
            color="secondary"
            data-testid={testId('calendar', 'agenda', 'text', 'fill', event.id)}
          >
            Заполненность {fillPercent}%{goalieOpen ? ' · нужен вратарь' : ''}
          </Text>
        )}

        <div className="hockey-calendar-event__actions">
          {showActions &&
            (event.hasTeamRsvp ? (
              <TeamRsvpResponseControl eventId={event.id} currentUserId={currentUserId} />
            ) : (
              <TrainingRegistrationControl
                eventId={event.id}
                eventType={event.type}
                currentStatus={myAttendance}
                registrationStatus={event.registrationStatus}
                currentUserId={currentUserId}
                compact
              />
            ))}
          <HockeyButton
            view="flat"
            size="s"
            onClick={() => downloadEventIcs(event)}
            data-testid={testId('calendar', 'agenda', 'btn', 'ics', event.id)}
          >
            В календарь
          </HockeyButton>
          <Link
            to={detailsPath}
            data-testid={testId('calendar', 'agenda', 'link', 'details', event.id)}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('calendar', 'agenda', 'btn', 'details', event.id)}
            >
              Подробнее
            </HockeyButton>
          </Link>
        </div>
      </div>
    </article>
  )
}
