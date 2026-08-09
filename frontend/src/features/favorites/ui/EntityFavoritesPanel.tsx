/**
 * HOCFRONT-19 / TASK-02-06 — избранное в SideBoard (быстрый доступ)
 * Контекст страницы: на /arenas — только арены, на /teams — только команды и т.д.
 */

import {Text} from '@gravity-ui/uikit'
import {Link, useLocation} from 'react-router'

import {FAVORITE_TYPE_LABELS} from '@/entities/favorites'
import {useSessionAccess} from '@/features/access'
import {resolveFavoritesPageContext} from '@/features/favorites/lib/favoritesPageContext'
import {useFavoritesQuery} from '@/features/favorites/model/useFavorites'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const PREVIEW_LIMIT = 6

export function EntityFavoritesPanel() {
  const {pathname} = useLocation()
  const {userId} = useSessionAccess()
  const context = resolveFavoritesPageContext(pathname)
  const {data: items = [], isLoading, isError} = useFavoritesQuery()

  const scoped = context.type ? items.filter((item) => item.type === context.type) : items
  const preview = scoped.slice(0, PREVIEW_LIMIT)
  const totalScoped = scoped.length
  const hasOtherFavorites = Boolean(context.type) && items.length > 0 && totalScoped === 0
  const favoritesHref = `${routes.players}/${userId}#favorites`

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
        <Link to={favoritesHref} data-testid={testId('favorites', 'entity-panel', 'link', 'all')}>
          <HockeyButton
            view="flat"
            size="xs"
            data-testid={testId('favorites', 'entity-panel', 'btn', 'all')}
          >
            Все
          </HockeyButton>
        </Link>
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
            ? `На этом экране пока пусто. Избранное других разделов — в «Все».`
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
    </IceCard>
  )
}
