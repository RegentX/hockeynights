/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.1.2
 * SPEC-FR-4.2.1, SPEC-FR-4.2.2, SPEC-FR-4.3.1, SPEC-FR-4.3.2
 * SPEC-FR-21.1.1, SPEC-FR-21.1.2
 */

import {http, HttpResponse} from 'msw'
import type {AttendanceStatus, EventType} from '@/entities/common/types'
import type {CreateTeamPayload} from '@/entities/team/types'
import type {CreateEventPayload} from '@/entities/event/types'
import {
  createMockEvent,
  getMockRosterStatus,
  mockEvents,
  updateMockAttendance,
} from '@/mocks/data/events'
import {
  addMockRosterMember,
  createMockTeamInvite,
  createMockTeam,
  mockRoster,
  mockTeams,
  updateMockTeamRole,
  updateMockRosterStatus,
} from '@/mocks/data/teams'
import {mockPlayers} from '@/mocks/data/players'

/** @spec SPEC-FR-3.1.1 - Handlers команд, событий и календаря */
export const teamHandlers = [
  http.get('/mock-api/v1/teams', () => {
    return HttpResponse.json(mockTeams)
  }),

  http.post('/mock-api/v1/teams', async ({request}) => {
    const body = (await request.json()) as CreateTeamPayload
    const team = createMockTeam({
      id: `team-${Date.now()}`,
      ...body,
      captainUserId: 'user-001',
      ownerUserId: 'user-001',
      memberIds: ['user-001'],
    })
    addMockRosterMember({
      teamId: team.id,
      userId: 'user-001',
      displayName: 'Иван Петров',
      position: 'forward',
      teamRole: 'owner',
      rosterStatus: 'active',
      joinedAt: new Date().toISOString(),
    })
    return HttpResponse.json(team)
  }),

  http.get('/mock-api/v1/teams/:teamId/roster', ({params}) => {
    const roster = mockRoster.filter((m) => m.teamId === params.teamId)
    return HttpResponse.json(roster)
  }),

  http.patch('/mock-api/v1/teams/:teamId/roster/:userId', async ({params, request}) => {
    const body = (await request.json()) as {rosterStatus: 'active' | 'bench' | 'invited' | 'removed'}
    const updated = updateMockRosterStatus(
      params.teamId as string,
      params.userId as string,
      body.rosterStatus,
    )
    if (!updated) {
      return HttpResponse.json({message: 'Member not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.post('/mock-api/v1/teams/:teamId/members', async ({params, request}) => {
    const body = (await request.json()) as {userId: string}
    const player = mockPlayers.find((p) => p.userId === body.userId)
    if (!player) {
      return HttpResponse.json(
        {message: 'Можно добавить только зарегистрированного пользователя'},
        {status: 400},
      )
    }
    const member = addMockRosterMember({
      teamId: params.teamId as string,
      userId: player.userId,
      displayName: player.displayName,
      position: player.position,
      teamRole: 'player',
      rosterStatus: 'invited',
      joinedAt: new Date().toISOString(),
    })
    return HttpResponse.json(member)
  }),

  http.patch('/mock-api/v1/teams/:teamId/roles/:userId', async ({params, request}) => {
    const body = (await request.json()) as {teamRole: 'owner' | 'captain' | 'coach' | 'team_admin' | 'player'}
    const actor = mockRoster.find((m) => m.teamId === params.teamId && m.userId === 'user-001')
    const canManageRoles = actor?.teamRole === 'owner' || actor?.teamRole === 'captain' || actor?.teamRole === 'team_admin'
    if (!canManageRoles) {
      return HttpResponse.json({message: 'Недостаточно прав для изменения ролей'}, {status: 403})
    }
    const updated = updateMockTeamRole(params.teamId as string, params.userId as string, body.teamRole)
    if (!updated) {
      return HttpResponse.json({message: 'Member not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.post('/mock-api/v1/teams/:teamId/invites', async ({params, request}) => {
    const body = (await request.json()) as {email: string}
    const email = body.email?.trim()
    if (!email || !email.includes('@')) {
      return HttpResponse.json({message: 'Некорректный email'}, {status: 400})
    }
    const invite = createMockTeamInvite(params.teamId as string, email)
    return HttpResponse.json(invite)
  }),

  http.get('/mock-api/v1/events', () => {
    return HttpResponse.json(mockEvents)
  }),

  http.post('/mock-api/v1/events', async ({request}) => {
    const body = (await request.json()) as CreateEventPayload
    const event = createMockEvent(body)
    return HttpResponse.json(event)
  }),

  http.get('/mock-api/v1/calendar', ({request}) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as EventType | null
    const attendanceStatus = url.searchParams.get('attendanceStatus') as AttendanceStatus | null

    let result = [...mockEvents]

    if (type) {
      result = result.filter((e) => e.type === type)
    }
    if (attendanceStatus) {
      result = result.filter((e) =>
        e.participation.some((p) => p.userId === 'user-001' && p.status === attendanceStatus),
      )
    }

    return HttpResponse.json(result)
  }),

  http.patch('/mock-api/v1/events/:eventId/attendance', async ({params, request}) => {
    const body = (await request.json()) as {status: AttendanceStatus; displayName?: string}
    const updated = updateMockAttendance(
      params.eventId as string,
      'user-001',
      body.displayName ?? 'Иван Петров',
      body.status,
    )
    if (!updated) {
      return HttpResponse.json({message: 'Event not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/events/:eventId/roster-status', ({params}) => {
    const status = getMockRosterStatus(params.eventId as string)
    if (!status) {
      return HttpResponse.json({message: 'Event not found'}, {status: 404})
    }
    return HttpResponse.json(status)
  }),
]
