export const DECLINE_REASON_PRESETS = [
  {id: 'sick', label: 'Болею'},
  {id: 'work', label: 'Работаю'},
  {id: 'family', label: 'Семья'},
  {id: 'injury', label: 'Травма'},
  {id: 'other', label: 'Другое'},
] as const

export type DeclineReasonPresetId = (typeof DECLINE_REASON_PRESETS)[number]['id']
