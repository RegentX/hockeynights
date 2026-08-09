/**
 * HOCFRONT-32D/E — кабинет ледовой арены: профиль, объявления, расписание, публичность
 */

import {Switch, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link, useParams} from 'react-router'

import {
  createIceListing,
  fetchArena,
  fetchArenaListings,
  type IceListing,
  type IceListingStatus,
  updateArena,
  updateIceListing,
} from '@/entities/arena'
import {canManageArena, useSessionAccess} from '@/features/access'
import {ArenaBookingsPanel, ArenaSchedulePanel} from '@/features/arenas'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

type CabinetTab = 'bookings' | 'schedule' | 'listings' | 'profile'
type ListingFilter = 'all' | IceListingStatus

function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function defaultListingStart(): string {
  const d = new Date(Date.now() + 86400000)
  d.setMinutes(0, 0, 0)
  d.setHours(20)
  return toLocalInputValue(d.toISOString())
}

function defaultListingEnd(startLocal: string): string {
  const d = new Date(startLocal)
  if (Number.isNaN(d.getTime())) return ''
  return toLocalInputValue(new Date(d.getTime() + 90 * 60 * 1000).toISOString())
}

function nextWeekdayAt(weekday: number, hour: number, minute = 0): Date {
  const d = new Date()
  d.setSeconds(0, 0)
  const delta = (weekday - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + delta)
  d.setHours(hour, minute, 0, 0)
  return d
}

function formatListingSchedule(startsAt: string, endsAt: string): string {
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

const STATUS_LABELS: Record<IceListingStatus, string> = {
  draft: 'Черновик',
  published: 'Опубликовано',
  archived: 'Снято',
}

const FILTER_LABELS: Record<ListingFilter, string> = {
  all: 'Все',
  draft: 'Черновики',
  published: 'Опубликованные',
  archived: 'Снятые',
}

interface ListingFormState {
  title: string
  start: string
  end: string
  price: string
  phone: string
  note: string
}

function emptyListingForm(phone = ''): ListingFormState {
  const start = defaultListingStart()
  return {
    title: '',
    start,
    end: defaultListingEnd(start),
    price: '15000',
    phone,
    note: '',
  }
}

function listingToForm(listing: IceListing): ListingFormState {
  return {
    title: listing.title,
    start: toLocalInputValue(listing.startsAt),
    end: toLocalInputValue(listing.endsAt),
    price: listing.priceRub != null ? String(listing.priceRub) : '',
    phone: listing.contactPhone ?? '',
    note: listing.contactNote ?? '',
  }
}

function validateListingForm(form: ListingFormState): string | null {
  if (!form.title.trim()) return 'Укажите название объявления'
  const start = new Date(form.start)
  const end = new Date(form.end)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Проверьте дату и время'
  }
  if (end.getTime() <= start.getTime()) return 'Конец должен быть позже начала'
  if (form.price.trim()) {
    const price = Number(form.price)
    if (!Number.isFinite(price) || price < 0) return 'Цена должна быть числом ≥ 0'
  }
  return null
}

