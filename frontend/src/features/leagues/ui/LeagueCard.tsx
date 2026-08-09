/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.1.3, SPEC-FR-7.2.2
 * SPEC-UI-1.3, SPEC-UI-2.7
 */

import {Label, Text} from '@gravity-ui/uikit'
import {useState} from 'react'

import type {League} from '@/entities/league'
import {FavoriteButton} from '@/features/favorites'
import {MockLeaguePortalModal} from '@/features/leagues/ui/MockLeaguePortalModal'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'

/** @spec SPEC-FR-7.1.2 - Props карточки лиги */
export interface LeagueCardProps {
  /** @spec SPEC-FR-7.1.2 */
  league: League
  /** HOCFRONT-34A — открыть отдельную страницу лиги */
  onOpenDetails?: (leagueId: string) => void
  /** @spec SPEC-UI-2.7 */
  selected?: boolean
}

/**
 * @spec SPEC-FR-7.1.2 - Карточка лиги
 * @spec SPEC-FR-7.1.3 - Mock-портал сайта лиги
 */
export function LeagueCard({league, onOpenDetails, selected = false}: LeagueCardProps) {
  const [portalOpen, setPortalOpen] = useState(false)

  return (
    <>
      <div data-testid={testId('leagues', 'card', 'card', league.id)}>
        <IceCard padding="m" className={selected ? 'ice-card--selected' : undefined}>
          <div className="hockey-stack hockey-stack--gap-8">
            <div className="hockey-row hockey-row--gap-8 hockey-row--between hockey-row--align-start">
              <Text
                variant="header-2"
                className="hockey-entity-title--compact"
                data-testid={testId('leagues', 'card', 'text', 'name', league.id)}
              >
                {league.name}
              </Text>
              <div
                className="league-meta-chips"
                data-testid={testId('leagues', 'card', 'panel', 'chips', league.id)}
              >
                <FavoriteButton
                  type="league"
                  entityId={league.id}
                  title={league.name}
                  className="league-meta-chip league-meta-chip--favorite"
                />
                <div data-testid={testId('leagues', 'card', 'badge', 'profile', league.id)}>
                  <EntityProfileBadge kind="league" />
                </div>
              </div>
            </div>
            <Text
              color="secondary"
              data-testid={testId('leagues', 'card', 'text', 'region', league.id)}
            >
              {league.region}
            </Text>
            {league.level && (
              <Label size="s" data-testid={testId('leagues', 'card', 'badge', 'level', league.id)}>
                {league.level}
              </Label>
            )}
            <Label
              theme="warning"
              size="s"
              data-testid={testId('leagues', 'card', 'badge', 'integration', league.id)}
            >
              Интеграция: {league.integrationStatus}
            </Label>
            <div data-testid={testId('leagues', 'card', 'badge', 'source', league.id)}>
              <SourceMetaBadge sourceMeta={league.sourceMeta} />
            </div>
            {league.websiteUrl && (
              <HockeyButton
                view="outlined"
                onClick={() => setPortalOpen(true)}
                data-testid={testId('leagues', 'card', 'btn', 'portal', league.id)}
              >
                Сайт лиги (mock)
              </HockeyButton>
            )}
            {onOpenDetails && (
              <HockeyButton
                view={selected ? 'action' : 'outlined'}
                onClick={() => onOpenDetails(league.id)}
                data-testid={testId('leagues', 'card', 'btn', 'open', league.id)}
              >
                Профиль, таблица и расписание
              </HockeyButton>
            )}
          </div>
        </IceCard>
      </div>
      <MockLeaguePortalModal
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        league={league}
      />
    </>
  )
}
