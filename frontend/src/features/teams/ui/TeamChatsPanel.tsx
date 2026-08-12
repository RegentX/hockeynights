import {Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import type {ClubSquad} from '@/entities/club'
import type {Chat} from '@/entities/messenger'
import {createChannelOrChat, fetchTeamChats} from '@/entities/messenger'
import type {Team, TeamRole} from '@/entities/team'
import {fetchTeamRoster} from '@/entities/team'
import type {TeamPermissions} from '@/features/access'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface TeamChatsPanelProps {
  team: Team
  activeSquad?: ClubSquad | null
  userId: string
  teamPermissions: (teamRole?: TeamRole) => TeamPermissions
}

export function TeamChatsPanel({team, activeSquad, userId, teamPermissions}: TeamChatsPanelProps) {
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

  const myTeamRole = (roster.find((m) => m.userId === userId)?.teamRole ?? 'player') as TeamRole
  const {canCreateChannel, canCreateChat} = teamPermissions(myTeamRole)
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
      className="team-chats-panel hockey-stack hockey-stack--gap-16"
      data-testid={testId('teams', 'team-chats-panel', 'panel', team.id)}
    >
      <div className="team-chats-panel__header">
        <Text
          variant="header-2"
          data-testid={testId('teams', 'team-chats-panel', 'text', 'title', team.id)}
        >
          Чаты команды
        </Text>
        {activeSquad && (
          <HockeyButton
            view={squadOnly ? 'action' : 'outlined'}
            size="s"
            onClick={() => setSquadOnly((v) => !v)}
            data-testid={testId('teams', 'team-chats-panel', 'btn', 'squad-filter', team.id)}
          >
            {squadOnly ? 'Только активный состав' : 'Фильтр по составу'}
          </HockeyButton>
        )}
      </div>

      <div
        className="team-chats-panel__list"
        data-testid={testId('teams', 'team-chats-panel', 'list', 'chats', team.id)}
      >
        {visibleChats.length === 0 ? (
          <Text
            color="secondary"
            data-testid={testId('teams', 'team-chats-panel', 'empty', 'chats', team.id)}
          >
            Пока нет чатов, привязанных к этой команде.
          </Text>
        ) : (
          visibleChats.map((chat) => (
            <div
              key={chat.id}
              className="team-chats-panel__row"
              data-testid={testId('teams', 'team-chats-panel', 'row', 'chat', chat.id)}
            >
              <div className="team-chats-panel__chat-info">
                <Text
                  variant="subheader-2"
                  data-testid={testId('teams', 'team-chats-panel', 'text', 'chat-title', chat.id)}
                >
                  {chat.title}
                </Text>
                <Text
                  color="secondary"
                  data-testid={testId('teams', 'team-chats-panel', 'text', 'chat-meta', chat.id)}
                >
                  {chat.type}
                  {chat.tag ? ` · #${chat.tag}` : ''}
                </Text>
              </div>
              <Link
                to="/messenger"
                data-testid={testId('teams', 'team-chats-panel', 'link', 'chat', chat.id)}
              >
                <HockeyButton
                  size="s"
                  view="outlined"
                  data-testid={testId('teams', 'team-chats-panel', 'btn', 'open-chat', chat.id)}
                >
                  Открыть
                </HockeyButton>
              </Link>
            </div>
          ))
        )}
      </div>

      {(canCreateChannel || canCreateChat) && (
        <div
          className="team-chats-panel__create"
          data-testid={testId('teams', 'team-chats-panel', 'panel', 'create', team.id)}
        >
          {canCreateChannel && (
            <div className="team-chats-panel__form hockey-stack hockey-stack--gap-8">
              <Text
                variant="subheader-2"
                data-testid={testId(
                  'teams',
                  'team-chats-panel',
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
                data-testid={testId('teams', 'team-chats-panel', 'field', 'channel-title', team.id)}
              />
              <TextInput
                value={newChannelTag}
                onChange={(e) => setNewChannelTag(e.target.value)}
                placeholder={squadTag ? `Тег (по умолчанию ${squadTag})` : 'Тег канала'}
                data-testid={testId('teams', 'team-chats-panel', 'field', 'channel-tag', team.id)}
              />
              <HockeyButton
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
                data-testid={testId('teams', 'team-chats-panel', 'btn', 'create-channel', team.id)}
              >
                Создать канал
              </HockeyButton>
            </div>
          )}

          {canCreateChat && (
            <div className="team-chats-panel__form hockey-stack hockey-stack--gap-8">
              <Text
                variant="subheader-2"
                data-testid={testId(
                  'teams',
                  'team-chats-panel',
                  'text',
                  'create-chat-title',
                  team.id,
                )}
              >
                Создать чат
              </Text>
              <TextInput
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="Например: Сбор на тренировку"
                data-testid={testId('teams', 'team-chats-panel', 'field', 'chat-title', team.id)}
              />
              <HockeyButton
                view="outlined"
                disabled={!newChatTitle.trim()}
                loading={createTeamChannelMutation.isPending}
                onClick={() =>
                  createTeamChannelMutation.mutate({
                    type: 'team',
                    title: newChatTitle.trim(),
                  })
                }
                data-testid={testId('teams', 'team-chats-panel', 'btn', 'create-chat', team.id)}
              >
                Создать чат
              </HockeyButton>
            </div>
          )}
        </div>
      )}

      {statusMessage && (
        <Text
          color="secondary"
          data-testid={testId('teams', 'team-chats-panel', 'text', 'status', team.id)}
        >
          {statusMessage}
        </Text>
      )}
    </div>
  )
}
