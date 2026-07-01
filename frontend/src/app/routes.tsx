/**
 * SPEC-FR-1.2.1, SPEC-FR-2.1.1
 */

import {Navigate, Route, Routes} from 'react-router-dom'
import {AppShell} from '@/app/AppShell'
import {LoginLayout} from '@/app/LoginLayout'
import {PersonaGate} from '@/app/PersonaGate'
import {RequireAuth} from '@/app/RequireAuth'
import {MockLoginPage} from '@/pages/auth'
import {TermsOfUsePage} from '@/features/auth/TermsOfUsePage'
import {HockeyProfileForm} from '@/features/profile/HockeyProfileForm'
import {PlayersPage} from '@/features/players/PlayersPage'
import {PublicPlayerProfilePage} from '@/features/players/PublicPlayerProfilePage'
import {ArenasPage} from '@/features/arenas/ArenasPage'
import {TeamsPage} from '@/features/teams/TeamsPage'
import {EventsPage} from '@/features/events/EventsPage'
import {CalendarPage} from '@/features/calendar/CalendarPage'
import {SosPage} from '@/features/sos/SosPage'
import {LeaguesPage} from '@/features/leagues/LeaguesPage'
import {FeedbackPage} from '@/features/feedback/FeedbackPage'
import {NotificationsPage} from '@/features/notifications/NotificationsPage'
import {ShopsPage} from '@/features/shops/ShopsPage'
import {AdminDashboard} from '@/features/admin/AdminDashboard'
import {IqTestsPage} from '@/features/iq/IqTestsPage'
import {IceRadarPage} from '@/features/radar/IceRadarPage'
import {HighlightsPage} from '@/features/highlights/HighlightsPage'
import {MessengerPage} from '@/features/messenger/MessengerPage'
import {LeaguePartnerDashboard} from '@/features/leagues/LeaguePartnerDashboard'
import {ShopPartnerDashboard} from '@/features/shops/ShopPartnerDashboard'
import {PartnerHubPage} from '@/features/partners/PartnerHubPage'

/**
 * @spec SPEC-FR-1.2.1 - Маршрутизация MVP
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LoginLayout>
            <MockLoginPage />
          </LoginLayout>
        }
      />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/register"
        element={
          <LoginLayout>
            <MockLoginPage />
          </LoginLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <LoginLayout>
            <TermsOfUsePage />
          </LoginLayout>
        }
      />
      <Route element={<RequireAuth />}>
        <Route element={<PersonaGate />}>
          <Route element={<AppShell />}>
          <Route path="/profile" element={<HockeyProfileForm />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:userId" element={<PublicPlayerProfilePage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/sos" element={<SosPage />} />
        <Route path="/arenas" element={<ArenasPage />} />
        <Route path="/leagues" element={<LeaguesPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/messenger" element={<MessengerPage />} />
        <Route path="/shops" element={<ShopsPage />} />
        <Route path="/partner" element={<PartnerHubPage />} />
        <Route path="/partner/shops/:shopId" element={<ShopPartnerDashboard />} />
        <Route path="/partner/leagues/:leagueId" element={<LeaguePartnerDashboard />} />
        <Route path="/iq" element={<IqTestsPage />} />
        <Route path="/radar" element={<IceRadarPage />} />
        <Route path="/highlights" element={<HighlightsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
