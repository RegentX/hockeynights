/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.3, SPEC-FR-2.2.4
 * SPEC-FR-17.1.1, SPEC-FR-18.1.1, SPEC-FR-18.1.3, SPEC-FR-18.1.4, SPEC-FR-19.1.1
 */

import {Button, Card, Progress, Select, Switch, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useId, useState} from 'react'
import {Link, Navigate, useSearchParams} from 'react-router'

import {fetchSession} from '@/entities/auth'
import type {PlayerPosition, SkillLevel, UserRole} from '@/entities/common'
import type {
  HockeyProfile,
  ParticipationRecord,
  ProfileSettings,
  SubscriptionState,
} from '@/entities/profile'
import {
  fetchMyProfile,
  fetchProfileSettings,
  startVerificationRequest,
  updateMyProfile,
  updateNotificationPreferences,
  updatePrivacySettings,
  updateSubscription,
} from '@/entities/profile'
import {getPrimaryPartnerPath, shouldUsePartnerWorkspace} from '@/features/access'
import {CalendarScopePreview} from '@/features/calendar'
import {ProfileFavoritesSection} from '@/features/favorites'
import {KarmaHint} from '@/features/karma'
import {CoachProfilePanel, ProfileSummaryCard} from '@/features/profile'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const POSITION_OPTIONS = [
  {value: 'forward', content: 'Нападающий'},
  {value: 'defense', content: 'Защитник'},
  {value: 'goalie', content: 'Вратарь'},
]

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
]

const VISIBILITY_OPTIONS = [
  {value: 'public', content: 'Публичный'},
  {value: 'teams_only', content: 'Только командам'},
  {value: 'verified_only', content: 'Только подтвержденным'},
  {value: 'private', content: 'Скрытый'},
]

const CALENDAR_VISIBILITY_OPTIONS = [
  {value: 'public', content: 'Всем'},
  {value: 'teams_only', content: 'Только командам'},
  {value: 'private', content: 'Скрыт'},
]

const SUBSCRIPTION_PLAN_OPTIONS = [
  {
    id: 'free' as const,
    name: 'Free',
    description: 'Базовый профиль и доступ к командным чатам.',
  },
  {
    id: 'player_plus' as const,
    name: 'Player Plus',
    description: 'Приоритетные уведомления и расширенная статистика игрока.',
  },
  {
    id: 'team_pro' as const,
    name: 'Team Pro',
    description: 'Инструменты для капитана, тренера и админов команды.',
  },
]

type ProfileHubSection = 'about' | 'favorites' | 'settings' | 'privacy' | 'subscription'

function ProfileHubTabs({
  section,
  onSelect,
}: {
  section: ProfileHubSection
  onSelect: (value: ProfileHubSection) => void
}) {
  return (
    <div
      className="profile-hub__tabs"
      data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'list')}
    >
      <Button
        view={section === 'about' ? 'action' : 'outlined'}
        onClick={() => onSelect('about')}
        data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'about')}
      >
        О себе
      </Button>
      <Button
        view={section === 'favorites' ? 'action' : 'outlined'}
        onClick={() => onSelect('favorites')}
        data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'favorites')}
      >
        Избранное
      </Button>
      <Button
        view={section === 'settings' ? 'action' : 'outlined'}
        onClick={() => onSelect('settings')}
        data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'settings')}
      >
        Настройки
      </Button>
      <Button
        view={section === 'privacy' ? 'action' : 'outlined'}
        onClick={() => onSelect('privacy')}
        data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'privacy')}
      >
        Приватность
      </Button>
      <Button
        view={section === 'subscription' ? 'action' : 'outlined'}
        onClick={() => onSelect('subscription')}
        data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'subscription')}
      >
        Подписка
      </Button>
    </div>
  )
}

const PARTICIPATION_ROLE_LABELS: Record<ParticipationRecord['role'], string> = {
  player: 'Игрок',
  goalie: 'Вратарь',
  coach: 'Тренер',
}

const PARTICIPATION_TYPE_LABELS: Record<NonNullable<ParticipationRecord['eventType']>, string> = {
  game: 'Игра',
  training: 'Тренировка',
  open_ice: 'Открытый лёд',
}

