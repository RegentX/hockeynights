/**
 * SPEC-FR-7.1.3
 */

import {Button, Text} from '@gravity-ui/uikit'

import type {League} from '@/entities/league/types'
import {testId} from '@/shared/testing/testId'
import {MockExternalFlowDialog} from '@/shared/ui/MockExternalFlowDialog'

/** @spec SPEC-FR-7.1.3 - Props mock-портала лиги */
export interface MockLeaguePortalModalProps {
  /** @spec SPEC-FR-7.1.3 */
  open: boolean
  /** @spec SPEC-FR-7.1.3 */
  onClose: () => void
  /** @spec SPEC-FR-7.1.2 */
  league: League
}

/**
 * @spec SPEC-FR-7.1.3 - Mock-превью сайта лиги
 */
export function MockLeaguePortalModal({open, onClose, league}: MockLeaguePortalModalProps) {
  return (
    <MockExternalFlowDialog
      open={open}
      onClose={onClose}
      flowType="league_portal"
      partnerName={league.name}
      externalUrl={league.websiteUrl}
      footer={
        <Button
          view="action"
          onClick={onClose}
          data-testid={testId('leagues', 'portal', 'modal', 'btn', 'close', league.id)}
        >
          Закрыть
        </Button>
      }
    >
      <div
        className="hockey-stack hockey-stack--gap-8"
        data-testid={testId('leagues', 'portal', 'modal', league.id)}
      >
        <Text data-testid={testId('leagues', 'portal', 'modal', 'text', 'region', league.id)}>
          {league.region}
        </Text>
        {league.level && (
          <Text
            color="secondary"
            data-testid={testId('leagues', 'portal', 'modal', 'text', 'level', league.id)}
          >
            Уровень: {league.level}
          </Text>
        )}
        <Text
          color="secondary"
          data-testid={testId('leagues', 'portal', 'modal', 'text', 'integration', league.id)}
        >
          Интеграция: {league.integrationStatus}
        </Text>
        <Text
          color="secondary"
          data-testid={testId('leagues', 'portal', 'modal', 'text', 'description', league.id)}
        >
          Mock-портал лиги: расписание, заявки, статистика. В Phase 2 — import/API партнёра.
        </Text>
      </div>
    </MockExternalFlowDialog>
  )
}
