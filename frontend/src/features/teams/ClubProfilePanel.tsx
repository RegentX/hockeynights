/**
 * SPEC-FR-24.4.1, SPEC-FR-24.4.2
 * SPEC-UI-2.3
 */

import {useEffect, useMemo, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router-dom'
import {Text} from '@gravity-ui/uikit'
import type {Team} from '@/entities/team/types'
import type {ClubSquad} from '@/entities/club/types'
import {fetchArena} from '@/features/arenas/api/arenasApi'
import {fetchLeague} from '@/features/leagues/api/leaguesApi'
import {fetchTeamClubProfile} from '@/features/teams/api/teamsApi'
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
    () =>
      club?.squads.find((squad) => squad.id === activeSquadId) ??
      club?.squads[0],
    [club?.squads, activeSquadId],
  )

  useEffect(() => {
    onActiveSquadChange?.(activeSquad ?? null)
  }, [activeSquad, onActiveSquadChange])

  return (
    <IceCard padding="m">
      <div className="club-profile hockey-stack hockey-stack--gap-12">
        <div className="club-profile__header">
          <Text variant="subheader-2">Профиль клуба</Text>
          <span className="club-profile__badge">Концепт · Phase 1</span>
        </div>

        <Text color="secondary">
          {team.description ?? 'Команда выступает как клубное лицо: бренд, состав, события и чаты.'}
        </Text>

        {club && (
          <>
            <div className="club-profile__section">
              <Text variant="subheader-2">{club.name}</Text>
              <Text color="secondary">{club.city}</Text>
              {club.description && <Text color="secondary">{club.description}</Text>}
            </div>

            <div className="club-profile__section">
              <Text variant="subheader-2">Составы клуба</Text>
              <div className="club-profile__tabs">
                {club.squads.map((squad) => (
                  <button
                    key={squad.id}
                    type="button"
                    className={`club-profile__tab ${
                      activeSquad?.id === squad.id ? 'is-active' : ''
                    }`}
                    onClick={() => setActiveSquadId(squad.id)}
                  >
                    {squad.name}
                  </button>
                ))}
              </div>

              {activeSquad && (
                <div className="club-profile__active-squad">
                  <Text variant="subheader-2">{activeSquad.name}</Text>
                  <Text color="secondary">
                    Уровень: {activeSquad.level}
                    {activeSquad.season ? ` · ${activeSquad.season}` : ''}
                  </Text>
                  {activeSquad.teamId ? (
                    <span className="club-profile__chip">team: {activeSquad.teamId}</span>
                  ) : (
                    <Text color="secondary">Состав не привязан к teamId в текущем mock.</Text>
                  )}
                </div>
              )}

              <ul className="club-profile__list">
                {club.squads.map((squad) => (
                  <li key={squad.id} className="club-profile__list-item">
                    <div>
                      <Text>{squad.name}</Text>
                      <Text color="secondary">
                        Уровень: {squad.level}
                        {squad.season ? ` · ${squad.season}` : ''}
                      </Text>
                    </div>
                    {squad.teamId && (
                      <span className="club-profile__chip">team: {squad.teamId}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="club-profile__section">
              <Text variant="subheader-2">Штаб клуба</Text>
              <ul className="club-profile__list">
                {club.staff.map((member) => (
                  <li key={member.userId} className="club-profile__list-item">
                    <div>
                      <Text>{member.displayName}</Text>
                      <Text color="secondary">user: {member.userId}</Text>
                    </div>
                    <span className="club-profile__chip club-profile__chip--role">{member.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="club-profile__links hockey-stack hockey-stack--gap-8">
          {team.leagueId && league && (
            <div className="club-profile__link-row">
              <Text color="secondary">Лига</Text>
              <Link to={`/leagues?league=${team.leagueId}`} className="club-profile__link">
                {league.name}
              </Link>
            </div>
          )}
          {team.homeArenaId && arena && (
            <div className="club-profile__link-row">
              <Text color="secondary">Домашняя арена</Text>
              <Link to={`/arenas?arena=${team.homeArenaId}`} className="club-profile__link">
                {arena.name}
              </Link>
            </div>
          )}
          {!team.leagueId && !team.homeArenaId && (
            <Text color="secondary">Привяжите лигу и домашнюю арену в настройках команды.</Text>
          )}
        </div>
      </div>
    </IceCard>
  )
}
