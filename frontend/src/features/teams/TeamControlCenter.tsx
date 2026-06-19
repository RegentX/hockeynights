/**
 * SPEC-FR-21.1.3, SPEC-FR-21.1.4, SPEC-FR-21.1.5
 * SPEC-FR-22.1.1, SPEC-FR-22.1.2, SPEC-UI-2.3
 */

import {useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Text, TextInput} from '@gravity-ui/uikit'
import type {Team, TeamRole} from '@/entities/team/types'
import type {ClubSquad} from '@/entities/club/types'
import type {Chat} from '@/entities/messenger/types'
import {AddTeamMember} from '@/features/teams/AddTeamMember'
import {TeamRoster} from '@/features/teams/TeamRoster'
import {fetchTeamRoster} from '@/features/teams/api/teamsApi'
import {TrainingLineupBoard} from '@/features/teams/TrainingLineupBoard'
import {createChannelOrChat, fetchTeamChats} from '@/features/messenger/api/messengerApi'

const ROLE_PRIORITY: Record<TeamRole, number> = {
  owner: 5,
  captain: 4,
  team_admin: 3,
  coach: 2,
  player: 1,
}

function hasMinRole(role: TeamRole, minRole: TeamRole): boolean {
  return ROLE_PRIORITY[role] >= ROLE_PRIORITY[minRole]
}

export interface TeamControlCenterProps {
  team: Team
  activeSquad?: ClubSquad | null
}

