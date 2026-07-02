/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.3.1
 * SPEC-UI-2.2, SPEC-UI-3.1
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import type {ArenaFilters as ArenaFiltersType} from '@/entities/arena/types'
import {fetchArenas, fetchArenaSlots} from '@/features/arenas/api/arenasApi'
import {ArenaDetailPanel} from '@/features/arenas/ArenaDetailPanel'
import {ArenaFilters} from '@/features/arenas/ArenaFilters'
import {ArenaMap} from '@/features/arenas/ArenaMap'
import {RinkCard} from '@/features/arenas/RinkCard'
import {arenaHasFreeSlots} from '@/mocks/data/arenas'
import {ARENAS_PAGE_TITLE} from '@/shared/config/navigationLabels'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {IceCard} from '@/shared/ui/IceCard'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {ScrollReveal} from '@/shared/ui/ScrollStory'

/**
 * @spec SPEC-FR-6.1.1 - Страница списка и карты арен
 */
export function ArenasPage() {
  useDocumentTitle(ARENAS_PAGE_TITLE)
  const [filters, setFilters] = useState<ArenaFiltersType>({})
  const [selectedArenaId, setSelectedArenaId] = useState<string | null>(null)

  const {data: arenas = [], isLoading} = useQuery({
    queryKey: ['arenas', filters],
    queryFn: () => fetchArenas(filters),
  })

  const activeArenaId = selectedArenaId ?? arenas[0]?.id ?? null
  const activeArena = arenas.find((a) => a.id === activeArenaId) ?? null

  const {data: slots = []} = useQuery({
    queryKey: ['arena-slots', activeArenaId],
    queryFn: () => fetchArenaSlots(activeArenaId!),
    enabled: Boolean(activeArenaId),
  })

  const freeSlotArenaIds = useMemo(
    () => new Set(arenas.filter((a) => arenaHasFreeSlots(a.id)).map((a) => a.id)),
    [arenas],
  )

  return (
    <div className="arenas-page" data-testid={testId('arenas', 'page')}>
      <ScrollReveal direction="down">
        <Text
          variant="header-1"
          className="variable-font-header"
          data-testid={testId('arenas', 'page', 'text', 'title')}
        >
          {ARENAS_PAGE_TITLE}
        </Text>
        <Text color="secondary" data-testid={testId('arenas', 'page', 'text', 'subtitle')}>
          Карта площадок и разные способы записи: слоты по времени или заявка через портал.
        </Text>
      </ScrollReveal>

      <ArenaFilters filters={filters} onChange={setFilters} />

      {isLoading && (
        <div data-testid={testId('arenas', 'page', 'loader')}>
          <ScoreboardLoader label="Загрузка арен" />
          <IceSkeleton count={2} height={200} />
        </div>
      )}

      {!isLoading && arenas.length === 0 && (
        <div data-testid={testId('arenas', 'page', 'empty')}>
          <EmptyNetState copy="По выбранным фильтрам площадки не найдены." />
        </div>
      )}

      {!isLoading && arenas.length > 0 && (
        <div className="arenas-page__layout" data-testid={testId('arenas', 'page', 'layout')}>
          <div className="arenas-page__map-col" data-testid={testId('arenas', 'page', 'map-col')}>
            <div data-testid={testId('arenas', 'page', 'card', 'map')}>
              <IceCard padding="m">
                <ArenaMap
                  arenas={arenas}
                  selectedArenaId={activeArenaId}
                  onSelectArena={setSelectedArenaId}
                  freeSlotArenaIds={freeSlotArenaIds}
                />
              </IceCard>
            </div>

            <div className="arenas-page__list" data-testid={testId('arenas', 'page', 'list')}>
              {arenas.map((arena, index) => (
                <ScrollReveal key={arena.id} direction={index % 2 === 0 ? 'left' : 'right'}>
                  <RinkCard
                    arena={arena}
                    selected={arena.id === activeArenaId}
                    onOpenDetails={setSelectedArenaId}
                    hasFreeSlot={
                      arena.bookingMode === 'slot_calendar'
                        ? arenaHasFreeSlots(arena.id)
                        : undefined
                    }
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>

          <div
            className="arenas-page__detail-col"
            data-testid={testId('arenas', 'page', 'detail-col')}
          >
            {activeArena ? (
              <ArenaDetailPanel
                arena={activeArena}
                slots={slots}
                hasFreeSlot={arenaHasFreeSlots(activeArena.id)}
              />
            ) : (
              <div data-testid={testId('arenas', 'page', 'empty', 'detail')}>
                <EmptyNetState copy="Выберите площадку на карте или в списке." />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
