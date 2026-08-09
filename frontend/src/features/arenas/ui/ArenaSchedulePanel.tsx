/**
 * HOCFRONT-32 — расписание слотов в кабинете арены
 */

import {Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import {
  createIceSlot,
  fetchArena,
  fetchArenaSlots,
  type IceSlot,
  type IceSlotStatus,
  updateIceSlot,
} from '@/entities/arena'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export interface ArenaSchedulePanelProps {
  arenaId: string
}

const STATUS_LABELS: Record<IceSlotStatus, string> = {
  free: 'Свободен',
  booked: 'Занят',
  unknown: 'Неизвестно',
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function defaultSlotStart(): string {
  const d = new Date(Date.now() + 86400000)
  d.setMinutes(0, 0, 0)
  d.setHours(20)
  return toLocalInputValue(d.toISOString())
}

function defaultSlotEnd(startLocal: string): string {
  const d = new Date(startLocal)
  if (Number.isNaN(d.getTime())) return ''
  return toLocalInputValue(new Date(d.getTime() + 90 * 60 * 1000).toISOString())
}

function formatSlotSchedule(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—'
  return `${start.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })} – ${end.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}`
}

interface SlotFormState {
  start: string
  end: string
  price: string
}

function emptySlotForm(): SlotFormState {
  const start = defaultSlotStart()
  return {start, end: defaultSlotEnd(start), price: '15000'}
}

export function ArenaSchedulePanel({arenaId}: ArenaSchedulePanelProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<SlotFormState>(() => emptySlotForm())
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {data: arena, isLoading: arenaLoading} = useQuery({
    queryKey: ['arena', arenaId],
    queryFn: () => fetchArena(arenaId),
  })

  const {data: slots = [], isLoading: slotsLoading} = useQuery({
    queryKey: ['arena-slots', arenaId],
    queryFn: () => fetchArenaSlots(arenaId),
  })

  const sortedSlots = useMemo(
    () => [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [slots],
  )

  const freeCount = sortedSlots.filter((slot) => slot.status === 'free').length

  const createMutation = useMutation({
    mutationFn: () =>
      createIceSlot({
        arenaId,
        startsAt: new Date(form.start).toISOString(),
        endsAt: new Date(form.end).toISOString(),
        price: form.price.trim() ? Number(form.price) : undefined,
        status: 'free',
      }),
    onSuccess: () => {
      setForm(emptySlotForm())
      setFormError(null)
      setSuccessMessage('Слот добавлен в расписание')
      void queryClient.invalidateQueries({queryKey: ['arena-slots', arenaId]})
      void queryClient.invalidateQueries({queryKey: ['arena-slots-all']})
    },
    onError: () => {
      setFormError('Не удалось добавить слот')
      setSuccessMessage(null)
    },
  })

  const statusMutation = useMutation({
    mutationFn: (payload: {slotId: string; status: IceSlotStatus}) =>
      updateIceSlot(payload.slotId, {status: payload.status}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['arena-slots', arenaId]})
      void queryClient.invalidateQueries({queryKey: ['arena-slots-all']})
    },
  })

  function submit() {
    const start = new Date(form.start)
    const end = new Date(form.end)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setFormError('Проверьте дату и время')
      return
    }
    if (end.getTime() <= start.getTime()) {
      setFormError('Конец должен быть позже начала')
      return
    }
    if (form.price.trim()) {
      const price = Number(form.price)
      if (!Number.isFinite(price) || price < 0) {
        setFormError('Цена должна быть числом ≥ 0')
        return
      }
    }
    setFormError(null)
    createMutation.mutate()
  }

  if (arenaLoading || slotsLoading) {
    return (
      <div data-testid={testId('arenas', 'partner', 'schedule', 'loader')}>
        <ScoreboardLoader label="Загрузка расписания..." />
      </div>
    )
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('arenas', 'partner', 'panel', 'schedule')}
    >
      <div className="hockey-stack hockey-stack--gap-4">
        <Text
          variant="subheader-2"
          data-testid={testId('arenas', 'partner', 'text', 'schedule-title')}
        >
          Расписание слотов
        </Text>
        <Text color="secondary" data-testid={testId('arenas', 'partner', 'text', 'schedule-hint')}>
          Свободные слоты видны игрокам на странице арены
          {arena?.bookingMode === 'slot_calendar'
            ? ' и в фильтре «Есть слоты».'
            : '. У этой арены режим «Заявка» — слоты всё равно можно вести для внутренних окон.'}
        </Text>
        <Text color="secondary" data-testid={testId('arenas', 'partner', 'text', 'schedule-stats')}>
          Всего: {sortedSlots.length} · свободно: {freeCount}
        </Text>
      </div>

      <div
        className="hockey-stack hockey-stack--gap-12"
        data-testid={testId('arenas', 'partner', 'panel', 'create-slot')}
      >
        <Text
          variant="subheader-2"
          data-testid={testId('arenas', 'partner', 'text', 'create-slot-title')}
        >
          Новый слот
        </Text>
        <label className="hockey-stack hockey-stack--gap-4">
          <Text variant="body-2">Начало</Text>
          <input
            type="datetime-local"
            className="g-text-input__control"
            value={form.start}
            onChange={(event) => {
              const value = event.target.value
              setForm((prev) => ({
                ...prev,
                start: value,
                end:
                  prev.end && new Date(prev.end) > new Date(value)
                    ? prev.end
                    : defaultSlotEnd(value),
              }))
              setSuccessMessage(null)
            }}
            data-testid={testId('arenas', 'partner', 'field', 'slot-start')}
          />
        </label>
        <label className="hockey-stack hockey-stack--gap-4">
          <Text variant="body-2">Конец</Text>
          <input
            type="datetime-local"
            className="g-text-input__control"
            value={form.end}
            onChange={(event) => {
              setForm((prev) => ({...prev, end: event.target.value}))
              setSuccessMessage(null)
            }}
            data-testid={testId('arenas', 'partner', 'field', 'slot-end')}
          />
        </label>
        <TextInput
          label="Цена, ₽"
          value={form.price}
          onUpdate={(value) => {
            setForm((prev) => ({...prev, price: value}))
            setSuccessMessage(null)
          }}
          data-testid={testId('arenas', 'partner', 'field', 'slot-price')}
        />
        {formError && (
          <Text color="danger" data-testid={testId('arenas', 'partner', 'text', 'slot-error')}>
            {formError}
          </Text>
        )}
        {successMessage && (
          <Text color="positive" data-testid={testId('arenas', 'partner', 'text', 'slot-success')}>
            {successMessage}
          </Text>
        )}
        <HockeyButton
          view="action"
          size="m"
          loading={createMutation.isPending}
          onClick={submit}
          data-testid={testId('arenas', 'partner', 'btn', 'create-slot')}
        >
          Добавить слот
        </HockeyButton>
      </div>

      <div
        className="hockey-stack hockey-stack--gap-8"
        data-testid={testId('arenas', 'partner', 'list', 'slots')}
      >
        {sortedSlots.length === 0 && (
          <Text color="secondary" data-testid={testId('arenas', 'partner', 'empty', 'slots')}>
            Слотов пока нет — добавьте первое окно выше.
          </Text>
        )}
        {sortedSlots.map((slot) => (
          <SlotRow
            key={slot.id}
            slot={slot}
            busy={statusMutation.isPending}
            onSetStatus={(status) => statusMutation.mutate({slotId: slot.id, status})}
          />
        ))}
      </div>
    </div>
  )
}

