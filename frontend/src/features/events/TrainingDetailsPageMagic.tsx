/**
 * HOCFRONT-13 — детальная страница тренировки (Magic UI).
 * @spec SPEC-FR-4.1.1 - Прототип матч-центра на Magic UI.
 */

import '@/shared/magic-ui/magic-ui.css'

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {CalendarDays, MapPin, Phone, Users} from 'lucide-react'
import {useMemo} from 'react'
import {Link, useParams} from 'react-router-dom'

import {fetchEventById} from '@/entities/event'
import {fetchPlayers} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {
  ACCESS_LABELS,
  AttendanceControl,
  canViewTraining,
  getUserTeamIds,
  POSITION_LABELS,
  resolveTrainingUserName,
  SKILL_LEVEL_LABELS,
  TRAINING_FORMAT_LABELS,
} from '@/features/events'
import {cn} from '@/shared/lib/cn'
import {MagicCard} from '@/shared/magic-ui/magic-card'
import {ShimmerButton} from '@/shared/magic-ui/shimmer-button'
import {testId} from '@/shared/testing/testId'

function getFillPercent(event: {
  requiredSlots: Array<{count: number; filledCount: number}>
}): number {
  const requiredTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  const filledTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
  return requiredTotal > 0 ? Math.round((filledTotal / requiredTotal) * 100) : 0
}

function MetaRow({
  label,
  children,
  testIdLabel,
}: {
  label: string
  children: React.ReactNode
  testIdLabel: string
}) {
  return (
    <div className="magic-training-meta__row">
      <span className="magic-training-meta__label" data-testid={testIdLabel}>
        {label}
      </span>
      <span className="magic-training-meta__value">{children}</span>
    </div>
  )
}

