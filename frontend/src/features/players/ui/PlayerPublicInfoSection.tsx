/**
 * HOCFRONT-22 — секция публичной информации игрока (без района и метро).
 */

import {Text} from '@gravity-ui/uikit'

import type {PlayerListItem, PublicPlayerView} from '@/entities/profile'
import {POSITION_LABELS, SKILL_LEVEL_LABELS} from '@/features/events'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'

export interface PlayerPublicInfoSectionProps {
  player: PlayerListItem
  contactsVisible: boolean
  participationHistoryVisible: boolean
  participationHistory?: PublicPlayerView['participationHistory']
}

/**
 * @spec HOCFRONT-22 — публичная информация: город, амплуа, био, история
 * Район и метро намеренно не показываются.
 */
export function PlayerPublicInfoSection({
  player,
  contactsVisible,
  participationHistoryVisible,
  participationHistory,
}: PlayerPublicInfoSectionProps) {
  const history = participationHistory ?? []

  return (
    <IceCard padding="m" data-testid={testId('players', 'public-info', 'card', player.userId)}>
      <div className="hockey-stack hockey-stack--gap-12">
        <Text
          variant="subheader-2"
          data-testid={testId('players', 'public-info', 'text', 'title', player.userId)}
        >
          Публичная информация
        </Text>

        <Text data-testid={testId('players', 'public-info', 'text', 'role', player.userId)}>
          {POSITION_LABELS[player.position] ?? player.position}
          {' · '}
          {SKILL_LEVEL_LABELS[player.skillLevel] ?? player.skillLevel}
        </Text>

        <Text
          color="secondary"
          data-testid={testId('players', 'public-info', 'text', 'city', player.userId)}
        >
          {player.city}
        </Text>

        {player.bio ? (
          <Text data-testid={testId('players', 'public-info', 'text', 'bio', player.userId)}>
            {player.bio}
          </Text>
        ) : (
          <Text
            color="secondary"
            data-testid={testId('players', 'public-info', 'text', 'bio-empty', player.userId)}
          >
            Описание не заполнено.
          </Text>
        )}

        {contactsVisible ? (
          <Text
            color="secondary"
            data-testid={testId(
              'players',
              'public-info',
              'text',
              'contacts-visible',
              player.userId,
            )}
          >
            Контакты доступны по согласию игрока (mock).
          </Text>
        ) : (
          <Text
            color="secondary"
            data-testid={testId('players', 'public-info', 'text', 'contacts-hidden', player.userId)}
          >
            Контакты скрыты настройками приватности.
          </Text>
        )}

        {participationHistoryVisible && history.length > 0 && (
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('players', 'public-info', 'panel', 'history', player.userId)}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('players', 'public-info', 'text', 'history-title', player.userId)}
            >
              История участия
            </Text>
            <ul
              className="profile-hub__history"
              data-testid={testId('players', 'public-info', 'list', 'history', player.userId)}
            >
              {history.map((record) => (
                <li
                  key={record.eventId}
                  className="profile-hub__history-item"
                  data-testid={testId('players', 'public-info', 'item', 'history', record.eventId)}
                >
                  <div>
                    <Text
                      variant="subheader-2"
                      data-testid={testId(
                        'players',
                        'public-info',
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
                        'public-info',
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
  )
}
