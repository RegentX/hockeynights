/**
 * SPEC-FR-2.3.1
 * Хук для работы с избранными игроками.
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {PlayerFavorites} from '@/entities/player-favorites'
import {fetchPlayerFavorites, patchPlayerFavorites} from '@/entities/player-favorites'

const QUERY_KEY = ['players', 'favorites'] as const
const MUTATION_KEY = ['players', 'favorites', 'toggle'] as const
const MUTATION_SCOPE = {id: 'player-favorites'} as const

function nextFavoriteIds(playerIds: string[], playerId: string, isFavorite: boolean): string[] {
  if (isFavorite) {
    return playerIds.filter((id) => id !== playerId)
  }
  return playerIds.includes(playerId) ? playerIds : [...playerIds, playerId]
}

/** @spec SPEC-FR-2.3.1 - Хук списка избранных игроков */
export function usePlayerFavorites() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchPlayerFavorites(),
  })
}

/**
 * @spec SPEC-FR-2.3.1 - Shared toggle-мутация с сериализацией и ensureQueryData
 */
export function useTogglePlayerFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: MUTATION_KEY,
    scope: MUTATION_SCOPE,
    mutationFn: async ({playerId, isFavorite}: {playerId: string; isFavorite: boolean}) => {
      await queryClient.ensureQueryData({
        queryKey: QUERY_KEY,
        queryFn: () => fetchPlayerFavorites(),
      })
      // После await предыдущих serial-мутаций читаем актуальный кэш
      const latest = queryClient.getQueryData<PlayerFavorites>(QUERY_KEY)
      if (!latest) {
        throw new Error('Избранное ещё не загружено')
      }
      return patchPlayerFavorites({
        playerIds: nextFavoriteIds(latest.playerIds, playerId, isFavorite),
      })
    },
    onMutate: async ({playerId, isFavorite}) => {
      await queryClient.cancelQueries({queryKey: QUERY_KEY})
      const previous = queryClient.getQueryData<PlayerFavorites>(QUERY_KEY)
      if (!previous) {
        return {previous}
      }
      queryClient.setQueryData<PlayerFavorites>(QUERY_KEY, {
        playerIds: nextFavoriteIds(previous.playerIds, playerId, isFavorite),
        updatedAt: new Date().toISOString(),
      })
      return {previous}
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({queryKey: QUERY_KEY})
    },
  })
}

/**
 * @spec SPEC-FR-2.3.1 - Единый хук кнопки избранного
 */
export function usePlayerFavorite(playerId: string | undefined) {
  const {data, isSuccess} = usePlayerFavorites()
  const mutation = useTogglePlayerFavorite()

  const isReady = isSuccess && Boolean(data)
  const isFavorite = Boolean(playerId && data?.playerIds.includes(playerId))
  const isPending = mutation.isPending && mutation.variables?.playerId === playerId
  const isError = mutation.isError && mutation.variables?.playerId === playerId

  const toggle = useCallback(() => {
    if (!playerId || !isReady) return
    mutation.mutate({playerId, isFavorite})
  }, [isFavorite, isReady, mutation, playerId])

  return {
    isFavorite: isReady ? isFavorite : undefined,
    isReady,
    isPending,
    isError,
    error: isError ? mutation.error : null,
    toggle,
  }
}
