/**
 * SPEC-FR-24.1.2, SPEC-FR-24.1.3, SPEC-FR-2.3.3, SPEC-FR-17.1.2
 * HOCFRONT-22 — публичная страница игрока `/players/:userId`
 * HOCFRONT-23 — verified badge на странице игрока
 *
 * Композиция как у `/profile` → «О себе»:
 * паспорт + публичная инфа → календарь → история участия.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link, useLocation, useNavigate, useParams} from 'react-router'

import {fetchPublicPlayer} from '@/entities/profile'
import {CalendarShell} from '@/features/calendar'
import {PlayerPublicInfoSection} from '@/features/players'
import {ParticipationHistorySection} from '@/features/profile'
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
 * @spec HOCFRONT-22 - Та же компоновка, что «О себе» в профиле
 * @spec HOCFRONT-23 - Verified badge на странице игрока
 */
export function PublicPlayerProfilePage() {
  const {userId = ''} = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ['player-public', userId],
    queryFn: () => fetchPublicPlayer(userId),
    enabled: Boolean(userId),
  })

  function handleBack() {
    if (location.key === 'default') {
      navigate(routes.players, {replace: true})
      return
    }
    navigate(-1)
  }

  if (isLoading) {
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
      className="hockey-stack hockey-stack--gap-16 player-profile-layout public-player-profile"
      data-testid={testId('players', 'public-player-profile', 'page', player.userId)}
    >
      <div className="public-player-profile__header">
        <HockeyButton
          view="outlined"
          size="s"
          onClick={handleBack}
          data-testid={testId('players', 'public-player-profile', 'btn', 'back')}
        >
          Вернуться
        </HockeyButton>
      </div>

      <div
        className="player-profile-layout__grid"
        data-testid={testId('players', 'public-player-profile', 'panel', 'grid')}
      >
        <PlayerCard
          player={player}
          linkable={false}
          variant="profile"
          visibleFields={data.visibleFields}
        />
        <PlayerPublicInfoSection
          player={player}
          contactsVisible={data.contactsVisible}
          visibleContacts={data.visibleContacts}
          visibleFields={data.visibleFields}
          participationHistoryVisible={data.participationHistoryVisible}
          hideHistory
        />
      </div>

      <section
        id="calendar"
        className="player-profile-layout__full"
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
              titleVariant="header-1"
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

      <IceCard
        padding="m"
        data-testid={testId('players', 'public-player-profile', 'card', 'history')}
      >
        <div className="hockey-stack hockey-stack--gap-16">
          <Text
            variant="header-1"
            data-testid={testId('players', 'public-player-profile', 'text', 'history-title')}
          >
            История участия
          </Text>
          <ParticipationHistorySection
            records={data.participationHistory}
            showHistory={data.participationHistoryVisible}
          />
        </div>
      </IceCard>
    </div>
  )
}
