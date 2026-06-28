import { useState, useRef } from 'react'
import { parseYamlFile } from '../markdown'

const STATUS_BADGE = {
  idea:     'bg-gray-100 text-gray-500',
  draft:    'bg-amber-100 text-amber-700',
  working:  'bg-sky-100 text-sky-700',
  polished: 'bg-emerald-100 text-emerald-700',
  retired:  'bg-rose-100 text-rose-500',
}

const ALL_STATUSES = ['idea', 'draft', 'working', 'polished', 'retired']

export default function JokesPage({ jokes, dispatch, onEdit, onNew }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const importRef = useRef(null)

  const visible = jokes.filter(j => {
    if (filter !== 'all' && j.status !== filter) return false
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleImport(e) {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text()
      const { jokes, setlists } = parseYamlFile(text)
      jokes.forEach(joke => dispatch({ type: 'SAVE_JOKE', joke }))
      setlists.forEach(setlist => dispatch({ type: 'SAVE_SETLIST', setlist }))
    }
    e.target.value = ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jokes</h1>
        <div className="flex gap-2">
          <input ref={importRef} type="file" accept=".yaml,.yml" multiple className="hidden" onChange={handleImport} />
          <button
            onClick={() => importRef.current.click()}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Import .yaml
          </button>
          <button
            onClick={onNew}
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            + New joke
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <div className="flex gap-1 flex-wrap">
          <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>All ({jokes.length})</FilterBtn>
          {ALL_STATUSES.map(s => {
            const count = jokes.filter(j => j.status === s).length
            return (
              <FilterBtn key={s} active={filter === s} onClick={() => setFilter(s)}>
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${STATUS_BADGE[s].split(' ')[0].replace('bg-', 'bg-').replace('100', '400')}`} />
                {s} ({count})
              </FilterBtn>
            )
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎤</p>
          <p className="text-lg font-medium text-gray-500 mb-1">No jokes here yet</p>
          <p className="text-sm">Add a new one or import .md files</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(joke => (
            <button
              key={joke.id}
              onClick={() => onEdit(joke.id)}
              className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-gray-700">{joke.title}</h3>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[joke.status]}`}>
                  {joke.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>{joke.versions.length} version{joke.versions.length !== 1 ? 's' : ''}</span>
                {joke.tags.length > 0 && (
                  <>
                    <span>·</span>
                    <span>{joke.tags.slice(0, 3).join(', ')}</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize flex items-center transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}
