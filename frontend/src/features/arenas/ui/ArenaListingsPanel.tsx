/**
 * HOCFRONT-32B — публичные объявления льда на странице арены
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {fetchArenaListings} from '@/entities/arena'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'

export interface ArenaListingsPanelProps {
  arenaId: string
  /** Без собственной IceCard — внутри родительской карточки */
  embedded?: boolean
}

export function ArenaListingsPanel({arenaId, embedded = false}: ArenaListingsPanelProps) {
  const {data: listings = []} = useQuery({
    queryKey: ['arena-listings', arenaId, 'public'],
    queryFn: () => fetchArenaListings(arenaId, {publicOnly: true}),
  })

  if (listings.length === 0) return null

  const body = (
    <div
      className="hockey-stack hockey-stack--gap-8"
      data-testid={testId('arenas', 'listings', 'panel', arenaId)}
    >
      <Text
        variant="subheader-2"
        data-testid={testId('arenas', 'listings', 'text', 'title', arenaId)}
      >
        Объявления льда
      </Text>
      {listings.map((listing) => {
        const start = new Date(listing.startsAt)
        const end = new Date(listing.endsAt)
        return (
          <div
            key={listing.id}
            className="hockey-stack hockey-stack--gap-4"
            data-testid={testId('arenas', 'listings', 'card', listing.id)}
          >
            <Text data-testid={testId('arenas', 'listings', 'text', 'name', listing.id)}>
              {listing.title}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('arenas', 'listings', 'text', 'schedule', listing.id)}
            >
              {start.toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' – '}
              {end.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
              {listing.priceRub != null ? ` · ${listing.priceRub.toLocaleString('ru-RU')} ₽` : ''}
            </Text>
            {listing.contactPhone && (
              <Text
                color="secondary"
                data-testid={testId('arenas', 'listings', 'text', 'phone', listing.id)}
              >
                {listing.contactPhone}
                {listing.contactNote ? ` · ${listing.contactNote}` : ''}
              </Text>
            )}
          </div>
        )
      })}
    </div>
  )

  if (embedded) {
    return <div className="arena-detail__listings">{body}</div>
  }

  return <IceCard padding="m">{body}</IceCard>
}
