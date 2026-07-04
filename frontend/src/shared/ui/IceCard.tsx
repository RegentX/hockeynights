/**
 * SPEC-UI-1.3
 */

import {forwardRef, type CSSProperties, type ReactNode} from 'react'

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
  role?: string
  tabIndex?: number
  'aria-pressed'?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

/**
 * @spec SPEC-UI-1.3 - Карточка как ледовая плитка
 */
export const IceCard = forwardRef<HTMLDivElement, IceCardProps>(function IceCard(
  {
    children,
    padding = 'm',
    className,
    style,
    role,
    tabIndex,
    'aria-pressed': ariaPressed,
    'data-testid': dataTestId,
    onClick,
    onKeyDown,
  },
  ref,
) {
  const classes = ['ice-card', `ice-card--padding-${padding}`, className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={ref}
      className={classes}
      style={style}
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-pressed={ariaPressed}
      data-testid={dataTestId}
    >
      {children}
    </div>
  )
})
