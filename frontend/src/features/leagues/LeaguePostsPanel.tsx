/**
 * SPEC-FR-24.5.6
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Switch, Text, TextInput} from '@gravity-ui/uikit'
import {createLeaguePost, fetchLeaguePosts} from '@/features/leagues/api/leaguesApi'
import {testId} from '@/shared/testing/testId'

export interface LeaguePostsPanelProps {
  leagueId: string
}

/** @spec SPEC-FR-24.5.6 - Публикации лиги */
export function LeaguePostsPanel({leagueId}: LeaguePostsPanelProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)

  const {data: posts = []} = useQuery({
    queryKey: ['league-posts', leagueId],
    queryFn: () => fetchLeaguePosts(leagueId),
  })

  const createMutation = useMutation({
    mutationFn: () => createLeaguePost(leagueId, {title, body, pinned}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['league-posts', leagueId]})
      setTitle('')
      setBody('')
      setPinned(false)
    },
  })

  return (
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-12" data-testid={testId('leagues', 'posts', 'panel', leagueId)}>
      <Text variant="subheader-2" data-testid={testId('leagues', 'posts', 'text', 'title', leagueId)}>
        Публикации
      </Text>

      <ul className="partner-dashboard__list" data-testid={testId('leagues', 'posts', 'list', leagueId)}>
        {posts.map((post) => (
          <li
            key={post.id}
            className="partner-dashboard__list-item partner-dashboard__list-item--stack"
            data-testid={testId('leagues', 'posts', 'item', post.id)}
          >
            <div>
              <Text data-testid={testId('leagues', 'posts', 'text', 'post-title', post.id)}>
                {post.pinned ? '📌 ' : ''}
                {post.title}
              </Text>
              <Text color="secondary" data-testid={testId('leagues', 'posts', 'text', 'post-body', post.id)}>
                {post.body}
              </Text>
              <Text color="secondary" data-testid={testId('leagues', 'posts', 'text', 'post-date', post.id)}>
                {new Date(post.publishedAt).toLocaleString('ru-RU')}
              </Text>
            </div>
          </li>
        ))}
      </ul>

      <div className="partner-dashboard__form hockey-stack hockey-stack--gap-8" data-testid={testId('leagues', 'posts', 'panel', 'form', leagueId)}>
        <Text variant="subheader-2" data-testid={testId('leagues', 'posts', 'text', 'form-title', leagueId)}>
          Новая публикация
        </Text>
        <TextInput
          label="Заголовок"
          value={title}
          onUpdate={setTitle}
          data-testid={testId('leagues', 'posts', 'field', 'title', leagueId)}
        />
        <TextInput
          label="Текст"
          value={body}
          onUpdate={setBody}
          data-testid={testId('leagues', 'posts', 'field', 'body', leagueId)}
        />
        <Switch
          checked={pinned}
          onUpdate={setPinned}
          data-testid={testId('leagues', 'posts', 'checkbox', 'pinned', leagueId)}
        >
          Закрепить
        </Switch>
        <Button
          view="action"
          size="s"
          disabled={!title.trim() || !body.trim()}
          loading={createMutation.isPending}
          onClick={() => createMutation.mutate()}
          data-testid={testId('leagues', 'posts', 'btn', 'publish', leagueId)}
        >
          Опубликовать
        </Button>
      </div>
    </div>
  )
}
