import { http, HttpResponse } from 'msw'
import {createDirectMockChat, mockChats, mockChatUsers, mockMessages} from '@/mocks/data/messenger'

/** @spec SPEC-FR-16.1.1, SPEC-FR-16.1.2, SPEC-FR-16.1.3 */
export const messengerHandlers = [
  http.get('/mock-api/v1/messenger/chats', () => {
    return HttpResponse.json(mockChats)
  }),

  http.get('/mock-api/v1/messenger/users', ({request}) => {
    const query = new URL(request.url).searchParams.get('query')?.toLowerCase().trim()
    const users = !query
      ? mockChatUsers
      : mockChatUsers.filter((user) => user.displayName.toLowerCase().includes(query))
    return HttpResponse.json(users)
  }),

  http.post('/mock-api/v1/messenger/chats', async ({request}) => {
    const body = (await request.json()) as {targetUserId?: string}
    if (!body.targetUserId) {
      return HttpResponse.json({message: 'targetUserId is required'}, {status: 400})
    }
    const chat = createDirectMockChat(body.targetUserId)
    if (!chat) {
      return HttpResponse.json({message: 'Target user not found'}, {status: 404})
    }
    return HttpResponse.json(chat)
  }),

  http.get('/mock-api/v1/messenger/chats/:chatId/messages', ({ params }) => {
    const messages = mockMessages[params.chatId as string] || []
    return HttpResponse.json(messages)
  }),

  /** @spec SPEC-FR-16.1.4 - Обработка действий в сообщениях */
  http.post('/mock-api/v1/messenger/actions/:actionId', ({ params }) => {
    return HttpResponse.json({ success: true, actionId: params.actionId })
  }),
]
