/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-UI-2.3
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import type {ClubSquad} from '@/entities/club'
import {fetchTeams, type TeamsFilterParams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {
  ClubProfilePanel,
  TeamControlCenter,
  TeamCreateForm,
  TeamCrest,
  TeamFilters,
} from '@/features/teams'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const EMPTY_FILTERS: TeamsFilterParams = {}

function hasActiveFilters(filters: TeamsFilterParams): boolean {
  return Object.values(filters).some((v) => v !== undefined && v !== '')
}

/**
 * @spec SPEC-UI-2.3 - Страница команд в стиле раздевалки
 * @spec SPEC-FR-3.1.1 - Страница команд
 */
export function TeamsPage() {
  const [filters, setFilters] = useState<TeamsFilterParams>(EMPTY_FILTERS)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [activeSquad, setActiveSquad] = useState<ClubSquad | null>(null)
  const {teamPermissions, userId} = useSessionAccess()
  const {canCreateTeam} = teamPermissions('player')
  const {data: teams = [], isLoading} = useQuery({
    queryKey: ['teams', filters],
    queryFn: () => fetchTeams(filters),
    placeholderData: (previous) => previous,
  })

  const activeTeamId = useMemo(() => {
    if (selectedTeamId && teams.some((team) => team.id === selectedTeamId)) {
      return selectedTeamId
    }
    return teams[0]?.id ?? null
  }, [selectedTeamId, teams])

  const activeTeam = teams.find((t) => t.id === activeTeamId)
  const isFiltered = hasActiveFilters(filters)

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS)
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-20"
      data-testid={testId('teams', 'teams-page', 'page')}
    >
      <Text variant="header-1" data-testid={testId('teams', 'teams-page', 'text', 'title')}>
        Команды
      </Text>

      <TeamFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

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
          {!isLoading && teams.length === 0 && (
            <EmptyNetState
              title="Пустая раздевалка"
              copy="Команды не найдены по выбранным фильтрам."
              testIdPrefix="teams"
              data-testid={testId('teams', 'teams-page', 'empty')}
              action={
                isFiltered ? (
                  <HockeyButton
                    view="outlined"
                    size="s"
                    onClick={handleResetFilters}
                    data-testid={testId('teams', 'teams-page', 'btn', 'reset')}
                  >
                    Сбросить фильтры
                  </HockeyButton>
                ) : undefined
              }
            />
          )}
          {!isLoading && teams.length > 0 && (
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
                    className={
                      activeTeamId === team.id ? 'locker-room' : 'team-picker-item__surface'
                    }
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
          )}
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
            <TeamControlCenter
              team={activeTeam}
              activeSquad={activeSquad}
              userId={userId}
              teamPermissions={teamPermissions}
            />
          </div>
        </div>
      )}
    </div>
  )
}
