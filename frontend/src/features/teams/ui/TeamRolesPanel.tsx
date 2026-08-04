import {Select, Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import type {RosterMember, TeamRole} from '@/entities/team'
import {fetchTeamRoster, updateTeamMemberRole} from '@/entities/team'
import type {TeamPermissions} from '@/features/access'
import {testId} from '@/shared/testing/testId'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const ROLE_OPTIONS = [
  {value: 'owner', content: 'Владелец'},
  {value: 'captain', content: 'Капитан'},
  {value: 'coach', content: 'Тренер'},
  {value: 'team_admin', content: 'Админ команды'},
  {value: 'player', content: 'Игрок'},
]

export interface TeamRolesPanelProps {
  teamId: string
  userId: string
  teamPermissions: (teamRole?: TeamRole) => TeamPermissions
}

export function TeamRolesPanel({teamId, userId, teamPermissions}: TeamRolesPanelProps) {
  const queryClient = useQueryClient()
  const {data: roster = [], isLoading} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
  })

  const roleMutation = useMutation({
    mutationFn: ({
      memberUserId,
      teamRole,
    }: {
      memberUserId: string
      teamRole: NonNullable<RosterMember['teamRole']>
    }) => updateTeamMemberRole(teamId, memberUserId, teamRole),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['roster', teamId]})
    },
  })

  if (isLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка ролей"
        testIdPrefix="teams"
        data-testid={testId('teams', 'team-roles-panel', 'loader', teamId)}
      />
    )
  }

  const myTeamRole = (roster.find((m) => m.userId === userId)?.teamRole ?? 'player') as TeamRole
  const permissions = teamPermissions(myTeamRole)
  const {canManageRoles, isReadOnly} = permissions
  const ownerCount = roster.filter(
    (m) => m.teamRole === 'owner' && m.rosterStatus !== 'removed',
  ).length
  const isOwner = myTeamRole === 'owner'

  const activeRoster = roster.filter((m) => m.rosterStatus !== 'removed')

  return (
    <div
      className="team-roles-panel hockey-stack hockey-stack--gap-16"
      data-testid={testId('teams', 'team-roles-panel', 'panel', teamId)}
    >
      <div className="team-roles-panel__header">
        <Text
          variant="header-2"
          data-testid={testId('teams', 'team-roles-panel', 'text', 'title', teamId)}
        >
          Роли участников
        </Text>
        <Text
          color="secondary"
          data-testid={testId('teams', 'team-roles-panel', 'text', 'hint', teamId)}
        >
          {isReadOnly
            ? 'Только просмотр. Управление доступно капитану и штабу.'
            : canManageRoles
              ? 'Доступно управление ролями.'
              : 'Частичный доступ к управлению.'}
        </Text>
      </div>

      <div className="team-roles-panel__list hockey-stack hockey-stack--gap-8">
        {activeRoster.map((member) => (
          <div
            key={member.userId}
            className="team-roles-panel__row"
            data-testid={testId('teams', 'team-roles-panel', 'row', member.userId)}
          >
            <div className="team-roles-panel__info">
              <Text
                variant="subheader-2"
                data-testid={testId('teams', 'team-roles-panel', 'text', 'name', member.userId)}
              >
                {member.displayName}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('teams', 'team-roles-panel', 'text', 'position', member.userId)}
              >
                {member.position}
              </Text>
            </div>
            {canManageRoles ? (
              <Select
                value={[member.teamRole ?? 'player']}
                onUpdate={(v) => {
                  if (!v[0]) return
                  roleMutation.mutate({
                    memberUserId: member.userId,
                    teamRole: v[0] as NonNullable<RosterMember['teamRole']>,
                  })
                }}
                options={ROLE_OPTIONS}
                width={170}
                disabled={
                  (!isOwner && member.teamRole === 'owner') ||
                  (isOwner &&
                    member.userId === userId &&
                    member.teamRole === 'owner' &&
                    ownerCount <= 1)
                }
                data-testid={testId('teams', 'team-roles-panel', 'select', 'role', member.userId)}
              />
            ) : (
              <Text
                color="secondary"
                data-testid={testId('teams', 'team-roles-panel', 'text', 'role', member.userId)}
              >
                {member.teamRole ?? 'player'}
              </Text>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
