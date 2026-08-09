/**
 * SPEC-FR-24.1.2, SPEC-FR-24.1.3, SPEC-FR-2.3.3
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link, useParams} from 'react-router'

import {fetchPublicPlayer} from '@/entities/profile'
import {CalendarScopePreview} from '@/features/calendar'
import {isNotFoundError} from '@/shared/api/client'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {PlayerCard} from '@/widgets/PlayerCard'

/**
 * @spec SPEC-FR-24.1.3 - Публичный просмотр Hockey ID с учётом приватности
 */
export function PublicPlayerProfilePage() {
  const {userId = ''} = useParams()
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ['player-public', userId],
    queryFn: () => fetchPublicPlayer(userId),
    enabled: Boolean(userId),
  })

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
          to="/players"
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
          to="/players"
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
      data-testid={testId('players', 'public-player-profile', 'page')}
    >
      <div className="public-player-profile__header">
        <Link
          to="/players"
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
          Hockey ID
        </Text>
      </div>

      <div
        className="public-player-profile__grid"
        data-testid={testId('players', 'public-player-profile', 'panel', 'grid')}
      >
        <PlayerCard player={player} linkable={false} />

        <IceCard
          padding="m"
          data-testid={testId('players', 'public-player-profile', 'card', 'about')}
        >
          <div className="hockey-stack hockey-stack--gap-12">
            <Text
              variant="subheader-2"
              data-testid={testId('players', 'public-player-profile', 'text', 'about-title')}
            >
              О игроке
            </Text>
            {player.bio ? (
              <Text data-testid={testId('players', 'public-player-profile', 'text', 'bio')}>
                {player.bio}
              </Text>
            ) : (
              <Text
                color="secondary"
                data-testid={testId('players', 'public-player-profile', 'text', 'bio-empty')}
              >
                Описание не заполнено.
              </Text>
            )}

            {data.contactsVisible ? (
              <Text
                color="secondary"
                data-testid={testId('players', 'public-player-profile', 'text', 'contacts-visible')}
              >
                Контакты доступны по согласию игрока (mock).
              </Text>
            ) : (
              <Text
                color="secondary"
                data-testid={testId('players', 'public-player-profile', 'text', 'contacts-hidden')}
              >
                Контакты скрыты настройками приватности.
              </Text>
            )}

            {data.participationHistoryVisible &&
              data.participationHistory &&
              data.participationHistory.length > 0 && (
                <div
                  className="hockey-stack hockey-stack--gap-8"
                  data-testid={testId('players', 'public-player-profile', 'panel', 'history')}
                >
                  <Text
                    variant="subheader-2"
                    data-testid={testId(
                      'players',
                      'public-player-profile',
                      'text',
                      'history-title',
                    )}
                  >
                    История участия
                  </Text>
                  <ul
                    className="profile-hub__history"
                    data-testid={testId('players', 'public-player-profile', 'list', 'history')}
                  >
                    {data.participationHistory.map((record) => (
                      <li
                        key={record.eventId}
                        className="profile-hub__history-item"
                        data-testid={testId(
                          'players',
                          'public-player-profile',
                          'item',
                          'history',
                          record.eventId,
                        )}
                      >
                        <div>
                          <Text
                            variant="subheader-2"
                            data-testid={testId(
                              'players',
                              'public-player-profile',
                              'text',
                              'history-event',
                              record.eventId,
                            )}
                          >
                            {record.eventTitle}
                          </Text>
                          <Text
                            color="secondary"
                            data-testid={testId(
                              'players',
                              'public-player-profile',
                              'text',
                              'history-date',
                              record.eventId,
                            )}
                          >
                            {new Date(record.eventDate).toLocaleDateString('ru-RU')}
                            {record.teamName ? ` · ${record.teamName}` : ''}
                          </Text>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </IceCard>
      </div>

      <IceCard
        padding="m"
        data-testid={testId('players', 'public-player-profile', 'card', 'calendar')}
      >
        <CalendarScopePreview
          scope="player"
          scopeId={userId}
          title="График игрока"
          hidden={!data.calendarVisible}
          hiddenCopy="Игрок скрыл календарь в настройках приватности."
          testIdPrefix="players"
        />
      </IceCard>
    </div>
  )
}
