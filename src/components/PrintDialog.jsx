import { useState, useMemo } from 'react'
import { useLang } from '../LanguageContext'
import { calcSetlistDuration } from '../utils'

const FONT_PT = { sm: 13, md: 16, lg: 20 }

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── RAW: monospace plain text ─────────────────────────────────────────────────
export function buildPrintText(setlist, jokes, opts, duration, roleLabels = null) {
  const blocks = []
  setlist.items.forEach(item => {
    if (item.type === 'segue') {
      if (opts.includeSegues && item.segueText?.trim()) {
        blocks.push(`— ${item.segueText.trim()} —`)
      }
      return
    }

    const joke    = jokes.find(j => j.id === item.jokeId)
    const version = joke?.versions.find(v => v.id === item.versionId) ?? joke?.versions[0]
    if (!joke || !version) return

    const parts = []
    if (opts.showTitle) {
      const mark = roleLabels && item.role ? ` (${roleLabels[item.role]})` : ''
      parts.push(joke.title + mark)
    }

    let text = (version.text ?? '').trim()
    if (!opts.preserveEnters) text = text.replace(/\n{2,}/g, '\n')
    parts.push(text)

    if (opts.includeNotes && version.notes?.trim()) parts.push(`[${version.notes.trim()}]`)

    blocks.push(parts.join('\n'))
  })

  const body = blocks.join('\n\n')
  if (!opts.includeTime || !duration) return body
  const timeLine = duration === '?'
    ? `⏱ ?${setlist.showTime ? `  🎤 ${setlist.showTime}` : ''}`
    : `⏱ ~${duration}${setlist.showTime ? `  🎤 ${setlist.showTime}` : ''}`
  return `${timeLine}\n\n${body}`
}

// ── PRETTY: styled HTML, mirrors the on-screen preview ────────────────────────
export function buildPrettyBody(setlist, jokes, opts, duration, roleLabels = null) {
  const out = [`<h1>${escapeHtml(setlist.title)}</h1>`]

  if (opts.includeTime && duration) {
    const meta = [duration === '?' ? '⏱ ?' : `⏱ ~${duration}`]
    if (setlist.showTime) meta.push(`🎤 ${setlist.showTime}`)
    out.push(`<p class="meta">${escapeHtml(meta.join(' · '))}</p>`)
  }

  setlist.items.forEach(item => {
    if (item.type === 'segue') {
      if (opts.includeSegues && item.segueText?.trim()) {
        out.push(`<div class="segue">— ${escapeHtml(item.segueText.trim())} —</div>`)
      }
      return
    }

    const joke    = jokes.find(j => j.id === item.jokeId)
    const version = joke?.versions.find(v => v.id === item.versionId) ?? joke?.versions[0]
    if (!joke || !version) return

    let text = (version.text ?? '').trim()
    if (!opts.preserveEnters) text = text.replace(/\n{2,}/g, '\n')

    const roleMark = roleLabels && item.role
      ? ` <span class="role">(${escapeHtml(roleLabels[item.role])})</span>` : ''
    const titleHtml = opts.showTitle ? `<h2>${escapeHtml(joke.title)}${roleMark}</h2>` : ''
    const notesHtml = opts.includeNotes && version.notes?.trim()
      ? `<p class="notes">${escapeHtml(version.notes.trim())}</p>` : ''

    out.push(`<section class="bit ${item.role ?? ''}">${titleHtml}<p class="text">${escapeHtml(text)}</p>${notesHtml}</section>`)
  })

  return out.join('\n')
}

// `root` is the selector everything is scoped under: `body` for the print
// window, a wrapper class for the in-dialog preview (so it can't leak).
function prettyStyles(pt, root) {
  const s = n => `${(pt * n).toFixed(1)}pt`
  return `
${root} { font-family: Georgia, 'Times New Roman', serif; color:#111; font-size:${pt}pt; line-height:1.5; }
${root} h1 { font-size:${s(1.6)}; font-weight:700; margin:0 0 .3em; }
${root} .meta { color:#666; font-size:${s(0.72)}; margin:0 0 1.4em; }
${root} .bit { margin:0 0 1.3em; padding-left:.6em; border-left:3px solid #ddd; }
${root} .bit.optional { border-left-color:#e0a800; }
${root} .bit.saver { border-left-color:#3b9ae1; }
${root} h2 { font-size:${s(1.1)}; font-weight:700; margin:0 0 .3em; }
${root} .role { font-size:${s(0.75)}; color:#888; font-weight:400; }
${root} .text { white-space:pre-wrap; margin:0; }
${root} .notes { color:#666; font-style:italic; font-size:${s(0.82)}; margin:.4em 0 0; }
${root} .segue { text-align:center; color:#999; font-style:italic; font-size:${s(0.85)}; margin:1.1em 0; }
`
}

