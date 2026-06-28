import { useState } from 'react'
import { exportJokeMd, download } from '../markdown'

const STATUS_OPTIONS = ['idea', 'draft', 'working', 'polished', 'retired']

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

function uid() { return crypto.randomUUID() }
function newVersion(n) { return { id: uid(), label: `v${n}`, text: '', notes: '' } }
function slug(title) { return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'joke' }

export default function JokeEditor({ joke, dispatch, onBack }) {
  const [form, setForm] = useState(() => joke ?? {
    id: uid(),
    title: 'New Joke',
    status: 'idea',
    tags: [],
    versions: [newVersion(1)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const [activeVid, setActiveVid] = useState(form.versions[0]?.id)
  const [tagsRaw, setTagsRaw] = useState(form.tags.join(', '))

  function save(patch) {
    const next = { ...form, ...patch, updatedAt: new Date().toISOString() }
    setForm(next)
    dispatch({ type: 'SAVE_JOKE', joke: next })
  }

  function saveVersion(id, patch) {
    const versions = form.versions.map(v => v.id === id ? { ...v, ...patch } : v)
    save({ versions })
  }

  function addVersion() {
    const v = newVersion(form.versions.length + 1)
    const versions = [...form.versions, v]
    save({ versions })
    setActiveVid(v.id)
  }

  function deleteVersion(id) {
    if (form.versions.length <= 1) return
    if (!confirm('Delete this version?')) return
    const versions = form.versions.filter(v => v.id !== id)
    save({ versions })
    setActiveVid(versions.at(-1).id)
  }

  function handleDelete() {
    if (!confirm(`Delete "${form.title}"? This can't be undone.`)) return
    dispatch({ type: 'DELETE_JOKE', id: form.id })
    onBack()
  }

  function handleTagsBlur() {
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    save({ tags })
  }

  function handleExport() {
    download(`${slug(form.title)}.md`, exportJokeMd(form))
  }

  const active = form.versions.find(v => v.id === activeVid) ?? form.versions[0]

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          ← Back
        </button>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            Export .md
          </button>
          <button onClick={handleDelete} className="px-3 py-1.5 text-sm border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
            Delete
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={form.title}
        onChange={e => save({ title: e.target.value })}
        className="w-full text-2xl font-bold text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none pb-2 mb-6 transition-colors"
        placeholder="Joke title"
      />

      {/* Status */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Status</label>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => save({ status: s })}
              className={`px-3 py-1 text-sm font-medium rounded-full border capitalize transition-colors ${
                form.status === s ? STATUS_ACTIVE[s] : `border ${STATUS_IDLE[s]}`
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Tags (comma-separated)</label>
        <input
          type="text"
          value={tagsRaw}
          onChange={e => setTagsRaw(e.target.value)}
          onBlur={handleTagsBlur}
          placeholder="relationships, airports, family..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* Versions */}
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Versions</label>
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
            + Add version
          </button>
        </div>
      </div>

      {/* Version editor */}
      {active && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide shrink-0">Label</label>
              <input
                type="text"
                value={active.label}
                onChange={e => saveVersion(active.id, { label: e.target.value })}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 w-48"
              />
            </div>
            {form.versions.length > 1 && (
              <button
                onClick={() => deleteVersion(active.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Delete version
              </button>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Text</label>
            <textarea
              value={active.text}
              onChange={e => saveVersion(active.id, { text: e.target.value })}
              rows={14}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg font-mono resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 leading-relaxed"
              placeholder="Write your joke here..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Notes (stage directions, reminders)</label>
            <textarea
              value={active.notes}
              onChange={e => saveVersion(active.id, { notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-500 italic"
              placeholder="Pause before the last line. Works better in intimate venues..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
