/**
 * SPEC-FR-14.1.1, SPEC-FR-14.1.2, SPEC-FR-14.1.3, SPEC-FR-14.1.4
 */

import type {SourceMeta} from '@/entities/common'

/** @spec SPEC-FR-14.1.4 */
export type HighlightUploadStatus = 'mock' | 'processing' | 'ready' | 'failed'

/** @spec SPEC-FR-14.1.2 */
export type AnnotationType = 'arrow' | 'zone' | 'text'

/** @spec SPEC-FR-14.1.3 */
export type HighlightCommentTag = 'tip' | 'mistake' | 'good_play'

/** @spec SPEC-FR-14.1.1 */
export interface Highlight {
  id: string
  eventId?: string
  teamId?: string
  authorUserId: string
  authorDisplayName: string
  title: string
  mockPreviewUrl: string
  uploadStatus: HighlightUploadStatus
  durationSeconds: number
  sourceMeta: SourceMeta
}

/** @spec SPEC-FR-14.1.2 */
export interface HighlightAnnotation {
  id: string
  highlightId: string
  timestampMs: number
  type: AnnotationType
  payload: Record<string, unknown>
  authorUserId: string
}

/** @spec SPEC-FR-14.1.3 */
export interface HighlightComment {
  id: string
  highlightId: string
  authorUserId: string
  authorDisplayName: string
  tag: HighlightCommentTag
  text: string
  createdAt: string
}

/** @spec SPEC-FR-14.1.1 */
export interface HighlightDetail extends Highlight {
  annotations: HighlightAnnotation[]
  comments: HighlightComment[]
}

/** @spec SPEC-FR-14.1.1 */
export interface CreateHighlightPayload {
  title: string
  eventId?: string
  teamId?: string
  authorUserId: string
  durationSeconds?: number
}

/** @spec SPEC-FR-14.1.2 */
export interface CreateAnnotationPayload {
  timestampMs: number
  type: AnnotationType
  payload: Record<string, unknown>
  authorUserId: string
}

/** @spec SPEC-FR-14.1.3 */
export interface CreateCommentPayload {
  authorUserId: string
  authorDisplayName: string
  tag: HighlightCommentTag
  text: string
}
