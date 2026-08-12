/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.3, SPEC-FR-2.2.4
 * SPEC-FR-17.1.1, SPEC-FR-18.1.1, SPEC-FR-18.1.3, SPEC-FR-18.1.4, SPEC-FR-19.1.1
 */

import {
  Checkbox,
  Dialog,
  Progress,
  Select,
  Switch,
  Text,
  TextArea,
  TextInput,
} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useId, useState} from 'react'
import {Link, Navigate, useSearchParams} from 'react-router'

import type {PlayerPosition, SkillLevel, UserRole} from '@/entities/common'
import type {
  HockeyProfile,
  PrivacyAudience,
  ProfileContacts,
  ProfileFieldPrivacy,
  ProfileSettings,
  SubscriptionState,
} from '@/entities/profile'
import {
  CONTACT_FIELD_PRIVACY_KEYS,
  fetchMyProfile,
  fetchProfileSettings,
  FIELD_PRIVACY_LABELS,
  FIELD_PRIVACY_OPTIONS,
  normalizePrivacySettings,
  PROFILE_FIELD_PRIVACY_KEYS,
  startVerificationRequest,
  toPlayerListItem,
  updateMyProfile,
  updateNotificationPreferences,
  updatePrivacySettings,
  updateSubscription,
} from '@/entities/profile'
import {getPrimaryPartnerPath, shouldUsePartnerWorkspace, useSessionAccess} from '@/features/access'
import {CalendarShell} from '@/features/calendar'
import {ProfileFavoritesSection} from '@/features/favorites'
import {KarmaHint} from '@/features/karma'
import {PlayerPublicInfoSection} from '@/features/players'
import {
  CoachProfilePanel,
  ParticipationHistorySection,
  ProfileAvatarEditor,
} from '@/features/profile'
import {
  clampPlayerIndex,
  PLAYER_INDEX_LEVELS,
  playerIndexFromSkillLevel,
  skillLevelFromPlayerIndex,
} from '@/shared/lib/profileIdentity'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {PlayerCard} from '@/widgets/PlayerCard'

const POSITION_OPTIONS = [
  {value: 'forward', content: 'Нападающий'},
  {value: 'defense', content: 'Защитник'},
  {value: 'goalie', content: 'Вратарь'},
]

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'novice_theorist', content: 'Начинающий теоретик'},
  {value: 'theorist', content: 'Теоретик'},
  {value: 'confident_theorist', content: 'Уверенный теоретик'},
  {value: 'practitioner', content: 'Практик'},
  {value: 'master', content: 'Мастер'},
]

const PLAYER_INDEX_OPTIONS = PLAYER_INDEX_LEVELS.map((item) => ({
  value: String(item.index),
  content: `${item.index} — ${item.label}`,
}))

const STICK_HAND_OPTIONS = [
  {value: 'left', content: 'Левый'},
  {value: 'right', content: 'Правый'},
  {value: 'unknown', content: '—'},
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

type ProfileHubSection = 'about' | 'favorites' | 'settings' | 'subscription'

const PROFILE_HUB_SECTIONS: ProfileHubSection[] = ['about', 'favorites', 'settings', 'subscription']

function isProfileHubSection(value: string | null): value is ProfileHubSection {
  return Boolean(value && PROFILE_HUB_SECTIONS.includes(value as ProfileHubSection))
}

function resolveProfileHubSection(value: string | null): ProfileHubSection {
  if (value === 'privacy') return 'settings'
  return isProfileHubSection(value) ? value : 'about'
}

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
      <HockeyButton
        view={section === 'about' ? 'action' : 'outlined'}
        onClick={() => onSelect('about')}
        data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'about')}
      >
        О себе
      </HockeyButton>
      <HockeyButton
        view={section === 'favorites' ? 'action' : 'outlined'}
        onClick={() => onSelect('favorites')}
        data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'favorites')}
      >
        Избранное
      </HockeyButton>
      <HockeyButton
        view={section === 'settings' ? 'action' : 'outlined'}
        onClick={() => onSelect('settings')}
        data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'settings')}
      >
        Настройки
      </HockeyButton>
      <HockeyButton
        view={section === 'subscription' ? 'action' : 'outlined'}
        onClick={() => onSelect('subscription')}
        data-testid={testId('profile', 'profile-hub-tabs', 'tab', 'subscription')}
      >
        Подписка
      </HockeyButton>
    </div>
  )
}

