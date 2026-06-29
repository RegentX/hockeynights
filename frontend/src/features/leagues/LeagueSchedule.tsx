/**
 * SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-UI-2.8
 */

import type {LeagueScheduleItem} from '@/entities/league/types'
import {MatchCenterFeed, type MatchCenterRowData} from '@/shared/ui/MatchCenterFeed'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-7.2.1 - Props расписания */
export interface LeagueScheduleProps {
  /** @spec SPEC-FR-7.2.1 */
  schedule: LeagueScheduleItem[]
}

/**
 * @spec SPEC-UI-2.8 - Расписание лиги в формате матч-центра
 * @spec SPEC-FR-7.2.1 - Расписание матчей лиги
 */
export function LeagueSchedule({schedule}: LeagueScheduleProps) {
  const rows: MatchCenterRowData[] = schedule.map((item) => ({
    id: item.id,
    time: new Date(item.startsAt).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    title:
      item.status === 'completed' && item.homeScore !== undefined
        ? `${item.homeTeam} ${item.homeScore}:${item.awayScore} ${item.awayTeam}`
        : `${item.homeTeam} — ${item.awayTeam}`,
    subtitle: [
      new Date(item.startsAt).toLocaleDateString('ru-RU'),
      item.arenaName,
    ]
      .filter(Boolean)
      .join(' · '),
    type: 'game',
  }))

  if (rows.length === 0) {
    return (
      <div data-testid={testId('leagues', 'schedule', 'empty')}>
        <EmptyNetState
          title="Нет матчей"
          copy="Расписание лиги пока недоступно."
        />
      </div>
    )
  }

  return (
    <div data-testid={testId('leagues', 'schedule', 'list')}>
      <MatchCenterFeed
        title="Расписание лиги"
        rows={rows}
        empty={
          <EmptyNetState
            title="Нет матчей"
            copy="Расписание лиги пока недоступно."
          />
        }
      />
    </div>
  )
}
