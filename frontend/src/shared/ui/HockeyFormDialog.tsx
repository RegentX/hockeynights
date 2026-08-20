/**
 * SPEC-UI-1.3 — единый диалог-форма (профиль, мессенджер, настройки).
 */

import {Dialog} from '@gravity-ui/uikit'
import type {ReactNode} from 'react'

export interface HockeyFormDialogProps {
  open: boolean
  onClose: () => void
  caption: string
  /** Подпись под заголовком — контекст диалога (название канала, роль). */
  description?: ReactNode
  /** Кнопки подвала; выравниваются вправо, на мобильном растягиваются на всю ширину. */
  footer?: ReactNode
  /** `l` по умолчанию — как у диалога редактирования профиля. */
  maxWidth?: 's' | 'm' | 'l'
  children: ReactNode
  'data-testid'?: string
  bodyId?: string
}

/**
 * Обёртка над `Dialog` с оформлением профиля: скруглённые поля и кнопки,
 * скроллируемое тело, подвал с переносом на мобильном.
 * Секции внутри верстаются через `hockey-form-dialog__section`.
 */
export function HockeyFormDialog({
  open,
  onClose,
  caption,
  description,
  footer,
  maxWidth = 'l',
  children,
  bodyId,
  'data-testid': dataTestId,
}: HockeyFormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      className="hockey-form-dialog"
      modalClassName="hockey-form-dialog-modal"
      contentOverflow="auto"
      data-testid={dataTestId}
    >
      <Dialog.Header caption={caption} />
      <Dialog.Body>
        {description != null && <p className="hockey-form-dialog__description">{description}</p>}
        <div id={bodyId} className="hockey-stack hockey-stack--gap-16 hockey-form-dialog__body">
          {children}
        </div>
      </Dialog.Body>
      {footer != null && <Dialog.Footer>{footer}</Dialog.Footer>}
    </Dialog>
  )
}

export interface HockeyFormSectionProps {
  title: string
  /** `grid` — две колонки полей, `stack` — вертикальный список. */
  layout?: 'grid' | 'stack'
  children: ReactNode
  'data-testid'?: string
}

/** Секция формы: заголовок + сетка полей — как `profile-hub__edit-section`. */
export function HockeyFormSection({
  title,
  layout = 'grid',
  children,
  'data-testid': dataTestId,
}: HockeyFormSectionProps) {
  return (
    <div className="hockey-form-dialog__section" data-testid={dataTestId}>
      <p className="hockey-form-dialog__section-title">{title}</p>
      <div
        className={
          layout === 'grid' ? 'hockey-form-dialog__grid' : 'hockey-stack hockey-stack--gap-12'
        }
      >
        {children}
      </div>
    </div>
  )
}
