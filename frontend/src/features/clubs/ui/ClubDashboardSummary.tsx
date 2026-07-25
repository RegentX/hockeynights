/**
 * HOCFRONT-25 / TASK-04-07 — дашборд кабинета клуба для админа
 */

import {Label, Text} from '@gravity-ui/uikit'
import {Link} from 'react-router-dom'

import type {Club} from '@/entities/club'
import type {GameEvent} from '@/entities/event'
import {EVENT_TYPE_LABELS} from '@/features/events'
import {STAFF_ROLE_LABELS} from '@/features/teams'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export type ClubPartnerTab = 'dashboard' | 'profile' | 'roster' | 'calendar' | 'private'

export interface ClubDashboardSummaryProps {
  club: Club
  rosterCount: number
  staffCount: number
  calendarCount: number
  privateTrainingCount: number
  upcomingEvents: GameEvent[]
  onNavigateTab: (tab: ClubPartnerTab) => void
}

interface StatTileProps {
  clubId: string
  id: string
  label: string
  value: string
  hint: string
  onClick: () => void
  accent?: boolean
}

function StatTile({clubId, id, label, value, hint, onClick, accent}: StatTileProps) {
  return (
    <button
      type="button"
      className={`club-cabinet__stat${accent ? ' club-cabinet__stat--accent' : ''}`}
      onClick={onClick}
      data-testid={testId('clubs', 'dashboard', 'btn', `stat-${id}`, clubId)}
    >
      <Text
        color="secondary"
        className="club-cabinet__stat-label"
        data-testid={testId('clubs', 'dashboard', 'text', `${id}-label`, clubId)}
      >
        {label}
      </Text>
      <Text
        variant="header-2"
        data-testid={testId('clubs', 'dashboard', 'text', `${id}-count`, clubId)}
      >
        {value}
      </Text>
      <Text
        color="secondary"
        className="club-cabinet__stat-hint"
        data-testid={testId('clubs', 'dashboard', 'text', `${id}-hint`, clubId)}
      >
        {hint}
      </Text>
    </button>
  )
}

/**
 * Что важно админу клуба на главном экране:
 * 1) быстрые действия (создать тренировку, состав, публичный профиль)
 * 2) сводка кликабельными плитками
 * 3) ближайшие события и штаб под рукой
 */
