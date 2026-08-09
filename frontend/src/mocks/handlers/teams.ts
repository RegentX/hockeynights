/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.1.2
 * SPEC-FR-4.2.1, SPEC-FR-4.2.2, SPEC-FR-4.3.1, SPEC-FR-4.3.2
 * SPEC-FR-21.1.1, SPEC-FR-21.1.2
 */

import {http, HttpResponse} from 'msw'

import type {AttendanceStatus, EventType} from '@/entities/common'
import type {CreateEventPayload, UpdateEventPayload} from '@/entities/event'
import type {CreateTeamPayload} from '@/entities/team'
import {findMockClubByTeamId} from '@/mocks/data/clubs'
import {
  createMockEvent,
  getMockRosterStatus,
  listVisibleMockEvents,
  mockEvents,
  updateMockAttendance,
  updateMockEvent,
} from '@/mocks/data/events'
import {createMockChannelOrChat} from '@/mocks/data/messenger'
import {mockPlayers} from '@/mocks/data/players'
import {mockUser} from '@/mocks/data/session'
import {createMockStaffContactRequest} from '@/mocks/data/staffContact'
import {
  addMockRosterMember,
  createMockRegisteredTeamInvite,
  createMockTeam,
  createMockTeamInvite,
  mockRoster,
  mockTeamInvites,
  mockTeams,
  transferMockTeamOwnership,
  updateMockRosterStatus,
  updateMockTeamRole,
} from '@/mocks/data/teams'
import {getMockTrainingLineup, updateMockTrainingLineup} from '@/mocks/data/trainingLineup'

