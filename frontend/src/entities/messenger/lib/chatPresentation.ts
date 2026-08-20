/**
 * SPEC-FR-16.1.1, SPEC-UI-8.3 — единое представление чата в списке и шапке.
 */

import type {Chat, ChatType} from '@/entities/messenger/model'

const CHAT_TYPE_LABELS: Partial<Record<ChatType, string>> = {
  channel: 'канал',
  system: 'система',
}

/**
 * Бейдж типа в строке списка. Командные и событийные чаты им не помечаем —
 * в узкой колонке он съедал название; отличать важно только канал и системный чат.
 */
export function getChatTypeLabel(chat: Chat): string | null {
  return CHAT_TYPE_LABELS[chat.type] ?? null
}

/** Инициал для аватара-заглушки. */
export function getChatInitial(chat: Chat): string {
  return chat.title.trim().slice(0, 1).toUpperCase() || '#'
}

/** Вторая строка в списке чатов: печатает → последнее сообщение → подсказка по типу. */
export function getChatSubtitle(chat: Chat): string {
  if (chat.isTyping) return 'печатает...'
  if (chat.lastMessage) return chat.lastMessage.content
  if (chat.type === 'team') return 'Групповой чат команды'
  if (chat.type === 'channel') return 'Сообщений в канале пока нет'
  return 'Сообщений пока нет'
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Компактная метка времени последнего сообщения: сегодня — часы, вчера — «вчера»,
 * на этой неделе — день недели, дальше — дата.
 */
export function formatChatTimestamp(iso: string | undefined, now = new Date()): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const dayDiff = Math.round((startOfToday - startOfDate) / DAY_MS)

  if (dayDiff <= 0) {
    return date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
  }
  if (dayDiff === 1) return 'вчера'
  if (dayDiff < 7) return date.toLocaleDateString('ru-RU', {weekday: 'short'})
  return date.toLocaleDateString('ru-RU', {day: '2-digit', month: 'short'})
}

export type ChatFilterMode = 'all' | 'pinned' | 'channels'

/** Закреплённые сверху, затем фильтр вкладки мессенджера. */
export function selectChats(chats: Chat[], filterMode: ChatFilterMode, query = ''): Chat[] {
  const ranked = [...chats].sort(
    (a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)),
  )
  const filtered =
    filterMode === 'pinned'
      ? ranked.filter((chat) => chat.isPinned)
      : filterMode === 'channels'
        ? ranked.filter((chat) => chat.type === 'channel')
        : ranked

  const needle = query.trim().toLowerCase()
  if (!needle) return filtered
  return filtered.filter(
    (chat) =>
      chat.title.toLowerCase().includes(needle) ||
      (chat.tag ? chat.tag.toLowerCase().includes(needle) : false),
  )
}
