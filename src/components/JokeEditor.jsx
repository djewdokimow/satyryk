import { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../LanguageContext'
import TextWithComments from './TextWithComments'
import RatingPicker from './Rating'

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
function blankVersion(n) { return { id: uid(), label: `v${n}`, text: '', notes: '', cues: '', parentId: null, comments: [], rating: undefined, duration: '' } }

// Build a parent→children tree from a flat versions array.
function buildTree(versions) {
  const map = new Map(versions.map(v => [v.id, { ...v, children: [] }]))
  const roots = []
  for (const v of versions) {
    const node = map.get(v.id)
    if (v.parentId && map.has(v.parentId)) {
      map.get(v.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

// A single node in the version tree.
function TreeNode({ node, activeVid, onSelect }) {
  const isActive = node.id === activeVid
  const preview = (node.text || '').split('\n').find(l => l.trim()) ?? '—'

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        className={`w-full text-left flex items-baseline gap-3 px-2.5 py-1.5 rounded-lg transition-colors ${
          isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
        }`}
      >
        <span className={`font-mono text-xs font-semibold shrink-0 w-12 ${isActive ? 'text-white' : 'text-gray-600'}`}>
          {node.label}
        </span>
        <span className={`text-xs truncate ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
          {preview.length > 72 ? preview.slice(0, 70) + '…' : preview}
        </span>
      </button>

      {node.children.length > 0 && (
        <div className="ml-4 pl-3 border-l-2 border-gray-200 mt-0.5 mb-0.5">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} activeVid={activeVid} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function JokeEditor({ joke, dispatch, onBack, initialVersionId }) {
  const { t, lang } = useLang()

  const initial = joke ?? {
    id: uid(),
    title: t.newJokeTitle,
    status: 'idea',
    tags: [],
    versions: [blankVersion(1)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const [form, setForm]         = useState(initial)
  const [activeVid, setActiveVid] = useState(
    (initialVersionId && initial.versions.some(v => v.id === initialVersionId))
      ? initialVersionId
      : initial.versions[0]?.id
  )
  const [tagsRaw, setTagsRaw]   = useState(initial.tags.join(', '))
  const [canUndo, setCanUndo]   = useState(false)
  const [canRedo, setCanRedo]   = useState(false)
  const [showTree, setShowTree]             = useState(false)

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
    save({ versions: form.versions.map(v => v.id === id ? { ...v, ...patch } : v) }, deferred)
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

  // Add a blank version (no parent lineage).
  function addVersion() {
    const v = blankVersion(form.versions.length + 1)
    save({ versions: [...form.versions, v] })
    setActiveVid(v.id)
  }

  // Branch: copy text from fromId, set parentId.
  function branchVersion(fromId) {
    const source = form.versions.find(v => v.id === fromId)
    const v = {
      id: uid(),
      label: `v${form.versions.length + 1}`,
      text: source?.text ?? '',
      notes: '',
      cues: source?.cues ?? '',
      parentId: fromId,
      comments: [],
      rating: undefined,
      duration: '',
    }
    save({ versions: [...form.versions, v] })
    setActiveVid(v.id)
  }

  function deleteVersion(id) {
    if (form.versions.length <= 1) return
    if (!confirm(t.deleteVersionConfirm)) return
    const versions = form.versions.filter(v => v.id !== id)
    // Re-parent any children of the deleted version to its parent (or null).
    const deleted = form.versions.find(v => v.id === id)
    const reparented = versions.map(v =>
      v.parentId === id ? { ...v, parentId: deleted?.parentId ?? null } : v
    )
    save({ versions: reparented })
    setActiveVid(reparented.at(-1).id)
  }

  function handleDelete() {
    if (!confirm(t.deleteJokeConfirm(form.title))) return
    dispatch({ type: 'DELETE_JOKE', id: form.id })
    onBack()
  }

  function handleTagsBlur() {
    save({ tags: tagsRaw.split(',').map(s => s.trim()).filter(Boolean) })
  }

  const active = form.versions.find(v => v.id === activeVid) ?? form.versions[0]
  const treeRoots = buildTree(form.versions)
  const hasTree = form.versions.some(v => v.parentId)

  return (
    <div>
      {/* ── top bar ── */}
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800 transition-colors shrink-0">
          {t.back}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={undo} disabled={!canUndo}
            className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            {t.undo}
          </button>
          <button onClick={redo} disabled={!canRedo}
            className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            {t.redo}
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={handleDelete}
            className="px-3 py-1.5 text-sm border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
            {t.delete}
          </button>
        </div>
      </div>

      {/* ── title ── */}
      <input
        type="text"
        value={form.title}
        onChange={e => save({ title: e.target.value }, true)}
        onBlur={e => commitNow({ ...form, title: e.target.value })}
        className="w-full text-2xl font-bold text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none pb-2 mb-6 transition-colors"
        placeholder={t.jokeTitlePlaceholder}
      />

      {/* ── status ── */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t.statusLabel}</label>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => save({ status: s })}
              className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${
                form.status === s ? STATUS_ACTIVE[s] : `border ${STATUS_IDLE[s]}`
              }`}>
              {t.status[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── tags ── */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t.tagsLabel}</label>
        <input type="text" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} onBlur={handleTagsBlur}
          placeholder={t.tagsPlaceholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
      </div>

      {/* ── versions ── */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.versionsLabel}</label>
          {(hasTree || showTree) && (
            <button
              onClick={() => setShowTree(v => !v)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 ${
                showTree
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700'
              }`}
            >
              <span>⎇</span> {showTree ? t.hideTree : t.showTree}
            </button>
          )}
        </div>

        {/* version tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {form.versions.map(v => (
            <button key={v.id} onClick={() => setActiveVid(v.id)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                v.id === activeVid
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
              {v.label}
            </button>
          ))}
          <button onClick={addVersion}
            className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors">
            {t.addVersion}
          </button>
        </div>

        {/* tree panel */}
        {showTree && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">{t.versionTreeTitle}</p>
            <div className="space-y-0.5">
              {treeRoots.map(root => (
                <TreeNode key={root.id} node={root} activeVid={activeVid} onSelect={setActiveVid} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── version editor ── */}
      {active && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          {/* label row */}
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide shrink-0">{t.labelLabel}</label>
              <input type="text" value={active.label}
                onChange={e => saveVersion(active.id, { label: e.target.value }, true)}
                onBlur={() => commitNow(form)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 w-28" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-sm leading-none">⏱</span>
                <input
                  type="text"
                  value={active.duration ?? ''}
                  onChange={e => saveVersion(active.id, { duration: e.target.value }, true)}
                  onBlur={() => commitNow(form)}
                  placeholder={t.durationPlaceholder}
                  className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-600 placeholder-gray-300"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { branchVersion(active.id); setShowTree(true) }}
                title={t.branchVersion}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-500 transition-colors"
              >
                {t.branchVersion}
              </button>
              {form.versions.length > 1 && (
                <button onClick={() => deleteVersion(active.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors">
                  {t.deleteVersion}
                </button>
              )}
            </div>
          </div>

          {/* parent indicator */}
          {active.parentId && (() => {
            const parent = form.versions.find(v => v.id === active.parentId)
            return parent ? (
              <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
                <span>↳</span>
                <span>{lang === 'pl' ? 'gałąź od' : 'branched from'}</span>
                <button onClick={() => setActiveVid(parent.id)}
                  className="font-mono font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors">
                  {parent.label}
                </button>
              </p>
            ) : null
          })()}

          {/* rating */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.ratingLabel}</span>
            <RatingPicker value={active.rating} onChange={r => saveVersion(active.id, { rating: r })} />
          </div>

          {/* text */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t.textLabel}</label>
            <TextWithComments
              text={active.text}
              comments={active.comments ?? []}
              onChange={text => saveVersion(active.id, { text }, true)}
              onBlur={() => commitNow(form)}
              onAddComment={(start, end, quote, commentText) => {
                const c = { id: uid(), start, end, quote, text: commentText, createdAt: new Date().toISOString() }
                saveVersion(active.id, { comments: [...(active.comments ?? []), c] })
              }}
              onDeleteComment={cid =>
                saveVersion(active.id, { comments: (active.comments ?? []).filter(c => c.id !== cid) })
              }
              placeholder={t.textPlaceholder}
              t={t}
            />
          </div>

          {/* notes */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t.notesLabel}</label>
            <textarea value={active.notes}
              onChange={e => saveVersion(active.id, { notes: e.target.value }, true)}
              onBlur={() => commitNow(form)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-500 italic"
              placeholder={t.notesPlaceholder} />
          </div>

          {/* setlist cues (M5Stack prompter) */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t.cuesLabel}</label>
            <textarea value={active.cues ?? ''}
              onChange={e => saveVersion(active.id, { cues: e.target.value }, true)}
              onBlur={() => commitNow(form)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-600 font-mono"
              placeholder={t.cuesPlaceholder} />
          </div>
        </div>
      )}
    </div>
  )
}
