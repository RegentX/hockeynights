/**
 * SPEC-UI-2.5
 */

import type {ReactNode} from 'react'
import {Text} from '@gravity-ui/uikit'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-UI-2.5 */
export type MatchCenterEventType = 'game' | 'training' | 'sos' | 'open_ice'

/** @spec SPEC-UI-2.5 - Строка матч-центра */
export interface MatchCenterRowData {
  id: string
  time: string
  title: string
  subtitle?: string
  type: MatchCenterEventType
  isSos?: boolean
  actions?: ReactNode
}

/** @spec SPEC-UI-2.5 - Props матч-центра */
export interface MatchCenterFeedProps {
  /** @spec SPEC-UI-2.5 */
  title?: string
  /** @spec SPEC-UI-2.5 */
  rows: MatchCenterRowData[]
  /** @spec SPEC-UI-3.2 */
  empty?: ReactNode
  testIdPrefix?: string
  'data-testid'?: string
}

const TYPE_LABELS: Record<MatchCenterEventType, string> = {
  game: 'Игра',
  training: 'Тренировка',
  sos: 'SOS',
  open_ice: 'Открытый лёд',
}

/**
 * @spec SPEC-UI-2.5 - Лента в формате матч-центра
 */
export function MatchCenterFeed({
  title = 'Матч-центр',
  rows,
  empty,
  testIdPrefix = 'shared',
  'data-testid': dataTestId,
}: MatchCenterFeedProps) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>
  }

  return (
    <div className="match-center" data-testid={dataTestId ?? testId(testIdPrefix, 'match-center-feed', 'panel')}>
      <div className="match-center__header" data-testid={testId(testIdPrefix, 'match-center-feed', 'header')}>{title}</div>
      {rows.map((row) => (
        <div
          key={row.id}
          className={`match-center__row${row.isSos ? ' match-center__row--sos' : ''}${row.isSos ? ' hockey-sos-pulse' : ''}`}
          data-testid={testId(testIdPrefix, 'match-center-feed', 'row', row.id)}
        >
          <div>
            <div className="match-center__time" data-testid={testId(testIdPrefix, 'match-center-feed', 'cell', 'time', row.id)}>{row.time}</div>
            <div className={`match-center__type match-center__type--${row.type}`} data-testid={testId(testIdPrefix, 'match-center-feed', 'badge', row.type, row.id)}>
              {TYPE_LABELS[row.type]}
              {row.isSos && ' · Goalkeeper SOS'}
            </div>
          </div>
          <div>
            <Text variant="subheader-2" data-testid={testId(testIdPrefix, 'match-center-feed', 'text', 'title', row.id)}>{row.title}</Text>
            {row.subtitle && <Text color="secondary" data-testid={testId(testIdPrefix, 'match-center-feed', 'text', 'subtitle', row.id)}>{row.subtitle}</Text>}
          </div>
          {row.actions && <div data-testid={testId(testIdPrefix, 'match-center-feed', 'cell', 'actions', row.id)}>{row.actions}</div>}
        </div>
      ))}
    </div>
  )
}
