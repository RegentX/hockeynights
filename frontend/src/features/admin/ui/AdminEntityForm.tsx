/**
 * SPEC-FR-11.1.1
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {AdminEntityType} from '@/entities/admin'
import {createAdminEntity} from '@/entities/admin'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

const ENTITY_OPTIONS = [
  {value: 'arena', content: 'Арена'},
  {value: 'league', content: 'Лига'},
  {value: 'shop', content: 'Магазин'},
]

/**
 * @spec SPEC-FR-11.1.1 - Форма ручного добавления сущности
 */
export function AdminEntityForm() {
  const queryClient = useQueryClient()
  const [entityType, setEntityType] = useState<AdminEntityType>('arena')
  const [name, setName] = useState('')
  const [city, setCity] = useState('Москва')
  const [websiteUrl, setWebsiteUrl] = useState('')

  const mutation = useMutation({
    mutationFn: createAdminEntity,
    onSuccess: () => {
      setName('')
      setWebsiteUrl('')
      void queryClient.invalidateQueries({queryKey: ['admin-sources']})
      void queryClient.invalidateQueries({queryKey: ['arenas']})
      void queryClient.invalidateQueries({queryKey: ['leagues']})
      void queryClient.invalidateQueries({queryKey: ['shops']})
    },
  })

  function handleSubmit() {
    if (!name.trim()) return
    mutation.mutate({entityType, name, city, websiteUrl: websiteUrl || undefined})
  }

  return (
    <IceCard
      padding="m"
      className="hockey-form-shell hockey-form-shell--480"
      data-testid={testId('admin', 'entity-form', 'form')}
    >
      <div className="hockey-stack hockey-stack--gap-12">
        <Text variant="subheader-2" data-testid={testId('admin', 'entity-form', 'text', 'title')}>
          Добавить запись
        </Text>
        <Select
          label="Тип"
          value={[entityType]}
          onUpdate={(v) => setEntityType(v[0] as AdminEntityType)}
          options={ENTITY_OPTIONS}
          data-testid={testId('admin', 'entity-form', 'select', 'type')}
        />
        <TextInput
          label="Название"
          value={name}
          onUpdate={setName}
          data-testid={testId('admin', 'entity-form', 'field', 'name')}
        />
        <TextInput
          label="Город"
          value={city}
          onUpdate={setCity}
          data-testid={testId('admin', 'entity-form', 'field', 'city')}
        />
        <TextInput
          label="Сайт"
          value={websiteUrl}
          onUpdate={setWebsiteUrl}
          data-testid={testId('admin', 'entity-form', 'field', 'website')}
        />
        <HockeyButton
          loading={mutation.isPending}
          data-testid={testId('admin', 'entity-form', 'btn', 'create')}
          onClick={handleSubmit}
        >
          Создать
        </HockeyButton>
      </div>
    </IceCard>
  )
}
