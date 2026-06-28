import { useReducer, useState } from 'react'
import { load, save } from './storage'
import JokesPage from './components/JokesPage'
import JokeEditor from './components/JokeEditor'
import SetlistsPage from './components/SetlistsPage'
import SetlistBuilder from './components/SetlistBuilder'

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
    default:
      return state
  }
  save(next)
  return next
}

export default function App() {
  const [store, dispatch] = useReducer(reducer, null, load)
  const [page, setPage] = useState({ view: 'jokes', id: null })

  const go = (view, id = null) => setPage({ view, id })

  return (
    <div className="min-h-screen bg-gray-50">
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
              Jokes
            </NavBtn>
            <NavBtn active={page.view === 'setlists' || page.view === 'setlist'} onClick={() => go('setlists')}>
              Setlists
            </NavBtn>
          </nav>
          <span className="ml-auto text-xs text-gray-400">
            {store.jokes.length} jokes · {store.setlists.length} setlists
          </span>
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
