/**
 * SPEC-FR-24.5.6
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Switch, Text, TextInput} from '@gravity-ui/uikit'
import {createLeaguePost, fetchLeaguePosts} from '@/features/leagues/api/leaguesApi'

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
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-12">
      <Text variant="subheader-2">Публикации</Text>

      <ul className="partner-dashboard__list">
        {posts.map((post) => (
          <li key={post.id} className="partner-dashboard__list-item partner-dashboard__list-item--stack">
            <div>
              <Text>
                {post.pinned ? '📌 ' : ''}
                {post.title}
              </Text>
              <Text color="secondary">{post.body}</Text>
              <Text color="secondary">
                {new Date(post.publishedAt).toLocaleString('ru-RU')}
              </Text>
            </div>
          </li>
        ))}
      </ul>

      <div className="partner-dashboard__form hockey-stack hockey-stack--gap-8">
        <Text variant="subheader-2">Новая публикация</Text>
        <TextInput label="Заголовок" value={title} onUpdate={setTitle} />
        <TextInput label="Текст" value={body} onUpdate={setBody} />
        <Switch checked={pinned} onUpdate={setPinned}>
          Закрепить
        </Switch>
        <Button
          view="action"
          size="s"
          disabled={!title.trim() || !body.trim()}
          loading={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          Опубликовать
        </Button>
      </div>
    </div>
  )
}
