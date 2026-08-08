/**
 * SPEC-FR-24.5.1
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useState} from 'react'
import {Link} from 'react-router'

import type {League} from '@/entities/league'
import {fetchLeaguePosts} from '@/entities/league'
import {useSessionAccess} from '@/features/access'
import {LeagueTeamApplicationForm} from '@/features/leagues/ui/LeagueTeamApplicationForm'
import {MockLeaguePortalModal} from '@/features/leagues/ui/MockLeaguePortalModal'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

export interface LeagueProfilePanelProps {
  league: League
}

/**
 * @spec SPEC-FR-24.5.1 - Профиль хоккейной лиги
 */
export function LeagueProfilePanel({league}: LeagueProfilePanelProps) {
  const [portalOpen, setPortalOpen] = useState(false)
  const {session} = useSessionAccess()
  const canManagePartner =
    session?.user.roles.includes('admin') ||
    session?.user.partnerMemberships?.some((m) => m.kind === 'league' && m.entityId === league.id)

  const {data: posts = []} = useQuery({
    queryKey: ['league-posts', league.id],
    queryFn: () => fetchLeaguePosts(league.id),
  })

  const pinnedPosts = posts.filter((post) => post.pinned)

  return (
    <div data-testid={testId('leagues', 'profile', 'panel', league.id)}>
      <IceCard padding="m">
        <div className="league-profile hockey-stack hockey-stack--gap-12">
          <div className="league-profile__header hockey-row hockey-row--between">
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="subheader-2"
                data-testid={testId('leagues', 'profile', 'text', 'title', league.id)}
              >
                Профиль лиги
              </Text>
              <Text
                color="secondary"
                data-testid={testId('leagues', 'profile', 'text', 'name', league.id)}
              >
                {league.name}
              </Text>
            </div>
            <div data-testid={testId('leagues', 'profile', 'badge', 'profile', league.id)}>
              <EntityProfileBadge kind="league" />
            </div>
          </div>

          <div
            className="league-profile__info hockey-grid hockey-grid--2-cols"
            data-testid={testId('leagues', 'profile', 'panel', 'info', league.id)}
          >
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                color="secondary"
                variant="caption-1"
                data-testid={testId('leagues', 'profile', 'text', 'region-label', league.id)}
              >
                Регион
              </Text>
              <Text data-testid={testId('leagues', 'profile', 'text', 'region', league.id)}>
                {league.region}
              </Text>
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                color="secondary"
                variant="caption-1"
                data-testid={testId('leagues', 'profile', 'text', 'level-label', league.id)}
              >
                Уровень
              </Text>
              <Text data-testid={testId('leagues', 'profile', 'text', 'level', league.id)}>
                {league.level || 'Любительский'}
              </Text>
            </div>
          </div>

          {league.description && (
            <Text
              color="secondary"
              data-testid={testId('leagues', 'profile', 'text', 'description', league.id)}
            >
              {league.description}
            </Text>
          )}

          {pinnedPosts.length > 0 && (
            <div
              className="league-profile__posts hockey-stack hockey-stack--gap-8"
              data-testid={testId('leagues', 'profile', 'list', 'posts', league.id)}
            >
              {pinnedPosts.map((post) => (
                <div
                  key={post.id}
                  className="partner-dashboard__list-item partner-dashboard__list-item--stack"
                  data-testid={testId('leagues', 'profile', 'item', post.id)}
                >
                  <Text
                    variant="subheader-2"
                    data-testid={testId('leagues', 'profile', 'text', 'post-title', post.id)}
                  >
                    {post.title}
                  </Text>
                  <Text
                    color="secondary"
                    data-testid={testId('leagues', 'profile', 'text', 'post-body', post.id)}
                  >
                    {post.body}
                  </Text>
                </div>
              ))}
            </div>
          )}

          {(league.recruitingStatus === 'open' || league.recruitingStatus === 'waitlist') &&
            !canManagePartner && <LeagueTeamApplicationForm league={league} />}

          <div
            className="league-profile__actions hockey-row hockey-row--gap-8"
            data-testid={testId('leagues', 'profile', 'panel', 'actions', league.id)}
          >
            {canManagePartner && (
              <Link
                to={`/partner/leagues/${league.id}`}
                data-testid={testId('leagues', 'profile', 'link', 'cabinet', league.id)}
              >
                <HockeyButton
                  view="action"
                  size="s"
                  data-testid={testId('leagues', 'profile', 'btn', 'cabinet', league.id)}
                >
                  Кабинет лиги
                </HockeyButton>
              </Link>
            )}
            <HockeyButton
              view={canManagePartner ? 'outlined' : 'action'}
              size="s"
              onClick={() => setPortalOpen(true)}
              data-testid={testId('leagues', 'profile', 'btn', 'portal', league.id)}
            >
              Открыть портал лиги
            </HockeyButton>
            {league.websiteUrl && (
              <a
                href={league.websiteUrl}
                target="_blank"
                rel="noreferrer"
                data-testid={testId('leagues', 'profile', 'link', 'website', league.id)}
              >
                <HockeyButton
                  view="outlined"
                  size="s"
                  data-testid={testId('leagues', 'profile', 'btn', 'website', league.id)}
                >
                  Сайт лиги
                </HockeyButton>
              </a>
            )}
          </div>

          <MockLeaguePortalModal
            open={portalOpen}
            onClose={() => setPortalOpen(false)}
            league={league}
          />
        </div>
      </IceCard>
    </div>
  )
}
