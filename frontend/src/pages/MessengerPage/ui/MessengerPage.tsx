/**
 * SPEC-FR-16.1.1, SPEC-FR-22.1.1, SPEC-FR-22.1.2, SPEC-FR-22.1.3
 * SPEC-UI-8.1, SPEC-UI-8.5
 */

import {PaperPlane} from '@gravity-ui/icons'
import {Button, Icon, Switch, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'
import {useSearchParams} from 'react-router-dom'

import type {
  ChannelSettings,
  ChannelSettingsPatch,
  Chat,
  ChatTopic,
  ChatUser,
  Message,
} from '@/entities/messenger'
import {
  createChannelOrChat,
  createChatTopic,
  createDirectChat,
  fetchChannelSettings,
  fetchChatMessagesByTopic,
  fetchChats,
  fetchChatTopics,
  searchChatUsers,
  toggleChatPin,
  updateChannelSettings,
} from '@/entities/messenger'
import {ChatBubble} from '@/features/messenger'
import {testId} from '@/shared/testing/testId'

const MOBILE_BREAKPOINT = '(max-width: 768px)'

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_BREAKPOINT).matches
}

const PINNED_FILTER = 'pinned'

type ComposerMode = 'none' | 'chat' | 'channel'
const ROLE_OPTIONS = ['owner', 'captain', 'coach', 'team_admin', 'player'] as const
const SLOW_MODE_OPTIONS: Array<0 | 10 | 30 | 60> = [0, 10, 30, 60]

