import { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../LanguageContext'

const STATUS_ACTIVE = {
  idea:     'bg-gray-500 text-white',
  draft:    'bg-amber-500 text-white',
  working:  'bg-sky-500 text-white',
  polished: 'bg-emerald-500 text-white',
  retired:  'bg-rose-500 text-white',
}

const STATUS_IDLE = {
  idea:     'border-gray-300 text-gray-500 hover:bg-gray-50',
  draft:    'border-amber-300 text-amber-600 hover:bg-amber-50',
  working:  'border-sky-300 text-sky-600 hover:bg-sky-50',
  polished: 'border-emerald-300 text-emerald-600 hover:bg-emerald-50',
  retired:  'border-rose-300 text-rose-500 hover:bg-rose-50',
}

const STATUS_OPTIONS = ['idea', 'draft', 'working', 'polished', 'retired']

function uid() { return crypto.randomUUID() }
function newVersion(n) { return { id: uid(), label: `v${n}`, text: '', notes: '' } }

export default function JokeEditor({ joke, dispatch, onBack }) {
  const { t } = useLang()

  const initial = joke ?? {
    id: uid(),
    title: t.newJokeTitle,
    status: 'idea',
    tags: [],
    versions: [newVersion(1)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const [form, setForm] = useState(initial)
  const [activeVid, setActiveVid] = useState(initial.versions[0]?.id)
  const [tagsRaw, setTagsRaw] = useState(initial.tags.join(', '))
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const histRef    = useRef([JSON.stringify(initial)])
  const histIdxRef = useRef(0)
  const commitRef  = useRef(null)

  function refreshNavState() {
    setCanUndo(histIdxRef.current > 0)
    setCanRedo(histIdxRef.current < histRef.current.length - 1)
  }

  function commitNow(state) {
    clearTimeout(commitRef.current)
    const snap = JSON.stringify(state)
    if (snap === histRef.current[histIdxRef.current]) return
    const trimmed = histRef.current.slice(0, histIdxRef.current + 1)
    trimmed.push(snap)
    histRef.current = trimmed.slice(-50)
    histIdxRef.current = histRef.current.length - 1
    refreshNavState()
  }

  function commitLater(state) {
    clearTimeout(commitRef.current)
    commitRef.current = setTimeout(() => commitNow(state), 1500)
  }

  function save(patch, deferred = false) {
    const next = { ...form, ...patch, updatedAt: new Date().toISOString() }
    setForm(next)
    dispatch({ type: 'SAVE_JOKE', joke: next })
    if (deferred) commitLater(next)
    else commitNow(next)
    return next
  }

  function saveVersion(id, patch, deferred = false) {
    const versions = form.versions.map(v => v.id === id ? { ...v, ...patch } : v)
    save({ versions }, deferred)
  }

  const undo = useCallback(() => {
    clearTimeout(commitRef.current)
    if (histIdxRef.current <= 0) return
    histIdxRef.current--
    const prev = JSON.parse(histRef.current[histIdxRef.current])
    setForm(prev)
    setTagsRaw(prev.tags.join(', '))
    if (!prev.versions.some(v => v.id === activeVid)) setActiveVid(prev.versions[0]?.id)
    dispatch({ type: 'SAVE_JOKE', joke: prev })
    refreshNavState()
  }, [activeVid, dispatch])

  const redo = useCallback(() => {
    clearTimeout(commitRef.current)
    if (histIdxRef.current >= histRef.current.length - 1) return
    histIdxRef.current++
    const next = JSON.parse(histRef.current[histIdxRef.current])
    setForm(next)
    setTagsRaw(next.tags.join(', '))
    if (!next.versions.some(v => v.id === activeVid)) setActiveVid(next.versions[0]?.id)
    dispatch({ type: 'SAVE_JOKE', joke: next })
    refreshNavState()
  }, [activeVid, dispatch])

  useEffect(() => {
    function onKey(e) {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'z') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      if (e.shiftKey) redo(); else undo()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [undo, redo])

  function addVersion() {
    const v = newVersion(form.versions.length + 1)
    save({ versions: [...form.versions, v] })
    setActiveVid(v.id)
  }

  function deleteVersion(id) {
    if (form.versions.length <= 1) return
    if (!confirm(t.deleteVersionConfirm)) return
    const versions = form.versions.filter(v => v.id !== id)
    save({ versions })
    setActiveVid(versions.at(-1).id)
  }

  function handleDelete() {
    if (!confirm(t.deleteJokeConfirm(form.title))) return
    dispatch({ type: 'DELETE_JOKE', id: form.id })
    onBack()
  }

  function handleTagsBlur() {
    const tags = tagsRaw.split(',').map(s => s.trim()).filter(Boolean)
    save({ tags })
  }

  const active = form.versions.find(v => v.id === activeVid) ?? form.versions[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          {t.back}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t.undo}
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t.redo}
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={handleDelete} className="px-3 py-1.5 text-sm border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
            {t.delete}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={form.title}
        onChange={e => save({ title: e.target.value }, true)}
        onBlur={e => commitNow({ ...form, title: e.target.value })}
        className="w-full text-2xl font-bold text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none pb-2 mb-6 transition-colors"
        placeholder={t.jokeTitlePlaceholder}
      />

      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t.statusLabel}</label>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => save({ status: s })}
              className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${
                form.status === s ? STATUS_ACTIVE[s] : `border ${STATUS_IDLE[s]}`
              }`}
            >
              {t.status[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t.tagsLabel}</label>
        <input
          type="text"
          value={tagsRaw}
          onChange={e => setTagsRaw(e.target.value)}
          onBlur={handleTagsBlur}
          placeholder={t.tagsPlaceholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">{t.versionsLabel}</label>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {form.versions.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveVid(v.id)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                v.id === activeVid
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v.label}
            </button>
          ))}
          <button
            onClick={addVersion}
            className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors"
          >
            {t.addVersion}
          </button>
        </div>
      </div>

      {active && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide shrink-0">{t.labelLabel}</label>
              <input
                type="text"
                value={active.label}
                onChange={e => saveVersion(active.id, { label: e.target.value }, true)}
                onBlur={() => commitNow(form)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 w-48"
              />
            </div>
            {form.versions.length > 1 && (
              <button
                onClick={() => deleteVersion(active.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                {t.deleteVersion}
              </button>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t.textLabel}</label>
            <textarea
              value={active.text}
              onChange={e => saveVersion(active.id, { text: e.target.value }, true)}
              onBlur={() => commitNow(form)}
              rows={14}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg font-mono resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 leading-relaxed"
              placeholder={t.textPlaceholder}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t.notesLabel}</label>
            <textarea
              value={active.notes}
              onChange={e => saveVersion(active.id, { notes: e.target.value }, true)}
              onBlur={() => commitNow(form)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-500 italic"
              placeholder={t.notesPlaceholder}
            />
          </div>
        </div>
      )}
    </div>
  )
}
