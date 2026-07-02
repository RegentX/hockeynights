/**
 * SPEC-FR-12.1.2
 */

import {adminHandlers} from '@/mocks/handlers/admin'
import {arenaHandlers} from '@/mocks/handlers/arenas'
import {externalFlowHandlers} from '@/mocks/handlers/external-flows'
import {feedbackHandlers} from '@/mocks/handlers/feedback'
import {highlightHandlers} from '@/mocks/handlers/highlights'
import {iqHandlers} from '@/mocks/handlers/iq'
import {leagueHandlers} from '@/mocks/handlers/leagues'
import {messengerHandlers} from '@/mocks/handlers/messenger'
import {notificationHandlers} from '@/mocks/handlers/notifications'
import {profileHandlers} from '@/mocks/handlers/profile'
import {radarHandlers} from '@/mocks/handlers/radar'
import {recruitmentHandlers} from '@/mocks/handlers/recruitment'
import {sessionHandlers} from '@/mocks/handlers/session'
import {shopHandlers} from '@/mocks/handlers/shops'
import {teamHandlers} from '@/mocks/handlers/teams'

/** @spec SPEC-FR-12.1.2 - Все MSW handlers Phase 1 */
export const handlers = [
  ...sessionHandlers,
  ...profileHandlers,
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
