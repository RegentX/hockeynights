/**
 * SPEC-FR-11.1.1, SPEC-FR-11.1.2, SPEC-FR-11.2.1, SPEC-FR-11.2.2
 */

import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchSourceStatuses} from '@/features/admin/api/adminApi'
import {AdminEntityForm} from '@/features/admin/AdminEntityForm'
import {PartnerModerationPanel} from '@/features/admin/PartnerModerationPanel'
import {SourceStatusTable} from '@/features/admin/SourceStatusTable'
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
    <div className="hockey-stack hockey-stack--gap-16">
      <Text variant="header-1">Админка справочников</Text>
      <Text color="secondary">
        Prototype для ручного управления аренами, лигами и магазинами.
      </Text>

      <AdminEntityForm />

      <IceCard padding="m">
        <Text variant="subheader-2">Модерация партнёров</Text>
        <Text color="secondary" className="hockey-mb-12">
          Профили лиг/магазинов и товары со статусом «на проверке». Войдите с ролью «Администратор».
        </Text>
        <PartnerModerationPanel />
      </IceCard>

      <Text variant="subheader-2">Статусы источников и видимость</Text>
      {isLoading && <Text>Загрузка...</Text>}
      <SourceStatusTable items={sources} />
    </div>
  )
}