export function ClubDashboardSummary({
  club,
  rosterCount,
  staffCount,
  calendarCount,
  privateTrainingCount,
  upcomingEvents,
  onNavigateTab,
}: ClubDashboardSummaryProps) {
  const publicTeamId = club.teamIds[0]

  return (
    <div
      className="club-cabinet__dashboard hockey-stack hockey-stack--gap-20"
      data-testid={testId('clubs', 'dashboard', 'panel', club.id)}
    >
      <section
        className="club-cabinet__hero"
        data-testid={testId('clubs', 'dashboard', 'card', 'club', club.id)}
      >
        <div className="club-cabinet__hero-main">
          <div className="club-cabinet__hero-crest" aria-hidden>
            {club.name.trim().charAt(0).toUpperCase() || 'К'}
          </div>
          <div className="hockey-stack hockey-stack--gap-8">
            <Text
              variant="header-1"
              className="variable-font-header"
              data-testid={testId('clubs', 'dashboard', 'text', 'name', club.id)}
            >
              {club.name}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('clubs', 'dashboard', 'text', 'city', club.id)}
            >
              {club.city}
              {club.contactEmail ? ` · ${club.contactEmail}` : ''}
            </Text>
            {club.description && (
              <Text
                className="club-cabinet__hero-lead"
                data-testid={testId('clubs', 'dashboard', 'text', 'description', club.id)}
              >
                {club.description}
              </Text>
            )}
            <div className="club-cabinet__hero-chips">
              <Label size="s" data-testid={testId('clubs', 'dashboard', 'badge', 'teams', club.id)}>
                Команд: {club.teamIds.length}
              </Label>
              <Label
                size="s"
                data-testid={testId('clubs', 'dashboard', 'badge', 'squads', club.id)}
              >
                Составов: {club.squads.length}
              </Label>
            </div>
          </div>
        </div>
        {publicTeamId && (
          <Link
            to={`/teams/${publicTeamId}`}
            data-testid={testId('clubs', 'dashboard', 'link', 'public-team', club.id)}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('clubs', 'dashboard', 'btn', 'public-team', club.id)}
            >
              Публичная страница
            </HockeyButton>
          </Link>
        )}
      </section>

      <section
        className="club-cabinet__priority"
        data-testid={testId('clubs', 'dashboard', 'panel', 'priority', club.id)}
      >
        <Text
          variant="subheader-2"
          data-testid={testId('clubs', 'dashboard', 'text', 'priority-title', club.id)}
        >
          Сейчас важно
        </Text>
        <div className="club-cabinet__priority-grid">
          <button
            type="button"
            className="club-cabinet__priority-card club-cabinet__priority-card--primary"
            onClick={() => onNavigateTab('private')}
            data-testid={testId('clubs', 'dashboard', 'btn', 'priority-private', club.id)}
          >
            <Text variant="subheader-2" className="club-cabinet__priority-title">
              Создать приватную тренировку
            </Text>
            <Text color="secondary" className="club-cabinet__priority-desc">
              Раскладка → одобрение тренера → назначения в мессенджер · сейчас{' '}
              {privateTrainingCount}
            </Text>
          </button>
          <button
            type="button"
            className="club-cabinet__priority-card"
            onClick={() => onNavigateTab('roster')}
            data-testid={testId('clubs', 'dashboard', 'btn', 'priority-roster', club.id)}
          >
            <Text variant="subheader-2" className="club-cabinet__priority-title">
              Управлять составом
            </Text>
            <Text color="secondary" className="club-cabinet__priority-desc">
              NHL-табло: перестановка карточек, запасные · {rosterCount} игроков
            </Text>
          </button>
          <button
            type="button"
            className="club-cabinet__priority-card"
            onClick={() => onNavigateTab('profile')}
            data-testid={testId('clubs', 'dashboard', 'btn', 'priority-profile', club.id)}
          >
            <Text variant="subheader-2" className="club-cabinet__priority-title">
              Публичный профиль и штаб
            </Text>
            <Text color="secondary" className="club-cabinet__priority-desc">
              Название, контакты, роли штаба · {staffCount}
            </Text>
          </button>
        </div>
      </section>

      <section
        className="club-cabinet__stats"
        data-testid={testId('clubs', 'dashboard', 'grid', 'stats', club.id)}
      >
        <StatTile
          clubId={club.id}
          id="roster"
          label="Состав"
          value={String(rosterCount)}
          hint="Открыть управление"
          onClick={() => onNavigateTab('roster')}
          accent
        />
        <StatTile
          clubId={club.id}
          id="staff"
          label="Штаб"
          value={String(staffCount)}
          hint="Редактировать в профиле"
          onClick={() => onNavigateTab('profile')}
        />
        <StatTile
          clubId={club.id}
          id="calendar"
          label="Календарь"
          value={String(calendarCount)}
          hint="Все события клуба"
          onClick={() => onNavigateTab('calendar')}
        />
        <StatTile
          clubId={club.id}
          id="private"
          label="Приватные"
          value={String(privateTrainingCount)}
          hint="Создать / список"
          onClick={() => onNavigateTab('private')}
          accent
        />
      </section>

      <div
        className="club-cabinet__columns"
        data-testid={testId('clubs', 'dashboard', 'panel', 'columns', club.id)}
      >
        <section
          className="club-cabinet__panel"
          data-testid={testId('clubs', 'dashboard', 'panel', 'upcoming', club.id)}
        >
          <div className="club-cabinet__panel-head">
            <Text
              variant="subheader-2"
              data-testid={testId('clubs', 'dashboard', 'text', 'upcoming-title', club.id)}
            >
              Ближайшие события
            </Text>
            <HockeyButton
              view="flat"
              size="s"
              onClick={() => onNavigateTab('calendar')}
              data-testid={testId('clubs', 'dashboard', 'btn', 'upcoming-all', club.id)}
            >
              Весь календарь
            </HockeyButton>
          </div>
          {upcomingEvents.length === 0 ? (
            <Text
              color="secondary"
              data-testid={testId('clubs', 'dashboard', 'empty', 'upcoming', club.id)}
            >
              Пока пусто — создайте приватную тренировку или дождитесь игр.
            </Text>
          ) : (
            <ul className="club-cabinet__event-list">
              {upcomingEvents.map((event) => {
                const dateLabel = new Date(event.startsAt).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                return (
                  <li
                    key={event.id}
                    className="club-cabinet__event-row"
                    data-testid={testId('clubs', 'dashboard', 'row', 'event', event.id)}
                  >
                    {event.type === 'training' ? (
                      <Link
                        to={`/events/trainings/${event.id}`}
                        data-testid={testId('clubs', 'dashboard', 'link', 'event', event.id)}
                      >
                        <Text variant="subheader-2">{event.title}</Text>
                      </Link>
                    ) : (
                      <Text variant="subheader-2">{event.title}</Text>
                    )}
                    <Text color="secondary">
                      {dateLabel} · {EVENT_TYPE_LABELS[event.type] ?? event.type}
                      {event.accessScope === 'private_club' ? ' · приватная' : ''}
                    </Text>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section
          className="club-cabinet__panel"
          data-testid={testId('clubs', 'dashboard', 'panel', 'staff', club.id)}
        >
          <div className="club-cabinet__panel-head">
            <Text
              variant="subheader-2"
              data-testid={testId('clubs', 'dashboard', 'text', 'staff-title', club.id)}
            >
              Штаб
            </Text>
            <HockeyButton
              view="flat"
              size="s"
              onClick={() => onNavigateTab('profile')}
              data-testid={testId('clubs', 'dashboard', 'btn', 'staff-edit', club.id)}
            >
              Править
            </HockeyButton>
          </div>
          {club.staff.length === 0 ? (
            <Text
              color="secondary"
              data-testid={testId('clubs', 'dashboard', 'empty', 'staff', club.id)}
            >
              Добавьте тренеров и контакты в профиле клуба.
            </Text>
          ) : (
            <ul className="club-cabinet__staff-list">
              {club.staff.map((member) => (
                <li
                  key={member.userId}
                  className="club-cabinet__staff-row"
                  data-testid={testId('clubs', 'dashboard', 'row', 'staff', member.userId)}
                >
                  <div className="club-cabinet__staff-avatar" aria-hidden>
                    {member.displayName.trim().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Text variant="subheader-2">{member.displayName}</Text>
                    <Text color="secondary">{STAFF_ROLE_LABELS[member.role]}</Text>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to={routes.messenger}
            className="club-cabinet__messenger-link"
            data-testid={testId('clubs', 'dashboard', 'link', 'messenger', club.id)}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('clubs', 'dashboard', 'btn', 'messenger', club.id)}
            >
              Открыть мессенджер
            </HockeyButton>
          </Link>
        </section>
      </div>
    </div>
  )
}
