/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.1.3, SPEC-FR-7.2.2
 * SPEC-UI-1.3, SPEC-UI-2.7
 */

import {useState} from 'react'
import {Label, Text} from '@gravity-ui/uikit'
import type {League} from '@/entities/league/types'
import {MockLeaguePortalModal} from '@/features/leagues/MockLeaguePortalModal'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/** @spec SPEC-FR-7.1.2 - Props карточки лиги */
export interface LeagueCardProps {
  /** @spec SPEC-FR-7.1.2 */
  league: League
  /** @spec SPEC-FR-7.2.1 */
  onSelect?: (leagueId: string) => void
  /** @spec SPEC-UI-2.7 */
  selected?: boolean
}

/**
 * @spec SPEC-FR-7.1.2 - Карточка лиги
 * @spec SPEC-FR-7.1.3 - Mock-портал сайта лиги
 */
export function LeagueCard({league, onSelect, selected = false}: LeagueCardProps) {
  const [portalOpen, setPortalOpen] = useState(false)

  return (
    <>
      <IceCard
        padding="m"
        className={selected ? 'ice-card--selected' : undefined}
      >
        <div className="hockey-stack hockey-stack--gap-8">
          <div className="hockey-row hockey-row--gap-8 hockey-row--between">
            <Text variant="subheader-2">{league.name}</Text>
            <EntityProfileBadge kind="league" />
          </div>
          <Text color="secondary">{league.region}</Text>
          {league.level && <Label size="s">{league.level}</Label>}
          <Label theme="warning" size="s">
            Интеграция: {league.integrationStatus}
          </Label>
          <SourceMetaBadge sourceMeta={league.sourceMeta} />
          {league.websiteUrl && (
            <HockeyButton view="outlined" onClick={() => setPortalOpen(true)}>
              Сайт лиги (mock)
            </HockeyButton>
          )}
          {onSelect && (
            <HockeyButton
              view={selected ? 'action' : 'outlined'}
              onClick={() => onSelect(league.id)}
            >
              {selected ? '● Таблица и расписание' : 'Таблица и расписание'}
            </HockeyButton>
          )}
        </div>
      </IceCard>
      <MockLeaguePortalModal
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        league={league}
      />
    </>
  )
}
