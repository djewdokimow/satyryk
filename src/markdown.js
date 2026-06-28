import { load as yamlLoad } from 'js-yaml'

const VALID_STATUSES = ['idea', 'draft', 'working', 'polished', 'retired']

// ── YAML import ───────────────────────────────────────────────────────────────
// Returns { jokes, setlists }. Setlist items are matched to imported jokes by title.

export function parseYamlFile(content) {
  const data = yamlLoad(content)
  if (!data || typeof data !== 'object') return { jokes: [], setlists: [] }

  // Support top-level object { jokes: [...], setlists: [...] }
  // or legacy bare array (jokes only)
  const rawJokes = Array.isArray(data) ? data : (data.jokes ?? [])
  const rawSetlists = Array.isArray(data) ? [] : (data.setlists ?? [])

  const jokes = rawJokes
    .filter(j => j && j.title)
    .map(j => {
      const status = VALID_STATUSES.includes(j.status) ? j.status : 'draft'
      const tags = Array.isArray(j.tags) ? j.tags.map(String) : []

      // First pass: assign UUIDs
      const rawVersions = Array.isArray(j.versions)
        ? j.versions.map(v => ({
            id: uid(),
            label: String(v.label ?? 'v1'),
            text: String(v.text ?? '').trim(),
            notes: String(v.notes ?? '').trim(),
            _parentLabel: v.parentLabel ? String(v.parentLabel) : null,
          }))
        : [{ id: uid(), label: 'v1', text: '', notes: '', _parentLabel: null }]

      // Second pass: resolve parentLabel → parentId
      const labelToId = new Map(rawVersions.map(v => [v.label, v.id]))
      const versions = rawVersions.map(({ _parentLabel, ...v }) => ({
        ...v,
        parentId: _parentLabel ? (labelToId.get(_parentLabel) ?? null) : null,
      }))

      return {
        id: uid(),
        title: String(j.title),
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
          // type === 'joke': match by title (case-insensitive), version by label prefix
          const joke = jokes.find(
            j => j.title.toLowerCase() === String(item.title ?? '').toLowerCase()
          )
          if (!joke) return null
          const wantedLabel = String(item.version ?? 'v1').toLowerCase()
          const version =
            joke.versions.find(v => v.label.toLowerCase().startsWith(wantedLabel)) ??
            joke.versions[0]
          return { id: uid(), type: 'joke', jokeId: joke.id, versionId: version?.id }
        })
        .filter(Boolean)
      return {
        id: uid(),
        title: String(s.title),
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

  return { jokes, setlists }
}

// ── export helpers ────────────────────────────────────────────────────────────

// ── YAML export ───────────────────────────────────────────────────────────────

function q(s) {
  if (/[:#\[\]{}|>&*!'"@%`,]/.test(String(s)) || /^\s|\s$/.test(String(s))) {
    return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
  }
  return String(s)
}

export function exportToYaml({ jokes, setlists }) {
  const lines = [
    `# Satyryk export — ${new Date().toLocaleDateString()}`,
    '',
    'jokes:',
  ]

  for (const joke of jokes) {
    lines.push(`  - title: ${q(joke.title)}`)
    lines.push(`    status: ${joke.status}`)
    lines.push(`    tags: [${(joke.tags ?? []).map(q).join(', ')}]`)
    lines.push(`    versions:`)
    for (const v of joke.versions) {
      lines.push(`      - label: ${q(v.label)}`)
      if (v.parentId) {
        const parent = joke.versions.find(pv => pv.id === v.parentId)
        if (parent) lines.push(`        parentLabel: ${q(parent.label)}`)
      }
      const textLines = String(v.text ?? '').split('\n')
      if (textLines.length === 1) {
        lines.push(`        text: ${q(v.text ?? '')}`)
      } else {
        lines.push(`        text: |`)
        textLines.forEach(l => lines.push(`          ${l}`))
      }
      if (v.notes) lines.push(`        notes: ${q(v.notes)}`)
    }
  }

  if (setlists.length > 0) {
    lines.push('', 'setlists:')
    for (const sl of setlists) {
      lines.push(`  - title: ${q(sl.title)}`)
      lines.push(`    items:`)
      for (const item of sl.items) {
        if (item.type === 'segue') {
          lines.push(`      - type: segue`)
          lines.push(`        text: ${q(item.segueText ?? '')}`)
        } else {
          const joke = jokes.find(j => j.id === item.jokeId)
          const version = joke?.versions.find(v => v.id === item.versionId)
          if (joke) {
            lines.push(`      - type: joke`)
            lines.push(`        title: ${q(joke.title)}`)
            if (version) lines.push(`        version: ${q(version.label)}`)
          }
        }
      }
    }
  }

  return lines.join('\n') + '\n'
}

export function exportJokeMd(joke) {
  const lines = ['---', `title: "${joke.title}"`, `status: ${joke.status}`]
  if (joke.tags.length) lines.push(`tags: ${joke.tags.join(', ')}`)
  lines.push('---', '')
  for (const v of joke.versions) {
    lines.push(`## ${v.label}`, '', v.text || '')
    if (v.notes) {
      lines.push('')
      v.notes.split('\n').forEach(l => lines.push(`> ${l}`))
    }
    lines.push('')
  }
  return lines.join('\n')
}

export function exportSetlistMd(setlist, jokes) {
  const lines = [`# ${setlist.title}`, '', `_${new Date().toLocaleDateString()}_`, '']
  setlist.items.forEach((item, i) => {
    if (item.type === 'segue') {
      lines.push(`${i + 1}. *[SEGUE]* ${item.segueText || ''}`)
    } else {
      const joke = jokes.find(j => j.id === item.jokeId)
      const ver = joke?.versions.find(v => v.id === item.versionId)
      lines.push(`${i + 1}. **${joke?.title ?? 'Unknown'}** (${ver?.label ?? '?'})`)
    }
  })
  return lines.join('\n')
}

export function download(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function uid() { return crypto.randomUUID() }