export function ArenaPartnerDashboard() {
  const {arenaId = ''} = useParams()
  const queryClient = useQueryClient()
  const {session} = useSessionAccess()
  const canManage = canManageArena(session, arenaId)

  const {
    data: arena,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['arena', arenaId],
    queryFn: () => fetchArena(arenaId),
    enabled: Boolean(arenaId),
  })

  const {data: listings = [], isLoading: listingsLoading} = useQuery({
    queryKey: ['arena-listings', arenaId, 'cabinet'],
    queryFn: () => fetchArenaListings(arenaId),
    enabled: Boolean(arenaId) && canManage,
  })

  const [tab, setTab] = useState<CabinetTab>('bookings')
  const [listingFilter, setListingFilter] = useState<ListingFilter>('all')

  const [phone, setPhone] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [bookingUrl, setBookingUrl] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [visibleInCatalog, setVisibleInCatalog] = useState(true)
  const [profileSaved, setProfileSaved] = useState(false)

  const [form, setForm] = useState<ListingFormState>(() => emptyListingForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [lastPublishedId, setLastPublishedId] = useState<string | null>(null)

  const [hydratedArenaId, setHydratedArenaId] = useState<string | null>(null)
  if (arena && arena.id !== hydratedArenaId) {
    setHydratedArenaId(arena.id)
    setPhone(arena.phone ?? '')
    setWebsiteUrl(arena.websiteUrl ?? '')
    setBookingUrl(arena.bookingUrl ?? '')
    setPriceRange(arena.priceRange ?? '')
    setVisibleInCatalog(arena.visible !== false)
    setForm((prev) => (prev.phone ? prev : {...prev, phone: arena.phone ?? ''}))
  }

  const counts = useMemo(() => {
    const draft = listings.filter((item) => item.status === 'draft').length
    const published = listings.filter((item) => item.status === 'published').length
    const archived = listings.filter((item) => item.status === 'archived').length
    return {draft, published, archived, total: listings.length}
  }, [listings])

  const filteredListings = useMemo(() => {
    if (listingFilter === 'all') return listings
    return listings.filter((item) => item.status === listingFilter)
  }, [listings, listingFilter])

  const profileMutation = useMutation({
    mutationFn: () =>
      updateArena(arenaId, {
        phone: phone.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        bookingUrl: bookingUrl.trim() || undefined,
        priceRange: priceRange.trim() || undefined,
        visible: visibleInCatalog,
      }),
    onSuccess: () => {
      setProfileSaved(true)
      void queryClient.invalidateQueries({queryKey: ['arena', arenaId]})
      void queryClient.invalidateQueries({queryKey: ['arenas']})
    },
  })

  const invalidateListings = () => {
    void queryClient.invalidateQueries({queryKey: ['arena-listings', arenaId]})
    void queryClient.invalidateQueries({queryKey: ['arena-listings', arenaId, 'public']})
    void queryClient.invalidateQueries({queryKey: ['ice-listings-published']})
  }

  const resetForm = (phoneFallback?: string) => {
    setEditingId(null)
    setForm(emptyListingForm(phoneFallback ?? arena?.phone ?? ''))
    setFormError(null)
  }

  const saveMutation = useMutation({
    mutationFn: async (status: IceListingStatus) => {
      const error = validateListingForm(form)
      if (error) throw new Error(error)

      const payload = {
        title: form.title.trim(),
        startsAt: new Date(form.start).toISOString(),
        endsAt: new Date(form.end).toISOString(),
        priceRub: form.price.trim() ? Number(form.price) : undefined,
        contactPhone: form.phone.trim() || undefined,
        contactNote: form.note.trim() || undefined,
        status,
      }

      if (editingId) {
        return updateIceListing(editingId, payload)
      }
      return createIceListing({arenaId, ...payload})
    },
    onSuccess: (listing, status) => {
      invalidateListings()
      resetForm()
      if (status === 'published') {
        setLastPublishedId(listing.id)
        setSuccessMessage('Объявление опубликовано — игроки увидят его на странице арены.')
      } else {
        setLastPublishedId(null)
        setSuccessMessage(
          editingId ? 'Черновик сохранён.' : 'Черновик создан. Можно опубликовать из списка.',
        )
      }
    },
    onError: (error: Error) => {
      setFormError(error.message || 'Не удалось сохранить объявление')
    },
  })

  const statusMutation = useMutation({
    mutationFn: (payload: {listingId: string; status: IceListingStatus}) =>
      updateIceListing(payload.listingId, {status: payload.status}),
    onSuccess: (listing) => {
      invalidateListings()
      if (listing.status === 'published') {
        setLastPublishedId(listing.id)
        setSuccessMessage('Объявление опубликовано.')
      }
    },
  })

  function updateForm<K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) {
    setForm((prev) => ({...prev, [key]: value}))
    setFormError(null)
    setSuccessMessage(null)
  }

  function applyTemplate(kind: 'friday-evening' | 'weekend-morning' | 'tomorrow-night') {
    let start: Date
    let title: string
    if (kind === 'friday-evening') {
      start = nextWeekdayAt(5, 20, 0)
      title = 'Свободный лёд · пятница вечер'
    } else if (kind === 'weekend-morning') {
      start = nextWeekdayAt(6, 10, 0)
      title = 'Свободный лёд · суббота утро'
    } else {
      start = new Date(Date.now() + 86400000)
      start.setMinutes(0, 0, 0)
      start.setHours(21)
      title = 'Свободный лёд · вечер'
    }
    const startLocal = toLocalInputValue(start.toISOString())
    setForm((prev) => ({
      ...prev,
      title,
      start: startLocal,
      end: defaultListingEnd(startLocal),
    }))
    setFormError(null)
    setSuccessMessage(null)
  }

  function startEdit(listing: IceListing) {
    setEditingId(listing.id)
    setForm(listingToForm(listing))
    setFormError(null)
    setSuccessMessage(null)
    setTab('listings')
  }

  function submit(status: IceListingStatus) {
    const error = validateListingForm(form)
    if (error) {
      setFormError(error)
      return
    }
    saveMutation.mutate(status)
  }

  if (isLoading) {
    return (
      <div data-testid={testId('arenas', 'partner', 'loader')}>
        <ScoreboardLoader label="Загрузка кабинета арены..." />
      </div>
    )
  }

  if (isError || !arena) {
    return (
      <div data-testid={testId('arenas', 'partner', 'empty')}>
        <EmptyNetState title="Арена не найдена" copy="Вернитесь к списку кабинетов." />
        <Link to={routes.partner} data-testid={testId('arenas', 'partner', 'link', 'back-empty')}>
          <HockeyButton view="flat" size="m">
            К кабинетам
          </HockeyButton>
        </Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div data-testid={testId('arenas', 'partner', 'error', 'access-denied')}>
        <EmptyNetState
          title="Нет доступа к кабинету арены"
          copy="Кабинет доступен владельцу арены или администратору."
        />
        <Link to={routes.partner} data-testid={testId('arenas', 'partner', 'link', 'back-denied')}>
          <HockeyButton view="flat" size="m">
            К кабинетам
          </HockeyButton>
        </Link>
      </div>
    )
  }

  const previewPrice = form.price.trim()
    ? `${Number(form.price).toLocaleString('ru-RU')} ₽`
    : 'Цена по запросу'

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('arenas', 'partner', 'page', arenaId)}
    >
      <div className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap">
        <div className="hockey-stack hockey-stack--gap-4">
          <Text color="secondary" data-testid={testId('arenas', 'partner', 'text', 'eyebrow')}>
            Кабинет ледовой арены
          </Text>
          <Text variant="header-1" data-testid={testId('arenas', 'partner', 'text', 'title')}>
            {arena.name}
          </Text>
          <Text color="secondary" data-testid={testId('arenas', 'partner', 'text', 'stats')}>
            В каталоге: {counts.published} опубл. · {counts.draft} черн. · {counts.archived} снято
          </Text>
        </div>
        <div className="hockey-row hockey-row--gap-8">
          <Link
            to={`/arenas/${arena.id}`}
            data-testid={testId('arenas', 'partner', 'link', 'public', arenaId)}
          >
            <HockeyButton
              view="outlined"
              size="m"
              data-testid={testId('arenas', 'partner', 'btn', 'public', arenaId)}
            >
              Как видит игрок
            </HockeyButton>
          </Link>
          <Link to={routes.partner} data-testid={testId('arenas', 'partner', 'link', 'back')}>
            <HockeyButton
              view="flat"
              size="m"
              data-testid={testId('arenas', 'partner', 'btn', 'back')}
            >
              Все кабинеты
            </HockeyButton>
          </Link>
        </div>
      </div>

      <div
        className="partner-dashboard__tabs"
        data-testid={testId('arenas', 'partner', 'nav', 'tabs')}
      >
        <HockeyButton
          view={tab === 'bookings' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('bookings')}
          data-testid={testId('arenas', 'partner', 'tab', 'bookings')}
        >
          Заявки
        </HockeyButton>
        <HockeyButton
          view={tab === 'schedule' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('schedule')}
          data-testid={testId('arenas', 'partner', 'tab', 'schedule')}
        >
          Расписание
        </HockeyButton>
        <HockeyButton
          view={tab === 'listings' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('listings')}
          data-testid={testId('arenas', 'partner', 'tab', 'listings')}
        >
          Объявления
        </HockeyButton>
        <HockeyButton
          view={tab === 'profile' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('profile')}
          data-testid={testId('arenas', 'partner', 'tab', 'profile')}
        >
          Профиль
        </HockeyButton>
      </div>

      {tab === 'bookings' && (
        <IceCard padding="m">
          <ArenaBookingsPanel arenaId={arenaId} />
        </IceCard>
      )}

      {tab === 'schedule' && (
        <IceCard padding="m">
          <ArenaSchedulePanel arenaId={arenaId} />
        </IceCard>
      )}

      {tab === 'profile' && (
        <IceCard padding="m">
          <div
            className="hockey-stack hockey-stack--gap-12"
            data-testid={testId('arenas', 'partner', 'panel', 'profile')}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('arenas', 'partner', 'text', 'profile-title')}
            >
              Профиль арены
            </Text>
            <Text color="secondary" data-testid={testId('arenas', 'partner', 'text', 'address')}>
              {arena.address} · {arena.city}
            </Text>
            <Switch
              checked={visibleInCatalog}
              onUpdate={(value) => {
                setVisibleInCatalog(value)
                setProfileSaved(false)
              }}
              content="Показывать в каталоге «Ледовые арены»"
              data-testid={testId('arenas', 'partner', 'switch', 'visible')}
            />
            <TextInput
              label="Телефон"
              value={phone}
              onUpdate={(value) => {
                setPhone(value)
                setProfileSaved(false)
              }}
              data-testid={testId('arenas', 'partner', 'field', 'phone')}
            />
            <TextInput
              label="Сайт"
              value={websiteUrl}
              onUpdate={(value) => {
                setWebsiteUrl(value)
                setProfileSaved(false)
              }}
              data-testid={testId('arenas', 'partner', 'field', 'website')}
            />
            <TextInput
              label="Ссылка на запись"
              value={bookingUrl}
              onUpdate={(value) => {
                setBookingUrl(value)
                setProfileSaved(false)
              }}
              data-testid={testId('arenas', 'partner', 'field', 'booking-url')}
            />
            <TextInput
              label="Диапазон цен"
              value={priceRange}
              onUpdate={(value) => {
                setPriceRange(value)
                setProfileSaved(false)
              }}
              data-testid={testId('arenas', 'partner', 'field', 'price-range')}
            />
            <HockeyButton
              view="action"
              size="m"
              loading={profileMutation.isPending}
              onClick={() => profileMutation.mutate()}
              data-testid={testId('arenas', 'partner', 'btn', 'save-profile')}
            >
              Сохранить профиль
            </HockeyButton>
            {profileSaved && (
              <Text
                color="positive"
                data-testid={testId('arenas', 'partner', 'text', 'profile-saved')}
              >
                Профиль обновлён
              </Text>
            )}
          </div>
        </IceCard>
      )}

      {tab === 'listings' && (
        <>
          <IceCard padding="m">
            <div
              className="hockey-stack hockey-stack--gap-12"
              data-testid={testId('arenas', 'partner', 'panel', 'create-listing')}
            >
              <Text
                variant="subheader-2"
                data-testid={testId('arenas', 'partner', 'text', 'form-title')}
              >
                {editingId ? 'Редактирование объявления' : 'Новое объявление'}
              </Text>

              <div
                className="hockey-row hockey-row--gap-8 hockey-row--wrap"
                data-testid={testId('arenas', 'partner', 'panel', 'templates')}
              >
                <HockeyButton
                  view="flat"
                  size="s"
                  onClick={() => applyTemplate('friday-evening')}
                  data-testid={testId('arenas', 'partner', 'btn', 'template-friday')}
                >
                  Пятница вечер
                </HockeyButton>
                <HockeyButton
                  view="flat"
                  size="s"
                  onClick={() => applyTemplate('weekend-morning')}
                  data-testid={testId('arenas', 'partner', 'btn', 'template-saturday')}
                >
                  Суббота утро
                </HockeyButton>
                <HockeyButton
                  view="flat"
                  size="s"
                  onClick={() => applyTemplate('tomorrow-night')}
                  data-testid={testId('arenas', 'partner', 'btn', 'template-tomorrow')}
                >
                  Завтра вечер
                </HockeyButton>
              </div>

              <TextInput
                label="Название объявления"
                value={form.title}
                onUpdate={(value) => updateForm('title', value)}
                data-testid={testId('arenas', 'partner', 'field', 'listing-title')}
              />
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
                      end: defaultListingEnd(value),
                    }))
                    setFormError(null)
                    setSuccessMessage(null)
                  }}
                  data-testid={testId('arenas', 'partner', 'field', 'listing-start')}
                />
              </label>
              <label className="hockey-stack hockey-stack--gap-4">
                <Text variant="body-2">Конец</Text>
                <input
                  type="datetime-local"
                  className="g-text-input__control"
                  value={form.end}
                  onChange={(event) => updateForm('end', event.target.value)}
                  data-testid={testId('arenas', 'partner', 'field', 'listing-end')}
                />
              </label>
              <TextInput
                label="Цена, ₽"
                value={form.price}
                onUpdate={(value) => updateForm('price', value)}
                data-testid={testId('arenas', 'partner', 'field', 'listing-price')}
              />
              <TextInput
                label="Контактный телефон"
                value={form.phone}
                onUpdate={(value) => updateForm('phone', value)}
                data-testid={testId('arenas', 'partner', 'field', 'listing-phone')}
              />
              <TextInput
                label="Комментарий"
                value={form.note}
                onUpdate={(value) => updateForm('note', value)}
                data-testid={testId('arenas', 'partner', 'field', 'listing-note')}
              />

              <div
                className="arena-partner-preview hockey-stack hockey-stack--gap-4"
                data-testid={testId('arenas', 'partner', 'panel', 'preview')}
              >
                <Text color="secondary">Превью для игрока</Text>
                <Text data-testid={testId('arenas', 'partner', 'text', 'preview-title')}>
                  {form.title.trim() || 'Название объявления'}
                </Text>
                <Text
                  color="secondary"
                  data-testid={testId('arenas', 'partner', 'text', 'preview-schedule')}
                >
                  {formatListingSchedule(
                    new Date(form.start).toISOString(),
                    new Date(form.end).toISOString(),
                  )}
                  {` · ${previewPrice}`}
                </Text>
              </div>

              {formError && (
                <Text
                  color="danger"
                  data-testid={testId('arenas', 'partner', 'error', 'listing-form')}
                >
                  {formError}
                </Text>
              )}
              {successMessage && (
                <div
                  className="hockey-stack hockey-stack--gap-4"
                  data-testid={testId('arenas', 'partner', 'text', 'listing-success')}
                >
                  <Text color="positive">{successMessage}</Text>
                  {lastPublishedId && (
                    <Link
                      to={`/arenas/${arena.id}`}
                      data-testid={testId('arenas', 'partner', 'link', 'view-published')}
                    >
                      <HockeyButton
                        view="flat"
                        size="s"
                        data-testid={testId('arenas', 'partner', 'btn', 'view-published')}
                      >
                        Открыть страницу арены
                      </HockeyButton>
                    </Link>
                  )}
                </div>
              )}

              <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
                <HockeyButton
                  view="action"
                  size="m"
                  loading={saveMutation.isPending}
                  disabled={!form.title.trim()}
                  onClick={() => submit('published')}
                  data-testid={testId('arenas', 'partner', 'btn', 'publish-now')}
                >
                  {editingId ? 'Сохранить и опубликовать' : 'Опубликовать'}
                </HockeyButton>
                <HockeyButton
                  view="outlined"
                  size="m"
                  loading={saveMutation.isPending}
                  disabled={!form.title.trim()}
                  onClick={() => submit('draft')}
                  data-testid={testId('arenas', 'partner', 'btn', 'create-listing')}
                >
                  {editingId ? 'Сохранить черновик' : 'Сохранить черновик'}
                </HockeyButton>
                {editingId && (
                  <HockeyButton
                    view="flat"
                    size="m"
                    onClick={() => resetForm()}
                    data-testid={testId('arenas', 'partner', 'btn', 'cancel-edit')}
                  >
                    Отмена
                  </HockeyButton>
                )}
              </div>
            </div>
          </IceCard>

          <IceCard padding="m">
            <div
              className="hockey-stack hockey-stack--gap-12"
              data-testid={testId('arenas', 'partner', 'panel', 'listings')}
            >
              <div className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap">
                <Text
                  variant="subheader-2"
                  data-testid={testId('arenas', 'partner', 'text', 'listings-title')}
                >
                  Список объявлений
                </Text>
                <div
                  className="hockey-row hockey-row--gap-8 hockey-row--wrap"
                  data-testid={testId('arenas', 'partner', 'panel', 'listing-filters')}
                >
                  {(Object.keys(FILTER_LABELS) as ListingFilter[]).map((key) => (
                    <HockeyButton
                      key={key}
                      view={listingFilter === key ? 'action' : 'flat'}
                      size="s"
                      onClick={() => setListingFilter(key)}
                      data-testid={testId('arenas', 'partner', 'btn', 'filter', key)}
                    >
                      {FILTER_LABELS[key]}
                    </HockeyButton>
                  ))}
                </div>
              </div>

              <div
                className="hockey-stack hockey-stack--gap-8"
                data-testid={testId('arenas', 'partner', 'list', 'listings')}
              >
                {listingsLoading && (
                  <Text
                    color="secondary"
                    data-testid={testId('arenas', 'partner', 'loader', 'listings')}
                  >
                    Загрузка объявлений...
                  </Text>
                )}
                {!listingsLoading && filteredListings.length === 0 && (
                  <Text
                    color="secondary"
                    data-testid={testId('arenas', 'partner', 'empty', 'listings')}
                  >
                    {listingFilter === 'all'
                      ? 'Объявлений пока нет — создайте первое выше.'
                      : 'В этом фильтре пока пусто.'}
                  </Text>
                )}
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="arena-partner-listing-row hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap"
                    data-testid={testId('arenas', 'partner', 'row', 'listing', listing.id)}
                  >
                    <div className="hockey-stack hockey-stack--gap-4">
                      <div className="hockey-row hockey-row--gap-8 hockey-row--align-center hockey-row--wrap">
                        <Text
                          data-testid={testId(
                            'arenas',
                            'partner',
                            'text',
                            'listing-name',
                            listing.id,
                          )}
                        >
                          {listing.title}
                        </Text>
                        <span
                          className={`arena-partner-status arena-partner-status--${listing.status}`}
                          data-testid={testId(
                            'arenas',
                            'partner',
                            'badge',
                            'listing-status',
                            listing.id,
                          )}
                        >
                          {STATUS_LABELS[listing.status]}
                        </span>
                      </div>
                      <Text
                        color="secondary"
                        data-testid={testId(
                          'arenas',
                          'partner',
                          'text',
                          'listing-schedule',
                          listing.id,
                        )}
                      >
                        {formatListingSchedule(listing.startsAt, listing.endsAt)}
                        {listing.priceRub != null
                          ? ` · ${listing.priceRub.toLocaleString('ru-RU')} ₽`
                          : ''}
                      </Text>
                      {listing.contactPhone && (
                        <Text
                          color="secondary"
                          data-testid={testId(
                            'arenas',
                            'partner',
                            'text',
                            'listing-contact',
                            listing.id,
                          )}
                        >
                          {listing.contactPhone}
                          {listing.contactNote ? ` · ${listing.contactNote}` : ''}
                        </Text>
                      )}
                    </div>
                    <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
                      <HockeyButton
                        view="flat"
                        size="s"
                        onClick={() => startEdit(listing)}
                        data-testid={testId('arenas', 'partner', 'btn', 'edit', listing.id)}
                      >
                        Изменить
                      </HockeyButton>
                      {listing.status !== 'published' && (
                        <HockeyButton
                          view="action"
                          size="s"
                          loading={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              listingId: listing.id,
                              status: 'published',
                            })
                          }
                          data-testid={testId('arenas', 'partner', 'btn', 'publish', listing.id)}
                        >
                          Опубликовать
                        </HockeyButton>
                      )}
                      {listing.status === 'published' && (
                        <HockeyButton
                          view="outlined"
                          size="s"
                          loading={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              listingId: listing.id,
                              status: 'archived',
                            })
                          }
                          data-testid={testId('arenas', 'partner', 'btn', 'archive', listing.id)}
                        >
                          Снять
                        </HockeyButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </IceCard>
        </>
      )}
    </div>
  )
}
