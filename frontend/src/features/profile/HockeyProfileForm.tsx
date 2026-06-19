/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.3, SPEC-FR-2.2.4
 * SPEC-FR-17.1.1, SPEC-FR-18.1.1, SPEC-FR-18.1.3, SPEC-FR-18.1.4, SPEC-FR-19.1.1
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Progress, Select, Switch, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {
  fetchMyProfile,
  fetchProfileSettings,
  startVerificationRequest,
  updateMyProfile,
  updateNotificationPreferences,
  updatePrivacySettings,
  updateSubscription,
} from '@/features/profile/api/profileApi'
import {fetchSession} from '@/features/auth/api/sessionApi'
import type {HockeyProfile, ProfileSettings, SubscriptionState} from '@/entities/profile/types'
import type {PlayerPosition, SkillLevel, UserRole} from '@/entities/common/types'
import {CoachProfilePanel} from '@/features/profile/CoachProfilePanel'
import {KarmaHint} from '@/features/karma/KarmaHint'
import {KarmaScore} from '@/features/karma/KarmaScore'

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

type ProfileHubSection = 'about' | 'settings' | 'privacy' | 'subscription'

function ProfileHubTabs({
  section,
  onSelect,
}: {
  section: ProfileHubSection
  onSelect: (value: ProfileHubSection) => void
}) {
  return (
    <div className="profile-hub__tabs">
      <Button view={section === 'about' ? 'action' : 'outlined'} onClick={() => onSelect('about')}>
        О человеке
      </Button>
      <Button
        view={section === 'settings' ? 'action' : 'outlined'}
        onClick={() => onSelect('settings')}
      >
        Настройки
      </Button>
      <Button
        view={section === 'privacy' ? 'action' : 'outlined'}
        onClick={() => onSelect('privacy')}
      >
        Приватность
      </Button>
      <Button
        view={section === 'subscription' ? 'action' : 'outlined'}
        onClick={() => onSelect('subscription')}
      >
        Подписка
      </Button>
    </div>
  )
}

const ROLE_LABELS: Record<UserRole, string> = {
  player: 'Игрок',
  goalie: 'Вратарь',
  captain: 'Капитан',
  organizer: 'Организатор',
  coach: 'Тренер',
  admin: 'Админ',
}

