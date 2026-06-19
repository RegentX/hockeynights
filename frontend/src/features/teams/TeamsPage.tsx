/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-UI-2.3
 */

import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import type {ClubSquad} from '@/entities/club/types'
import {fetchTeams} from '@/features/teams/api/teamsApi'
import {useSessionAccess} from '@/features/access/useSessionAccess'
import {TeamCreateForm} from '@/features/teams/TeamCreateForm'
import {TeamCrest} from '@/features/teams/TeamCrest'
import {TeamControlCenter} from '@/features/teams/TeamControlCenter'
import {ClubProfilePanel} from '@/features/teams/ClubProfilePanel'
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
    <div className="hockey-stack hockey-stack--gap-20">
      <Text variant="header-1">Команды</Text>

      <div className="hockey-grid hockey-grid--cards-280">
        {canCreateTeam && (
          <IceCard padding="m">
            <TeamCreateForm />
          </IceCard>
        )}

        <IceCard padding="m">
          <Text variant="subheader-2">Мои команды</Text>
          {isLoading && <ScoreboardLoader />}
          <div className="hockey-mt-12 hockey-stack hockey-stack--gap-8">
            {teams.map((team) => (
              <div
                key={team.id}
                className="team-picker-item"
                onClick={() => setSelectedTeamId(team.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedTeamId(team.id)}
              >
                <div
                  className={
                    activeTeamId === team.id ? 'locker-room' : 'team-picker-item__surface'
                  }
                >
                  <TeamCrest name={team.name} city={team.city} skillLevel={team.skillLevel} />
                </div>
              </div>
            ))}
          </div>
        </IceCard>
      </div>

      {activeTeamId && activeTeam && (
        <div className="locker-room">
          <TeamCrest
            name={activeTeam.name}
            city={activeTeam.city}
            skillLevel={activeTeam.skillLevel}
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
