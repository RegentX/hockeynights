import {ChevronDown} from 'lucide-react'

import {cn} from '@/shared/lib/cn'

export type MagicSelectOption = {value: string; content: string}

interface MagicSelectFieldProps {
  value: string
  onChange: (value: string) => void
  options: readonly MagicSelectOption[]
  testId: string
  className?: string
}

export function MagicSelectField({
  value,
  onChange,
  options,
  testId,
  className,
}: MagicSelectFieldProps) {
  return (
    <div className="magic-select-wrap">
      <select
        className={cn('magic-filter-control', 'magic-select-wrap__control', className)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.content}
          </option>
        ))}
      </select>
      <ChevronDown className="magic-select-wrap__chevron" size={16} aria-hidden />
    </div>
  )
}
