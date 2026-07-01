import { useState, useMemo } from 'react'
import { useLang } from '../LanguageContext'
import { calcSetlistDuration } from '../utils'

export function buildPrintText(setlist, jokes, opts, duration) {
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
    if (opts.showTitle) parts.push(joke.title)

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

export default function PrintDialog({ setlist, jokes, onClose }) {
  const { t } = useLang()
  const [opts, setOpts] = useState({
    showTitle:      true,
    includeNotes:   false,
    includeSegues:  true,
    preserveEnters: false,
    includeTime:    false,
  })

  const duration = useMemo(() => calcSetlistDuration(setlist, jokes), [setlist, jokes])
  const text = useMemo(() => buildPrintText(setlist, jokes, opts, duration), [setlist, jokes, opts, duration])

  function toggle(key) {
    setOpts(o => ({ ...o, [key]: !o[key] }))
  }

  function doPrint() {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    const title = setlist.title.replace(/</g, '&lt;')
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      font-family: ui-monospace, 'Courier New', monospace;
      white-space: pre-wrap;
      padding: 2cm;
      line-height: 1.7;
      font-size: 12pt;
      color: #111;
      margin: 0;
    }
  </style>
</head>
<body>${escaped}<script>window.print();</script></body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[85vh] flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t.printOptions}</h2>

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
        <pre className="flex-1 min-h-0 overflow-y-auto text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap font-mono mb-4">
          {text}
        </pre>

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
