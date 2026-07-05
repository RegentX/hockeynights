/**
 * SPEC-UI-1.1, SPEC-UI-1.2
 */

import {Button, type ButtonButtonProps} from '@gravity-ui/uikit'

/** @spec SPEC-UI-1.1 */
export type HockeyButtonVariant = 'puck' | 'sos'

/** @spec SPEC-UI-1.1 - Props шайба-кнопки */
export interface HockeyButtonProps extends ButtonButtonProps {
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
