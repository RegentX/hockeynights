/**
 * SPEC-FR-3.1.1
 */

import {Select, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import {fetchLeagues} from '@/entities/league'
import {fetchPlayers} from '@/entities/profile'
import type {TeamsFilterParams} from '@/entities/team'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/** @spec SPEC-FR-3.1.1 - Props фильтров списка команд */
export interface TeamFiltersProps {
  /** @spec SPEC-FR-3.1.1 */
  filters: TeamsFilterParams
  /** @spec SPEC-FR-3.1.1 */
  onChange: (filters: TeamsFilterParams) => void
  /** @spec SPEC-FR-3.1.1 - Сбросить фильтры */
  onReset?: () => void
  /** @spec SPEC-FR-3.1.1 - Есть ли активные значения */
  isFiltered?: boolean
}

/**
 * @spec SPEC-FR-3.1.1 - Фильтры списка команд: лига, название, игрок, город
 */
export function TeamFilters({filters, onChange, onReset, isFiltered}: TeamFiltersProps) {
  const {data: leagues = []} = useQuery({queryKey: ['leagues'], queryFn: fetchLeagues})
  const {data: players = []} = useQuery({queryKey: ['players'], queryFn: () => fetchPlayers()})

  const leagueOptions = useMemo(
    () => [
      {value: '', content: 'Все лиги'},
      ...leagues.map((l) => ({value: l.id, content: l.name})),
    ],
    [leagues],
  )

  const playerOptions = useMemo(
    () => [
      {value: '', content: 'Любой игрок'},
      ...players.map((p) => ({value: p.userId, content: p.displayName})),
    ],
    [players],
  )

  return (
    <div className="team-filters" data-testid={testId('teams', 'team-filters', 'form')}>
      <div className="hockey-grid hockey-grid--filters">
        <Select
          label="Лига"
          value={[filters.leagueId ?? '']}
          onUpdate={(v) => onChange({...filters, leagueId: v[0] || undefined})}
          options={leagueOptions}
          data-testid={testId('teams', 'team-filters', 'select', 'league')}
        />
        <TextInput
          label="Название"
          placeholder="Поиск по названию"
          value={filters.q ?? ''}
          onUpdate={(v) => onChange({...filters, q: v || undefined})}
          data-testid={testId('teams', 'team-filters', 'field', 'name')}
        />
        <Select
          label="Игрок"
          value={[filters.playerId ?? '']}
          onUpdate={(v) => onChange({...filters, playerId: v[0] || undefined})}
          options={playerOptions}
          data-testid={testId('teams', 'team-filters', 'select', 'player')}
        />
        <TextInput
          label="Город"
          value={filters.city ?? ''}
          onUpdate={(v) => onChange({...filters, city: v || undefined})}
          data-testid={testId('teams', 'team-filters', 'field', 'city')}
        />
      </div>
      {isFiltered && onReset && (
        <div className="team-filters__actions">
          <HockeyButton
            view="outlined"
            size="s"
            onClick={onReset}
            data-testid={testId('teams', 'team-filters', 'btn', 'reset')}
          >
            Сбросить фильтры
          </HockeyButton>
        </div>
      )}
    </div>
  )
}
