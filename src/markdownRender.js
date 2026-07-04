// Minimal Markdown → HTML renderer for the in-app guide.
// Supports the subset used in docs/*.md: headings, paragraphs, bold/italic,
// inline code, links, blockquotes, ordered/unordered lists, tables and rules.
// Content is our own trusted docs, so output is injected as-is.

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function slug(s) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')
}

// Inline formatting, applied to already block-split text.
function inline(s) {
  let h = escapeHtml(s)
  h = h.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`)
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const ext = /^https?:\/\//.test(url)
    return `<a href="${url}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`
  })
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return h
}

function splitRow(line) {
  let s = line.trim()
  if (s.startsWith('|')) s = s.slice(1)
  if (s.endsWith('|')) s = s.slice(0, -1)
  return s.split('|').map(c => c.trim())
}

const BLOCK_START = /^(#{1,6}\s|>|\s*[-*]\s|\s*\d+\.\s|\|)/

export function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) { i++; continue }

    if (/^---+$/.test(line.trim())) { out.push('<hr/>'); i++; continue }

    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      const lvl = h[1].length
      out.push(`<h${lvl} id="${slug(h[2])}">${inline(h[2])}</h${lvl}>`)
      i++; continue
    }

    // table: header row followed by a |---|---| separator
    if (line.trim().startsWith('|') && i + 1 < lines.length &&
        /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const header = splitRow(line)
      i += 2
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(splitRow(lines[i])); i++ }
      let t = '<table><thead><tr>' + header.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'
      t += rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('')
      out.push(t + '</tbody></table>')
      continue
    }

    if (line.trim().startsWith('>')) {
      const buf = []
      while (i < lines.length && lines[i].trim().startsWith('>')) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++ }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`)
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++ }
      out.push('<ol>' + items.map(it => `<li>${inline(it)}</li>`).join('') + '</ol>')
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++ }
      out.push('<ul>' + items.map(it => `<li>${inline(it)}</li>`).join('') + '</ul>')
      continue
    }

    // paragraph: gather consecutive non-block lines
    const buf = []
    while (i < lines.length && lines[i].trim() &&
           !BLOCK_START.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
      buf.push(lines[i]); i++
    }
    out.push(`<p>${inline(buf.join(' '))}</p>`)
  }

  return out.join('\n')
}
