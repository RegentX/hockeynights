/**
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2
 * SPEC-UI-2.1, SPEC-UI-3.1, SPEC-UI-3.3
 */

import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchPlayers, type PlayersFilterParams} from '@/features/players/api/playersApi'
import {PlayerCard} from '@/features/players/PlayerCard'
import {PlayerFilters} from '@/features/players/PlayerFilters'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {ScrollReveal} from '@/shared/ui/ScrollStory'
import {testId} from '@/shared/testing/testId'

/**
 * @spec SPEC-FR-2.3.1 - Страница списка игроков
 */
export function PlayersPage() {
  const [filters, setFilters] = useState<PlayersFilterParams>({})

  const {data: players = [], isLoading} = useQuery({
    queryKey: ['players', filters],
    queryFn: () => fetchPlayers(filters),
  })

  return (
    <div className="hockey-stack hockey-stack--gap-16" data-testid={testId('players', 'players-page', 'page')}>
      <Text variant="header-1" className="variable-font-header" data-testid={testId('players', 'players-page', 'text', 'title')}>Игроки</Text>
      <PlayerFilters filters={filters} onChange={setFilters} />

      {isLoading && (
        <>
          <ScoreboardLoader testIdPrefix="players" data-testid={testId('players', 'players-page', 'loader')} />
          <div className="hockey-grid hockey-grid--cards-260" data-testid={testId('players', 'players-page', 'list', 'skeleton')}>
            <IceSkeleton count={3} height={180} testIdPrefix="players" />
          </div>
        </>
      )}

      {!isLoading && (
        <div className="bento-grid" data-testid={testId('players', 'players-page', 'list', 'cards')}>
          {players.map((player, index) => (
            <ScrollReveal key={player.userId} direction={index % 2 === 0 ? 'left' : 'right'} data-testid={testId('players', 'players-page', 'item', player.userId)}>
              <PlayerCard player={player} />
            </ScrollReveal>
          ))}
        </div>
      )}

      {!isLoading && players.length === 0 && (
        <EmptyNetState
          title="Пустая сетка"
          copy="Игроки не найдены по выбранным фильтрам."
          testIdPrefix="players"
          data-testid={testId('players', 'players-page', 'empty')}
        />
      )}
    </div>
  )
}
