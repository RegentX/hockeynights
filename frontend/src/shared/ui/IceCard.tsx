/**
 * SPEC-UI-1.3
 */

import type {CSSProperties, ReactNode} from 'react'

/** @spec SPEC-UI-1.3 */
export type IceCardPadding = 's' | 'm' | 'l'

/** @spec SPEC-UI-1.3 - Props ледовой карточки */
export interface IceCardProps {
  children: ReactNode
  /** @spec SPEC-UI-1.3 */
  padding?: IceCardPadding
  className?: string
  style?: CSSProperties
  'data-testid'?: string
}

/**
 * @spec SPEC-UI-1.3 - Карточка как ледовая плитка
 */
export function IceCard({children, padding = 'm', className, style, 'data-testid': dataTestId}: IceCardProps) {
  const classes = ['ice-card', `ice-card--padding-${padding}`, className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} style={style} data-testid={dataTestId}>
      {children}
    </div>
  )
}
