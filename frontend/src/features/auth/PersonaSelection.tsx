/**
 * SPEC-FR-2.1.2, SPEC-FR-25.1.2
 * Выбор демо-роли после входа или регистрации.
 */

import {useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {useNavigate} from 'react-router-dom'
import {submitOnboarding} from '@/features/auth/api/sessionApi'
import {PERSONA_PRESETS, type PersonaPreset} from '@/features/auth/personaPresets'
import {resolvePostLoginPath} from '@/features/auth/resolvePostLoginPath'
import {getPendingLocalUser} from '@/features/auth/localAuthMemory'
import type {OnboardingPayload} from '@/entities/user/types'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

export interface PersonaSelectionProps {
  isSwitching?: boolean
  onBackToCredentials?: () => void
}

export function PersonaSelection({isSwitching = false, onBackToCredentials}: PersonaSelectionProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const onboardingMutation = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: (nextSession, variables) => {
      setError(null)
      queryClient.setQueryData(['session'], nextSession)
      void queryClient.invalidateQueries({queryKey: ['session']})
      navigate(resolvePostLoginPath(variables), {replace: true})
    },
    onError: (err: Error) => {
      setError(err.message || 'Не удалось сохранить выбранную роль')
    },
  })

  function buildPayload(preset: PersonaPreset): OnboardingPayload {
    const pending = getPendingLocalUser()
    if (!pending) return preset.payload
    return {...preset.payload, displayName: pending.displayName}
  }

  function selectPersona(preset: PersonaPreset) {
    setError(null)
    onboardingMutation.mutate(buildPayload(preset))
  }

  return (
    <section
      className="auth-form auth-form--personas"
      aria-label="Выбор роли"
      data-testid={testId('auth', 'persona', 'panel', 'main')}
    >
      <Text variant="subheader-2" data-testid={testId('auth', 'persona', 'text', 'title')}>
        Выберите демо-роль
      </Text>
      <Text color="secondary" data-testid={testId('auth', 'persona', 'text', 'hint')}>
        Каждая карточка открывает свой режим интерфейса. Выбор сохранится после обновления страницы.
      </Text>

      <div className="persona-card-grid" data-testid={testId('auth', 'persona', 'grid', 'cards')}>
        {PERSONA_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="persona-card"
            aria-label={`${preset.title}. ${preset.description}. ${preset.destination}`}
            disabled={onboardingMutation.isPending}
            onClick={() => selectPersona(preset)}
            data-testid={testId('auth', 'persona', 'btn', preset.id)}
          >
            <span className="persona-card__icon" aria-hidden>
              {preset.icon}
            </span>
            <span className="persona-card__title">{preset.title}</span>
            <span className="persona-card__description">{preset.description}</span>
            <span className="persona-card__destination">→ {preset.destination}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="auth-alert auth-alert--error" data-testid={testId('auth', 'persona', 'text', 'error')}>
          {error}
        </div>
      )}

      {!isSwitching && onBackToCredentials && (
        <HockeyButton
          view="flat"
          size="s"
          onClick={onBackToCredentials}
          data-testid={testId('auth', 'persona', 'btn', 'back-credentials')}
        >
          Назад
        </HockeyButton>
      )}
    </section>
  )
}
