/**
 * SPEC-FR-13.1.1, SPEC-FR-13.1.2, SPEC-FR-13.1.3
 */

import type {
  IqAttemptPayload,
  IqAttemptResult,
  IqLeaderboardRow,
  IqQuestion,
  IqTest,
} from '@/entities/iq'

/** @spec SPEC-FR-13.1.1 - Каталог mock-тестов */
export const mockIqTests: IqTest[] = [
  {
    id: 'iq-test-001',
    title: 'Офсайд и игра в зоне',
    category: 'rules',
    difficulty: 'amateur',
    questionCount: 3,
    estimatedMinutes: 2,
  },
  {
    id: 'iq-test-002',
    title: 'Решения в формате 2 в 1',
    category: 'tactics',
    difficulty: 'advanced',
    questionCount: 3,
    estimatedMinutes: 3,
  },
  {
    id: 'iq-test-003',
    title: 'Хоккейная история и терминология',
    category: 'history',
    difficulty: 'beginner',
    questionCount: 3,
    estimatedMinutes: 2,
  },
]

/** @spec SPEC-FR-13.1.2 - Mock-вопросы Hockey IQ */
export const mockIqQuestions: IqQuestion[] = [
  {
    id: 'q-001',
    testId: 'iq-test-001',
    prompt: 'Игрок атакующей команды заехал в зону раньше шайбы. Что фиксирует судья?',
    options: [
      {id: 'a', text: 'Проброс'},
      {id: 'b', text: 'Офсайд'},
      {id: 'c', text: 'Нарушение численного состава'},
    ],
    correctOptionId: 'b',
    explanation: 'Игрок в зоне до шайбы — классический офсайд.',
  },
  {
    id: 'q-002',
    testId: 'iq-test-001',
    prompt: 'Защитник под давлением в своей зоне. Лучшее первое решение?',
    options: [
      {id: 'a', text: 'Слепой пас через пятак'},
      {id: 'b', text: 'Пас на борт или короткий пас ближнему форварду'},
      {id: 'c', text: 'Бросок в створ из своей зоны'},
    ],
    correctOptionId: 'b',
    explanation: 'Безопасный выход через борт снижает риск потери.',
  },
  {
    id: 'q-003',
    testId: 'iq-test-001',
    prompt: 'Шайба ушла за лицевую от игрока атакующей команды без касания. Что дальше?',
    options: [
      {id: 'a', text: 'Вбрасывание в средней зоне'},
      {id: 'b', text: 'Буллит'},
      {id: 'c', text: 'Проброс и вбрасывание в зоне нарушившей команды'},
    ],
    correctOptionId: 'c',
    explanation: 'Если не было касания, фиксируется проброс.',
  },
  {
    id: 'q-004',
    testId: 'iq-test-002',
    prompt: 'Атака 2 в 1. Защитник смещается к пасу. Ваше решение?',
    options: [
      {id: 'a', text: 'Бросок в ближний угол'},
      {id: 'b', text: 'Пас под клюшку партнёру'},
      {id: 'c', text: 'Стоп-игра и смена'},
    ],
    correctOptionId: 'a',
    explanation: 'При перекрытом пасе бросок — оптимальная опция.',
  },
  {
    id: 'q-005',
    testId: 'iq-test-002',
    prompt: 'В меньшинстве защитник выиграл шайбу у борта. Что приоритетно?',
    options: [
      {id: 'a', text: 'Сразу вывести шайбу из зоны'},
      {id: 'b', text: 'Идти в обыгрыш на синей'},
      {id: 'c', text: 'Пас назад вратарю'},
    ],
    correctOptionId: 'a',
    explanation: 'В меньшинстве важнее снять давление и выиграть время.',
  },
  {
    id: 'q-006',
    testId: 'iq-test-002',
    prompt: 'Капитан видит дефицит защитников перед матчем. Верный шаг?',
    options: [
      {id: 'a', text: 'Игнорировать и начать матч'},
      {id: 'b', text: 'Запустить добор по позиции'},
      {id: 'c', text: 'Сменить вратаря'},
    ],
    correctOptionId: 'b',
    explanation: 'Добор по позиции снижает риски по ходу матча.',
  },
  {
    id: 'q-007',
    testId: 'iq-test-003',
    prompt: 'Сколько периодов в классическом хоккейном матче?',
    options: [
      {id: 'a', text: '2'},
      {id: 'b', text: '3'},
      {id: 'c', text: '4'},
    ],
    correctOptionId: 'b',
    explanation: 'Классический матч состоит из трёх периодов.',
  },
  {
    id: 'q-008',
    testId: 'iq-test-003',
    prompt: 'Что означает аббревиатура C на джерси?',
    options: [
      {id: 'a', text: 'Coach'},
      {id: 'b', text: 'Captain'},
      {id: 'c', text: 'Center'},
    ],
    correctOptionId: 'b',
    explanation: 'C обозначает капитана команды.',
  },
  {
    id: 'q-009',
    testId: 'iq-test-003',
    prompt: 'Какой навык чаще всего ассоциируют с «хоккейным IQ»?',
    options: [
      {id: 'a', text: 'Выбор решения до приёма шайбы'},
      {id: 'b', text: 'Скорость катания спиной'},
      {id: 'c', text: 'Сила щелчка'},
    ],
    correctOptionId: 'a',
    explanation: 'Хоккейный IQ — это предвосхищение и своевременное решение.',
  },
]

/** @spec SPEC-FR-13.1.3 - Mock-лидерборд */
export const mockIqLeaderboard: IqLeaderboardRow[] = [
  {rank: 1, userId: 'user-008', displayName: 'Егор Воробьёв', score: 280, streak: 9},
  {rank: 2, userId: 'user-002', displayName: 'Алексей Смирнов', score: 250, streak: 7},
  {rank: 3, userId: 'user-011', displayName: 'Илья Савельев', score: 220, streak: 5},
  {rank: 4, userId: 'user-001', displayName: 'Иван Петров', score: 180, streak: 3},
  {rank: 5, userId: 'user-007', displayName: 'Максим Белов', score: 160, streak: 2},
]

/** @spec SPEC-FR-13.1.2 - Расчёт результата попытки */
export function evaluateMockIqAttempt(payload: IqAttemptPayload): IqAttemptResult {
  const questions = mockIqQuestions.filter((q) => q.testId === payload.testId)
  let score = 0

  const details = questions.map((question) => {
    const userOptionId = payload.answers.find((a) => a.questionId === question.id)?.optionId ?? ''
    const isCorrect = userOptionId === question.correctOptionId
    if (isCorrect) score += 10
    return {
      questionId: question.id,
      correctOptionId: question.correctOptionId,
      userOptionId,
      explanation: question.explanation,
    }
  })

  return {
    attemptId: `attempt-${Math.random().toString(36).slice(2, 8)}`,
    score,
    maxScore: questions.length * 10,
    streak: Math.max(1, Math.round(score / 20)),
    details,
  }
}