export default function PrintDialog({ setlist, jokes, onClose }) {
  const { t } = useLang()
  const [style, setStyle]       = useState('raw')
  const [fontSize, setFontSize] = useState('md')
  const [opts, setOpts] = useState({
    showTitle:      true,
    includeNotes:   false,
    includeSegues:  true,
    preserveEnters: false,
    includeTime:    false,
  })

  const roleLabels = useMemo(() => ({ optional: t.roleOptional, saver: t.roleSaver }), [t])
  const duration = useMemo(() => calcSetlistDuration(setlist, jokes), [setlist, jokes])
  const rawText  = useMemo(
    () => buildPrintText(setlist, jokes, opts, duration, roleLabels),
    [setlist, jokes, opts, duration, roleLabels],
  )
  const prettyBody = useMemo(
    () => buildPrettyBody(setlist, jokes, opts, duration, roleLabels),
    [setlist, jokes, opts, duration, roleLabels],
  )

  function toggle(key) {
    setOpts(o => ({ ...o, [key]: !o[key] }))
  }

  function doPrint() {
    const pt    = FONT_PT[fontSize]
    const title = escapeHtml(setlist.title)
    const inner = style === 'pretty'
      ? `<style>body{margin:0;padding:2cm;}${prettyStyles(pt, 'body')}</style></head><body>${prettyBody}`
      : `<style>body{font-family:ui-monospace,'Courier New',monospace;white-space:pre-wrap;padding:2cm;line-height:1.6;font-size:${pt}pt;color:#111;margin:0;}</style></head><body>${escapeHtml(rawText)}`
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>${inner}<script>window.print();</script></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[85vh] flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t.printOptions}</h2>

        {/* Style + font size */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.printStyle}</span>
            <Segmented
              value={style}
              onChange={setStyle}
              options={[['raw', t.printStyleRaw], ['pretty', t.printStylePretty]]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.printFontSize}</span>
            <Segmented
              value={fontSize}
              onChange={setFontSize}
              options={[['sm', 'S'], ['md', 'M'], ['lg', 'L']]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={opts.showTitle} onChange={() => toggle('showTitle')} />
            {t.printShowTitle}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={opts.includeNotes} onChange={() => toggle('includeNotes')} />
            {t.printIncludeNotes}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={opts.includeSegues} onChange={() => toggle('includeSegues')} />
            {t.printIncludeSegues}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={opts.preserveEnters} onChange={() => toggle('preserveEnters')} />
            {t.printPreserveEnters}
          </label>
          {duration && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={opts.includeTime} onChange={() => toggle('includeTime')} />
              {t.printIncludeTime}
              <span className="text-gray-400 text-xs">
                ({duration === '?' ? '?' : `~${duration}`}{setlist.showTime ? ` · 🎤 ${setlist.showTime}` : ''})
              </span>
            </label>
          )}
        </div>

        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
          {t.printPreviewLabel}
        </div>
        {style === 'pretty' ? (
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <style>{prettyStyles(11, '.pretty-prev')}</style>
            <div className="pretty-prev" dangerouslySetInnerHTML={{ __html: prettyBody }} />
          </div>
        ) : (
          <pre className="flex-1 min-h-0 overflow-y-auto text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap font-mono mb-4">
            {rawText}
          </pre>
        )}

        <div className="flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={doPrint}
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t.printPdf}
          </button>
        </div>
      </div>
    </div>
  )
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
      {options.map(([val, label]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={`px-2.5 py-1 text-xs font-medium transition-colors ${
            value === val ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
