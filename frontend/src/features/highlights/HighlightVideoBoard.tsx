/**
 * SPEC-FR-14.1.1, SPEC-FR-14.1.2, SPEC-FR-14.1.4
 * SPEC-UI-6.3, SPEC-UI-6.4
 */

import {useMemo, useState} from 'react'
import {Text} from '@gravity-ui/uikit'
import type {
  AnnotationType,
  HighlightCommentTag,
  HighlightDetail,
} from '@/entities/highlight/types'
import {AnnotationLayer} from '@/features/highlights/AnnotationLayer'
import {HighlightComments} from '@/features/highlights/HighlightComments'
import {MockUploadNotice} from '@/features/highlights/MockUploadNotice'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-14.1.1 - Props video-board */
export interface HighlightVideoBoardProps {
  highlight: HighlightDetail
  onAddAnnotation: (payload: {
    timestampMs: number
    type: AnnotationType
    payload: Record<string, unknown>
  }) => void
  onAddComment: (payload: {tag: HighlightCommentTag; text: string}) => void
  isAnnotationPending?: boolean
  isCommentPending?: boolean
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/**
 * @spec SPEC-UI-6.3 - Video-board: просмотр, разметка, комментарии
 */
export function HighlightVideoBoard({
  highlight,
  onAddAnnotation,
  onAddComment,
  isAnnotationPending = false,
  isCommentPending = false,
}: HighlightVideoBoardProps) {
  const [timestampMs, setTimestampMs] = useState(0)
  const maxMs = highlight.durationSeconds * 1000

  const sortedComments = useMemo(
    () =>
      [...highlight.comments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [highlight.comments],
  )

  return (
    <div className="video-board" data-testid={testId('highlights', 'video-board', 'video', highlight.id)}>
      <MockUploadNotice />

      <div className="video-board__head" data-testid={testId('highlights', 'video-board', 'panel', 'head', highlight.id)}>
        <Text variant="header-2" data-testid={testId('highlights', 'video-board', 'text', 'title', highlight.id)}>
          {highlight.title}
        </Text>
        <Text color="secondary" data-testid={testId('highlights', 'video-board', 'text', 'meta', highlight.id)}>
          {highlight.authorDisplayName} · {highlight.durationSeconds} с ·{' '}
          <ScoreboardText>{highlight.uploadStatus}</ScoreboardText>
        </Text>
      </div>

      <div className="video-board__layout" data-testid={testId('highlights', 'video-board', 'panel', 'layout', highlight.id)}>
        <div className="video-board__main" data-testid={testId('highlights', 'video-board', 'panel', 'main', highlight.id)}>
          <div
            className="video-board__preview"
            aria-label="Mock preview момента"
            data-testid={testId('highlights', 'video-board', 'panel', 'preview', highlight.id)}
          >
            <div className="video-board__rink" data-testid={testId('highlights', 'video-board', 'panel', 'rink', highlight.id)} />
            <AnnotationLayer
              annotations={highlight.annotations}
              currentTimestampMs={timestampMs}
              durationSeconds={highlight.durationSeconds}
              onAddAnnotation={onAddAnnotation}
              isPending={isAnnotationPending}
              highlightId={highlight.id}
            />
          </div>

          <label
            className="video-board__scrubber"
            data-testid={testId('highlights', 'video-board', 'field', 'scrubber', highlight.id)}
          >
            <span className="video-board__scrubber-label" data-testid={testId('highlights', 'video-board', 'text', 'scrubber-label', highlight.id)}>
              Таймкод: <ScoreboardText>{formatMs(timestampMs)}</ScoreboardText>
            </span>
            <input
              type="range"
              min={0}
              max={maxMs}
              step={100}
              value={timestampMs}
              onChange={(e) => setTimestampMs(Number(e.target.value))}
              aria-label="Позиция на таймлайне"
              data-testid={testId('highlights', 'video-board', 'field', 'scrubber-input', highlight.id)}
            />
          </label>
        </div>

        <aside className="video-board__aside" data-testid={testId('highlights', 'video-board', 'panel', 'aside', highlight.id)}>
          <HighlightComments
            comments={sortedComments}
            onAddComment={onAddComment}
            isPending={isCommentPending}
            highlightId={highlight.id}
          />
        </aside>
      </div>
    </div>
  )
}
