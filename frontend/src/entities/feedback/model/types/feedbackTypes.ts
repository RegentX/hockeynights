/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2, SPEC-FR-8.2.1, SPEC-FR-8.2.2
 */

/** @spec SPEC-FR-8.1.1 - Post-game feedback */
export interface Feedback {
  /** @spec SPEC-FR-8.1.1 */
  id: string
  /** @spec SPEC-FR-8.1.2 */
  eventId: string
  /** @spec SPEC-FR-8.1.1 */
  fromUserId: string
  /** @spec SPEC-FR-8.1.1 */
  toUserId: string
  /** @spec SPEC-FR-8.1.1 */
  attendanceRating: 'confirmed' | 'late' | 'no_show'
  /** @spec SPEC-FR-8.1.1 */
  skillMatchRating: 'too_low' | 'matched' | 'too_high'
  /** @spec SPEC-FR-8.1.1 */
  behaviorRating: 'positive' | 'neutral' | 'negative'
  /** @spec SPEC-FR-8.1.1 */
  comment?: string
  /** @spec SPEC-FR-8.1.1 */
  createdAt: string
}

/** @spec SPEC-FR-8.1.1 - Payload feedback */
export interface CreateFeedbackPayload {
  /** @spec SPEC-FR-8.1.2 */
  eventId: string
  /** @spec SPEC-FR-8.1.1 */
  toUserId: string
  /** @spec SPEC-FR-8.1.1 */
  attendanceRating: Feedback['attendanceRating']
  /** @spec SPEC-FR-8.1.1 */
  skillMatchRating: Feedback['skillMatchRating']
  /** @spec SPEC-FR-8.1.1 */
  behaviorRating: Feedback['behaviorRating']
  /** @spec SPEC-FR-8.1.1 */
  comment?: string
}

/** @spec SPEC-FR-8.2.1 - Karma score */
export interface KarmaInfo {
  /** @spec SPEC-FR-8.2.1 */
  userId: string
  /** @spec SPEC-FR-8.2.1 */
  karmaScore: number
  /** @spec SPEC-FR-8.2.1 */
  feedbackCount: number
  /** @spec SPEC-FR-8.2.2 */
  hint: string
}
