/**
 * SPEC-FR-2.2.4, SPEC-FR-17.1.1, SPEC-FR-18.1.1
 * HOCFRONT-30 — краткая карточка профиля с раскрытием подробностей.
 */

import {Card, Text} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import type {UserRole} from '@/entities/common'
import type {HockeyProfile} from '@/entities/profile'
import {POSITION_LABELS, SKILL_LEVEL_LABELS} from '@/features/events'
import {KarmaScore} from '@/features/karma'
import {formatProfileLocation, getProfileInitials} from '@/shared/lib/profileIdentity'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const ROLE_LABELS: Record<UserRole, string> = {
  player: 'Игрок',
  goalie: 'Вратарь',
  captain: 'Капитан',
  organizer: 'Организатор',
  training_organizer: 'Организатор тренировок',
  coach: 'Тренер',
  club_admin: 'Админ клуба',
  admin: 'Админ',
}

const VERIFICATION_LABELS: Record<NonNullable<HockeyProfile['verificationStatus']>, string> = {
  verified: 'Профиль подтвержден',
  pending: 'Проверка в процессе',
  rejected: 'Проверка отклонена',
  unverified: 'Профиль не подтвержден',
}

const BIO_PREVIEW_LIMIT = 160

/** @spec SPEC-FR-17.1.1 - Бейджи ролей пользователя */
export function ProfileRoleBadges({roles}: {roles: UserRole[]}) {
  if (roles.length === 0) return null
  return (
    <div
      className="profile-hub__role-badges"
      data-testid={testId('profile', 'profile-role-badges', 'list')}
    >
      {roles.map((role) => (
        <span
          key={role}
          className={`profile-hub__role-badge ${
            role === 'goalie' ? 'is-goalie' : role === 'coach' ? 'is-coach' : ''
          }`}
          data-testid={testId('profile', 'profile-role-badges', 'badge', role)}
        >
          {ROLE_LABELS[role]}
        </span>
      ))}
    </div>
  )
}

export interface ProfileSummaryCardProps {
  profile: HockeyProfile
  roles: UserRole[]
  /** Раскрыты ли подробности профиля */
  detailsOpen: boolean
  onToggleDetails: () => void
  /** id раскрываемой панели для aria-controls */
  detailsPanelId: string
}

/**
 * @spec SPEC-FR-2.2.4 - Краткая сводка Hockey ID и заполненность
 * @spec SPEC-FR-18.1.1 - Личный кабинет: краткая инфа + подробнее
 */
export function ProfileSummaryCard({
  profile,
  roles,
  detailsOpen,
  onToggleDetails,
  detailsPanelId,
}: ProfileSummaryCardProps) {
  const verificationStatus = profile.verificationStatus ?? 'unverified'
  const location = formatProfileLocation(profile)
  const bio = profile.bio?.trim() ?? ''
  const bioPreview = bio.length > BIO_PREVIEW_LIMIT ? `${bio.slice(0, BIO_PREVIEW_LIMIT)}…` : bio

  return (
    <Card view="filled" data-testid={testId('profile', 'profile-summary', 'card')}>
      <div className="hockey-panel hockey-panel--24 profile-summary">
        <div className="profile-summary__head">
          <span
            className="profile-summary__avatar"
            aria-hidden
            data-testid={testId('profile', 'profile-summary', 'icon', 'avatar')}
          >
            {getProfileInitials(profile.fullName)}
          </span>
          <div className="profile-summary__identity">
            <Text
              color="secondary"
              className="profile-summary__eyebrow"
              data-testid={testId('profile', 'profile-summary', 'text', 'hockey-id')}
            >
              Hockey ID
            </Text>
            <Text
              variant="header-1"
              data-testid={testId('profile', 'profile-summary', 'text', 'full-name')}
            >
              {profile.fullName}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('profile', 'profile-summary', 'text', 'role-line')}
            >
              {POSITION_LABELS[profile.position]} · {SKILL_LEVEL_LABELS[profile.skillLevel]}
            </Text>
            {location && (
              <Text
                color="secondary"
                data-testid={testId('profile', 'profile-summary', 'text', 'location')}
              >
                {location}
              </Text>
            )}
          </div>
          <span
            className={`profile-hub__verified-badge ${verificationStatus === 'verified' ? 'is-verified' : ''}`}
            data-testid={testId('profile', 'profile-summary', 'badge', 'verification')}
          >
            {verificationStatus === 'verified' ? '✓' : '•'}{' '}
            {VERIFICATION_LABELS[verificationStatus]}
          </span>
        </div>

        <ProfileRoleBadges roles={roles} />

        {bioPreview && (
          <Text data-testid={testId('profile', 'profile-summary', 'text', 'bio')}>
            {bioPreview}
          </Text>
        )}

        <div
          className="profile-summary__metrics"
          data-testid={testId('profile', 'profile-summary', 'panel', 'metrics')}
        >
          <KarmaScore score={profile.karmaScore} size="m" testIdPrefix="profile" />
          <div
            className="profile-summary__stat"
            data-testid={testId('profile', 'profile-summary', 'panel', 'events-stat')}
          >
            <Text
              variant="display-3"
              className="profile-summary__stat-value"
              data-testid={testId('profile', 'profile-summary', 'text', 'events-count')}
            >
              {(profile.participationHistory ?? []).filter((r) => r.confirmed).length}
            </Text>
            <Text
              color="secondary"
              className="profile-summary__stat-label"
              data-testid={testId('profile', 'profile-summary', 'text', 'events-label')}
            >
              игр подтверждено
            </Text>
          </div>
        </div>

        <div className="profile-hub__actions">
          <HockeyButton
            view="action"
            aria-expanded={detailsOpen}
            aria-controls={detailsPanelId}
            onClick={onToggleDetails}
            data-testid={testId('profile', 'profile-summary', 'btn', 'details')}
          >
            {detailsOpen ? 'Свернуть' : 'Подробнее'}
          </HockeyButton>
          <Link
            to={`/players/${profile.userId}`}
            data-testid={testId('profile', 'profile-summary', 'link', 'public-view')}
          >
            <HockeyButton
              view="outlined"
              data-testid={testId('profile', 'profile-summary', 'btn', 'public-view')}
            >
              Публичный вид
            </HockeyButton>
          </Link>
        </div>
      </div>
    </Card>
  )
}
