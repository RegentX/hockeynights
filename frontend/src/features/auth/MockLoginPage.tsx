/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-1.3.1, SPEC-FR-1.3.2, SPEC-FR-1.3.3, SPEC-FR-1.3.4
 */

import {useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Checkbox, Text, TextInput} from '@gravity-ui/uikit'
import {useNavigate} from 'react-router-dom'
import {submitOnboarding} from '@/features/auth/api/sessionApi'
import type {UserRole} from '@/entities/common/types'

const ROLE_OPTIONS: {value: UserRole; label: string; spec: string}[] = [
  {value: 'player', label: 'Игрок', spec: 'SPEC-FR-1.3.1'},
  {value: 'goalie', label: 'Вратарь', spec: 'SPEC-FR-1.3.2'},
  {value: 'captain', label: 'Капитан', spec: 'SPEC-FR-1.3.3'},
  {value: 'organizer', label: 'Организатор', spec: 'SPEC-FR-1.3.4'},
  {value: 'coach', label: 'Тренер', spec: 'SPEC-FR-1.3.6'},
]

/**
 * @spec SPEC-FR-2.1.1 - Mock-вход без реальной авторизации
 * @spec SPEC-FR-2.1.2 - Выбор ролей при onboarding
 */
export function MockLoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [displayName, setDisplayName] = useState('Иван Петров')
  const [roles, setRoles] = useState<UserRole[]>(['player'])

  const onboardingMutation = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['session']})
      navigate('/profile')
    },
  })

  /** @spec SPEC-FR-2.1.2 - Переключение роли */
  function toggleRole(role: UserRole, checked: boolean) {
    setRoles((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)))
  }

  /** @spec SPEC-FR-2.1.2 - Отправка onboarding */
  function handleSubmit() {
    if (!displayName.trim() || roles.length === 0) return
    onboardingMutation.mutate({displayName: displayName.trim(), roles})
  }

  return (
    <Card view="filled" className="hockey-form-shell hockey-form-shell--480">
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text variant="header-1">Hockey ID — вход</Text>
        <Text color="secondary">
          Mock-сессия Phase 1. Выберите роли и начните работу с профилем.
        </Text>

        <TextInput
          label="Имя"
          value={displayName}
          onUpdate={setDisplayName}
          size="l"
        />

        <div>
          <Text variant="subheader-2">Роли</Text>
          <div className="hockey-mt-8 hockey-stack hockey-stack--gap-8">
            {ROLE_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                checked={roles.includes(option.value)}
                onUpdate={(checked) => toggleRole(option.value, checked)}
                content={option.label}
              />
            ))}
          </div>
        </div>

        <Button
          view="action"
          size="l"
          loading={onboardingMutation.isPending}
          onClick={handleSubmit}
        >
          Войти в mock-сессию
        </Button>
      </div>
    </Card>
  )
}
