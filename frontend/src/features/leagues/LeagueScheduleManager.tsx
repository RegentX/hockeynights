/**
 * SPEC-FR-24.5.5
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import type {LeagueScheduleItem, LeagueStanding} from '@/entities/league/types'
import {
  createLeagueScheduleItem,
  fetchLeagueSchedule,
  fetchLeagueStandings,
  importLeagueSchedule,
  updateLeagueScheduleItem,
  updateLeagueStanding,
} from '@/features/leagues/api/leaguesApi'

const CSV_SAMPLE = `homeTeam,awayTeam,startsAt,arenaName
Сокол Юг,Буран,2026-07-12T20:00:00+03:00,Ледовый дворец на Ходынке`

const EMPTY_MATCH: Omit<LeagueScheduleItem, 'id' | 'leagueId'> = {
  homeTeam: '',
  awayTeam: '',
  startsAt: '',
  arenaName: '',
  status: 'scheduled',
}

export interface LeagueScheduleManagerProps {
  leagueId: string
}

/** @spec SPEC-FR-24.5.5 - Управление расписанием и таблицей лиги */
export function LeagueScheduleManager({leagueId}: LeagueScheduleManagerProps) {
  const queryClient = useQueryClient()
  const [matchForm, setMatchForm] = useState(EMPTY_MATCH)
  const [csvText, setCsvText] = useState(CSV_SAMPLE)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {data: schedule = []} = useQuery({
    queryKey: ['league-schedule', leagueId],
    queryFn: () => fetchLeagueSchedule(leagueId),
  })

  const {data: standings = []} = useQuery({
    queryKey: ['league-standings', leagueId],
    queryFn: () => fetchLeagueStandings(leagueId),
  })

  const createMutation = useMutation({
    mutationFn: (payload: Omit<LeagueScheduleItem, 'id' | 'leagueId'>) =>
      createLeagueScheduleItem(leagueId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['league-schedule', leagueId]})
      setMatchForm(EMPTY_MATCH)
      setStatusMessage('Матч добавлен в расписание.')
    },
  })

  const scoreMutation = useMutation({
    mutationFn: ({
      scheduleId,
      homeScore,
      awayScore,
    }: {
      scheduleId: string
      homeScore: number
      awayScore: number
    }) =>
      updateLeagueScheduleItem(leagueId, scheduleId, {
        homeScore,
        awayScore,
        status: 'completed',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['league-schedule', leagueId]})
      setStatusMessage('Результат сохранён.')
    },
  })

  const standingMutation = useMutation({
    mutationFn: (standing: LeagueStanding) => updateLeagueStanding(leagueId, standing),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['league-standings', leagueId]})
      setStatusMessage('Таблица обновлена.')
    },
  })

  const importMutation = useMutation({
    mutationFn: () => importLeagueSchedule(leagueId, csvText.trim() || undefined),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({queryKey: ['league-schedule', leagueId]})
      setStatusMessage(result.message ?? `Импортировано ${result.importedCount} матчей`)
    },
  })

  return (
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-16">
      <Text variant="subheader-2">Расписание и результаты</Text>

      <div className="partner-dashboard__form hockey-stack hockey-stack--gap-8">
        <Text variant="subheader-2">Импорт CSV</Text>
        <Text color="secondary">Колонки: homeTeam, awayTeam, startsAt, arenaName</Text>
        <TextArea value={csvText} onUpdate={setCsvText} rows={4} />
        <Button
          size="s"
          view="outlined"
          loading={importMutation.isPending}
          onClick={() => importMutation.mutate()}
        >
          Импортировать расписание
        </Button>
      </div>

      <ul className="partner-dashboard__list">
        {schedule.map((item) => (
          <li key={item.id} className="partner-dashboard__list-item partner-dashboard__list-item--stack">
            <div>
              <Text>
                {item.homeTeam} — {item.awayTeam}
              </Text>
              <Text color="secondary">
                {new Date(item.startsAt).toLocaleString('ru-RU')}
                {item.arenaName ? ` · ${item.arenaName}` : ''}
                {item.status === 'completed' && item.homeScore !== undefined
                  ? ` · ${item.homeScore}:${item.awayScore}`
                  : ` · ${item.status ?? 'scheduled'}`}
              </Text>
            </div>
            {item.status !== 'completed' && (
              <div className="partner-dashboard__tabs">
                <Button
                  size="s"
                  view="outlined"
                  onClick={() => scoreMutation.mutate({scheduleId: item.id, homeScore: 3, awayScore: 2})}
                >
                  Сохранить 3:2
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="partner-dashboard__form hockey-stack hockey-stack--gap-8">
        <Text variant="subheader-2">Добавить матч</Text>
        <TextInput
          label="Хозяева"
          value={matchForm.homeTeam}
          onUpdate={(value) => setMatchForm((prev) => ({...prev, homeTeam: value}))}
        />
        <TextInput
          label="Гости"
          value={matchForm.awayTeam}
          onUpdate={(value) => setMatchForm((prev) => ({...prev, awayTeam: value}))}
        />
        <TextInput
          label="Дата и время (ISO)"
          value={matchForm.startsAt}
          placeholder="2026-06-20T20:00:00+03:00"
          onUpdate={(value) => setMatchForm((prev) => ({...prev, startsAt: value}))}
        />
        <TextInput
          label="Арена"
          value={matchForm.arenaName ?? ''}
          onUpdate={(value) => setMatchForm((prev) => ({...prev, arenaName: value}))}
        />
        <Button
          view="action"
          size="s"
          disabled={!matchForm.homeTeam.trim() || !matchForm.awayTeam.trim() || !matchForm.startsAt.trim()}
          loading={createMutation.isPending}
          onClick={() => createMutation.mutate(matchForm)}
        >
          Добавить матч
        </Button>
      </div>

      <Text variant="subheader-2">Турнирная таблица</Text>
      <ul className="partner-dashboard__list">
        {standings.map((row) => (
          <li key={row.teamName} className="partner-dashboard__list-item">
            <Text>{row.teamName}</Text>
            <div className="partner-dashboard__tabs">
              <Button
                size="s"
                view="outlined"
                loading={standingMutation.isPending}
                onClick={() =>
                  standingMutation.mutate({
                    ...row,
                    wins: row.wins + 1,
                    gamesPlayed: row.gamesPlayed + 1,
                    points: row.points + 2,
                  })
                }
              >
                + победа
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {statusMessage && <Text color="secondary">{statusMessage}</Text>}
    </div>
  )
}
