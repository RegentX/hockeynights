/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2, SPEC-FR-8.2.1
 */

import type {CreateFeedbackPayload, Feedback, KarmaInfo} from '@/entities/feedback'
import {mockEvents} from '@/mocks/data/events'
import {mockPlayers} from '@/mocks/data/players'
import {mockProfile, updateMockProfile} from '@/mocks/data/session'

/** @spec SPEC-FR-8.1.1 - Mock feedback */
export let mockFeedbacks: Feedback[] = []

/** @spec SPEC-FR-8.2.1 - Karma по игрокам */
const karmaStore: Record<string, KarmaInfo> = {
  'user-001': {
    userId: 'user-001',
    karmaScore: mockProfile.karmaScore,
    feedbackCount: 3,
    hint: 'Вспомогательный сигнал надёжности, не абсолютная оценка уровня',
  },
  'user-002': {
    userId: 'user-002',
    karmaScore: 88,
    feedbackCount: 12,
    hint: 'Вспомогательный сигнал надёжности, не абсолютная оценка уровня',
  },
}

/**
 * @spec SPEC-FR-8.1.2 - Проверка участия в событии
 */
export function canLeaveFeedback(eventId: string, userId: string): boolean {
  const event = mockEvents.find((e) => e.id === eventId)
  if (!event) return false
  return event.participation.some((p) => p.userId === userId && p.status === 'going')
}

/**
 * @spec SPEC-FR-8.1.1 - Создать feedback
 */
export function createMockFeedback(fromUserId: string, payload: CreateFeedbackPayload): Feedback {
  if (!canLeaveFeedback(payload.eventId, fromUserId)) {
    throw new Error('Feedback доступен только участникам события')
  }

  const feedback: Feedback = {
    id: `fb-${Date.now()}`,
    fromUserId,
    ...payload,
    createdAt: new Date().toISOString(),
  }
  mockFeedbacks = [...mockFeedbacks, feedback]

  const target = karmaStore[payload.toUserId]
  if (target) {
    const delta =
      payload.attendanceRating === 'confirmed' ? 2 : payload.attendanceRating === 'late' ? -1 : -3
    target.karmaScore = Math.max(0, Math.min(100, target.karmaScore + delta))
    target.feedbackCount += 1

    const player = mockPlayers.find((p) => p.userId === payload.toUserId)
    if (player) player.karmaScore = target.karmaScore
    if (payload.toUserId === 'user-001') {
      updateMockProfile({karmaScore: target.karmaScore})
    }
  }

  return feedback
}

/**
 * @spec SPEC-FR-8.2.1 - Получить karma
 */
export function getMockKarma(userId: string): KarmaInfo {
  return (
    karmaStore[userId] ?? {
      userId,
      karmaScore: 50,
      feedbackCount: 0,
      hint: 'Вспомогательный сигнал надёжности, не абсолютная оценка уровня',
    }
  )
}
