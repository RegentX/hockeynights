/** Валидация формы регистрации (Phase 1, клиентская) */

export interface RegisterFormValues {
  displayName: string
  email: string
  password: string
  passwordConfirm: string
  acceptTerms: boolean
}

export function validateRegisterForm(values: RegisterFormValues): string | null {
  const displayName = values.displayName.trim()
  const email = values.email.trim()

  if (displayName.length < 2) {
    return 'Введите имя (не менее 2 символов)'
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Введите корректный email'
  }
  if (values.password.length < 6) {
    return 'Пароль должен быть не короче 6 символов'
  }
  if (values.password !== values.passwordConfirm) {
    return 'Пароли не совпадают'
  }
  if (!values.acceptTerms) {
    return 'Примите условия использования'
  }
  return null
}
