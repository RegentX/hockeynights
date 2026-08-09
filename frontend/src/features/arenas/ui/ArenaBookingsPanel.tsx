/**
 * HOCFRONT-32 — inbox заявок на лёд в кабинете арены
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link, useNavigate} from 'react-router'

import {
  fetchArenaIceBookings,
  type IceBookingRequest,
  type IceBookingStatus,
  updateIceBooking,
} from '@/entities/external-flow'
import {createDirectChat, openDiscoverableChat} from '@/entities/messenger'
import {
  ICE_BOOKING_BUCKET_LABELS,
  ICE_BOOKING_STATUS_LABELS,
  iceBookingActionLabel,
  iceBookingBucket,
  type IceBookingInboxBucket,
  nextIceBookingActions,
} from '@/features/arenas/lib/iceBookingStatus'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

export interface ArenaBookingsPanelProps {
  arenaId: string
}

type BucketFilter = 'all' | IceBookingInboxBucket

const BUCKET_FILTERS: BucketFilter[] = ['all', 'inbox', 'work', 'payment', 'done', 'archive']

function formatWhen(booking: IceBookingRequest): string {
  if (booking.slotLabel) return booking.slotLabel
  return 'Окно не выбрано · заявка без слота'
}

export function ArenaBookingsPanel({arenaId}: ArenaBookingsPanelProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [bucket, setBucket] = useState<BucketFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {data: bookings = [], isLoading} = useQuery({
    queryKey: ['arena-ice-bookings', arenaId],
    queryFn: () => fetchArenaIceBookings(arenaId),
  })

  const filtered = useMemo(() => {
    if (bucket === 'all') return bookings
    return bookings.filter((item) => iceBookingBucket(item.status) === bucket)
  }, [bookings, bucket])

  const selected =
    filtered.find((item) => item.id === selectedId) ??
    bookings.find((item) => item.id === selectedId) ??
    filtered[0] ??
    null

  const statusMutation = useMutation({
    mutationFn: (payload: {bookingId: string; status: IceBookingStatus}) =>
      updateIceBooking(payload.bookingId, {status: payload.status}),
    onSuccess: (booking) => {
      setSelectedId(booking.id)
      void queryClient.invalidateQueries({queryKey: ['arena-ice-bookings', arenaId]})
    },
  })

  const chatMutation = useMutation({
    mutationFn: async (booking: IceBookingRequest) => {
      if (booking.chatId) {
        return {chatId: booking.chatId}
      }
      if (booking.requester.chatType === 'team' && booking.requester.teamChatId) {
        try {
          const chat = await openDiscoverableChat(booking.requester.teamChatId)
          await updateIceBooking(booking.id, {chatId: chat.id})
          return {chatId: chat.id}
        } catch {
          // fallback: direct с капитаном/организатором
        }
      }
      const chat = await createDirectChat(booking.requester.userId)
      await updateIceBooking(booking.id, {chatId: chat.id})
      return {chatId: chat.id}
    },
    onSuccess: ({chatId}) => {
      void queryClient.invalidateQueries({queryKey: ['arena-ice-bookings', arenaId]})
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      navigate(`${routes.messenger}?chatId=${chatId}`)
    },
  })

  const counts = useMemo(() => {
    const result: Record<IceBookingInboxBucket, number> = {
      inbox: 0,
      work: 0,
      payment: 0,
      done: 0,
      archive: 0,
    }
    for (const item of bookings) {
      result[iceBookingBucket(item.status)] += 1
    }
    return result
  }, [bookings])

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('arenas', 'partner-bookings', 'panel', arenaId)}
    >
      <div className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap">
        <Text
          variant="subheader-2"
          data-testid={testId('arenas', 'partner-bookings', 'text', 'title')}
        >
          Заявки на лёд
        </Text>
        <Text
          color="secondary"
          data-testid={testId('arenas', 'partner-bookings', 'text', 'counts')}
        >
          Входящие: {counts.inbox} · Оплата: {counts.payment} · Бронь: {counts.done}
        </Text>
      </div>

      <div
        className="hockey-row hockey-row--gap-8 hockey-row--wrap"
        data-testid={testId('arenas', 'partner-bookings', 'panel', 'filters')}
      >
        {BUCKET_FILTERS.map((key) => (
          <HockeyButton
            key={key}
            view={bucket === key ? 'action' : 'flat'}
            size="s"
            onClick={() => setBucket(key)}
            data-testid={testId('arenas', 'partner-bookings', 'btn', 'filter', key)}
          >
            {key === 'all'
              ? `Все (${bookings.length})`
              : `${ICE_BOOKING_BUCKET_LABELS[key]} (${counts[key]})`}
          </HockeyButton>
        ))}
      </div>

      {isLoading && (
        <Text color="secondary" data-testid={testId('arenas', 'partner-bookings', 'loader')}>
          Загрузка заявок...
        </Text>
      )}

      {!isLoading && filtered.length === 0 && (
        <Text color="secondary" data-testid={testId('arenas', 'partner-bookings', 'empty')}>
          В этом фильтре заявок нет
        </Text>
      )}

      <div className="arena-partner-bookings__layout">
        <div
          className="hockey-stack hockey-stack--gap-8"
          data-testid={testId('arenas', 'partner-bookings', 'list')}
        >
          {filtered.map((booking) => {
            const active = selected?.id === booking.id
            return (
              <button
                key={booking.id}
                type="button"
                className={`arena-partner-booking-row${active ? ' arena-partner-booking-row--active' : ''}`}
                onClick={() => setSelectedId(booking.id)}
                data-testid={testId('arenas', 'partner-bookings', 'row', booking.id)}
              >
                <div className="hockey-stack hockey-stack--gap-4">
                  <div className="hockey-row hockey-row--gap-8 hockey-row--align-center hockey-row--wrap">
                    <Text
                      data-testid={testId('arenas', 'partner-bookings', 'text', 'name', booking.id)}
                    >
                      {booking.requester.displayName}
                    </Text>
                    <span
                      className={`arena-partner-status arena-partner-status--${iceBookingBucket(booking.status)}`}
                      data-testid={testId(
                        'arenas',
                        'partner-bookings',
                        'badge',
                        'status',
                        booking.id,
                      )}
                    >
                      {ICE_BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                  <Text
                    color="secondary"
                    data-testid={testId('arenas', 'partner-bookings', 'text', 'when', booking.id)}
                  >
                    {formatWhen(booking)}
                    {booking.priceRub != null
                      ? ` · ${booking.priceRub.toLocaleString('ru-RU')} ₽`
                      : ''}
                  </Text>
                  <Text
                    color="secondary"
                    data-testid={testId('arenas', 'partner-bookings', 'text', 'meta', booking.id)}
                  >
                    {booking.requester.kind === 'team' ? 'Команда' : 'Организатор'}
                    {booking.headcount ? ` · ${booking.headcount}` : ''}
                    {booking.purpose ? ` · ${booking.purpose}` : ''}
                  </Text>
                </div>
              </button>
            )
          })}
        </div>

        {selected && (
          <IceCard
            padding="m"
            data-testid={testId('arenas', 'partner-bookings', 'panel', 'detail', selected.id)}
          >
            <div className="hockey-stack hockey-stack--gap-12">
              <div className="hockey-row hockey-row--between hockey-row--align-start hockey-row--wrap">
                <div className="hockey-stack hockey-stack--gap-4">
                  <Text
                    variant="subheader-2"
                    data-testid={testId(
                      'arenas',
                      'partner-bookings',
                      'text',
                      'detail-title',
                      selected.id,
                    )}
                  >
                    {selected.requester.displayName}
                  </Text>
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'arenas',
                      'partner-bookings',
                      'text',
                      'detail-role',
                      selected.id,
                    )}
                  >
                    {selected.requester.roleLabel}
                  </Text>
                </div>
                <span
                  className={`arena-partner-status arena-partner-status--${iceBookingBucket(selected.status)}`}
                >
                  {ICE_BOOKING_STATUS_LABELS[selected.status]}
                </span>
              </div>

              <div
                className="hockey-stack hockey-stack--gap-6"
                data-testid={testId(
                  'arenas',
                  'partner-bookings',
                  'panel',
                  'requester',
                  selected.id,
                )}
              >
                <Text variant="subheader-2">Кто снимает лёд</Text>
                {selected.requester.phone && (
                  <Text
                    data-testid={testId('arenas', 'partner-bookings', 'text', 'phone', selected.id)}
                  >
                    Телефон: {selected.requester.phone}
                  </Text>
                )}
                {selected.requester.city && (
                  <Text color="secondary">Город: {selected.requester.city}</Text>
                )}
                {selected.requester.kind === 'person' ? (
                  <>
                    {selected.requester.positions && (
                      <Text color="secondary">Амплуа: {selected.requester.positions}</Text>
                    )}
                    {selected.requester.gamesPlayed != null && (
                      <Text color="secondary">Игры в HN: {selected.requester.gamesPlayed}</Text>
                    )}
                    {selected.requester.reliability && (
                      <Text color="secondary">Надёжность: {selected.requester.reliability}</Text>
                    )}
                  </>
                ) : (
                  <>
                    {selected.requester.teamName && (
                      <Text color="secondary">Команда: {selected.requester.teamName}</Text>
                    )}
                    {selected.requester.clubName && (
                      <Text color="secondary">Клуб: {selected.requester.clubName}</Text>
                    )}
                    {selected.requester.rosterSize != null && (
                      <Text color="secondary">
                        Состав: {selected.requester.rosterSize} · {selected.requester.level}
                      </Text>
                    )}
                    {selected.requester.captainName && (
                      <Text color="secondary">Контакт: {selected.requester.captainName}</Text>
                    )}
                    {selected.requester.recentIce && (
                      <Text color="secondary">{selected.requester.recentIce}</Text>
                    )}
                  </>
                )}
                {selected.requester.profilePath && (
                  <Link
                    to={selected.requester.profilePath}
                    data-testid={testId(
                      'arenas',
                      'partner-bookings',
                      'link',
                      'profile',
                      selected.id,
                    )}
                  >
                    <HockeyButton
                      view="flat"
                      size="s"
                      data-testid={testId(
                        'arenas',
                        'partner-bookings',
                        'btn',
                        'profile',
                        selected.id,
                      )}
                    >
                      Открыть профиль
                    </HockeyButton>
                  </Link>
                )}
              </div>

              <div className="hockey-stack hockey-stack--gap-6">
                <Text variant="subheader-2">Заявка</Text>
                <Text
                  data-testid={testId('arenas', 'partner-bookings', 'text', 'slot', selected.id)}
                >
                  {formatWhen(selected)}
                </Text>
                {selected.headcount && <Text color="secondary">Состав: {selected.headcount}</Text>}
                {selected.purpose && <Text color="secondary">Цель: {selected.purpose}</Text>}
                {selected.comment && (
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'arenas',
                      'partner-bookings',
                      'text',
                      'comment',
                      selected.id,
                    )}
                  >
                    Комментарий: {selected.comment}
                  </Text>
                )}
                <Text color="secondary">Код: {selected.confirmationCode}</Text>
                {selected.paymentDueAt && (
                  <Text color="secondary">
                    Дедлайн оплаты:{' '}
                    {new Date(selected.paymentDueAt).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </div>

              <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
                <HockeyButton
                  view="action"
                  size="m"
                  loading={chatMutation.isPending}
                  onClick={() => chatMutation.mutate(selected)}
                  data-testid={testId('arenas', 'partner-bookings', 'btn', 'chat', selected.id)}
                >
                  {selected.requester.kind === 'team'
                    ? 'Написать команде'
                    : 'Написать организатору'}
                </HockeyButton>
                {nextIceBookingActions(selected.status).map((next) => (
                  <HockeyButton
                    key={next}
                    view={next === 'declined' || next === 'cancelled' ? 'outlined' : 'outlined'}
                    size="m"
                    loading={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({bookingId: selected.id, status: next})}
                    data-testid={testId(
                      'arenas',
                      'partner-bookings',
                      'btn',
                      'status',
                      next,
                      selected.id,
                    )}
                  >
                    {iceBookingActionLabel(next)}
                  </HockeyButton>
                ))}
              </div>
            </div>
          </IceCard>
        )}
      </div>
    </div>
  )
}
