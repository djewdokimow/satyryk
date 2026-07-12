const KEY = 'satyryk_v1'
const NUDGE_KEY = 'satyryk_last_nudge'

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return {
        jokes:    data.jokes    ?? [],
        setlists: data.setlists ?? [],
      }
    }
  } catch {}
  return { jokes: [], setlists: [] }
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
