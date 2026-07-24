/**
 * HOCFRONT-19 — React Query hooks for entity favorites
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {
  addFavorite,
  type AddFavoritePayload,
  type Favorite,
  favoriteKey,
  type FavoriteType,
  fetchFavorites,
  removeFavorite,
} from '@/entities/favorites'

export const FAVORITES_QUERY_KEY = ['favorites'] as const

export function useFavoritesQuery() {
  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: fetchFavorites,
    select: (data) => data.items,
  })
}

export function useIsFavorite(type: FavoriteType, entityId: string): boolean {
  const {data: items = []} = useFavoritesQuery()
  const id = favoriteKey(type, entityId)
  return items.some((item) => item.id === id)
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      type: FavoriteType
      entityId: string
      title: string
      favorited: boolean
      href?: string
    }) => {
      const id = favoriteKey(input.type, input.entityId)
      if (input.favorited) {
        await removeFavorite(id)
        return {id, removed: true as const}
      }
      const payload: AddFavoritePayload = {
        type: input.type,
        entityId: input.entityId,
        title: input.title,
        href: input.href,
      }
      const favorite = await addFavorite(payload)
      return {favorite, removed: false as const}
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({queryKey: FAVORITES_QUERY_KEY})
      const previous = queryClient.getQueryData<{items: Favorite[]}>(FAVORITES_QUERY_KEY)
      const id = favoriteKey(input.type, input.entityId)
      const items = previous?.items ?? []

      if (input.favorited) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, {
          items: items.filter((item) => item.id !== id),
        })
      } else {
        const optimistic: Favorite = {
          id,
          type: input.type,
          entityId: input.entityId,
          title: input.title,
          href: input.href ?? `/${input.type}/${input.entityId}`,
          createdAt: new Date().toISOString(),
        }
        queryClient.setQueryData(FAVORITES_QUERY_KEY, {
          items: [optimistic, ...items.filter((item) => item.id !== id)],
        })
      }

      return {previous}
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({queryKey: FAVORITES_QUERY_KEY})
    },
  })
}
