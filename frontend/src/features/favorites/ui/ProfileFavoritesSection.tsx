/**
 * HOCFRONT-19 / TASK-02-06 — общий список избранного в профиле (группировка по типу)
 */

import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import {
  type Favorite,
  FAVORITE_TYPE_LABELS,
  FAVORITE_TYPE_ORDER,
  type FavoriteType,
} from '@/entities/favorites'
import {useFavoritesQuery} from '@/features/favorites/model/useFavorites'
import {FavoriteButton} from '@/features/favorites/ui/FavoriteButton'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

function groupByType(items: Favorite[]): Array<{type: FavoriteType; items: Favorite[]}> {
  return FAVORITE_TYPE_ORDER.map((type) => ({
    type,
    items: items.filter((item) => item.type === type),
  })).filter((group) => group.items.length > 0)
}

export interface ProfileFavoritesSectionProps {
  /** Без внешней карточки и заголовка — для диалога «Все» в борте */
  embedded?: boolean
}

export function ProfileFavoritesSection({embedded = false}: ProfileFavoritesSectionProps) {
  const {data: items = [], isLoading, isError} = useFavoritesQuery()
  const groups = groupByType(items)

  const body = (
    <div className="hockey-stack hockey-stack--gap-16">
      {isLoading && (
        <div data-testid={testId('favorites', 'profile-section', 'loader')}>
          <ScoreboardLoader label="Загрузка избранного" />
        </div>
      )}

      {isError && (
        <Text color="danger" data-testid={testId('favorites', 'profile-section', 'error')}>
          Не удалось загрузить избранное
        </Text>
      )}

      {!isLoading && !isError && groups.length === 0 && (
        <Text color="secondary" data-testid={testId('favorites', 'profile-section', 'empty')}>
          Пока пусто — добавьте игроков, команды, лиги, тренировки, арены или товары через ♥ на
          карточках.
        </Text>
      )}

      {groups.map((group) => (
        <section
          key={group.type}
          className="favorites-profile-group"
          data-testid={testId('favorites', 'profile-section', 'group', group.type)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('favorites', 'profile-section', 'text', `group-${group.type}`)}
          >
            {FAVORITE_TYPE_LABELS[group.type]}
          </Text>
          <ul className="favorites-profile-group__list">
            {group.items.map((item) => (
              <li key={item.id} className="favorites-profile-group__row">
                <Link
                  to={item.href}
                  className="favorites-profile-group__link"
                  data-testid={testId('favorites', 'profile-section', 'link', item.id)}
                >
                  {item.title}
                </Link>
                <FavoriteButton
                  type={item.type}
                  entityId={item.entityId}
                  title={item.title}
                  href={item.href}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )

  if (embedded) {
    return <div data-testid={testId('favorites', 'profile-section', 'embedded')}>{body}</div>
  }

  return (
    <IceCard padding="m" data-testid={testId('favorites', 'profile-section', 'page')}>
      <div className="hockey-stack hockey-stack--gap-16">
        <Text
          variant="header-1"
          data-testid={testId('favorites', 'profile-section', 'text', 'title')}
        >
          Избранное
        </Text>
        {body}
      </div>
    </IceCard>
  )
}
