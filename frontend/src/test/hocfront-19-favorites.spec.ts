/**
 * HOCFRONT-19 — entity favorites API / MSW
 */

import {beforeEach, describe, expect, it} from 'vitest'

import {addFavorite, favoriteKey, fetchFavorites, removeFavorite} from '@/entities/favorites'
import {resetMockEntityFavorites} from '@/mocks/data/entityFavorites'

describe('HOCFRONT-19 favorites API', () => {
  beforeEach(() => {
    resetMockEntityFavorites()
  })

  it('lists seeded favorites', async () => {
    const {items} = await fetchFavorites()
    expect(items.length).toBeGreaterThanOrEqual(2)
    expect(items.some((item) => item.type === 'arena')).toBe(true)
  })

  it('adds and removes by type+entityId key', async () => {
    const created = await addFavorite({
      type: 'team',
      entityId: 'team-001',
      title: 'Медведи',
    })
    expect(created.id).toBe(favoriteKey('team', 'team-001'))
    expect(created.href).toBe('/teams/team-001')

    const afterAdd = await fetchFavorites()
    expect(afterAdd.items.some((item) => item.id === created.id)).toBe(true)

    await removeFavorite(created.id)
    const afterRemove = await fetchFavorites()
    expect(afterRemove.items.some((item) => item.id === created.id)).toBe(false)
  })

  it('is idempotent on duplicate add', async () => {
    const first = await addFavorite({
      type: 'training',
      entityId: 'event-002',
      title: 'Клубная тренировка',
    })
    const second = await addFavorite({
      type: 'training',
      entityId: 'event-002',
      title: 'Клубная тренировка',
    })
    expect(second.id).toBe(first.id)
    const {items} = await fetchFavorites()
    expect(items.filter((item) => item.id === first.id)).toHaveLength(1)
  })
})
