/**
 * SPEC-FR-12.1 — единый разбор сообщений об ошибках API
 */

/** Достаёт `message` из JSON-тела ответа, если оно есть. */
export function extractApiErrorMessage(errorText: string): string | undefined {
  const trimmed = errorText.trim()
  if (!trimmed) return undefined

  try {
    const body = JSON.parse(trimmed) as {message?: string}
    const message = body.message?.trim()
    return message || undefined
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return undefined
    try {
      const body = JSON.parse(jsonMatch[0]) as {message?: string}
      return body.message?.trim() || undefined
    } catch {
      return undefined
    }
  }
}

/**
 * Человекочитаемое сообщение из Error API-клиента или fallback.
 * Совместимо с:
 * - уже распарсенным текстом из `apiRequest`
 * - форматом `API METHOD path failed: status {json}`
 */
export function parseApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback

  const fromJson = extractApiErrorMessage(error.message)
  if (fromJson) return fromJson

  const message = error.message.trim()
  if (message && !message.startsWith('API ')) {
    return message
  }

  return fallback
}