export function TrainingDetailsPageMagic() {
  const {eventId = ''} = useParams()
  const {userId, roles} = useSessionAccess()
  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventById(eventId),
    enabled: Boolean(eventId),
  })
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: fetchTeams})
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
      <div className="magic-page" data-testid={testId('events', 'magic-training', 'loader')}>
        <div className="magic-page__bg1" />
        <div className="magic-page__bg2" />
        <div className="magic-layout">
          <div className="magic-loader">
            <span>Загрузка тренировки...</span>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !event || event.type !== 'training') {
    return (
      <div className="magic-page" data-testid={testId('events', 'magic-training', 'empty')}>
        <div className="magic-page__bg1" />
        <div className="magic-page__bg2" />
        <div className="magic-layout">
          <MagicCard>
            <div className="magic-training-empty">
              <p className="magic-training-empty__title">Тренировка не найдена</p>
              <p className="magic-training-empty__copy">
                Вернитесь к списку и выберите актуальную тренировку.
              </p>
              <Link
                to="/events/magic"
                className="magic-classic-link"
                data-testid={testId('events', 'magic-training', 'link', 'back-empty')}
              >
                ← К событиям
              </Link>
            </div>
          </MagicCard>
        </div>
      </div>
    )
  }

  if (!canViewTraining(event, userId, userTeamIds, roles.includes('admin'))) {
    return (
      <div
        className="magic-page"
        data-testid={testId('events', 'magic-training', 'error', 'access-denied')}
      >
        <div className="magic-page__bg1" />
        <div className="magic-page__bg2" />
        <div className="magic-layout">
          <MagicCard>
            <div className="magic-training-empty">
              <p className="magic-training-empty__title">Нет доступа к тренировке</p>
              <p className="magic-training-empty__copy">
                Эта тренировка доступна только участникам клуба или приглашённым игрокам.
              </p>
              <Link
                to="/events/magic"
                className="magic-classic-link"
                data-testid={testId('events', 'magic-training', 'link', 'back-denied', event.id)}
              >
                ← К событиям
              </Link>
            </div>
          </MagicCard>
        </div>
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
  const fillPercent = getFillPercent(event)
  const allowedUsers = event.allowedUserIds?.map((allowedUserId) =>
    resolveTrainingUserName(allowedUserId, event, playerNames),
  )

  const fillGradient =
    fillPercent >= 100
      ? 'linear-gradient(to right, #34d399, #38bdf8)'
      : fillPercent >= 70
        ? 'linear-gradient(to right, #38bdf8, #3b82f6)'
        : 'linear-gradient(to right, #f59e0b, #ef4444)'

  return (
    <div
      className="magic-page"
      data-testid={testId('events', 'magic-training', 'page', event.id)}
    >
      <div className="magic-page__bg1" />
      <div className="magic-page__bg2" />

      <div className="magic-layout">
        <header className="magic-training-header">
          <Link
            to="/events/magic"
            className="magic-classic-link"
            data-testid={testId('events', 'magic-training', 'link', 'back', event.id)}
          >
            ← К событиям
          </Link>
          <Text
            variant="header-1"
            className="variable-font-header magic-games-header__title"
            data-testid={testId('events', 'magic-training', 'text', 'title', event.id)}
          >
            {event.title}
          </Text>
        </header>

        <MagicCard
          className="magic-training-hero"
          data-testid={testId('events', 'magic-training', 'panel', 'hero', event.id)}
        >
          <div className="magic-training-hero__inner">
            <div className="magic-training-hero__time">
              <CalendarDays size={18} color="#38bdf8" aria-hidden />
              <div>
                <p
                  className="magic-training-hero__datetime"
                  data-testid={testId('events', 'magic-training', 'text', 'schedule', event.id)}
                >
                  {start.toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  {' · '}
                  {start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
                  {' – '}
                  {end.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
                </p>
                <p className="magic-training-hero__arena">
                  <MapPin size={14} aria-hidden />
                  <Link
                    to={`/arenas?arenaId=${event.arenaId}`}
                    data-testid={testId('events', 'magic-training', 'link', 'arena', event.id)}
                  >
                    {event.arenaName ?? event.arenaId}
                  </Link>
                  {event.district ? ` · ${event.district}` : ''}
                </p>
              </div>
            </div>

            <div className="magic-event-chips">
              <span className="magic-event-chip">{accessLabel}</span>
              {event.trainingFormat && (
                <span className="magic-event-chip">
                  {TRAINING_FORMAT_LABELS[event.trainingFormat]}
                </span>
              )}
              <span className="magic-event-chip">
                {SKILL_LEVEL_LABELS[event.requiredSkillLevel]}
              </span>
            </div>

            <div className="magic-event-fill">
              <div className="magic-training-fill-row">
                <span>
                  <Users size={16} aria-hidden /> Заполненность
                </span>
                <span data-testid={testId('events', 'magic-training', 'text', 'fill', event.id)}>
                  {filledTotal}/{requiredTotal} ({fillPercent}%)
                </span>
              </div>
              <div className="magic-event-fill-bar">
                <div
                  className="magic-event-fill-bar-inner"
                  style={{
                    width: `${Math.min(fillPercent, 100)}%`,
                    backgroundImage: fillGradient,
                  }}
                />
              </div>
            </div>
          </div>
        </MagicCard>

        <MagicCard data-testid={testId('events', 'magic-training', 'panel', 'meta', event.id)}>
          <div className="magic-training-section">
            <h2
              className="magic-training-section__title"
              data-testid={testId('events', 'magic-training', 'text', 'meta-title', event.id)}
            >
              Детали
            </h2>
            <div className="magic-training-meta">
              <MetaRow
                label="Цена"
                testIdLabel={testId('events', 'magic-training', 'text', 'price', event.id)}
              >
                {event.pricePerPlayer
                  ? `${event.pricePerPlayer.toLocaleString('ru-RU')} ₽`
                  : 'По договорённости'}
              </MetaRow>
              <MetaRow
                label="Статус набора"
                testIdLabel={testId(
                  'events',
                  'magic-training',
                  'text',
                  'registration-status',
                  event.id,
                )}
              >
                {event.registrationStatus === 'full'
                  ? 'Состав укомплектован'
                  : 'Открыт для записи'}
              </MetaRow>
              <MetaRow
                label="Организатор"
                testIdLabel={testId('events', 'magic-training', 'text', 'organizer', event.id)}
              >
                {organizerName}
              </MetaRow>
              {allowedUsers?.length ? (
                <MetaRow
                  label="Доступ"
                  testIdLabel={testId(
                    'events',
                    'magic-training',
                    'text',
                    'allowed-users',
                    event.id,
                  )}
                >
                  {allowedUsers.join(', ')}
                </MetaRow>
              ) : null}
            </div>
          </div>
        </MagicCard>

        <MagicCard data-testid={testId('events', 'magic-training', 'panel', 'slots', event.id)}>
          <div className="magic-training-section">
            <h2
              className="magic-training-section__title"
              data-testid={testId('events', 'magic-training', 'text', 'slots-title', event.id)}
            >
              Слоты и укомплектованность
            </h2>
            <div className="magic-training-slots">
              {event.requiredSlots.map((slot) => (
                <div
                  key={slot.position}
                  className="magic-training-slot"
                  data-testid={testId(
                    'events',
                    'magic-training',
                    'text',
                    'slot',
                    event.id,
                    slot.position,
                  )}
                >
                  <span>{POSITION_LABELS[slot.position]}</span>
                  <span>
                    {slot.filledCount}/{slot.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </MagicCard>

        <MagicCard data-testid={testId('events', 'magic-training', 'panel', 'contacts', event.id)}>
          <div className="magic-training-section">
            <h2
              className="magic-training-section__title"
              data-testid={testId('events', 'magic-training', 'text', 'contacts-title', event.id)}
            >
              Контакты организатора
            </h2>
            <p
              className="magic-training-contacts__name"
              data-testid={testId('events', 'magic-training', 'text', 'owner', event.id)}
            >
              {organizerName}
            </p>
            <div className="magic-training-contacts__actions">
              <Link
                to={`/messenger?userId=${event.organizerUserId}`}
                className="magic-training-btn magic-training-btn--outline"
                data-testid={testId('events', 'magic-training', 'link', 'messenger', event.id)}
              >
                Связаться в мессенджере
              </Link>
              <a
                href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`}
                className={cn('magic-training-btn', 'magic-training-btn--outline')}
                data-testid={testId('events', 'magic-training', 'link', 'phone', event.id)}
              >
                <Phone size={16} aria-hidden />
                {contactPhone}
              </a>
            </div>
            <div className="magic-training-contacts__prepay">
              <ShimmerButton
                shimmerColor="#38bdf8"
                background="linear-gradient(135deg, #0e3a5f 0%, #1e1b4b 100%)"
                className="magic-training-prepay-btn"
                disabled
                data-testid={testId('events', 'magic-training', 'btn', 'prepay', event.id)}
              >
                Внести предоплату (скоро)
              </ShimmerButton>
            </div>
          </div>
        </MagicCard>

        <MagicCard data-testid={testId('events', 'magic-training', 'panel', 'attendance', event.id)}>
          <div className="magic-training-section">
            <h2
              className="magic-training-section__title"
              data-testid={testId(
                'events',
                'magic-training',
                'text',
                'attendance-title',
                event.id,
              )}
            >
              Моё участие
            </h2>
            <div className="magic-training-attendance">
              <AttendanceControl
                eventId={event.id}
                currentStatus={currentStatus}
                currentUserId={userId}
                eventTitle={event.title}
                eventKind="training"
                variant="magic"
              />
            </div>
          </div>
        </MagicCard>
      </div>
    </div>
  )
}