function ProfileRoleBadges({roles}: {roles: UserRole[]}) {
  if (roles.length === 0) return null
  return (
    <div className="profile-hub__role-badges">
      {roles.map((role) => (
        <span
          key={role}
          className={`profile-hub__role-badge ${
            role === 'goalie' ? 'is-goalie' : role === 'coach' ? 'is-coach' : ''
          }`}
        >
          {ROLE_LABELS[role]}
        </span>
      ))}
    </div>
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
      <Text color="secondary">
        История участия скрыта настройками приватности.
      </Text>
    )
  }
  if (history.length === 0) {
    return <Text color="secondary">Пока нет подтверждённых участий в событиях.</Text>
  }

  return (
    <ul className="profile-hub__history">
      {history.map((record) => (
        <li key={record.eventId} className="profile-hub__history-item">
          <div>
            <Text variant="subheader-2">{record.eventTitle}</Text>
            <Text color="secondary">
              {new Date(record.eventDate).toLocaleDateString('ru-RU')}
              {record.teamName ? ` · ${record.teamName}` : ''}
            </Text>
          </div>
          <span
            className={`profile-hub__history-status ${
              record.confirmed ? 'is-confirmed' : 'is-pending'
            }`}
          >
            {record.confirmed ? 'Подтверждено' : 'Ожидает'}
          </span>
        </li>
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

  /** @spec SPEC-FR-2.2.2 - Обновление поля профиля */
  function updateField<K extends keyof HockeyProfile>(key: K, value: HockeyProfile[K]) {
    setForm((prev) => ({...prev, [key]: value}))
  }

  /** @spec SPEC-FR-2.2.1 - Сохранение профиля */
  function handleSave() {
    onSaveProfile(form)
  }

  const verificationLabel =
    profile.verificationStatus === 'verified' ? 'Профиль подтвержден' :
    profile.verificationStatus === 'pending' ? 'Проверка в процессе' :
    profile.verificationStatus === 'rejected' ? 'Проверка отклонена' :
    'Профиль не подтвержден'

  const isGoalieProfile =
    userRoles.includes('goalie') || profile.position === 'goalie'

  return (
    <Card view="filled">
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <div className="profile-hub__title-row">
          <Text variant="header-1">Hockey ID</Text>
          <span
            className={`profile-hub__verified-badge ${
              profile.verificationStatus === 'verified' ? 'is-verified' : ''
            }`}
          >
            {profile.verificationStatus === 'verified' ? '✓' : '•'} {verificationLabel}
          </span>
        </div>

        <ProfileRoleBadges roles={userRoles} />

        {userRoles.includes('coach') && <CoachProfilePanel />}

        {isGoalieProfile && (
          <div className="profile-hub__goalie-panel">
            <Text variant="subheader-2">Профиль вратаря</Text>
            <Text color="secondary">
              Приоритетные SOS-запросы и отдельная метрика надёжности выходов.
            </Text>
            {profile.goalieReliabilityScore != null && (
              <div className="profile-hub__goalie-score">
                <Text color="secondary">Надёжность выходов</Text>
                <Progress
                  value={profile.goalieReliabilityScore}
                  text={`${profile.goalieReliabilityScore}%`}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <Text color="secondary">Заполненность профиля</Text>
          <Progress value={profile.profileCompleteness} text={`${profile.profileCompleteness}%`} />
        </div>

        <div className="hockey-stack hockey-stack--gap-4">
          <KarmaScore score={profile.karmaScore} size="m" />
          <KarmaHint />
        </div>

        {profile.achievements && profile.achievements.length > 0 && (
          <div className="hockey-stack hockey-stack--gap-4">
            <Text color="secondary">Микро-ачивки</Text>
            <ul className="hockey-list hockey-list--chips">
              {profile.achievements.map((ach) => (
                <li key={ach} className="hockey-chip">
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
        />
        <TextInput
          label="Город"
          value={form.city ?? ''}
          onUpdate={(v) => updateField('city', v)}
        />
        <TextInput
          label="Район"
          value={form.district ?? ''}
          onUpdate={(v) => updateField('district', v)}
        />
        <TextInput
          label="Метро"
          value={form.metro ?? ''}
          onUpdate={(v) => updateField('metro', v)}
        />

        <Select
          label="Амплуа"
          value={[form.position ?? 'forward']}
          onUpdate={(v) => updateField('position', v[0] as PlayerPosition)}
          options={POSITION_OPTIONS}
        />

        <Select
          label="Уровень"
          value={[form.skillLevel ?? 'amateur']}
          onUpdate={(v) => updateField('skillLevel', v[0] as SkillLevel)}
          options={SKILL_OPTIONS}
        />

        <div>
          <Text color="secondary">О себе</Text>
          <TextArea
            value={form.bio ?? ''}
            onUpdate={(v) => updateField('bio', v)}
            minRows={3}
          />
        </div>

        <Text color="secondary">
          Предпочитаемые арены: {(form.preferredArenaIds ?? []).join(', ') || 'не выбраны'}
        </Text>

        <div className="hockey-stack hockey-stack--gap-8">
          <Text variant="subheader-2">История участия</Text>
          <ParticipationHistorySection
            profile={profile}
            showHistory={settings.privacy.showParticipationHistory}
          />
        </div>

        <div className="profile-hub__actions">
          <Button view="outlined" loading={isVerifying} onClick={onStartVerification}>
            Подтвердить профиль
          </Button>
          <Button view="action" loading={isSaving} onClick={handleSave}>
            Сохранить профиль
          </Button>
        </div>
      </div>
    </Card>
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

  function updateSwitch(
    key: keyof ProfileSettings['notificationPreferences'],
    checked: boolean,
  ) {
    setForm((prev) => ({...prev, [key]: checked}))
  }

  return (
    <Card view="filled">
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text variant="header-1">Настройки уведомлений</Text>
        <Text color="secondary">Push в MAX, email и in-app каналы управляются через свитчи.</Text>

        <label className="profile-hub__switch-row">
          <span>In-app уведомления</span>
          <Switch checked={form.inApp} onUpdate={(v) => updateSwitch('inApp', v)} />
        </label>
        <label className="profile-hub__switch-row">
          <span>Email уведомления</span>
          <Switch checked={form.email} onUpdate={(v) => updateSwitch('email', v)} />
        </label>
        <label className="profile-hub__switch-row">
          <span>Push уведомления</span>
          <Switch checked={form.push} onUpdate={(v) => updateSwitch('push', v)} />
        </label>
        <label className="profile-hub__switch-row">
          <span>Push в MAX</span>
          <Switch checked={form.maxMessenger} onUpdate={(v) => updateSwitch('maxMessenger', v)} />
        </label>
        <label className="profile-hub__switch-row">
          <span>События команды</span>
          <Switch checked={form.teamEvents} onUpdate={(v) => updateSwitch('teamEvents', v)} />
        </label>
        <label className="profile-hub__switch-row">
          <span>Goalkeeper SOS</span>
          <Switch checked={form.goalkeeperSos} onUpdate={(v) => updateSwitch('goalkeeperSos', v)} />
        </label>
        <label className="profile-hub__switch-row">
          <span>Напоминания о событиях</span>
          <Switch checked={form.eventReminders} onUpdate={(v) => updateSwitch('eventReminders', v)} />
        </label>

        <Button view="action" loading={isSaving} onClick={() => onSave(form)}>
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
  const [form, setForm] = useState(settings.privacy)

  return (
    <Card view="filled">
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text variant="header-1">Приватность</Text>
        <Text color="secondary">
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
        />

        <label className="profile-hub__switch-row">
          <span>Показывать контакты</span>
          <Switch
            checked={form.showContacts}
            onUpdate={(v) => setForm((prev) => ({...prev, showContacts: v}))}
          />
        </label>
        <label className="profile-hub__switch-row">
          <span>Показывать историю участия</span>
          <Switch
            checked={form.showParticipationHistory}
            onUpdate={(v) => setForm((prev) => ({...prev, showParticipationHistory: v}))}
          />
        </label>

        <Button view="action" loading={isSaving} onClick={() => onSave(form)}>
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
    <Card view="filled">
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text variant="header-1">Модель подписки</Text>
        <Text color="secondary">Phase 1 mock: тарифы без реальной оплаты.</Text>
        <div className="profile-hub__plans">
          {SUBSCRIPTION_PLAN_OPTIONS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={`profile-hub__plan ${activePlan === plan.id ? 'is-active' : ''}`}
              onClick={() => onSelectPlan({planId: plan.id})}
            >
              <Text variant="subheader-2">{plan.name}</Text>
              <Text color="secondary">{plan.description}</Text>
            </button>
          ))}
        </div>
        <Button view="action" loading={isSaving} onClick={() => onSelectPlan({status: 'mock'})}>
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
  const [activeSection, setActiveSection] = useState<ProfileHubSection>('about')

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
    <div className="profile-hub">
      <ProfileHubTabs section={activeSection} onSelect={setActiveSection} />
      <div className="profile-hub__panel">{sectionContent}</div>
    </div>
  )
}

/**
 * @spec SPEC-FR-2.2.1 - Форма создания и редактирования Hockey ID
 * @spec SPEC-FR-2.2.4 - Отображение заполненности профиля
 * @spec SPEC-FR-18.1.1 - Профиль как личный кабинет
 */
export function HockeyProfileForm() {
  const {data: profile, isLoading: isProfileLoading} = useQuery({
    queryKey: ['profile'],
    queryFn: fetchMyProfile,
  })
  const {data: settings, isLoading: isSettingsLoading} = useQuery({
    queryKey: ['profile-settings'],
    queryFn: fetchProfileSettings,
  })

  if (isProfileLoading || isSettingsLoading || !profile || !settings) {
    return <Text>Загрузка профиля...</Text>
  }

  return <HockeyProfileHub key={profile.userId} profile={profile} settings={settings} />
}
