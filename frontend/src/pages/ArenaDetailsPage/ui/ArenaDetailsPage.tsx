/**
 * HOCFRONT-32 — полноценная страница арены
 * SPEC-FR-6.2.1, SPEC-FR-6.3.1
 */

import {useQuery} from '@tanstack/react-query'
import {Link, useParams} from 'react-router'

import {arenaHasFreeSlots, fetchArena, fetchArenaSlots} from '@/entities/arena'
import {ArenaDetailPanel} from '@/features/arenas'
import {ARENAS_LABEL} from '@/shared/config/navigationLabels'
import {routes} from '@/shared/const/appRoutes'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export function ArenaDetailsPage() {
  const {arenaId = ''} = useParams()
  const {
    data: arena,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['arena', arenaId],
    queryFn: () => fetchArena(arenaId),
    enabled: Boolean(arenaId),
  })
  const {data: slots = []} = useQuery({
    queryKey: ['arena-slots', arenaId],
    queryFn: () => fetchArenaSlots(arenaId),
    enabled: Boolean(arenaId),
  })

  useDocumentTitle(arena ? `${arena.name} · ${ARENAS_LABEL}` : ARENAS_LABEL)

  if (isLoading) {
    return (
      <div data-testid={testId('arenas', 'details', 'loader')}>
        <ScoreboardLoader label="Загрузка арены..." />
      </div>
    )
  }

  if (isError || !arena) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-12"
        data-testid={testId('arenas', 'details', 'empty')}
      >
        <EmptyNetState
          title="Арена не найдена"
          copy="Вернитесь к каталогу и выберите площадку из списка или с карты."
        />
        <Link to={routes.arenas} data-testid={testId('arenas', 'details', 'link', 'back-empty')}>
          <HockeyButton
            view="flat"
            size="m"
            data-testid={testId('arenas', 'details', 'btn', 'back-empty')}
          >
            К ледовым аренам
          </HockeyButton>
        </Link>
      </div>
    )
  }

  return (
    <div className="arena-details-page" data-testid={testId('arenas', 'details', 'page', arena.id)}>
      <div className="arena-details-page__toolbar">
        <Link to={routes.arenas} data-testid={testId('arenas', 'details', 'link', 'back')}>
          <HockeyButton
            view="flat"
            size="s"
            data-testid={testId('arenas', 'details', 'btn', 'back')}
          >
            ← К каталогу
          </HockeyButton>
        </Link>
      </div>

      <ArenaDetailPanel
        arena={arena}
        slots={slots}
        hasFreeSlot={
          arena.bookingMode === 'slot_calendar' ? arenaHasFreeSlots(arena.id, slots) : undefined
        }
      />
    </div>
  )
}
