/**
 * SPEC-FR-24.5.1, SPEC-FR-24.6.1, SPEC-FR-24.7.1
 */

import {testId} from '@/shared/testing/testId'

export type EntityProfileKind = 'league' | 'arena' | 'shop'

const KIND_LABELS: Record<EntityProfileKind, string> = {
  league: 'Профиль лиги',
  arena: 'Профиль арены',
  shop: 'Профиль магазина',
}

export interface EntityProfileBadgeProps {
  kind: EntityProfileKind
  className?: string
  testIdPrefix?: string
  'data-testid'?: string
}

/**
 * @spec SPEC-FR-24.5.1 - Бейдж публичного профиля экосистемной сущности
 */
export function EntityProfileBadge({
  kind,
  className,
  testIdPrefix = 'shared',
  'data-testid': dataTestId,
}: EntityProfileBadgeProps) {
  return (
    <span
      className={['entity-profile-badge', `entity-profile-badge--${kind}`, className]
        .filter(Boolean)
        .join(' ')}
      data-testid={dataTestId ?? testId(testIdPrefix, 'entity-profile-badge', 'badge', kind)}
    >
      {KIND_LABELS[kind]}
    </span>
  )
}
