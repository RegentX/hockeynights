import {useQuery} from '@tanstack/react-query'
import {useState} from 'react'

import type {ClubSquad} from '@/entities/club'
import type {Team, TeamRole} from '@/entities/team'
import {fetchTeamRoster} from '@/entities/team'
import type {TeamPermissions} from '@/features/access'
import {
  ClubProfilePanel,
  TeamChatsPanel,
  TeamRolesPanel,
  TeamRosterPanel,
  TrainingLineupBoard,
} from '@/features/teams'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'

type TeamTab = 'roster' | 'lineup' | 'roles' | 'chats' | 'club'

export interface TeamPageProps {
  team: Team
  activeSquad: ClubSquad | null
  userId: string
  teamPermissions: (teamRole?: TeamRole) => TeamPermissions
  onActiveSquadChange: (squad: ClubSquad | null) => void
}

export function TeamPage({
  team,
  activeSquad,
  userId,
  teamPermissions,
  onActiveSquadChange,
}: TeamPageProps) {
  const [activeTab, setActiveTab] = useState<TeamTab>('roster')

  const {data: roster = []} = useQuery({
    queryKey: ['roster', team.id],
    queryFn: () => fetchTeamRoster(team.id),
  })

  const myRole = (roster.find((m) => m.userId === userId)?.teamRole ?? 'player') as TeamRole
  const permissions = teamPermissions(myRole)
  const {canEditLineup} = permissions

  const tabs: Array<{id: TeamTab; label: string}> = [
    {id: 'roster', label: 'Состав'},
    {id: 'lineup', label: 'Расстановка'},
    {id: 'roles', label: 'Роли'},
    {id: 'chats', label: 'Чаты'},
    {id: 'club', label: 'Профиль клуба'},
  ]

  return (
    <div
      className="team-page hockey-stack hockey-stack--gap-16"
      data-testid={testId('teams', 'team-page', 'panel', team.id)}
    >
      <div
        className="team-page__tabs"
        role="tablist"
        data-testid={testId('teams', 'team-page', 'tablist', team.id)}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`team-page__tab ${activeTab === tab.id ? 'team-page__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            data-testid={testId('teams', 'team-page', 'tab', tab.id, team.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="team-page__content"
        data-testid={testId('teams', 'team-page', 'content', activeTab, team.id)}
      >
        {activeTab === 'roster' && (
          <IceCard
            padding="m"
            data-testid={testId('teams', 'team-page', 'card', 'roster', team.id)}
          >
            <TeamRosterPanel teamId={team.id} userId={userId} teamPermissions={teamPermissions} />
          </IceCard>
        )}

        {activeTab === 'lineup' && (
          <TrainingLineupBoard teamId={team.id} canEdit={canEditLineup} activeSquad={activeSquad} />
        )}

        {activeTab === 'roles' && (
          <IceCard padding="m" data-testid={testId('teams', 'team-page', 'card', 'roles', team.id)}>
            <TeamRolesPanel teamId={team.id} userId={userId} teamPermissions={teamPermissions} />
          </IceCard>
        )}

        {activeTab === 'chats' && (
          <IceCard padding="m" data-testid={testId('teams', 'team-page', 'card', 'chats', team.id)}>
            <TeamChatsPanel
              team={team}
              activeSquad={activeSquad}
              userId={userId}
              teamPermissions={teamPermissions}
            />
          </IceCard>
        )}

        {activeTab === 'club' && (
          <ClubProfilePanel team={team} onActiveSquadChange={onActiveSquadChange} />
        )}
      </div>
    </div>
  )
}
