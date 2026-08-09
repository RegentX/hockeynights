/**
 * SPEC-FR-12.1.1 — apiRequest не должен молча принимать SPA-fallback за ответ API.
 *
 * Когда mock service worker не контролирует страницу (hard-reload, первый
 * запуск, выгруженный SW), запрос уходит на dev-сервер, который отдаёт
 * index.html со статусом 200. Раньше это падало в `response.json()` с
 * «Unexpected token '<'», и пользователь видел ошибку загрузки без причины.
 */

import {afterEach, describe, expect, it, vi} from 'vitest'

import {ApiNotInterceptedError, apiRequest} from '@/shared/api/client'

function htmlResponse(): Response {
  return new Response('<!doctype html><html><body>vite</body></html>', {
    status: 200,
    headers: {'content-type': 'text/html'},
  })
}

describe('apiRequest — защита от SPA-fallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('бросает понятную ошибку, когда dev-сервер вернул HTML вместо JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(htmlResponse()))

    await expect(apiRequest('/session')).rejects.toBeInstanceOf(ApiNotInterceptedError)
    await expect(apiRequest('/session')).rejects.toThrow(/не дошёл до mock API/)
  })

  it('не подменяет обычные ошибки статуса', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({message: 'Нет прав'}), {
          status: 403,
          headers: {'content-type': 'application/json'},
        }),
      ),
    )

    await expect(apiRequest('/leagues/league-001/analytics')).rejects.toThrow(/403/)
  })

  it('пропускает валидный JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({id: 'league-001'}), {
          status: 200,
          headers: {'content-type': 'application/json'},
        }),
      ),
    )

    await expect(apiRequest('/leagues/league-001')).resolves.toEqual({id: 'league-001'})
  })

  it('пропускает 204 без тела', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, {status: 204})))

    await expect(
      apiRequest('/favorites/league-league-001', {method: 'DELETE'}),
    ).resolves.toBeUndefined()
  })
})
