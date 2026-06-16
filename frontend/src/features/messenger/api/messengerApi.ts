/**
 * SPEC-FR-16.1.1
 */

import {apiRequest} from '@/shared/api/client'
import type {Chat, ChatUser, Message} from '@/entities/messenger/types'

/** @spec SPEC-FR-16.1.1 - Список чатов пользователя */
export function fetchChats(): Promise<Chat[]> {
  return apiRequest<Chat[]>('/messenger/chats')
}

export function fetchChatMessages(chatId: string): Promise<Message[]> {
  return apiRequest<Message[]>(`/messenger/chats/${chatId}/messages`)
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

export function getTotalUnreadCount(chats: Chat[]): number {
  return chats.reduce((total, chat) => total + Math.max(0, chat.unreadCount), 0)
}
