/**
 * HOCFRONT-25 — открыть / создать чат команды для связи со штабом
 */

import type {Chat} from '@/entities/messenger'
import {createChannelOrChat, fetchTeamChats, openDiscoverableChat} from '@/entities/messenger'

export async function ensureTeamStaffChat(teamId: string, teamName: string): Promise<Chat> {
  const existing = await fetchTeamChats(teamId)
  const teamChat = existing.find((chat) => chat.type === 'team')

  if (teamChat) {
    if (teamChat.visibility === 'public') {
      try {
        return await openDiscoverableChat(teamChat.id)
      } catch {
        return teamChat
      }
    }
    return teamChat
  }

  return createChannelOrChat({
    type: 'team',
    title: teamName,
    tag: 'team',
    relatedEntityId: teamId,
    visibility: 'public',
  })
}
