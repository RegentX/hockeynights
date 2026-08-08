/**
 * SPEC-FR-12.1.2
 */

import {adminHandlers} from '@/mocks/handlers/admin'
import {arenaHandlers} from '@/mocks/handlers/arenas'
import {availabilityHandlers} from '@/mocks/handlers/availability'
import {clubHandlers} from '@/mocks/handlers/clubs'
import {eventHandlers} from '@/mocks/handlers/events'
import {externalFlowHandlers} from '@/mocks/handlers/external-flows'
import {favoriteHandlers} from '@/mocks/handlers/favorites'
import {feedbackHandlers} from '@/mocks/handlers/feedback'
import {highlightHandlers} from '@/mocks/handlers/highlights'
import {iqHandlers} from '@/mocks/handlers/iq'
import {leagueHandlers} from '@/mocks/handlers/leagues'
import {messengerHandlers} from '@/mocks/handlers/messenger'
import {notificationHandlers} from '@/mocks/handlers/notifications'
import {playerFavoritesHandlers} from '@/mocks/handlers/playerFavorites'
import {profileHandlers} from '@/mocks/handlers/profile'
import {radarHandlers} from '@/mocks/handlers/radar'
import {recruitmentHandlers} from '@/mocks/handlers/recruitment'
import {sessionHandlers} from '@/mocks/handlers/session'
import {shopHandlers} from '@/mocks/handlers/shops'
import {teamHandlers} from '@/mocks/handlers/teams'

/** @spec SPEC-FR-12.1.2 - Все MSW handlers Phase 1 */
export const handlers = [
  ...sessionHandlers,
  ...playerFavoritesHandlers,
  ...profileHandlers,
  ...eventHandlers,
  ...availabilityHandlers,
  ...arenaHandlers,
  ...teamHandlers,
  ...clubHandlers,
  ...recruitmentHandlers,
  ...leagueHandlers,
  ...feedbackHandlers,
  ...notificationHandlers,
  ...shopHandlers,
  ...adminHandlers,
  ...externalFlowHandlers,
  ...iqHandlers,
  ...radarHandlers,
  ...highlightHandlers,
  ...messengerHandlers,
  ...favoriteHandlers,
]
