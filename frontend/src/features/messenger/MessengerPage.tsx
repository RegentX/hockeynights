/**
 * SPEC-FR-16.1.1, SPEC-UI-8.1
 */

import {useEffect, useMemo, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import type {Chat, Message} from '@/entities/messenger/types'
import {
  createDirectChat,
  fetchChatMessages,
  fetchChats,
  searchChatUsers,
  toggleChatPin,
} from '@/features/messenger/api/messengerApi'
import {ChatBubble} from './ChatBubble'
import {Text, TextInput, Button, Icon} from '@gravity-ui/uikit'
import {PaperPlane} from '@gravity-ui/icons'

const MOBILE_BREAKPOINT = '(max-width: 768px)'

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_BREAKPOINT).matches
}

const PINNED_FILTER = 'pinned'

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

  const {data: users = []} = useQuery({
    queryKey: ['messenger-users', searchQuery],
    queryFn: () => searchChatUsers(searchQuery),
  })

  const createChatMutation = useMutation({
    mutationFn: (targetUserId: string) => createDirectChat(targetUserId),
    onSuccess: (chat) => {
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      setSelectedChatId(chat.id)
      setMobileView('chat')
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

  const {data: messages = [], isLoading: isLoadingMessages} = useQuery({
    queryKey: ['messenger-messages', activeChatId],
    queryFn: () => fetchChatMessages(activeChatId!),
    enabled: Boolean(activeChatId),
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
      timestamp: new Date().toISOString(),
    }
    
    queryClient.setQueryData<Message[]>(
      ['messenger-messages', activeChatId],
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

  const selectedChat = sortedChats.find((c) => c.id === activeChatId)

  function handleCreateDirectChat(targetUserId: string) {
    createChatMutation.mutate(targetUserId)
  }

  function handleToggleChatPin(chatId: string, pinned?: boolean) {
    pinChatMutation.mutate({chatId, pinned})
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
          </div>
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
                <Button
                  size="s"
                  view={selectedChat.isPinned ? 'action' : 'outlined'}
                  onClick={() => handleToggleChatPin(selectedChat.id)}
                  loading={pinChatMutation.isPending}
                >
                  {selectedChat.isPinned ? 'Открепить' : 'Закрепить'}
                </Button>
              )}
            </div>
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
