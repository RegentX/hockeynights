/**
 * SPEC-FR-16.1.1
 */

import type {
  ChannelSettings,
  ChannelSettingsPatch,
  Chat,
  ChatTopic,
  ChatUser,
  CreateChatPayload,
  CreateChatTopicPayload,
  Message,
} from '@/entities/messenger/types'
import {apiRequest} from '@/shared/api/client'

/** @spec SPEC-FR-16.1.1 - Список чатов пользователя */
export function fetchChats(): Promise<Chat[]> {
  return apiRequest<Chat[]>('/messenger/chats')
}

export function fetchTeamChats(teamId: string): Promise<Chat[]> {
  const params = new URLSearchParams({teamId})
  return apiRequest<Chat[]>(`/messenger/chats?${params.toString()}`)
}

export function fetchChatMessages(chatId: string): Promise<Message[]> {
  return apiRequest<Message[]>(`/messenger/chats/${chatId}/messages`)
}

export function fetchChatMessagesByTopic(chatId: string, topicId?: string): Promise<Message[]> {
  const params = new URLSearchParams()
  if (topicId) params.set('topicId', topicId)
  const suffix = params.toString()
  return apiRequest<Message[]>(`/messenger/chats/${chatId}/messages${suffix ? `?${suffix}` : ''}`)
}

export function fetchChatTopics(chatId: string): Promise<ChatTopic[]> {
  return apiRequest<ChatTopic[]>(`/messenger/chats/${chatId}/topics`)
}

export function fetchChannelSettings(chatId: string): Promise<ChannelSettings> {
  return apiRequest<ChannelSettings>(`/messenger/chats/${chatId}/settings`)
}

export function updateChannelSettings(
  chatId: string,
  payload: ChannelSettingsPatch,
): Promise<ChannelSettings> {
  return apiRequest<ChannelSettings>(`/messenger/chats/${chatId}/settings`, {
    method: 'PATCH',
    body: payload,
  })
}

export function searchChatUsers(query: string): Promise<ChatUser[]> {
  const params = new URLSearchParams()
  if (query.trim()) params.set('query', query.trim())
  const suffix = params.toString()
  return apiRequest<ChatUser[]>(`/messenger/users${suffix ? `?${suffix}` : ''}`)
}

export function createDirectChat(targetUserId: string): Promise<Chat> {
  return apiRequest<Chat>('/messenger/chats', {
    method: 'POST',
    body: {targetUserId},
  })
}

export function createChannelOrChat(payload: CreateChatPayload): Promise<Chat> {
  return apiRequest<Chat>('/messenger/chats', {
    method: 'POST',
    body: payload,
  })
}

export function createChatTopic(
  chatId: string,
  payload: CreateChatTopicPayload,
): Promise<ChatTopic> {
  return apiRequest<ChatTopic>(`/messenger/chats/${chatId}/topics`, {
    method: 'POST',
    body: payload,
  })
}

export function toggleChatPin(chatId: string, pinned?: boolean): Promise<Chat> {
  return apiRequest<Chat>(`/messenger/chats/${chatId}/pin`, {
    method: 'PATCH',
    body: pinned === undefined ? {} : {pinned},
  })
}

export function getTotalUnreadCount(chats: Chat[]): number {
  return chats.reduce((total, chat) => total + Math.max(0, chat.unreadCount), 0)
}