function ParticipationHistoryItem({record}: {record: ParticipationRecord}) {
  const [open, setOpen] = useState(false)
  const detailsId = useId()
  const timeLabel = new Date(record.eventDate).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  /** Как после создания тренировки: детальная карточка события = «приглашение». */
  const inviteHref =
    record.eventType === 'training'
      ? `/events/trainings/${record.eventId}`
      : `/events/games/${record.eventId}`
  const inviteLabel = 'К приглашению'
  const chatHref = record.chatId ? `/messenger?chatId=${encodeURIComponent(record.chatId)}` : null

  return (
    <li
      className={`profile-hub__history-item${open ? ' is-open' : ''}`}
      data-testid={testId('profile', 'participation-history', 'item', record.eventId)}
    >
      <button
        type="button"
        className="profile-hub__history-toggle"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((prev) => !prev)}
        data-testid={testId('profile', 'participation-history', 'btn', 'toggle', record.eventId)}
      >
        <span className="profile-hub__history-main">
          <Text
            variant="subheader-2"
            data-testid={testId(
              'profile',
              'participation-history',
              'text',
              'event',
              record.eventId,
            )}
          >
            {record.eventTitle}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('profile', 'participation-history', 'text', 'date', record.eventId)}
          >
            {new Date(record.eventDate).toLocaleDateString('ru-RU')}
            {record.teamName ? ` · ${record.teamName}` : ''}
          </Text>
        </span>
        <span className="profile-hub__history-meta">
          <span
            className={`profile-hub__history-status ${
              record.confirmed ? 'is-confirmed' : 'is-pending'
            }`}
            data-testid={testId(
              'profile',
              'participation-history',
              'badge',
              'status',
              record.eventId,
            )}
          >
            {record.confirmed ? 'Подтверждено' : 'Ожидает'}
          </span>
          <span className="profile-hub__history-chevron" aria-hidden>
            {open ? '▴' : '▾'}
          </span>
        </span>
      </button>

      {open && (
        <div
          id={detailsId}
          className="profile-hub__history-details"
          data-testid={testId(
            'profile',
            'participation-history',
            'panel',
            'details',
            record.eventId,
          )}
        >
          <dl className="profile-hub__history-facts">
            <div>
              <dt>Роль</dt>
              <dd
                data-testid={testId(
                  'profile',
                  'participation-history',
                  'text',
                  'role',
                  record.eventId,
                )}
              >
                {PARTICIPATION_ROLE_LABELS[record.role]}
              </dd>
            </div>
            {record.eventType && (
              <div>
                <dt>Тип</dt>
                <dd
                  data-testid={testId(
                    'profile',
                    'participation-history',
                    'text',
                    'type',
                    record.eventId,
                  )}
                >
                  {PARTICIPATION_TYPE_LABELS[record.eventType]}
                </dd>
              </div>
            )}
            <div>
              <dt>Время</dt>
              <dd
                data-testid={testId(
                  'profile',
                  'participation-history',
                  'text',
                  'time',
                  record.eventId,
                )}
              >
                {timeLabel}
                {record.durationMinutes ? ` · ${record.durationMinutes} мин` : ''}
              </dd>
            </div>
            {record.arenaName && (
              <div>
                <dt>Арена</dt>
                <dd
                  data-testid={testId(
                    'profile',
                    'participation-history',
                    'text',
                    'arena',
                    record.eventId,
                  )}
                >
                  {record.arenaName}
                </dd>
              </div>
            )}
            {record.opponent && (
              <div>
                <dt>Соперник</dt>
                <dd
                  data-testid={testId(
                    'profile',
                    'participation-history',
                    'text',
                    'opponent',
                    record.eventId,
                  )}
                >
                  {record.opponent}
                </dd>
              </div>
            )}
            {record.result && (
              <div>
                <dt>Итог</dt>
                <dd
                  data-testid={testId(
                    'profile',
                    'participation-history',
                    'text',
                    'result',
                    record.eventId,
                  )}
                >
                  {record.result}
                </dd>
              </div>
            )}
          </dl>
          {record.note && (
            <Text
              color="secondary"
              data-testid={testId(
                'profile',
                'participation-history',
                'text',
                'note',
                record.eventId,
              )}
            >
              {record.note}
            </Text>
          )}
          <div
            className="profile-hub__history-actions"
            data-testid={testId(
              'profile',
              'participation-history',
              'panel',
              'actions',
              record.eventId,
            )}
          >
            <Link
              to={inviteHref}
              data-testid={testId(
                'profile',
                'participation-history',
                'link',
                'invite',
                record.eventId,
              )}
            >
              <HockeyButton
                view="outlined"
                size="s"
                data-testid={testId(
                  'profile',
                  'participation-history',
                  'btn',
                  'invite',
                  record.eventId,
                )}
              >
                {inviteLabel}
              </HockeyButton>
            </Link>
            {chatHref && (
              <Link
                to={chatHref}
                data-testid={testId(
                  'profile',
                  'participation-history',
                  'link',
                  'chat',
                  record.eventId,
                )}
              >
                <HockeyButton
                  view="action"
                  size="s"
                  data-testid={testId(
                    'profile',
                    'participation-history',
                    'btn',
                    'chat',
                    record.eventId,
                  )}
                >
                  Чат приглашения
                </HockeyButton>
              </Link>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

function ParticipationHistorySection({
  profile,
  showHistory,
}: {
  profile: HockeyProfile
  showHistory: boolean
}) {
  const history = profile.participationHistory ?? []
  if (!showHistory) {
    return (
      <Text
        color="secondary"
        data-testid={testId('profile', 'participation-history', 'text', 'hidden')}
      >
        История участия скрыта настройками приватности.
      </Text>
    )
  }
  if (history.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('profile', 'participation-history', 'empty')}>
        Пока нет подтверждённых участий в событиях.
      </Text>
    )
  }

  return (
    <ul
      className="profile-hub__history"
      data-testid={testId('profile', 'participation-history', 'list')}
    >
      {history.map((record) => (
        <ParticipationHistoryItem key={record.eventId} record={record} />
      ))}
    </ul>
  )
}

function ProfileAboutSection({
  profile,
  settings,
  userRoles,
  onSaveProfile,
  onStartVerification,
  isSaving,
  isVerifying,
}: {
  profile: HockeyProfile
  settings: ProfileSettings
  userRoles: UserRole[]
  onSaveProfile: (next: Partial<HockeyProfile>) => void
  onStartVerification: () => void
  isSaving: boolean
  isVerifying: boolean
}) {
  const [form, setForm] = useState<Partial<HockeyProfile>>(profile)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsPanelId = useId()

  /** @spec SPEC-FR-2.2.2 - Обновление поля профиля */
  function updateField<K extends keyof HockeyProfile>(key: K, value: HockeyProfile[K]) {
    setForm((prev) => ({...prev, [key]: value}))
  }

  /** @spec SPEC-FR-2.2.1 - Сохранение профиля */
  function handleSave() {
    onSaveProfile(form)
  }

  const isGoalieProfile = userRoles.includes('goalie') || profile.position === 'goalie'
  const showCollapsedHistory =
    userRoles.includes('player') ||
    userRoles.includes('goalie') ||
    userRoles.includes('captain') ||
    userRoles.includes('coach')

  return (
    <div className="hockey-stack hockey-stack--gap-16">
      <ProfileSummaryCard
        profile={profile}
        roles={userRoles}
        detailsOpen={detailsOpen}
        onToggleDetails={() => setDetailsOpen((prev) => !prev)}
        detailsPanelId={detailsPanelId}
      />

      {!detailsOpen && showCollapsedHistory && (
        <Card
          view="filled"
          data-testid={testId('profile', 'profile-about-section', 'card', 'history-preview')}
        >
          <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-8">
            <Text
              variant="subheader-2"
              data-testid={testId(
                'profile',
                'profile-about-section',
                'text',
                'history-preview-title',
              )}
            >
              История участия
            </Text>
            <ParticipationHistorySection
              profile={profile}
              showHistory={settings.privacy.showParticipationHistory}
            />
          </div>
        </Card>
      )}

      {!detailsOpen && (
        <Card
          view="filled"
          data-testid={testId('profile', 'profile-about-section', 'card', 'schedule-preview')}
        >
          <div className="hockey-panel hockey-panel--24">
            <CalendarScopePreview scope="me" title="Мой график" testIdPrefix="profile" />
          </div>
        </Card>
      )}

      {!detailsOpen && (
        <Text
          color="secondary"
          data-testid={testId('profile', 'profile-about-section', 'text', 'details-hint')}
        >
          Нажмите «Подробнее», чтобы открыть полную анкету Hockey ID и редактирование.
        </Text>
      )}

      {detailsOpen && (
        <div id={detailsPanelId}>
          <Card view="filled" data-testid={testId('profile', 'profile-about-section', 'card')}>
            <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
              <Text
                variant="header-2"
                data-testid={testId('profile', 'profile-about-section', 'text', 'title')}
              >
                Hockey ID · подробно
              </Text>

              {userRoles.includes('coach') && <CoachProfilePanel />}

              {isGoalieProfile && (
                <div
                  className="profile-hub__goalie-panel"
                  data-testid={testId('profile', 'profile-about-section', 'panel', 'goalie')}
                >
                  <Text
                    variant="subheader-2"
                    data-testid={testId('profile', 'profile-about-section', 'text', 'goalie-title')}
                  >
                    Профиль вратаря
                  </Text>
                  <Text
                    color="secondary"
                    data-testid={testId('profile', 'profile-about-section', 'text', 'goalie-hint')}
                  >
                    Приоритетные SOS-запросы и отдельная метрика надёжности выходов.
                  </Text>
                  {profile.goalieReliabilityScore != null && (
                    <div
                      className="profile-hub__goalie-score"
                      data-testid={testId(
                        'profile',
                        'profile-about-section',
                        'panel',
                        'goalie-score',
                      )}
                    >
                      <Text
                        color="secondary"
                        data-testid={testId(
                          'profile',
                          'profile-about-section',
                          'text',
                          'goalie-score-label',
                        )}
                      >
                        Надёжность выходов
                      </Text>
                      <Progress
                        value={profile.goalieReliabilityScore}
                        text={`${profile.goalieReliabilityScore}%`}
                        data-testid={testId(
                          'profile',
                          'profile-about-section',
                          'cell',
                          'goalie-score',
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              <div
                className="hockey-stack hockey-stack--gap-4"
                data-testid={testId('profile', 'profile-about-section', 'panel', 'karma')}
              >
                <KarmaHint testIdPrefix="profile" />
              </div>

              {profile.achievements && profile.achievements.length > 0 && (
                <div
                  className="hockey-stack hockey-stack--gap-4"
                  data-testid={testId('profile', 'profile-about-section', 'panel', 'achievements')}
                >
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'profile',
                      'profile-about-section',
                      'text',
                      'achievements-label',
                    )}
                  >
                    Микро-ачивки
                  </Text>
                  <ul
                    className="hockey-list hockey-list--chips"
                    data-testid={testId('profile', 'profile-about-section', 'list', 'achievements')}
                  >
                    {profile.achievements.map((ach) => (
                      <li
                        key={ach}
                        className="hockey-chip"
                        data-testid={testId(
                          'profile',
                          'profile-about-section',
                          'item',
                          'achievement',
                          ach,
                        )}
                      >
                        {ach}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <TextInput
                label="ФИО"
                value={form.fullName ?? ''}
                onUpdate={(v) => updateField('fullName', v)}
                data-testid={testId('profile', 'profile-about-section', 'field', 'full-name')}
              />
              <TextInput
                label="Город"
                value={form.city ?? ''}
                onUpdate={(v) => updateField('city', v)}
                data-testid={testId('profile', 'profile-about-section', 'field', 'city')}
              />

              <Select
                label="Амплуа"
                value={[form.position ?? 'forward']}
                onUpdate={(v) => updateField('position', v[0] as PlayerPosition)}
                options={POSITION_OPTIONS}
                data-testid={testId('profile', 'profile-about-section', 'select', 'position')}
              />

              <Select
                label="Уровень"
                value={[form.skillLevel ?? 'amateur']}
                onUpdate={(v) => updateField('skillLevel', v[0] as SkillLevel)}
                options={SKILL_OPTIONS}
                data-testid={testId('profile', 'profile-about-section', 'select', 'skill-level')}
              />

              <div data-testid={testId('profile', 'profile-about-section', 'field', 'bio')}>
                <Text
                  color="secondary"
                  data-testid={testId('profile', 'profile-about-section', 'text', 'bio-label')}
                >
                  О себе
                </Text>
                <TextArea
                  value={form.bio ?? ''}
                  onUpdate={(v) => updateField('bio', v)}
                  minRows={3}
                  data-testid={testId('profile', 'profile-about-section', 'field', 'bio-input')}
                />
              </div>

              <Text
                color="secondary"
                data-testid={testId('profile', 'profile-about-section', 'text', 'preferred-arenas')}
              >
                Предпочитаемые арены: {(form.preferredArenaIds ?? []).join(', ') || 'не выбраны'}
              </Text>

              <div
                className="hockey-stack hockey-stack--gap-8"
                data-testid={testId('profile', 'profile-about-section', 'panel', 'history')}
              >
                <Text
                  variant="subheader-2"
                  data-testid={testId('profile', 'profile-about-section', 'text', 'history-title')}
                >
                  История участия
                </Text>
                <ParticipationHistorySection
                  profile={profile}
                  showHistory={settings.privacy.showParticipationHistory}
                />
              </div>

              <div className="profile-hub__actions">
                <Button
                  view="outlined"
                  loading={isVerifying}
                  onClick={onStartVerification}
                  data-testid={testId('profile', 'profile-about-section', 'btn', 'verify')}
                >
                  Подтвердить профиль
                </Button>
                <Button
                  view="action"
                  loading={isSaving}
                  onClick={handleSave}
                  data-testid={testId('profile', 'profile-about-section', 'btn', 'save')}
                >
                  Сохранить профиль
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function ProfileSettingsSection({
  settings,
  onSave,
  isSaving,
}: {
  settings: ProfileSettings
  onSave: (next: ProfileSettings['notificationPreferences']) => void
  isSaving: boolean
}) {
  const [form, setForm] = useState(settings.notificationPreferences)

  function updateSwitch(key: keyof ProfileSettings['notificationPreferences'], checked: boolean) {
    setForm((prev) => ({...prev, [key]: checked}))
  }

  return (
    <Card view="filled" data-testid={testId('profile', 'profile-settings-section', 'card')}>
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text
          variant="header-1"
          data-testid={testId('profile', 'profile-settings-section', 'text', 'title')}
        >
          Настройки уведомлений
        </Text>
        <Text
          color="secondary"
          data-testid={testId('profile', 'profile-settings-section', 'text', 'hint')}
        >
          Push в MAX, email и in-app каналы управляются через свитчи.
        </Text>

        <label
          className="profile-hub__switch-row"
          data-testid={testId('profile', 'profile-settings-section', 'toggle', 'in-app')}
        >
          <span data-testid={testId('profile', 'profile-settings-section', 'text', 'in-app-label')}>
            In-app уведомления
          </span>
          <Switch
            checked={form.inApp}
            onUpdate={(v) => updateSwitch('inApp', v)}
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'in-app-switch')}
          />
        </label>
        <label
          className="profile-hub__switch-row"
          data-testid={testId('profile', 'profile-settings-section', 'toggle', 'email')}
        >
          <span data-testid={testId('profile', 'profile-settings-section', 'text', 'email-label')}>
            Email уведомления
          </span>
          <Switch
            checked={form.email}
            onUpdate={(v) => updateSwitch('email', v)}
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'email-switch')}
          />
        </label>
        <label
          className="profile-hub__switch-row"
          data-testid={testId('profile', 'profile-settings-section', 'toggle', 'push')}
        >
          <span data-testid={testId('profile', 'profile-settings-section', 'text', 'push-label')}>
            Push уведомления
          </span>
          <Switch
            checked={form.push}
            onUpdate={(v) => updateSwitch('push', v)}
            data-testid={testId('profile', 'profile-settings-section', 'toggle', 'push-switch')}
          />
        </label>
        <label
          className="profile-hub__switch-row"
          data-testid={testId('profile', 'profile-settings-section', 'toggle', 'max-messenger')}
        >
          <span
            data-testid={testId(
              'profile',
              'profile-settings-section',
              'text',
              'max-messenger-label',
            )}
          >
            Push в MAX
          </span>
          <Switch
            checked={form.maxMessenger}
            onUpdate={(v) => updateSwitch('maxMessenger', v)}
            data-testid={testId(
              'profile',
              'profile-settings-section',
              'toggle',
              'max-messenger-switch',
            )}
          />
        </label>
        <label
          className="profile-hub__switch-row"
          data-testid={testId('profile', 'profile-settings-section', 'toggle', 'team-events')}
        >
          <span
            data-testid={testId('profile', 'profile-settings-section', 'text', 'team-events-label')}
          >
            События команды
          </span>
          <Switch
            checked={form.teamEvents}
            onUpdate={(v) => updateSwitch('teamEvents', v)}
            data-testid={testId(
              'profile',
              'profile-settings-section',
              'toggle',
              'team-events-switch',
            )}
          />
        </label>
        <label
          className="profile-hub__switch-row"
          data-testid={testId('profile', 'profile-settings-section', 'toggle', 'goalkeeper-sos')}
        >
          <span
            data-testid={testId(
              'profile',
              'profile-settings-section',
              'text',
              'goalkeeper-sos-label',
            )}
          >
            Goalkeeper SOS
          </span>
          <Switch
            checked={form.goalkeeperSos}
            onUpdate={(v) => updateSwitch('goalkeeperSos', v)}
            data-testid={testId(
              'profile',
              'profile-settings-section',
              'toggle',
              'goalkeeper-sos-switch',
            )}
          />
        </label>
        <label
          className="profile-hub__switch-row"
          data-testid={testId('profile', 'profile-settings-section', 'toggle', 'event-reminders')}
        >
          <span
            data-testid={testId(
              'profile',
              'profile-settings-section',
              'text',
              'event-reminders-label',
            )}
          >
            Напоминания о событиях
          </span>
          <Switch
            checked={form.eventReminders}
            onUpdate={(v) => updateSwitch('eventReminders', v)}
            data-testid={testId(
              'profile',
              'profile-settings-section',
              'toggle',
              'event-reminders-switch',
            )}
          />
        </label>

        <Button
          view="action"
          loading={isSaving}
          onClick={() => onSave(form)}
          data-testid={testId('profile', 'profile-settings-section', 'btn', 'save')}
        >
          Сохранить настройки
        </Button>
      </div>
    </Card>
  )
}

function ProfilePrivacySection({
  settings,
  onSave,
  isSaving,
}: {
  settings: ProfileSettings
  onSave: (next: ProfileSettings['privacy']) => void
  isSaving: boolean
}) {
  const [form, setForm] = useState({
    ...settings.privacy,
    calendarVisibility: settings.privacy.calendarVisibility ?? 'public',
  })

  return (
    <Card view="filled" data-testid={testId('profile', 'profile-privacy-section', 'card')}>
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text
          variant="header-1"
          data-testid={testId('profile', 'profile-privacy-section', 'text', 'title')}
        >
          Приватность
        </Text>
        <Text
          color="secondary"
          data-testid={testId('profile', 'profile-privacy-section', 'text', 'hint')}
        >
          Управляй тем, кто видит твой профиль, контакты и историю участия.
        </Text>
        <Select
          label="Видимость профиля"
          value={[form.profileVisibility]}
          options={VISIBILITY_OPTIONS}
          onUpdate={(v) =>
            setForm((prev) => ({
              ...prev,
              profileVisibility: v[0] as ProfileSettings['privacy']['profileVisibility'],
            }))
          }
          data-testid={testId('profile', 'profile-privacy-section', 'select', 'profile-visibility')}
        />

        <label
          className="profile-hub__switch-row"
          data-testid={testId('profile', 'profile-privacy-section', 'toggle', 'show-contacts')}
        >
          <span
            data-testid={testId(
              'profile',
              'profile-privacy-section',
              'text',
              'show-contacts-label',
            )}
          >
            Показывать контакты
          </span>
          <Switch
            checked={form.showContacts}
            onUpdate={(v) => setForm((prev) => ({...prev, showContacts: v}))}
            data-testid={testId(
              'profile',
              'profile-privacy-section',
              'toggle',
              'show-contacts-switch',
            )}
          />
        </label>
        <label
          className="profile-hub__switch-row"
          data-testid={testId('profile', 'profile-privacy-section', 'toggle', 'show-history')}
        >
          <span
            data-testid={testId('profile', 'profile-privacy-section', 'text', 'show-history-label')}
          >
            Показывать историю участия
          </span>
          <Switch
            checked={form.showParticipationHistory}
            onUpdate={(v) => setForm((prev) => ({...prev, showParticipationHistory: v}))}
            data-testid={testId(
              'profile',
              'profile-privacy-section',
              'toggle',
              'show-history-switch',
            )}
          />
        </label>

        <Select
          label="Календарь на публичной странице"
          value={[form.calendarVisibility ?? 'public']}
          options={CALENDAR_VISIBILITY_OPTIONS}
          onUpdate={(v) =>
            setForm((prev) => ({
              ...prev,
              calendarVisibility: v[0] as ProfileSettings['privacy']['calendarVisibility'],
            }))
          }
          data-testid={testId(
            'profile',
            'profile-privacy-section',
            'select',
            'calendar-visibility',
          )}
        />

        <Button
          view="action"
          loading={isSaving}
          onClick={() => onSave(form)}
          data-testid={testId('profile', 'profile-privacy-section', 'btn', 'save')}
        >
          Сохранить приватность
        </Button>
      </div>
    </Card>
  )
}

function ProfileSubscriptionSection({
  settings,
  onSelectPlan,
  isSaving,
}: {
  settings: ProfileSettings
  onSelectPlan: (subscription: Partial<SubscriptionState>) => void
  isSaving: boolean
}) {
  const activePlan = settings.subscription.planId
  return (
    <Card view="filled" data-testid={testId('profile', 'profile-subscription-section', 'card')}>
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text
          variant="header-1"
          data-testid={testId('profile', 'profile-subscription-section', 'text', 'title')}
        >
          Модель подписки
        </Text>
        <Text
          color="secondary"
          data-testid={testId('profile', 'profile-subscription-section', 'text', 'hint')}
        >
          Phase 1 mock: тарифы без реальной оплаты.
        </Text>
        <div
          className="profile-hub__plans"
          data-testid={testId('profile', 'profile-subscription-section', 'list', 'plans')}
        >
          {SUBSCRIPTION_PLAN_OPTIONS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={`profile-hub__plan ${activePlan === plan.id ? 'is-active' : ''}`}
              onClick={() => onSelectPlan({planId: plan.id})}
              data-testid={testId(
                'profile',
                'profile-subscription-section',
                'btn',
                'plan',
                plan.id,
              )}
            >
              <Text
                variant="subheader-2"
                data-testid={testId(
                  'profile',
                  'profile-subscription-section',
                  'text',
                  'plan-name',
                  plan.id,
                )}
              >
                {plan.name}
              </Text>
              <Text
                color="secondary"
                data-testid={testId(
                  'profile',
                  'profile-subscription-section',
                  'text',
                  'plan-description',
                  plan.id,
                )}
              >
                {plan.description}
              </Text>
            </button>
          ))}
        </div>
        <Button
          view="action"
          loading={isSaving}
          onClick={() => onSelectPlan({status: 'mock'})}
          data-testid={testId('profile', 'profile-subscription-section', 'btn', 'save')}
        >
          Сохранить тариф
        </Button>
      </div>
    </Card>
  )
}

function HockeyProfileHub({
  profile,
  settings,
}: {
  profile: HockeyProfile
  settings: ProfileSettings
}) {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const sectionParam = searchParams.get('section')
  const activeSection: ProfileHubSection =
    sectionParam === 'favorites' ||
    sectionParam === 'settings' ||
    sectionParam === 'privacy' ||
    sectionParam === 'subscription'
      ? sectionParam
      : 'about'

  const selectSection = (value: ProfileHubSection) => {
    setSearchParams(value === 'about' ? {} : {section: value}, {replace: true})
  }

  const {data: session} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })
  const userRoles = session?.user.roles ?? []

  const saveProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile']})
    },
  })

  const verifyMutation = useMutation({
    mutationFn: startVerificationRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile']})
    },
  })

  const saveNotificationPrefsMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile-settings']})
    },
  })

  const savePrivacyMutation = useMutation({
    mutationFn: updatePrivacySettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile-settings']})
    },
  })

  const saveSubscriptionMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile-settings']})
    },
  })

  const sectionContent =
    activeSection === 'about' ? (
      <ProfileAboutSection
        profile={profile}
        settings={settings}
        userRoles={userRoles}
        onSaveProfile={(next) => saveProfileMutation.mutate(next)}
        onStartVerification={() => verifyMutation.mutate()}
        isSaving={saveProfileMutation.isPending}
        isVerifying={verifyMutation.isPending}
      />
    ) : activeSection === 'favorites' ? (
      <ProfileFavoritesSection />
    ) : activeSection === 'settings' ? (
      <ProfileSettingsSection
        settings={settings}
        onSave={(next) => saveNotificationPrefsMutation.mutate(next)}
        isSaving={saveNotificationPrefsMutation.isPending}
      />
    ) : activeSection === 'privacy' ? (
      <ProfilePrivacySection
        settings={settings}
        onSave={(next) => savePrivacyMutation.mutate(next)}
        isSaving={savePrivacyMutation.isPending}
      />
    ) : (
      <ProfileSubscriptionSection
        settings={settings}
        onSelectPlan={(next) => saveSubscriptionMutation.mutate(next)}
        isSaving={saveSubscriptionMutation.isPending}
      />
    )

  return (
    <div className="profile-hub" data-testid={testId('profile', 'profile-hub', 'page')}>
      <ProfileHubTabs section={activeSection} onSelect={selectSection} />
      <div
        className="profile-hub__panel"
        data-testid={testId('profile', 'profile-hub', 'panel', activeSection)}
      >
        {sectionContent}
      </div>
    </div>
  )
}

