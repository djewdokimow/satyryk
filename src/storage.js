import { DEFAULT_REACTION_EMOJIS } from './constants'

const KEY = 'satyryk_v1'
const NUDGE_KEY = 'satyryk_last_nudge'

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return {
        jokes:          data.jokes          ?? [],
        setlists:       data.setlists       ?? [],
        reactionEmojis: data.reactionEmojis ?? DEFAULT_REACTION_EMOJIS,
      }
    }
  } catch {}
  return { jokes: [], setlists: [], reactionEmojis: DEFAULT_REACTION_EMOJIS }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {}
}

export function shouldShowBackupNudge() {
  try {
    return localStorage.getItem(NUDGE_KEY) !== new Date().toDateString()
  } catch {
    return false
  }
}

export function markBackupNudgeShown() {
  try {
    localStorage.setItem(NUDGE_KEY, new Date().toDateString())
  } catch {}
}
