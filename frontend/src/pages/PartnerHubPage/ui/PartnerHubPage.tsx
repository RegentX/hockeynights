/**
 * SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router'

import {fetchSession} from '@/entities/auth'
import {partnerCabinetLabel, partnerCabinetPath} from '@/shared/const/partnerRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'

const CABINET_FEATURES: Record<string, string[]> = {
  league: ['Профиль лиги', 'Заявки команд', 'Расписание и таблица', 'Публикации', 'Аналитика'],
  shop: ['Профиль магазина', 'Товары', 'Импорт каталога', 'Промо', 'Аналитика и лиды'],
  club: ['Профиль клуба', 'Состав', 'Штаб', 'Календарь', 'Приватные тренировки'],
  arena: ['Заявки на лёд', 'Объявления льда', 'Профиль арены', 'Чат с организаторами'],
}

/** @spec SPEC-FR-24.5.3 - Хаб партнёрских кабинетов */
export function PartnerHubPage() {
  const {data: session, isError, refetch} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const memberships = session?.user.partnerMemberships ?? []

  // Без этой ветки сбой запроса выглядел бы как «у вас нет кабинетов»
  if (isError) {
    return (
      <QueryErrorState
        title="Не удалось загрузить партнёрские кабинеты"
        onRetry={() => refetch()}
        testIdPrefix="partners"
        data-testid={testId('partners', 'hub', 'error')}
      />
    )
  }

  if (memberships.length === 0) {
    return (
      <IceCard padding="m">
        <div
          className="partner-hub hockey-stack hockey-stack--gap-12"
          data-testid={testId('partners', 'hub', 'page', 'empty')}
        >
          <Text variant="header-1" data-testid={testId('partners', 'hub', 'text', 'title')}>
            Партнёрские кабинеты
          </Text>
          <Text color="secondary" data-testid={testId('partners', 'hub', 'text', 'empty-hint')}>
            Кабинеты лиги, магазина, клуба и ледовой арены доступны после mock-входа с ролью
            представителя партнёра.
          </Text>
          <Link to="/" data-testid={testId('partners', 'hub', 'link', 'login')}>
            <HockeyButton view="action" data-testid={testId('partners', 'hub', 'btn', 'login')}>
              Перейти к входу
            </HockeyButton>
          </Link>
        </div>
      </IceCard>
    )
  }

  return (
    <div
      className="partner-hub hockey-stack hockey-stack--gap-16"
      data-testid={testId('partners', 'hub', 'page')}
    >
      <Text variant="header-1" data-testid={testId('partners', 'hub', 'text', 'title')}>
        Партнёрские кабинеты
      </Text>
      <Text color="secondary" data-testid={testId('partners', 'hub', 'text', 'subtitle')}>
        Управление профилем, контентом и операционкой внутри HockeyNights — без перехода только на
        внешний сайт.
      </Text>

      <div
        className="hockey-grid hockey-grid--cards-300"
        data-testid={testId('partners', 'hub', 'list')}
      >
        {memberships.map((membership) => (
          <IceCard key={`${membership.kind}-${membership.entityId}`} padding="m">
            <div
              className="partner-hub__card hockey-stack hockey-stack--gap-12"
              data-testid={testId('partners', 'hub', 'card', membership.kind, membership.entityId)}
            >
              <div>
                <Text
                  variant="subheader-2"
                  data-testid={testId(
                    'partners',
                    'hub',
                    'text',
                    'cabinet-label',
                    membership.kind,
                    membership.entityId,
                  )}
                >
                  {partnerCabinetLabel(membership)}
                </Text>
                <Text
                  color="secondary"
                  data-testid={testId(
                    'partners',
                    'hub',
                    'text',
                    'entity-name',
                    membership.kind,
                    membership.entityId,
                  )}
                >
                  {membership.entityName}
                </Text>
              </div>
              <ul
                className="partner-hub__features"
                data-testid={testId(
                  'partners',
                  'hub',
                  'list',
                  'features',
                  membership.kind,
                  membership.entityId,
                )}
              >
                {CABINET_FEATURES[membership.kind].map((feature) => (
                  <li
                    key={feature}
                    data-testid={testId(
                      'partners',
                      'hub',
                      'item',
                      'feature',
                      membership.kind,
                      membership.entityId,
                      feature,
                    )}
                  >
                    <Text color="secondary">{feature}</Text>
                  </li>
                ))}
              </ul>
              <Link
                to={partnerCabinetPath(membership)}
                data-testid={testId(
                  'partners',
                  'hub',
                  'link',
                  'cabinet',
                  membership.kind,
                  membership.entityId,
                )}
              >
                <HockeyButton
                  view="action"
                  size="s"
                  data-testid={testId(
                    'partners',
                    'hub',
                    'btn',
                    'open-cabinet',
                    membership.kind,
                    membership.entityId,
                  )}
                >
                  Открыть кабинет
                </HockeyButton>
              </Link>
            </div>
          </IceCard>
        ))}
      </div>
    </div>
  )
}
