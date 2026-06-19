/**
 * SPEC-FR-24.3.1, SPEC-FR-24.3.3, SPEC-FR-24.3.4
 */

import {Link} from 'react-router-dom'
import {Text} from '@gravity-ui/uikit'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'

/**
 * @spec SPEC-FR-24.3.1 - Рабочее место тренера в личном кабинете
 */
export function CoachProfilePanel() {
  return (
    <IceCard padding="m">
      <div className="coach-profile hockey-stack hockey-stack--gap-12">
        <div className="coach-profile__header">
          <Text variant="subheader-2">Профиль тренера</Text>
          <span className="coach-profile__badge">ТЗ 3.3</span>
        </div>

        <Text color="secondary">
          Раскладки на тренировках, разбор моментов и объявления в командных каналах.
        </Text>

        <div className="coach-profile__actions">
          <Link to="/teams">
            <HockeyButton view="outlined" size="s">
              Команды и раскладки
            </HockeyButton>
          </Link>
          <Link to="/highlights">
            <HockeyButton view="outlined" size="s">
              Комментарии к моментам
            </HockeyButton>
          </Link>
          <Link to="/messenger">
            <HockeyButton view="outlined" size="s">
              Командные каналы
            </HockeyButton>
          </Link>
        </div>
      </div>
    </IceCard>
  )
}
