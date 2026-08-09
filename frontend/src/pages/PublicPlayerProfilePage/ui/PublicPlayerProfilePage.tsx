/**
 * SPEC-FR-24.1.2, SPEC-FR-24.1.3, SPEC-FR-2.3.3, SPEC-FR-17.1.2
 * HOCFRONT-22 — публичная страница игрока `/players/:userId`
 * HOCFRONT-23 — verified badge на странице игрока
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link, useParams} from 'react-router'

import {fetchPublicPlayer} from '@/entities/profile'
import {useSessionAccess} from '@/features/access'
import {CalendarShell} from '@/features/calendar'
import {ProfileFavoritesSection} from '@/features/favorites'
import {PlayerPublicInfoSection, PlayerTeamsSection} from '@/features/players'
import {isNotFoundError} from '@/shared/api/client'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {PlayerCard} from '@/widgets/PlayerCard'

/**
 * @spec SPEC-FR-24.1.3 - Публичный просмотр Hockey ID с учётом приватности
 * @spec HOCFRONT-22 - Публичная инфа, команда, избранное, календарь внутри страницы
 * @spec HOCFRONT-23 - Verified badge на странице игрока
 */
export function PublicPlayerProfilePage() {
  const {userId = ''} = useParams()
  const {session, isLoading: isSessionLoading} = useSessionAccess()
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ['player-public', userId],
    queryFn: () => fetchPublicPlayer(userId),
    enabled: Boolean(userId),
  })

  const isOwnProfile = Boolean(session?.user.id && session.user.id === userId)

  if (isLoading || isSessionLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка профиля"
        testIdPrefix="players"
        data-testid={testId('players', 'public-player-profile', 'loader')}
      />
    )
  }
  // Сбой загрузки — это не «профиль скрыт»: даём повторить, а не уводим в каталог
  if (error && !isNotFoundError(error)) {
    return (
      <QueryErrorState
        title="Не удалось загрузить профиль игрока"
        onRetry={() => refetch()}
        testIdPrefix="players"
        data-testid={testId('players', 'public-player-profile', 'error')}
      />
    )
  }

  if (error || !data) {
    return (
      <IceCard
        padding="m"
        data-testid={testId('players', 'public-player-profile', 'card', 'not-found')}
      >
        <Text data-testid={testId('players', 'public-player-profile', 'text', 'not-found')}>
          Игрок не найден или профиль скрыт.
        </Text>
        <Link
          to={routes.players}
          data-testid={testId('players', 'public-player-profile', 'link', 'back')}
        >
          <HockeyButton
            view="outlined"
            className="hockey-mt-12"
            data-testid={testId('players', 'public-player-profile', 'btn', 'back')}
          >
            К каталогу
          </HockeyButton>
        </Link>
      </IceCard>
    )
  }

  if (data.visibility === 'hidden') {
    return (
      <IceCard
        padding="m"
        data-testid={testId('players', 'public-player-profile', 'card', 'hidden')}
      >
        <Text
          variant="header-1"
          data-testid={testId('players', 'public-player-profile', 'text', 'hidden-title')}
        >
          Профиль скрыт
        </Text>
        <Text
          color="secondary"
          data-testid={testId('players', 'public-player-profile', 'text', 'hidden-copy')}
        >
          Игрок ограничил видимость Hockey ID.
        </Text>
        <Link
          to={routes.players}
          data-testid={testId('players', 'public-player-profile', 'link', 'back-hidden')}
        >
          <HockeyButton
            view="outlined"
            className="hockey-mt-12"
            data-testid={testId('players', 'public-player-profile', 'btn', 'back-hidden')}
          >
            К каталогу
          </HockeyButton>
        </Link>
      </IceCard>
    )
  }

  const {player} = data

  return (
    <div
      className="hockey-stack hockey-stack--gap-16 public-player-profile"
      data-testid={testId('players', 'public-player-profile', 'page', player.userId)}
    >
      <div className="public-player-profile__header">
        <Link
          to={routes.players}
          data-testid={testId('players', 'public-player-profile', 'link', 'catalog')}
        >
          <HockeyButton
            view="outlined"
            size="s"
            data-testid={testId('players', 'public-player-profile', 'btn', 'catalog')}
          >
            ← Каталог игроков
          </HockeyButton>
        </Link>
        <Text
          variant="header-1"
          data-testid={testId('players', 'public-player-profile', 'text', 'title')}
        >
          Страница игрока
        </Text>
      </div>

      <div
        className="public-player-profile__grid"
        data-testid={testId('players', 'public-player-profile', 'panel', 'grid')}
      >
        <PlayerCard player={player} linkable={false} />
        <PlayerPublicInfoSection
          player={player}
          contactsVisible={data.contactsVisible}
          participationHistoryVisible={data.participationHistoryVisible}
          participationHistory={data.participationHistory}
        />
      </div>

      <section data-testid={testId('players', 'public-player-profile', 'section', 'team')}>
        <PlayerTeamsSection playerId={player.userId} fallbackTeamName={player.teamName} />
      </section>

      <section
        id="favorites"
        data-testid={testId('players', 'public-player-profile', 'section', 'favorites')}
      >
        {isOwnProfile ? (
          <ProfileFavoritesSection />
        ) : (
          <IceCard
            padding="m"
            data-testid={testId('players', 'public-player-profile', 'card', 'favorites-private')}
          >
            <Text
              variant="subheader-2"
              data-testid={testId(
                'players',
                'public-player-profile',
                'text',
                'favorites-private-title',
              )}
            >
              Избранное
            </Text>
            <Text
              color="secondary"
              className="hockey-mt-8"
              data-testid={testId(
                'players',
                'public-player-profile',
                'text',
                'favorites-private-copy',
              )}
            >
              Список избранного виден только владельцу страницы. Добавить игрока в своё избранное
              можно кнопкой на карточке.
            </Text>
          </IceCard>
        )}
      </section>

      <section
        id="calendar"
        data-testid={testId('players', 'public-player-profile', 'section', 'calendar')}
      >
        <IceCard
          padding="m"
          data-testid={testId('players', 'public-player-profile', 'card', 'calendar')}
        >
          {data.calendarVisible ? (
            <CalendarShell
              title="Календарь игрока"
              compact
              forcedScope={{scope: 'player', scopeId: userId}}
              showActions={false}
            />
          ) : (
            <div data-testid={testId('players', 'public-player-profile', 'empty', 'calendar')}>
              <EmptyNetState
                title="Календарь недоступен"
                copy="Игрок скрыл календарь в настройках приватности."
              />
            </div>
          )}
        </IceCard>
      </section>
    </div>
  )
}
