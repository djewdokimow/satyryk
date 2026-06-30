// Parse a duration string entered by the user into seconds.
// Supports: "2:30" (m:ss), "3" or "3.5" (treated as minutes).
export function parseDuration(str) {
  if (!str?.trim()) return null
  const s = str.trim()
  const colonMatch = s.match(/^(\d+):(\d{1,2})$/)
  if (colonMatch) return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2])
  const numMatch = s.match(/^(\d+\.?\d*)$/)
  if (numMatch) return Math.round(parseFloat(numMatch[1]) * 60)
  return null
}

export function formatDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return s ? `${m}:${String(s).padStart(2, '0')}` : `${m}m`
}
