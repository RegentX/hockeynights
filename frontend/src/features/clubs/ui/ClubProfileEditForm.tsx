/**
 * HOCFRONT-25 / TASK-04-08 — редактирование профиля и штаба клуба
 */

import {Select, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {Club, ClubStaffMember} from '@/entities/club'
import {updateClubProfile} from '@/entities/club'
import {STAFF_ROLE_LABELS, STAFF_ROLE_OPTIONS} from '@/features/teams'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface ClubProfileEditFormProps {
  club: Club
}

function emptyStaff(): ClubStaffMember {
  return {
    userId: `staff-${Date.now()}`,
    displayName: '',
    role: 'manager',
    contactEmail: '',
    contactPhone: '',
  }
}

/** HOCFRONT-25 — форма публичного профиля клуба и штаба */
export function ClubProfileEditForm({club}: ClubProfileEditFormProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(club.name)
  const [description, setDescription] = useState(club.description ?? '')
  const [contactEmail, setContactEmail] = useState(club.contactEmail ?? '')
  const [contactPhone, setContactPhone] = useState(club.contactPhone ?? '')
  const [staff, setStaff] = useState<ClubStaffMember[]>(club.staff)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: () =>
      updateClubProfile(club.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        staff: staff.filter((member) => member.displayName.trim()),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['club', club.id]})
      setStatusMessage('Профиль клуба сохранён.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить профиль')
    },
  })

  const updateStaff = (index: number, patch: Partial<ClubStaffMember>) => {
    setStaff((prev) => prev.map((member, i) => (i === index ? {...member, ...patch} : member)))
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('clubs', 'profile-edit', 'form', club.id)}
    >
      <div className="hockey-stack hockey-stack--gap-10">
        <Text
          variant="subheader-2"
          data-testid={testId('clubs', 'profile-edit', 'text', 'title', club.id)}
        >
          Профиль клуба
        </Text>
        <TextInput
          label="Название"
          value={name}
          onUpdate={setName}
          data-testid={testId('clubs', 'profile-edit', 'field', 'name', club.id)}
        />
        <div>
          <Text
            color="secondary"
            data-testid={testId('clubs', 'profile-edit', 'text', 'description-label', club.id)}
          >
            Описание
          </Text>
          <TextArea
            value={description}
            onUpdate={setDescription}
            rows={3}
            data-testid={testId('clubs', 'profile-edit', 'field', 'description', club.id)}
          />
        </div>
        <TextInput
          label="Email"
          value={contactEmail}
          onUpdate={setContactEmail}
          data-testid={testId('clubs', 'profile-edit', 'field', 'email', club.id)}
        />
        <TextInput
          label="Телефон"
          value={contactPhone}
          onUpdate={setContactPhone}
          data-testid={testId('clubs', 'profile-edit', 'field', 'phone', club.id)}
        />
      </div>

      <div
        className="hockey-stack hockey-stack--gap-10"
        data-testid={testId('clubs', 'profile-edit', 'panel', 'staff', club.id)}
      >
        <div className="hockey-row hockey-row--between">
          <Text
            variant="subheader-2"
            data-testid={testId('clubs', 'profile-edit', 'text', 'staff-title', club.id)}
          >
            Штаб
          </Text>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={() => setStaff((prev) => [...prev, emptyStaff()])}
            data-testid={testId('clubs', 'profile-edit', 'btn', 'add-staff', club.id)}
          >
            Добавить
          </HockeyButton>
        </div>

        {staff.map((member, index) => (
          <div
            key={member.userId}
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('clubs', 'profile-edit', 'row', 'staff', member.userId)}
          >
            <TextInput
              label="ФИО"
              value={member.displayName}
              onUpdate={(value) => updateStaff(index, {displayName: value})}
              data-testid={testId('clubs', 'profile-edit', 'field', 'staff-name', member.userId)}
            />
            <Select
              label="Роль"
              value={[member.role]}
              options={STAFF_ROLE_OPTIONS}
              onUpdate={(value) =>
                updateStaff(index, {role: (value[0] as ClubStaffMember['role']) ?? 'manager'})
              }
              data-testid={testId('clubs', 'profile-edit', 'select', 'staff-role', member.userId)}
            />
            <Text
              color="secondary"
              data-testid={testId(
                'clubs',
                'profile-edit',
                'text',
                'staff-role-label',
                member.userId,
              )}
            >
              {STAFF_ROLE_LABELS[member.role]}
            </Text>
            <TextInput
              label="Email"
              value={member.contactEmail ?? ''}
              onUpdate={(value) => updateStaff(index, {contactEmail: value})}
              data-testid={testId('clubs', 'profile-edit', 'field', 'staff-email', member.userId)}
            />
            <TextInput
              label="Телефон"
              value={member.contactPhone ?? ''}
              onUpdate={(value) => updateStaff(index, {contactPhone: value})}
              data-testid={testId('clubs', 'profile-edit', 'field', 'staff-phone', member.userId)}
            />
            <HockeyButton
              view="flat-danger"
              size="s"
              onClick={() => setStaff((prev) => prev.filter((_, i) => i !== index))}
              data-testid={testId('clubs', 'profile-edit', 'btn', 'remove-staff', member.userId)}
            >
              Удалить
            </HockeyButton>
          </div>
        ))}
      </div>

      <HockeyButton
        size="s"
        loading={saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
        data-testid={testId('clubs', 'profile-edit', 'btn', 'save', club.id)}
      >
        Сохранить
      </HockeyButton>
      {statusMessage && (
        <Text
          color="secondary"
          data-testid={testId('clubs', 'profile-edit', 'text', 'status', club.id)}
        >
          {statusMessage}
        </Text>
      )}
    </div>
  )
}
