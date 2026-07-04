import { useMemo, useEffect } from 'react'
import { useLang } from '../LanguageContext'
import { renderMarkdown } from '../markdownRender'
import guidePl from '../../docs/instrukcja-obslugi.md?raw'
import guideEn from '../../docs/user-guide.md?raw'

const GUIDES = { pl: guidePl, en: guideEn }

const CSS = `
.md-body { color:#374151; font-size:14px; line-height:1.65; }
.md-body > *:first-child { margin-top:0; }
.md-body h1 { font-size:1.5rem; font-weight:700; color:#111827; margin:0 0 .5rem; }
.md-body h2 { font-size:1.15rem; font-weight:700; color:#111827; margin:1.75rem 0 .5rem; }
.md-body h3 { font-size:1rem; font-weight:600; color:#111827; margin:1.25rem 0 .4rem; }
.md-body p { margin:.6rem 0; }
.md-body ul, .md-body ol { margin:.6rem 0; padding-left:1.4rem; }
.md-body ul { list-style:disc; }
.md-body ol { list-style:decimal; }
.md-body li { margin:.25rem 0; }
.md-body a { color:#4f46e5; text-decoration:underline; }
.md-body code { background:#f3f4f6; padding:.1rem .3rem; border-radius:.25rem; font-size:.85em; font-family:ui-monospace,monospace; }
.md-body hr { border:0; border-top:1px solid #e5e7eb; margin:1.25rem 0; }
.md-body blockquote { border-left:3px solid #d1d5db; padding:.25rem 0 .25rem .75rem; color:#6b7280; margin:.75rem 0; font-style:italic; }
.md-body table { border-collapse:collapse; width:100%; margin:.75rem 0; font-size:.9em; }
.md-body th, .md-body td { border:1px solid #e5e7eb; padding:.4rem .6rem; text-align:left; vertical-align:top; }
.md-body th { background:#f9fafb; font-weight:600; }
.md-body strong { font-weight:600; color:#111827; }
`

export default function GuideModal({ onClose }) {
  const { lang, t } = useLang()
  const html = useMemo(() => renderMarkdown(GUIDES[lang] ?? guideEn), [lang])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Keep in-page anchor (TOC) navigation inside the modal; neutralise the
  // cross-language .md link so it doesn't navigate the app away.
  function handleClick(e) {
    const a = e.target.closest('a')
    if (!a) return
    const href = a.getAttribute('href') ?? ''
    if (href.startsWith('#')) {
      e.preventDefault()
      const el = e.currentTarget.querySelector(`#${window.CSS.escape(href.slice(1))}`)
      el?.scrollIntoView({ behavior: 'smooth' })
    } else if (!/^https?:\/\//.test(href)) {
      e.preventDefault()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <style>{CSS}</style>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <span aria-hidden="true">📖</span>{t.guide}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none">✕</button>
        </div>
        <div
          className="overflow-y-auto flex-1 px-6 py-5 md-body"
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
