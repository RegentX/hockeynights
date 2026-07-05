/**
 * SPEC-FR-14.1.1, SPEC-FR-14.1.4
 */

import {Text} from '@gravity-ui/uikit'

import type {Highlight} from '@/entities/highlight/types'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

/** @spec SPEC-FR-14.1.1 */
export interface HighlightCardProps {
  highlight: Highlight
  selected?: boolean
  onSelect: (highlight: Highlight) => void
}

/**
 * @spec SPEC-FR-14.1.1 - Карточка момента в каталоге
 */
export function HighlightCard({highlight, selected = false, onSelect}: HighlightCardProps) {
  return (
    <button
      type="button"
      className={`highlight-card${selected ? ' highlight-card--selected' : ''}`}
      onClick={() => onSelect(highlight)}
      aria-pressed={selected}
      data-testid={testId('highlights', 'card', 'item', highlight.id)}
    >
      <IceCard padding="s">
        <div
          className="highlight-card__head"
          data-testid={testId('highlights', 'card', 'panel', 'head', highlight.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('highlights', 'card', 'text', 'title', highlight.id)}
          >
            {highlight.title}
          </Text>
          <span
            className="highlight-card__badge"
            data-testid={testId('highlights', 'card', 'badge', 'mock', highlight.id)}
          >
            mock
          </span>
        </div>
        <Text
          color="secondary"
          data-testid={testId('highlights', 'card', 'text', 'author', highlight.id)}
        >
          {highlight.authorDisplayName}
        </Text>
        <div
          className="highlight-card__meta"
          data-testid={testId('highlights', 'card', 'panel', 'meta', highlight.id)}
        >
          <ScoreboardText
            data-testid={testId('highlights', 'card', 'text', 'duration', highlight.id)}
          >
            {highlight.durationSeconds} с
          </ScoreboardText>
          {highlight.eventId && (
            <Text
              color="secondary"
              data-testid={testId('highlights', 'card', 'text', 'event', highlight.id)}
            >
              Событие
            </Text>
          )}
        </div>
      </IceCard>
    </button>
  )
}
