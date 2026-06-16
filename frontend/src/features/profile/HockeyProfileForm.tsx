/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.3, SPEC-FR-2.2.4
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Progress, Select, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {fetchMyProfile, updateMyProfile} from '@/features/profile/api/profileApi'
import type {HockeyProfile} from '@/entities/profile/types'
import type {PlayerPosition, SkillLevel} from '@/entities/common/types'
import {KarmaHint} from '@/features/karma/KarmaHint'
import {KarmaScore} from '@/features/karma/KarmaScore'

const POSITION_OPTIONS = [
  {value: 'forward', content: 'Нападающий'},
  {value: 'defense', content: 'Защитник'},
  {value: 'goalie', content: 'Вратарь'},
]

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
]

function HockeyProfileFormFields({profile}: {profile: HockeyProfile}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Partial<HockeyProfile>>(profile)

  const saveMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['profile']})
    },
  })

  /** @spec SPEC-FR-2.2.2 - Обновление поля профиля */
  function updateField<K extends keyof HockeyProfile>(key: K, value: HockeyProfile[K]) {
    setForm((prev) => ({...prev, [key]: value}))
  }

  /** @spec SPEC-FR-2.2.1 - Сохранение профиля */
  function handleSave() {
    saveMutation.mutate(form)
  }

  return (
    <Card view="filled" className="hockey-form-shell">
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text variant="header-1">Hockey ID</Text>

        <div>
          <Text color="secondary">Заполненность профиля</Text>
          <Progress value={profile.profileCompleteness} text={`${profile.profileCompleteness}%`} />
        </div>

        <div className="hockey-stack hockey-stack--gap-4">
          <KarmaScore score={profile.karmaScore} size="m" />
          <KarmaHint />
        </div>

        {profile.achievements && profile.achievements.length > 0 && (
          <div className="hockey-stack hockey-stack--gap-4">
            <Text color="secondary">Микро-ачивки</Text>
            <ul className="hockey-list hockey-list--chips">
              {profile.achievements.map((ach) => (
                <li key={ach} className="hockey-chip">
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        )}

        <TextInput
          label="ФИО"
          value={form.fullName ?? ''}
          onUpdate={(v) => updateField('fullName', v)}
        />
        <TextInput
          label="Город"
          value={form.city ?? ''}
          onUpdate={(v) => updateField('city', v)}
        />
        <TextInput
          label="Район"
          value={form.district ?? ''}
          onUpdate={(v) => updateField('district', v)}
        />
        <TextInput
          label="Метро"
          value={form.metro ?? ''}
          onUpdate={(v) => updateField('metro', v)}
        />

        <Select
          label="Амплуа"
          value={[form.position ?? 'forward']}
          onUpdate={(v) => updateField('position', v[0] as PlayerPosition)}
          options={POSITION_OPTIONS}
        />

        <Select
          label="Уровень"
          value={[form.skillLevel ?? 'amateur']}
          onUpdate={(v) => updateField('skillLevel', v[0] as SkillLevel)}
          options={SKILL_OPTIONS}
        />

        <div>
          <Text color="secondary">О себе</Text>
          <TextArea
            value={form.bio ?? ''}
            onUpdate={(v) => updateField('bio', v)}
            minRows={3}
          />
        </div>

        <Text color="secondary">
          Предпочитаемые арены: {(form.preferredArenaIds ?? []).join(', ') || 'не выбраны'}
        </Text>

        <Button view="action" loading={saveMutation.isPending} onClick={handleSave}>
          Сохранить профиль
        </Button>
      </div>
    </Card>
  )
}

/**
 * @spec SPEC-FR-2.2.1 - Форма создания и редактирования Hockey ID
 * @spec SPEC-FR-2.2.4 - Отображение заполненности профиля
 */
export function HockeyProfileForm() {
  const {data: profile, isLoading} = useQuery({queryKey: ['profile'], queryFn: fetchMyProfile})

  if (isLoading || !profile) {
    return <Text>Загрузка профиля...</Text>
  }

  return <HockeyProfileFormFields key={profile.userId} profile={profile} />
}
