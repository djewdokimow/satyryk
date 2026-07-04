import { useState, useRef } from 'react'
import { parseJsonFile, processImportData } from '../markdown'
import { STATUS_BADGE, ALL_STATUSES } from '../constants'
import { useLang } from '../LanguageContext'
import demoData from '../../test-jokes/jokes-library.json'

const GUIDE_URLS = {
  pl: 'https://github.com/djewdokimow/satyryk/blob/main/docs/instrukcja-obslugi.md',
  en: 'https://github.com/djewdokimow/satyryk/blob/main/docs/user-guide.md',
}

export default function JokesPage({ jokes, dispatch, onEdit, onNew, onExportAll, onExportCustom, onDeleteAll }) {
  const { t, npl, lang } = useLang()
  const guideUrl = GUIDE_URLS[lang] ?? GUIDE_URLS.en
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const importRef = useRef(null)

  const visible = jokes.filter(j => {
    if (filter !== 'all' && j.status !== filter) return false
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleImport(e) {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text()
      const { jokes: nj, setlists: ns } = parseJsonFile(text)
      nj.forEach(joke => dispatch({ type: 'SAVE_JOKE', joke }))
      ns.forEach(setlist => dispatch({ type: 'SAVE_SETLIST', setlist }))
    }
    e.target.value = ''
  }

  function handleDemo() {
    const msg = jokes.length > 0 ? t.demoConfirmData : t.demoConfirmEmpty
    if (!confirm(msg)) return
    const { jokes: dj, setlists: ds } = processImportData(demoData)
    dj.forEach(joke => dispatch({ type: 'SAVE_JOKE', joke }))
    ds.forEach(setlist => dispatch({ type: 'SAVE_SETLIST', setlist }))
  }

  const noJokes = jokes.length === 0

  return (
    <div>
      <input ref={importRef} type="file" accept=".json" multiple className="hidden" onChange={handleImport} />

      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-gray-900 shrink-0">{t.jokes}</h1>

        {/* Desktop: all buttons in one row */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
          <a
            href={guideUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.guide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span aria-hidden="true">📖</span>
            {t.guide}
          </a>
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
            {t.importJson}
          </button>
          <div className="w-px h-5 bg-gray-200 shrink-0" />
          <button
            onClick={onExportAll}
            disabled={noJokes}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t.exportAll}
          </button>
          <button
            onClick={onExportCustom}
            disabled={noJokes}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t.exportCustom}
          </button>
          <button
            onClick={onDeleteAll}
            disabled={noJokes}
            className="px-3 py-1.5 text-sm border border-red-200 rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t.deleteAll}
          </button>
          <div className="w-px h-5 bg-gray-200 shrink-0" />
          <button
            onClick={onNew}
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t.newJoke}
          </button>
        </div>

        {/* Mobile: Export All + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onExportAll}
            disabled={noJokes}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t.exportAll}
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors leading-none"
            >
              ☰
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-44 overflow-hidden">
                  <a
                    href={guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span aria-hidden="true">📖</span>
                    {t.guide}
                  </a>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => { handleDemo(); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-violet-600 hover:bg-violet-50 transition-colors"
                  >
                    {t.demo}
                  </button>
                  <button
                    onClick={() => { importRef.current.click(); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t.importJson}
                  </button>
                  <button
                    onClick={() => { onExportCustom(); setMenuOpen(false) }}
                    disabled={noJokes}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  >
                    {t.exportCustom}
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => { onDeleteAll(); setMenuOpen(false) }}
                    disabled={noJokes}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 disabled:opacity-30 transition-colors"
                  >
                    {t.deleteAll}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder={t.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-20 sm:pb-0">
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

      {/* FAB — mobile only */}
      <button
        onClick={onNew}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl text-2xl flex items-center justify-center z-20 hover:bg-gray-700 active:scale-95 transition-all"
        aria-label={t.newJoke}
      >
        +
      </button>
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
