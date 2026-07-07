/**
 * SPEC-FR-14.1.2
 * SPEC-UI-6.3
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMemo, useState} from 'react'

import type {AnnotationType, HighlightAnnotation} from '@/entities/highlight'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const TYPE_OPTIONS = [
  {value: 'arrow', content: 'Стрелка'},
  {value: 'zone', content: 'Зона'},
  {value: 'text', content: 'Текст'},
]

/** @spec SPEC-FR-14.1.2 - Props слоя разметки */
export interface AnnotationLayerProps {
  annotations: HighlightAnnotation[]
  currentTimestampMs: number
  durationSeconds: number
  onAddAnnotation: (payload: {
    timestampMs: number
    type: AnnotationType
    payload: Record<string, unknown>
  }) => void
  isPending?: boolean
  highlightId: string
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/**
 * @spec SPEC-FR-14.1.2 - Слой стрелок, зон и текста поверх preview
 * @spec SPEC-UI-6.3 - Video-board с annotation layer
 */
export function AnnotationLayer({
  annotations,
  currentTimestampMs,
  durationSeconds,
  onAddAnnotation,
  isPending = false,
  highlightId,
}: AnnotationLayerProps) {
  const [annotationType, setAnnotationType] = useState<AnnotationType>('arrow')
  const [label, setLabel] = useState('')

  const visibleAnnotations = useMemo(
    () => annotations.filter((a) => Math.abs(a.timestampMs - currentTimestampMs) <= 1500),
    [annotations, currentTimestampMs],
  )

  /** @spec SPEC-FR-14.1.2 - Добавить разметку на текущий timestamp */
  function submitAnnotation() {
    const basePayload =
      annotationType === 'arrow'
        ? {x1: 25, y1: 55, x2: 70, y2: 35, label: label || 'Ход'}
        : annotationType === 'zone'
          ? {x: 45, y: 30, width: 28, height: 22, label: label || 'Зона'}
          : {x: 20, y: 75, text: label || 'Комментарий на кадре'}

    onAddAnnotation({
      timestampMs: currentTimestampMs,
      type: annotationType,
      payload: basePayload,
    })
    setLabel('')
  }

  return (
    <div
      className="annotation-layer"
      data-testid={testId('highlights', 'annotation-layer', 'panel', highlightId)}
    >
      <svg
        className="annotation-layer__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        data-testid={testId('highlights', 'annotation-layer', 'panel', 'svg', highlightId)}
      >
        {visibleAnnotations.map((annotation) => {
          if (annotation.type === 'arrow') {
            const {x1, y1, x2, y2} = annotation.payload as {
              x1: number
              y1: number
              x2: number
              y2: number
            }
            return (
              <g
                key={annotation.id}
                data-testid={testId('highlights', 'annotation-layer', 'item', annotation.id)}
              >
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="annotation-layer__arrow" />
                <polygon
                  points={`${x2},${y2} ${x2 - 3},${y2 - 2} ${x2 - 3},${y2 + 2}`}
                  className="annotation-layer__arrow-head"
                />
              </g>
            )
          }
          if (annotation.type === 'zone') {
            const {x, y, width, height} = annotation.payload as {
              x: number
              y: number
              width: number
              height: number
            }
            return (
              <rect
                key={annotation.id}
                x={x}
                y={y}
                width={width}
                height={height}
                className="annotation-layer__zone"
                data-testid={testId('highlights', 'annotation-layer', 'item', annotation.id)}
              />
            )
          }
          const {x, y, text} = annotation.payload as {x: number; y: number; text: string}
          return (
            <text
              key={annotation.id}
              x={x}
              y={y}
              className="annotation-layer__text"
              data-testid={testId('highlights', 'annotation-layer', 'item', annotation.id)}
            >
              {text}
            </text>
          )
        })}
      </svg>

      <div
        className="annotation-layer__form"
        data-testid={testId('highlights', 'annotation-layer', 'form', highlightId)}
      >
        <Text
          variant="subheader-2"
          data-testid={testId('highlights', 'annotation-layer', 'text', 'title', highlightId)}
        >
          Разметка · {formatMs(currentTimestampMs)}
        </Text>
        <div
          className="annotation-layer__fields"
          data-testid={testId('highlights', 'annotation-layer', 'panel', 'fields', highlightId)}
        >
          <Select
            value={[annotationType]}
            onUpdate={(vals) => setAnnotationType(vals[0] as AnnotationType)}
            options={TYPE_OPTIONS}
            size="m"
            data-testid={testId('highlights', 'annotation-layer', 'select', 'type', highlightId)}
          />
          <TextInput
            placeholder="Подпись / текст"
            value={label}
            onUpdate={setLabel}
            size="m"
            data-testid={testId('highlights', 'annotation-layer', 'field', 'label', highlightId)}
          />
          <HockeyButton
            size="m"
            onClick={submitAnnotation}
            disabled={isPending}
            data-testid={testId('highlights', 'annotation-layer', 'btn', 'add', highlightId)}
          >
            Добавить
          </HockeyButton>
        </div>
        <Text
          color="secondary"
          className="annotation-layer__hint"
          data-testid={testId('highlights', 'annotation-layer', 'text', 'hint', highlightId)}
        >
          Показаны метки ±1.5 с от {formatMs(currentTimestampMs)} · всего {durationSeconds} с
        </Text>
      </div>
    </div>
  )
}
