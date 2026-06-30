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

// Returns formatted duration string, '?' if any bit is missing a duration, or null if no jokes.
export function calcSetlistDuration(setlist, jokes) {
  const items = setlist.items.filter(i => i.type === 'joke')
  if (items.length === 0) return null
  const durations = items.map(item => {
    const joke = jokes.find(j => j.id === item.jokeId)
    const ver  = joke?.versions.find(v => v.id === item.versionId) ?? joke?.versions[0]
    return parseDuration(ver?.duration)
  })
  if (durations.every(d => d !== null))
    return formatDuration(durations.reduce((a, b) => a + b, 0))
  if (durations.some(d => d !== null))
    return '?'
  return null
}
