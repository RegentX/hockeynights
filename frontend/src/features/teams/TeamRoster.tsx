/**
 * SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-UI-2.3
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Select, Text} from '@gravity-ui/uikit'
import {fetchTeamRoster, updateRosterMemberStatus, updateTeamMemberRole} from '@/features/teams/api/teamsApi'
import type {RosterMember} from '@/entities/team/types'
import {PositionLabel} from '@/shared/ui/PositionLabel'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const STATUS_OPTIONS = [
  {value: 'active', content: 'Активен'},
  {value: 'bench', content: 'Запасной'},
  {value: 'invited', content: 'Приглашён'},
  {value: 'removed', content: 'Удалён'},
]

const ROLE_OPTIONS = [
  {value: 'owner', content: 'Владелец'},
  {value: 'captain', content: 'Капитан'},
  {value: 'coach', content: 'Тренер'},
  {value: 'team_admin', content: 'Админ команды'},
  {value: 'player', content: 'Игрок'},
]

const POSITION_ORDER = ['goalie', 'defense', 'forward', 'any'] as const

/** @spec SPEC-FR-3.2.1 - Props состава */
export interface TeamRosterProps {
  /** @spec SPEC-FR-3.2.1 */
  teamId: string
}

/**
 * @spec SPEC-UI-2.3 - Состав по позициям (крючки-слоты)
 * @spec SPEC-FR-3.2.1 - Отображение состава
 */
export function TeamRoster({teamId}: TeamRosterProps) {
  const queryClient = useQueryClient()
  const currentUserId = 'user-001'
  const {data: roster = [], isLoading} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
  })

  const mutation = useMutation({
    mutationFn: ({userId, rosterStatus}: {userId: string; rosterStatus: RosterMember['rosterStatus']}) =>
      updateRosterMemberStatus(teamId, userId, rosterStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['roster', teamId]})
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({userId, teamRole}: {userId: string; teamRole: NonNullable<RosterMember['teamRole']>}) =>
      updateTeamMemberRole(teamId, userId, teamRole),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['roster', teamId]})
    },
  })

  if (isLoading) return <ScoreboardLoader label="Загрузка состава" />

  const byPosition = POSITION_ORDER.map((pos) => ({
    position: pos,
    members: roster.filter((m) => m.position === pos && m.rosterStatus !== 'removed'),
  }))
  const myRole = roster.find((m) => m.userId === currentUserId)?.teamRole ?? 'player'
  const ownerCount = roster.filter((m) => m.teamRole === 'owner' && m.rosterStatus !== 'removed').length
  const isOwner = myRole === 'owner'
  const canManageRoster = myRole === 'owner' || myRole === 'captain' || myRole === 'team_admin'
  const canManageRoles = canManageRoster

  return (
    <div className="hockey-stack hockey-stack--gap-16">
      <Text color="secondary">
        Твоя роль в команде: {myRole}. {canManageRoles ? 'Доступно управление ролями.' : 'Только просмотр ролей.'}
      </Text>
      {byPosition.map(({position, members}) => (
        <div key={position}>
          <PositionLabel position={position} showFull />
          <div className="hockey-mt-8 hockey-stack hockey-stack--gap-6">
            {members.length === 0 ? (
              <div className="roster-hook-slot roster-hook-slot--deficit">
                <span className="roster-hook-slot__hook" aria-hidden>
                  🪝
                </span>
                <Text color="secondary">Слот пуст — нужен игрок</Text>
              </div>
            ) : (
              members.map((member) => (
                <div key={member.userId} className="roster-hook-slot">
                  <span className="roster-hook-slot__hook" aria-hidden>
                    🪝
                  </span>
                  <div className="roster-hook-slot__body">
                    <Text variant="subheader-2">{member.displayName}</Text>
                    <Text color="secondary">Роль: {member.teamRole ?? 'player'}</Text>
                  </div>
                  <Select
                    value={[member.teamRole ?? 'player']}
                    onUpdate={(v) => {
                      if (!v[0]) return
                      roleMutation.mutate({
                        userId: member.userId,
                        teamRole: v[0] as NonNullable<RosterMember['teamRole']>,
                      })
                    }}
                    options={ROLE_OPTIONS}
                    width={170}
                    disabled={
                      !canManageRoles ||
                      // Передавать owner можно только от owner.
                      (!isOwner && member.teamRole === 'owner') ||
                      // Защита от сценария "снять последнего owner".
                      (isOwner &&
                        member.userId === currentUserId &&
                        member.teamRole === 'owner' &&
                        ownerCount <= 1)
                    }
                  />
                  <Select
                    value={[member.rosterStatus]}
                    onUpdate={(v) =>
                      mutation.mutate({
                        userId: member.userId,
                        rosterStatus: v[0] as RosterMember['rosterStatus'],
                      })
                    }
                    options={STATUS_OPTIONS}
                    width={160}
                    disabled={!canManageRoster}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
