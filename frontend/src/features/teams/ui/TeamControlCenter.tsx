/**
 * SPEC-FR-21.1.3, SPEC-FR-21.1.4, SPEC-FR-21.1.5
 * SPEC-FR-22.1.1, SPEC-FR-22.1.2, SPEC-UI-2.3
 */

import {Button, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import type {ClubSquad} from '@/entities/club'
import type {Chat} from '@/entities/messenger'
import {createChannelOrChat, fetchTeamChats} from '@/entities/messenger'
import type {Team, TeamRole} from '@/entities/team'
import {fetchTeamRoster} from '@/entities/team'
import type {TeamPermissions} from '@/features/access'
import {AddTeamMember} from '@/features/teams/ui/AddTeamMember'
import {TeamRoster} from '@/features/teams/ui/TeamRoster'
import {TrainingLineupBoard} from '@/features/teams/ui/TrainingLineupBoard'
import {testId} from '@/shared/testing/testId'

export interface TeamControlCenterProps {
  team: Team
  activeSquad?: ClubSquad | null
  userId: string
  teamPermissions: (teamRole?: TeamRole) => TeamPermissions
}

/** @spec SPEC-FR-21.1.5 - Центр управления командой по ролям */
export function TeamControlCenter({
  team,
  activeSquad,
  userId,
  teamPermissions,
}: TeamControlCenterProps) {
  const queryClient = useQueryClient()
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

  const myRole = (roster.find((m) => m.userId === userId)?.teamRole ?? 'player') as TeamRole
  const {canManageRoster, canCreateChannel, canCreateChat, canEditLineup, isReadOnly} =
    teamPermissions(myRole)
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
    <div
      className="team-control-center hockey-stack hockey-stack--gap-16"
      data-testid={testId('teams', 'team-control-center', 'panel', team.id)}
    >
      <div className="team-control-center__header">
        <Text
          variant="header-2"
          data-testid={testId('teams', 'team-control-center', 'text', 'title', team.id)}
        >
          Центр управления командой
        </Text>
        <Text
          color="secondary"
          data-testid={testId('teams', 'team-control-center', 'text', 'role', team.id)}
        >
          Роль: {myRole}
        </Text>
      </div>
      {activeSquad && (
        <Text
          color="secondary"
          data-testid={testId('teams', 'team-control-center', 'text', 'active-squad', team.id)}
        >
          Активный состав: {activeSquad.name}
          {activeSquad.season ? ` · ${activeSquad.season}` : ''}
          {activeSquad.teamId && activeSquad.teamId !== team.id ? ' · внешняя команда' : ''}
        </Text>
      )}
      {activeSquad && (
        <Button
          view={squadOnly ? 'action' : 'outlined'}
          size="s"
          onClick={() => setSquadOnly((v) => !v)}
          data-testid={testId('teams', 'team-control-center', 'btn', 'squad-filter', team.id)}
        >
          {squadOnly ? 'Показываю только активный состав' : 'Фильтр: только активный состав'}
        </Button>
      )}

      <div
        className="team-control-center__permissions"
        data-testid={testId('teams', 'team-control-center', 'panel', 'permissions', team.id)}
      >
        <span
          className={`team-control-center__badge ${canManageRoster ? 'is-enabled' : ''}`}
          data-testid={testId('teams', 'team-control-center', 'badge', 'roster', team.id)}
        >
          Состав: {canManageRoster ? 'управление доступно' : 'только просмотр'}
        </span>
        <span
          className={`team-control-center__badge ${canCreateChannel ? 'is-enabled' : ''}`}
          data-testid={testId('teams', 'team-control-center', 'badge', 'channels', team.id)}
        >
          Каналы:{' '}
          {canCreateChannel
            ? 'создание доступно'
            : isReadOnly
              ? 'недоступно'
              : 'нужна роль captain+'}
        </span>
        <span
          className={`team-control-center__badge ${canCreateChat ? 'is-enabled' : ''}`}
          data-testid={testId('teams', 'team-control-center', 'badge', 'chats', team.id)}
        >
          Чаты:{' '}
          {canCreateChat ? 'создание доступно' : isReadOnly ? 'недоступно' : 'нужна роль coach+'}
        </span>
      </div>
      {!isReadOnly && (
        <Text
          color="secondary"
          data-testid={testId('teams', 'team-control-center', 'text', 'permissions-hint', team.id)}
        >
          Права зависят от роли в сессии (капитан/тренер) и роли в составе команды.
        </Text>
      )}

      <div
        className="team-control-center__comms hockey-grid hockey-grid--cards-280"
        data-testid={testId('teams', 'team-control-center', 'panel', 'comms', team.id)}
      >
        <div
          className="team-control-center__panel hockey-stack hockey-stack--gap-10"
          data-testid={testId('teams', 'team-control-center', 'panel', 'chats-list', team.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('teams', 'team-control-center', 'text', 'chats-title', team.id)}
          >
            Каналы и чаты команды
          </Text>
          {visibleChats.length === 0 ? (
            <Text
              color="secondary"
              data-testid={testId('teams', 'team-control-center', 'empty', 'chats', team.id)}
            >
              Пока нет чатов, привязанных к этой команде.
            </Text>
          ) : (
            visibleChats.map((chat) => (
              <div
                key={chat.id}
                className="team-control-center__chat-row"
                data-testid={testId('teams', 'team-control-center', 'row', 'chat', chat.id)}
              >
                <div>
                  <Text
                    data-testid={testId(
                      'teams',
                      'team-control-center',
                      'text',
                      'chat-title',
                      chat.id,
                    )}
                  >
                    {chat.title}
                  </Text>
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'teams',
                      'team-control-center',
                      'text',
                      'chat-meta',
                      chat.id,
                    )}
                  >
                    {chat.type}
                    {chat.tag ? ` · #${chat.tag}` : ''}
                  </Text>
                </div>
                <Link
                  to="/messenger"
                  data-testid={testId('teams', 'team-control-center', 'link', 'chat', chat.id)}
                >
                  <Button
                    size="s"
                    view="outlined"
                    data-testid={testId(
                      'teams',
                      'team-control-center',
                      'btn',
                      'open-chat',
                      chat.id,
                    )}
                  >
                    Открыть
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>

        {canCreateChannel && (
          <div
            className="team-control-center__panel hockey-stack hockey-stack--gap-10"
            data-testid={testId('teams', 'team-control-center', 'panel', 'create-channel', team.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId(
                'teams',
                'team-control-center',
                'text',
                'create-channel-title',
                team.id,
              )}
            >
              Создать канал
            </Text>
            <TextInput
              value={newChannelTitle}
              onChange={(e) => setNewChannelTitle(e.target.value)}
              placeholder="Например: Тактика и разбор"
              data-testid={testId(
                'teams',
                'team-control-center',
                'field',
                'channel-title',
                team.id,
              )}
            />
            <TextInput
              value={newChannelTag}
              onChange={(e) => setNewChannelTag(e.target.value)}
              placeholder={
                squadTag ? `Тег канала (по умолчанию ${squadTag})` : 'Тег канала (например tactics)'
              }
              data-testid={testId('teams', 'team-control-center', 'field', 'channel-tag', team.id)}
            />
            <Button
              view="action"
              disabled={!newChannelTitle.trim()}
              loading={createTeamChannelMutation.isPending}
              onClick={() =>
                createTeamChannelMutation.mutate({
                  type: 'channel',
                  title: newChannelTitle.trim(),
                  tag: newChannelTag.trim() || undefined,
                })
              }
              data-testid={testId('teams', 'team-control-center', 'btn', 'create-channel', team.id)}
            >
              Создать канал
            </Button>
          </div>
        )}

        {canCreateChat && (
          <div
            className="team-control-center__panel hockey-stack hockey-stack--gap-10"
            data-testid={testId('teams', 'team-control-center', 'panel', 'create-chat', team.id)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId(
                'teams',
                'team-control-center',
                'text',
                'create-chat-title',
                team.id,
              )}
            >
              Создать командный чат
            </Text>
            <TextInput
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              placeholder="Например: Сбор на тренировку"
              data-testid={testId('teams', 'team-control-center', 'field', 'chat-title', team.id)}
            />
            <Button
              view="outlined"
              disabled={!newChatTitle.trim()}
              loading={createTeamChannelMutation.isPending}
              onClick={() =>
                createTeamChannelMutation.mutate({
                  type: 'team',
                  title: newChatTitle.trim(),
                })
              }
              data-testid={testId('teams', 'team-control-center', 'btn', 'create-chat', team.id)}
            >
              Создать чат
            </Button>
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
              data-testid={testId(
                'teams',
                'team-control-center',
                'btn',
                'create-staff-channel',
                team.id,
              )}
            >
              Быстро создать канал штаба
            </Button>
          </div>
        )}
      </div>

      {statusMessage && (
        <Text
          color="secondary"
          data-testid={testId('teams', 'team-control-center', 'text', 'status', team.id)}
        >
          {statusMessage}
        </Text>
      )}

      <TrainingLineupBoard teamId={team.id} canEdit={canEditLineup} activeSquad={activeSquad} />

      {canManageRoster && <AddTeamMember teamId={team.id} />}
      <TeamRoster teamId={team.id} userId={userId} teamPermissions={teamPermissions} />
    </div>
  )
}
