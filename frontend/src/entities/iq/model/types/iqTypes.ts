/**
 * SPEC-FR-13.1.1, SPEC-FR-13.1.2, SPEC-FR-13.1.3
 */

import type {SkillLevel} from '@/entities/common'

/** @spec SPEC-FR-13.1.1 - Категория теста Hockey IQ */
export type IqCategory = 'rules' | 'tactics' | 'history' | 'situations'

/** @spec SPEC-FR-13.1.1 - Тест Hockey IQ */
export interface IqTest {
  /** @spec SPEC-FR-13.1.1 */
  id: string
  /** @spec SPEC-FR-13.1.1 */
  title: string
  /** @spec SPEC-FR-13.1.1 */
  category: IqCategory
  /** @spec SPEC-FR-13.1.1 */
  difficulty: SkillLevel
  /** @spec SPEC-FR-13.1.1 */
  questionCount: number
  /** @spec SPEC-FR-13.1.1 */
  estimatedMinutes: number
}

/** @spec SPEC-FR-13.1.2 - Вариант ответа */
export interface IqOption {
  /** @spec SPEC-FR-13.1.2 */
  id: string
  /** @spec SPEC-FR-13.1.2 */
  text: string
}

/** @spec SPEC-FR-13.1.2 - Вопрос Hockey IQ */
export interface IqQuestion {
  /** @spec SPEC-FR-13.1.2 */
  id: string
  /** @spec SPEC-FR-13.1.2 */
  testId: string
  /** @spec SPEC-FR-13.1.2 */
  prompt: string
  /** @spec SPEC-FR-13.1.2 */
  options: IqOption[]
  /** @spec SPEC-FR-13.1.2 */
  correctOptionId: string
  /** @spec SPEC-FR-13.1.2 */
  explanation: string
}

/** @spec SPEC-FR-13.1.2 - Ответ пользователя на вопрос */
export interface IqAnswer {
  /** @spec SPEC-FR-13.1.2 */
  questionId: string
  /** @spec SPEC-FR-13.1.2 */
  optionId: string
}

/** @spec SPEC-FR-13.1.2 - Payload попытки */
export interface IqAttemptPayload {
  /** @spec SPEC-FR-13.1.2 */
  testId: string
  /** @spec SPEC-FR-13.1.2 */
  userId: string
  /** @spec SPEC-FR-13.1.2 */
  answers: IqAnswer[]
}

/** @spec SPEC-FR-13.1.2 - Результат попытки */
export interface IqAttemptResult {
  /** @spec SPEC-FR-13.1.2 */
  attemptId: string
  /** @spec SPEC-FR-13.1.2 */
  score: number
  /** @spec SPEC-FR-13.1.2 */
  maxScore: number
  /** @spec SPEC-FR-13.1.2 */
  streak: number
  /** @spec SPEC-FR-13.1.2 */
  details: Array<{
    questionId: string
    correctOptionId: string
    userOptionId: string
    explanation: string
  }>
}

/** @spec SPEC-FR-13.1.3 - Строка рейтинга Hockey IQ */
export interface IqLeaderboardRow {
  /** @spec SPEC-FR-13.1.3 */
  rank: number
  /** @spec SPEC-FR-13.1.3 */
  userId: string
  /** @spec SPEC-FR-13.1.3 */
  displayName: string
  /** @spec SPEC-FR-13.1.3 */
  score: number
  /** @spec SPEC-FR-13.1.3 */
  streak: number
}
