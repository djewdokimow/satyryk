import { useState } from 'react'
import { exportSetlistMd, download } from '../markdown'
import ShowView from './ShowView'

const STATUS_BADGE = {
  idea:     'bg-gray-100 text-gray-500',
  draft:    'bg-amber-100 text-amber-700',
  working:  'bg-sky-100 text-sky-700',
  polished: 'bg-emerald-100 text-emerald-700',
  retired:  'bg-rose-100 text-rose-500',
}

function uid() { return crypto.randomUUID() }

function newSetlist() {
  return {
    id: uid(),
    title: 'New Setlist',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export default function SetlistBuilder({ setlist, jokes, dispatch, onBack }) {
  const [sl, setSl] = useState(() => setlist ?? newSetlist())
  const [showFull, setShowFull] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  function save(patch) {
    const next = { ...sl, ...patch, updatedAt: new Date().toISOString() }
    setSl(next)
    dispatch({ type: 'SAVE_SETLIST', setlist: next })
  }

  function updateItems(items) { save({ items }) }

  function addJoke(jokeId) {
    const joke = jokes.find(j => j.id === jokeId)
    if (!joke) return
    const item = { id: uid(), type: 'joke', jokeId, versionId: joke.versions[0]?.id }
    updateItems([...sl.items, item])
  }

  function addSegue(afterIndex) {
    const item = { id: uid(), type: 'segue', segueText: '' }
    const items = [...sl.items]
    items.splice(afterIndex + 1, 0, item)
    updateItems(items)
  }

  function updateItem(id, patch) {
    updateItems(sl.items.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  function removeItem(id) {
    updateItems(sl.items.filter(i => i.id !== id))
  }

  function moveItem(index, dir) {
    const items = [...sl.items]
    const swap = index + dir
    if (swap < 0 || swap >= items.length) return
    ;[items[index], items[swap]] = [items[swap], items[index]]
    updateItems(items)
  }

  function handleExport() {
    const filename = sl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'setlist'
    download(`${filename}.md`, exportSetlistMd(sl, jokes))
  }

  const libraryJokes = jokes.filter(j => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (showFull) {
    return <ShowView setlist={sl} jokes={jokes} onClose={() => setShowFull(false)} />
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFull(true)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Show full text
          </button>
          <button onClick={handleExport} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            Export .md
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={sl.title}
        onChange={e => save({ title: e.target.value })}
        className="w-full text-2xl font-bold text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none pb-2 mb-6 transition-colors"
        placeholder="Setlist title"
      />

      <div className="flex gap-6 items-start">

        {/* Left: setlist items */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Setlist</h2>
            <span className="text-xs text-gray-400">{sl.items.length} item{sl.items.length !== 1 ? 's' : ''}</span>
          </div>

          {sl.items.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
              <p className="text-sm">Click a joke on the right to add it here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sl.items.map((item, i) => (
                <div key={item.id}>
                  {item.type === 'joke'
                    ? <JokeItem item={item} index={i} total={sl.items.length} jokes={jokes}
                        onMove={dir => moveItem(i, dir)}
                        onRemove={() => removeItem(item.id)}
                        onVersionChange={versionId => updateItem(item.id, { versionId })}
                      />
                    : <SegueItem item={item} index={i} total={sl.items.length}
                        onMove={dir => moveItem(i, dir)}
                        onRemove={() => removeItem(item.id)}
                        onTextChange={segueText => updateItem(item.id, { segueText })}
                      />
                  }
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => addSegue(sl.items.length - 1)}
            className="mt-4 w-full py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            + Add segue at end
          </button>
        </div>

        {/* Right: joke library */}
        <div className="w-72 shrink-0">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Add jokes</h2>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />

          <div className="flex gap-1 mb-3 flex-wrap">
            {['all', 'idea', 'draft', 'working', 'polished', 'retired'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 text-xs rounded-md capitalize font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {libraryJokes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No jokes match</p>
            ) : (
              libraryJokes.map(joke => (
                <button
                  key={joke.id}
                  onClick={() => addJoke(joke.id)}
                  className="text-left px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-sm font-medium text-gray-800 leading-snug group-hover:text-gray-600">
                      {joke.title}
                    </span>
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[joke.status]}`}>
                      {joke.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{joke.versions.length} version{joke.versions.length !== 1 ? 's' : ''} · click to add</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function JokeItem({ item, index, total, jokes, onMove, onRemove, onVersionChange }) {
  const joke = jokes.find(j => j.id === item.jokeId)

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 group">
      <span className="text-xs text-gray-300 font-mono w-5 shrink-0">{index + 1}</span>

      <div className="flex flex-col gap-0.5 shrink-0">
        <button onClick={() => onMove(-1)} disabled={index === 0}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none transition-colors">▲</button>
        <button onClick={() => onMove(1)} disabled={index === total - 1}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none transition-colors">▼</button>
      </div>

      <div className="flex-1 min-w-0">
        {joke ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-gray-900 truncate">{joke.title}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[joke.status]}`}>
              {joke.status}
            </span>
          </div>
        ) : (
          <span className="text-sm text-red-400 italic">Deleted joke</span>
        )}
      </div>

      {joke && joke.versions.length > 1 && (
        <select
          value={item.versionId}
          onChange={e => onVersionChange(e.target.value)}
          className="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0"
        >
          {joke.versions.map(v => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
      )}
      {joke && joke.versions.length === 1 && (
        <span className="text-xs text-gray-400 shrink-0">{joke.versions[0].label}</span>
      )}

      <button onClick={onRemove}
        className="text-gray-200 hover:text-red-400 transition-colors ml-1 shrink-0 text-sm">✕</button>
    </div>
  )
}

function SegueItem({ item, index, total, onMove, onRemove, onTextChange }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 border-dashed rounded-lg px-3 py-2 group">
      <span className="text-xs text-gray-300 font-mono w-5 shrink-0">{index + 1}</span>

      <div className="flex flex-col gap-0.5 shrink-0">
        <button onClick={() => onMove(-1)} disabled={index === 0}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none transition-colors">▲</button>
        <button onClick={() => onMove(1)} disabled={index === total - 1}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none transition-colors">▼</button>
      </div>

      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide shrink-0">segue</span>

      <input
        type="text"
        value={item.segueText ?? ''}
        onChange={e => onTextChange(e.target.value)}
        placeholder="Transition text..."
        className="flex-1 min-w-0 bg-transparent text-sm text-gray-600 italic placeholder-gray-300 focus:outline-none"
      />

      <button onClick={onRemove}
        className="text-gray-200 hover:text-red-400 transition-colors ml-1 shrink-0 text-sm">✕</button>
    </div>
  )
}
