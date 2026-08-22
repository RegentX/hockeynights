/**
 * SPEC-FR-16.1.1, SPEC-UI-8.3 — строка чата в списке.
 */

import {Pin, PinFill} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'

import type {Chat} from '@/entities/messenger'
import {
  formatChatTimestamp,
  getChatInitial,
  getChatSubtitle,
  getChatTypeLabel,
} from '@/entities/messenger'
import {testId} from '@/shared/testing/testId'

interface MessengerChatRowProps {
  chat: Chat
  isActive: boolean
  onSelect: (chatId: string) => void
  onTogglePin: (chatId: string) => void
}

export function MessengerChatRow({chat, isActive, onSelect, onTogglePin}: MessengerChatRowProps) {
  const typeLabel = getChatTypeLabel(chat)
  const timeLabel = formatChatTimestamp(chat.lastMessage?.timestamp)

  return (
    <div
      className={`chat-item ${isActive ? 'chat-item--selected' : ''}`}
      data-testid={testId('messenger', 'page', 'item', 'chat', chat.id)}
    >
      <button
        type="button"
        className="chat-item__open"
        aria-current={isActive ? 'true' : undefined}
        onClick={() => onSelect(chat.id)}
        data-testid={testId('messenger', 'page', 'btn', 'open-chat', chat.id)}
      >
        <span
          className="chat-item__avatar"
          aria-hidden
          data-testid={testId('messenger', 'page', 'badge', 'chat-avatar', chat.id)}
        >
          {getChatInitial(chat)}
        </span>
        <span
          className="chat-item__info"
          data-testid={testId('messenger', 'page', 'panel', 'chat-info', chat.id)}
        >
          <span className="chat-item__title-row">
            <Text
              variant="body-2"
              className="chat-item__title"
              data-testid={testId('messenger', 'page', 'text', 'chat-title', chat.id)}
            >
              {chat.title}
            </Text>
            {chat.isOnline && (
              <span
                className="chat-item__online"
                title="В сети"
                data-testid={testId('messenger', 'page', 'badge', 'chat-online', chat.id)}
              >
                <span className="hockey-sr-only">В сети</span>
              </span>
            )}
            {typeLabel && (
              <span
                className="chat-item__tag"
                data-testid={testId('messenger', 'page', 'badge', 'chat-type', chat.id)}
              >
                {typeLabel}
              </span>
            )}
          </span>
          <Text
            variant="caption-1"
            className={`chat-item__last-msg ${chat.isTyping ? 'is-typing' : ''}`}
            color="secondary"
            data-testid={testId('messenger', 'page', 'text', 'chat-subtitle', chat.id)}
          >
            {getChatSubtitle(chat)}
          </Text>
        </span>
        <span className="chat-item__meta">
          {timeLabel && (
            <span
              className="chat-item__time scoreboard-text"
              data-testid={testId('messenger', 'page', 'text', 'chat-time', chat.id)}
            >
              {timeLabel}
            </span>
          )}
          {chat.unreadCount > 0 && (
            <span
              className="chat-item__unread"
              data-testid={testId('messenger', 'page', 'badge', 'chat-unread', chat.id)}
            >
              {chat.unreadCount}
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        className={`chat-item__pin ${chat.isPinned ? 'is-pinned' : ''}`}
        aria-label={chat.isPinned ? 'Открепить чат' : 'Закрепить чат'}
        aria-pressed={Boolean(chat.isPinned)}
        title={chat.isPinned ? 'Открепить' : 'Закрепить'}
        onClick={() => onTogglePin(chat.id)}
        data-testid={testId('messenger', 'page', 'btn', 'pin-chat', chat.id)}
      >
        <Icon data={chat.isPinned ? PinFill : Pin} size={16} />
      </button>
    </div>
  )
}
