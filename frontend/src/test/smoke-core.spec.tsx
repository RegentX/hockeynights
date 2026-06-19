/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.2.1, SPEC-FR-2.2.4
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2, SPEC-FR-3.1.1, SPEC-FR-3.2.1, SPEC-FR-3.3.1
 * SPEC-FR-4.1.1, SPEC-FR-4.2.1, SPEC-FR-4.3.1, SPEC-FR-5.1.1, SPEC-FR-5.2.1
 * SPEC-FR-5.2.2, SPEC-FR-6.1.1, SPEC-FR-6.2.1, SPEC-FR-6.3.1
 * TASK-QA-01
 */

import {screen, waitFor} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {mockApiGet, mockApiPatch, mockApiPost, mockApiPut} from '@/test/api'
import {renderWithProviders} from '@/test/render'
import {MockLoginPage} from '@/features/auth/MockLoginPage'
import {HockeyProfileForm} from '@/features/profile/HockeyProfileForm'
import {PlayersPage} from '@/features/players/PlayersPage'
import {TeamsPage} from '@/features/teams/TeamsPage'
import {EventsPage} from '@/features/events/EventsPage'
import {CalendarPage} from '@/features/calendar/CalendarPage'
import {SosPage} from '@/features/sos/SosPage'
import {ArenasPage} from '@/features/arenas/ArenasPage'
import type {GameEvent} from '@/entities/event/types'
import type {HockeyProfile} from '@/entities/profile/types'
import type {PlayerListItem} from '@/entities/profile/types'
import type {PublicPlayerView} from '@/entities/profile/types'
import type {Team} from '@/entities/team/types'
import type {TeamInvite} from '@/entities/team/types'
import type {RosterMember} from '@/entities/team/types'
import type {TrainingLineupAssignment} from '@/entities/team/types'
import type {Arena} from '@/entities/arena/types'
import type {RecruitmentRequest} from '@/entities/recruitment/types'
import type {Session} from '@/entities/user/types'
import type {Club} from '@/entities/club/types'