/** @spec SPEC-FR-21.1.5 - Центр управления командой по ролям */
export function TeamControlCenter({team, activeSquad}: TeamControlCenterProps) {
  const queryClient = useQueryClient()
  const currentUserId = 'user-001'
  const [newChannelTitle, setNewChannelTitle] = useState('')
  const [newChannelTag, setNewChannelTag] = useState('')
  const [newChatTitle, setNewChatTitle] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [squadOnly, setSquadOnly] = useState(false)

  const {data: roster = []} = useQuery({
    queryKey: ['roster', team.id],
    queryFn: () => fetchTeamRoster(team.id),
  })
  const {data: teamChats = []} = useQuery({
    queryKey: ['team-chats', team.id],
    queryFn: () => fetchTeamChats(team.id),
  })

  const myRole = (roster.find((m) => m.userId === currentUserId)?.teamRole ?? 'player') as TeamRole
  const canManageRoster = hasMinRole(myRole, 'team_admin')
  const canCreateChannel = hasMinRole(myRole, 'captain')
  const canCreateChat = hasMinRole(myRole, 'coach')
  const canEditLineup = hasMinRole(myRole, 'coach')
  const squadTag = activeSquad?.id

  const createTeamChannelMutation = useMutation({
    mutationFn: (payload: {type: 'channel' | 'team'; title: string; tag?: string}) =>
      createChannelOrChat({
        ...payload,
                tag: payload.tag ?? squadTag,
        relatedEntityId: team.id,
      }),
    onSuccess: (createdChat: Chat) => {
      void queryClient.invalidateQueries({queryKey: ['team-chats', team.id]})
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      if (createdChat.type === 'channel') {
        setNewChannelTitle('')
        setNewChannelTag('')
      } else {
        setNewChatTitle('')
      }
      setStatusMessage(`${createdChat.type === 'channel' ? 'Канал' : 'Чат'} создан для команды.`)
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось создать канал/чат')
    },
  })

  const sortedChats = useMemo(
    () => [...teamChats].sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned))),
    [teamChats],
  )
  const visibleChats = useMemo(() => {
    if (!activeSquad || !squadOnly) return sortedChats
    return sortedChats.filter(
      (chat) =>
        chat.tag === activeSquad.id ||
        chat.title.toLowerCase().includes(activeSquad.name.toLowerCase()) ||
        chat.relatedEntityId === activeSquad.teamId,
    )
  }, [activeSquad, sortedChats, squadOnly])

  return (
    <div className="team-control-center hockey-stack hockey-stack--gap-16">
      <div className="team-control-center__header">
        <Text variant="header-2">Центр управления командой</Text>
        <Text color="secondary">Роль: {myRole}</Text>
      </div>
      {activeSquad && (
        <Text color="secondary">
          Активный состав: {activeSquad.name}
          {activeSquad.season ? ` · ${activeSquad.season}` : ''}
          {activeSquad.teamId && activeSquad.teamId !== team.id ? ' · внешняя команда' : ''}
        </Text>
      )}
      {activeSquad && (
        <Button view={squadOnly ? 'action' : 'outlined'} size="s" onClick={() => setSquadOnly((v) => !v)}>
          {squadOnly ? 'Показываю только активный состав' : 'Фильтр: только активный состав'}
        </Button>
      )}

      <div className="team-control-center__permissions">
        <span className={`team-control-center__badge ${canManageRoster ? 'is-enabled' : ''}`}>
          Состав: {canManageRoster ? 'управление доступно' : 'только просмотр'}
        </span>
        <span className={`team-control-center__badge ${canCreateChannel ? 'is-enabled' : ''}`}>
          Каналы: {canCreateChannel ? 'создание доступно' : 'нужна роль captain+'}
        </span>
        <span className={`team-control-center__badge ${canCreateChat ? 'is-enabled' : ''}`}>
          Чаты: {canCreateChat ? 'создание доступно' : 'нужна роль coach+'}
        </span>
      </div>
      <Text color="secondary">
        Матрица прав (mock): owner/captain/team_admin — роли и состав; coach+ — командные чаты и план тренировки.
      </Text>

      <div className="team-control-center__comms hockey-grid hockey-grid--cards-280">
        <div className="team-control-center__panel hockey-stack hockey-stack--gap-10">
          <Text variant="subheader-2">Каналы и чаты команды</Text>
          {visibleChats.length === 0 ? (
            <Text color="secondary">Пока нет чатов, привязанных к этой команде.</Text>
          ) : (
            visibleChats.map((chat) => (
              <div key={chat.id} className="team-control-center__chat-row">
                <div>
                  <Text>{chat.title}</Text>
                  <Text color="secondary">
                    {chat.type}
                    {chat.tag ? ` · #${chat.tag}` : ''}
                  </Text>
                </div>
                <Link to="/messenger">
                  <Button size="s" view="outlined">
                    Открыть
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="team-control-center__panel hockey-stack hockey-stack--gap-10">
          <Text variant="subheader-2">Создать канал</Text>
          <TextInput
            value={newChannelTitle}
            onChange={(e) => setNewChannelTitle(e.target.value)}
            placeholder="Например: Тактика и разбор"
          />
          <TextInput
            value={newChannelTag}
            onChange={(e) => setNewChannelTag(e.target.value)}
            placeholder={squadTag ? `Тег канала (по умолчанию ${squadTag})` : 'Тег канала (например tactics)'}
          />
          <Button
            view="action"
            disabled={!canCreateChannel || !newChannelTitle.trim()}
            loading={createTeamChannelMutation.isPending}
            onClick={() =>
              createTeamChannelMutation.mutate({
                type: 'channel',
                title: newChannelTitle.trim(),
                tag: newChannelTag.trim() || undefined,
              })
            }
          >
            Создать канал
          </Button>
          {!canCreateChannel && (
            <Text color="secondary">Нужны права капитана или владельца.</Text>
          )}
        </div>

        <div className="team-control-center__panel hockey-stack hockey-stack--gap-10">
          <Text variant="subheader-2">Создать командный чат</Text>
          <TextInput
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            placeholder="Например: Сбор на тренировку"
          />
          <Button
            view="outlined"
            disabled={!canCreateChat || !newChatTitle.trim()}
            loading={createTeamChannelMutation.isPending}
            onClick={() =>
              createTeamChannelMutation.mutate({
                type: 'team',
                title: newChatTitle.trim(),
              })
            }
          >
            Создать чат
          </Button>
          {!canCreateChat && <Text color="secondary">Нужны права coach/team_admin/captain/owner.</Text>}
          {canCreateChat && (
            <Button
              size="s"
              view="outlined"
              onClick={() =>
                createTeamChannelMutation.mutate({
                  type: 'channel',
                  title: `Тренерский штаб · ${team.name}`,
                  tag: activeSquad?.id ? `coach-${activeSquad.id}` : 'coach-staff',
                })
              }
            >
              Быстро создать канал штаба
            </Button>
          )}
        </div>
      </div>

      {statusMessage && <Text color="secondary">{statusMessage}</Text>}

      <TrainingLineupBoard teamId={team.id} canEdit={canEditLineup} activeSquad={activeSquad} />

      {canManageRoster && <AddTeamMember teamId={team.id} />}
      <TeamRoster teamId={team.id} />
    </div>
  )
}
