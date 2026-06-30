/**
 * SPEC-FR-12.1.2
 */

import {sessionHandlers} from '@/mocks/handlers/session'
import {profileHandlers} from '@/mocks/handlers/profile'
import {eventHandlers} from '@/mocks/handlers/events'
import {arenaHandlers} from '@/mocks/handlers/arenas'
import {teamHandlers} from '@/mocks/handlers/teams'
import {recruitmentHandlers} from '@/mocks/handlers/recruitment'
import {leagueHandlers} from '@/mocks/handlers/leagues'
import {feedbackHandlers} from '@/mocks/handlers/feedback'
import {notificationHandlers} from '@/mocks/handlers/notifications'
import {shopHandlers} from '@/mocks/handlers/shops'
import {adminHandlers} from '@/mocks/handlers/admin'
import {externalFlowHandlers} from '@/mocks/handlers/external-flows'
import {iqHandlers} from '@/mocks/handlers/iq'
import {radarHandlers} from '@/mocks/handlers/radar'
import {highlightHandlers} from '@/mocks/handlers/highlights'
import {messengerHandlers} from '@/mocks/handlers/messenger'

/** @spec SPEC-FR-12.1.2 - Все MSW handlers Phase 1 */
export const handlers = [
  ...sessionHandlers,
  ...profileHandlers,
  ...eventHandlers,
  ...arenaHandlers,
  ...teamHandlers,
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
]
