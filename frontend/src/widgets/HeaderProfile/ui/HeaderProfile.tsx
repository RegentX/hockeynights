/**
 * SPEC-FR-18.1.1, SPEC-UI-5.1
 * HOCFRONT-30 — блок пользователя в верхнем навбаре: ФИО + вход в профиль.
 */

import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router-dom'

import {fetchSession} from '@/entities/auth'
import {fetchMyProfile} from '@/entities/profile'
import {getPrimaryPartnerPath, shouldUsePartnerWorkspace} from '@/features/access'
import {POSITION_LABELS, SKILL_LEVEL_LABELS} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {getProfileInitials} from '@/shared/lib/profileIdentity'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/**
 * @spec SPEC-FR-18.1.1 - Быстрый доступ к личному кабинету
 * @spec SPEC-UI-5.1 - Header-блок профиля
 */
export function HeaderProfile() {
  const {data: session} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })
  const partnerWorkspace = shouldUsePartnerWorkspace(session)

  const {data: profile} = useQuery({
    queryKey: ['profile'],
    queryFn: fetchMyProfile,
    enabled: Boolean(session) && !partnerWorkspace,
  })

  if (!session) return null

  const fullName = profile?.fullName?.trim() || session.user.displayName
  const profileHref = partnerWorkspace ? getPrimaryPartnerPath(session) : routes.profile
  const meta = partnerWorkspace
    ? 'Кабинет партнёра'
    : profile
      ? `${POSITION_LABELS[profile.position]} · ${SKILL_LEVEL_LABELS[profile.skillLevel]}`
      : (session.user.city ?? '')

  return (
    <div className="app-shell__profile" data-testid={testId('app', 'header-profile', 'panel')}>
      <Link
        to={profileHref}
        className="app-shell__profile-identity"
        aria-label={`Мой профиль: ${fullName}`}
        data-testid={testId('app', 'header-profile', 'link', 'identity')}
      >
        <span
          className="app-shell__profile-avatar"
          aria-hidden
          data-testid={testId('app', 'header-profile', 'icon', 'avatar')}
        >
          {getProfileInitials(fullName)}
        </span>
        <span className="app-shell__profile-text">
          <span
            className="app-shell__profile-name"
            data-testid={testId('app', 'header-profile', 'text', 'name')}
          >
            {fullName}
          </span>
          {meta && (
            <span
              className="app-shell__profile-meta"
              data-testid={testId('app', 'header-profile', 'text', 'meta')}
            >
              {meta}
            </span>
          )}
        </span>
      </Link>
      <Link
        to={profileHref}
        className="app-shell__profile-cta"
        data-testid={testId('app', 'header-profile', 'link', 'open')}
      >
        <HockeyButton
          view="outlined"
          size="s"
          data-testid={testId('app', 'header-profile', 'btn', 'open')}
        >
          В профиль
        </HockeyButton>
      </Link>
    </div>
  )
}
