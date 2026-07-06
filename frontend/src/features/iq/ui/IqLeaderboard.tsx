/**
 * SPEC-FR-13.1.3
 * SPEC-UI-6.2
 */

import {Text} from '@gravity-ui/uikit'

import type {IqLeaderboardRow} from '@/entities/iq'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

/** @spec SPEC-FR-13.1.3 - Props лидерборда */
export interface IqLeaderboardProps {
  /** @spec SPEC-FR-13.1.3 */
  rows: IqLeaderboardRow[]
}

/**
 * @spec SPEC-FR-13.1.3 - Лидерборд Hockey IQ
 * @spec SPEC-UI-6.2 - Рейтинг с LED-числами
 */
export function IqLeaderboard({rows}: IqLeaderboardProps) {
  return (
    <div data-testid={testId('iq', 'leaderboard', 'card')}>
      <IceCard padding="m">
        <Text variant="subheader-2" data-testid={testId('iq', 'leaderboard', 'text', 'title')}>
          IQ Leaderboard
        </Text>
        <div
          className="iq-leaderboard"
          role="table"
          aria-label="Hockey IQ leaderboard"
          data-testid={testId('iq', 'leaderboard', 'table')}
        >
          {rows.map((row) => (
            <div
              key={row.userId}
              className="iq-leaderboard__row"
              role="row"
              data-testid={testId('iq', 'leaderboard', 'row', row.userId)}
            >
              <span
                role="cell"
                className="iq-leaderboard__rank"
                data-testid={testId('iq', 'leaderboard', 'cell', 'rank', row.userId)}
              >
                {row.rank}
              </span>
              <span
                role="cell"
                data-testid={testId('iq', 'leaderboard', 'cell', 'name', row.userId)}
              >
                {row.displayName}
              </span>
              <span
                role="cell"
                data-testid={testId('iq', 'leaderboard', 'cell', 'score', row.userId)}
              >
                <ScoreboardText tone={row.rank === 1 ? 'gold' : 'accent'}>
                  {row.score}
                </ScoreboardText>
              </span>
              <span
                role="cell"
                className="iq-leaderboard__streak"
                data-testid={testId('iq', 'leaderboard', 'cell', 'streak', row.userId)}
              >
                x{row.streak}
              </span>
            </div>
          ))}
        </div>
      </IceCard>
    </div>
  )
}
