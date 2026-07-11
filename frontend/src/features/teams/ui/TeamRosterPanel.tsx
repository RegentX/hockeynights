import {Select, Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import type {RosterMember, TeamRole} from '@/entities/team'
import {fetchTeamRoster, updateRosterMemberStatus} from '@/entities/team'
import type {TeamPermissions} from '@/features/access'
import {testId} from '@/shared/testing/testId'
import {PositionLabel} from '@/shared/ui/PositionLabel'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const STATUS_OPTIONS = [
  {value: 'active', content: 'Активен'},
  {value: 'bench', content: 'Запасной'},
  {value: 'invited', content: 'Приглашён'},
  {value: 'removed', content: 'Удалён'},
]

const POSITION_ORDER = ['goalie', 'defense', 'forward', 'any'] as const

export interface TeamRosterPanelProps {
  teamId: string
  userId: string
  teamPermissions: (teamRole?: TeamRole) => TeamPermissions
}

export function TeamRosterPanel({teamId, userId, teamPermissions}: TeamRosterPanelProps) {
  const queryClient = useQueryClient()
  const {data: roster = [], isLoading} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
  })

  const mutation = useMutation({
    mutationFn: ({
      memberUserId,
      rosterStatus,
    }: {
      memberUserId: string
      rosterStatus: RosterMember['rosterStatus']
    }) => updateRosterMemberStatus(teamId, memberUserId, rosterStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['roster', teamId]})
    },
  })

  if (isLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка состава"
        testIdPrefix="teams"
        data-testid={testId('teams', 'team-roster-panel', 'loader', teamId)}
      />
    )
  }

  const myTeamRole = (roster.find((m) => m.userId === userId)?.teamRole ?? 'player') as TeamRole
  const permissions = teamPermissions(myTeamRole)
  const {canManageRoster} = permissions

  const activeRoster = roster.filter((m) => m.rosterStatus !== 'removed')
  const byPosition = POSITION_ORDER.map((pos) => ({
    position: pos,
    members: activeRoster.filter((m) => m.position === pos),
  }))

  return (
    <div
      className="team-roster-panel hockey-stack hockey-stack--gap-16"
      data-testid={testId('teams', 'team-roster-panel', 'panel', teamId)}
    >
      <div className="team-roster-panel__header">
        <Text
          variant="header-2"
          data-testid={testId('teams', 'team-roster-panel', 'text', 'title', teamId)}
        >
          Состав команды
        </Text>
        <Text
          color="secondary"
          data-testid={testId('teams', 'team-roster-panel', 'text', 'count', teamId)}
        >
          {activeRoster.length} игроков
        </Text>
      </div>

      {byPosition.map(({position, members}) => (
        <div
          key={position}
          className="team-roster-panel__section"
          data-testid={testId('teams', 'team-roster-panel', 'section', position, teamId)}
        >
          <PositionLabel
            position={position}
            showFull
            testIdPrefix="teams"
            data-testid={testId(
              'teams',
              'team-roster-panel',
              'badge',
              'position',
              position,
              teamId,
            )}
          />
          <div className="team-roster-panel__list hockey-mt-8 hockey-stack hockey-stack--gap-6">
            {members.length === 0 ? (
              <div
                className="team-roster-panel__empty"
                data-testid={testId('teams', 'team-roster-panel', 'empty', position, teamId)}
              >
                <Text color="secondary">Нет игроков на этой позиции</Text>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.userId}
                  className="team-roster-panel__row"
                  data-testid={testId('teams', 'team-roster-panel', 'row', member.userId)}
                >
                  <div className="team-roster-panel__info">
                    <Text
                      variant="subheader-2"
                      data-testid={testId(
                        'teams',
                        'team-roster-panel',
                        'text',
                        'name',
                        member.userId,
                      )}
                    >
                      {member.displayName}
                    </Text>
                    <Text
                      color="secondary"
                      data-testid={testId(
                        'teams',
                        'team-roster-panel',
                        'text',
                        'role',
                        member.userId,
                      )}
                    >
                      {member.teamRole ?? 'player'}
                    </Text>
                  </div>
                  {canManageRoster && (
                    <Select
                      value={[member.rosterStatus]}
                      onUpdate={(v) =>
                        mutation.mutate({
                          memberUserId: member.userId,
                          rosterStatus: v[0] as RosterMember['rosterStatus'],
                        })
                      }
                      options={STATUS_OPTIONS}
                      width={160}
                      data-testid={testId(
                        'teams',
                        'team-roster-panel',
                        'select',
                        'status',
                        member.userId,
                      )}
                    />
                  )}
                  {!canManageRoster && (
                    <Text
                      color="secondary"
                      data-testid={testId(
                        'teams',
                        'team-roster-panel',
                        'text',
                        'status',
                        member.userId,
                      )}
                    >
                      {STATUS_OPTIONS.find((o) => o.value === member.rosterStatus)?.content ??
                        member.rosterStatus}
                    </Text>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
