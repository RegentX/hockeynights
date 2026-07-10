import {CalendarDays, ChevronLeft, ChevronRight, X} from 'lucide-react'
import {useEffect, useMemo, useRef, useState} from 'react'

import {cn} from '@/shared/lib/cn'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

interface MagicDatePickerProps {
  value: string
  onChange: (value: string) => void
  testId: string
  placeholder?: string
}

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseIsoDate(value: string): Date | null {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function formatDisplayDate(value: string): string {
  const date = parseIsoDate(value)
  if (!date) return ''
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function buildCalendarDays(viewDate: Date): Array<{iso: string; day: number; inMonth: boolean}> {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const cells: Array<{iso: string; day: number; inMonth: boolean}> = []

  for (let index = startOffset - 1; index >= 0; index -= 1) {
    const day = daysInPrevMonth - index
    const date = new Date(year, month - 1, day)
    cells.push({iso: toLocalIsoDate(date), day, inMonth: false})
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day)
    cells.push({iso: toLocalIsoDate(date), day, inMonth: true})
  }

  let trailingDay = 1
  while (cells.length % 7 !== 0) {
    const date = new Date(year, month + 1, trailingDay)
    cells.push({iso: toLocalIsoDate(date), day: trailingDay, inMonth: false})
    trailingDay += 1
  }

  return cells
}

export function MagicDatePicker({
  value,
  onChange,
  testId,
  placeholder = 'Выберите дату',
}: MagicDatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => parseIsoDate(value) ?? new Date())

  const monthLabel = viewDate.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate])
  const displayValue = formatDisplayDate(value)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev
      if (next) {
        setViewDate(parseIsoDate(value) ?? new Date())
      }
      return next
    })
  }

  function selectDate(iso: string) {
    onChange(iso)
    setOpen(false)
  }

  return (
    <div className="magic-date-picker" ref={rootRef}>
      <div
        className={cn(
          'magic-filter-control',
          'magic-date-picker__trigger',
          !displayValue && 'magic-date-picker__trigger--empty',
        )}
      >
        <button
          type="button"
          className="magic-date-picker__open"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={toggleOpen}
          data-testid={testId}
        >
          <CalendarDays className="magic-date-picker__trigger-icon" size={16} aria-hidden />
          <span className="magic-date-picker__trigger-text">
            {displayValue || placeholder}
          </span>
        </button>
        {value && (
          <button
            type="button"
            className="magic-date-picker__clear"
            aria-label="Очистить дату"
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            <X size={14} aria-hidden />
          </button>
        )}
      </div>

      {open && (
        <div className="magic-date-picker__popover" role="dialog" aria-label="Выбор даты">
          <div className="magic-date-picker__header">
            <button
              type="button"
              className="magic-date-picker__nav"
              aria-label="Предыдущий месяц"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <span className="magic-date-picker__month">{monthLabel}</span>
            <button
              type="button"
              className="magic-date-picker__nav"
              aria-label="Следующий месяц"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>

          <div className="magic-date-picker__weekdays">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className="magic-date-picker__weekday">
                {weekday}
              </span>
            ))}
          </div>

          <div className="magic-date-picker__grid">
            {calendarDays.map((cell) => (
              <button
                key={cell.iso}
                type="button"
                className={cn(
                  'magic-date-picker__day',
                  !cell.inMonth && 'magic-date-picker__day--muted',
                  value === cell.iso && 'magic-date-picker__day--selected',
                )}
                onClick={() => selectDate(cell.iso)}
              >
                {cell.day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
