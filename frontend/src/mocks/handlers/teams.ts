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
  mockTeamInvites,
  mockTeams,
  transferMockTeamOwnership,
  updateMockTeamRole,
  updateMockRosterStatus,
} from '@/mocks/data/teams'
import {mockPlayers} from '@/mocks/data/players'
import {
  getMockTrainingLineup,
  updateMockTrainingLineup,
} from '@/mocks/data/trainingLineup'
import {findMockClubByTeamId} from '@/mocks/data/clubs'

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
    const teamId = params.teamId as string
    const userId = params.userId as string
    const target = mockRoster.find((m) => m.teamId === teamId && m.userId === userId)
    if (!target) {
      return HttpResponse.json({message: 'Member not found'}, {status: 404})
    }

    const isActorOwner = actor?.teamRole === 'owner'
    const isTargetOwner = target.teamRole === 'owner'
    const nextRole = body.teamRole
    const owners = mockRoster.filter((m) => m.teamId === teamId && m.teamRole === 'owner')
    const ownerCount = owners.length

    if (nextRole === 'owner' && !isActorOwner) {
      return HttpResponse.json({message: 'Только владелец может передавать ownership'}, {status: 403})
    }
    if (isTargetOwner && nextRole !== 'owner' && !isActorOwner) {
      return HttpResponse.json({message: 'Только владелец может менять роль владельца'}, {status: 403})
    }
    if (isTargetOwner && nextRole !== 'owner' && ownerCount <= 1) {
      return HttpResponse.json({message: 'Нельзя снять последнего владельца команды'}, {status: 400})
    }

    const updated =
      nextRole === 'owner'
        ? transferMockTeamOwnership(teamId, userId)
        : updateMockTeamRole(teamId, userId, nextRole)
    if (!updated) {
      return HttpResponse.json({message: 'Member not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/teams/:teamId/invites', ({params}) => {
    const invites = mockTeamInvites.filter((invite) => invite.teamId === params.teamId)
    return HttpResponse.json(invites)
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

  http.get('/mock-api/v1/teams/:teamId/training-events', ({params}) => {
    const events = mockEvents.filter(
      (e) => e.teamId === params.teamId && e.type === 'training',
    )
    return HttpResponse.json(events)
  }),

  http.get('/mock-api/v1/teams/:teamId/training-lineup/:eventId', ({params}) => {
    const actor = mockRoster.find((m) => m.teamId === params.teamId && m.userId === 'user-001')
    const canView =
      actor?.teamRole === 'owner' ||
      actor?.teamRole === 'captain' ||
      actor?.teamRole === 'coach' ||
      actor?.teamRole === 'team_admin' ||
      actor?.teamRole === 'player'
    if (!canView) {
      return HttpResponse.json({message: 'Недостаточно прав'}, {status: 403})
    }
    const lineup = getMockTrainingLineup(params.teamId as string, params.eventId as string)
    return HttpResponse.json(lineup)
  }),

  http.put('/mock-api/v1/teams/:teamId/training-lineup/:eventId', async ({params, request}) => {
    const actor = mockRoster.find((m) => m.teamId === params.teamId && m.userId === 'user-001')
    const canEdit =
      actor?.teamRole === 'owner' ||
      actor?.teamRole === 'captain' ||
      actor?.teamRole === 'coach' ||
      actor?.teamRole === 'team_admin'
    if (!canEdit) {
      return HttpResponse.json({message: 'Недостаточно прав для раскладки'}, {status: 403})
    }
    const body = (await request.json()) as import('@/entities/team/types').TrainingLineupAssignment[]
    const updated = updateMockTrainingLineup(params.eventId as string, body)
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/teams/:teamId/club-profile', ({params}) => {
    const club = findMockClubByTeamId(params.teamId as string)
    if (!club) {
      return HttpResponse.json({message: 'Club not found for team'}, {status: 404})
    }
    return HttpResponse.json(club)
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
