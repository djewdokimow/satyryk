import { RATINGS } from './constants'

const VALID_STATUSES = ['idea', 'draft', 'working', 'polished', 'retired']

// ── JSON import ───────────────────────────────────────────────────────────────
// Shared processor — accepts a plain JS object (from JSON.parse or native import)

export function processImportData(data) {
  if (!data || typeof data !== 'object') return { jokes: [], setlists: [] }

  const rawJokes    = Array.isArray(data) ? data : (data.jokes    ?? [])
  const rawSetlists = Array.isArray(data) ? []   : (data.setlists ?? [])

  const jokes = rawJokes
    .filter(j => j && j.title)
    .map(j => {
      const status = VALID_STATUSES.includes(j.status) ? j.status : 'draft'
      const tags   = Array.isArray(j.tags) ? j.tags.map(String) : []

      const rawVersions = Array.isArray(j.versions)
        ? j.versions.map(v => ({
            id:           uid(),
            label:        String(v.label ?? 'v1'),
            text:         String(v.text  ?? '').trim(),
            notes:        String(v.notes ?? '').trim(),
            cues:         String(v.cues  ?? '').trim(),
            _parentLabel: v.parentLabel ? String(v.parentLabel) : null,
            rating:       RATINGS.includes(v.rating) ? v.rating : undefined,
            duration:     v.duration ? String(v.duration) : '',
            comments:     Array.isArray(v.comments)
              ? v.comments.map(c => ({
                  id:        uid(),
                  start:     Number(c.start) || 0,
                  end:       Number(c.end)   || 0,
                  quote:     String(c.quote  ?? ''),
                  text:      String(c.text   ?? ''),
                  createdAt: c.createdAt ?? new Date().toISOString(),
                }))
              : [],
          }))
        : [{ id: uid(), label: 'v1', text: '', notes: '', cues: '', _parentLabel: null }]

      const labelToId = new Map(rawVersions.map(v => [v.label, v.id]))
      const versions  = rawVersions.map(({ _parentLabel, ...v }) => ({
        ...v,
        parentId: _parentLabel ? (labelToId.get(_parentLabel) ?? null) : null,
      }))

      return {
        id:        uid(),
        title:     String(j.title),
        status,
        tags,
        versions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

  const setlists = rawSetlists
    .filter(s => s && s.title)
    .map(s => {
      const items = (s.items ?? [])
        .map(item => {
          if (item.type === 'segue') {
            return { id: uid(), type: 'segue', segueText: String(item.text ?? '') }
          }
          const joke = jokes.find(
            j => j.title.toLowerCase() === String(item.title ?? '').toLowerCase()
          )
          if (!joke) return null
          const wantedLabel = String(item.version ?? 'v1').toLowerCase()
          const version =
            joke.versions.find(v => v.label.toLowerCase().startsWith(wantedLabel)) ??
            joke.versions[0]
          const role = item.role === 'optional' || item.role === 'saver' ? item.role : undefined
          return { id: uid(), type: 'joke', jokeId: joke.id, versionId: version?.id, ...(role ? { role } : {}) }
        })
        .filter(Boolean)
      return {
        id:        uid(),
        title:     String(s.title),
        ...(RATINGS.includes(s.rating) ? { rating: s.rating } : {}),
        ...(s.state === 'past' ? { state: 'past' } : {}),
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

  return { jokes, setlists }
}

// For file-picker imports (accepts a JSON string)
export function parseJsonFile(content) {
  try {
    return processImportData(JSON.parse(content))
  } catch {
    return { jokes: [], setlists: [] }
  }
}

// ── JSON export ───────────────────────────────────────────────────────────────

export function exportToJson({ jokes, setlists }, { pretty = false } = {}) {
  const data = {
    jokes: jokes.map(joke => ({
      title:    joke.title,
      status:   joke.status,
      tags:     joke.tags ?? [],
      versions: joke.versions.map(v => {
        const obj = { label: v.label }
        if (v.parentId) {
          const parent = joke.versions.find(pv => pv.id === v.parentId)
          if (parent) obj.parentLabel = parent.label
        }
        obj.text = v.text ?? ''
        if (v.notes) obj.notes = v.notes
        if (v.cues)  obj.cues  = v.cues
        if (v.rating)   obj.rating   = v.rating
        if (v.duration) obj.duration = v.duration
        if (v.comments?.length) {
          obj.comments = v.comments.map(({ id: _id, ...c }) => c)
        }
        return obj
      }),
    })),
    ...(setlists.length > 0 ? {
      setlists: setlists.map(sl => ({
        title: sl.title,
        ...(sl.rating ? { rating: sl.rating } : {}),
        ...(sl.state === 'past' ? { state: 'past' } : {}),
        items: sl.items.flatMap(item => {
          if (item.type === 'segue') return [{ type: 'segue', text: item.segueText ?? '' }]
          const joke    = jokes.find(j => j.id === item.jokeId)
          const version = joke?.versions.find(v => v.id === item.versionId)
          if (!joke) return []
          return [{
            type: 'joke',
            title: joke.title,
            ...(version ? { version: version.label } : {}),
            ...(item.role ? { role: item.role } : {}),
          }]
        }),
      })),
    } : {}),
  }

  return JSON.stringify(data, null, pretty ? 2 : undefined)
}

export function download(filename, content, mime = 'application/json;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── M5Stack prompter export ───────────────────────────────────────────────────
// One bit per row: `Title,Cue 1,Cue 2, …` (see m5satyryk/data/setlist.csv).
// Cues come from the chosen version's `cues` field, one per line. Segues become
// title-less rows (empty first cell) with the transition text as their only cue.
function csvCell(s) {
  const v = String(s ?? '')
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

export function exportSetlistToM5Csv(setlist, jokes, roleLabels = null) {
  const lines = [
    '# Comedian prompter setlist — exported from Satyryk',
    `# ${String(setlist.title ?? '').replace(/[\r\n]+/g, ' ')}`,
    '# Title,Cue 1,Cue 2,Cue 3, ...',
  ]
  setlist.items.forEach(item => {
    if (item.type === 'segue') {
      const text = (item.segueText ?? '').trim()
      if (text) lines.push(['', text].map(csvCell).join(','))  // no-title bit
      return
    }

    const joke = jokes.find(j => j.id === item.jokeId)
    if (!joke) return
    const version = joke.versions.find(v => v.id === item.versionId) ?? joke.versions[0]
    const mark  = roleLabels && item.role ? ` (${roleLabels[item.role]})` : ''
    const title = joke.title + mark
    const cues = (version?.cues ?? '')
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean)
    lines.push([title, ...cues].map(csvCell).join(','))
  })
  return lines.join('\n') + '\n'
}

function uid() { return crypto.randomUUID() }
