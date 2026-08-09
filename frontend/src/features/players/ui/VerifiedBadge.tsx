/**
 * SPEC-FR-17.1.2
 * HOCFRONT-23 — визуальная галочка подтверждённого игрока (без KYC/Госуслуг)
 */

import {CircleCheckFill} from '@gravity-ui/icons'
import {Icon} from '@gravity-ui/uikit'

import {testId} from '@/shared/testing/testId'

const VERIFIED_LABEL = 'Подтверждён'
const VERIFIED_ARIA = 'Профиль подтверждён'

export interface VerifiedBadgeProps {
  /** Показывать ли бейдж; для неподтверждённых компонент ничего не рендерит */
  verified: boolean
  /** Показать текстовую подпись рядом с галочкой */
  withLabel?: boolean
  className?: string
  testIdPrefix?: string
  /** Id сущности для уникального testid (например userId) */
  entityId?: string
  'data-testid'?: string
}

/**
 * @spec SPEC-FR-17.1.2 - Визуальная галочка verified рядом с карточкой/профилем
 * @spec HOCFRONT-23 - Visual-only verified badge
 */
export function VerifiedBadge({
  verified,
  withLabel = true,
  className,
  testIdPrefix = 'players',
  entityId,
  'data-testid': dataTestId,
}: VerifiedBadgeProps) {
  if (!verified) return null

  return (
    <span
      className={['hockey-verified-badge', className].filter(Boolean).join(' ')}
      data-testid={
        dataTestId ?? testId(testIdPrefix, 'verified-badge', 'badge', entityId ?? 'verified')
      }
      {...(withLabel ? {} : {'aria-label': VERIFIED_ARIA})}
      title={VERIFIED_ARIA}
    >
      <Icon data={CircleCheckFill} size={14} className="hockey-verified-badge__icon" aria-hidden />
      {withLabel ? <span className="hockey-verified-badge__label">{VERIFIED_LABEL}</span> : null}
    </span>
  )
}
