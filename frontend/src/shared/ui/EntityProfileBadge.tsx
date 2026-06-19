/**
 * SPEC-FR-24.5.1, SPEC-FR-24.6.1, SPEC-FR-24.7.1
 */

export type EntityProfileKind = 'league' | 'arena' | 'shop'

const KIND_LABELS: Record<EntityProfileKind, string> = {
  league: 'Профиль лиги',
  arena: 'Профиль арены',
  shop: 'Профиль магазина',
}

export interface EntityProfileBadgeProps {
  kind: EntityProfileKind
  className?: string
}

/**
 * @spec SPEC-FR-24.5.1 - Бейдж публичного профиля экосистемной сущности
 */
export function EntityProfileBadge({kind, className}: EntityProfileBadgeProps) {
  return (
    <span className={['entity-profile-badge', `entity-profile-badge--${kind}`, className].filter(Boolean).join(' ')}>
      {KIND_LABELS[kind]}
    </span>
  )
}
