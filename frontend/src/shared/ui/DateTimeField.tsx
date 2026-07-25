/**
 * HOCFRONT-25 — удобный выбор даты и времени без ручного ISO
 */

import {Text} from '@gravity-ui/uikit'

import {joinDateTimeLocal, splitDateTimeLocal} from '@/shared/lib/datetimeLocal'
import {testId} from '@/shared/testing/testId'

export interface DateTimeFieldProps {
  label: string
  value: string
  onChange: (isoLocal: string) => void
  testIdScope?: string
  testIdComponent?: string
  testIdQualifier: string
}

export function DateTimeField({
  label,
  value,
  onChange,
  testIdScope = 'clubs',
  testIdComponent = 'datetime',
  testIdQualifier,
}: DateTimeFieldProps) {
  const {date, time} = splitDateTimeLocal(value)

  return (
    <div
      className="datetime-field hockey-stack hockey-stack--gap-6"
      data-testid={testId(testIdScope, testIdComponent, 'panel', testIdQualifier)}
    >
      <Text
        variant="body-2"
        data-testid={testId(testIdScope, testIdComponent, 'text', 'label', testIdQualifier)}
      >
        {label}
      </Text>
      <div className="datetime-field__row hockey-row hockey-row--gap-8">
        <input
          type="date"
          className="g-text-input__control datetime-field__control"
          value={date}
          onChange={(event) => onChange(joinDateTimeLocal(event.target.value, time || '19:00'))}
          data-testid={testId(testIdScope, testIdComponent, 'field', 'date', testIdQualifier)}
        />
        <input
          type="time"
          className="g-text-input__control datetime-field__control"
          value={time}
          onChange={(event) => onChange(joinDateTimeLocal(date, event.target.value))}
          data-testid={testId(testIdScope, testIdComponent, 'field', 'time', testIdQualifier)}
        />
      </div>
    </div>
  )
}
