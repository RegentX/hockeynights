/**
 * SPEC-FR-24.3.1, SPEC-FR-24.3.3, SPEC-FR-24.3.4
 */

import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import {routeToTestSlug, testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

/**
 * @spec SPEC-FR-24.3.1 - Рабочее место тренера в личном кабинете
 */
export function CoachProfilePanel() {
  return (
    <IceCard padding="m" data-testid={testId('profile', 'coach-profile-panel', 'card')}>
      <div className="coach-profile hockey-stack hockey-stack--gap-12">
        <div className="coach-profile__header">
          <Text
            variant="subheader-2"
            data-testid={testId('profile', 'coach-profile-panel', 'text', 'title')}
          >
            Профиль тренера
          </Text>
          <span
            className="coach-profile__badge"
            data-testid={testId('profile', 'coach-profile-panel', 'badge', 'version')}
          >
            ТЗ 3.3
          </span>
        </div>

        <Text
          color="secondary"
          data-testid={testId('profile', 'coach-profile-panel', 'text', 'description')}
        >
          Раскладки на тренировках, разбор моментов и объявления в командных каналах.
        </Text>

        <div className="coach-profile__actions">
          <Link
            to="/teams"
            data-testid={testId(
              'profile',
              'coach-profile-panel',
              'link',
              routeToTestSlug('/teams'),
            )}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('profile', 'coach-profile-panel', 'btn', 'teams')}
            >
              Команды и раскладки
            </HockeyButton>
          </Link>
          <Link
            to="/messenger"
            data-testid={testId(
              'profile',
              'coach-profile-panel',
              'link',
              routeToTestSlug('/messenger'),
            )}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('profile', 'coach-profile-panel', 'btn', 'messenger')}
            >
              Командные каналы
            </HockeyButton>
          </Link>
        </div>
      </div>
    </IceCard>
  )
}
