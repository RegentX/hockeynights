/**
 * HOCFRONT-25 — команды, профиль команды, club_admin
 */

import {describe, expect, it} from 'vitest'

import {
  approveTrainingDraft,
  createClubPrivateTraining,
  createTrainingLineupDraft,
  fetchClub,
  fetchClubPrivateTrainings,
  publishTrainingDraft,
  submitTrainingDraftForApproval,
  updateClubProfile,
} from '@/entities/club'
import {buildFavoriteHref} from '@/entities/favorites'
import {
  fetchChatMessages,
  resolveMessageAction,
  searchDiscoverableChats,
} from '@/entities/messenger'
import {
  createTeam,
  fetchTeam,
  fetchTeamCalendarEvents,
  fetchTeamClubProfile,
  fetchTeams,
} from '@/entities/team'
import {
  getAllowedPathPrefixes,
  resolvePartnerNavItems,
} from '@/features/access/lib/navigationAccess'
import {
  describeSessionPersona,
  shouldUsePartnerWorkspace,
} from '@/features/access/lib/sessionPersona'
import {PERSONA_PRESETS} from '@/features/auth/lib/personaPresets'
import {completeOnboarding} from '@/mocks/data/session'
import {partnerCabinetLabel, partnerCabinetPath} from '@/shared/const/partnerRoutes'
import type {Session} from '@/shared/types/user'

function makeClubAdminSession(): Session {
  const preset = PERSONA_PRESETS.find((item) => item.id === 'club-admin')!
  return {
    user: {
      id: 'user-club-admin',
      displayName: preset.payload.displayName,
      roles: preset.payload.roles,
      city: 'Москва',
      createdAt: '2026-01-01T00:00:00Z',
      partnerMemberships: preset.payload.partnerMemberships,
    },
    isOnboarded: true,
    personaId: preset.id,
    homePath: '/partner/clubs/club-001',
    allowedPathPrefixes: getAllowedPathPrefixes({
      user: {
        id: 'user-club-admin',
        displayName: preset.payload.displayName,
        roles: preset.payload.roles,
        city: 'Москва',
        createdAt: '2026-01-01T00:00:00Z',
        partnerMemberships: preset.payload.partnerMemberships,
      },
      isOnboarded: true,
    }),
  }
}

