/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2
 * Phase 1: локальная «память» аккаунтов в браузере.
 * Контракт и storage key сохранятся — позже заменим реализацию на backend API.
 */

import {canUseLocalStorage} from '@/shared/lib/canUseLocalStorage'

export const LOCAL_AUTH_MEMORY_KEY = 'hockey-local-auth-memory'
export const LOCAL_AUTH_MEMORY_VERSION = 1 as const

/** @deprecated Phase 1 mock — пароль хранится только локально, не для production */
export interface LocalAuthUser {
  id: string
  displayName: string
  email: string
  password: string
  createdAt: string
}

export interface LocalAuthMemory {
  version: typeof LOCAL_AUTH_MEMORY_VERSION
  users: LocalAuthUser[]
  /** Пользователь, прошедший login/register и ожидающий выбор демо-роли */
  pendingUserId: string | null
}

function emptyMemory(): LocalAuthMemory {
  return {version: LOCAL_AUTH_MEMORY_VERSION, users: [], pendingUserId: null}
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function createUserId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadLocalAuthMemory(): LocalAuthMemory {
  if (!canUseLocalStorage()) return emptyMemory()
  try {
    const raw = window.localStorage.getItem(LOCAL_AUTH_MEMORY_KEY)
    if (!raw) return emptyMemory()
    const parsed = JSON.parse(raw) as LocalAuthMemory
    if (parsed.version !== LOCAL_AUTH_MEMORY_VERSION || !Array.isArray(parsed.users)) {
      return emptyMemory()
    }
    return {
      version: LOCAL_AUTH_MEMORY_VERSION,
      users: parsed.users,
      pendingUserId: parsed.pendingUserId ?? null,
    }
  } catch {
    return emptyMemory()
  }
}

export function saveLocalAuthMemory(memory: LocalAuthMemory): void {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(LOCAL_AUTH_MEMORY_KEY, JSON.stringify(memory))
}

export function findLocalUserByEmail(email: string): LocalAuthUser | undefined {
  const normalized = normalizeEmail(email)
  return loadLocalAuthMemory().users.find((user) => normalizeEmail(user.email) === normalized)
}

export function registerLocalUser(input: {
  displayName: string
  email: string
  password: string
}): LocalAuthUser {
  const memory = loadLocalAuthMemory()
  const email = normalizeEmail(input.email)
  const user: LocalAuthUser = {
    id: createUserId(),
    displayName: input.displayName.trim(),
    email,
    password: input.password,
    createdAt: new Date().toISOString(),
  }
  memory.users = [...memory.users.filter((item) => normalizeEmail(item.email) !== email), user]
  memory.pendingUserId = user.id
  saveLocalAuthMemory(memory)
  return user
}

export function authenticateLocalUser(email: string, password: string): LocalAuthUser | null {
  const user = findLocalUserByEmail(email)
  if (!user || user.password !== password) return null
  return user
}

export function setPendingLocalUser(userId: string | null): void {
  const memory = loadLocalAuthMemory()
  memory.pendingUserId = userId
  saveLocalAuthMemory(memory)
}

export function getPendingLocalUser(): LocalAuthUser | null {
  const memory = loadLocalAuthMemory()
  if (!memory.pendingUserId) return null
  return memory.users.find((user) => user.id === memory.pendingUserId) ?? null
}

export function clearPendingLocalUser(): void {
  setPendingLocalUser(null)
}

export function clearLocalAuthMemory(): void {
  if (!canUseLocalStorage()) return
  window.localStorage.removeItem(LOCAL_AUTH_MEMORY_KEY)
}

/** Для onboarding: имя и email текущего локального пользователя */
export function getPendingRegistration(): {displayName: string; email: string} | null {
  const user = getPendingLocalUser()
  if (!user) return null
  return {displayName: user.displayName, email: user.email}
}

/** @deprecated используйте setPendingLocalUser */
export function setPendingRegistration(data: {displayName: string; email: string} | null): void {
  if (!data) {
    clearPendingLocalUser()
    return
  }
  const existing = findLocalUserByEmail(data.email)
  if (existing) {
    setPendingLocalUser(existing.id)
  }
}

/** @deprecated используйте clearPendingLocalUser */
export function clearPendingRegistration(): void {
  clearPendingLocalUser()
}
