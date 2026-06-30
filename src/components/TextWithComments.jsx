import { useState, useRef, useEffect } from 'react'

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildHighlightedHtml(text, comments) {
  if (!comments?.length) return escapeHtml(text)

  const ranges = comments
    .map(c => ({ start: Math.max(0, c.start), end: Math.min(text.length, c.end) }))
    .filter(r => r.end > r.start)
    .sort((a, b) => a.start - b.start)

  const merged = []
  for (const r of ranges) {
    if (!merged.length || r.start >= merged.at(-1).end) merged.push({ ...r })
    else merged.at(-1).end = Math.max(merged.at(-1).end, r.end)
  }

  let html = ''
  let pos  = 0
  for (const r of merged) {
    html += escapeHtml(text.slice(pos, r.start))
    html += `<mark style="background:rgba(251,191,36,0.42);border-radius:2px">${escapeHtml(text.slice(r.start, r.end))}</mark>`
    pos = r.end
  }
  return html + escapeHtml(text.slice(pos))
}

export default function TextWithComments({
  text, comments = [], onChange, onBlur,
  onAddComment, onDeleteComment,
  placeholder, rows = 14, t,
}) {
  const [hasSel, setHasSel]   = useState(false)
  const [pending, setPending] = useState(null)  // { start, end, quote, input }
  const selRef                = useRef(null)    // stable selection; not wiped by blur timing
  const textareaRef           = useRef(null)
  const backdropRef           = useRef(null)
  const inputRef              = useRef(null)

  // selectionchange is the most reliable way to track textarea selections.
  // onMouseUp misses drags that end outside the textarea; onKeyUp misses mouse.
  useEffect(() => {
    function onSelChange() {
      const ta = textareaRef.current
      if (!ta || document.activeElement !== ta) return
      const { selectionStart: s, selectionEnd: e } = ta
      if (e > s) {
        selRef.current = { start: s, end: e, quote: ta.value.slice(s, e) }
        setHasSel(true)
      } else {
        selRef.current = null
        setHasSel(false)
      }
    }
    document.addEventListener('selectionchange', onSelChange)
    return () => document.removeEventListener('selectionchange', onSelChange)
  }, [])

  // Sync backdrop scroll position with textarea.
  function handleScroll(e) {
    if (backdropRef.current) backdropRef.current.scrollTop = e.target.scrollTop
  }

  // onMouseDown (not onClick) so we fire before any blur clears the selection.
  // preventDefault keeps textarea focused so selectionStart/End remain valid.
  function openComment(e) {
    e.preventDefault()
    const s = selRef.current
    if (!s) return
    selRef.current = null
    setHasSel(false)
    setPending({ ...s, input: '' })
    // Focus the comment input on next tick (after React re-renders the input).
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function submitComment() {
    if (!pending?.input.trim()) return
    onAddComment(pending.start, pending.end, pending.quote, pending.input.trim())
    setPending(null)
  }

  return (
    <div>
      {/* textarea + backdrop */}
      <div className="relative">
        {/* Backdrop: color:transparent means only the <mark> backgrounds show,
            not the text itself — prevents the doubled-text visual artifact. */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          style={{ color: 'transparent' }}
          className="absolute inset-0 px-3 py-2.5 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words overflow-hidden pointer-events-none select-none rounded-lg"
          dangerouslySetInnerHTML={{ __html: buildHighlightedHtml(text, comments) }}
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => onChange(e.target.value)}
          onBlur={() => { selRef.current = null; setHasSel(false); onBlur() }}
          onScroll={handleScroll}
          rows={rows}
          className="relative w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg font-mono resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 leading-relaxed bg-transparent"
          placeholder={placeholder}
          spellCheck={false}
        />
        {/* "Add comment" badge in top-right corner — visible whenever text is selected.
            Anchored inside the wrapper so it never floats off-screen. */}
        {hasSel && !pending && (
          <button
            onMouseDown={openComment}
            className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-md shadow-md hover:bg-gray-700 flex items-center gap-1.5 transition-colors z-10"
          >
            💬 {t.addComment}
          </button>
        )}
      </div>

      {/* Inline comment input — appears below the textarea, no z-index fighting */}
      {pending && (
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-600 font-mono mb-2 break-words line-clamp-2">
            «{pending.quote.length > 80 ? pending.quote.slice(0, 78) + '…' : pending.quote}»
          </p>
          <textarea
            ref={inputRef}
            className="w-full text-sm border border-amber-200 bg-white rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
            rows={2}
            value={pending.input}
            onChange={e => setPending(p => ({ ...p, input: e.target.value }))}
            placeholder={t.commentPlaceholder}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() }
              if (e.key === 'Escape') setPending(null)
            }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setPending(null)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={submitComment}
              disabled={!pending.input.trim()}
              className="text-xs bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t.addComment}
            </button>
          </div>
        </div>
      )}

      {/* Saved comments */}
      {comments.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5 items-start bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <span className="text-amber-400 shrink-0 text-sm leading-none mt-0.5">💬</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-500 font-mono mb-0.5 truncate">
                  «{c.quote.length > 60 ? c.quote.slice(0, 58) + '…' : c.quote}»
                </p>
                <p className="text-sm text-gray-700 break-words">{c.text}</p>
              </div>
              <button
                onClick={() => onDeleteComment(c.id)}
                className="text-amber-200 hover:text-red-400 transition-colors shrink-0 text-sm leading-none mt-0.5"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
