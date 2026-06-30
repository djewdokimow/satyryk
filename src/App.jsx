import { useReducer, useState } from 'react'
import { load, save } from './storage'
import { exportToJson, download } from './markdown'
import { useLang } from './LanguageContext'
import { DEFAULT_REACTION_EMOJIS } from './constants'
import JokesPage from './components/JokesPage'
import JokeEditor from './components/JokeEditor'
import SetlistsPage from './components/SetlistsPage'
import SetlistBuilder from './components/SetlistBuilder'
import ExportDialog from './components/ExportDialog'

function reducer(state, action) {
  let next = state
  switch (action.type) {
    case 'SAVE_JOKE': {
      const exists = state.jokes.some(j => j.id === action.joke.id)
      next = {
        ...state,
        jokes: exists
          ? state.jokes.map(j => j.id === action.joke.id ? action.joke : j)
          : [...state.jokes, action.joke],
      }
      break
    }
    case 'DELETE_JOKE':
      next = { ...state, jokes: state.jokes.filter(j => j.id !== action.id) }
      break
    case 'SAVE_SETLIST': {
      const exists = state.setlists.some(s => s.id === action.setlist.id)
      next = {
        ...state,
        setlists: exists
          ? state.setlists.map(s => s.id === action.setlist.id ? action.setlist : s)
          : [...state.setlists, action.setlist],
      }
      break
    }
    case 'DELETE_SETLIST':
      next = { ...state, setlists: state.setlists.filter(s => s.id !== action.id) }
      break
    case 'SET_REACTION_EMOJIS':
      next = { ...state, reactionEmojis: action.emojis }
      break
    case '_REPLACE':
      next = action.data
      break
    default:
      return state
  }
  save(next)
  return next
}

export default function App() {
  const [store, dispatch] = useReducer(reducer, null, load)
  const [page, setPage] = useState({ view: 'jokes', id: null })
  const [showExport, setShowExport] = useState(false)
  const { lang, setLang, t, npl } = useLang()

  const go = (view, id = null) => setPage({ view, id })

  function handleDeleteAll() {
    const total = store.jokes.length
    if (total === 0) return
    if (!confirm(t.deleteAllConfirm(npl(total, 'joke')))) return
    const empty = { jokes: [], setlists: [], reactionEmojis: store.reactionEmojis ?? DEFAULT_REACTION_EMOJIS }
    save(empty)
    dispatch({ type: '_REPLACE', data: empty })
  }

  function handleExportAll() {
    const json = exportToJson({ jokes: store.jokes, setlists: store.setlists })
    const date = new Date().toISOString().split('T')[0]
    download(`satyryk-export-${date}.json`, json)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showExport && (
        <ExportDialog
          jokes={store.jokes}
          setlists={store.setlists}
          onClose={() => setShowExport(false)}
        />
      )}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          <button
            onClick={() => go('jokes')}
            className="font-bold text-lg tracking-tight text-gray-900 hover:text-gray-600 transition-colors"
          >
            Satyryk
          </button>
          <nav className="flex gap-1">
            <NavBtn active={page.view === 'jokes' || page.view === 'joke'} onClick={() => go('jokes')}>
              {t.navJokes}
            </NavBtn>
            <NavBtn active={page.view === 'setlists' || page.view === 'setlist'} onClick={() => go('setlists')}>
              {t.navSetlists}
            </NavBtn>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 mr-1">
              {npl(store.jokes.length, 'joke')} · {npl(store.setlists.length, 'setlist')}
            </span>
            <button
              onClick={handleExportAll}
              disabled={store.jokes.length === 0}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t.exportAll}
            </button>
            <button
              onClick={() => setShowExport(true)}
              disabled={store.jokes.length === 0}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t.exportCustom}
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={store.jokes.length === 0}
              className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t.deleteAll}
            </button>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-1">
              <button
                onClick={() => setLang('pl')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${lang === 'pl' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-900'}`}
              >
                PL
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${lang === 'en' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-900'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {page.view === 'jokes' && (
          <JokesPage
            jokes={store.jokes}
            dispatch={dispatch}
            onEdit={id => go('joke', id)}
            onNew={() => go('joke', null)}
          />
        )}
        {page.view === 'joke' && (
          <JokeEditor
            joke={page.id ? store.jokes.find(j => j.id === page.id) : null}
            dispatch={dispatch}
            onBack={() => go('jokes')}
            reactionEmojis={store.reactionEmojis ?? DEFAULT_REACTION_EMOJIS}
          />
        )}
        {page.view === 'setlists' && (
          <SetlistsPage
            setlists={store.setlists}
            jokes={store.jokes}
            dispatch={dispatch}
            onEdit={id => go('setlist', id)}
            onNew={() => go('setlist', null)}
          />
        )}
        {page.view === 'setlist' && (
          <SetlistBuilder
            setlist={page.id ? store.setlists.find(s => s.id === page.id) : null}
            jokes={store.jokes}
            dispatch={dispatch}
            onBack={() => go('setlists')}
          />
        )}
      </main>
    </div>
  )
}

function NavBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}
