import { useState } from 'react'
import ShowView from './ShowView'
import { STATUS_BADGE, ALL_STATUSES } from '../constants'
import { useLang } from '../LanguageContext'
import { calcSetlistDuration } from '../utils'

function PreviewModal({ joke, version, onClose }) {
  const { t } = useLang()
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{joke.title}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[joke.status]}`}>
                {t.status[joke.status]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{version.label}</span>
              {version.duration && <span>· ⏱{version.duration}</span>}
              {version.reactions?.length > 0 && <span>{version.reactions.join('')}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors text-lg leading-none shrink-0">✕</button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">{version.text}</pre>
          {version.notes && (
            <p className="mt-4 text-xs text-gray-400 italic border-l-2 border-gray-200 pl-3">{version.notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function CardsView({ setlist, jokes, onClose }) {
  const { t, npl } = useLang()
  const [preview, setPreview] = useState(null)
  const jokeCount = setlist.items.filter(i => i.type === 'joke').length
  const duration  = calcSetlistDuration(setlist, jokes)

  const jokeItems = setlist.items.filter(i => i.type === 'joke')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          {t.backToBuilder}
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{setlist.title}</h1>
      <p className="text-sm text-gray-400 mb-6">
        {npl(jokeCount, 'joke')}
        {duration && <span> · ⏱ {duration === '?' ? '?' : `~${duration}`}</span>}
        {setlist.showTime && <span> · 🎤 {setlist.showTime}</span>}
      </p>

      {preview && (
        <PreviewModal joke={preview.joke} version={preview.version} onClose={() => setPreview(null)} />
      )}
      {jokeItems.length === 0 ? (
        <p className="text-gray-400 text-center py-16">{t.emptySetlist}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {jokeItems.map((item, i) => {
            const joke    = jokes.find(j => j.id === item.jokeId)
            const version = joke?.versions.find(v => v.id === item.versionId) ?? joke?.versions[0]

            if (!joke) {
              return (
                <div key={item.id} className="bg-white border border-red-100 rounded-xl p-4 text-red-400 text-sm italic">
                  {t.deletedJoke}
                </div>
              )
            }

            const snippet = version?.text?.trim().split('\n').find(l => l.trim())?.slice(0, 90)

            return (
              <button
                key={item.id}
                onClick={() => setPreview({ joke, version })}
                className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-300 font-mono shrink-0">{i + 1}</span>
                    <h3 className="font-semibold text-gray-900 leading-snug truncate">{joke.title}</h3>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[joke.status]}`}>
                    {t.status[joke.status]}
                  </span>
                </div>
                {snippet && (
                  <p className="text-xs text-gray-500 leading-snug mb-2 line-clamp-2">{snippet}</p>
                )}
                <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                  {version && <span>{version.label}</span>}
                  {version?.duration && <span>· ⏱{version.duration}</span>}
                  {version?.reactions?.length > 0 && <span>{version.reactions.join('')}</span>}
                  {joke.tags.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{joke.tags.slice(0, 3).join(', ')}</span>
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function uid() { return crypto.randomUUID() }

export default function SetlistBuilder({ setlist, jokes, dispatch, onBack }) {
  const { t, npl } = useLang()
  const [sl, setSl] = useState(() => setlist ?? {
    id: uid(), title: t.newSetlistTitle, items: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  })
  const [viewMode, setViewMode] = useState('edit')
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
    updateItems([...sl.items, { id: uid(), type: 'joke', jokeId, versionId: joke.versions[0]?.id }])
  }

  function addSegue(afterIndex) {
    const items = [...sl.items]
    items.splice(afterIndex + 1, 0, { id: uid(), type: 'segue', segueText: '' })
    updateItems(items)
  }

  function updateItem(id, patch) {
    updateItems(sl.items.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  function removeItem(id) { updateItems(sl.items.filter(i => i.id !== id)) }

  function moveItem(index, dir) {
    const items = [...sl.items]
    const swap = index + dir
    if (swap < 0 || swap >= items.length) return
    ;[items[index], items[swap]] = [items[swap], items[index]]
    updateItems(items)
  }

  const totalDuration = calcSetlistDuration(sl, jokes)

  const libraryJokes = jokes.filter(j => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (viewMode === 'text') {
    return <ShowView setlist={sl} jokes={jokes} onClose={() => setViewMode('edit')} />
  }

  if (viewMode === 'cards') {
    return <CardsView setlist={sl} jokes={jokes} onClose={() => setViewMode('edit')} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          {t.back}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t.viewCards}
          </button>
          <button
            onClick={() => setViewMode('text')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t.showFullText}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={sl.title}
        onChange={e => save({ title: e.target.value })}
        className="w-full text-2xl font-bold text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none pb-2 mb-3 transition-colors"
        placeholder={t.setlistTitlePlaceholder}
      />

      <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">🎤</span>
          <input
            type="text"
            value={sl.showTime ?? ''}
            onChange={e => save({ showTime: e.target.value })}
            placeholder={t.showTimePlaceholder}
            className="bg-transparent border-b border-gray-200 focus:border-gray-500 focus:outline-none pb-0.5 w-24 text-sm text-gray-600 placeholder-gray-300"
          />
        </div>
        {totalDuration && (
          <span className="text-gray-400 text-xs">
            ⏱ {t.bitsTime}: {totalDuration === '?' ? '?' : `~${totalDuration}`}
          </span>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Left: setlist items */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t.setlistHeader}</h2>
            <span className="text-xs text-gray-400">{npl(sl.items.length, 'item')}</span>
          </div>

          {sl.items.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
              <p className="text-sm">{t.clickToAddHere}</p>
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
            {t.addSegue}
          </button>
        </div>

        {/* Right: joke library */}
        <div className="w-72 shrink-0">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.addJokes}</h2>

          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />

          <div className="flex gap-1 mb-3 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-0.5 text-xs rounded-md font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t.all}
            </button>
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 text-xs rounded-md font-medium transition-colors ${
                  statusFilter === s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t.status[s]}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {libraryJokes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">{t.noJokesMatchFilter}</p>
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
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[joke.status]}`}>
                      {t.status[joke.status]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {npl(joke.versions.length, 'version')}{t.clickToAddHint}
                  </div>
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
  const { t } = useLang()
  const [expanded, setExpanded] = useState(false)
  const joke    = jokes.find(j => j.id === item.jokeId)
  const version = joke?.versions.find(v => v.id === item.versionId) ?? joke?.versions[0]

  return (
    <div className="bg-white border border-gray-200 rounded-lg group overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="text-xs text-gray-300 font-mono w-5 shrink-0">{index + 1}</span>
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={() => onMove(-1)} disabled={index === 0}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none transition-colors">▲</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none transition-colors">▼</button>
        </div>
        <button className="flex-1 min-w-0 text-left" onClick={() => joke && setExpanded(e => !e)}>
          {joke ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-gray-900 truncate">{joke.title}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[joke.status]}`}>
                {t.status[joke.status]}
              </span>
            </div>
          ) : (
            <span className="text-sm text-red-400 italic">{t.deletedJoke}</span>
          )}
        </button>
        {joke && joke.versions.length > 1 && (
          <select
            value={item.versionId}
            onChange={e => onVersionChange(e.target.value)}
            className="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0"
          >
            {joke.versions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        )}
        {joke && joke.versions.length === 1 && (
          <span className="text-xs text-gray-400 shrink-0">{joke.versions[0].label}</span>
        )}
        {version?.reactions?.length > 0 && (
          <span className="text-sm shrink-0">{version.reactions.join('')}</span>
        )}
        {version?.duration && (
          <span className="text-xs text-gray-400 font-mono shrink-0">⏱{version.duration}</span>
        )}
        <button onClick={onRemove} className="text-gray-200 hover:text-red-400 transition-colors ml-1 shrink-0 text-sm">✕</button>
      </div>
      {expanded && version?.text && (
        <div className="px-10 pb-3 pt-0 border-t border-gray-100">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed mt-2">
            {version.text}
          </pre>
          {version.notes && (
            <p className="mt-2 text-xs text-gray-400 italic border-l-2 border-gray-100 pl-2">
              {version.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function SegueItem({ item, index, total, onMove, onRemove, onTextChange }) {
  const { t } = useLang()
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 border-dashed rounded-lg px-3 py-2 group">
      <span className="text-xs text-gray-300 font-mono w-5 shrink-0">{index + 1}</span>
      <div className="flex flex-col gap-0.5 shrink-0">
        <button onClick={() => onMove(-1)} disabled={index === 0}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none transition-colors">▲</button>
        <button onClick={() => onMove(1)} disabled={index === total - 1}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none transition-colors">▼</button>
      </div>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide shrink-0">{t.segueLabel}</span>
      <input
        type="text"
        value={item.segueText ?? ''}
        onChange={e => onTextChange(e.target.value)}
        placeholder={t.seguePlaceholder}
        className="flex-1 min-w-0 bg-transparent text-sm text-gray-600 italic placeholder-gray-300 focus:outline-none"
      />
      <button onClick={onRemove} className="text-gray-200 hover:text-red-400 transition-colors ml-1 shrink-0 text-sm">✕</button>
    </div>
  )
}
