/**
 * SPEC-FR-3.1.1
 */

import {Button, Select, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {SkillLevel} from '@/entities/common'
import {createTeam} from '@/entities/team'
import {DEFAULT_CITY} from '@/shared/config/geo'
import {testId} from '@/shared/testing/testId'

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
]

/**
 * @spec SPEC-FR-3.1.1 - Форма создания команды
 */
export function TeamCreateForm() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [city, setCity] = useState(DEFAULT_CITY)
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('amateur')
  const [description, setDescription] = useState('')

  const mutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['teams']})
      setName('')
      setDescription('')
    },
  })

  /** @spec SPEC-FR-3.1.1 - Отправка формы */
  function handleSubmit() {
    if (!name.trim()) return
    mutation.mutate({name: name.trim(), city, skillLevel, description: description || undefined})
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId('teams', 'team-create-form', 'form')}
    >
      <Text
        variant="subheader-2"
        data-testid={testId('teams', 'team-create-form', 'text', 'title')}
      >
        Создать команду
      </Text>
      <TextInput
        label="Название"
        value={name}
        onUpdate={setName}
        data-testid={testId('teams', 'team-create-form', 'field', 'name')}
      />
      <TextInput
        label="Город"
        value={city}
        onUpdate={setCity}
        data-testid={testId('teams', 'team-create-form', 'field', 'city')}
      />
      <Select
        label="Уровень"
        value={[skillLevel]}
        onUpdate={(v) => setSkillLevel(v[0] as SkillLevel)}
        options={SKILL_OPTIONS}
        data-testid={testId('teams', 'team-create-form', 'select', 'skill-level')}
      />
      <div>
        <Text
          color="secondary"
          data-testid={testId('teams', 'team-create-form', 'text', 'description-label')}
        >
          Описание
        </Text>
        <TextArea
          value={description}
          onUpdate={setDescription}
          minRows={2}
          data-testid={testId('teams', 'team-create-form', 'field', 'description')}
        />
      </div>
      <Button
        view="action"
        loading={mutation.isPending}
        onClick={handleSubmit}
        data-testid={testId('teams', 'team-create-form', 'btn', 'submit')}
      >
        Создать команду
      </Button>
    </div>
  )
}
