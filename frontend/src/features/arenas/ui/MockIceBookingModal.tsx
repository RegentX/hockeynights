/**
 * SPEC-FR-6.4.2, SPEC-FR-6.2.2
 */

import {Button, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation} from '@tanstack/react-query'
import {useState} from 'react'

import type {IceSlot} from '@/entities/arena'
import type {Arena} from '@/entities/arena'
import type {IceBookingRequest} from '@/entities/external-flow'
import {submitIceBooking} from '@/entities/external-flow'
import {testId} from '@/shared/testing/testId'
import {MockExternalFlowDialog} from '@/shared/ui/MockExternalFlowDialog'

/** @spec SPEC-FR-6.4.2 - Props mock-бронирования */
export interface MockIceBookingModalProps {
  /** @spec SPEC-FR-6.4.2 */
  open: boolean
  /** @spec SPEC-FR-6.4.2 */
  onClose: () => void
  /** @spec SPEC-FR-6.2.1 */
  arena: Arena
  /** @spec SPEC-FR-6.3.1 */
  slot?: IceSlot
}

/**
 * @spec SPEC-FR-6.4.2 - Mock-мастер записи на лёд
 * @spec SPEC-FR-6.2.2 - Замена мёртвой внешней ссылки на кликабельный сценарий
 */
export function MockIceBookingModal({open, onClose, arena, slot}: MockIceBookingModalProps) {
  const [phone, setPhone] = useState('+7 (999) 000-00-00')
  const [comment, setComment] = useState('')
  const [result, setResult] = useState<IceBookingRequest | null>(null)

  const mutation = useMutation({
    mutationFn: submitIceBooking,
    onSuccess: (booking) => setResult(booking),
  })

  function handleClose() {
    setResult(null)
    mutation.reset()
    onClose()
  }

  function handleSubmit() {
    mutation.mutate({
      arenaId: arena.id,
      slotId: slot?.id,
      contactPhone: phone,
      comment: comment || undefined,
    })
  }

  const externalUrl = slot?.bookingUrl ?? arena.bookingUrl

  return (
    <MockExternalFlowDialog
      open={open}
      onClose={handleClose}
      flowType="ice_booking"
      partnerName={arena.name}
      externalUrl={externalUrl}
      footer={
        result ? (
          <Button
            view="action"
            onClick={handleClose}
            data-testid={testId('arenas', 'ice-booking', 'modal', 'btn', 'done')}
          >
            Готово
          </Button>
        ) : (
          <>
            <Button
              view="flat"
              onClick={handleClose}
              data-testid={testId('arenas', 'ice-booking', 'modal', 'btn', 'cancel')}
            >
              Отмена
            </Button>
            <Button
              view="action"
              loading={mutation.isPending}
              onClick={handleSubmit}
              data-testid={testId('arenas', 'ice-booking', 'modal', 'btn', 'submit')}
            >
              Отправить заявку
            </Button>
          </>
        )
      }
    >
      <div data-testid={testId('arenas', 'ice-booking', 'modal')}>
        {result ? (
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('arenas', 'ice-booking', 'modal', 'panel', 'success')}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('arenas', 'ice-booking', 'modal', 'text', 'success-title')}
            >
              Заявка принята (mock)
            </Text>
            <Text
              data-testid={testId('arenas', 'ice-booking', 'modal', 'text', 'confirmation-code')}
            >
              Код подтверждения: {result.confirmationCode}
            </Text>
            {result.slotLabel && (
              <Text
                color="secondary"
                data-testid={testId('arenas', 'ice-booking', 'modal', 'text', 'slot-label')}
              >
                Слот: {result.slotLabel}
              </Text>
            )}
            <Text
              color="secondary"
              data-testid={testId('arenas', 'ice-booking', 'modal', 'text', 'phase-note')}
            >
              В Phase 2 заявка уйдёт на портал аренды. Сейчас это только демонстрация UX.
            </Text>
          </div>
        ) : (
          <div
            className="hockey-stack hockey-stack--gap-12"
            data-testid={testId('arenas', 'ice-booking', 'modal', 'panel', 'form')}
          >
            <Text
              color="secondary"
              data-testid={testId('arenas', 'ice-booking', 'modal', 'text', 'address')}
            >
              {arena.address}
            </Text>
            {slot ? (
              <Text data-testid={testId('arenas', 'ice-booking', 'modal', 'text', 'slot')}>
                Слот: {new Date(slot.startsAt).toLocaleString('ru-RU')}
                {slot.price ? ` · ${slot.price} RUB` : ''}
              </Text>
            ) : (
              <Text
                color="secondary"
                data-testid={testId('arenas', 'ice-booking', 'modal', 'text', 'general-request')}
              >
                Общая заявка на аренду льда без привязки к слоту
              </Text>
            )}
            <TextInput
              label="Телефон для связи"
              value={phone}
              onUpdate={setPhone}
              data-testid={testId('arenas', 'ice-booking', 'modal', 'field', 'phone')}
            />
            <div>
              <Text
                color="secondary"
                data-testid={testId('arenas', 'ice-booking', 'modal', 'text', 'comment-label')}
              >
                Комментарий
              </Text>
              <TextArea
                value={comment}
                onUpdate={setComment}
                minRows={2}
                data-testid={testId('arenas', 'ice-booking', 'modal', 'field', 'comment')}
              />
            </div>
            {mutation.isError && (
              <Text
                color="danger"
                data-testid={testId('arenas', 'ice-booking', 'modal', 'text', 'error')}
              >
                Не удалось отправить заявку
              </Text>
            )}
          </div>
        )}
      </div>
    </MockExternalFlowDialog>
  )
}
