/**
 * HOCFRONT-28CAL-G — CRUD окон возможностей
 */

import {Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import {
  createAvailabilityWindow,
  fetchAvailabilityWindows,
  patchAvailabilityWindow,
} from '@/entities/calendar'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

export interface AvailabilityWindowsPanelProps {
  userId: string
}

export function AvailabilityWindowsPanel({userId}: AvailabilityWindowsPanelProps) {
  const queryClient = useQueryClient()
  const {data: windows = []} = useQuery({
    queryKey: ['availability-windows', userId],
    queryFn: () => fetchAvailabilityWindows(userId),
  })

  const [startsLocal, setStartsLocal] = useState('2026-08-20T18:00')
  const [endsLocal, setEndsLocal] = useState('2026-08-20T22:00')
  const [districts, setDistricts] = useState('САО')
  const [priceFrom, setPriceFrom] = useState('0')
  const [priceTo, setPriceTo] = useState('1500')
  const [note, setNote] = useState('')

  const createMutation = useMutation({
    mutationFn: createAvailabilityWindow,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['availability-windows']})
      setNote('')
    },
  })

  const patchMutation = useMutation({
    mutationFn: ({id, active}: {id: string; active: boolean}) =>
      patchAvailabilityWindow(id, {active}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['availability-windows']})
    },
  })

  return (
    <IceCard padding="m" data-testid={testId('calendar', 'windows', 'panel')}>
      <div className="hockey-stack hockey-stack--gap-12">
        <Text variant="subheader-2" data-testid={testId('calendar', 'windows', 'text', 'title')}>
          Моя доступность
        </Text>
        <Text color="secondary" data-testid={testId('calendar', 'windows', 'text', 'hint')}>
          Окна, когда вы готовы выйти на игру или встать в ворота. Не путать с записью на событие.
        </Text>

        <ul
          className="hockey-stack hockey-stack--gap-8"
          data-testid={testId('calendar', 'windows', 'list')}
        >
          {windows.map((window) => (
            <li
              key={window.id}
              className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap"
              data-testid={testId('calendar', 'windows', 'row', window.id)}
            >
              <Text data-testid={testId('calendar', 'windows', 'text', 'meta', window.id)}>
                {new Date(window.startsAt).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' — '}
                {new Date(window.endsAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' · '}
                {window.districts.join(', ') || 'любой округ'}
                {window.priceTo != null ? ` · до ${window.priceTo} ₽` : ''}
                {!window.active ? ' · выкл.' : ''}
              </Text>
              <HockeyButton
                view="flat"
                size="s"
                loading={patchMutation.isPending}
                onClick={() => patchMutation.mutate({id: window.id, active: !window.active})}
                data-testid={testId('calendar', 'windows', 'btn', 'toggle', window.id)}
              >
                {window.active ? 'Выключить' : 'Включить'}
              </HockeyButton>
            </li>
          ))}
        </ul>

        <div
          className="hockey-grid hockey-grid--cards-280"
          data-testid={testId('calendar', 'windows', 'panel', 'create')}
        >
          <label className="hockey-stack hockey-stack--gap-4">
            <Text variant="body-2">Начало</Text>
            <input
              type="datetime-local"
              className="g-text-input__control"
              value={startsLocal}
              onChange={(event) => setStartsLocal(event.target.value)}
              data-testid={testId('calendar', 'windows', 'field', 'starts')}
            />
          </label>
          <label className="hockey-stack hockey-stack--gap-4">
            <Text variant="body-2">Конец</Text>
            <input
              type="datetime-local"
              className="g-text-input__control"
              value={endsLocal}
              onChange={(event) => setEndsLocal(event.target.value)}
              data-testid={testId('calendar', 'windows', 'field', 'ends')}
            />
          </label>
          <TextInput
            label="Округа"
            value={districts}
            onUpdate={setDistricts}
            data-testid={testId('calendar', 'windows', 'field', 'districts')}
          />
          <TextInput
            label="Цена от"
            value={priceFrom}
            onUpdate={setPriceFrom}
            data-testid={testId('calendar', 'windows', 'field', 'price-from')}
          />
          <TextInput
            label="Цена до"
            value={priceTo}
            onUpdate={setPriceTo}
            data-testid={testId('calendar', 'windows', 'field', 'price-to')}
          />
          <TextInput
            label="Заметка"
            value={note}
            onUpdate={setNote}
            data-testid={testId('calendar', 'windows', 'field', 'note')}
          />
        </div>
        <HockeyButton
          view="action"
          size="m"
          loading={createMutation.isPending}
          onClick={() =>
            createMutation.mutate({
              roleHint: 'goalie',
              startsAt: new Date(startsLocal).toISOString(),
              endsAt: new Date(endsLocal).toISOString(),
              districts: districts
                .split(/[,\s]+/)
                .map((item) => item.trim())
                .filter(Boolean),
              priceFrom: Number(priceFrom) || 0,
              priceTo: Number(priceTo) || undefined,
              note: note.trim() || undefined,
            })
          }
          data-testid={testId('calendar', 'windows', 'btn', 'create')}
        >
          Добавить окно
        </HockeyButton>
      </div>
    </IceCard>
  )
}
