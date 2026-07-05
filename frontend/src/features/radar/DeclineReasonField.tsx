/**
 * HOCFRONT-9 — причины отказа от игры.
 */

import {Text, TextInput} from '@gravity-ui/uikit'
import {useState} from 'react'

import {
  DECLINE_REASON_PRESETS,
  type DeclineReasonPresetId,
} from '@/features/radar/declineReasonPresets'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface DeclineReasonFieldProps {
  onConfirm: (reason: string) => void
  onCancel: () => void
  isPending?: boolean
}

export function DeclineReasonField({
  onConfirm,
  onCancel,
  isPending = false,
}: DeclineReasonFieldProps) {
  const [selected, setSelected] = useState<DeclineReasonPresetId | null>(null)
  const [customReason, setCustomReason] = useState('')

  function handleConfirm() {
    if (!selected) return
    const preset = DECLINE_REASON_PRESETS.find((item) => item.id === selected)
    const reason = selected === 'other' ? customReason.trim() : (preset?.label ?? '')
    if (!reason) return
    onConfirm(reason)
  }

  const canConfirm = selected && (selected !== 'other' || customReason.trim().length > 0)

  return (
    <div
      className="decline-reason-field hockey-stack hockey-stack--gap-10"
      data-testid={testId('radar', 'decline-reason', 'panel')}
    >
      <Text color="secondary" data-testid={testId('radar', 'decline-reason', 'text', 'hint')}>
        Укажите причину — капитан увидит её в составе.
      </Text>
      <div
        className="decline-reason-field__options hockey-row hockey-row--gap-8 hockey-row--wrap"
        data-testid={testId('radar', 'decline-reason', 'list', 'options')}
      >
        {DECLINE_REASON_PRESETS.map((reason) => (
          <HockeyButton
            key={reason.id}
            size="s"
            view={selected === reason.id ? 'action' : 'outlined'}
            onClick={() => setSelected(reason.id)}
            disabled={isPending}
            data-testid={testId('radar', 'decline-reason', 'btn', reason.id)}
          >
            {reason.label}
          </HockeyButton>
        ))}
      </div>
      {selected === 'other' && (
        <TextInput
          placeholder="Своя причина"
          value={customReason}
          onUpdate={setCustomReason}
          size="l"
          data-testid={testId('radar', 'decline-reason', 'field', 'custom')}
        />
      )}
      <div className="hockey-row hockey-row--gap-8">
        <HockeyButton
          view="outlined"
          size="m"
          onClick={onCancel}
          disabled={isPending}
          data-testid={testId('radar', 'decline-reason', 'btn', 'cancel')}
        >
          Отмена
        </HockeyButton>
        <HockeyButton
          view="action"
          size="m"
          onClick={handleConfirm}
          disabled={!canConfirm || isPending}
          loading={isPending}
          data-testid={testId('radar', 'decline-reason', 'btn', 'confirm')}
        >
          Подтвердить отказ
        </HockeyButton>
      </div>
    </div>
  )
}
