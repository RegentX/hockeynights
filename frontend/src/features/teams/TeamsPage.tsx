/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-UI-2.3
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useState} from 'react'

import type {ClubSquad} from '@/entities/club/types'
import {useSessionAccess} from '@/features/access/useSessionAccess'
import {fetchTeams} from '@/features/teams/api/teamsApi'
import {ClubProfilePanel} from '@/features/teams/ClubProfilePanel'
import {TeamControlCenter} from '@/features/teams/TeamControlCenter'
import {TeamCreateForm} from '@/features/teams/TeamCreateForm'
import {TeamCrest} from '@/features/teams/TeamCrest'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/**
 * @spec SPEC-UI-2.3 - Страница команд в стиле раздевалки
 * @spec SPEC-FR-3.1.1 - Страница команд
 */
export function TeamsPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [activeSquad, setActiveSquad] = useState<ClubSquad | null>(null)
  const {teamPermissions} = useSessionAccess()
  const {canCreateTeam} = teamPermissions('player')
  const {data: teams = [], isLoading} = useQuery({queryKey: ['teams'], queryFn: fetchTeams})

  const activeTeamId = selectedTeamId ?? teams[0]?.id ?? null
  const activeTeam = teams.find((t) => t.id === activeTeamId)

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
                onClick={() => setSelectedTeamId(team.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedTeamId(team.id)}
                data-testid={testId('teams', 'teams-page', 'item', team.id)}
              >
                <div
                  className={activeTeamId === team.id ? 'locker-room' : 'team-picker-item__surface'}
                >
                  <TeamCrest
                    name={team.name}
                    city={team.city}
                    skillLevel={team.skillLevel}
                    teamId={team.id}
                  />
                </div>
              </div>
            ))}
          </div>
        </IceCard>
      </div>

      {activeTeamId && activeTeam && (
        <div
          className="locker-room"
          data-testid={testId('teams', 'teams-page', 'panel', 'active-team', activeTeamId)}
        >
          <TeamCrest
            name={activeTeam.name}
            city={activeTeam.city}
            skillLevel={activeTeam.skillLevel}
            teamId={activeTeam.id}
          />
          <div className="hockey-mt-16 hockey-mb-12 hockey-stack hockey-stack--gap-16">
            <ClubProfilePanel team={activeTeam} onActiveSquadChange={setActiveSquad} />
            <TeamControlCenter team={activeTeam} activeSquad={activeSquad} />
          </div>
        </div>
      )}
    </div>
  )
}