describe('HOCFRONT-25 team profile + club cabinet', () => {
  it('favorite team link goes to /teams/:id', () => {
    expect(buildFavoriteHref('team', 'team-001')).toBe('/teams/team-001')
  })

  it('fetches public team and calendar', async () => {
    const team = await fetchTeam('team-001')
    expect(team.id).toBe('team-001')
    expect(team.city).toBe('Москва')
    expect(team.shortDescription).toBeTruthy()

    const calendar = await fetchTeamCalendarEvents('team-001')
    expect(calendar.length).toBeGreaterThan(0)
    expect(calendar.every((event) => event.teamId === 'team-001')).toBe(true)
  })

  it('exposes club_admin persona and partner cabinet path', () => {
    const session = makeClubAdminSession()
    expect(session.user.roles).toContain('club_admin')
    expect(shouldUsePartnerWorkspace(session)).toBe(true)
    expect(describeSessionPersona(session)).toBe('Админ клуба')

    const membership = session.user.partnerMemberships![0]
    expect(partnerCabinetPath(membership)).toBe('/partner/clubs/club-001')
    expect(partnerCabinetLabel(membership)).toBe('Кабинет клуба')
    expect(getAllowedPathPrefixes(session)).toEqual(
      expect.arrayContaining(['/partner', '/teams', '/events', '/players', '/shops', '/messenger']),
    )

    const navPaths = resolvePartnerNavItems(session).map((item) => item.to)
    expect(navPaths).toEqual(expect.arrayContaining(['/players', '/shops', '/messenger', '/teams']))
  })

  it('filters public team catalog', async () => {
    const byCity = await fetchTeams({city: 'Санкт'})
    expect(byCity.map((team) => team.id)).toEqual(['team-003'])

    const byName = await fetchTeams({q: 'Соколы'})
    expect(byName).toHaveLength(1)
    expect(byName[0].id).toBe('team-002')

    const bySkill = await fetchTeams({skillLevel: 'amateur'})
    expect(bySkill.some((team) => team.id === 'team-001')).toBe(true)
  })

  it('creates team with public discoverable messenger chat', async () => {
    const team = await createTeam({
      name: 'HOCFRONT Ice Wolves',
      city: 'Казань',
      skillLevel: 'amateur',
      shortDescription: 'Новая команда',
      playerIds: ['user-003'],
      coachIds: ['user-005'],
      createMessengerChat: true,
      messengerChatPublic: true,
    })
    expect(team.id).toBeTruthy()
    expect(team.memberIds).toEqual(expect.arrayContaining(['user-001', 'user-003', 'user-005']))

    const chats = await searchDiscoverableChats('Ice Wolves')
    expect(
      chats.some((chat) => chat.relatedEntityId === team.id && chat.visibility === 'public'),
    ).toBe(true)
  })

  it('returns null club-profile without 404 for teams without club', async () => {
    const club = await fetchTeamClubProfile('team-003')
    expect(club).toBeNull()
  })

  it('updates club profile and creates private_club training', async () => {
    const club = await fetchClub('club-001')
    expect(club.staff.length).toBeGreaterThan(0)

    const updated = await updateClubProfile('club-001', {
      description: 'Обновлённое описание клуба HOCFRONT-25',
      contactEmail: 'new-office@medvedi.hockey',
    })
    expect(updated.description).toContain('HOCFRONT-25')
    expect(updated.contactEmail).toBe('new-office@medvedi.hockey')

    const before = await fetchClubPrivateTrainings('club-001')
    const created = await createClubPrivateTraining('club-001', {
      title: 'HOCFRONT-25 private ice',
      startsAt: '2026-08-01T19:00:00+03:00',
      endsAt: '2026-08-01T20:30:00+03:00',
      arenaId: 'arena-001',
      teamId: 'team-001',
    })
    expect(created.accessScope).toBe('private_club')
    expect(created.clubId).toBe('club-001')

    const after = await fetchClubPrivateTrainings('club-001')
    expect(after.length).toBe(before.length + 1)
    expect(after.some((item) => item.id === created.id)).toBe(true)
  })

  it('requires coach approval then sends messenger appointments players can decline with reason', async () => {
    const clubAdmin = PERSONA_PRESETS.find((item) => item.id === 'club-admin')!
    completeOnboarding(
      clubAdmin.payload.displayName,
      clubAdmin.payload.roles,
      clubAdmin.payload.partnerMemberships ?? [],
    )

    const draft = await createTrainingLineupDraft('club-001', {
      teamId: 'team-001',
      title: 'HOCFRONT-25 lineup ice',
      startsAt: '2026-08-05T19:00:00+03:00',
      endsAt: '2026-08-05T20:30:00+03:00',
      arenaId: 'arena-001',
      assignments: [
        {
          userId: 'user-001',
          displayName: 'Иван Петров',
          position: 'forward',
          side: 'red',
          line: 1,
        },
        {
          userId: 'user-003',
          displayName: 'Дмитрий Козлов',
          position: 'defense',
          side: 'white',
          line: 1,
        },
      ],
    })
    expect(draft.status).toBe('draft')

    const submitted = await submitTrainingDraftForApproval('club-001', draft.id)
    expect(submitted.status).toBe('pending_coach')

    await expect(publishTrainingDraft('club-001', draft.id)).rejects.toThrow()

    completeOnboarding('Алексей Тренеров', ['coach'])
    const approved = await approveTrainingDraft('club-001', draft.id)
    expect(approved.status).toBe('approved')

    const published = await publishTrainingDraft('club-001', draft.id)
    expect(published.draft.status).toBe('published')
    expect(published.messageIds.length).toBeGreaterThan(0)

    const messages = await fetchChatMessages('chat-1')
    const appointment = messages.find(
      (message) =>
        message.actionData?.type === 'training_appointment' &&
        message.actionData.eventId === published.event.id,
    )
    expect(appointment).toBeTruthy()

    const declined = await resolveMessageAction(appointment!.id, {
      action: 'decline',
      declineReason: 'Травма',
    })
    expect(declined.success).toBe(true)
    expect(declined.status).toBe('declined')
  })
})