describe('TASK-QA-01 mock API smoke', () => {
  /** @spec SPEC-FR-2.1.3 */
  it('GET /session returns mock session', async () => {
    const session = await mockApiGet<Session>('/session')
    expect(session.user.id).toBe('user-001')
    expect(session.user.displayName).toBeTruthy()
  })

  /** @spec SPEC-FR-2.2.1 */
  it('GET /profile/me returns Hockey ID', async () => {
    const profile = await mockApiGet<HockeyProfile>('/profile/me')
    expect(profile.userId).toBe('user-001')
    expect(profile.profileCompleteness).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-2.3.1 */
  it('GET /players returns player list', async () => {
    const players = await mockApiGet<PlayerListItem[]>('/players')
    expect(players.length).toBeGreaterThan(0)
    expect(players[0].karmaScore).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-24.1.3 */
  it('GET /players/{userId} returns public Hockey ID view', async () => {
    const view = await mockApiGet<PublicPlayerView>('/players/user-002')
    expect(view.player.userId).toBe('user-002')
    expect(view.visibility).toBe('full')
  })

  /** @spec SPEC-FR-3.1.1 */
  it('GET /teams returns teams', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    expect(teams.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-21.1.5 */
  it('PATCH /teams/{teamId}/roles/{userId} updates team role', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const updated = await mockApiPatch<RosterMember>(`/teams/${teams[0].id}/roles/user-003`, {
      teamRole: 'coach',
    })
    expect(updated.teamRole).toBe('coach')
  })

  /** @spec SPEC-FR-21.1.5 */
  it('PATCH /teams/{teamId}/roles/{userId} prevents removing last owner', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const response = await fetch(`/mock-api/v1/teams/${teams[0].id}/roles/user-001`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({teamRole: 'player'}),
    })
    expect(response.status).toBe(400)
  })

  /** @spec SPEC-FR-21.1.2 */
  it('POST /teams/{teamId}/invites sends email invite', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const invite = await mockApiPost<TeamInvite>(`/teams/${teams[0].id}/invites`, {
      email: 'candidate@example.com',
    })
    expect(invite.email).toBe('candidate@example.com')
    expect(invite.status).toBe('sent')
  })

  /** @spec SPEC-FR-21.1.2 */
  it('GET /teams/{teamId}/invites returns invite history', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    await mockApiPost<TeamInvite>(`/teams/${teams[0].id}/invites`, {
      email: 'history-check@example.com',
    })
    const invites = await mockApiGet<TeamInvite[]>(`/teams/${teams[0].id}/invites`)
    expect(invites.length).toBeGreaterThan(0)
    expect(invites[0].email).toContain('@')
  })

  /** @spec SPEC-FR-24.3.2 */
  it('GET/PUT training lineup updates assignments', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const events = await mockApiGet<GameEvent[]>(`/teams/${teams[0].id}/training-events`)
    expect(events.length).toBeGreaterThan(0)

    const before = await mockApiGet<TrainingLineupAssignment[]>(
      `/teams/${teams[0].id}/training-lineup/${events[0].id}`,
    )
    expect(before.length).toBeGreaterThan(0)

    const updated = await mockApiPut<TrainingLineupAssignment[]>(
      `/teams/${teams[0].id}/training-lineup/${events[0].id}`,
      before.map((item, index) => ({
        ...item,
        side: index % 2 === 0 ? 'red' : 'white',
      })),
    )
    expect(updated.some((a) => a.side === 'red')).toBe(true)
  })

  /** @spec SPEC-FR-24.4.3 */
  it('GET /teams/{teamId}/club-profile returns squads and staff', async () => {
    const teams = await mockApiGet<Team[]>('/teams')
    const club = await mockApiGet<Club>(`/teams/${teams[0].id}/club-profile`)
    expect(club.squads.length).toBeGreaterThan(0)
    expect(club.staff.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-4.1.1 */
  it('GET /events returns events with participation', async () => {
    const events = await mockApiGet<GameEvent[]>('/events')
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].participation.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-4.2.1 */
  it('GET /calendar returns user calendar', async () => {
    const calendar = await mockApiGet<GameEvent[]>('/calendar')
    expect(Array.isArray(calendar)).toBe(true)
  })

  /** @spec SPEC-FR-4.3.1 */
  it('GET /events/{id}/roster-status returns deficit', async () => {
    const events = await mockApiGet<GameEvent[]>('/events')
    const status = await mockApiGet<{deficits: unknown[]}>(
      `/events/${events[0].id}/roster-status`,
    )
    expect(status.deficits).toBeDefined()
  })

  /** @spec SPEC-FR-5.2.1 */
  it('GET /recruitment-requests returns SOS feed', async () => {
    const requests = await mockApiGet<RecruitmentRequest[]>('/recruitment-requests')
    expect(requests.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-6.1.1 */
  it('GET /arenas returns Moscow rinks', async () => {
    const arenas = await mockApiGet<Arena[]>('/arenas')
    expect(arenas.length).toBeGreaterThan(0)
    expect(arenas[0].sourceMeta.syncStatus).toBeTruthy()
  })

  /** @spec SPEC-FR-6.3.1 */
  it('GET /arenas/{id}/slots returns ice slots', async () => {
    const arenas = await mockApiGet<Arena[]>('/arenas')
    const slots = await mockApiGet<unknown[]>(`/arenas/${arenas[0].id}/slots`)
    expect(slots.length).toBeGreaterThan(0)
  })
})

describe('TASK-QA-01 UI smoke', () => {
  /** @spec SPEC-FR-2.1.1 */
  it('MockLoginPage renders onboarding', () => {
    renderWithProviders(<MockLoginPage />)
    expect(screen.getByText('Hockey ID — вход')).toBeInTheDocument()
    expect(screen.getByText('Игрок')).toBeInTheDocument()
  })

  /** @spec SPEC-FR-2.2.4 */
  it('HockeyProfileForm loads profile completeness', async () => {
    renderWithProviders(<HockeyProfileForm />)
    await waitFor(() => {
      expect(screen.getByText('Hockey ID')).toBeInTheDocument()
      expect(screen.getByText(/Заполненность профиля/i)).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-2.3.2 */
  it('PlayersPage loads filters and cards', async () => {
    renderWithProviders(<PlayersPage />)
    await waitFor(() => {
      expect(screen.getByText('Игроки')).toBeInTheDocument()
      expect(screen.getByText('Алексей Смирнов')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-3.2.1 */
  it('TeamsPage loads team list', async () => {
    renderWithProviders(<TeamsPage />)
    await waitFor(() => {
      expect(screen.getByText('Команды')).toBeInTheDocument()
      expect(screen.getAllByText('Медведи САО').length).toBeGreaterThan(0)
      expect(screen.getByText('Составы клуба')).toBeInTheDocument()
      expect(screen.getAllByText('Медведи Pro').length).toBeGreaterThan(0)
      expect(screen.getByText('Штаб клуба')).toBeInTheDocument()
      expect(screen.getAllByText(/Активный состав/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Тактическая доска/i)).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-3.3.1 */
  it('EventsPage loads event cards', async () => {
    renderWithProviders(<EventsPage />)
    await waitFor(() => {
      expect(screen.getByText('Игры и тренировки')).toBeInTheDocument()
      expect(screen.getAllByText(/Товарищеская игра/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-4.2.2 */
  it('CalendarPage loads calendar', async () => {
    renderWithProviders(<CalendarPage />)
    await waitFor(() => {
      expect(screen.getByText('Календарь')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-5.1.1 */
  it('SosPage loads SOS feed', async () => {
    renderWithProviders(<SosPage />)
    await waitFor(() => {
      expect(screen.getAllByText(/Goalkeeper SOS/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-6.2.1 */
  it('ArenasPage loads rink cards', async () => {
    renderWithProviders(<ArenasPage />)
    await waitFor(() => {
      expect(screen.getByText('Катки Москвы')).toBeInTheDocument()
      expect(screen.getAllByText(/Ходынке/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText('Профиль арены').length).toBeGreaterThan(0)
    })
  })
})
