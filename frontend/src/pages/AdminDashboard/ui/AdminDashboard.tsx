/**
 * SPEC-FR-11.1.1, SPEC-FR-11.1.2, SPEC-FR-11.2.1, SPEC-FR-11.2.2
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {fetchSourceStatuses} from '@/entities/admin'
import {AdminEntityForm, PartnerModerationPanel, SourceStatusTable} from '@/features/admin'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'

/**
 * @spec SPEC-FR-11.1.1 - Admin prototype
 * @spec SPEC-FR-11.2.1 - Статусы источников
 */
export function AdminDashboard() {
  const {data: sources = [], isLoading} = useQuery({
    queryKey: ['admin-sources'],
    queryFn: fetchSourceStatuses,
  })

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('admin', 'dashboard', 'page')}
    >
      <Text variant="header-1" data-testid={testId('admin', 'dashboard', 'text', 'title')}>
        Админка справочников
      </Text>
      <Text color="secondary" data-testid={testId('admin', 'dashboard', 'text', 'subtitle')}>
        Prototype для ручного управления аренами, лигами и магазинами.
      </Text>

      <AdminEntityForm />

      <IceCard padding="m">
        <div data-testid={testId('admin', 'dashboard', 'panel', 'moderation')}>
          <Text
            variant="subheader-2"
            data-testid={testId('admin', 'dashboard', 'text', 'moderation-title')}
          >
            Модерация партнёров
          </Text>
          <Text
            color="secondary"
            className="hockey-mb-12"
            data-testid={testId('admin', 'dashboard', 'text', 'moderation-hint')}
          >
            Профили лиг/магазинов и товары со статусом «на проверке». Войдите с ролью
            «Администратор».
          </Text>
          <PartnerModerationPanel />
        </div>
      </IceCard>

      <Text
        variant="subheader-2"
        data-testid={testId('admin', 'dashboard', 'text', 'sources-title')}
      >
        Статусы источников и видимость
      </Text>
      {isLoading && <Text data-testid={testId('admin', 'dashboard', 'loader')}>Загрузка...</Text>}
      <SourceStatusTable items={sources} />
    </div>
  )
}