export function MessengerPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const chatIdFromUrl = searchParams.get('chatId')
  const {data: chats = []} = useQuery({
    queryKey: ['messenger-chats'],
    queryFn: fetchChats,
  })
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [isMobile, setIsMobile] = useState(isMobileViewport)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'pinned'>('all')
  const [composerMode, setComposerMode] = useState<ComposerMode>('none')
  const [newEntityTitle, setNewEntityTitle] = useState('')
  const [newEntityTag, setNewEntityTag] = useState('')
  const [newEntityRestricted, setNewEntityRestricted] = useState(false)
  const [newEntityMembers, setNewEntityMembers] = useState<string[]>([])
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicTag, setNewTopicTag] = useState('')
  const [newTopicRestricted, setNewTopicRestricted] = useState(false)
  const [newTopicMembers, setNewTopicMembers] = useState<string[]>([])
  const [showTopicComposer, setShowTopicComposer] = useState(false)
  const [showChannelSettings, setShowChannelSettings] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  function clearChatIdFromUrl() {
    if (!searchParams.has('chatId')) return
    const next = new URLSearchParams(searchParams)
    next.delete('chatId')
    setSearchParams(next, {replace: true})
  }

  const {data: users = []} = useQuery({
    queryKey: ['messenger-users', searchQuery],
    queryFn: () => searchChatUsers(searchQuery),
  })
  const {data: allUsers = []} = useQuery({
    queryKey: ['messenger-users', '__all__'],
    queryFn: () => searchChatUsers(''),
  })

  const createChatMutation = useMutation({
    mutationFn: (targetUserId: string) => createDirectChat(targetUserId),
    onSuccess: (chat) => {
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      clearChatIdFromUrl()
      setSelectedChatId(chat.id)
      setMobileView('chat')
    },
  })

  const createEntityMutation = useMutation({
    mutationFn: (payload: {
      type: 'channel' | 'team'
      title: string
      tag?: string
      restrictedUserIds?: string[]
    }) => createChannelOrChat(payload),
    onSuccess: (chat) => {
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      clearChatIdFromUrl()
      setSelectedChatId(chat.id)
      setComposerMode('none')
      setNewEntityTitle('')
      setNewEntityTag('')
      setNewEntityRestricted(false)
      setNewEntityMembers([])
      setStatusMessage(`${chat.type === 'channel' ? 'Канал' : 'Чат'} создан.`)
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось создать канал/чат')
    },
  })

  const pinChatMutation = useMutation({
    mutationFn: ({chatId, pinned}: {chatId: string; pinned?: boolean}) =>
      toggleChatPin(chatId, pinned),
    onSuccess: (chat) => {
      queryClient.setQueryData<Chat[]>(['messenger-chats'], (prev = []) =>
        prev.map((item) => (item.id === chat.id ? chat : item)),
      )
    },
  })

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT)
    const update = () => {
      const mobile = mq.matches
      setIsMobile((prev) => {
        if (!prev && mobile) {
          setMobileView('list')
        }
        return mobile
      })
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const sortedChats = useMemo(() => {
    const ranked = [...chats].sort(
      (a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)),
    )
    if (filterMode === PINNED_FILTER) {
      return ranked.filter((chat) => chat.isPinned)
    }
    return ranked
  }, [chats, filterMode])

  const activeChatId =
    selectedChatId ?? chatIdFromUrl ?? (!isMobile && sortedChats[0]?.id ? sortedChats[0].id : null)
  /** Deep-link держит chat-view, пока пользователь не сменил чат / не нажал «назад». */
  const activeMobileView: 'list' | 'chat' = chatIdFromUrl && !selectedChatId ? 'chat' : mobileView
  const selectedChat = sortedChats.find((c) => c.id === activeChatId)
  const isChannelChat = selectedChat?.type === 'channel'
  const showChannelSettingsPanel = showChannelSettings && isChannelChat

  const {data: topics = []} = useQuery({
    queryKey: ['messenger-topics', activeChatId],
    queryFn: () => fetchChatTopics(activeChatId!),
    enabled: Boolean(activeChatId),
  })

  const activeTopicId =
    selectedTopicId && topics.some((topic) => topic.id === selectedTopicId)
      ? selectedTopicId
      : (topics[0]?.id ?? null)

  const {data: messages = [], isLoading: isLoadingMessages} = useQuery({
    queryKey: ['messenger-messages', activeChatId, activeTopicId],
    queryFn: () => fetchChatMessagesByTopic(activeChatId!, activeTopicId ?? undefined),
    enabled: Boolean(activeChatId),
  })
  const {data: channelSettings} = useQuery({
    queryKey: ['messenger-channel-settings', activeChatId],
    queryFn: () => fetchChannelSettings(activeChatId!),
    enabled: Boolean(activeChatId && isChannelChat),
  })

  const updateChannelSettingsMutation = useMutation({
    mutationFn: ({chatId, patch}: {chatId: string; patch: ChannelSettingsPatch}) =>
      updateChannelSettings(chatId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['messenger-channel-settings', activeChatId]})
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      setStatusMessage('Настройки канала обновлены.')
    },
    onError: (error) => {
      setStatusMessage(
        error instanceof Error ? error.message : 'Не удалось обновить настройки канала',
      )
    },
  })

  const createTopicMutation = useMutation({
    mutationFn: ({
      chatId,
      payload,
    }: {
      chatId: string
      payload: {title: string; tag?: string; restrictedUserIds?: string[]}
    }) => createChatTopic(chatId, payload),
    onSuccess: (topic) => {
      void queryClient.invalidateQueries({queryKey: ['messenger-topics', activeChatId]})
      setSelectedTopicId(topic.id)
      setShowTopicComposer(false)
      setNewTopicTitle('')
      setNewTopicTag('')
      setNewTopicRestricted(false)
      setNewTopicMembers([])
      setStatusMessage('Тема создана.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось создать тему')
    },
  })

  const handleSelectChat = (chatId: string) => {
    clearChatIdFromUrl()
    setSelectedChatId(chatId)
    if (isMobileViewport()) {
      setMobileView('chat')
    }
  }

  const handleMobileBack = () => {
    clearChatIdFromUrl()
    setSelectedChatId(null)
    setMobileView('list')
  }

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChatId) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId: activeChatId,
      senderId: 'me',
      senderName: 'Я',
      type: 'text',
      content: inputText,
      topicId: activeTopicId ?? undefined,
      timestamp: new Date().toISOString(),
    }

    queryClient.setQueryData<Message[]>(
      ['messenger-messages', activeChatId, activeTopicId],
      (prev = []) => [...prev, newMessage],
    )
    setInputText('')
  }

  const layoutClass = [
    'messenger-layout',
    isMobile ? 'messenger-layout--mobile' : '',
    isMobile && activeMobileView === 'chat' ? 'messenger-layout--mobile-chat' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const availableTopicMembers = useMemo<ChatUser[]>(
    () =>
      selectedChat?.memberIds?.length
        ? allUsers.filter((user) => selectedChat.memberIds?.includes(user.userId))
        : allUsers,
    [allUsers, selectedChat],
  )

  function handleCreateDirectChat(targetUserId: string) {
    createChatMutation.mutate(targetUserId)
  }

  function handleToggleChatPin(chatId: string, pinned?: boolean) {
    pinChatMutation.mutate({chatId, pinned})
  }

  function toggleMemberSelection(
    memberIds: string[],
    userId: string,
    setMembers: (next: string[]) => void,
  ) {
    setMembers(
      memberIds.includes(userId) ? memberIds.filter((id) => id !== userId) : [...memberIds, userId],
    )
  }

  function handleCreateEntity() {
    const title = newEntityTitle.trim()
    if (!title) {
      setStatusMessage('Укажи название канала или чата.')
      return
    }
    createEntityMutation.mutate({
      type: composerMode === 'channel' ? 'channel' : 'team',
      title,
      tag: newEntityTag.trim() || undefined,
      restrictedUserIds: newEntityRestricted ? newEntityMembers : undefined,
    })
  }

  function handleCreateTopic() {
    if (!activeChatId) return
    const title = newTopicTitle.trim()
    if (!title) {
      setStatusMessage('Укажи название темы.')
      return
    }
    createTopicMutation.mutate({
      chatId: activeChatId,
      payload: {
        title,
        tag: newTopicTag.trim() || undefined,
        restrictedUserIds: newTopicRestricted ? newTopicMembers : undefined,
      },
    })
  }

  function handleChannelSettingsPatch(patch: ChannelSettingsPatch) {
    if (!activeChatId || selectedChat?.type !== 'channel') return
    updateChannelSettingsMutation.mutate({chatId: activeChatId, patch})
  }

  function getChatSubtitle(chat: Chat): string {
    if (chat.isTyping) return 'печатает...'
    if (chat.lastMessage) return chat.lastMessage.content
    if (chat.type === 'team') return 'Групповой чат команды'
    return 'Сообщений пока нет'
  }

  return (
    <div className={layoutClass} data-testid={testId('messenger', 'page', 'page')}>
      <div
        className="messenger-sidebar"
        data-testid={testId('messenger', 'page', 'nav', 'sidebar')}
      >
        <div
          className="messenger-title messenger-title--stack"
          data-testid={testId('messenger', 'page', 'panel', 'sidebar-header')}
        >
          <Text variant="header-2" data-testid={testId('messenger', 'page', 'text', 'title')}>
            Мессенджер
          </Text>
          <div
            className="messenger-toolbar"
            data-testid={testId('messenger', 'page', 'nav', 'toolbar')}
          >
            <Button
              size="s"
              view={filterMode === 'all' ? 'action' : 'outlined'}
              onClick={() => setFilterMode('all')}
              data-testid={testId('messenger', 'page', 'btn', 'filter-all')}
            >
              Все
            </Button>
            <Button
              size="s"
              view={filterMode === 'pinned' ? 'action' : 'outlined'}
              onClick={() => setFilterMode('pinned')}
              data-testid={testId('messenger', 'page', 'btn', 'filter-pinned')}
            >
              Важные
            </Button>
            <Button
              size="s"
              view={composerMode === 'channel' ? 'action' : 'outlined'}
              onClick={() => setComposerMode((prev) => (prev === 'channel' ? 'none' : 'channel'))}
              data-testid={testId('messenger', 'page', 'btn', 'new-channel')}
            >
              Новый канал
            </Button>
            <Button
              size="s"
              view={composerMode === 'chat' ? 'action' : 'outlined'}
              onClick={() => setComposerMode((prev) => (prev === 'chat' ? 'none' : 'chat'))}
              data-testid={testId('messenger', 'page', 'btn', 'new-chat')}
            >
              Новый чат
            </Button>
          </div>
          {composerMode !== 'none' && (
            <div
              className="messenger-composer hockey-stack hockey-stack--gap-8"
              data-testid={testId('messenger', 'page', 'form', 'entity-composer')}
            >
              <TextInput
                value={newEntityTitle}
                onChange={(e) => setNewEntityTitle(e.target.value)}
                placeholder={composerMode === 'channel' ? 'Название канала' : 'Название чата'}
                data-testid={testId('messenger', 'page', 'field', 'entity-title')}
              />
              <TextInput
                value={newEntityTag}
                onChange={(e) => setNewEntityTag(e.target.value)}
                placeholder="Тег (например, #goalies)"
                data-testid={testId('messenger', 'page', 'field', 'entity-tag')}
              />
              <label
                className="messenger-composer__switch"
                data-testid={testId('messenger', 'page', 'field', 'entity-restricted')}
              >
                <span data-testid={testId('messenger', 'page', 'text', 'entity-restricted-label')}>
                  Только для особых участников
                </span>
                <Switch
                  checked={newEntityRestricted}
                  onUpdate={(value) => {
                    setNewEntityRestricted(value)
                    if (!value) setNewEntityMembers([])
                  }}
                  data-testid={testId('messenger', 'page', 'checkbox', 'entity-restricted')}
                />
              </label>
              {newEntityRestricted && (
                <div
                  className="messenger-member-list"
                  data-testid={testId('messenger', 'page', 'list', 'entity-members')}
                >
                  {allUsers.map((user) => (
                    <button
                      key={user.userId}
                      type="button"
                      className={`messenger-member-pill ${
                        newEntityMembers.includes(user.userId) ? 'is-selected' : ''
                      }`}
                      onClick={() =>
                        toggleMemberSelection(newEntityMembers, user.userId, setNewEntityMembers)
                      }
                      data-testid={testId(
                        'messenger',
                        'page',
                        'item',
                        'entity-member',
                        user.userId,
                      )}
                    >
                      {user.displayName}
                    </button>
                  ))}
                </div>
              )}
              <Button
                size="s"
                view="action"
                loading={createEntityMutation.isPending}
                onClick={handleCreateEntity}
                data-testid={testId('messenger', 'page', 'btn', 'create-entity')}
              >
                Создать
              </Button>
            </div>
          )}
          <TextInput
            size="m"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск игроков и новый чат"
            data-testid={testId('messenger', 'page', 'field', 'search')}
          />
          {searchQuery.trim().length > 0 && (
            <div
              className="chat-user-search"
              data-testid={testId('messenger', 'page', 'list', 'user-search')}
            >
              {users.map((user) => (
                <button
                  key={user.userId}
                  type="button"
                  className="chat-user-search__item"
                  onClick={() => handleCreateDirectChat(user.userId)}
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
              {users.length === 0 && (
                <Text
                  variant="body-1"
                  color="secondary"
                  data-testid={testId('messenger', 'page', 'empty', 'user-search')}
                >
                  Игроков по запросу не найдено
                </Text>
              )}
            </div>
          )}
        </div>
        <div className="chat-list" data-testid={testId('messenger', 'page', 'list', 'chats')}>
          {sortedChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${activeChatId === chat.id ? 'chat-item--selected' : ''}`}
              data-testid={testId('messenger', 'page', 'item', 'chat', chat.id)}
            >
              <button
                type="button"
                className="chat-item__open"
                onClick={() => handleSelectChat(chat.id)}
                data-testid={testId('messenger', 'page', 'btn', 'open-chat', chat.id)}
              >
                <span
                  className="chat-item__avatar"
                  aria-hidden
                  data-testid={testId('messenger', 'page', 'badge', 'chat-avatar', chat.id)}
                >
                  {chat.title.slice(0, 1)}
                </span>
                <span
                  className="chat-item__info"
                  data-testid={testId('messenger', 'page', 'panel', 'chat-info', chat.id)}
                >
                  <Text
                    variant="body-2"
                    className="chat-item__title"
                    data-testid={testId('messenger', 'page', 'text', 'chat-title', chat.id)}
                  >
                    {chat.isPinned ? '📌 ' : ''}
                    {chat.title}
                    {chat.isOnline ? ' · online' : ''}
                  </Text>
                  <Text
                    variant="caption-1"
                    className={`chat-item__last-msg ${chat.isTyping ? 'is-typing' : ''}`}
                    color="secondary"
                    data-testid={testId('messenger', 'page', 'text', 'chat-subtitle', chat.id)}
                  >
                    {getChatSubtitle(chat)}
                  </Text>
                </span>
                {chat.unreadCount > 0 && (
                  <span
                    className="chat-item__unread"
                    data-testid={testId('messenger', 'page', 'badge', 'chat-unread', chat.id)}
                  >
                    {chat.unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                className={`chat-item__pin ${chat.isPinned ? 'is-pinned' : ''}`}
                aria-label={chat.isPinned ? 'Открепить чат' : 'Закрепить чат'}
                title={chat.isPinned ? 'Открепить' : 'Закрепить'}
                onClick={() => handleToggleChatPin(chat.id)}
                data-testid={testId('messenger', 'page', 'btn', 'pin-chat', chat.id)}
              >
                📌
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="messenger-main" data-testid={testId('messenger', 'page', 'panel', 'main')}>
        {activeChatId ? (
          <>
            <div
              className="messenger-header"
              data-testid={testId('messenger', 'page', 'panel', 'header')}
            >
              {isMobile && (
                <button
                  type="button"
                  className="messenger-back"
                  onClick={handleMobileBack}
                  aria-label="Назад к списку чатов"
                  data-testid={testId('messenger', 'page', 'btn', 'back')}
                >
                  ←
                </button>
              )}
              <div
                className="messenger-header__title"
                data-testid={testId('messenger', 'page', 'panel', 'header-title')}
              >
                <Text
                  variant="subheader-2"
                  data-testid={testId('messenger', 'page', 'text', 'active-chat-title')}
                >
                  {selectedChat?.title}
                </Text>
                {selectedChat?.isTyping && (
                  <Text
                    variant="body-1"
                    color="secondary"
                    data-testid={testId('messenger', 'page', 'text', 'typing')}
                  >
                    печатает...
                  </Text>
                )}
              </div>
              {selectedChat && (
                <div
                  className="messenger-header__actions"
                  data-testid={testId('messenger', 'page', 'nav', 'header-actions')}
                >
                  <Button
                    size="s"
                    view={selectedChat.isPinned ? 'action' : 'outlined'}
                    onClick={() => handleToggleChatPin(selectedChat.id)}
                    loading={pinChatMutation.isPending}
                    data-testid={testId('messenger', 'page', 'btn', 'toggle-pin', selectedChat.id)}
                  >
                    {selectedChat.isPinned ? 'Открепить' : 'Закрепить'}
                  </Button>
                  <Button
                    size="s"
                    view={showTopicComposer ? 'action' : 'outlined'}
                    onClick={() => setShowTopicComposer((prev) => !prev)}
                    data-testid={testId('messenger', 'page', 'btn', 'new-topic', selectedChat.id)}
                  >
                    Новая тема
                  </Button>
                  {isChannelChat && (
                    <Button
                      size="s"
                      view={showChannelSettings ? 'action' : 'outlined'}
                      onClick={() => setShowChannelSettings((prev) => !prev)}
                      data-testid={testId(
                        'messenger',
                        'page',
                        'btn',
                        'channel-settings',
                        selectedChat.id,
                      )}
                    >
                      Настройки канала
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div
              className="messenger-topics"
              data-testid={testId('messenger', 'page', 'nav', 'topics')}
            >
              {topics.map((topic: ChatTopic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`messenger-topics__item ${activeTopicId === topic.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedTopicId(topic.id)}
                  data-testid={testId('messenger', 'page', 'tab', 'topic', topic.id)}
                >
                  <span data-testid={testId('messenger', 'page', 'text', 'topic-title', topic.id)}>
                    {topic.title}
                  </span>
                  {topic.tag && (
                    <small
                      data-testid={testId('messenger', 'page', 'badge', 'topic-tag', topic.id)}
                    >
                      #{topic.tag}
                    </small>
                  )}
                  {topic.restrictedUserIds && topic.restrictedUserIds.length > 0 && (
                    <small
                      data-testid={testId('messenger', 'page', 'badge', 'topic-locked', topic.id)}
                    >
                      🔒
                    </small>
                  )}
                </button>
              ))}
              {topics.length === 0 && (
                <Text
                  variant="caption-1"
                  color="secondary"
                  data-testid={testId('messenger', 'page', 'empty', 'topics')}
                >
                  В этом чате пока нет тем.
                </Text>
              )}
            </div>
            {showTopicComposer && selectedChat && (
              <div
                className="messenger-topic-composer hockey-stack hockey-stack--gap-8"
                data-testid={testId('messenger', 'page', 'form', 'topic-composer')}
              >
                <TextInput
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Название темы"
                  data-testid={testId('messenger', 'page', 'field', 'topic-title')}
                />
                <TextInput
                  value={newTopicTag}
                  onChange={(e) => setNewTopicTag(e.target.value)}
                  placeholder="Тег темы (например, roster)"
                  data-testid={testId('messenger', 'page', 'field', 'topic-tag')}
                />
                <label
                  className="messenger-composer__switch"
                  data-testid={testId('messenger', 'page', 'field', 'topic-restricted')}
                >
                  <span data-testid={testId('messenger', 'page', 'text', 'topic-restricted-label')}>
                    Ограничить доступ к теме
                  </span>
                  <Switch
                    checked={newTopicRestricted}
                    onUpdate={(value) => {
                      setNewTopicRestricted(value)
                      if (!value) setNewTopicMembers([])
                    }}
                    data-testid={testId('messenger', 'page', 'checkbox', 'topic-restricted')}
                  />
                </label>
                {newTopicRestricted && (
                  <div
                    className="messenger-member-list"
                    data-testid={testId('messenger', 'page', 'list', 'topic-members')}
                  >
                    {availableTopicMembers.map((user) => (
                      <button
                        key={user.userId}
                        type="button"
                        className={`messenger-member-pill ${
                          newTopicMembers.includes(user.userId) ? 'is-selected' : ''
                        }`}
                        onClick={() =>
                          toggleMemberSelection(newTopicMembers, user.userId, setNewTopicMembers)
                        }
                        data-testid={testId(
                          'messenger',
                          'page',
                          'item',
                          'topic-member',
                          user.userId,
                        )}
                      >
                        {user.displayName}
                      </button>
                    ))}
                  </div>
                )}
                <Button
                  size="s"
                  view="action"
                  loading={createTopicMutation.isPending}
                  onClick={handleCreateTopic}
                  data-testid={testId('messenger', 'page', 'btn', 'create-topic')}
                >
                  Создать тему
                </Button>
              </div>
            )}
            {showChannelSettingsPanel && channelSettings && (
              <div
                className="messenger-channel-settings hockey-stack hockey-stack--gap-10"
                data-testid={testId('messenger', 'page', 'panel', 'channel-settings')}
              >
                <Text
                  variant="subheader-2"
                  data-testid={testId('messenger', 'page', 'text', 'channel-settings-title')}
                >
                  Настройки канала
                </Text>
                <div
                  className="messenger-channel-settings__grid"
                  data-testid={testId('messenger', 'page', 'form', 'channel-settings')}
                >
                  <TextInput
                    value={channelSettings.channelTag ?? ''}
                    onChange={(e) =>
                      handleChannelSettingsPatch({channelTag: e.target.value.trim() || undefined})
                    }
                    placeholder="Тег канала (например announcements)"
                    data-testid={testId('messenger', 'page', 'field', 'channel-tag')}
                  />
                  <label
                    className="messenger-composer__switch"
                    data-testid={testId('messenger', 'page', 'field', 'channel-mute')}
                  >
                    <span data-testid={testId('messenger', 'page', 'text', 'channel-mute-label')}>
                      Отключить уведомления
                    </span>
                    <Switch
                      checked={channelSettings.notifications.muted}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({notifications: {muted: value}})
                      }
                      data-testid={testId('messenger', 'page', 'checkbox', 'channel-mute')}
                    />
                  </label>
                  <label
                    className="messenger-composer__switch"
                    data-testid={testId('messenger', 'page', 'field', 'channel-mentions-only')}
                  >
                    <span
                      data-testid={testId(
                        'messenger',
                        'page',
                        'text',
                        'channel-mentions-only-label',
                      )}
                    >
                      Только упоминания
                    </span>
                    <Switch
                      checked={channelSettings.notifications.mentionsOnly}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({notifications: {mentionsOnly: value}})
                      }
                      data-testid={testId('messenger', 'page', 'checkbox', 'channel-mentions-only')}
                    />
                  </label>
                  <label
                    className="messenger-composer__switch"
                    data-testid={testId('messenger', 'page', 'field', 'channel-important-only')}
                  >
                    <span
                      data-testid={testId(
                        'messenger',
                        'page',
                        'text',
                        'channel-important-only-label',
                      )}
                    >
                      Только важные
                    </span>
                    <Switch
                      checked={channelSettings.notifications.importantOnly}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({notifications: {importantOnly: value}})
                      }
                      data-testid={testId(
                        'messenger',
                        'page',
                        'checkbox',
                        'channel-important-only',
                      )}
                    />
                  </label>
                  <label
                    className="messenger-composer__switch"
                    data-testid={testId('messenger', 'page', 'field', 'channel-push')}
                  >
                    <span data-testid={testId('messenger', 'page', 'text', 'channel-push-label')}>
                      Push-уведомления
                    </span>
                    <Switch
                      checked={channelSettings.notifications.pushEnabled}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({notifications: {pushEnabled: value}})
                      }
                      data-testid={testId('messenger', 'page', 'checkbox', 'channel-push')}
                    />
                  </label>
                  <label
                    className="messenger-channel-settings__field"
                    data-testid={testId('messenger', 'page', 'field', 'channel-publish-role')}
                  >
                    <span
                      data-testid={testId(
                        'messenger',
                        'page',
                        'text',
                        'channel-publish-role-label',
                      )}
                    >
                      Писать в канал может роль не ниже
                    </span>
                    <select
                      value={channelSettings.permissions.publishMinRole}
                      onChange={(e) =>
                        handleChannelSettingsPatch({
                          permissions: {
                            publishMinRole: e.target
                              .value as ChannelSettings['permissions']['publishMinRole'],
                          },
                        })
                      }
                      data-testid={testId('messenger', 'page', 'select', 'channel-publish-role')}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option
                          key={role}
                          value={role}
                          data-testid={testId('messenger', 'page', 'item', 'publish-role', role)}
                        >
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label
                    className="messenger-channel-settings__field"
                    data-testid={testId('messenger', 'page', 'field', 'channel-manage-role')}
                  >
                    <span
                      data-testid={testId('messenger', 'page', 'text', 'channel-manage-role-label')}
                    >
                      Управлять участниками может роль не ниже
                    </span>
                    <select
                      value={channelSettings.permissions.manageMembersMinRole}
                      onChange={(e) =>
                        handleChannelSettingsPatch({
                          permissions: {
                            manageMembersMinRole: e.target
                              .value as ChannelSettings['permissions']['manageMembersMinRole'],
                          },
                        })
                      }
                      data-testid={testId('messenger', 'page', 'select', 'channel-manage-role')}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option
                          key={role}
                          value={role}
                          data-testid={testId('messenger', 'page', 'item', 'manage-role', role)}
                        >
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label
                    className="messenger-composer__switch"
                    data-testid={testId('messenger', 'page', 'field', 'channel-topic-creation')}
                  >
                    <span
                      data-testid={testId(
                        'messenger',
                        'page',
                        'text',
                        'channel-topic-creation-label',
                      )}
                    >
                      Разрешить создание тем участникам
                    </span>
                    <Switch
                      checked={channelSettings.permissions.allowTopicCreation}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({permissions: {allowTopicCreation: value}})
                      }
                      data-testid={testId(
                        'messenger',
                        'page',
                        'checkbox',
                        'channel-topic-creation',
                      )}
                    />
                  </label>
                  <label
                    className="messenger-channel-settings__field"
                    data-testid={testId('messenger', 'page', 'field', 'channel-slow-mode')}
                  >
                    <span
                      data-testid={testId('messenger', 'page', 'text', 'channel-slow-mode-label')}
                    >
                      Slow mode (сек)
                    </span>
                    <select
                      value={String(channelSettings.slowModeSeconds)}
                      onChange={(e) =>
                        handleChannelSettingsPatch({
                          slowModeSeconds: Number(
                            e.target.value,
                          ) as ChannelSettings['slowModeSeconds'],
                        })
                      }
                      data-testid={testId('messenger', 'page', 'select', 'channel-slow-mode')}
                    >
                      {SLOW_MODE_OPTIONS.map((value) => (
                        <option
                          key={value}
                          value={value}
                          data-testid={testId('messenger', 'page', 'item', 'slow-mode', value)}
                        >
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div
                  className="messenger-channel-settings__audit"
                  data-testid={testId('messenger', 'page', 'list', 'channel-audit')}
                >
                  <Text
                    variant="subheader-2"
                    data-testid={testId('messenger', 'page', 'text', 'channel-audit-title')}
                  >
                    История изменений
                  </Text>
                  {channelSettings.audit.length === 0 ? (
                    <Text
                      variant="caption-1"
                      color="secondary"
                      data-testid={testId('messenger', 'page', 'empty', 'channel-audit')}
                    >
                      Пока нет изменений.
                    </Text>
                  ) : (
                    channelSettings.audit.map((entry) => (
                      <div
                        key={entry.id}
                        className="messenger-channel-settings__audit-item"
                        data-testid={testId('messenger', 'page', 'item', 'audit', entry.id)}
                      >
                        <Text
                          variant="caption-1"
                          data-testid={testId(
                            'messenger',
                            'page',
                            'text',
                            'audit-action',
                            entry.id,
                          )}
                        >
                          {entry.actorName}: {entry.action}
                        </Text>
                        <Text
                          variant="caption-1"
                          color="secondary"
                          data-testid={testId('messenger', 'page', 'text', 'audit-time', entry.id)}
                        >
                          {new Date(entry.createdAt).toLocaleString('ru-RU')}
                        </Text>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            <div
              className="messenger-messages"
              data-testid={testId('messenger', 'page', 'feed', 'messages')}
            >
              {isLoadingMessages && messages.length === 0 ? (
                <Text
                  variant="body-2"
                  color="secondary"
                  data-testid={testId('messenger', 'page', 'loader', 'messages')}
                >
                  Загрузка сообщений...
                </Text>
              ) : messages.length === 0 ? (
                <Text
                  variant="body-2"
                  color="secondary"
                  data-testid={testId('messenger', 'page', 'empty', 'messages')}
                >
                  Сообщений пока нет
                </Text>
              ) : (
                messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} isOwn={msg.senderId === 'me'} />
                ))
              )}
            </div>
            {statusMessage && (
              <div
                className="messenger-status"
                data-testid={testId('messenger', 'page', 'panel', 'status')}
              >
                <Text
                  variant="caption-1"
                  color="secondary"
                  data-testid={testId('messenger', 'page', 'text', 'status')}
                >
                  {statusMessage}
                </Text>
              </div>
            )}
            <div
              className="messenger-input"
              data-testid={testId('messenger', 'page', 'panel', 'input')}
            >
              <TextInput
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Напишите сообщение..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                data-testid={testId('messenger', 'page', 'field', 'message-input')}
              />
              <Button
                view="action"
                onClick={handleSendMessage}
                data-testid={testId('messenger', 'page', 'btn', 'send')}
              >
                <Icon data={PaperPlane} />
              </Button>
            </div>
          </>
        ) : (
          <div
            className="messenger-empty"
            data-testid={testId('messenger', 'page', 'empty', 'no-chat')}
          >
            <Text
              variant="body-2"
              color="secondary"
              data-testid={testId('messenger', 'page', 'text', 'no-chat')}
            >
              Выберите чат, чтобы начать общение
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
