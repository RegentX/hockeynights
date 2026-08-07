/**
 * HOCFRONT-25 — черновики тренировок: раскладка → одобрение тренера → appointment в мессенджер
 */

import type {GameEvent} from '@/entities/event'
import type {Message} from '@/entities/messenger'
import type {
  CreateTrainingLineupDraftPayload,
  TrainingDraftAssignment,
  TrainingLineupDraft,
} from '@/entities/team'
import {upsertMockTrainingRsvpBoard} from '@/mocks/data/eventRsvp'
import {createMockEvent} from '@/mocks/data/events'
import {mockChats, mockMessages} from '@/mocks/data/messenger'
import {mockUser} from '@/mocks/data/session'
import {updateMockTrainingLineup} from '@/mocks/data/trainingLineup'

export let mockTrainingDrafts: TrainingLineupDraft[] = []

let draftSeq = 1
let msgSeq = 1000

const SIDE_LABELS: Record<TrainingDraftAssignment['side'], string> = {
  red: 'красные',
  white: 'белые',
  bench: 'запас',
}

const POSITION_LABELS: Record<TrainingDraftAssignment['position'], string> = {
  goalie: 'вратарь',
  defense: 'защита',
  forward: 'нападение',
  any: 'универсал',
}

function nowIso() {
  return new Date().toISOString()
}

function isCoachSession(): boolean {
  return mockUser.roles.includes('coach') || mockUser.roles.includes('admin')
}

