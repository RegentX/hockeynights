/**
 * SPEC-FR-16.1.1, SPEC-FR-22.1.3 — новый личный чат или вход в публичный чат команды.
 */

import {Magnifier} from '@gravity-ui/icons'
import {Icon, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {Chat} from '@/entities/messenger'
import {
  createDirectChat,
  openDiscoverableChat,
  searchChatUsers,
  searchDiscoverableChats,
} from '@/entities/messenger'
import {parseApiErrorMessage} from '@/shared/api/parseApiError'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {HockeyFormDialog, HockeyFormSection} from '@/shared/ui/HockeyFormDialog'

interface MessengerNewChatDialogProps {
  open: boolean
  onClose: () => void
  onChatReady: (chat: Chat, statusMessage?: string) => void
}

export function MessengerNewChatDialog({open, onClose, onChatReady}: MessengerNewChatDialogProps) {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const trimmed = query.trim()

  const {data: users = [], isFetching: isUsersFetching} = useQuery({
    queryKey: ['messenger-users', trimmed],
    queryFn: () => searchChatUsers(trimmed),
    enabled: open && trimmed.length > 0,
  })
  const {data: teams = []} = useQuery({
    queryKey: ['messenger-discover', trimmed],
    queryFn: () => searchDiscoverableChats(trimmed),
    enabled: open && trimmed.length > 0,
  })

  function finish(chat: Chat, statusMessage?: string) {
    void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
    setQuery('')
    onChatReady(chat, statusMessage)
  }

  const createChatMutation = useMutation({
    mutationFn: createDirectChat,
    onSuccess: (chat) => finish(chat),
  })

  const openTeamChatMutation = useMutation({
    mutationFn: openDiscoverableChat,
    onSuccess: (chat) => finish(chat, `Открыт чат команды «${chat.title}». Можно писать.`),
  })

  const error = createChatMutation.error ?? openTeamChatMutation.error
  const isPending = createChatMutation.isPending || openTeamChatMutation.isPending
  const nothingFound =
    trimmed.length > 0 && !isUsersFetching && users.length === 0 && teams.length === 0

  function handleClose() {
    if (isPending) return
    setQuery('')
    createChatMutation.reset()
    openTeamChatMutation.reset()
    onClose()
  }

  return (
    <HockeyFormDialog
      open={open}
      onClose={handleClose}
      caption="Новый чат"
      description="Найди игрока по имени или команду по названию и тегу."
      maxWidth="m"
      data-testid={testId('messenger', 'new-chat-dialog', 'card')}
      footer={
        <HockeyButton
          view="outlined"
          disabled={isPending}
          onClick={handleClose}
          data-testid={testId('messenger', 'new-chat-dialog', 'btn', 'cancel')}
        >
          Закрыть
        </HockeyButton>
      }
    >
      <TextInput
        size="m"
        value={query}
        hasClear
        onUpdate={setQuery}
        placeholder="Поиск игроков и команд"
        aria-label="Поиск игроков и команд"
        startContent={
          <span className="messenger-hub__search-icon" aria-hidden>
            <Icon data={Magnifier} size={16} />
          </span>
        }
        data-testid={testId('messenger', 'page', 'field', 'search')}
      />

      {error != null && (
        <Text
          color="danger"
          data-testid={testId('messenger', 'new-chat-dialog', 'error', 'create')}
        >
          {parseApiErrorMessage(error, 'Не удалось открыть чат')}
        </Text>
      )}

      {teams.length > 0 && (
        <HockeyFormSection
          title="Команды"
          layout="stack"
          data-testid={testId('messenger', 'page', 'list', 'team-search')}
        >
          {teams.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className="chat-user-search__item"
              disabled={isPending}
              onClick={() => openTeamChatMutation.mutate(chat.id)}
              data-testid={testId('messenger', 'page', 'item', 'team-search', chat.id)}
            >
              <span data-testid={testId('messenger', 'page', 'text', 'team-name', chat.id)}>
                {chat.title}
                {chat.tag ? ` · #${chat.tag}` : ''}
              </span>
              <span
                className="chat-user-search__status is-online"
                data-testid={testId('messenger', 'page', 'badge', 'team-public', chat.id)}
              >
                написать
              </span>
            </button>
          ))}
        </HockeyFormSection>
      )}

      {users.length > 0 && (
        <HockeyFormSection
          title="Игроки"
          layout="stack"
          data-testid={testId('messenger', 'page', 'list', 'user-search')}
        >
          {users.map((user) => (
            <button
              key={user.userId}
              type="button"
              className="chat-user-search__item"
              disabled={isPending}
              onClick={() => createChatMutation.mutate(user.userId)}
              data-testid={testId('messenger', 'page', 'item', 'user-search', user.userId)}
            >
              <span data-testid={testId('messenger', 'page', 'text', 'user-name', user.userId)}>
                {user.displayName}
                {user.position ? ` · ${user.position}` : ''}
              </span>
              <span
                className={`chat-user-search__status ${user.isOnline ? 'is-online' : ''}`}
                data-testid={testId('messenger', 'page', 'badge', 'user-status', user.userId)}
              >
                {user.isOnline ? 'online' : 'offline'}
              </span>
            </button>
          ))}
        </HockeyFormSection>
      )}

      {nothingFound && (
        <Text color="secondary" data-testid={testId('messenger', 'page', 'empty', 'user-search')}>
          Ничего не найдено
        </Text>
      )}
    </HockeyFormDialog>
  )
}
