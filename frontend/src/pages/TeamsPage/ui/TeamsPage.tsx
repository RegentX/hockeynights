/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-UI-2.3
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useSearchParams} from 'react-router-dom'

import type {ClubSquad} from '@/entities/club'
import {fetchTeams, type Team} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {FavoriteButton} from '@/features/favorites'
import {ClubProfilePanel, TeamControlCenter, TeamCreateForm, TeamCrest} from '@/features/teams'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

interface ActiveTeamPanelProps {
  team: Team
  userId: string
  teamPermissions: ReturnType<typeof useSessionAccess>['teamPermissions']
  detailRef: React.RefObject<HTMLDivElement | null>
}

function ActiveTeamPanel({team, userId, teamPermissions, detailRef}: ActiveTeamPanelProps) {
  const [activeSquad, setActiveSquad] = useState<ClubSquad | null>(null)

  return (
    <div
      ref={detailRef}
      className="locker-room"
      data-testid={testId('teams', 'teams-page', 'panel', 'active-team', team.id)}
    >
      <TeamCrest name={team.name} city={team.city} skillLevel={team.skillLevel} teamId={team.id} />
      <div className="hockey-mt-16 hockey-mb-12 hockey-stack hockey-stack--gap-16">
        <ClubProfilePanel team={team} onActiveSquadChange={setActiveSquad} />
        <TeamControlCenter
          team={team}
          activeSquad={activeSquad}
          userId={userId}
          teamPermissions={teamPermissions}
        />
      </div>
    </div>
  )
}

/**
 * @spec SPEC-UI-2.3 - Страница команд в стиле раздевалки
 * @spec SPEC-FR-3.1.1 - Страница команд
 */
export function TeamsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const teamIdFromUrl = searchParams.get('teamId')
  const {teamPermissions, userId} = useSessionAccess()
  const {canCreateTeam} = teamPermissions('player')
  const {data: teams = [], isLoading} = useQuery({queryKey: ['teams'], queryFn: fetchTeams})
  const scrollOnNextTeamRef = useRef(false)
  const detailRef = useRef<HTMLDivElement | null>(null)

  const activeTeamId = useMemo(() => {
    if (teamIdFromUrl && teams.some((team) => team.id === teamIdFromUrl)) {
      return teamIdFromUrl
    }
    return teams[0]?.id ?? null
  }, [teamIdFromUrl, teams])

  const activeTeam = teams.find((t) => t.id === activeTeamId)

  useEffect(() => {
    if (!teamIdFromUrl) return
    scrollOnNextTeamRef.current = true
  }, [teamIdFromUrl])

  useEffect(() => {
    if (!activeTeamId || !scrollOnNextTeamRef.current) return
    scrollOnNextTeamRef.current = false
    const node = detailRef.current
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({behavior: 'smooth', block: 'nearest'})
    }
  }, [activeTeamId])

  const handleSelectTeam = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('teamId', id)
    setSearchParams(next, {replace: true})
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-20"
      data-testid={testId('teams', 'teams-page', 'page')}
    >
      <Text variant="header-1" data-testid={testId('teams', 'teams-page', 'text', 'title')}>
        Команды
      </Text>

      <div
        className="hockey-grid hockey-grid--cards-280"
        data-testid={testId('teams', 'teams-page', 'panel', 'grid')}
      >
        {canCreateTeam && (
          <IceCard padding="m" data-testid={testId('teams', 'teams-page', 'card', 'create')}>
            <TeamCreateForm />
          </IceCard>
        )}

        <IceCard padding="m" data-testid={testId('teams', 'teams-page', 'card', 'my-teams')}>
          <Text
            variant="subheader-2"
            data-testid={testId('teams', 'teams-page', 'text', 'my-teams-title')}
          >
            Мои команды
          </Text>
          {isLoading && (
            <ScoreboardLoader
              testIdPrefix="teams"
              data-testid={testId('teams', 'teams-page', 'loader')}
            />
          )}
          <div
            className="hockey-mt-12 hockey-stack hockey-stack--gap-8"
            data-testid={testId('teams', 'teams-page', 'list', 'teams')}
          >
            {teams.map((team) => (
              <div
                key={team.id}
                className="team-picker-item"
                onClick={() => handleSelectTeam(team.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectTeam(team.id)}
                data-testid={testId('teams', 'teams-page', 'item', team.id)}
              >
                <div
                  className={
                    activeTeamId === team.id
                      ? 'locker-room team-picker-item__row'
                      : 'team-picker-item__surface team-picker-item__row'
                  }
                >
                  <TeamCrest
                    name={team.name}
                    city={team.city}
                    skillLevel={team.skillLevel}
                    teamId={team.id}
                  />
                  <FavoriteButton type="team" entityId={team.id} title={team.name} />
                </div>
              </div>
            ))}
          </div>
        </IceCard>
      </div>

      {activeTeamId && activeTeam && (
        <ActiveTeamPanel
          key={activeTeam.id}
          team={activeTeam}
          userId={userId}
          teamPermissions={teamPermissions}
          detailRef={detailRef}
        />
      )}
    </div>
  )
}