export function listMockTrainingDrafts(clubId: string): TrainingLineupDraft[] {
  return mockTrainingDrafts
    .filter((draft) => draft.clubId === clubId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getMockTrainingDraft(draftId: string): TrainingLineupDraft | undefined {
  return mockTrainingDrafts.find((draft) => draft.id === draftId)
}

export function createMockTrainingDraft(
  clubId: string,
  payload: CreateTrainingLineupDraftPayload,
): TrainingLineupDraft {
  const createdByIsCoach = isCoachSession()
  const draft: TrainingLineupDraft = {
    id: `training-draft-${draftSeq++}`,
    clubId,
    teamId: payload.teamId,
    title: payload.title.trim(),
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    arenaId: payload.arenaId,
    status: createdByIsCoach ? 'approved' : 'draft',
    createdByUserId: mockUser.id,
    createdByIsCoach,
    approvedByUserId: createdByIsCoach ? mockUser.id : undefined,
    note: payload.note,
    assignments: payload.assignments,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  mockTrainingDrafts = [draft, ...mockTrainingDrafts]
  return draft
}

export function submitMockTrainingDraft(draftId: string): TrainingLineupDraft | undefined {
  const draft = getMockTrainingDraft(draftId)
  if (!draft) return undefined
  if (draft.createdByIsCoach) {
    draft.status = 'approved'
    draft.approvedByUserId = mockUser.id
  } else {
    draft.status = 'pending_coach'
  }
  draft.updatedAt = nowIso()
  return {...draft}
}

export function approveMockTrainingDraft(draftId: string): TrainingLineupDraft | undefined {
  const draft = getMockTrainingDraft(draftId)
  if (!draft) return undefined
  if (!isCoachSession()) {
    return undefined
  }
  draft.status = 'approved'
  draft.approvedByUserId = mockUser.id
  draft.rejectedReason = undefined
  draft.updatedAt = nowIso()
  return {...draft}
}

export function rejectMockTrainingDraft(
  draftId: string,
  reason: string,
): TrainingLineupDraft | undefined {
  const draft = getMockTrainingDraft(draftId)
  if (!draft) return undefined
  if (!isCoachSession()) return undefined
  draft.status = 'rejected'
  draft.rejectedReason = reason
  draft.updatedAt = nowIso()
  return {...draft}
}

function ensureTeamChat(teamId: string, memberIds: string[]): string {
  const existing = mockChats.find((chat) => chat.type === 'team' && chat.relatedEntityId === teamId)
  if (existing) {
    const merged = new Set([...(existing.memberIds ?? []), ...memberIds])
    existing.memberIds = [...merged]
    return existing.id
  }
  const chatId = `chat-team-${teamId}`
  mockChats.unshift({
    id: chatId,
    type: 'team',
    title: `Команда ${teamId}`,
    unreadCount: 0,
    memberIds: [...new Set(memberIds)],
    relatedEntityId: teamId,
    tag: 'team',
    visibility: 'team_members',
  })
  mockMessages[chatId] = []
  return chatId
}

function pushAppointmentMessages(draft: TrainingLineupDraft, event: GameEvent): string[] {
  const chatId = ensureTeamChat(
    draft.teamId,
    draft.assignments.map((item) => item.userId),
  )
  const messageIds: string[] = []
  const starts = new Date(draft.startsAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const invitees = draft.assignments.filter((item) => item.side !== 'bench')
  const bench = draft.assignments.filter((item) => item.side === 'bench')

  for (const assignment of [...invitees, ...bench]) {
    const positionLabel = `${POSITION_LABELS[assignment.position]} · ${SIDE_LABELS[assignment.side]}`
    const messageId = `msg-appt-${msgSeq++}`
    const message: Message = {
      id: messageId,
      chatId,
      senderId: 'system',
      senderName: 'Штаб клуба',
      type: 'actionable',
      content: `Назначение: ${draft.title}`,
      timestamp: nowIso(),
      actionData: {
        type: 'training_appointment',
        title: draft.title,
        description: `${starts} · ваша позиция: ${positionLabel}. Примите или отклоните с объяснением.`,
        status: 'pending',
        eventId: event.id,
        draftId: draft.id,
        targetUserId: assignment.userId,
        positionLabel,
        actions: [
          {id: `${messageId}-accept`, label: 'Принять', action: 'accept', style: 'primary'},
          {id: `${messageId}-decline`, label: 'Отклонить', action: 'decline', style: 'danger'},
        ],
      },
    }
    mockMessages[chatId] = [...(mockMessages[chatId] ?? []), message]
    messageIds.push(messageId)
  }

  const chat = mockChats.find((item) => item.id === chatId)
  if (chat) {
    const last = mockMessages[chatId]?.[mockMessages[chatId].length - 1]
    chat.lastMessage = last
    chat.unreadCount = (chat.unreadCount ?? 0) + messageIds.length
  }

  return messageIds
}

export function publishMockTrainingDraft(
  draftId: string,
): {draft: TrainingLineupDraft; event: GameEvent; messageIds: string[]} | undefined {
  const draft = getMockTrainingDraft(draftId)
  if (!draft || draft.status !== 'approved') return undefined
  if (!isCoachSession()) return undefined

  const event = createMockEvent({
    type: 'training',
    title: draft.title,
    startsAt: draft.startsAt,
    endsAt: draft.endsAt,
    arenaId: draft.arenaId,
    teamId: draft.teamId,
    requiredSkillLevel: 'amateur',
    requiredSlots: [
      {position: 'goalie', count: 1, filledCount: 0},
      {position: 'defense', count: 4, filledCount: 0},
      {position: 'forward', count: 6, filledCount: 0},
    ],
    pricePerPlayer: 0,
    accessScope: 'private_club',
    clubId: draft.clubId,
  })

  updateMockTrainingLineup(
    event.id,
    draft.assignments.map((assignment) => ({
      eventId: event.id,
      userId: assignment.userId,
      position: assignment.position,
      side: assignment.side,
      line: assignment.line ?? 1,
    })),
  )

  upsertMockTrainingRsvpBoard({
    eventId: event.id,
    teamId: draft.teamId,
    teamName: 'Команда клуба',
    leagueName: 'Клубная тренировка',
    opponentName: '—',
    startsAt: draft.startsAt,
    arenaName: draft.arenaId === 'arena-001' ? 'Ледовый дворец на Ходынке' : 'Каток «Лужники»',
    players: draft.assignments.map((assignment) => ({
      userId: assignment.userId,
      displayName: assignment.displayName,
      position: assignment.position,
      status: 'pending' as const,
    })),
  })

  const messageIds = pushAppointmentMessages(draft, event)
  draft.status = 'published'
  draft.eventId = event.id
  draft.updatedAt = nowIso()

  return {draft: {...draft}, event, messageIds}
}

export function findMessageById(messageId: string): {chatId: string; message: Message} | undefined {
  for (const [chatId, messages] of Object.entries(mockMessages)) {
    const message = messages.find((item) => item.id === messageId)
    if (message) return {chatId, message}
  }
  return undefined
}
