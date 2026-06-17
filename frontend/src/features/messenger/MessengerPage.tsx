/**
 * SPEC-FR-16.1.1, SPEC-FR-22.1.1, SPEC-FR-22.1.2, SPEC-FR-22.1.3
 * SPEC-UI-8.1, SPEC-UI-8.5
 */

import {useEffect, useMemo, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import type {ChannelSettings, ChannelSettingsPatch, Chat, ChatTopic, ChatUser, Message} from '@/entities/messenger/types'
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
} from '@/features/messenger/api/messengerApi'
import {ChatBubble} from './ChatBubble'
import {Text, TextInput, Button, Icon, Switch} from '@gravity-ui/uikit'
import {PaperPlane} from '@gravity-ui/icons'

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
      setSelectedChatId(chat.id)
      setMobileView('chat')
    },
  })

  const createEntityMutation = useMutation({
    mutationFn: (payload: {type: 'channel' | 'team'; title: string; tag?: string; restrictedUserIds?: string[]}) =>
      createChannelOrChat(payload),
    onSuccess: (chat) => {
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
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
    const ranked = [...chats].sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)))
    if (filterMode === PINNED_FILTER) {
      return ranked.filter((chat) => chat.isPinned)
    }
    return ranked
  }, [chats, filterMode])

  const activeChatId =
    selectedChatId ?? (!isMobile && sortedChats[0]?.id ? sortedChats[0].id : null)
  const selectedChat = sortedChats.find((c) => c.id === activeChatId)
  const isChannelChat = selectedChat?.type === 'channel'
  const showChannelSettingsPanel = showChannelSettings && isChannelChat

  const {data: topics = []} = useQuery({
    queryKey: ['messenger-topics', activeChatId],
    queryFn: () => fetchChatTopics(activeChatId!),
    enabled: Boolean(activeChatId),
  })

  const activeTopicId =
    selectedTopicId && topics.some((topic) => topic.id === selectedTopicId) ?
      selectedTopicId
    : topics[0]?.id ?? null

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
    mutationFn: ({
      chatId,
      patch,
    }: {
      chatId: string
      patch: ChannelSettingsPatch
    }) => updateChannelSettings(chatId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['messenger-channel-settings', activeChatId]})
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      setStatusMessage('Настройки канала обновлены.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось обновить настройки канала')
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
    if (isMobileViewport()) {
      setMobileView('chat')
    }
    setSelectedChatId(chatId)
  }

  const handleMobileBack = () => {
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
    isMobile && mobileView === 'chat' ? 'messenger-layout--mobile-chat' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const availableTopicMembers = useMemo<ChatUser[]>(
    () =>
      selectedChat?.memberIds?.length ?
        allUsers.filter((user) => selectedChat.memberIds?.includes(user.userId))
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
    <div className={layoutClass}>
      <div className="messenger-sidebar">
        <div className="messenger-title messenger-title--stack">
          <Text variant="header-2">Мессенджер</Text>
          <div className="messenger-toolbar">
            <Button
              size="s"
              view={filterMode === 'all' ? 'action' : 'outlined'}
              onClick={() => setFilterMode('all')}
            >
              Все
            </Button>
            <Button
              size="s"
              view={filterMode === 'pinned' ? 'action' : 'outlined'}
              onClick={() => setFilterMode('pinned')}
            >
              Важные
            </Button>
            <Button
              size="s"
              view={composerMode === 'channel' ? 'action' : 'outlined'}
              onClick={() => setComposerMode((prev) => (prev === 'channel' ? 'none' : 'channel'))}
            >
              Новый канал
            </Button>
            <Button
              size="s"
              view={composerMode === 'chat' ? 'action' : 'outlined'}
              onClick={() => setComposerMode((prev) => (prev === 'chat' ? 'none' : 'chat'))}
            >
              Новый чат
            </Button>
          </div>
          {composerMode !== 'none' && (
            <div className="messenger-composer hockey-stack hockey-stack--gap-8">
              <TextInput
                value={newEntityTitle}
                onChange={(e) => setNewEntityTitle(e.target.value)}
                placeholder={composerMode === 'channel' ? 'Название канала' : 'Название чата'}
              />
              <TextInput
                value={newEntityTag}
                onChange={(e) => setNewEntityTag(e.target.value)}
                placeholder="Тег (например, #goalies)"
              />
              <label className="messenger-composer__switch">
                <span>Только для особых участников</span>
                <Switch
                  checked={newEntityRestricted}
                  onUpdate={(value) => {
                    setNewEntityRestricted(value)
                    if (!value) setNewEntityMembers([])
                  }}
                />
              </label>
              {newEntityRestricted && (
                <div className="messenger-member-list">
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
          />
          {searchQuery.trim().length > 0 && (
            <div className="chat-user-search">
              {users.map((user) => (
                <button
                  key={user.userId}
                  type="button"
                  className="chat-user-search__item"
                  onClick={() => handleCreateDirectChat(user.userId)}
                >
                  <span>
                    {user.displayName}
                    {user.position ? ` · ${user.position}` : ''}
                  </span>
                  <span className={`chat-user-search__status ${user.isOnline ? 'is-online' : ''}`}>
                    {user.isOnline ? 'online' : 'offline'}
                  </span>
                </button>
              ))}
              {users.length === 0 && (
                <Text variant="body-1" color="secondary">
                  Игроков по запросу не найдено
                </Text>
              )}
            </div>
          )}
        </div>
        <div className="chat-list">
          {sortedChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${activeChatId === chat.id ? 'chat-item--selected' : ''}`}
            >
              <button
                type="button"
                className="chat-item__open"
                onClick={() => handleSelectChat(chat.id)}
              >
                <span className="chat-item__avatar" aria-hidden>
                  {chat.title.slice(0, 1)}
                </span>
                <span className="chat-item__info">
                  <Text variant="body-2" className="chat-item__title">
                    {chat.isPinned ? '📌 ' : ''}
                    {chat.title}
                    {chat.isOnline ? ' · online' : ''}
                  </Text>
                  <Text variant="caption-1" className={`chat-item__last-msg ${chat.isTyping ? 'is-typing' : ''}`} color="secondary">
                    {getChatSubtitle(chat)}
                  </Text>
                </span>
                {chat.unreadCount > 0 && (
                  <span className="chat-item__unread">{chat.unreadCount}</span>
                )}
              </button>
              <button
                type="button"
                className={`chat-item__pin ${chat.isPinned ? 'is-pinned' : ''}`}
                aria-label={chat.isPinned ? 'Открепить чат' : 'Закрепить чат'}
                title={chat.isPinned ? 'Открепить' : 'Закрепить'}
                onClick={() => handleToggleChatPin(chat.id)}
              >
                📌
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="messenger-main">
        {activeChatId ? (
          <>
            <div className="messenger-header">
              {isMobile && (
                <button
                  type="button"
                  className="messenger-back"
                  onClick={handleMobileBack}
                  aria-label="Назад к списку чатов"
                >
                  ←
                </button>
              )}
              <div className="messenger-header__title">
                <Text variant="subheader-2">{selectedChat?.title}</Text>
                {selectedChat?.isTyping && (
                  <Text variant="body-1" color="secondary">
                    печатает...
                  </Text>
                )}
              </div>
              {selectedChat && (
                <div className="messenger-header__actions">
                  <Button
                    size="s"
                    view={selectedChat.isPinned ? 'action' : 'outlined'}
                    onClick={() => handleToggleChatPin(selectedChat.id)}
                    loading={pinChatMutation.isPending}
                  >
                    {selectedChat.isPinned ? 'Открепить' : 'Закрепить'}
                  </Button>
                  <Button
                    size="s"
                    view={showTopicComposer ? 'action' : 'outlined'}
                    onClick={() => setShowTopicComposer((prev) => !prev)}
                  >
                    Новая тема
                  </Button>
                  {isChannelChat && (
                    <Button
                      size="s"
                      view={showChannelSettings ? 'action' : 'outlined'}
                      onClick={() => setShowChannelSettings((prev) => !prev)}
                    >
                      Настройки канала
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="messenger-topics">
              {topics.map((topic: ChatTopic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`messenger-topics__item ${activeTopicId === topic.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  <span>{topic.title}</span>
                  {topic.tag && <small>#{topic.tag}</small>}
                  {topic.restrictedUserIds && topic.restrictedUserIds.length > 0 && (
                    <small>🔒</small>
                  )}
                </button>
              ))}
              {topics.length === 0 && (
                <Text variant="caption-1" color="secondary">
                  В этом чате пока нет тем.
                </Text>
              )}
            </div>
            {showTopicComposer && selectedChat && (
              <div className="messenger-topic-composer hockey-stack hockey-stack--gap-8">
                <TextInput
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Название темы"
                />
                <TextInput
                  value={newTopicTag}
                  onChange={(e) => setNewTopicTag(e.target.value)}
                  placeholder="Тег темы (например, roster)"
                />
                <label className="messenger-composer__switch">
                  <span>Ограничить доступ к теме</span>
                  <Switch
                    checked={newTopicRestricted}
                    onUpdate={(value) => {
                      setNewTopicRestricted(value)
                      if (!value) setNewTopicMembers([])
                    }}
                  />
                </label>
                {newTopicRestricted && (
                  <div className="messenger-member-list">
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
                >
                  Создать тему
                </Button>
              </div>
            )}
            {showChannelSettingsPanel && channelSettings && (
              <div className="messenger-channel-settings hockey-stack hockey-stack--gap-10">
                <Text variant="subheader-2">Настройки канала</Text>
                <div className="messenger-channel-settings__grid">
                  <TextInput
                    value={channelSettings.channelTag ?? ''}
                    onChange={(e) =>
                      handleChannelSettingsPatch({channelTag: e.target.value.trim() || undefined})
                    }
                    placeholder="Тег канала (например announcements)"
                  />
                  <label className="messenger-composer__switch">
                    <span>Отключить уведомления</span>
                    <Switch
                      checked={channelSettings.notifications.muted}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({notifications: {muted: value}})
                      }
                    />
                  </label>
                  <label className="messenger-composer__switch">
                    <span>Только упоминания</span>
                    <Switch
                      checked={channelSettings.notifications.mentionsOnly}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({notifications: {mentionsOnly: value}})
                      }
                    />
                  </label>
                  <label className="messenger-composer__switch">
                    <span>Только важные</span>
                    <Switch
                      checked={channelSettings.notifications.importantOnly}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({notifications: {importantOnly: value}})
                      }
                    />
                  </label>
                  <label className="messenger-composer__switch">
                    <span>Push-уведомления</span>
                    <Switch
                      checked={channelSettings.notifications.pushEnabled}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({notifications: {pushEnabled: value}})
                      }
                    />
                  </label>
                  <label className="messenger-channel-settings__field">
                    <span>Писать в канал может роль не ниже</span>
                    <select
                      value={channelSettings.permissions.publishMinRole}
                      onChange={(e) =>
                        handleChannelSettingsPatch({
                          permissions: {publishMinRole: e.target.value as ChannelSettings['permissions']['publishMinRole']},
                        })
                      }
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="messenger-channel-settings__field">
                    <span>Управлять участниками может роль не ниже</span>
                    <select
                      value={channelSettings.permissions.manageMembersMinRole}
                      onChange={(e) =>
                        handleChannelSettingsPatch({
                          permissions: {
                            manageMembersMinRole: e.target.value as ChannelSettings['permissions']['manageMembersMinRole'],
                          },
                        })
                      }
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="messenger-composer__switch">
                    <span>Разрешить создание тем участникам</span>
                    <Switch
                      checked={channelSettings.permissions.allowTopicCreation}
                      onUpdate={(value) =>
                        handleChannelSettingsPatch({permissions: {allowTopicCreation: value}})
                      }
                    />
                  </label>
                  <label className="messenger-channel-settings__field">
                    <span>Slow mode (сек)</span>
                    <select
                      value={String(channelSettings.slowModeSeconds)}
                      onChange={(e) =>
                        handleChannelSettingsPatch({
                          slowModeSeconds: Number(e.target.value) as ChannelSettings['slowModeSeconds'],
                        })
                      }
                    >
                      {SLOW_MODE_OPTIONS.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="messenger-channel-settings__audit">
                  <Text variant="subheader-2">История изменений</Text>
                  {channelSettings.audit.length === 0 ? (
                    <Text variant="caption-1" color="secondary">
                      Пока нет изменений.
                    </Text>
                  ) : (
                    channelSettings.audit.map((entry) => (
                      <div key={entry.id} className="messenger-channel-settings__audit-item">
                        <Text variant="caption-1">
                          {entry.actorName}: {entry.action}
                        </Text>
                        <Text variant="caption-1" color="secondary">
                          {new Date(entry.createdAt).toLocaleString('ru-RU')}
                        </Text>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            <div className="messenger-messages">
              {isLoadingMessages && messages.length === 0 ? (
                <Text variant="body-2" color="secondary">Загрузка сообщений...</Text>
              ) : messages.length === 0 ? (
                <Text variant="body-2" color="secondary">Сообщений пока нет</Text>
              ) : (
                messages.map(msg => (
                  <ChatBubble key={msg.id} message={msg} isOwn={msg.senderId === 'me'} />
                ))
              )}
            </div>
            {statusMessage && (
              <div className="messenger-status">
                <Text variant="caption-1" color="secondary">
                  {statusMessage}
                </Text>
              </div>
            )}
            <div className="messenger-input">
              <TextInput
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Напишите сообщение..."
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <Button view="action" onClick={handleSendMessage}>
                <Icon data={PaperPlane} />
              </Button>
            </div>
          </>
        ) : (
          <div className="messenger-empty">
            <Text variant="body-2" color="secondary">Выберите чат, чтобы начать общение</Text>
          </div>
        )}
      </div>
    </div>
  )
}
