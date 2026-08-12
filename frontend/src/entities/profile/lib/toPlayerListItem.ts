import type {HockeyProfile, PlayerListItem} from '@/entities/profile'

/** HockeyProfile → карточка каталога / публичной страницы. */
export function toPlayerListItem(profile: HockeyProfile): PlayerListItem {
  return {
    ...profile,
    displayName: profile.fullName,
  }
}
