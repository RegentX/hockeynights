/**
 * SPEC-FR-16.1.1 - SPEC-FR-16.1.4, SPEC-FR-22.1.1, SPEC-FR-22.1.2, SPEC-FR-22.1.3
 * SPEC-UI-8.1, SPEC-UI-8.2, SPEC-UI-8.5
 */

export type ChatType = 'team' | 'event' | 'direct' | 'system' | 'channel'

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
  tag?: string
  visibility?: 'team_members' | 'restricted'
}

/** @spec SPEC-FR-16.1.1 - Пользователь для создания чата */
export interface ChatUser {
  userId: string
  displayName: string
  position?: string
  isOnline?: boolean
}

/** @spec SPEC-FR-22.1.1 - Тема/подчат внутри канала */
export interface ChatTopic {
  id: string
  chatId: string
  title: string
  tag?: string
  restrictedUserIds?: string[]
}

export type MessageType = 'text' | 'actionable' | 'system'

/** @spec SPEC-FR-16.1.2 - Сообщение */
export interface Message {
  id: string
  chatId: string
  topicId?: string
  senderId: string
  senderName: string
  senderAvatarUrl?: string
  type: MessageType
  content: string
  timestamp: string
  actionData?: ActionableMessageData
}

/** @spec SPEC-FR-22.1.2 - Создание канала/чата */
export interface CreateChatPayload {
  type: 'channel' | 'team'
  title: string
  tag?: string
  restrictedUserIds?: string[]
  relatedEntityId?: string
}

/** @spec SPEC-FR-22.1.1 - Создание темы внутри канала */
export interface CreateChatTopicPayload {
  title: string
  tag?: string
  restrictedUserIds?: string[]
}

/** @spec SPEC-FR-22.1.4 - Роли для управления каналом */
export type ChannelRole = 'owner' | 'captain' | 'coach' | 'team_admin' | 'player'

/** @spec SPEC-FR-22.1.2 - Настройки уведомлений канала */
export interface ChannelNotificationSettings {
  muted: boolean
  mentionsOnly: boolean
  importantOnly: boolean
  pushEnabled: boolean
}

/** @spec SPEC-FR-22.1.4 - Права в канале */
export interface ChannelPermissionSettings {
  publishMinRole: ChannelRole
  manageMembersMinRole: ChannelRole
  allowTopicCreation: boolean
}

/** @spec SPEC-FR-22.1.2 - Аудит изменений канала */
export interface ChannelAuditEntry {
  id: string
  actorName: string
  action: string
  createdAt: string
}

/** @spec SPEC-FR-22.1.2 - Полные настройки канала */
export interface ChannelSettings {
  chatId: string
  channelTag?: string
  currentUserRole: ChannelRole
  notifications: ChannelNotificationSettings
  permissions: ChannelPermissionSettings
  slowModeSeconds: 0 | 10 | 30 | 60
  audit: ChannelAuditEntry[]
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
