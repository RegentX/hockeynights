/**
 * SPEC-FR-1.1.1, SPEC-FR-12.1.2
 * TASK-QA-01, TASK-QA-02
 */

import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe, expect, it} from 'vitest'

const ROOT = resolve(__dirname, '..')

/** @spec SPEC-FR-1.1.1 - Ключевые файлы с SPEC-ссылками */
const TRACEABLE_FILES = [
  'pages/auth/ui/AuthPage.tsx',
  'features/auth/LoginForm.tsx',
  'features/auth/localAuthMemory.ts',
  'features/auth/AuthShell.tsx',
  'features/auth/AuthDemoCard.tsx',
  'features/auth/TermsOfUseDocument.tsx',
  'features/auth/TermsOfUsePage.tsx',
  'features/auth/TermsAcceptanceField.tsx',
  'features/auth/RegisterForm.tsx',
  'pages/auth/ui/MockLoginPage.tsx',
  'features/profile/HockeyProfileForm.tsx',
  'features/players/PlayerCard.tsx',
  'features/teams/TeamsPage.tsx',
  'features/events/EventCard.tsx',
  'features/sos/SosPage.tsx',
  'features/arenas/ArenasPage.tsx',
  'features/arenas/ArenaMap.tsx',
  'features/arenas/ExternalBookingButton.tsx',
  'shared/ui/MockExternalFlowDialog.tsx',
  'features/leagues/LeaguesPage.tsx',
  'features/feedback/PostGameFeedbackForm.tsx',
  'features/notifications/NotificationsPage.tsx',
  'features/shops/ShopsPage.tsx',
  'features/iq/IqTestsPage.tsx',
  'features/radar/IceRadarPage.tsx',
  'features/highlights/HighlightsPage.tsx',
  'features/admin/AdminDashboard.tsx',
  'mocks/handlers/index.ts',
  'shared/api/client.ts',
]

const UI_TRACEABLE_FILES = [
  'shared/ui/HockeyButton.tsx',
  'shared/ui/IceCard.tsx',
  'shared/ui/ScoreboardLoader.tsx',
  'app/AppShell.tsx',
  'features/leagues/LeagueStandings.tsx',
  'features/leagues/LeagueSchedule.tsx',
  'features/iq/IqAttemptFlow.tsx',
  'features/radar/RadarRecommendationCard.tsx',
  'features/arenas/SlotCalendar.tsx',
  'features/highlights/HighlightVideoBoard.tsx',
  'features/highlights/MockUploadNotice.tsx',
]

describe('SPEC traceability smoke', () => {
  /** @spec SPEC-FR-1.1.1 */
  it.each(TRACEABLE_FILES)('%s contains SPEC-FR references', (relativePath) => {
    const content = readFileSync(resolve(ROOT, relativePath), 'utf8')
    expect(content).toMatch(/SPEC-FR-\d/)
  })

  /** @spec SPEC-NFR-4 */
  it.each(UI_TRACEABLE_FILES)('%s contains SPEC-UI references', (relativePath) => {
    const content = readFileSync(resolve(ROOT, relativePath), 'utf8')
    expect(content).toMatch(/SPEC-UI-\d/)
  })
})
