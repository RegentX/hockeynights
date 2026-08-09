/** Route path constants — single source for router and navigation. */
export function arenaDetailsPath(arenaId: string): string {
  return `/arenas/${encodeURIComponent(arenaId)}`
}

/** HOCFRONT-34A — отдельная страница лиги */
export function leagueDetailsPath(leagueId: string): string {
  return `/leagues/${encodeURIComponent(leagueId)}`
}

export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  terms: '/terms',
  profile: '/profile',
  players: '/players',
  playerProfile: '/players/:userId',
  teams: '/teams',
  teamsCreate: '/teams/create',
  teamProfile: '/teams/:teamId',
  events: '/events',
  eventsCreate: '/events/create',
  eventsOrganizer: '/events/organizer',
  trainingDetails: '/events/trainings/:eventId',
  trainingEdit: '/events/trainings/:eventId/edit',
  gameDetails: '/events/games/:eventId',
  calendar: '/calendar',
  sos: '/sos',
  arenas: '/arenas',
  arenaDetails: '/arenas/:arenaId',
  leagues: '/leagues',
  leagueDetails: '/leagues/:leagueId',
  feedback: '/feedback',
  notifications: '/notifications',
  messenger: '/messenger',
  shops: '/shops',
  partner: '/partner',
  partnerShop: '/partner/shops/:shopId',
  partnerLeague: '/partner/leagues/:leagueId',
  partnerClub: '/partner/clubs/:clubId',
  partnerArena: '/partner/arenas/:arenaId',
  iq: '/iq',
  radar: '/radar',
  highlights: '/highlights',
  admin: '/admin',
} as const
