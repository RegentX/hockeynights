/**
 * Локальная память аккаунтов (Phase 1).
 */

import {beforeEach, describe, expect, it} from 'vitest'

import {
  authenticateLocalUser,
  clearLocalAuthMemory,
  findLocalUserByEmail,
  getPendingLocalUser,
  loadLocalAuthMemory,
  LOCAL_AUTH_MEMORY_KEY,
  registerLocalUser,
} from '@/features/auth/localAuthMemory'

describe('localAuthMemory', () => {
  beforeEach(() => {
    clearLocalAuthMemory()
  })

  it('registers and retrieves a local user', () => {
    registerLocalUser({
      displayName: 'Тест Игрок',
      email: 'test@hockey.local',
      password: 'secret12',
    })

    const memory = loadLocalAuthMemory()
    expect(memory.users).toHaveLength(1)
    expect(memory.users[0].displayName).toBe('Тест Игрок')
    expect(window.localStorage.getItem(LOCAL_AUTH_MEMORY_KEY)).toContain('test@hockey.local')
  })

  it('authenticates by email and password', () => {
    registerLocalUser({
      displayName: 'Тест',
      email: 'player@hockey.local',
      password: 'mypass',
    })

    expect(authenticateLocalUser('player@hockey.local', 'mypass')?.displayName).toBe('Тест')
    expect(authenticateLocalUser('player@hockey.local', 'wrong')).toBeNull()
  })

  it('sets pending user after registration', () => {
    const user = registerLocalUser({
      displayName: 'Новый',
      email: 'new@hockey.local',
      password: 'secret12',
    })

    expect(getPendingLocalUser()?.id).toBe(user.id)
    expect(findLocalUserByEmail('new@hockey.local')?.email).toBe('new@hockey.local')
  })
})
