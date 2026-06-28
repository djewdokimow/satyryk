import { useState, useRef } from 'react'
import { parseYamlFile } from '../markdown'
import { STATUS_BADGE, ALL_STATUSES } from '../constants'
import { useLang } from '../LanguageContext'
import demoYaml from '../../test-jokes/jokes-library.yaml?raw'

export default function JokesPage({ jokes, dispatch, onEdit, onNew }) {
  const { t, npl } = useLang()
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
      const { jokes: nj, setlists: ns } = parseYamlFile(text)
      nj.forEach(joke => dispatch({ type: 'SAVE_JOKE', joke }))
      ns.forEach(setlist => dispatch({ type: 'SAVE_SETLIST', setlist }))
    }
    e.target.value = ''
  }

  function handleDemo() {
    const msg = jokes.length > 0 ? t.demoConfirmData : t.demoConfirmEmpty
    if (!confirm(msg)) return
    const { jokes: dj, setlists: ds } = parseYamlFile(demoYaml)
    dj.forEach(joke => dispatch({ type: 'SAVE_JOKE', joke }))
    ds.forEach(setlist => dispatch({ type: 'SAVE_SETLIST', setlist }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.jokes}</h1>
        <div className="flex gap-2">
          <input ref={importRef} type="file" accept=".yaml,.yml" multiple className="hidden" onChange={handleImport} />
          <button
            onClick={handleDemo}
            className="px-3 py-1.5 text-sm border border-violet-200 rounded-lg text-violet-600 hover:bg-violet-50 transition-colors"
          >
            {t.demo}
          </button>
          <button
            onClick={() => importRef.current.click()}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t.importYaml}
          </button>
          <button
            onClick={onNew}
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t.newJoke}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder={t.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <div className="flex gap-1 flex-wrap">
          <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
            {t.all} ({jokes.length})
          </FilterBtn>
          {ALL_STATUSES.map(s => {
            const count = jokes.filter(j => j.status === s).length
            return (
              <FilterBtn key={s} active={filter === s} onClick={() => setFilter(s)}>
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${STATUS_BADGE[s].split(' ')[0].replace('100', '400')}`} />
                {t.status[s]} ({count})
              </FilterBtn>
            )
          })}
        </div>
      </div>

      {jokes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎤</p>
          <p className="text-lg font-medium text-gray-500 mb-1">{t.noJokes}</p>
          <p className="text-sm mb-6">{t.noJokesDesc}</p>
          <button
            onClick={handleDemo}
            className="px-5 py-2.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            {t.loadDemo}
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-sm">{t.noJokesMatch}</p>
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
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[joke.status]}`}>
                  {t.status[joke.status]}
                </span>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>{npl(joke.versions.length, 'version')}</span>
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
      className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}
