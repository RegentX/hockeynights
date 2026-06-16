/**
 * SPEC-FR-16.1.1 - SPEC-FR-16.1.4, SPEC-UI-8.1, SPEC-UI-8.2
 */

export type ChatType = 'team' | 'event' | 'direct' | 'system'

/** @spec SPEC-FR-16.1.1 - Сущность чата */
export interface Chat {
  id: string
  type: ChatType
  title: string
  avatarUrl?: string
  lastMessage?: Message
  unreadCount: number
  isPinned?: boolean
  isOnline?: boolean
  isTyping?: boolean
  memberIds?: string[]
  relatedEntityId?: string // ID команды или события
}

/** @spec SPEC-FR-16.1.1 - Пользователь для создания чата */
export interface ChatUser {
  userId: string
  displayName: string
  position?: string
  isOnline?: boolean
}

export type MessageType = 'text' | 'actionable' | 'system'

/** @spec SPEC-FR-16.1.2 - Сообщение */
export interface Message {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderAvatarUrl?: string
  type: MessageType
  content: string
  timestamp: string
  actionData?: ActionableMessageData
}

/** @spec SPEC-FR-16.1.3 - Данные интерактивного сообщения */
export interface ActionableMessageData {
  type: 'booking' | 'join_team' | 'sos_response' | 'payment'
  title: string
  description: string
  status: 'pending' | 'completed' | 'cancelled'
  actions: ChatAction[]
}

/** @spec SPEC-FR-16.1.4 - Действие в сообщении */
export interface ChatAction {
  id: string
  label: string
  action: string // e.g., 'approve', 'decline', 'pay'
  style?: 'primary' | 'secondary' | 'danger'
}
