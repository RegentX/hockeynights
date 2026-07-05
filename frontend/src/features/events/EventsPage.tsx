/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.3.1, SPEC-FR-4.3.2
 * SPEC-UI-2.5, SPEC-UI-3.1
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {useSessionAccess} from '@/features/access/useSessionAccess'
import {fetchEvents} from '@/features/events/api/eventsApi'
import {EventCard} from '@/features/events/EventCard'
import {EventCreateForm} from '@/features/events/EventCreateForm'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {IceCard} from '@/shared/ui/IceCard'
import {MatchCenterFeed} from '@/shared/ui/MatchCenterFeed'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {ScrollReveal} from '@/shared/ui/ScrollStory'

/**
 * @spec SPEC-UI-2.5 - Страница событий как матч-центр
 * @spec SPEC-FR-4.1.1 - Страница событий
 */
export function EventsPage() {
  const {data: events = [], isLoading} = useQuery({queryKey: ['events'], queryFn: fetchEvents})
  const {userId, canOrganizeEvents} = useSessionAccess()

  const matchRows = events.map((event) => ({
    id: event.id,
    time: new Date(event.startsAt).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    title: event.title,
    subtitle: `${event.arenaName ?? event.arenaId} · ${event.type}`,
    type: (event.type === 'open_ice' ? 'open_ice' : event.type) as 'game' | 'training' | 'open_ice',
  }))

  const participationHistory = events
    .filter((event) => event.participation.some((p) => p.userId === userId))
    .map((event) => {
      const myStatus = event.participation.find((p) => p.userId === userId)?.status ?? 'maybe'
      return {event, myStatus}
    })
    .sort((a, b) => new Date(b.event.startsAt).getTime() - new Date(a.event.startsAt).getTime())

  return (
    <div className="hockey-stack hockey-stack--gap-20" data-testid={testId('events', 'page')}>
      <ScrollReveal direction="down">
        <Text
          variant="header-1"
          className="variable-font-header"
          data-testid={testId('events', 'page', 'text', 'title')}
        >
          Игры и тренировки
        </Text>
      </ScrollReveal>

      <div
        className="hockey-grid hockey-grid--cards-280"
        data-testid={testId('events', 'page', 'grid')}
      >
        {canOrganizeEvents && (
          <ScrollReveal direction="left">
            <div data-testid={testId('events', 'page', 'card', 'create-form')}>
              <IceCard padding="m">
                <EventCreateForm />
              </IceCard>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal direction={canOrganizeEvents ? 'right' : 'left'}>
          <div data-testid={testId('events', 'page', 'card', 'match-center')}>
            <IceCard padding="m">
              {isLoading ? (
                <div data-testid={testId('events', 'page', 'loader')}>
                  <ScoreboardLoader />
                </div>
              ) : (
                <div data-testid={testId('events', 'page', 'list', 'match-center')}>
                  <MatchCenterFeed
                    title="Матч-центр"
                    rows={matchRows}
                    empty={
                      <EmptyNetState
                        title="Пустая сетка"
                        copy="Ближайших событий нет — создай игру или тренировку."
                      />
                    }
                  />
                </div>
              )}
            </IceCard>
          </div>
        </ScrollReveal>
      </div>

      {!isLoading && events.length > 0 && (
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('events', 'page', 'list', 'details')}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'page', 'text', 'details-title')}
          >
            Детали событий
          </Text>
          {events.map((event, index) => (
            <ScrollReveal key={event.id} direction={index % 2 === 0 ? 'up' : 'down'}>
              <EventCard event={event} />
            </ScrollReveal>
          ))}
        </div>
      )}

      {!isLoading && participationHistory.length > 0 && (
        <div data-testid={testId('events', 'page', 'card', 'history')}>
          <IceCard padding="m">
            <div className="hockey-stack hockey-stack--gap-10">
              <Text
                variant="subheader-2"
                data-testid={testId('events', 'page', 'text', 'history-title')}
              >
                Моя история участия (RSVP)
              </Text>
              {participationHistory.map(({event, myStatus}) => (
                <div
                  key={`${event.id}-history`}
                  className="hockey-row hockey-row--between hockey-row--gap-12"
                  data-testid={testId('events', 'page', 'item', 'history', event.id)}
                >
                  <div className="hockey-stack hockey-stack--gap-4">
                    <Text
                      variant="body-2"
                      data-testid={testId('events', 'page', 'text', 'history-title', event.id)}
                    >
                      {event.title}
                    </Text>
                    <Text
                      color="secondary"
                      data-testid={testId('events', 'page', 'text', 'history-meta', event.id)}
                    >
                      {new Date(event.startsAt).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {event.arenaName ?? event.arenaId}
                    </Text>
                  </div>
                  <Text
                    color={
                      myStatus === 'going'
                        ? 'positive'
                        : myStatus === 'not_going'
                          ? 'danger'
                          : 'warning'
                    }
                    data-testid={testId('events', 'page', 'text', 'history-status', event.id)}
                  >
                    {myStatus === 'going'
                      ? 'Иду'
                      : myStatus === 'not_going'
                        ? 'Не иду'
                        : 'Под вопросом'}
                  </Text>
                </div>
              ))}
            </div>
          </IceCard>
        </div>
      )}
    </div>
  )
}
