/**
 * SPEC-FR-1.2.1, SPEC-FR-2.1.1
 */

import {Navigate, Route, Routes} from 'react-router'
import {BrowserRouter} from 'react-router'

import {LoginLayout} from '@/app/LoginLayout'
import {PersonaGate} from '@/app/PersonaGate'
import {RequireAuth} from '@/app/RequireAuth'
import {RequireOrganizerAccess} from '@/app/RequireOrganizerAccess'
import {AdminDashboard} from '@/pages/AdminDashboard'
import {ArenaDetailsPage} from '@/pages/ArenaDetailsPage'
import {ArenaPartnerDashboard} from '@/pages/ArenaPartnerDashboard'
import {ArenasPage} from '@/pages/ArenasPage'
import {MockLoginPage} from '@/pages/auth'
import {CalendarPage} from '@/pages/CalendarPage'
import {ClubPartnerDashboard} from '@/pages/ClubPartnerDashboard'
import {CreateEventPage} from '@/pages/CreateEventPage'
import {CreateTeamPage} from '@/pages/CreateTeamPage'
import {EditTrainingPage} from '@/pages/EditTrainingPage'
import {EventsPage} from '@/pages/EventsPage'
import {FeedbackPage} from '@/pages/FeedbackPage'
import {GameDetailsPage} from '@/pages/GameDetailsPage'
import {HighlightsPage} from '@/pages/HighlightsPage'
import {IqTestsPage} from '@/pages/IqTestsPage'
import {LeagueDetailsPage} from '@/pages/LeagueDetailsPage'
import {LeaguePartnerDashboard} from '@/pages/LeaguePartnerDashboard'
import {LeaguesPage} from '@/pages/LeaguesPage'
import {MessengerPage} from '@/pages/MessengerPage'
import {NotificationsPage} from '@/pages/NotificationsPage'
import {OrganizerEventsPage} from '@/pages/OrganizerEventsPage'
import {PartnerHubPage} from '@/pages/PartnerHubPage'
import {PlayersPage} from '@/pages/PlayersPage'
import {HockeyProfileForm} from '@/pages/ProfilePage'
import {PublicPlayerProfilePage} from '@/pages/PublicPlayerProfilePage'
import {ShopPartnerDashboard} from '@/pages/ShopPartnerDashboard'
import {ShopsPage} from '@/pages/ShopsPage'
import {SosPage} from '@/pages/SosPage'
import {TeamProfilePage} from '@/pages/TeamProfilePage'
import {TeamsPage} from '@/pages/TeamsPage'
import {TermsOfUsePage} from '@/pages/TermsOfUsePage'
import {TrainingDetailsPage} from '@/pages/TrainingDetailsPage'
import {routes} from '@/shared/const/appRoutes'
import {AppShell} from '@/widgets/AppShell'

/**
 * @spec SPEC-FR-1.2.1 - Маршрутизация MVP
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={routes.home}
          element={
            <LoginLayout>
              <MockLoginPage />
            </LoginLayout>
          }
        />
        <Route path={routes.login} element={<Navigate to={routes.home} replace />} />
        <Route
          path={routes.register}
          element={
            <LoginLayout>
              <MockLoginPage />
            </LoginLayout>
          }
        />
        <Route
          path={routes.terms}
          element={
            <LoginLayout>
              <TermsOfUsePage />
            </LoginLayout>
          }
        />
        <Route element={<RequireAuth />}>
          <Route element={<PersonaGate />}>
            <Route element={<AppShell />}>
              <Route path={routes.profile} element={<HockeyProfileForm />} />
              <Route path={routes.players} element={<PlayersPage />} />
              <Route path={routes.playerProfile} element={<PublicPlayerProfilePage />} />
              <Route path={routes.teams} element={<TeamsPage />} />
              <Route path={routes.teamsCreate} element={<CreateTeamPage />} />
              <Route path={routes.teamProfile} element={<TeamProfilePage />} />
              <Route path={routes.events} element={<EventsPage />} />
              <Route element={<RequireOrganizerAccess />}>
                <Route path={routes.eventsCreate} element={<CreateEventPage />} />
                <Route path={routes.eventsOrganizer} element={<OrganizerEventsPage />} />
                <Route path={routes.trainingEdit} element={<EditTrainingPage />} />
              </Route>
              <Route path={routes.trainingDetails} element={<TrainingDetailsPage />} />
              <Route path={routes.gameDetails} element={<GameDetailsPage />} />
              <Route path={routes.calendar} element={<CalendarPage />} />
              <Route path={routes.sos} element={<SosPage />} />
              <Route path={routes.arenas} element={<ArenasPage />} />
              <Route path={routes.arenaDetails} element={<ArenaDetailsPage />} />
              <Route path={routes.leagues} element={<LeaguesPage />} />
              <Route path={routes.leagueDetails} element={<LeagueDetailsPage />} />
              <Route path={routes.feedback} element={<FeedbackPage />} />
              <Route path={routes.notifications} element={<NotificationsPage />} />
              <Route path={routes.messenger} element={<MessengerPage />} />
              <Route path={routes.shops} element={<ShopsPage />} />
              <Route path={routes.partner} element={<PartnerHubPage />} />
              <Route path={routes.partnerShop} element={<ShopPartnerDashboard />} />
              <Route path={routes.partnerLeague} element={<LeaguePartnerDashboard />} />
              <Route path={routes.partnerClub} element={<ClubPartnerDashboard />} />
              <Route path={routes.partnerArena} element={<ArenaPartnerDashboard />} />
              <Route path={routes.iq} element={<IqTestsPage />} />
              <Route path={routes.radar} element={<Navigate to={routes.events} replace />} />
              <Route path={routes.highlights} element={<HighlightsPage />} />
              <Route path={routes.admin} element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={routes.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
