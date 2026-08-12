import type {
  PlayerListItem,
  PrivacyAudience,
  PrivacySettings,
  ProfileContacts,
  ProfileFieldPrivacy,
} from '../model'

/** Кто смотрит профиль: сам владелец / одноклубник / остальные */
export type PrivacyViewerRelation = 'self' | 'teammate' | 'public'

export const DEFAULT_FIELD_PRIVACY: ProfileFieldPrivacy = {
  birthDate: 'teams_only',
  city: 'public',
  heightWeight: 'teams_only',
  position: 'public',
  skillLevel: 'public',
  teams: 'public',
  bio: 'public',
  achievements: 'public',
  participationHistory: 'public',
  calendar: 'public',
  phone: 'private',
  email: 'private',
  telegram: 'private',
  maxMessenger: 'private',
}

export const FIELD_PRIVACY_OPTIONS: Array<{value: PrivacyAudience; content: string}> = [
  {value: 'public', content: 'Всем'},
  {value: 'teams_only', content: 'Только командам'},
  {value: 'private', content: 'Только мне'},
]

export const FIELD_PRIVACY_LABELS: Record<keyof ProfileFieldPrivacy, string> = {
  birthDate: 'Дата рождения и возраст',
  city: 'Город',
  heightWeight: 'Рост и вес',
  position: 'Амплуа',
  skillLevel: 'Уровень и индекс',
  teams: 'Команды',
  bio: 'О себе',
  achievements: 'Микро-ачивки',
  participationHistory: 'История участия',
  calendar: 'Календарь',
  phone: 'Телефон',
  email: 'Email',
  telegram: 'Telegram',
  maxMessenger: 'MAX',
}

export const PROFILE_FIELD_PRIVACY_KEYS: Array<keyof ProfileFieldPrivacy> = [
  'birthDate',
  'city',
  'heightWeight',
  'position',
  'skillLevel',
  'teams',
  'bio',
  'achievements',
  'participationHistory',
  'calendar',
]

export const CONTACT_FIELD_PRIVACY_KEYS: Array<keyof ProfileFieldPrivacy> = [
  'phone',
  'email',
  'telegram',
  'maxMessenger',
]

export function normalizePrivacySettings(
  privacy: Partial<PrivacySettings> & Pick<PrivacySettings, 'profileVisibility'>,
): PrivacySettings {
  const fields: ProfileFieldPrivacy = {
    ...DEFAULT_FIELD_PRIVACY,
    ...privacy.fields,
  }

  if (privacy.calendarVisibility && !privacy.fields?.calendar) {
    fields.calendar = privacy.calendarVisibility
  }
  if (privacy.showParticipationHistory === false && !privacy.fields?.participationHistory) {
    fields.participationHistory = 'private'
  }
  if (privacy.showContacts === true) {
    if (privacy.fields?.phone == null) fields.phone = 'public'
    if (privacy.fields?.email == null) fields.email = 'public'
    if (privacy.fields?.telegram == null) fields.telegram = 'teams_only'
    if (privacy.fields?.maxMessenger == null) fields.maxMessenger = 'teams_only'
  }

  if (!privacy.personalDataProcessingConsent) {
    fields.phone = 'private'
    fields.email = 'private'
    fields.telegram = 'private'
    fields.maxMessenger = 'private'
  }

  const showContacts =
    privacy.personalDataProcessingConsent === true &&
    [fields.phone, fields.email, fields.telegram, fields.maxMessenger].some(
      (value) => value !== 'private',
    )
  const showParticipationHistory = fields.participationHistory !== 'private'
  const calendarVisibility =
    fields.calendar === 'private'
      ? 'private'
      : fields.calendar === 'teams_only'
        ? 'teams_only'
        : 'public'

  return {
    profileVisibility: privacy.profileVisibility,
    fields,
    showContacts,
    showParticipationHistory,
    calendarVisibility,
    personalDataProcessingConsent: privacy.personalDataProcessingConsent ?? false,
    personalDataConsentAt: privacy.personalDataConsentAt,
  }
}

export function isFieldVisibleToViewer(
  audience: PrivacyAudience,
  viewer: PrivacyViewerRelation,
): boolean {
  if (viewer === 'self') return true
  if (audience === 'private') return false
  if (audience === 'teams_only') return viewer === 'teammate'
  return true
}

export function resolveVisibleContacts(
  contacts: ProfileContacts | undefined,
  fields: ProfileFieldPrivacy,
  viewer: PrivacyViewerRelation,
  consent: boolean,
): ProfileContacts | undefined {
  if (!contacts || !consent) return undefined
  const next: ProfileContacts = {}
  if (contacts.phone && isFieldVisibleToViewer(fields.phone, viewer)) next.phone = contacts.phone
  if (contacts.email && isFieldVisibleToViewer(fields.email, viewer)) next.email = contacts.email
  if (contacts.telegram && isFieldVisibleToViewer(fields.telegram, viewer)) {
    next.telegram = contacts.telegram
  }
  if (contacts.maxMessenger && isFieldVisibleToViewer(fields.maxMessenger, viewer)) {
    next.maxMessenger = contacts.maxMessenger
  }
  return Object.keys(next).length > 0 ? next : undefined
}

export function resolveVisibleFields(
  fields: ProfileFieldPrivacy,
  viewer: PrivacyViewerRelation,
): Record<keyof ProfileFieldPrivacy, boolean> {
  return {
    birthDate: isFieldVisibleToViewer(fields.birthDate, viewer),
    city: isFieldVisibleToViewer(fields.city, viewer),
    heightWeight: isFieldVisibleToViewer(fields.heightWeight, viewer),
    position: isFieldVisibleToViewer(fields.position, viewer),
    skillLevel: isFieldVisibleToViewer(fields.skillLevel, viewer),
    teams: isFieldVisibleToViewer(fields.teams, viewer),
    bio: isFieldVisibleToViewer(fields.bio, viewer),
    achievements: isFieldVisibleToViewer(fields.achievements, viewer),
    participationHistory: isFieldVisibleToViewer(fields.participationHistory, viewer),
    calendar: isFieldVisibleToViewer(fields.calendar, viewer),
    phone: isFieldVisibleToViewer(fields.phone, viewer),
    email: isFieldVisibleToViewer(fields.email, viewer),
    telegram: isFieldVisibleToViewer(fields.telegram, viewer),
    maxMessenger: isFieldVisibleToViewer(fields.maxMessenger, viewer),
  }
}

/** Убрать из ответа ПДн, которые зрителю нельзя видеть */
export function redactPlayerForViewer(
  player: PlayerListItem,
  visible: Record<keyof ProfileFieldPrivacy, boolean>,
): PlayerListItem {
  return {
    ...player,
    birthDate: visible.birthDate ? player.birthDate : undefined,
    city: visible.city ? player.city : '—',
    heightCm: visible.heightWeight ? player.heightCm : undefined,
    weightKg: visible.heightWeight ? player.weightKg : undefined,
    bio: visible.bio ? player.bio : undefined,
    achievements: visible.achievements ? player.achievements : undefined,
    teamName: visible.teams ? player.teamName : undefined,
    teamLogoUrl: visible.teams ? player.teamLogoUrl : undefined,
    teamIds: visible.teams ? player.teamIds : undefined,
    contacts: undefined,
  }
}
