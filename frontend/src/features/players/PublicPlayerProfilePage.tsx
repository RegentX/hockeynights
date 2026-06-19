/**
 * SPEC-FR-24.1.2, SPEC-FR-24.1.3, SPEC-FR-2.3.3
 */

import {useParams, Link} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchPublicPlayer} from '@/features/players/api/playersApi'
import {PlayerCard} from '@/features/players/PlayerCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/**
 * @spec SPEC-FR-24.1.3 - Публичный просмотр Hockey ID с учётом приватности
 */
export function PublicPlayerProfilePage() {
  const {userId = ''} = useParams()
  const {data, isLoading, error} = useQuery({
    queryKey: ['player-public', userId],
    queryFn: () => fetchPublicPlayer(userId),
    enabled: Boolean(userId),
  })

  if (isLoading) return <ScoreboardLoader label="Загрузка профиля" />
  if (error || !data) {
    return (
      <IceCard padding="m">
        <Text>Игрок не найден или профиль скрыт.</Text>
        <Link to="/players">
          <HockeyButton view="outlined" className="hockey-mt-12">
            К каталогу
          </HockeyButton>
        </Link>
      </IceCard>
    )
  }

  if (data.visibility === 'hidden') {
    return (
      <IceCard padding="m">
        <Text variant="header-1">Профиль скрыт</Text>
        <Text color="secondary">Игрок ограничил видимость Hockey ID.</Text>
        <Link to="/players">
          <HockeyButton view="outlined" className="hockey-mt-12">
            К каталогу
          </HockeyButton>
        </Link>
      </IceCard>
    )
  }

  const {player} = data

  return (
    <div className="hockey-stack hockey-stack--gap-16 public-player-profile">
      <div className="public-player-profile__header">
        <Link to="/players">
          <HockeyButton view="outlined" size="s">
            ← Каталог игроков
          </HockeyButton>
        </Link>
        <Text variant="header-1">Hockey ID</Text>
      </div>

      <div className="public-player-profile__grid">
        <PlayerCard player={player} linkable={false} />

        <IceCard padding="m">
          <div className="hockey-stack hockey-stack--gap-12">
            <Text variant="subheader-2">О игроке</Text>
            {player.bio ? (
              <Text>{player.bio}</Text>
            ) : (
              <Text color="secondary">Описание не заполнено.</Text>
            )}

            {data.contactsVisible ? (
              <Text color="secondary">
                Контакты доступны по согласию игрока (mock).
              </Text>
            ) : (
              <Text color="secondary">Контакты скрыты настройками приватности.</Text>
            )}

            {data.participationHistoryVisible && data.participationHistory && data.participationHistory.length > 0 && (
              <div className="hockey-stack hockey-stack--gap-8">
                <Text variant="subheader-2">История участия</Text>
                <ul className="profile-hub__history">
                  {data.participationHistory.map((record) => (
                    <li key={record.eventId} className="profile-hub__history-item">
                      <div>
                        <Text variant="subheader-2">{record.eventTitle}</Text>
                        <Text color="secondary">
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
    </div>
  )
}
