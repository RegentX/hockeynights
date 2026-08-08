/**
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2
 * SPEC-UI-2.1, SPEC-UI-3.1, SPEC-UI-3.3
 * HOCFRONT-20
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import {fetchPlayers, type PlayersFilterParams} from '@/entities/profile'
import {PlayerFilters} from '@/features/players'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {ScrollReveal} from '@/shared/ui/ScrollStory'
import {PlayerCard} from '@/widgets/PlayerCard'

const EMPTY_FILTERS: PlayersFilterParams = {}

function hasActiveFilters(filters: PlayersFilterParams): boolean {
  return Object.values(filters).some((v) => v !== undefined && v !== '' && v !== false)
}

/**
 * @spec SPEC-FR-2.3.1 - Страница списка игроков
 * @spec HOCFRONT-20 - Рабочая панель фильтров с применением к списку
 */
export function PlayersPage() {
  const [filters, setFilters] = useState<PlayersFilterParams>(EMPTY_FILTERS)

  const {
    data: players = [],
    isPending,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['players', filters],
    queryFn: () => fetchPlayers(filters),
    placeholderData: (previous) => previous,
  })

  const isFiltered = hasActiveFilters(filters)
  const showProgress = isFetching && !isPending

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS)
  }

  const activeCount = useMemo(
    () => Object.values(filters).filter((v) => v !== undefined && v !== '' && v !== false).length,
    [filters],
  )

  return (
    <div
      className="hockey-stack hockey-stack--gap-16 players-page"
      data-testid={testId('players', 'players-page', 'page')}
    >
      <div
        className={`players-page__progress${showProgress ? ' players-page__progress--active' : ''}`}
        aria-hidden
        data-testid={testId('players', 'players-page', 'progress')}
      />
      <Text
        variant="header-1"
        className="variable-font-header"
        data-testid={testId('players', 'players-page', 'text', 'title')}
      >
        Игроки
      </Text>
      <PlayerFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {isFiltered && (
        <div
          className="player-filters__summary"
          data-testid={testId('players', 'players-page', 'text', 'active-count')}
        >
          Активных фильтров: {activeCount}
        </div>
      )}

      {isPending && (
        <>
          <ScoreboardLoader
            testIdPrefix="players"
            data-testid={testId('players', 'players-page', 'loader')}
          />
          <div
            className="hockey-grid hockey-grid--cards-260"
            data-testid={testId('players', 'players-page', 'list', 'skeleton')}
          >
            <IceSkeleton count={3} height={180} testIdPrefix="players" />
          </div>
        </>
      )}

      {isError && !isPending && (
        <div data-testid={testId('players', 'players-page', 'error')}>
          <EmptyNetState
            title="Не удалось загрузить игроков"
            copy="Проверь соединение и попробуй ещё раз."
            testIdPrefix="players"
            action={
              <HockeyButton
                view="outlined"
                size="s"
                onClick={() => void refetch()}
                data-testid={testId('players', 'players-page', 'btn', 'retry')}
              >
                Повторить
              </HockeyButton>
            }
          />
        </div>
      )}

      {!isPending && !isError && players.length > 0 && (
        <div
          className={`bento-grid${showProgress ? ' players-page__list--fetching' : ''}`}
          data-testid={testId('players', 'players-page', 'list', 'cards')}
        >
          {players.map((player, index) => (
            <ScrollReveal
              key={player.userId}
              direction={index % 2 === 0 ? 'left' : 'right'}
              data-testid={testId('players', 'players-page', 'item', player.userId)}
            >
              <PlayerCard player={player} />
            </ScrollReveal>
          ))}
        </div>
      )}

      {!isPending && !isError && players.length === 0 && (
        <EmptyNetState
          title="Пустая сетка"
          copy={
            isFiltered
              ? 'Игроки не найдены по выбранным фильтрам.'
              : 'Пока нет игроков для отображения.'
          }
          testIdPrefix="players"
          data-testid={testId('players', 'players-page', 'empty')}
          action={
            isFiltered ? (
              <HockeyButton
                view="outlined"
                size="s"
                onClick={handleResetFilters}
                data-testid={testId('players', 'players-page', 'btn', 'reset')}
              >
                Сбросить фильтры
              </HockeyButton>
            ) : undefined
          }
        />
      )}
    </div>
  )
}
