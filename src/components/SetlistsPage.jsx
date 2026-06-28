import { STATUS_BADGE } from '../constants'
import { useLang } from '../LanguageContext'

export default function SetlistsPage({ setlists, jokes, dispatch, onEdit, onNew }) {
  const { t, npl } = useLang()

  function handleDelete(e, id, title) {
    e.stopPropagation()
    if (!confirm(t.deleteSetlistConfirm(title))) return
    dispatch({ type: 'DELETE_SETLIST', id })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.setlists}</h1>
        <button
          onClick={onNew}
          className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {t.newSetlist}
        </button>
      </div>

      {setlists.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-medium text-gray-500 mb-1">{t.noSetlists}</p>
          <p className="text-sm">{t.noSetlistsDesc}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {setlists.map(sl => {
            const jokeItems  = sl.items.filter(i => i.type === 'joke')
            const segueItems = sl.items.filter(i => i.type === 'segue')
            const statuses   = jokeItems.map(i => jokes.find(j => j.id === i.jokeId)?.status).filter(Boolean)
            const allPolished = statuses.length > 0 && statuses.every(s => s === 'polished')

            return (
              <button
                key={sl.id}
                onClick={() => onEdit(sl.id)}
                className="text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg leading-snug mb-2 group-hover:text-gray-700">
                      {sl.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span>{npl(jokeItems.length, 'joke')}</span>
                      {segueItems.length > 0 && <span>· {npl(segueItems.length, 'segue')}</span>}
                      {allPolished && <span className="text-emerald-600 font-medium">{t.showReady}</span>}
                    </div>
                    {jokeItems.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {jokeItems.map(item => {
                          const joke = jokes.find(j => j.id === item.jokeId)
                          if (!joke) return null
                          return (
                            <span
                              key={item.id}
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[joke.status]}`}
                              title={joke.title}
                            >
                              {joke.title.length > 20 ? joke.title.slice(0, 18) + '…' : joke.title}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={e => handleDelete(e, sl.id, sl.title)}
                    className="text-xs text-gray-300 hover:text-red-400 transition-colors px-2 py-1 shrink-0"
                    title={t.deleteSetlistTitle}
                  >
                    ✕
                  </button>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
