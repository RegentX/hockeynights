/**
 * HOCFRONT-28F / ORG-3 — рабочий профиль организатора в кабинете
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {fetchProfileSettings} from '@/entities/profile'
import {hasOrganizerPublishAccess} from '@/features/events/lib/organizerSubscription'
import {
  countOrganizerStatuses,
  eventFillPercent,
  resolveOrganizerEventStatus,
} from '@/features/events/lib/organizerWorkspace'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

export interface OrganizerProfilePanelProps {
  events: GameEvent[]
  displayName: string
  userId: string
}

export function OrganizerProfilePanel({events, displayName, userId}: OrganizerProfilePanelProps) {
  const {data: settings} = useQuery({
    queryKey: ['profile-settings'],
    queryFn: fetchProfileSettings,
  })

  const counts = useMemo(() => countOrganizerStatuses(events), [events])
  const avgFill = useMemo(() => {
    const published = events.filter((event) => {
      const status = resolveOrganizerEventStatus(event)
      return status === 'open' || status === 'full' || status === 'past'
    })
    if (published.length === 0) return null
    const sum = published.reduce((acc, event) => acc + eventFillPercent(event), 0)
    return Math.round(sum / published.length)
  }, [events])

  const canPublishPublic = hasOrganizerPublishAccess(settings?.subscription.planId)
  const planLabel = settings?.subscription.planId
    ? settings.subscription.planId.replace(/_/g, ' ')
    : 'без тарифа'

  return (
    <IceCard padding="m" data-testid={testId('events', 'organizer-page', 'panel', 'profile')}>
      <div className="hockey-stack hockey-stack--gap-12">
        <div className="hockey-stack hockey-stack--gap-4">
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'organizer-page', 'text', 'profile-title')}
          >
            Профиль организатора
          </Text>
          <Text data-testid={testId('events', 'organizer-page', 'text', 'profile-name')}>
            {displayName}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('events', 'organizer-page', 'text', 'profile-role')}
          >
            Роль: организатор тренировок
          </Text>
        </div>

        <Text
          color="secondary"
          data-testid={testId('events', 'organizer-page', 'text', 'profile-stats')}
        >
          Событий {events.length} · набор {counts.open} · заполнены {counts.full} · черновики{' '}
          {counts.draft}
          {avgFill != null ? ` · средняя заполненность ${avgFill}%` : ''}
        </Text>

        <Text
          color="secondary"
          data-testid={testId('events', 'organizer-page', 'text', 'profile-subscription')}
        >
          Публикация открытых тренировок:{' '}
          {canPublishPublic ? 'доступна' : 'нужна подписка Player Plus / Team Pro'}. Тариф:{' '}
          {planLabel}.
        </Text>

        <Text
          color="secondary"
          data-testid={testId('events', 'organizer-page', 'text', 'profile-hint')}
        >
          Приватные клубные тренировки — через кабинет клуба или шаг «Доступ». Заявки на лёд — во
          вкладке «Договорённости».
        </Text>

        <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
          <Link
            to={routes.eventsCreate}
            data-testid={testId('events', 'organizer-page', 'link', 'profile-create')}
          >
            <HockeyButton
              view="action"
              size="s"
              data-testid={testId('events', 'organizer-page', 'btn', 'profile-create')}
            >
              Создать тренировку
            </HockeyButton>
          </Link>
          <Link
            to={routes.profile}
            data-testid={testId('events', 'organizer-page', 'link', 'profile')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('events', 'organizer-page', 'btn', 'profile')}
            >
              Настройки и тарифы
            </HockeyButton>
          </Link>
          {userId ? (
            <Link
              to={`/players/${userId}`}
              data-testid={testId('events', 'organizer-page', 'link', 'profile-public')}
            >
              <HockeyButton
                view="flat"
                size="s"
                data-testid={testId('events', 'organizer-page', 'btn', 'profile-public')}
              >
                Публичный профиль
              </HockeyButton>
            </Link>
          ) : null}
        </div>
      </div>
    </IceCard>
  )
}
