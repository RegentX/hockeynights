/**
 * HOCFRONT-25 — API клуба / кабинета клуба
 */

import type {Club, CreatePrivateClubTrainingPayload, UpdateClubPayload} from '@/entities/club/model'
import type {GameEvent} from '@/entities/event'
import type {CreateTrainingLineupDraftPayload, TrainingLineupDraft} from '@/entities/team'
import {apiRequest} from '@/shared/api/client'

export function fetchClub(clubId: string): Promise<Club> {
  return apiRequest<Club>(`/clubs/${clubId}`)
}

export function updateClubProfile(clubId: string, patch: UpdateClubPayload): Promise<Club> {
  return apiRequest<Club>(`/clubs/${clubId}`, {method: 'PATCH', body: patch})
}

export function fetchClubCalendar(clubId: string): Promise<GameEvent[]> {
  return apiRequest<GameEvent[]>(`/clubs/${clubId}/calendar`)
}

export function fetchClubPrivateTrainings(clubId: string): Promise<GameEvent[]> {
  return apiRequest<GameEvent[]>(`/clubs/${clubId}/private-trainings`)
}

export function createClubPrivateTraining(
  clubId: string,
  payload: CreatePrivateClubTrainingPayload,
): Promise<GameEvent> {
  return apiRequest<GameEvent>(`/clubs/${clubId}/private-trainings`, {
    method: 'POST',
    body: payload,
  })
}

/** HOCFRONT-25 — черновики тренировок с раскладкой */
export function fetchTrainingLineupDrafts(clubId: string): Promise<TrainingLineupDraft[]> {
  return apiRequest<TrainingLineupDraft[]>(`/clubs/${clubId}/training-drafts`)
}

export function createTrainingLineupDraft(
  clubId: string,
  payload: CreateTrainingLineupDraftPayload,
): Promise<TrainingLineupDraft> {
  return apiRequest<TrainingLineupDraft>(`/clubs/${clubId}/training-drafts`, {
    method: 'POST',
    body: payload,
  })
}

export function submitTrainingDraftForApproval(
  clubId: string,
  draftId: string,
): Promise<TrainingLineupDraft> {
  return apiRequest<TrainingLineupDraft>(`/clubs/${clubId}/training-drafts/${draftId}/submit`, {
    method: 'POST',
  })
}

export function approveTrainingDraft(
  clubId: string,
  draftId: string,
): Promise<TrainingLineupDraft> {
  return apiRequest<TrainingLineupDraft>(`/clubs/${clubId}/training-drafts/${draftId}/approve`, {
    method: 'POST',
  })
}

export function rejectTrainingDraft(
  clubId: string,
  draftId: string,
  reason: string,
): Promise<TrainingLineupDraft> {
  return apiRequest<TrainingLineupDraft>(`/clubs/${clubId}/training-drafts/${draftId}/reject`, {
    method: 'POST',
    body: {reason},
  })
}

export function publishTrainingDraft(
  clubId: string,
  draftId: string,
): Promise<{draft: TrainingLineupDraft; event: GameEvent; messageIds: string[]}> {
  return apiRequest(`/clubs/${clubId}/training-drafts/${draftId}/publish`, {method: 'POST'})
}
