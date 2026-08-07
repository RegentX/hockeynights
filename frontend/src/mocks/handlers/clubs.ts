/**
 * HOCFRONT-25 — MSW handlers клуба
 */

import {http, HttpResponse} from 'msw'

import type {CreatePrivateClubTrainingPayload, UpdateClubPayload} from '@/entities/club'
import type {CreateTrainingLineupDraftPayload} from '@/entities/team'
import {findMockClubById, updateMockClub} from '@/mocks/data/clubs'
import {createMockEvent, mockEvents} from '@/mocks/data/events'
import {
  approveMockTrainingDraft,
  createMockTrainingDraft,
  getMockTrainingDraft,
  listMockTrainingDrafts,
  publishMockTrainingDraft,
  rejectMockTrainingDraft,
  submitMockTrainingDraft,
} from '@/mocks/data/trainingDrafts'

export const clubHandlers = [
  http.get('/mock-api/v1/clubs/:clubId', ({params}) => {
    const club = findMockClubById(params.clubId as string)
    if (!club) {
      return HttpResponse.json({message: 'Club not found'}, {status: 404})
    }
    return HttpResponse.json(club)
  }),

  http.patch('/mock-api/v1/clubs/:clubId', async ({params, request}) => {
    const body = (await request.json()) as UpdateClubPayload
    const updated = updateMockClub(params.clubId as string, body)
    if (!updated) {
      return HttpResponse.json({message: 'Club not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/clubs/:clubId/calendar', ({params}) => {
    const club = findMockClubById(params.clubId as string)
    if (!club) {
      return HttpResponse.json({message: 'Club not found'}, {status: 404})
    }
    const events = mockEvents
      .filter(
        (e) => (e.clubId && e.clubId === club.id) || (e.teamId && club.teamIds.includes(e.teamId)),
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    return HttpResponse.json(events)
  }),

  http.get('/mock-api/v1/clubs/:clubId/private-trainings', ({params}) => {
    const clubId = params.clubId as string
    const events = mockEvents
      .filter(
        (e) => e.type === 'training' && e.accessScope === 'private_club' && e.clubId === clubId,
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    return HttpResponse.json(events)
  }),

  http.post('/mock-api/v1/clubs/:clubId/private-trainings', async ({params, request}) => {
    const clubId = params.clubId as string
    const club = findMockClubById(clubId)
    if (!club) {
      return HttpResponse.json({message: 'Club not found'}, {status: 404})
    }
    const body = (await request.json()) as CreatePrivateClubTrainingPayload
    const teamId = body.teamId ?? club.teamIds[0]
    if (!teamId || !club.teamIds.includes(teamId)) {
      return HttpResponse.json({message: 'Team is not linked to this club'}, {status: 400})
    }
    const event = createMockEvent({
      type: 'training',
      title: body.title,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      arenaId: body.arenaId,
      teamId,
      requiredSkillLevel: body.requiredSkillLevel ?? 'amateur',
      requiredSlots: [
        {position: 'goalie', count: 1, filledCount: 0},
        {position: 'defense', count: 4, filledCount: 0},
        {position: 'forward', count: 6, filledCount: 0},
      ],
      pricePerPlayer: 0,
      accessScope: 'private_club',
      clubId,
    })
    return HttpResponse.json(event)
  }),

  http.get('/mock-api/v1/clubs/:clubId/training-drafts', ({params}) => {
    return HttpResponse.json(listMockTrainingDrafts(params.clubId as string))
  }),

  http.post('/mock-api/v1/clubs/:clubId/training-drafts', async ({params, request}) => {
    const clubId = params.clubId as string
    const club = findMockClubById(clubId)
    if (!club) {
      return HttpResponse.json({message: 'Club not found'}, {status: 404})
    }
    const body = (await request.json()) as CreateTrainingLineupDraftPayload
    if (!body.title?.trim() || !body.teamId || !body.startsAt || !body.endsAt) {
      return HttpResponse.json({message: 'Invalid draft payload'}, {status: 400})
    }
    if (!club.teamIds.includes(body.teamId)) {
      return HttpResponse.json({message: 'Team is not linked to this club'}, {status: 400})
    }
    if (!body.assignments?.length) {
      return HttpResponse.json({message: 'Lineup assignments required'}, {status: 400})
    }
    return HttpResponse.json(createMockTrainingDraft(clubId, body))
  }),

  http.post('/mock-api/v1/clubs/:clubId/training-drafts/:draftId/submit', ({params}) => {
    const draft = submitMockTrainingDraft(params.draftId as string)
    if (!draft) {
      return HttpResponse.json({message: 'Draft not found'}, {status: 404})
    }
    return HttpResponse.json(draft)
  }),

  http.post('/mock-api/v1/clubs/:clubId/training-drafts/:draftId/approve', ({params}) => {
    const draftId = params.draftId as string
    if (!getMockTrainingDraft(draftId)) {
      return HttpResponse.json({message: 'Draft not found'}, {status: 404})
    }
    const draft = approveMockTrainingDraft(draftId)
    if (!draft) {
      return HttpResponse.json({message: 'Only coach can approve lineup draft'}, {status: 403})
    }
    return HttpResponse.json(draft)
  }),

  http.post(
    '/mock-api/v1/clubs/:clubId/training-drafts/:draftId/reject',
    async ({params, request}) => {
      const draftId = params.draftId as string
      if (!getMockTrainingDraft(draftId)) {
        return HttpResponse.json({message: 'Draft not found'}, {status: 404})
      }
      const body = (await request.json()) as {reason?: string}
      const draft = rejectMockTrainingDraft(draftId, body.reason?.trim() || 'Отклонено')
      if (!draft) {
        return HttpResponse.json({message: 'Only coach can reject lineup draft'}, {status: 403})
      }
      return HttpResponse.json(draft)
    },
  ),

  http.post('/mock-api/v1/clubs/:clubId/training-drafts/:draftId/publish', ({params}) => {
    const result = publishMockTrainingDraft(params.draftId as string)
    if (!result) {
      return HttpResponse.json(
        {message: 'Создать тренировку может только тренер после одобрения раскладки'},
        {status: 400},
      )
    }
    return HttpResponse.json(result)
  }),
]
