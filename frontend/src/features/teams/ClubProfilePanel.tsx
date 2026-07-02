/**
 * SPEC-FR-24.4.1, SPEC-FR-24.4.2
 * SPEC-UI-2.3
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'

import type {ClubSquad} from '@/entities/club/types'
import type {Team} from '@/entities/team/types'
import {fetchArena} from '@/features/arenas/api/arenasApi'
import {fetchLeague} from '@/features/leagues/api/leaguesApi'
import {fetchTeamClubProfile} from '@/features/teams/api/teamsApi'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'

export interface ClubProfilePanelProps {
  team: Team
  onActiveSquadChange?: (squad: ClubSquad | null) => void
}

/**
 * @spec SPEC-FR-24.4.1 - Клубное лицо команды (концепт Phase 1)
 * @spec SPEC-FR-24.4.2 - Связь с лигой и домашней ареной
 */
export function ClubProfilePanel({team, onActiveSquadChange}: ClubProfilePanelProps) {
  const {data: league} = useQuery({
    queryKey: ['league', team.leagueId],
    queryFn: () => fetchLeague(team.leagueId!),
    enabled: Boolean(team.leagueId),
  })

  const {data: arena} = useQuery({
    queryKey: ['arena', team.homeArenaId],
    queryFn: () => fetchArena(team.homeArenaId!),
    enabled: Boolean(team.homeArenaId),
  })

  const {data: club} = useQuery({
    queryKey: ['club-profile', team.id],
    queryFn: () => fetchTeamClubProfile(team.id),
  })

  const [activeSquadId, setActiveSquadId] = useState<string | null>(null)
  const activeSquad = useMemo(
    () => club?.squads.find((squad) => squad.id === activeSquadId) ?? club?.squads[0],
    [club?.squads, activeSquadId],
  )

  useEffect(() => {
    onActiveSquadChange?.(activeSquad ?? null)
  }, [activeSquad, onActiveSquadChange])

  return (
    <IceCard padding="m" data-testid={testId('teams', 'club-profile-panel', 'card', team.id)}>
      <div className="club-profile hockey-stack hockey-stack--gap-12">
        <div className="club-profile__header">
          <Text
            variant="subheader-2"
            data-testid={testId('teams', 'club-profile-panel', 'text', 'title', team.id)}
          >
            Профиль клуба
          </Text>
          <span
            className="club-profile__badge"
            data-testid={testId('teams', 'club-profile-panel', 'badge', 'phase', team.id)}
          >
            Концепт · Phase 1
          </span>
        </div>

        <Text
          color="secondary"
          data-testid={testId('teams', 'club-profile-panel', 'text', 'description', team.id)}
        >
          {team.description ?? 'Команда выступает как клубное лицо: бренд, состав, события и чаты.'}
        </Text>

        {club && (
          <>
            <div
              className="club-profile__section"
              data-testid={testId('teams', 'club-profile-panel', 'panel', 'club-info', team.id)}
            >
              <Text
                variant="subheader-2"
                data-testid={testId('teams', 'club-profile-panel', 'text', 'club-name', team.id)}
              >
                {club.name}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('teams', 'club-profile-panel', 'text', 'club-city', team.id)}
              >
                {club.city}
              </Text>
              {club.description && (
                <Text
                  color="secondary"
                  data-testid={testId(
                    'teams',
                    'club-profile-panel',
                    'text',
                    'club-description',
                    team.id,
                  )}
                >
                  {club.description}
                </Text>
              )}
            </div>

            <div
              className="club-profile__section"
              data-testid={testId('teams', 'club-profile-panel', 'panel', 'squads', team.id)}
            >
              <Text
                variant="subheader-2"
                data-testid={testId('teams', 'club-profile-panel', 'text', 'squads-title', team.id)}
              >
                Составы клуба
              </Text>
              <div
                className="club-profile__tabs"
                data-testid={testId('teams', 'club-profile-panel', 'tab', 'list', team.id)}
              >
                {club.squads.map((squad) => (
                  <button
                    key={squad.id}
                    type="button"
                    className={`club-profile__tab ${
                      activeSquad?.id === squad.id ? 'is-active' : ''
                    }`}
                    onClick={() => setActiveSquadId(squad.id)}
                    data-testid={testId('teams', 'club-profile-panel', 'tab', squad.id)}
                  >
                    {squad.name}
                  </button>
                ))}
              </div>

              {activeSquad && (
                <div
                  className="club-profile__active-squad"
                  data-testid={testId(
                    'teams',
                    'club-profile-panel',
                    'panel',
                    'active-squad',
                    activeSquad.id,
                  )}
                >
                  <Text
                    variant="subheader-2"
                    data-testid={testId(
                      'teams',
                      'club-profile-panel',
                      'text',
                      'active-squad-name',
                      activeSquad.id,
                    )}
                  >
                    {activeSquad.name}
                  </Text>
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'teams',
                      'club-profile-panel',
                      'text',
                      'active-squad-meta',
                      activeSquad.id,
                    )}
                  >
                    Уровень: {activeSquad.level}
                    {activeSquad.season ? ` · ${activeSquad.season}` : ''}
                  </Text>
                  {activeSquad.teamId ? (
                    <span
                      className="club-profile__chip"
                      data-testid={testId(
                        'teams',
                        'club-profile-panel',
                        'badge',
                        'team-id',
                        activeSquad.id,
                      )}
                    >
                      team: {activeSquad.teamId}
                    </span>
                  ) : (
                    <Text
                      color="secondary"
                      data-testid={testId(
                        'teams',
                        'club-profile-panel',
                        'text',
                        'no-team-id',
                        activeSquad.id,
                      )}
                    >
                      Состав не привязан к teamId в текущем mock.
                    </Text>
                  )}
                </div>
              )}

              <ul
                className="club-profile__list"
                data-testid={testId('teams', 'club-profile-panel', 'list', 'squads', team.id)}
              >
                {club.squads.map((squad) => (
                  <li
                    key={squad.id}
                    className="club-profile__list-item"
                    data-testid={testId('teams', 'club-profile-panel', 'item', 'squad', squad.id)}
                  >
                    <div>
                      <Text
                        data-testid={testId(
                          'teams',
                          'club-profile-panel',
                          'text',
                          'squad-name',
                          squad.id,
                        )}
                      >
                        {squad.name}
                      </Text>
                      <Text
                        color="secondary"
                        data-testid={testId(
                          'teams',
                          'club-profile-panel',
                          'text',
                          'squad-meta',
                          squad.id,
                        )}
                      >
                        Уровень: {squad.level}
                        {squad.season ? ` · ${squad.season}` : ''}
                      </Text>
                    </div>
                    {squad.teamId && (
                      <span
                        className="club-profile__chip"
                        data-testid={testId(
                          'teams',
                          'club-profile-panel',
                          'badge',
                          'squad-team',
                          squad.id,
                        )}
                      >
                        team: {squad.teamId}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="club-profile__section"
              data-testid={testId('teams', 'club-profile-panel', 'panel', 'staff', team.id)}
            >
              <Text
                variant="subheader-2"
                data-testid={testId('teams', 'club-profile-panel', 'text', 'staff-title', team.id)}
              >
                Штаб клуба
              </Text>
              <ul
                className="club-profile__list"
                data-testid={testId('teams', 'club-profile-panel', 'list', 'staff', team.id)}
              >
                {club.staff.map((member) => (
                  <li
                    key={member.userId}
                    className="club-profile__list-item"
                    data-testid={testId(
                      'teams',
                      'club-profile-panel',
                      'item',
                      'staff',
                      member.userId,
                    )}
                  >
                    <div>
                      <Text
                        data-testid={testId(
                          'teams',
                          'club-profile-panel',
                          'text',
                          'staff-name',
                          member.userId,
                        )}
                      >
                        {member.displayName}
                      </Text>
                      <Text
                        color="secondary"
                        data-testid={testId(
                          'teams',
                          'club-profile-panel',
                          'text',
                          'staff-user',
                          member.userId,
                        )}
                      >
                        user: {member.userId}
                      </Text>
                    </div>
                    <span
                      className="club-profile__chip club-profile__chip--role"
                      data-testid={testId(
                        'teams',
                        'club-profile-panel',
                        'badge',
                        'staff-role',
                        member.userId,
                      )}
                    >
                      {member.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div
          className="club-profile__links hockey-stack hockey-stack--gap-8"
          data-testid={testId('teams', 'club-profile-panel', 'panel', 'links', team.id)}
        >
          {team.leagueId && league && (
            <div className="club-profile__link-row">
              <Text
                color="secondary"
                data-testid={testId('teams', 'club-profile-panel', 'text', 'league-label', team.id)}
              >
                Лига
              </Text>
              <Link
                to={`/leagues?league=${team.leagueId}`}
                className="club-profile__link"
                data-testid={testId('teams', 'club-profile-panel', 'link', 'league', team.id)}
              >
                {league.name}
              </Link>
            </div>
          )}
          {team.homeArenaId && arena && (
            <div className="club-profile__link-row">
              <Text
                color="secondary"
                data-testid={testId('teams', 'club-profile-panel', 'text', 'arena-label', team.id)}
              >
                Домашняя арена
              </Text>
              <Link
                to={`/arenas?arena=${team.homeArenaId}`}
                className="club-profile__link"
                data-testid={testId('teams', 'club-profile-panel', 'link', 'arena', team.id)}
              >
                {arena.name}
              </Link>
            </div>
          )}
          {!team.leagueId && !team.homeArenaId && (
            <Text
              color="secondary"
              data-testid={testId('teams', 'club-profile-panel', 'text', 'no-links', team.id)}
            >
              Привяжите лигу и домашнюю арену в настройках команды.
            </Text>
          )}
        </div>
      </div>
    </IceCard>
  )
}