function ProfileAboutSection({
  profile,
  settings,
  userRoles,
  onSaveProfile,
  onStartVerification,
  onCloseEdit,
  isSaving,
  isVerifying,
  detailsOpen,
  detailsPanelId,
}: {
  profile: HockeyProfile
  settings: ProfileSettings
  userRoles: UserRole[]
  onSaveProfile: (next: Partial<HockeyProfile>) => Promise<void>
  onStartVerification: () => void
  onCloseEdit: () => void
  isSaving: boolean
  isVerifying: boolean
  detailsOpen: boolean
  detailsPanelId: string
}) {
  const [form, setForm] = useState<Partial<HockeyProfile>>(profile)
  const [editSessionOpen, setEditSessionOpen] = useState(detailsOpen)

  if (detailsOpen !== editSessionOpen) {
    setEditSessionOpen(detailsOpen)
    if (detailsOpen) {
      setForm(profile)
    }
  }

  /** Пока диалог открыт — карточки показывают черновик */
  const previewProfile: HockeyProfile = detailsOpen ? {...profile, ...form} : profile
  const player = toPlayerListItem(previewProfile)

  /** @spec SPEC-FR-2.2.2 - Обновление поля профиля */
  function updateField<K extends keyof HockeyProfile>(key: K, value: HockeyProfile[K]) {
    setForm((prev) => ({...prev, [key]: value}))
  }

  function handleClose() {
    setForm(profile)
    onCloseEdit()
  }

  const isGoalieProfile = userRoles.includes('goalie') || profile.position === 'goalie'
  const showHistorySection =
    userRoles.includes('player') ||
    userRoles.includes('goalie') ||
    userRoles.includes('captain') ||
    userRoles.includes('coach')
  const privacy = normalizePrivacySettings(settings.privacy)
  const canEditContacts = privacy.personalDataProcessingConsent
  const ownerContacts = previewProfile.contacts

  function updateContact(key: keyof ProfileContacts, value: string) {
    setForm((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        [key]: value.trim() === '' ? undefined : value,
      },
    }))
  }

  /** @spec SPEC-FR-2.2.1 - Сохранение профиля */
  async function handleSave() {
    const next: Partial<HockeyProfile> = {...form}
    if (next.playerIndex != null && !Number.isNaN(Number(next.playerIndex))) {
      next.playerIndex = clampPlayerIndex(Number(next.playerIndex))
      next.skillLevel = skillLevelFromPlayerIndex(next.playerIndex)
    } else if (next.skillLevel) {
      next.playerIndex = playerIndexFromSkillLevel(next.skillLevel)
      next.skillLevel = skillLevelFromPlayerIndex(next.playerIndex)
    }
    if (next.heightCm != null && !Number.isNaN(Number(next.heightCm))) {
      next.heightCm = Math.round(Number(next.heightCm))
    }
    if (next.weightKg != null && !Number.isNaN(Number(next.weightKg))) {
      next.weightKg = Math.round(Number(next.weightKg))
    }
    if (typeof next.fullName === 'string') {
      next.fullName = next.fullName.trim()
    }
    if (typeof next.city === 'string') {
      next.city = next.city.trim()
    }
    if (typeof next.bio === 'string') {
      next.bio = next.bio.trim()
    }
    /** Пустая строка — сброс аватарки (JSON не передаёт undefined) */
    next.avatarUrl = form.avatarUrl?.trim() ? form.avatarUrl.trim() : ''
    if (canEditContacts && next.contacts) {
      const contacts: ProfileContacts = {}
      if (next.contacts.phone?.trim()) contacts.phone = next.contacts.phone.trim()
      if (next.contacts.email?.trim()) contacts.email = next.contacts.email.trim()
      if (next.contacts.telegram?.trim()) contacts.telegram = next.contacts.telegram.trim()
      if (next.contacts.maxMessenger?.trim()) {
        contacts.maxMessenger = next.contacts.maxMessenger.trim()
      }
      next.contacts = Object.keys(contacts).length > 0 ? contacts : undefined
    } else if (!canEditContacts) {
      next.contacts = profile.contacts
    }
    await onSaveProfile(next)
  }

  return (
    <div className="hockey-stack hockey-stack--gap-16 player-profile-layout">
      <div
        className="player-profile-layout__grid"
        data-testid={testId('profile', 'profile-about-section', 'panel', 'grid')}
      >
        <PlayerCard player={player} linkable={false} showFavorite={false} variant="profile" />
        <PlayerPublicInfoSection
          player={player}
          contactsVisible={Boolean(ownerContacts)}
          visibleContacts={ownerContacts}
          participationHistoryVisible
          hideHistory
        />
      </div>

      <Dialog
        open={detailsOpen}
        onClose={handleClose}
        maxWidth="l"
        fullWidth
        className="profile-hub__edit-dialog"
        modalClassName="profile-hub__edit-dialog-modal"
        contentOverflow="auto"
        data-testid={testId('profile', 'profile-about-section', 'card')}
      >
        <Dialog.Header
          caption="Редактирование профиля"
          data-testid={testId('profile', 'profile-about-section', 'text', 'title')}
        />
        <Dialog.Body>
          <div
            id={detailsPanelId}
            className="hockey-stack hockey-stack--gap-16 profile-hub__edit-dialog-body"
          >
            <div className="profile-hub__edit-section">
              <p className="profile-hub__edit-section-title">Аватар</p>
              <ProfileAvatarEditor
                avatarUrl={form.avatarUrl}
                displayName={form.fullName || profile.fullName}
                onChange={(next) => updateField('avatarUrl', next || undefined)}
              />
            </div>

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

            <div className="profile-hub__edit-section">
              <p className="profile-hub__edit-section-title">Личные</p>
              <div className="profile-hub__edit-grid">
                <TextInput
                  label="ФИО"
                  value={form.fullName ?? ''}
                  onUpdate={(v) => updateField('fullName', v)}
                  data-testid={testId('profile', 'profile-about-section', 'field', 'full-name')}
                />
                <div className="hockey-stack hockey-stack--gap-4">
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'profile',
                      'profile-about-section',
                      'text',
                      'birth-date-label',
                    )}
                  >
                    Дата рождения
                  </Text>
                  <input
                    type="date"
                    className="g-text-input__control"
                    value={form.birthDate ?? ''}
                    onChange={(event) => updateField('birthDate', event.target.value || undefined)}
                    data-testid={testId('profile', 'profile-about-section', 'field', 'birth-date')}
                  />
                </div>
                <TextInput
                  label="Город"
                  value={form.city ?? ''}
                  onUpdate={(v) => updateField('city', v)}
                  data-testid={testId('profile', 'profile-about-section', 'field', 'city')}
                />
                <TextInput
                  label="Рост, см"
                  type="number"
                  value={form.heightCm != null ? String(form.heightCm) : ''}
                  onUpdate={(v) => {
                    if (v === '' || Number.isNaN(Number(v))) {
                      updateField('heightCm', undefined)
                      return
                    }
                    updateField('heightCm', Math.round(Number(v)))
                  }}
                  data-testid={testId('profile', 'profile-about-section', 'field', 'height')}
                />
                <TextInput
                  label="Вес, кг"
                  type="number"
                  value={form.weightKg != null ? String(form.weightKg) : ''}
                  onUpdate={(v) => {
                    if (v === '' || Number.isNaN(Number(v))) {
                      updateField('weightKg', undefined)
                      return
                    }
                    updateField('weightKg', Math.round(Number(v)))
                  }}
                  data-testid={testId('profile', 'profile-about-section', 'field', 'weight')}
                />
              </div>
            </div>

            <div className="profile-hub__edit-section">
              <p className="profile-hub__edit-section-title">Игровые</p>
              <div className="profile-hub__edit-grid">
                <Select
                  label="Амплуа"
                  value={[form.position ?? 'forward']}
                  onUpdate={(v) => updateField('position', v[0] as PlayerPosition)}
                  options={POSITION_OPTIONS}
                  data-testid={testId('profile', 'profile-about-section', 'select', 'position')}
                />
                <Select
                  label="Уровень"
                  value={[
                    form.skillLevel &&
                    SKILL_OPTIONS.some((option) => option.value === form.skillLevel)
                      ? form.skillLevel
                      : skillLevelFromPlayerIndex(form.playerIndex ?? 4),
                  ]}
                  onUpdate={(v) => {
                    const skillLevel = v[0] as SkillLevel
                    setForm((prev) => ({
                      ...prev,
                      skillLevel,
                      playerIndex: playerIndexFromSkillLevel(skillLevel),
                    }))
                  }}
                  options={SKILL_OPTIONS}
                  data-testid={testId('profile', 'profile-about-section', 'select', 'skill-level')}
                />
                <Select
                  label="Хват"
                  value={[form.stickHand ?? 'unknown']}
                  onUpdate={(v) =>
                    updateField('stickHand', (v[0] as HockeyProfile['stickHand']) ?? 'unknown')
                  }
                  options={STICK_HAND_OPTIONS}
                  data-testid={testId('profile', 'profile-about-section', 'select', 'stick-hand')}
                />
                <Select
                  label="Индекс"
                  value={
                    form.playerIndex != null
                      ? [String(clampPlayerIndex(form.playerIndex))]
                      : [String(playerIndexFromSkillLevel(form.skillLevel ?? 'amateur'))]
                  }
                  onUpdate={(v) => {
                    if (!v[0]) {
                      updateField('playerIndex', undefined)
                      return
                    }
                    const playerIndex = clampPlayerIndex(Number(v[0]))
                    setForm((prev) => ({
                      ...prev,
                      playerIndex,
                      skillLevel: skillLevelFromPlayerIndex(playerIndex),
                    }))
                  }}
                  options={PLAYER_INDEX_OPTIONS}
                  data-testid={testId('profile', 'profile-about-section', 'select', 'index')}
                />
              </div>
            </div>

            <div className="profile-hub__edit-section">
              <p className="profile-hub__edit-section-title">Публичная информация</p>
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
            </div>

            <div className="profile-hub__edit-section">
              <p className="profile-hub__edit-section-title">Личные контакты</p>
              {canEditContacts ? (
                <div className="profile-hub__edit-grid">
                  <TextInput
                    label="Телефон"
                    type="tel"
                    value={form.contacts?.phone ?? ''}
                    onUpdate={(v) => updateContact('phone', v)}
                    data-testid={testId('profile', 'profile-about-section', 'field', 'phone')}
                  />
                  <TextInput
                    label="Email"
                    type="email"
                    value={form.contacts?.email ?? ''}
                    onUpdate={(v) => updateContact('email', v)}
                    data-testid={testId('profile', 'profile-about-section', 'field', 'email')}
                  />
                  <TextInput
                    label="Telegram"
                    value={form.contacts?.telegram ?? ''}
                    onUpdate={(v) => updateContact('telegram', v)}
                    data-testid={testId('profile', 'profile-about-section', 'field', 'telegram')}
                  />
                  <TextInput
                    label="MAX"
                    value={form.contacts?.maxMessenger ?? ''}
                    onUpdate={(v) => updateContact('maxMessenger', v)}
                    data-testid={testId('profile', 'profile-about-section', 'field', 'max')}
                  />
                </div>
              ) : (
                <Text
                  color="secondary"
                  data-testid={testId(
                    'profile',
                    'profile-about-section',
                    'text',
                    'contacts-consent',
                  )}
                >
                  Чтобы хранить и показывать контакты, дайте согласие на обработку персональных
                  данных в «Настройки» (ст. 9 152-ФЗ).
                </Text>
              )}
              <Text
                color="secondary"
                className="hockey-mt-8"
                data-testid={testId('profile', 'profile-about-section', 'text', 'contacts-hint')}
              >
                Видимость каждого контакта настраивается отдельно в «Настройки».
              </Text>
            </div>
          </div>
        </Dialog.Body>
        <Dialog.Footer data-testid={testId('profile', 'profile-about-section', 'footer')}>
          <HockeyButton
            view="outlined"
            loading={isVerifying}
            onClick={onStartVerification}
            data-testid={testId('profile', 'profile-about-section', 'btn', 'verify')}
          >
            Подтвердить профиль
          </HockeyButton>
          <HockeyButton
            view="outlined"
            onClick={handleClose}
            data-testid={testId('profile', 'profile-about-section', 'btn', 'cancel')}
          >
            Отмена
          </HockeyButton>
          <HockeyButton
            view="action"
            loading={isSaving}
            onClick={() => {
              void handleSave()
            }}
            data-testid={testId('profile', 'profile-about-section', 'btn', 'save')}
          >
            Сохранить
          </HockeyButton>
        </Dialog.Footer>
      </Dialog>

      <section
        id="calendar"
        className="player-profile-layout__full"
        data-testid={testId('profile', 'profile-about-section', 'section', 'calendar')}
      >
        <IceCard
          padding="m"
          data-testid={testId('profile', 'profile-about-section', 'card', 'calendar')}
        >
          <CalendarShell
            title="Мой календарь"
            compact
            titleVariant="header-1"
            forcedScope={{scope: 'player', scopeId: profile.userId}}
            showActions={false}
          />
        </IceCard>
      </section>

      {showHistorySection && (
        <IceCard
          padding="m"
          data-testid={testId('profile', 'profile-about-section', 'card', 'history')}
        >
          <div className="hockey-stack hockey-stack--gap-16">
            <Text
              variant="header-1"
              data-testid={testId('profile', 'profile-about-section', 'text', 'history-title')}
            >
              История участия
            </Text>
            <ParticipationHistorySection records={profile.participationHistory} showHistory />
          </div>
        </IceCard>
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
    <IceCard padding="m" data-testid={testId('profile', 'profile-settings-section', 'card')}>
      <div className="hockey-stack hockey-stack--gap-16">
        <Text
          variant="header-1"
          data-testid={testId('profile', 'profile-settings-section', 'text', 'title')}
        >
          Настройки уведомлений
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

        <HockeyButton
          view="action"
          className="profile-hub__save-btn"
          loading={isSaving}
          onClick={() => onSave(form)}
          data-testid={testId('profile', 'profile-settings-section', 'btn', 'save')}
        >
          Сохранить
        </HockeyButton>
      </div>
    </IceCard>
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
  const [form, setForm] = useState(() => normalizePrivacySettings(settings.privacy))
  const [privacySource, setPrivacySource] = useState(settings.privacy)

  if (settings.privacy !== privacySource) {
    setPrivacySource(settings.privacy)
    setForm(normalizePrivacySettings(settings.privacy))
  }

  function updateFieldAudience(key: keyof ProfileFieldPrivacy, value: PrivacyAudience) {
    setForm((prev) =>
      normalizePrivacySettings({
        ...prev,
        fields: {...prev.fields, [key]: value},
      }),
    )
  }

  function handleConsent(checked: boolean) {
    setForm((prev) =>
      normalizePrivacySettings({
        ...prev,
        personalDataProcessingConsent: checked,
        personalDataConsentAt: checked
          ? (prev.personalDataConsentAt ?? new Date().toISOString())
          : undefined,
        fields: checked
          ? prev.fields
          : {
              ...prev.fields,
              phone: 'private',
              email: 'private',
              telegram: 'private',
              maxMessenger: 'private',
            },
      }),
    )
  }

  return (
    <IceCard padding="m" data-testid={testId('profile', 'profile-privacy-section', 'card')}>
      <div className="hockey-stack hockey-stack--gap-16">
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
          Управляй видимостью профиля и отдельных полей. Контакты — персональные данные: хранение и
          показ возможны только с согласия (152-ФЗ).
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

        <div
          className="profile-hub__consent"
          data-testid={testId('profile', 'profile-privacy-section', 'panel', 'consent')}
        >
          <Checkbox
            checked={form.personalDataProcessingConsent}
            onUpdate={handleConsent}
            content={
              <span
                data-testid={testId('profile', 'profile-privacy-section', 'text', 'consent-label')}
              >
                Согласие на обработку персональных данных для хранения и выборочного отображения
                контактов (ст. 9 Федерального закона № 152-ФЗ «О персональных данных»)
              </span>
            }
            data-testid={testId('profile', 'profile-privacy-section', 'checkbox', 'pdn-consent')}
          />
          <Text
            color="secondary"
            data-testid={testId('profile', 'profile-privacy-section', 'text', 'consent-hint')}
          >
            Без согласия контакты недоступны для редактирования и скрыты от других пользователей. Вы
            можете отозвать согласие в любой момент — контакты снова станут только вашими.
          </Text>
        </div>

        <div
          className="profile-hub__privacy-group"
          data-testid={testId('profile', 'profile-privacy-section', 'panel', 'fields')}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('profile', 'profile-privacy-section', 'text', 'fields-title')}
          >
            Поля профиля
          </Text>
          <div className="profile-hub__privacy-fields">
            {PROFILE_FIELD_PRIVACY_KEYS.map((key) => (
              <div
                key={key}
                className="profile-hub__privacy-field"
                data-testid={testId('profile', 'profile-privacy-section', 'panel', `field-${key}`)}
              >
                <span
                  className="profile-hub__privacy-field-label"
                  data-testid={testId(
                    'profile',
                    'profile-privacy-section',
                    'text',
                    `field-${key}-label`,
                  )}
                >
                  {FIELD_PRIVACY_LABELS[key]}
                </span>
                <Select
                  value={[form.fields[key]]}
                  options={FIELD_PRIVACY_OPTIONS}
                  onUpdate={(v) => updateFieldAudience(key, v[0] as PrivacyAudience)}
                  data-testid={testId(
                    'profile',
                    'profile-privacy-section',
                    'select',
                    `field-${key}`,
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="profile-hub__privacy-group"
          data-testid={testId('profile', 'profile-privacy-section', 'panel', 'contacts')}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('profile', 'profile-privacy-section', 'text', 'contacts-title')}
          >
            Личные контакты
          </Text>
          <Text
            color="secondary"
            data-testid={testId('profile', 'profile-privacy-section', 'text', 'contacts-hint')}
          >
            Значения контактов задаются в редактировании профиля. Здесь — кому их показывать.
          </Text>
          <div className="profile-hub__privacy-fields">
            {CONTACT_FIELD_PRIVACY_KEYS.map((key) => (
              <div
                key={key}
                className="profile-hub__privacy-field"
                data-testid={testId(
                  'profile',
                  'profile-privacy-section',
                  'panel',
                  `contact-${key}`,
                )}
              >
                <span
                  className="profile-hub__privacy-field-label"
                  data-testid={testId(
                    'profile',
                    'profile-privacy-section',
                    'text',
                    `contact-${key}-label`,
                  )}
                >
                  {FIELD_PRIVACY_LABELS[key]}
                </span>
                <Select
                  value={[form.fields[key]]}
                  options={FIELD_PRIVACY_OPTIONS}
                  disabled={!form.personalDataProcessingConsent}
                  onUpdate={(v) => updateFieldAudience(key, v[0] as PrivacyAudience)}
                  data-testid={testId(
                    'profile',
                    'profile-privacy-section',
                    'select',
                    `contact-${key}`,
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <HockeyButton
          view="action"
          className="profile-hub__save-btn"
          loading={isSaving}
          onClick={() => onSave(normalizePrivacySettings(form))}
          data-testid={testId('profile', 'profile-privacy-section', 'btn', 'save')}
        >
          Сохранить
        </HockeyButton>
      </div>
    </IceCard>
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
    <IceCard padding="m" data-testid={testId('profile', 'profile-subscription-section', 'card')}>
      <div className="hockey-stack hockey-stack--gap-16">
        <Text
          variant="header-1"
          data-testid={testId('profile', 'profile-subscription-section', 'text', 'title')}
        >
          Модель подписки
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
        <HockeyButton
          view="action"
          className="profile-hub__save-btn"
          loading={isSaving}
          onClick={() => onSelectPlan({status: 'mock'})}
          data-testid={testId('profile', 'profile-subscription-section', 'btn', 'save')}
        >
          Сохранить
        </HockeyButton>
      </div>
    </IceCard>
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
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsPanelId = useId()
  const sectionParam = searchParams.get('section')
  const activeSection = resolveProfileHubSection(sectionParam)

  const selectSection = (value: ProfileHubSection) => {
    setSearchParams(value === 'about' ? {} : {section: value}, {replace: true})
    if (value !== 'about') setDetailsOpen(false)
  }

  const {session} = useSessionAccess()
  const userRoles = session?.user.roles ?? []

  const saveProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
      void queryClient.invalidateQueries({queryKey: ['profile']})
      void queryClient.invalidateQueries({queryKey: ['players']})
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

  if (sectionParam === 'privacy') {
    return <Navigate to="?section=settings" replace />
  }

  const sectionContent =
    activeSection === 'about' ? (
      <ProfileAboutSection
        profile={profile}
        settings={settings}
        userRoles={userRoles}
        onSaveProfile={async (next) => {
          await saveProfileMutation.mutateAsync(next)
          setDetailsOpen(false)
        }}
        onStartVerification={() => verifyMutation.mutate()}
        onCloseEdit={() => setDetailsOpen(false)}
        isSaving={saveProfileMutation.isPending}
        isVerifying={verifyMutation.isPending}
        detailsOpen={detailsOpen}
        detailsPanelId={detailsPanelId}
      />
    ) : activeSection === 'favorites' ? (
      <ProfileFavoritesSection />
    ) : activeSection === 'settings' ? (
      <div
        className="hockey-stack hockey-stack--gap-16"
        data-testid={testId('profile', 'profile-settings-section', 'panel', 'stack')}
      >
        <ProfileSettingsSection
          settings={settings}
          onSave={(next) => saveNotificationPrefsMutation.mutate(next)}
          isSaving={saveNotificationPrefsMutation.isPending}
        />
        <ProfilePrivacySection
          settings={settings}
          onSave={(next) => savePrivacyMutation.mutate(next)}
          isSaving={savePrivacyMutation.isPending}
        />
      </div>
    ) : (
      <ProfileSubscriptionSection
        settings={settings}
        onSelectPlan={(next) => saveSubscriptionMutation.mutate(next)}
        isSaving={saveSubscriptionMutation.isPending}
      />
    )

  return (
    <div className="profile-hub" data-testid={testId('profile', 'profile-hub', 'page')}>
      <div
        className="profile-hub__toolbar"
        data-testid={testId('profile', 'profile-hub', 'panel', 'toolbar')}
      >
        <ProfileHubTabs section={activeSection} onSelect={selectSection} />
        {activeSection === 'about' && (
          <div
            className="profile-hub__actions"
            data-testid={testId('profile', 'profile-about-section', 'panel', 'owner-actions')}
          >
            <HockeyButton
              view="action"
              aria-expanded={detailsOpen}
              aria-controls={detailsPanelId}
              onClick={() => setDetailsOpen(true)}
              data-testid={testId('profile', 'profile-about-section', 'btn', 'edit')}
            >
              Редактировать профиль
            </HockeyButton>
            <Link
              to={`/players/${profile.userId}`}
              data-testid={testId('profile', 'profile-about-section', 'link', 'public-view')}
            >
              <HockeyButton
                view="outlined"
                data-testid={testId('profile', 'profile-about-section', 'btn', 'public-view')}
              >
                Публичный вид
              </HockeyButton>
            </Link>
          </div>
        )}
      </div>
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
  const {session, isLoading: isSessionLoading} = useSessionAccess()
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
