/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.3.1
 * SPEC-UI-2.2, SPEC-UI-3.1
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useRef, useState} from 'react'

import type {ArenaFilters as ArenaFiltersType} from '@/entities/arena'
import {fetchArenas, fetchArenaSlots} from '@/entities/arena'
import {ArenaDetailPanel} from '@/features/arenas/ui/ArenaDetailPanel'
import {ArenaFilters} from '@/features/arenas/ui/ArenaFilters'
import {ArenaMap} from '@/features/arenas/ui/ArenaMap'
import {RinkCard} from '@/features/arenas/ui/RinkCard'
import {arenaHasFreeSlots} from '@/mocks/data/arenas'
import {ARENAS_PAGE_TITLE} from '@/shared/config/navigationLabels'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {ScrollReveal} from '@/shared/ui/ScrollStory'

const EMPTY_FILTERS: ArenaFiltersType = {}

function hasActiveFilters(filters: ArenaFiltersType): boolean {
  return Object.values(filters).some((v) => v !== undefined && v !== '' && v !== false)
}

/**
 * @spec SPEC-FR-6.1.1 - Страница списка и карты арен
 * @spec SPEC-FR-6.1.2 - Единый источник выбора арены, синхронизация списка и карты
 * @spec SPEC-FR-6.2.1 - Детальная панель по выбранной арене
 * @spec SPEC-FR-6.2.2 - Полноценный поиск: текст, район, метро, удобства
 */
export function ArenasPage() {
  useDocumentTitle(ARENAS_PAGE_TITLE)
  const [filters, setFilters] = useState<ArenaFiltersType>(EMPTY_FILTERS)
  const [selectedArenaId, setSelectedArenaId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(true)
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const scrollOnNextArenaRef = useRef(false)

  const {
    data: arenas = [],
    isPending,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['arenas', filters],
    queryFn: () => fetchArenas(filters),
    placeholderData: (previous) => previous,
  })

  const activeArena = useMemo(() => {
    if (selectedArenaId) {
      const match = arenas.find((a) => a.id === selectedArenaId)
      if (match) return match
    }
    return arenas[0] ?? null
  }, [arenas, selectedArenaId])

  useEffect(() => {
    if (!activeArena) return
    if (!scrollOnNextArenaRef.current) return
    scrollOnNextArenaRef.current = false
    const node = cardRefs.current.get(activeArena.id)
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({behavior: 'smooth', block: 'nearest'})
    }
  }, [activeArena])

  const {data: slots = []} = useQuery({
    queryKey: ['arena-slots', activeArena?.id],
    queryFn: () => fetchArenaSlots(activeArena!.id),
    enabled: Boolean(activeArena),
  })

  const freeSlotArenaIds = useMemo(
    () => new Set(arenas.filter((a) => arenaHasFreeSlots(a.id)).map((a) => a.id)),
    [arenas],
  )

  const handleSelectArena = (id: string) => {
    setSelectedArenaId(id)
    setDetailOpen(true)
  }

  const handleSelectFromMap = (id: string) => {
    scrollOnNextArenaRef.current = true
    handleSelectArena(id)
  }

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS)
  }

  const handleCloseDetail = () => {
    setDetailOpen(false)
  }

  const isFiltered = hasActiveFilters(filters)
  const showLayout = !isPending && !isError
  const showEmpty = showLayout && arenas.length === 0
  const showProgress = isFetching && !isPending

  return (
    <div className="arenas-page" data-testid={testId('arenas', 'page')}>
      <div
        className={`arenas-page__progress${showProgress ? ' arenas-page__progress--active' : ''}`}
        aria-hidden
        data-testid={testId('arenas', 'page', 'progress')}
      />
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

      <ArenaFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {isPending && (
        <div data-testid={testId('arenas', 'page', 'loader')}>
          <ScoreboardLoader label="Загрузка арен" />
          <div className="arenas-page__skeleton">
            <IceSkeleton height={380} />
            <IceSkeleton count={2} height={200} />
          </div>
        </div>
      )}

      {isError && !isPending && (
        <div data-testid={testId('arenas', 'page', 'error')}>
          <EmptyNetState
            title="Не удалось загрузить катки"
            copy="Проверь соединение и попробуй ещё раз."
            action={
              <HockeyButton view="outlined" size="s" onClick={() => refetch()}>
                Повторить
              </HockeyButton>
            }
          />
        </div>
      )}

      {showEmpty && (
        <div data-testid={testId('arenas', 'page', 'empty')}>
          <EmptyNetState
            title="Пустая сетка"
            copy="По выбранным фильтрам катки не найдены."
            action={
              isFiltered ? (
                <HockeyButton
                  view="outlined"
                  size="s"
                  onClick={handleResetFilters}
                  data-testid={testId('arenas', 'page', 'btn', 'reset')}
                >
                  Сбросить фильтры
                </HockeyButton>
              ) : undefined
            }
          />
        </div>
      )}

      {showLayout && arenas.length > 0 && (
        <div
          className="arenas-page__layout"
          aria-busy={showProgress}
          data-testid={testId('arenas', 'page', 'layout')}
        >
          <div className="arenas-page__map-col" data-testid={testId('arenas', 'page', 'map-col')}>
            <div data-testid={testId('arenas', 'page', 'card', 'map')}>
              <IceCard padding="m">
                <ArenaMap
                  arenas={arenas}
                  selectedArenaId={activeArena?.id ?? null}
                  onSelectArena={handleSelectFromMap}
                  freeSlotArenaIds={freeSlotArenaIds}
                />
              </IceCard>
            </div>

            <div
              className={`arenas-page__list${showProgress ? ' arenas-page__list--refreshing' : ''}`}
              role="list"
              aria-label="Список арен"
              data-testid={testId('arenas', 'page', 'list')}
            >
              {arenas.map((arena, index) => (
                <ScrollReveal key={arena.id} direction={index % 2 === 0 ? 'left' : 'right'}>
                  <RinkCard
                    ref={(node) => {
                      if (node) cardRefs.current.set(arena.id, node)
                      else cardRefs.current.delete(arena.id)
                    }}
                    arena={arena}
                    selected={arena.id === activeArena?.id}
                    onOpenDetails={handleSelectArena}
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
            {activeArena && detailOpen ? (
              <ArenaDetailPanel
                arena={activeArena}
                slots={slots}
                hasFreeSlot={arenaHasFreeSlots(activeArena.id)}
                onClose={handleCloseDetail}
              />
            ) : (
              <div data-testid={testId('arenas', 'page', 'empty', 'detail')}>
                <EmptyNetState
                  action={
                    <HockeyButton
                      view="outlined"
                      size="s"
                      onClick={() => setDetailOpen(true)}
                      data-testid={testId('arenas', 'page', 'btn', 'open-detail')}
                    >
                      Открыть детали
                    </HockeyButton>
                  }
                  copy="Детали скрыты. Открой их снова или выбери другую площадку."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
