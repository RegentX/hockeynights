/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-1.3.1, SPEC-FR-1.3.6
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Checkbox, Text, TextInput} from '@gravity-ui/uikit'
import {Link, useNavigate} from 'react-router-dom'
import {fetchSession, submitOnboarding} from '@/features/auth/api/sessionApi'
import {DEMO_PARTNER_MEMBERSHIPS, partnerCabinetPath} from '@/features/partners/constants'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import type {UserRole} from '@/entities/common/types'
import type {OnboardingPayload, PartnerMembership} from '@/entities/user/types'
import {testId} from '@/shared/testing/testId'

const ROLE_OPTIONS: {value: UserRole; label: string; spec: string}[] = [
  {value: 'player', label: 'Игрок', spec: 'SPEC-FR-1.3.1'},
  {value: 'goalie', label: 'Вратарь', spec: 'SPEC-FR-1.3.2'},
  {value: 'captain', label: 'Капитан', spec: 'SPEC-FR-1.3.3'},
  {value: 'organizer', label: 'Организатор', spec: 'SPEC-FR-1.3.4'},
  {value: 'coach', label: 'Тренер', spec: 'SPEC-FR-1.3.6'},
  {value: 'admin', label: 'Администратор', spec: 'SPEC-FR-1.3.5'},
]

const PARTNER_OPTIONS: PartnerMembership[] = DEMO_PARTNER_MEMBERSHIPS

/**
 * @spec SPEC-FR-2.1.1 - Mock-вход без реальной авторизации
 * @spec SPEC-FR-2.1.2 - Выбор ролей при onboarding
 */
