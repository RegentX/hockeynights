/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

/** @spec SPEC-FR-10.1.1 - In-app уведомление */
export interface Notification {
  /** @spec SPEC-FR-10.1.1 */
  id: string
  /** @spec SPEC-FR-10.1.1 */
  userId: string
  /** @spec SPEC-FR-10.1.1 */
  type: 'sos' | 'roster' | 'response' | 'event_reminder'
  /** @spec SPEC-FR-10.1.1 */
  title: string
  /** @spec SPEC-FR-10.1.1 */
  body: string
  /** @spec SPEC-FR-10.1.1 */
  relatedEntityId?: string
  /** @spec SPEC-FR-10.1.2 */
  readAt?: string
  /** @spec SPEC-FR-10.1.1 */
  createdAt: string
}
