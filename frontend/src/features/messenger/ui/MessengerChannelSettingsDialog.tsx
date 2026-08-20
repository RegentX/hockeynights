/**
 * SPEC-FR-22.1.2, SPEC-FR-22.1.4 — уведомления, права и аудит канала.
 */

import {Select, Switch, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {ChannelRole, ChannelSettings, ChannelSettingsPatch, Chat} from '@/entities/messenger'
import {fetchChannelSettings, updateChannelSettings} from '@/entities/messenger'
import {parseApiErrorMessage} from '@/shared/api/parseApiError'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {HockeyFormDialog, HockeyFormSection} from '@/shared/ui/HockeyFormDialog'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const ROLE_LABELS: Record<ChannelRole, string> = {
  owner: 'Владелец',
  captain: 'Капитан',
  coach: 'Тренер',
  team_admin: 'Админ команды',
  player: 'Игрок',
}

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as ChannelRole[]).map((role) => ({
  value: role,
  content: ROLE_LABELS[role],
}))

const SLOW_MODE_OPTIONS = [
  {value: '0', content: 'Выключен'},
  {value: '10', content: '10 сек'},
  {value: '30', content: '30 сек'},
  {value: '60', content: '60 сек'},
]

interface MessengerChannelSettingsDialogProps {
  open: boolean
  onClose: () => void
  chat: Chat
  onStatus: (message: string) => void
}

