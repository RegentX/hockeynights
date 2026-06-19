/**
 * SPEC-FR-24.5.1
 */

import {useState} from 'react'
import {Link} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import type {League} from '@/entities/league/types'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {MockLeaguePortalModal} from '@/features/leagues/MockLeaguePortalModal'
import {LeagueTeamApplicationForm} from '@/features/leagues/LeagueTeamApplicationForm'
import {fetchLeaguePosts} from '@/features/leagues/api/leaguesApi'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'

export interface LeagueProfilePanelProps {
  league: League
}

/**
 * @spec SPEC-FR-24.5.1 - Профиль хоккейной лиги
 */
export function LeagueProfilePanel({league}: LeagueProfilePanelProps) {
  const [portalOpen, setPortalOpen] = useState(false)
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const canManagePartner =
    session?.user.roles.includes('admin') ||
    session?.user.partnerMemberships?.some((m) => m.kind === 'league' && m.entityId === league.id)

  const {data: posts = []} = useQuery({
    queryKey: ['league-posts', league.id],
    queryFn: () => fetchLeaguePosts(league.id),
  })

  const pinnedPosts = posts.filter((post) => post.pinned)

  return (
    <IceCard padding="m">
      <div className="league-profile hockey-stack hockey-stack--gap-12">
        <div className="league-profile__header hockey-row hockey-row--between">
          <div className="hockey-stack hockey-stack--gap-4">
            <Text variant="subheader-2">Профиль лиги</Text>
            <Text color="secondary">{league.name}</Text>
          </div>
          <EntityProfileBadge kind="league" />
        </div>

        <div className="league-profile__info hockey-grid hockey-grid--2-cols">
          <div className="hockey-stack hockey-stack--gap-4">
            <Text color="secondary" variant="caption-1">Регион</Text>
            <Text>{league.region}</Text>
          </div>
          <div className="hockey-stack hockey-stack--gap-4">
            <Text color="secondary" variant="caption-1">Уровень</Text>
            <Text>{league.level || 'Любительский'}</Text>
          </div>
        </div>

        {league.description && <Text color="secondary">{league.description}</Text>}

        {pinnedPosts.length > 0 && (
          <div className="league-profile__posts hockey-stack hockey-stack--gap-8">
            {pinnedPosts.map((post) => (
              <div key={post.id} className="partner-dashboard__list-item partner-dashboard__list-item--stack">
                <Text variant="subheader-2">{post.title}</Text>
                <Text color="secondary">{post.body}</Text>
              </div>
            ))}
          </div>
        )}

        {(league.recruitingStatus === 'open' || league.recruitingStatus === 'waitlist') &&
          !canManagePartner && <LeagueTeamApplicationForm league={league} />}

        <div className="league-profile__actions hockey-row hockey-row--gap-8">
          {canManagePartner && (
            <Link to={`/partner/leagues/${league.id}`}>
              <HockeyButton view="action" size="s">Кабинет лиги</HockeyButton>
            </Link>
          )}
          <HockeyButton view={canManagePartner ? 'outlined' : 'action'} size="s" onClick={() => setPortalOpen(true)}>
            Открыть портал лиги
          </HockeyButton>
          {league.websiteUrl && (
            <a href={league.websiteUrl} target="_blank" rel="noreferrer">
              <HockeyButton view="outlined" size="s">
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
  )
}
