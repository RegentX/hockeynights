/**
 * HOCFRONT-25 / TASK-04-02 — карточка команды в ленте
 */

import {Label, Text} from '@gravity-ui/uikit'
import {useNavigate} from 'react-router-dom'

import type {Team} from '@/entities/team'
import {SKILL_LEVEL_LABELS} from '@/features/events'
import {FavoriteButton} from '@/features/favorites'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'

export interface TeamCardProps {
  team: Team
}

/** Горизонтальная карточка для ленты команд */
export function TeamCard({team}: TeamCardProps) {
  const navigate = useNavigate()
  const description = team.shortDescription || team.description
  const initial = team.name.trim().charAt(0).toUpperCase() || '?'
  const membersCount = team.memberIds.length

  const openProfile = () => navigate(`/teams/${team.id}`)

  return (
    <IceCard
      padding="m"
      className="team-card team-card--feed team-card--clickable"
      role="button"
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openProfile()
        }
      }}
      data-testid={testId('teams', 'card', 'card', team.id)}
    >
      <div className="team-card__feed-row">
        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt=""
            className="team-card__logo"
            data-testid={testId('teams', 'card', 'img', 'logo', team.id)}
          />
        ) : (
          <div
            className="team-crest__chevron"
            aria-hidden
            data-testid={testId('teams', 'card', 'icon', 'crest', team.id)}
          >
            {initial}
          </div>
        )}

        <div className="team-card__feed-main">
          <div className="hockey-row hockey-row--gap-8 hockey-row--between">
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="header-2"
                data-testid={testId('teams', 'card', 'text', 'name', team.id)}
              >
                {team.name}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('teams', 'card', 'text', 'city', team.id)}
              >
                {team.city}
              </Text>
            </div>
            <FavoriteButton type="team" entityId={team.id} title={team.name} />
          </div>

          {description && (
            <Text
              color="secondary"
              className="team-card__feed-description"
              data-testid={testId('teams', 'card', 'text', 'description', team.id)}
            >
              {description}
            </Text>
          )}

          <div
            className="team-card__feed-meta"
            data-testid={testId('teams', 'card', 'panel', 'meta', team.id)}
          >
            <Label size="s" data-testid={testId('teams', 'card', 'badge', 'skill', team.id)}>
              {SKILL_LEVEL_LABELS[team.skillLevel] ?? team.skillLevel}
            </Label>
            <Label size="s" data-testid={testId('teams', 'card', 'badge', 'members', team.id)}>
              В составе: {membersCount}
            </Label>
            {team.leagueId && (
              <Label size="s" data-testid={testId('teams', 'card', 'badge', 'league', team.id)}>
                В лиге
              </Label>
            )}
          </div>
        </div>
      </div>
    </IceCard>
  )
}