export function MessengerChannelSettingsDialog({
  open,
  onClose,
  chat,
  onStatus,
}: MessengerChannelSettingsDialogProps) {
  const queryClient = useQueryClient()
  const [tagDraft, setTagDraft] = useState<string | null>(null)

  const {data: settings, isLoading} = useQuery({
    queryKey: ['messenger-channel-settings', chat.id],
    queryFn: () => fetchChannelSettings(chat.id),
    enabled: open,
  })

  const patchMutation = useMutation({
    mutationFn: (patch: ChannelSettingsPatch) => updateChannelSettings(chat.id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['messenger-channel-settings', chat.id]})
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      onStatus('Настройки канала обновлены.')
    },
  })

  function patch(next: ChannelSettingsPatch) {
    patchMutation.mutate(next)
  }

  function handleClose() {
    setTagDraft(null)
    patchMutation.reset()
    onClose()
  }

  return (
    <HockeyFormDialog
      open={open}
      onClose={handleClose}
      caption="Настройки канала"
      description={
        settings
          ? `${chat.title} · ваша роль: ${ROLE_LABELS[settings.currentUserRole]}`
          : chat.title
      }
      data-testid={testId('messenger', 'page', 'panel', 'channel-settings')}
      footer={
        <HockeyButton
          view="outlined"
          onClick={handleClose}
          data-testid={testId('messenger', 'channel-settings-dialog', 'btn', 'close')}
        >
          Закрыть
        </HockeyButton>
      }
    >
      {isLoading || !settings ? (
        <div data-testid={testId('messenger', 'page', 'loader', 'channel-settings')}>
          <ScoreboardLoader label="Загрузка настроек" testIdPrefix="messenger" />
        </div>
      ) : (
        <>
          <HockeyFormSection
            title="Канал"
            data-testid={testId('messenger', 'page', 'form', 'channel-settings')}
          >
            <div className="hockey-stack hockey-stack--gap-4">
              <Text variant="caption-2" color="secondary">
                Тег канала
              </Text>
              <TextInput
                value={tagDraft ?? settings.channelTag ?? ''}
                onUpdate={setTagDraft}
                onBlur={() => {
                  if (tagDraft === null) return
                  const next = tagDraft.trim()
                  if (next !== (settings.channelTag ?? '')) {
                    patch({channelTag: next || undefined})
                  }
                  setTagDraft(null)
                }}
                placeholder="announcements"
                aria-label="Тег канала"
                data-testid={testId('messenger', 'page', 'field', 'channel-tag')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text variant="caption-2" color="secondary">
                Slow mode
              </Text>
              <Select
                width="max"
                value={[String(settings.slowModeSeconds)]}
                options={SLOW_MODE_OPTIONS}
                onUpdate={([value]) =>
                  patch({slowModeSeconds: Number(value) as ChannelSettings['slowModeSeconds']})
                }
                aria-label="Slow mode"
                qa={testId('messenger', 'page', 'select', 'channel-slow-mode')}
              />
            </div>
          </HockeyFormSection>

          <HockeyFormSection title="Уведомления" layout="stack">
            <SettingsSwitch
              label="Отключить уведомления"
              qualifier="channel-mute"
              checked={settings.notifications.muted}
              onUpdate={(value) => patch({notifications: {muted: value}})}
            />
            <SettingsSwitch
              label="Только упоминания"
              qualifier="channel-mentions-only"
              checked={settings.notifications.mentionsOnly}
              onUpdate={(value) => patch({notifications: {mentionsOnly: value}})}
            />
            <SettingsSwitch
              label="Только важные"
              qualifier="channel-important-only"
              checked={settings.notifications.importantOnly}
              onUpdate={(value) => patch({notifications: {importantOnly: value}})}
            />
            <SettingsSwitch
              label="Push-уведомления"
              qualifier="channel-push"
              checked={settings.notifications.pushEnabled}
              onUpdate={(value) => patch({notifications: {pushEnabled: value}})}
            />
          </HockeyFormSection>

          <HockeyFormSection title="Права">
            <div className="hockey-stack hockey-stack--gap-4">
              <Text variant="caption-2" color="secondary">
                Писать в канал может роль не ниже
              </Text>
              <Select
                width="max"
                value={[settings.permissions.publishMinRole]}
                options={ROLE_OPTIONS}
                onUpdate={([value]) => patch({permissions: {publishMinRole: value as ChannelRole}})}
                aria-label="Писать в канал может роль не ниже"
                qa={testId('messenger', 'page', 'select', 'channel-publish-role')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text variant="caption-2" color="secondary">
                Управлять участниками может роль не ниже
              </Text>
              <Select
                width="max"
                value={[settings.permissions.manageMembersMinRole]}
                options={ROLE_OPTIONS}
                onUpdate={([value]) =>
                  patch({permissions: {manageMembersMinRole: value as ChannelRole}})
                }
                aria-label="Управлять участниками может роль не ниже"
                qa={testId('messenger', 'page', 'select', 'channel-manage-role')}
              />
            </div>
          </HockeyFormSection>

          <HockeyFormSection title="Темы" layout="stack">
            <SettingsSwitch
              label="Разрешить создание тем участникам"
              qualifier="channel-topic-creation"
              checked={settings.permissions.allowTopicCreation}
              onUpdate={(value) => patch({permissions: {allowTopicCreation: value}})}
            />
          </HockeyFormSection>

          <HockeyFormSection title="История изменений" layout="stack">
            <div
              className="messenger-audit"
              data-testid={testId('messenger', 'page', 'list', 'channel-audit')}
            >
              {settings.audit.length === 0 ? (
                <Text
                  variant="caption-1"
                  color="secondary"
                  data-testid={testId('messenger', 'page', 'empty', 'channel-audit')}
                >
                  Пока нет изменений.
                </Text>
              ) : (
                settings.audit.map((entry) => (
                  <div
                    key={entry.id}
                    className="messenger-audit__item"
                    data-testid={testId('messenger', 'page', 'item', 'audit', entry.id)}
                  >
                    <Text
                      variant="caption-1"
                      data-testid={testId('messenger', 'page', 'text', 'audit-action', entry.id)}
                    >
                      {entry.actorName}: {entry.action}
                    </Text>
                    <Text
                      variant="caption-1"
                      color="secondary"
                      className="scoreboard-text"
                      data-testid={testId('messenger', 'page', 'text', 'audit-time', entry.id)}
                    >
                      {new Date(entry.createdAt).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </div>
                ))
              )}
            </div>
          </HockeyFormSection>

          {patchMutation.error != null && (
            <Text
              color="danger"
              data-testid={testId('messenger', 'channel-settings-dialog', 'error', 'save')}
            >
              {parseApiErrorMessage(patchMutation.error, 'Не удалось обновить настройки канала')}
            </Text>
          )}
        </>
      )}
    </HockeyFormDialog>
  )
}

function SettingsSwitch({
  label,
  qualifier,
  checked,
  onUpdate,
}: {
  label: string
  qualifier: string
  checked: boolean
  onUpdate: (value: boolean) => void
}) {
  return (
    <label
      className="messenger-composer__switch"
      data-testid={testId('messenger', 'page', 'field', qualifier)}
    >
      <span data-testid={testId('messenger', 'page', 'text', `${qualifier}-label`)}>{label}</span>
      <Switch
        checked={checked}
        onUpdate={onUpdate}
        data-testid={testId('messenger', 'page', 'checkbox', qualifier)}
      />
    </label>
  )
}
