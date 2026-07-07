/**
 * SPEC-FR-4.1.1, SPEC-FR-4.1.2
 */

import {Button, Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import {fetchArenas} from '@/entities/arena'
import type {EventType, SkillLevel} from '@/entities/common'
import {createEvent} from '@/entities/event'
import {fetchTeams} from '@/entities/team'
import {testId} from '@/shared/testing/testId'

const TYPE_OPTIONS = [
  {value: 'game', content: 'Игра'},
  {value: 'training', content: 'Тренировка'},
  {value: 'open_ice', content: 'Открытый лёд'},
]

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
]

/**
 * @spec SPEC-FR-4.1.1 - Форма создания игры/тренировки
 * @spec SPEC-FR-4.1.2 - Типы game, training, open_ice
 */
export function EventCreateForm() {
  const queryClient = useQueryClient()
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: fetchTeams})
  const {data: arenas = []} = useQuery({queryKey: ['arenas'], queryFn: () => fetchArenas()})

  const [type, setType] = useState<EventType>('game')
  const [title, setTitle] = useState('')
  const [arenaIdOverride, setArenaIdOverride] = useState<string | null>(null)
  const resolvedArenaId = arenaIdOverride ?? arenas[0]?.id ?? ''
  const [teamId, setTeamId] = useState<string | undefined>(teams[0]?.id)
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('amateur')
  const [pricePerPlayer, setPricePerPlayer] = useState('1500')

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
      setTitle('')
    },
  })

  /** @spec SPEC-FR-4.1.1 - Создание события */
  function handleSubmit() {
    if (!title.trim() || !resolvedArenaId) return
    const startsAt = new Date(Date.now() + 86400000).toISOString()
    const endsAt = new Date(Date.now() + 86400000 + 5400000).toISOString()

    mutation.mutate({
      type,
      title: title.trim(),
      startsAt,
      endsAt,
      arenaId: resolvedArenaId,
      teamId,
      requiredSkillLevel: skillLevel,
      requiredSlots: [
        {position: 'goalie', count: 2, filledCount: 0},
        {position: 'defense', count: 4, filledCount: 0},
        {position: 'forward', count: 6, filledCount: 0},
      ],
      pricePerPlayer: Number(pricePerPlayer) || undefined,
    })
  }

  const arenaOptions = arenas.map((a) => ({value: a.id, content: a.name}))
  const teamOptions = teams.map((t) => ({value: t.id, content: t.name}))

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId('events', 'create-form', 'panel')}
    >
      <Text variant="subheader-2" data-testid={testId('events', 'create-form', 'text', 'title')}>
        Создать событие
      </Text>
      <TextInput
        label="Название"
        value={title}
        onUpdate={setTitle}
        data-testid={testId('events', 'create-form', 'field', 'title')}
      />
      <Select
        label="Тип"
        value={[type]}
        onUpdate={(v) => setType(v[0] as EventType)}
        options={TYPE_OPTIONS}
        data-testid={testId('events', 'create-form', 'select', 'type')}
      />
      <Select
        label="Арена"
        value={resolvedArenaId ? [resolvedArenaId] : []}
        onUpdate={(v) => setArenaIdOverride(v[0])}
        options={arenaOptions}
        data-testid={testId('events', 'create-form', 'select', 'arena')}
      />
      {teamOptions.length > 0 && (
        <Select
          label="Команда"
          value={teamId ? [teamId] : []}
          onUpdate={(v) => setTeamId(v[0] || undefined)}
          options={teamOptions}
          data-testid={testId('events', 'create-form', 'select', 'team')}
        />
      )}
      <Select
        label="Уровень"
        value={[skillLevel]}
        onUpdate={(v) => setSkillLevel(v[0] as SkillLevel)}
        options={SKILL_OPTIONS}
        data-testid={testId('events', 'create-form', 'select', 'skill')}
      />
      <TextInput
        label="Цена за игрока (RUB)"
        value={pricePerPlayer}
        onUpdate={setPricePerPlayer}
        data-testid={testId('events', 'create-form', 'field', 'price')}
      />
      <Button
        view="action"
        loading={mutation.isPending}
        onClick={handleSubmit}
        data-testid={testId('events', 'create-form', 'btn', 'submit')}
      >
        Создать событие
      </Button>
    </div>
  )
}
