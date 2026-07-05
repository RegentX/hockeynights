/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 */

import {http, HttpResponse} from 'msw'

import type {
  LeagueApplicationPayload,
  LeagueApplicationStatus,
  LeagueScheduleItem,
  LeagueStanding,
  LeagueTeamApplication,
} from '@/entities/league/types'
import {
  addMockLeagueApplication,
  addMockLeaguePost,
  getMockLeagueAnalytics,
  getMockLeagueApplications,
  getMockLeagueDivisions,
  getMockLeaguePosts,
  getMockLeagueSeasons,
  getMockTeamLeagueApplication,
  importMockLeagueScheduleCsv,
  updateMockLeagueApplication,
} from '@/mocks/data/leaguePartner'
import {
  addMockScheduleItem,
  mockLeagues,
  mockSchedule,
  mockStandings,
  updateMockLeagueProfile,
  updateMockScheduleItem,
  updateMockStanding,
} from '@/mocks/data/leagues'
import {canManagePartnerEntity} from '@/mocks/data/partners'
import {mockSession} from '@/mocks/data/session'
import {canManageTeamAsCaptain} from '@/mocks/data/teams'

/** @spec SPEC-FR-7.1.1 - Handlers лиг */
export const leagueHandlers = [
  http.get('/mock-api/v1/leagues', () => {
    const visible = mockLeagues.filter((l) => l.visible !== false)
    return HttpResponse.json(visible)
  }),

  http.get('/mock-api/v1/leagues/:leagueId', ({params}) => {
    const league = mockLeagues.find((l) => l.id === params.leagueId)
    if (!league || league.visible === false) {
      return HttpResponse.json({message: 'League not found'}, {status: 404})
    }
    return HttpResponse.json(league)
  }),

  http.get('/mock-api/v1/leagues/:leagueId/standings', ({params}) => {
    const standings = mockStandings.filter((s) => s.leagueId === params.leagueId)
    return HttpResponse.json(standings)
  }),

  http.get('/mock-api/v1/leagues/:leagueId/schedule', ({params}) => {
    const schedule = mockSchedule.filter((s) => s.leagueId === params.leagueId)
    return HttpResponse.json(schedule)
  }),

  http.patch('/mock-api/v1/leagues/:leagueId/profile', async ({params, request}) => {
    const leagueId = params.leagueId as string
    if (!canManagePartnerEntity('league', leagueId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра лиги'}, {status: 403})
    }
    const body = (await request.json()) as Partial<(typeof mockLeagues)[number]>
    const updated = updateMockLeagueProfile(leagueId, body)
    if (!updated) {
      return HttpResponse.json({message: 'League not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/leagues/:leagueId/seasons', ({params}) => {
    const leagueId = params.leagueId as string
    return HttpResponse.json(getMockLeagueSeasons(leagueId))
  }),

  http.get('/mock-api/v1/leagues/:leagueId/divisions', ({params, request}) => {
    const leagueId = params.leagueId as string
    const seasonId = new URL(request.url).searchParams.get('seasonId') ?? undefined
    return HttpResponse.json(getMockLeagueDivisions(leagueId, seasonId))
  }),

  http.get('/mock-api/v1/leagues/:leagueId/applications', ({params, request}) => {
    const leagueId = params.leagueId as string
    const teamId = new URL(request.url).searchParams.get('teamId')
    if (teamId) {
      const application = getMockTeamLeagueApplication(leagueId, teamId)
      if (!canManageTeamAsCaptain(teamId, mockSession.user.id)) {
        return HttpResponse.json({message: 'Недостаточно прав капитана команды'}, {status: 403})
      }
      return HttpResponse.json(application ? [application] : [])
    }
    if (!canManagePartnerEntity('league', leagueId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра лиги'}, {status: 403})
    }
    return HttpResponse.json(getMockLeagueApplications(leagueId))
  }),

  http.post('/mock-api/v1/leagues/:leagueId/applications', async ({params, request}) => {
    const leagueId = params.leagueId as string
    const body = (await request.json()) as LeagueApplicationPayload
    if (!body.teamId || !canManageTeamAsCaptain(body.teamId, mockSession.user.id)) {
      return HttpResponse.json(
        {message: 'Подать заявку может только капитан или владелец команды'},
        {status: 403},
      )
    }
    const league = mockLeagues.find((l) => l.id === leagueId)
    if (!league || league.recruitingStatus === 'closed') {
      return HttpResponse.json({message: 'Набор в лигу закрыт'}, {status: 400})
    }
    const result = addMockLeagueApplication(leagueId, body)
    if ('error' in result) {
      return HttpResponse.json({message: result.error}, {status: 409})
    }
    return HttpResponse.json(result)
  }),

  http.patch(
    '/mock-api/v1/leagues/:leagueId/applications/:applicationId',
    async ({params, request}) => {
      const leagueId = params.leagueId as string
      const applicationId = params.applicationId as string
      if (!canManagePartnerEntity('league', leagueId)) {
        return HttpResponse.json({message: 'Недостаточно прав партнёра лиги'}, {status: 403})
      }
      const body = (await request.json()) as Pick<LeagueTeamApplication, 'status' | 'reviewComment'>
      const updated = updateMockLeagueApplication(leagueId, applicationId, {
        status: body.status as LeagueApplicationStatus,
        reviewComment: body.reviewComment,
      })
      if (!updated) {
        return HttpResponse.json({message: 'Application not found'}, {status: 404})
      }
      return HttpResponse.json(updated)
    },
  ),

  http.get('/mock-api/v1/leagues/:leagueId/posts', ({params}) => {
    const leagueId = params.leagueId as string
    return HttpResponse.json(getMockLeaguePosts(leagueId))
  }),

  http.post('/mock-api/v1/leagues/:leagueId/posts', async ({params, request}) => {
    const leagueId = params.leagueId as string
    if (!canManagePartnerEntity('league', leagueId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра лиги'}, {status: 403})
    }
    const body = (await request.json()) as {title: string; body: string; pinned: boolean}
    const post = addMockLeaguePost(leagueId, body)
    return HttpResponse.json(post)
  }),

  http.get('/mock-api/v1/leagues/:leagueId/analytics', ({params}) => {
    const leagueId = params.leagueId as string
    if (!canManagePartnerEntity('league', leagueId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра лиги'}, {status: 403})
    }
    return HttpResponse.json(getMockLeagueAnalytics(leagueId))
  }),

  http.post('/mock-api/v1/leagues/:leagueId/schedule', async ({params, request}) => {
    const leagueId = params.leagueId as string
    if (!canManagePartnerEntity('league', leagueId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра лиги'}, {status: 403})
    }
    const body = (await request.json()) as Omit<LeagueScheduleItem, 'id' | 'leagueId'>
    const item = addMockScheduleItem(leagueId, body)
    return HttpResponse.json(item)
  }),

  http.patch('/mock-api/v1/leagues/:leagueId/schedule/:scheduleId', async ({params, request}) => {
    const leagueId = params.leagueId as string
    const scheduleId = params.scheduleId as string
    if (!canManagePartnerEntity('league', leagueId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра лиги'}, {status: 403})
    }
    const body = (await request.json()) as Partial<LeagueScheduleItem>
    const updated = updateMockScheduleItem(leagueId, scheduleId, body)
    if (!updated) {
      return HttpResponse.json({message: 'Schedule item not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.patch('/mock-api/v1/leagues/:leagueId/standings', async ({params, request}) => {
    const leagueId = params.leagueId as string
    if (!canManagePartnerEntity('league', leagueId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра лиги'}, {status: 403})
    }
    const body = (await request.json()) as LeagueStanding
    const updated = updateMockStanding(leagueId, body.teamName, {
      wins: body.wins,
      losses: body.losses,
      gamesPlayed: body.gamesPlayed,
      points: body.points,
    })
    if (!updated) {
      return HttpResponse.json({message: 'Team not found in standings'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.post('/mock-api/v1/leagues/:leagueId/schedule-import', async ({params, request}) => {
    const leagueId = params.leagueId as string
    if (!canManagePartnerEntity('league', leagueId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра лиги'}, {status: 403})
    }
    const body = (await request.json()) as {csvText?: string}
    const result = importMockLeagueScheduleCsv(leagueId, body.csvText)
    return HttpResponse.json(result)
  }),
]
