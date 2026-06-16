import type {Chat, ChatUser, Message} from '../../entities/messenger/types'
import {mockPlayers} from '@/mocks/data/players'

/** @spec SPEC-FR-16.1.1, SPEC-FR-16.1.2 */
export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    type: 'team',
    title: 'ХК «Метеор» — Раздевалка',
    avatarUrl: 'https://placehold.co/100x100/333/fff?text=M',
    unreadCount: 2,
    isPinned: true,
    isOnline: true,
    isTyping: true,
    memberIds: ['user-001', 'user-003', 'user-004'],
    relatedEntityId: 'team-1',
  },
  {
    id: 'chat-2',
    type: 'event',
    title: 'Игра: Метеор vs Вымпел (06.06)',
    avatarUrl: 'https://placehold.co/100x100/0052cc/fff?text=G',
    unreadCount: 0,
    isOnline: false,
    memberIds: ['user-001', 'user-003'],
    relatedEntityId: 'event-1',
  },
  {
    id: 'chat-4',
    type: 'team',
    title: 'Команда «Северный Лед»',
    avatarUrl: 'https://placehold.co/100x100/0f7f95/fff?text=S',
    unreadCount: 3,
    isPinned: true,
    isOnline: true,
    memberIds: ['user-001', 'user-002', 'user-004'],
    relatedEntityId: 'team-002',
  },
  {
    id: 'chat-3',
    type: 'system',
    title: 'Системные уведомления',
    unreadCount: 5,
    isOnline: true,
  }
];

export const mockChatUsers: ChatUser[] = [
  {userId: 'user-001', displayName: 'Иван Петров', position: 'forward', isOnline: true},
  ...mockPlayers.map((p) => ({
    userId: p.userId,
    displayName: p.displayName,
    position: p.position,
    isOnline: p.userId !== 'user-003',
  })),
]

export const mockMessages: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'user-1',
      senderName: 'Александр Овечкин',
      type: 'text',
      content: 'Парни, кто сегодня будет на тренировке?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg-2',
      chatId: 'chat-1',
      senderId: 'system',
      senderName: 'Система',
      type: 'actionable',
      content: 'Запрос на вступление в команду',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      actionData: {
        type: 'join_team',
        title: 'Новый игрок: Иван Иванов',
        description: 'Амплуа: Защитник, Уровень: Amateur',
        status: 'pending',
        actions: [
          { id: 'act-1', label: 'Принять', action: 'approve', style: 'primary' },
          { id: 'act-2', label: 'Отклонить', action: 'decline', style: 'secondary' }
        ]
      }
    }
  ],
  'chat-2': [
    {
      id: 'msg-3',
      chatId: 'chat-2',
      senderId: 'system',
      senderName: 'Система',
      type: 'actionable',
      content: 'Бронирование льда',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actionData: {
        type: 'booking',
        title: 'Бронирование: Арена Мытищи',
        description: '06.06.2026, 20:00 - 21:30. Цена: 15 000 ₽',
        status: 'pending',
        actions: [
          { id: 'act-3', label: 'Оплатить долю', action: 'pay', style: 'primary' }
        ]
      }
    }
  ],
  'chat-3': [
    {
      id: 'msg-4',
      chatId: 'chat-3',
      senderId: 'system',
      senderName: 'Система',
      type: 'system',
      content: 'Ваша карма повышена за хорошую игру!',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    }
  ]
};

mockMessages['chat-4'] = [
  {
    id: 'msg-5',
    chatId: 'chat-4',
    senderId: 'user-002',
    senderName: 'Алексей Смирнов',
    type: 'text',
    content: 'Парни, собираемся в 19:40 у входа на арену.',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
  },
]

// Update last messages in chats
mockChats.forEach(chat => {
  const messages = mockMessages[chat.id];
  if (messages && messages.length > 0) {
    chat.lastMessage = messages[messages.length - 1];
  }
});

export function toggleMockChatPin(chatId: string, pinned?: boolean): Chat | null {
  const chat = mockChats.find((item) => item.id === chatId)
  if (!chat) return null
  chat.isPinned = pinned ?? !chat.isPinned
  return chat
}

export function createDirectMockChat(targetUserId: string): Chat | null {
  const target = mockChatUsers.find((user) => user.userId === targetUserId)
  if (!target) return null

  const existing = mockChats.find(
    (chat) => chat.type === 'direct' && chat.memberIds?.includes(targetUserId),
  )
  if (existing) return existing

  const chatId = `chat-${Date.now()}`
  const directChat: Chat = {
    id: chatId,
    type: 'direct',
    title: target.displayName,
    unreadCount: 0,
    isOnline: Boolean(target.isOnline),
    memberIds: ['user-001', targetUserId],
  }
  mockChats.unshift(directChat)
  mockMessages[chatId] = [
    {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'Система',
      type: 'system',
      content: `Чат с игроком ${target.displayName} создан.`,
      timestamp: new Date().toISOString(),
    },
  ]
  directChat.lastMessage = mockMessages[chatId][0]
  return directChat
}
