/**
 * SPEC-UI-1.1, SPEC-UI-1.2
 */

import {Button} from '@gravity-ui/uikit'
import type {ComponentProps} from 'react'

/** @spec SPEC-UI-1.1 */
export type HockeyButtonVariant = 'puck' | 'sos'

/** @spec SPEC-UI-1.1 - Props шайба-кнопки */
export type HockeyButtonProps = ComponentProps<typeof Button> & {
  /** @spec SPEC-UI-1.2 */
  variant?: HockeyButtonVariant
}

/**
 * @spec SPEC-UI-1.1 - CTA в форме шайбы со скольжением
 * @spec SPEC-UI-1.2 - SOS «красная лампа»
 */
export function HockeyButton({
  variant = 'puck',
  className,
  view,
  children,
  ...props
}: HockeyButtonProps) {
  const classes = ['hockey-button', variant === 'sos' ? 'hockey-button--sos' : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <Button {...props} className={classes} view={variant === 'sos' ? 'flat' : (view ?? 'action')}>
      {children}
    </Button>
  )
}
