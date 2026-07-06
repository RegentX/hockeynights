/**
 * SPEC-UI-1.4
 */

import type {PlayerPosition} from '@/entities/common'
import {testId} from '@/shared/testing/testId'

const POSITION_SHORT: Record<PlayerPosition, string> = {
  goalie: 'ВР',
  defense: 'ЗЩ',
  forward: 'НП',
  any: 'УНИ',
}

const POSITION_CLASS: Record<PlayerPosition, string> = {
  goalie: 'position-label--goalie',
  defense: 'position-label--defense',
  forward: 'position-label--forward',
  any: 'position-label--any',
}

/** @spec SPEC-UI-1.4 - Props нашивки амплуа */
export interface PositionLabelProps {
  /** @spec SPEC-FR-2.2.2 */
  position: PlayerPosition
  /** @spec SPEC-UI-1.4 */
  showFull?: boolean
  testIdPrefix?: string
  'data-testid'?: string
}

/**
 * @spec SPEC-UI-1.4 - Label-нашивка по амплуа
 */
export function PositionLabel({
  position,
  showFull = false,
  testIdPrefix = 'shared',
  'data-testid': dataTestId,
}: PositionLabelProps) {
  const label = showFull
    ? ({goalie: 'Вратарь', defense: 'Защита', forward: 'Нападение', any: 'Универсал'}[position] ??
      position)
    : POSITION_SHORT[position]

  return (
    <span
      className={`position-label ${POSITION_CLASS[position]}`}
      aria-label={`Амплуа: ${label}`}
      data-testid={dataTestId ?? testId(testIdPrefix, 'position-label', 'badge', position)}
    >
      {label}
    </span>
  )
}
