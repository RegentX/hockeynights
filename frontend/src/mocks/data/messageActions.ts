/**
 * HOCFRONT-25 — resolve actionable messenger cards
 */

import type {ResolveMessageActionPayload} from '@/entities/messenger'
import {updateMockEventRsvp} from '@/mocks/data/eventRsvp'
import {mockMessages} from '@/mocks/data/messenger'
import {mockUser} from '@/mocks/data/session'
import {findMessageById} from '@/mocks/data/trainingDrafts'

/** HOCFRONT-25 — принять / отклонить назначение на тренировку */
export function resolveMockMessageAction(
  messageId: string,
  payload: ResolveMessageActionPayload,
): {success: boolean; messageId: string; status?: string} {
  const found = findMessageById(messageId)
  if (!found?.message.actionData) {
    return {success: false, messageId}
  }

  const data = found.message.actionData
  if (data.type !== 'training_appointment' || !data.eventId) {
    return {success: true, messageId, status: 'ignored'}
  }

  if (data.targetUserId && data.targetUserId !== mockUser.id) {
    return {success: false, messageId, status: 'forbidden'}
  }

  if (payload.action === 'decline' && !payload.declineReason?.trim()) {
    return {success: false, messageId, status: 'decline_reason_required'}
  }

  const rsvpStatus = payload.action === 'accept' ? 'confirmed' : 'declined'
  updateMockEventRsvp(data.eventId, mockUser.id, rsvpStatus, payload.declineReason)

  data.status = 'completed'
  data.responseStatus = payload.action === 'accept' ? 'accepted' : 'declined'
  data.declineReason = payload.declineReason
  data.actions = []
  data.description =
    payload.action === 'accept'
      ? `${data.description}\n\n✓ Принято`
      : `${data.description}\n\n✗ Отклонено: ${payload.declineReason}`

  const list = mockMessages[found.chatId] ?? []
  const index = list.findIndex((item) => item.id === messageId)
  if (index >= 0) {
    list[index] = {...found.message, actionData: {...data}}
    mockMessages[found.chatId] = [...list]
  }

  return {success: true, messageId, status: rsvpStatus}
}
