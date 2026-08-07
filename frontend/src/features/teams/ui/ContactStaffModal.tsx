/**
 * HOCFRONT-25 / TASK-04-05 — связаться со штабом
 */

import {Dialog, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation} from '@tanstack/react-query'
import {useState} from 'react'

import {submitStaffContactRequest} from '@/entities/team'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface ContactStaffModalProps {
  open: boolean
  onClose: () => void
  teamId: string
  teamName: string
  clubName?: string
}

/** HOCFRONT-25 — модалка заявки в штаб (MVP без мессенджера) */
export function ContactStaffModal({
  open,
  onClose,
  teamId,
  teamName,
  clubName,
}: ContactStaffModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const resetAndClose = () => {
    setName('')
    setEmail('')
    setMessage('')
    setSuccess(false)
    onClose()
  }

  const submitMutation = useMutation({
    mutationFn: () =>
      submitStaffContactRequest(teamId, {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      }),
    onSuccess: () => {
      setSuccess(true)
      window.setTimeout(() => {
        resetAndClose()
      }, 900)
    },
  })

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim() || submitMutation.isPending) return
    submitMutation.mutate()
  }

  const targetLabel = clubName ? `${teamName} · ${clubName}` : teamName
  const canSubmit = Boolean(name.trim() && email.trim() && message.trim())

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      size="m"
      data-testid={testId('teams', 'contact-staff', 'modal')}
    >
      <Dialog.Header
        caption="Связаться со штабом"
        data-testid={testId('teams', 'contact-staff', 'header')}
      />
      <Dialog.Body>
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('teams', 'contact-staff', 'panel', 'form')}
        >
          <Text color="secondary" data-testid={testId('teams', 'contact-staff', 'text', 'target')}>
            Заявка для: {targetLabel}
          </Text>
          {success ? (
            <Text
              color="positive"
              data-testid={testId('teams', 'contact-staff', 'text', 'success')}
            >
              Сообщение отправлено. Штаб свяжется с вами.
            </Text>
          ) : (
            <>
              <TextInput
                label="Имя"
                value={name}
                onUpdate={setName}
                data-testid={testId('teams', 'contact-staff', 'field', 'name')}
              />
              <TextInput
                label="Email"
                type="email"
                value={email}
                onUpdate={setEmail}
                data-testid={testId('teams', 'contact-staff', 'field', 'email')}
              />
              <div>
                <Text
                  color="secondary"
                  data-testid={testId('teams', 'contact-staff', 'text', 'message-label')}
                >
                  Сообщение
                </Text>
                <TextArea
                  value={message}
                  onUpdate={setMessage}
                  rows={4}
                  data-testid={testId('teams', 'contact-staff', 'field', 'message')}
                />
              </div>
              {submitMutation.isError && (
                <Text color="danger" data-testid={testId('teams', 'contact-staff', 'error')}>
                  {submitMutation.error instanceof Error
                    ? submitMutation.error.message
                    : 'Не удалось отправить заявку'}
                </Text>
              )}
            </>
          )}
        </div>
      </Dialog.Body>
      <Dialog.Footer data-testid={testId('teams', 'contact-staff', 'footer')}>
        <HockeyButton
          view="outlined"
          size="s"
          onClick={resetAndClose}
          data-testid={testId('teams', 'contact-staff', 'btn', 'cancel')}
        >
          Закрыть
        </HockeyButton>
        {!success && (
          <HockeyButton
            size="s"
            loading={submitMutation.isPending}
            disabled={!canSubmit}
            onClick={handleSubmit}
            data-testid={testId('teams', 'contact-staff', 'btn', 'submit')}
          >
            Отправить
          </HockeyButton>
        )}
      </Dialog.Footer>
    </Dialog>
  )
}