function SlotRow({
  slot,
  busy,
  onSetStatus,
}: {
  slot: IceSlot
  busy: boolean
  onSetStatus: (status: IceSlotStatus) => void
}) {
  return (
    <div
      className="arena-partner-listing-row hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap"
      data-testid={testId('arenas', 'partner', 'row', 'slot', slot.id)}
    >
      <div className="hockey-stack hockey-stack--gap-4">
        <div className="hockey-row hockey-row--gap-8 hockey-row--align-center hockey-row--wrap">
          <Text data-testid={testId('arenas', 'partner', 'text', 'slot-schedule', slot.id)}>
            {formatSlotSchedule(slot.startsAt, slot.endsAt)}
          </Text>
          <span
            className={`arena-partner-status arena-partner-status--${slot.status === 'free' ? 'published' : slot.status === 'booked' ? 'draft' : 'archived'}`}
            data-testid={testId('arenas', 'partner', 'badge', 'slot-status', slot.id)}
          >
            {STATUS_LABELS[slot.status]}
          </span>
        </div>
        <Text
          color="secondary"
          data-testid={testId('arenas', 'partner', 'text', 'slot-price', slot.id)}
        >
          {slot.price != null ? `${slot.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
        </Text>
      </div>
      <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
        {slot.status !== 'free' && (
          <HockeyButton
            view="action"
            size="s"
            loading={busy}
            onClick={() => onSetStatus('free')}
            data-testid={testId('arenas', 'partner', 'btn', 'slot-free', slot.id)}
          >
            Сделать свободным
          </HockeyButton>
        )}
        {slot.status !== 'booked' && (
          <HockeyButton
            view="outlined"
            size="s"
            loading={busy}
            onClick={() => onSetStatus('booked')}
            data-testid={testId('arenas', 'partner', 'btn', 'slot-booked', slot.id)}
          >
            Отметить занятым
          </HockeyButton>
        )}
      </div>
    </div>
  )
}
