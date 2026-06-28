const VALID_STATUSES = ['idea', 'draft', 'working', 'polished', 'retired']

export function parseJokeMd(content, filename = 'joke.md') {
  let title = filename.replace(/\.md$/i, '').replace(/[-_]/g, ' ')
  let status = 'draft'
  let tags = []
  let body = content.trim()

  const fmMatch = body.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/)
  if (fmMatch) {
    const fm = fmMatch[1]
    body = fmMatch[2].trim()
    const tm = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    if (tm) title = tm[1].trim()
    const sm = fm.match(/^status:\s*(\w+)/m)
    if (sm && VALID_STATUSES.includes(sm[1])) status = sm[1]
    const tgm = fm.match(/^tags:\s*(.+)$/m)
    if (tgm) tags = tgm[1].split(',').map(t => t.trim()).filter(Boolean)
  }

  const parts = body.split(/^## (v\d+[^\n]*)\s*$/m)
  const versions = []
  for (let i = 1; i < parts.length; i += 2) {
    const label = parts[i].trim()
    const raw = (parts[i + 1] || '').trim()
    versions.push({ id: uid(), label, ...splitNotes(raw) })
  }
  if (!versions.length) {
    versions.push({ id: uid(), label: 'v1', ...splitNotes(body) })
  }

  return {
    id: uid(),
    title,
    status,
    tags,
    versions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function splitNotes(raw) {
  const textLines = [], noteLines = []
  for (const line of raw.split('\n')) {
    if (/^>\s?/.test(line)) noteLines.push(line.replace(/^>\s?/, ''))
    else textLines.push(line)
  }
  return { text: textLines.join('\n').trim(), notes: noteLines.join('\n').trim() }
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
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function uid() {
  return crypto.randomUUID()
}
