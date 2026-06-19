/**
 * SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import {Link} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {partnerCabinetLabel, partnerCabinetPath} from '@/features/partners/constants'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const CABINET_FEATURES: Record<string, string[]> = {
  league: ['Профиль лиги', 'Заявки команд', 'Расписание и таблица', 'Публикации', 'Аналитика'],
  shop: ['Профиль магазина', 'Товары', 'Импорт каталога', 'Промо', 'Аналитика и лиды'],
}

/** @spec SPEC-FR-24.5.3 - Хаб партнёрских кабинетов */
export function PartnerHubPage() {
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const memberships = session?.user.partnerMemberships ?? []

  if (memberships.length === 0) {
    return (
      <IceCard padding="m">
        <div className="partner-hub hockey-stack hockey-stack--gap-12">
          <Text variant="header-1">Партнёрские кабинеты</Text>
          <Text color="secondary">
            Кабинеты лиги и магазина доступны после mock-входа с ролью представителя партнёра.
          </Text>
          <Link to="/">
            <HockeyButton view="action">Перейти к входу</HockeyButton>
          </Link>
        </div>
      </IceCard>
    )
  }

  return (
    <div className="partner-hub hockey-stack hockey-stack--gap-16">
      <Text variant="header-1">Партнёрские кабинеты</Text>
      <Text color="secondary">
        Управление профилем, контентом и операционкой внутри HockeyNights — без перехода только на внешний сайт.
      </Text>

      <div className="hockey-grid hockey-grid--cards-300">
        {memberships.map((membership) => (
          <IceCard key={`${membership.kind}-${membership.entityId}`} padding="m">
            <div className="partner-hub__card hockey-stack hockey-stack--gap-12">
              <div>
                <Text variant="subheader-2">{partnerCabinetLabel(membership)}</Text>
                <Text color="secondary">{membership.entityName}</Text>
              </div>
              <ul className="partner-hub__features">
                {CABINET_FEATURES[membership.kind].map((feature) => (
                  <li key={feature}>
                    <Text color="secondary">{feature}</Text>
                  </li>
                ))}
              </ul>
              <Link to={partnerCabinetPath(membership)}>
                <HockeyButton view="action" size="s">
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
