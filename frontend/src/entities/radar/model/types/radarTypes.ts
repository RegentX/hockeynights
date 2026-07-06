/**
 * SPEC-FR-15.1.1, SPEC-FR-15.1.2, SPEC-FR-15.1.3
 */

/** @spec SPEC-FR-15.1.1 */
export type RadarRecommendationType = 'sos' | 'event' | 'ice_slot' | 'league' | 'training'

/** @spec SPEC-FR-15.1.2 */
export type RadarReasonCode =
  'nearby' | 'position_needed' | 'after_work' | 'favorite_arena' | 'team_activity'

/** @spec SPEC-FR-15.1.2 */
export type RadarPriority = 'high' | 'medium' | 'low'

/** @spec SPEC-FR-15.1.1 */
export interface RadarRecommendation {
  id: string
  type: RadarRecommendationType
  title: string
  reasonCode: RadarReasonCode
  reasonText: string
  district?: string
  startsAt?: string
  priority: RadarPriority
  targetRoute: string
  relatedEntityId?: string
  dismissedAt?: string
}

/** @spec SPEC-FR-15.1.3 */
export type RadarActionType = 'dismiss' | 'navigate'

/** @spec SPEC-FR-15.1.3 */
export interface RadarAction {
  id: string
  recommendationId: string
  userId: string
  action: RadarActionType
  createdAt: string
}

/** @spec SPEC-FR-15.1.3 */
export interface PatchRadarRecommendationPayload {
  action: RadarActionType
  userId?: string
}
