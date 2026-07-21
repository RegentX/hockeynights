/**
 * SPEC-FR-2.3.1
 * Хук для работы с избранными игроками.
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useCallback, useMemo} from 'react'

import type {PlayerFavorites} from '@/entities/player-favorites'
import {fetchPlayerFavorites, patchPlayerFavorites} from '@/entities/player-favorites'

const QUERY_KEY = ['players', 'favorites'] as const

/** @spec SPEC-FR-2.3.1 - Хук списка избранных игроков */
export function usePlayerFavorites() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchPlayerFavorites(),
  })
}

/**
 * @spec SPEC-FR-2.3.1 - Toggle-мутация с оптимистичным обновлением
 */
export function useTogglePlayerFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({playerId, isFavorite}: {playerId: string; isFavorite: boolean}) => {
      const current = queryClient.getQueryData<PlayerFavorites>(QUERY_KEY) ?? {
        playerIds: [],
        updatedAt: new Date().toISOString(),
      }
      const nextIds = isFavorite
        ? current.playerIds.filter((id) => id !== playerId)
        : current.playerIds.includes(playerId)
          ? current.playerIds
          : [...current.playerIds, playerId]
      return patchPlayerFavorites({playerIds: nextIds})
    },
    onMutate: async ({playerId, isFavorite}) => {
      await queryClient.cancelQueries({queryKey: QUERY_KEY})
      const previous = queryClient.getQueryData<PlayerFavorites>(QUERY_KEY)
      if (previous) {
        const nextIds = isFavorite
          ? previous.playerIds.filter((id) => id !== playerId)
          : [...previous.playerIds, playerId]
        queryClient.setQueryData<PlayerFavorites>(QUERY_KEY, {
          playerIds: nextIds,
          updatedAt: new Date().toISOString(),
        })
      }
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

/** @spec SPEC-FR-2.3.1 - Удобный селектор «избран ли игрок» */
export function useIsPlayerFavorite(playerId: string | undefined): boolean {
  const {data} = usePlayerFavorites()
  return useMemo(() => {
    if (!playerId || !data) return false
    return data.playerIds.includes(playerId)
  }, [data, playerId])
}

/**
 * @spec SPEC-FR-2.3.1 - Toggle-обработчик для кнопки
 */
export function usePlayerFavoriteToggle(playerId: string | undefined) {
  const isFavorite = useIsPlayerFavorite(playerId)
  const mutation = useTogglePlayerFavorite()

  return useCallback(() => {
    if (!playerId) return
    mutation.mutate({playerId, isFavorite})
  }, [mutation, isFavorite, playerId])
}