/**
 * @spec SPEC-FR-2.2.1 - Форма создания и редактирования Hockey ID
 * @spec SPEC-FR-2.2.4 - Отображение заполненности профиля
 * @spec SPEC-FR-18.1.1 - Профиль как личный кабинет
 */
export function HockeyProfileForm() {
  const queryClient = useQueryClient()
  const {data: session, isLoading: isSessionLoading} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })
  const partnerWorkspace = shouldUsePartnerWorkspace(session)

  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchMyProfile,
    enabled: Boolean(session) && !partnerWorkspace,
  })
  const {
    data: settings,
    isLoading: isSettingsLoading,
    isFetching: isSettingsFetching,
    isError: isSettingsError,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: fetchProfileSettings,
    enabled: Boolean(session) && !partnerWorkspace,
  })

  if (isSessionLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка"
        testIdPrefix="profile"
        data-testid={testId('profile', 'hockey-profile-form', 'loader', 'session')}
      />
    )
  }

  if (session && partnerWorkspace) {
    return <Navigate to={getPrimaryPartnerPath(session)} replace />
  }

  const profileBlocked = isProfileError && !profile && !isProfileFetching
  const settingsBlocked = isSettingsError && !settings && !isSettingsFetching

  if (profileBlocked || settingsBlocked) {
    const detail =
      (profileError instanceof Error && profileError.message) ||
      (settingsError instanceof Error && settingsError.message) ||
      null
    return (
      <IceCard padding="m" data-testid={testId('profile', 'hockey-profile-form', 'card', 'error')}>
        <div className="hockey-stack hockey-stack--gap-12">
          <Text data-testid={testId('profile', 'hockey-profile-form', 'text', 'error')}>
            Не удалось загрузить профиль. Обновите страницу или попробуйте позже.
          </Text>
          {detail && (
            <Text
              color="secondary"
              data-testid={testId('profile', 'hockey-profile-form', 'text', 'error-detail')}
            >
              {detail}
            </Text>
          )}
          <HockeyButton
            view="action"
            size="s"
            onClick={() => {
              void queryClient.resetQueries({queryKey: ['profile']})
              void queryClient.resetQueries({queryKey: ['profile-settings']})
              void refetchProfile()
              void refetchSettings()
            }}
            data-testid={testId('profile', 'hockey-profile-form', 'btn', 'retry')}
          >
            Повторить
          </HockeyButton>
        </div>
      </IceCard>
    )
  }

  if (
    isProfileLoading ||
    isSettingsLoading ||
    (!profile && isProfileFetching) ||
    (!settings && isSettingsFetching) ||
    !profile ||
    !settings
  ) {
    return (
      <ScoreboardLoader
        label="Загрузка профиля"
        testIdPrefix="profile"
        data-testid={testId('profile', 'hockey-profile-form', 'loader', 'profile')}
      />
    )
  }

  return <HockeyProfileHub key={profile.userId} profile={profile} settings={settings} />
}