/** @spec SPEC-FR-3.1.1 - Handlers команд, событий и календаря */
export const teamHandlers = [
  http.get('/mock-api/v1/teams', ({request}) => {
    const url = new URL(request.url)
    const leagueId = url.searchParams.get('leagueId') ?? undefined
    const q = url.searchParams.get('q') ?? undefined
    const playerId = url.searchParams.get('playerId') ?? undefined
    const city = url.searchParams.get('city') ?? undefined
    const skillLevel = url.searchParams.get('skillLevel') ?? undefined

    let result = [...mockTeams]

    if (leagueId) {
      result = result.filter((team) => team.leagueId === leagueId)
    }
    if (q) {
      const needle = q.toLowerCase()
      result = result.filter(
        (team) =>
          team.name.toLowerCase().includes(needle) ||
          team.shortDescription?.toLowerCase().includes(needle) ||
          team.description?.toLowerCase().includes(needle),
      )
    }
    if (playerId) {
      result = result.filter((team) => team.memberIds.includes(playerId))
    }
    if (city) {
      const needle = city.toLowerCase()
      result = result.filter((team) => team.city.toLowerCase().includes(needle))
    }
    if (skillLevel) {
      result = result.filter((team) => team.skillLevel === skillLevel)
    }

    return HttpResponse.json(result)
  }),

  http.get('/mock-api/v1/teams/:teamId', ({params}) => {
    const team = mockTeams.find((item) => item.id === params.teamId)
    if (!team) {
      return HttpResponse.json({message: 'Team not found'}, {status: 404})
    }
    return HttpResponse.json(team)
  }),

  http.post('/mock-api/v1/teams', async ({request}) => {
    const body = (await request.json()) as CreateTeamPayload
    const playerIds = body.playerIds ?? []
    const coachIds = body.coachIds ?? []
    const createMessengerChat = body.createMessengerChat !== false
    const messengerChatPublic = body.messengerChatPublic !== false
    const memberIds = Array.from(new Set(['user-001', ...playerIds, ...coachIds]))

    const team = createMockTeam({
      id: `team-${Date.now()}`,
      name: body.name,
      city: body.city,
      skillLevel: body.skillLevel,
      description: body.description,
      shortDescription: body.shortDescription,
      leagueId: body.leagueId,
      homeArenaId: body.homeArenaId,
      logoUrl: body.logoUrl,
      captainUserId: 'user-001',
      ownerUserId: 'user-001',
      memberIds,
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

    for (const userId of playerIds) {
      if (userId === 'user-001') continue
      const player = mockPlayers.find((item) => item.userId === userId)
      addMockRosterMember({
        teamId: team.id,
        userId,
        displayName: player?.displayName ?? userId,
        position: player?.position ?? 'any',
        teamRole: 'player',
        rosterStatus: 'invited',
        joinedAt: new Date().toISOString(),
      })
    }

    for (const userId of coachIds) {
      if (userId === 'user-001') continue
      const player = mockPlayers.find((item) => item.userId === userId)
      addMockRosterMember({
        teamId: team.id,
        userId,
        displayName: player?.displayName ?? userId,
        position: player?.position ?? 'any',
        teamRole: 'coach',
        rosterStatus: 'active',
        joinedAt: new Date().toISOString(),
      })
    }

    /** SPEC-FR-16.1.1 — опциональный чат команды */
    if (createMessengerChat) {
      createMockChannelOrChat({
        type: 'team',
        title: team.name,
        tag: 'team',
        relatedEntityId: team.id,
        visibility: messengerChatPublic ? 'public' : 'team_members',
        restrictedUserIds: messengerChatPublic ? undefined : memberIds,
      })
    }

    return HttpResponse.json(team)
  }),

  http.get('/mock-api/v1/teams/:teamId/roster', ({params}) => {
    const roster = mockRoster.filter((m) => m.teamId === params.teamId)
    return HttpResponse.json(roster)
  }),

  http.patch('/mock-api/v1/teams/:teamId/roster/:userId', async ({params, request}) => {
    const body = (await request.json()) as {
      rosterStatus: 'active' | 'bench' | 'invited' | 'declined' | 'removed'
    }
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
    const teamId = params.teamId as string
    const player = mockPlayers.find((p) => p.userId === body.userId)
    if (!player) {
      return HttpResponse.json(
        {message: 'Можно добавить только зарегистрированного пользователя'},
        {status: 400},
      )
    }
    const existing = mockRoster.find((m) => m.teamId === teamId && m.userId === player.userId)
    if (existing && (existing.rosterStatus === 'active' || existing.rosterStatus === 'bench')) {
      return HttpResponse.json({message: 'Игрок уже в составе'}, {status: 400})
    }
    if (existing && existing.rosterStatus === 'invited') {
      return HttpResponse.json({message: 'Приглашение этому игроку уже отправлено'}, {status: 400})
    }

    createMockRegisteredTeamInvite(teamId, {
      userId: player.userId,
      displayName: player.displayName,
    })

    const member = addMockRosterMember({
      teamId,
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
    const body = (await request.json()) as {
      teamRole: 'owner' | 'captain' | 'coach' | 'team_admin' | 'player'
    }
    const actor = mockRoster.find((m) => m.teamId === params.teamId && m.userId === 'user-001')
    const canManageRoles =
      actor?.teamRole === 'owner' ||
      actor?.teamRole === 'captain' ||
      actor?.teamRole === 'team_admin'
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
      return HttpResponse.json(
        {message: 'Только владелец может передавать ownership'},
        {status: 403},
      )
    }
    if (isTargetOwner && nextRole !== 'owner' && !isActorOwner) {
      return HttpResponse.json(
        {message: 'Только владелец может менять роль владельца'},
        {status: 403},
      )
    }
    if (isTargetOwner && nextRole !== 'owner' && ownerCount <= 1) {
      return HttpResponse.json(
        {message: 'Нельзя снять последнего владельца команды'},
        {status: 400},
      )
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
    const events = mockEvents.filter((e) => e.teamId === params.teamId && e.type === 'training')
    return HttpResponse.json(events)
  }),

  http.get('/mock-api/v1/teams/:teamId/calendar', ({params}) => {
    const events = mockEvents
      .filter((e) => e.teamId === params.teamId)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
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
    const body = (await request.json()) as import('@/entities/team').TrainingLineupAssignment[]
    const updated = updateMockTrainingLineup(params.eventId as string, body)
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/teams/:teamId/club-profile', ({params}) => {
    const club = findMockClubByTeamId(params.teamId as string)
    // Нет клуба — не 404: публичная страница команды должна грузиться без клуба
    if (!club) {
      return HttpResponse.json(null)
    }
    return HttpResponse.json(club)
  }),

  http.get('/mock-api/v1/events', () => {
    return HttpResponse.json(listVisibleMockEvents())
  }),

  http.get('/mock-api/v1/events/:eventId', ({params}) => {
    const event = mockEvents.find((item) => item.id === params.eventId)
    if (!event) {
      return HttpResponse.json({message: 'Event not found'}, {status: 404})
    }
    return HttpResponse.json(event)
  }),

  http.post('/mock-api/v1/events', async ({request}) => {
    const body = (await request.json()) as CreateEventPayload
    const event = createMockEvent(body)
    return HttpResponse.json(event)
  }),

  http.patch('/mock-api/v1/events/:eventId', async ({params, request}) => {
    const body = (await request.json()) as UpdateEventPayload
    const updated = updateMockEvent(params.eventId as string, body)
    if (!updated) {
      return HttpResponse.json({message: 'Event not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/calendar', ({request}) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as EventType | null
    const attendanceStatus = url.searchParams.get('attendanceStatus') as AttendanceStatus | null

    let result = listVisibleMockEvents()

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
      mockUser.id,
      body.displayName ?? mockUser.displayName,
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

  http.post('/mock-api/v1/teams/:teamId/staff-contact', async ({params, request}) => {
    const teamId = params.teamId as string
    const team = mockTeams.find((item) => item.id === teamId)
    if (!team) {
      return HttpResponse.json({message: 'Team not found'}, {status: 404})
    }
    const body = (await request.json()) as {
      name?: string
      email?: string
      message?: string
    }
    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
      return HttpResponse.json({message: 'Name, email and message are required'}, {status: 400})
    }
    const created = createMockStaffContactRequest(teamId, {
      name: body.name,
      email: body.email,
      message: body.message,
    })
    return HttpResponse.json(created, {status: 201})
  }),
]