export function MockLoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [displayName, setDisplayName] = useState('Иван Петров')
  const [roles, setRoles] = useState<UserRole[]>(['player'])
  const [partnerIds, setPartnerIds] = useState<string[]>([])

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  const onboardingMutation = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: (nextSession, variables) => {
      queryClient.setQueryData(['session'], nextSession)
      void queryClient.invalidateQueries({queryKey: ['session']})
      navigate(resolvePostLoginPath(variables), {replace: true})
    },
  })

  function resolvePostLoginPath(payload: OnboardingPayload): string {
    const memberships = payload.partnerMemberships ?? []
    if (memberships.length === 1) {
      return partnerCabinetPath(memberships[0])
    }
    if (memberships.length > 0 && memberships.every((m) => m.kind === 'shop')) {
      return partnerCabinetPath(memberships[0])
    }
    if (memberships.length > 0 && memberships.every((m) => m.kind === 'league')) {
      return partnerCabinetPath(memberships[0])
    }
    if (memberships.length > 0) {
      return '/partner'
    }
    if (payload.roles.includes('coach') && !payload.roles.includes('player')) {
      return '/profile'
    }
    if (payload.roles.includes('admin')) {
      return '/admin'
    }
    return '/profile'
  }

  function enter(payload: OnboardingPayload) {
    onboardingMutation.mutate(payload)
  }

  /** @spec SPEC-FR-2.1.2 - Переключение роли */
  function toggleRole(role: UserRole, checked: boolean) {
    setRoles((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)))
  }

  function togglePartner(entityId: string, checked: boolean) {
    setPartnerIds((prev) =>
      checked ? [...prev, entityId] : prev.filter((id) => id !== entityId),
    )
  }

  /** @spec SPEC-FR-2.1.2 - Отправка onboarding */
  function handleSubmit() {
    if (!displayName.trim() || roles.length === 0) return
    const partnerMemberships = PARTNER_OPTIONS.filter((item) => partnerIds.includes(item.entityId))
    enter({displayName: displayName.trim(), roles, partnerMemberships})
  }

  const isSwitching = session?.isOnboarded

  return (
    <Card view="filled" className="hockey-form-shell hockey-form-shell--480" data-testid={testId('auth', 'login', 'page')}>
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text variant="header-1" data-testid={testId('auth', 'login', 'text', 'title')}>Hockey Nights</Text>
        {isSwitching ? (
          <Text color="secondary" data-testid={testId('auth', 'login', 'text', 'switching-hint')}>
            Сейчас вы вошли как <strong>{session.user.displayName}</strong>
            {session.user.partnerMemberships?.length
              ? ` · партнёр: ${session.user.partnerMemberships.map((m) => m.entityName).join(', ')}`
              : ''}
            . Выберите другую роль ниже — переключение без выхода.
          </Text>
        ) : (
          <Text color="secondary" data-testid={testId('auth', 'login', 'text', 'hint')}>
            Выберите роль и войдите в mock-демо.
          </Text>
        )}

        {isSwitching && (
          <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
            <Link to="/profile" data-testid={testId('auth', 'login', 'link', 'continue')}>
              <HockeyButton view="outlined" size="s" data-testid={testId('auth', 'login', 'btn', 'continue')}>Продолжить в приложении</HockeyButton>
            </Link>
          </div>
        )}

        <div className="hockey-stack hockey-stack--gap-8">
          <Text variant="subheader-2" data-testid={testId('auth', 'login', 'text', 'quick-login-title')}>{isSwitching ? 'Переключить роль' : 'Быстрый вход'}</Text>
          <Button
            view="action"
            size="l"
            loading={onboardingMutation.isPending}
            onClick={() =>
              enter({displayName: 'Иван Петров', roles: ['player'], partnerMemberships: []})
            }
            data-testid={testId('auth', 'login', 'btn', 'player')}
          >
            Войти как игрок
          </Button>
          <Button
            view="action"
            size="l"
            loading={onboardingMutation.isPending}
            onClick={() =>
              enter({displayName: 'Алексей Тренеров', roles: ['coach'], partnerMemberships: []})
            }
            data-testid={testId('auth', 'login', 'btn', 'coach')}
          >
            Войти как тренер
          </Button>
          <Button
            view="outlined"
            size="l"
            loading={onboardingMutation.isPending}
            onClick={() => enter({
              displayName: 'Партнёр магазина',
              roles: ['organizer'],
              partnerMemberships: [PARTNER_OPTIONS.find((m) => m.kind === 'shop')!],
            })}
            data-testid={testId('auth', 'login', 'btn', 'shop-partner')}
          >
            Войти как представитель магазина
          </Button>
          <Button
            view="outlined"
            size="l"
            loading={onboardingMutation.isPending}
            onClick={() => enter({
              displayName: 'Партнёр лиги',
              roles: ['organizer'],
              partnerMemberships: [PARTNER_OPTIONS.find((m) => m.kind === 'league')!],
            })}
            data-testid={testId('auth', 'login', 'btn', 'league-partner')}
          >
            Войти как представитель лиги
          </Button>
        </div>

        <Text variant="subheader-2" data-testid={testId('auth', 'login', 'text', 'manual-title')}>Настроить вход вручную</Text>

        <TextInput
          label="Имя"
          value={displayName}
          onUpdate={setDisplayName}
          size="l"
          data-testid={testId('auth', 'login', 'field', 'display-name')}
        />

        <div>
          <Text variant="subheader-2" data-testid={testId('auth', 'login', 'text', 'roles-title')}>Роли</Text>
          <div className="hockey-mt-8 hockey-stack hockey-stack--gap-8">
            {ROLE_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                checked={roles.includes(option.value)}
                onUpdate={(checked) => toggleRole(option.value, checked)}
                content={option.label}
                data-testid={testId('auth', 'login', 'checkbox', 'role', option.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <Text variant="subheader-2" data-testid={testId('auth', 'login', 'text', 'partner-title')}>Партнёрский доступ (mock)</Text>
          <div className="hockey-mt-8 hockey-stack hockey-stack--gap-8">
            {PARTNER_OPTIONS.map((option) => (
              <Checkbox
                key={option.entityId}
                checked={partnerIds.includes(option.entityId)}
                onUpdate={(checked) => togglePartner(option.entityId, checked)}
                content={
                  option.kind === 'league'
                    ? `Представитель лиги: ${option.entityName}`
                    : `Представитель магазина: ${option.entityName}`
                }
                data-testid={testId('auth', 'login', 'checkbox', 'partner', option.entityId)}
              />
            ))}
          </div>
        </div>

        <Button
          view="outlined"
          size="l"
          loading={onboardingMutation.isPending}
          onClick={handleSubmit}
          data-testid={testId('auth', 'login', 'btn', 'submit')}
        >
          {isSwitching ? 'Переключиться с выбранными настройками' : 'Войти с выбранными настройками'}
        </Button>
      </div>
    </Card>
  )
}
