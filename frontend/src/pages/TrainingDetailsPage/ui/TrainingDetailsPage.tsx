import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import {Link, useParams} from 'react-router'

import {fetchEventById} from '@/entities/event'
import {fetchPlayers} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {canManageClubEntity, useSessionAccess} from '@/features/access'
import {
  ACCESS_LABELS,
  canViewTraining,
  getUserTeamIds,
  POSITION_LABELS,
  resolveTrainingUserName,
  SKILL_LEVEL_LABELS,
  TRAINING_FORMAT_LABELS,
  TrainingRegistrationControl,
} from '@/features/events'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export function TrainingDetailsPage() {
  const {eventId = ''} = useParams()
  const {userId, roles, session} = useSessionAccess()
  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventById(eventId),
    enabled: Boolean(eventId),
  })
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})
  const {data: players = []} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(),
  })

  const userTeamIds = useMemo(() => getUserTeamIds(teams, userId), [teams, userId])
  const playerNames = useMemo(
    () => Object.fromEntries(players.map((player) => [player.userId, player.displayName])),
    [players],
  )

  if (isLoading) {
    return (
      <div data-testid={testId('events', 'training-page', 'loader')}>
        <ScoreboardLoader label="Загрузка тренировки..." />
      </div>
    )
  }

  if (isError || !event || event.type !== 'training') {
    return (
      <div data-testid={testId('events', 'training-page', 'empty')}>
        <EmptyNetState
          title="Тренировка не найдена"
          copy="Вернитесь к списку и выберите актуальную тренировку."
        />
      </div>
    )
  }

  const canManageClub = canManageClubEntity(session, event.clubId)

  if (
    !canViewTraining(event, userId, userTeamIds, {
      isAdmin: roles.includes('admin'),
      canManageClub,
    })
  ) {
    return (
      <div data-testid={testId('events', 'training-page', 'error', 'access-denied')}>
        <EmptyNetState
          title="Нет доступа к тренировке"
          copy="Эта тренировка доступна только участникам клуба или приглашённым игрокам."
        />
        <Link
          to="/events"
          data-testid={testId('events', 'training-page', 'link', 'back-denied', event.id)}
        >
          <HockeyButton
            view="flat"
            size="m"
            data-testid={testId('events', 'training-page', 'btn', 'back-denied', event.id)}
          >
            К списку тренировок
          </HockeyButton>
        </Link>
      </div>
    )
  }

  const start = new Date(event.startsAt)
  const end = new Date(event.endsAt)
  const accessLabel = event.accessScope ? ACCESS_LABELS[event.accessScope] : 'Тип доступа не задан'
  const organizerName = resolveTrainingUserName(event.organizerUserId, event, playerNames)
  const contactPhone = event.organizerPhone ?? '+7 (900) 000-00-00'
  const currentStatus = event.participation.find((item) => item.userId === userId)?.status
  const requiredTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  const filledTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
  const fillPercent = requiredTotal > 0 ? Math.round((filledTotal / requiredTotal) * 100) : 0
  const allowedUsers = event.allowedUserIds?.map((allowedUserId) =>
    resolveTrainingUserName(allowedUserId, event, playerNames),
  )

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('events', 'training-page', 'page', event.id)}
    >
      <div className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap">
        <Text
          variant="header-1"
          data-testid={testId('events', 'training-page', 'text', 'title', event.id)}
        >
          {event.title}
        </Text>
        <Link
          to="/events"
          data-testid={testId('events', 'training-page', 'link', 'back', event.id)}
        >
          <HockeyButton
            view="flat"
            size="m"
            data-testid={testId('events', 'training-page', 'btn', 'back', event.id)}
          >
            К списку тренировок
          </HockeyButton>
        </Link>
      </div>

      <IceCard padding="m">
        <div
          className="hockey-stack hockey-stack--gap-10"
          data-testid={testId('events', 'training-page', 'panel', 'meta', event.id)}
        >
          <Text data-testid={testId('events', 'training-page', 'text', 'access', event.id)}>
            {accessLabel}
          </Text>
          <Text data-testid={testId('events', 'training-page', 'text', 'schedule', event.id)}>
            {start.toLocaleDateString('ru-RU')} ·{' '}
            {start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
            {' - '}
            {end.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
          </Text>
          <Text data-testid={testId('events', 'training-page', 'text', 'arena', event.id)}>
            Арена:{' '}
            <Link
              to={`/arenas?arenaId=${event.arenaId}`}
              data-testid={testId('events', 'training-page', 'link', 'arena', event.id)}
            >
              {event.arenaName ?? event.arenaId}
            </Link>
          </Text>
          <Text data-testid={testId('events', 'training-page', 'text', 'price', event.id)}>
            Цена: {event.pricePerPlayer ? `${event.pricePerPlayer} RUB` : 'По договоренности'}
          </Text>
          <Text data-testid={testId('events', 'training-page', 'text', 'fill', event.id)}>
            Заполненность: {filledTotal}/{requiredTotal} ({fillPercent}%)
          </Text>
          <Text
            data-testid={testId('events', 'training-page', 'text', 'registration-status', event.id)}
          >
            Статус набора:{' '}
            {event.registrationStatus === 'full' ? 'Состав укомплектован' : 'Открыт для записи'}
          </Text>
          {event.district && (
            <Text
              color="secondary"
              data-testid={testId('events', 'training-page', 'text', 'district', event.id)}
            >
              Округ: {event.district}
            </Text>
          )}
          {event.trainingFormat && (
            <Text
              color="secondary"
              data-testid={testId('events', 'training-page', 'text', 'format', event.id)}
            >
              Формат: {TRAINING_FORMAT_LABELS[event.trainingFormat]}
            </Text>
          )}
          <Text
            color="secondary"
            data-testid={testId('events', 'training-page', 'text', 'level', event.id)}
          >
            Рекомендованный уровень: {SKILL_LEVEL_LABELS[event.requiredSkillLevel]}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('events', 'training-page', 'text', 'organizer', event.id)}
          >
            Организатор: {organizerName}
          </Text>
          {allowedUsers?.length ? (
            <Text
              color="secondary"
              data-testid={testId('events', 'training-page', 'text', 'allowed-users', event.id)}
            >
              Доступ ограничен списком: {allowedUsers.join(', ')}
            </Text>
          ) : null}
        </div>
      </IceCard>

      <IceCard padding="m">
        <div
          className="hockey-stack hockey-stack--gap-8"
          data-testid={testId('events', 'training-page', 'panel', 'slots', event.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'training-page', 'text', 'slots-title', event.id)}
          >
            Слоты и укомплектованность
          </Text>
          {event.requiredSlots.map((slot) => (
            <Text
              key={slot.position}
              data-testid={testId(
                'events',
                'training-page',
                'text',
                'slot',
                event.id,
                slot.position,
              )}
            >
              {POSITION_LABELS[slot.position]}: {slot.filledCount}/{slot.count}
            </Text>
          ))}
        </div>
      </IceCard>

      <IceCard padding="m">
        <div
          className="hockey-stack hockey-stack--gap-10"
          data-testid={testId('events', 'training-page', 'panel', 'contacts', event.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'training-page', 'text', 'contacts-title', event.id)}
          >
            Контакты организатора
          </Text>
          <Text data-testid={testId('events', 'training-page', 'text', 'owner', event.id)}>
            {organizerName}
          </Text>
          <div className="training-details__contacts-actions">
            <Link
              to={`/messenger?userId=${event.organizerUserId}`}
              className="training-details__contact-action"
              data-testid={testId('events', 'training-page', 'link', 'messenger', event.id)}
            >
              <HockeyButton
                view="outlined"
                size="m"
                data-testid={testId('events', 'training-page', 'btn', 'messenger', event.id)}
              >
                Связаться в мессенджере
              </HockeyButton>
            </Link>
            <a
              href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`}
              className="training-details__contact-action"
              data-testid={testId('events', 'training-page', 'link', 'phone', event.id)}
            >
              <HockeyButton
                view="outlined"
                size="m"
                data-testid={testId('events', 'training-page', 'btn', 'phone', event.id)}
              >
                {contactPhone}
              </HockeyButton>
            </a>
            <HockeyButton
              view="action"
              size="m"
              disabled
              data-testid={testId('events', 'training-page', 'btn', 'prepay', event.id)}
            >
              Внести предоплату (скоро)
            </HockeyButton>
          </div>
        </div>
      </IceCard>

      <IceCard padding="m">
        <div
          className="hockey-stack hockey-stack--gap-8"
          data-testid={testId('events', 'training-page', 'panel', 'registration', event.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'training-page', 'text', 'registration-title', event.id)}
          >
            Запись на тренировку
          </Text>
          <TrainingRegistrationControl
            eventId={event.id}
            currentStatus={currentStatus}
            registrationStatus={event.registrationStatus}
            currentUserId={userId}
          />
        </div>
      </IceCard>
    </div>
  )
}
