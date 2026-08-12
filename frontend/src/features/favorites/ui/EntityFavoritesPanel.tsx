/**
 * HOCFRONT-19 / TASK-02-06 — избранное в SideBoard (быстрый доступ)
 * Контекст страницы: на /arenas — только арены, на /teams — только команды и т.д.
 * «Все» открывает полный список в диалоге — без ухода со страницы.
 */

import {Dialog, Text} from '@gravity-ui/uikit'
import {useState} from 'react'
import {Link, useLocation} from 'react-router'

import {FAVORITE_TYPE_LABELS} from '@/entities/favorites'
import {resolveFavoritesPageContext} from '@/features/favorites/lib/favoritesPageContext'
import {useFavoritesQuery} from '@/features/favorites/model/useFavorites'
import {ProfileFavoritesSection} from '@/features/favorites/ui/ProfileFavoritesSection'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const PREVIEW_LIMIT = 6

export function EntityFavoritesPanel() {
  const {pathname} = useLocation()
  // Remount on route change so the «Все» dialog resets without setState-in-effect.
  return <EntityFavoritesPanelInner key={pathname} pathname={pathname} />
}

function EntityFavoritesPanelInner({pathname}: {pathname: string}) {
  const context = resolveFavoritesPageContext(pathname)
  const {data: items = [], isLoading, isError} = useFavoritesQuery()
  const [allOpen, setAllOpen] = useState(false)

  const scoped = context.type ? items.filter((item) => item.type === context.type) : items
  const preview = scoped.slice(0, PREVIEW_LIMIT)
  const totalScoped = scoped.length
  const hasOtherFavorites = Boolean(context.type) && items.length > 0 && totalScoped === 0

  return (
    <IceCard padding="s" data-testid={testId('favorites', 'entity-panel')}>
      <div className="favorites-rail__head">
        <div className="favorites-rail__titles">
          <div
            className="favorites-rail__title"
            data-testid={testId('favorites', 'entity-panel', 'text', 'title')}
          >
            Избранное
          </div>
          {context.type && (
            <span
              className="favorites-rail__context"
              data-testid={testId('favorites', 'entity-panel', 'text', 'context')}
            >
              {context.label}
            </span>
          )}
        </div>
        <HockeyButton
          view="flat"
          size="xs"
          onClick={() => setAllOpen(true)}
          data-testid={testId('favorites', 'entity-panel', 'btn', 'all')}
        >
          Все
        </HockeyButton>
      </div>

      {isLoading && (
        <div className="hockey-mt-8" data-testid={testId('favorites', 'entity-panel', 'loader')}>
          <ScoreboardLoader label="Избранное" />
        </div>
      )}

      {isError && (
        <Text
          color="danger"
          className="hockey-mt-8"
          data-testid={testId('favorites', 'entity-panel', 'error')}
        >
          Не удалось загрузить избранное
        </Text>
      )}

      {!isLoading && !isError && preview.length === 0 && (
        <Text
          color="secondary"
          className="favorites-rail__empty"
          data-testid={testId('favorites', 'entity-panel', 'empty')}
        >
          {hasOtherFavorites
            ? `На этом экране пока пусто. Полный список — в «Все».`
            : `Нажмите ♥ на карточках, чтобы добавить сюда`}
        </Text>
      )}

      {!isLoading && preview.length > 0 && (
        <ul
          className="favorites-rail__list"
          data-testid={testId('favorites', 'entity-panel', 'list')}
        >
          {preview.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className="favorites-rail__item"
                data-testid={testId('favorites', 'entity-panel', 'link', item.id)}
              >
                {!context.type && (
                  <span className="favorites-rail__type">{FAVORITE_TYPE_LABELS[item.type]}</span>
                )}
                <span
                  className="favorites-rail__name"
                  data-testid={testId('favorites', 'entity-panel', 'text', item.id)}
                >
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && totalScoped > PREVIEW_LIMIT && (
        <Text
          color="secondary"
          className="favorites-rail__more"
          data-testid={testId('favorites', 'entity-panel', 'text', 'more')}
        >
          Ещё {totalScoped - PREVIEW_LIMIT} в полном списке
        </Text>
      )}

      <Dialog
        open={allOpen}
        onClose={() => setAllOpen(false)}
        size="m"
        className="favorites-all-dialog"
        data-testid={testId('favorites', 'entity-panel', 'dialog', 'all')}
      >
        <Dialog.Header
          caption="Избранное"
          data-testid={testId('favorites', 'entity-panel', 'text', 'all-title')}
        />
        <Dialog.Body data-testid={testId('favorites', 'entity-panel', 'panel', 'all-body')}>
          <ProfileFavoritesSection embedded />
        </Dialog.Body>
        <Dialog.Footer data-testid={testId('favorites', 'entity-panel', 'footer', 'all')}>
          <HockeyButton
            view="outlined"
            onClick={() => setAllOpen(false)}
            data-testid={testId('favorites', 'entity-panel', 'btn', 'all-close')}
          >
            Закрыть
          </HockeyButton>
        </Dialog.Footer>
      </Dialog>
    </IceCard>
  )
}
