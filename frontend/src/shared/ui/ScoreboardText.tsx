/**
 * SPEC-UI-1.5
 */

import type {CSSProperties, ReactNode} from 'react'

/** @spec SPEC-UI-1.5 */
export type ScoreboardTone = 'default' | 'gold' | 'accent'

/** @spec SPEC-UI-1.5 - Props LED-текста */
export interface ScoreboardTextProps {
  children: ReactNode
  /** @spec SPEC-UI-1.5 */
  tone?: ScoreboardTone
  className?: string
  style?: CSSProperties
  'data-testid'?: string
}

/**
 * @spec SPEC-UI-1.5 - Табличный / LED стиль для чисел
 */
export function ScoreboardText({
  children,
  tone = 'default',
  className,
  style,
  'data-testid': dataTestId,
}: ScoreboardTextProps) {
  const toneClass =
    tone === 'gold' ? 'scoreboard-text--gold' : tone === 'accent' ? 'scoreboard-text--accent' : ''

  const classes = ['scoreboard-text', toneClass, className ?? ''].filter(Boolean).join(' ')

  return (
    <span className={classes} style={style} data-testid={dataTestId}>
      {children}
    </span>
  )
}
