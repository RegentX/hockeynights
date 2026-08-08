/**
 * SPEC-FR-6.1.1, SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.3.1
 * SPEC-UI-2.2
 * HOCFRONT-32 — страница арены в общем стиле IceCard
 */

import {Text} from '@gravity-ui/uikit'

import type {Arena, IceSlot} from '@/entities/arena'
import {
  ARENA_CITY_REGION_LABELS,
  formatArenaAmenities,
  resolveArenaCityRegion,
} from '@/entities/arena'
import {ArenaBookingPanel} from '@/features/arenas/ui/ArenaBookingPanel'
import {ArenaListingsPanel} from '@/features/arenas/ui/ArenaListingsPanel'
import {FavoriteButton} from '@/features/favorites'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

const MODE_LABELS = {
  slot_calendar: 'Запись по слотам',
  external_portal: 'Заявка на площадку',
} as const

/** @spec SPEC-FR-6.2.1 */
export interface ArenaDetailPanelProps {
  arena: Arena
  slots: IceSlot[]
  hasFreeSlot?: boolean
}

/**
 * @spec SPEC-FR-6.2.1 - Контент публичной страницы арены
 */
export function ArenaDetailPanel({arena, slots, hasFreeSlot}: ArenaDetailPanelProps) {
  const freeCount = slots.filter((s) => s.status === 'free').length
  const cityRegion = resolveArenaCityRegion(arena.city)
  const cityLabel = ARENA_CITY_REGION_LABELS[cityRegion]

  return (
    <div
      className="arena-detail hockey-stack hockey-stack--gap-16"
      data-testid={testId('arenas', 'detail', 'panel', arena.id)}
    >
      <IceCard padding="m" data-testid={testId('arenas', 'detail', 'panel', 'hero', arena.id)}>
        <div className="hockey-row hockey-row--between hockey-row--align-start hockey-row--wrap">
          <div className="hockey-stack hockey-stack--gap-8">
            <div
              className="hockey-row hockey-row--gap-8 hockey-row--wrap hockey-row--align-center"
              data-testid={testId('arenas', 'detail', 'panel', 'chips', arena.id)}
            >
              <span
                className={`arena-meta-chip arena-meta-chip--${arena.bookingMode === 'slot_calendar' ? 'slots' : 'portal'}`}
                data-testid={testId('arenas', 'detail', 'badge', 'mode', arena.id)}
              >
                {MODE_LABELS[arena.bookingMode]}
              </span>
              {arena.bookingMode === 'slot_calendar' && (
                <span
                  className={`rink-slot-lamp${hasFreeSlot ? '' : ' rink-slot-lamp--busy'}`}
                  data-testid={testId('arenas', 'detail', 'badge', 'slot-lamp', arena.id)}
                >
                  <span className="rink-slot-lamp__dot" aria-hidden />
                  {hasFreeSlot === false
                    ? 'Сейчас занято'
                    : freeCount > 0
                      ? `Свободных слотов: ${freeCount}`
                      : 'Слоты скоро появятся'}
                </span>
              )}
            </div>

            <Text
              variant="header-1"
              className="variable-font-header"
              data-testid={testId('arenas', 'detail', 'text', 'name', arena.id)}
            >
              {arena.name}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('arenas', 'detail', 'text', 'address', arena.id)}
            >
              {arena.address}
            </Text>
            {arena.priceRange && (
              <ScoreboardText
                tone="accent"
                data-testid={testId('arenas', 'detail', 'text', 'price', arena.id)}
              >
                {arena.priceRange}
              </ScoreboardText>
            )}
          </div>

          <div className="hockey-row hockey-row--gap-8 hockey-row--align-center">
            <FavoriteButton type="arena" entityId={arena.id} title={arena.name} size="m" />
            {arena.websiteUrl && (
              <a
                href={arena.websiteUrl}
                target="_blank"
                rel="noreferrer"
                data-testid={testId('arenas', 'detail', 'link', 'website', arena.id)}
              >
                <HockeyButton
                  view="outlined"
                  size="m"
                  data-testid={testId('arenas', 'detail', 'btn', 'website', arena.id)}
                >
                  Сайт арены
                </HockeyButton>
              </a>
            )}
          </div>
        </div>
      </IceCard>

      <div className="arena-detail__grid">
        <IceCard padding="m" data-testid={testId('arenas', 'detail', 'panel', 'meta', arena.id)}>
          <div className="hockey-stack hockey-stack--gap-16">
            <div>
              <Text
                variant="subheader-2"
                data-testid={testId('arenas', 'detail', 'text', 'about-title', arena.id)}
              >
                О площадке
              </Text>
              <div className="arena-detail__facts">
                <div className="arena-detail__fact">
                  <Text color="secondary">Локация</Text>
                  <Text data-testid={testId('arenas', 'detail', 'text', 'city', arena.id)}>
                    {cityLabel}
                    {arena.city !== cityLabel ? ` · ${arena.city}` : ''}
                  </Text>
                </div>
                {arena.metro && (
                  <div className="arena-detail__fact">
                    <Text color="secondary">Метро</Text>
                    <Text data-testid={testId('arenas', 'detail', 'text', 'metro', arena.id)}>
                      м. {arena.metro}
                      {arena.district ? ` · ${arena.district}` : ''}
                    </Text>
                  </div>
                )}
                {arena.phone && (
                  <div className="arena-detail__fact">
                    <Text color="secondary">Телефон</Text>
                    <Text data-testid={testId('arenas', 'detail', 'text', 'phone', arena.id)}>
                      <a href={`tel:${arena.phone.replace(/\s/g, '')}`}>{arena.phone}</a>
                    </Text>
                  </div>
                )}
                {arena.amenities.length > 0 && (
                  <div className="arena-detail__fact">
                    <Text color="secondary">Удобства</Text>
                    <Text data-testid={testId('arenas', 'detail', 'text', 'amenities', arena.id)}>
                      {formatArenaAmenities(arena.amenities)}
                    </Text>
                  </div>
                )}
                {arena.bookingMode === 'slot_calendar' && (
                  <div className="arena-detail__fact">
                    <Text color="secondary">Слоты</Text>
                    <Text data-testid={testId('arenas', 'detail', 'text', 'free-slots', arena.id)}>
                      Свободных: {freeCount}
                      {hasFreeSlot === false ? ' · сейчас всё занято' : ''}
                    </Text>
                  </div>
                )}
              </div>
            </div>

            <ArenaListingsPanel arenaId={arena.id} embedded />
          </div>
        </IceCard>

        <IceCard padding="m" data-testid={testId('arenas', 'detail', 'panel', 'booking', arena.id)}>
          <ArenaBookingPanel arena={arena} slots={slots} />
        </IceCard>
      </div>
    </div>
  )
}
