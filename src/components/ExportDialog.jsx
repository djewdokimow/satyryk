import { useState, useMemo } from 'react'
import { exportToJson, download } from '../markdown'
import { ALL_STATUSES, STATUS_BADGE } from '../constants'
import { useLang } from '../LanguageContext'

export default function ExportDialog({ jokes, setlists, onClose }) {
  const { t, npl } = useLang()
  const [statuses, setStatuses]           = useState(new Set(ALL_STATUSES))
  const [versionsMode, setVersionsMode]   = useState('all')
  const [setlistIds, setSetlistIds]       = useState(new Set(setlists.map(s => s.id)))
  const [setlistJokesOnly, setSetlistJokesOnly] = useState(false)
  const [pretty, setPretty]               = useState(false)

  const { filteredJokes, filteredSetlists } = useMemo(() => {
    let jokesToExport = jokes.filter(j => statuses.has(j.status))
    const selectedSetlists = setlists.filter(s => setlistIds.has(s.id))

    if (setlistJokesOnly && selectedSetlists.length > 0) {
      const ids = new Set(selectedSetlists.flatMap(s =>
        s.items.filter(i => i.type === 'joke').map(i => i.jokeId)
      ))
      jokesToExport = jokesToExport.filter(j => ids.has(j.id))
    }

    const exportedJokes = jokesToExport.map(j =>
      versionsMode === 'latest'
        ? { ...j, versions: [j.versions.at(-1)].filter(Boolean) }
        : j
    )

    const exportedIds = new Set(exportedJokes.map(j => j.id))
    const latestVid   = versionsMode === 'latest'
      ? new Map(exportedJokes.map(j => [j.id, j.versions[0]?.id]))
      : null

    const exportedSetlists = selectedSetlists.map(s => ({
      ...s,
      items: s.items
        .filter(i => i.type === 'segue' || exportedIds.has(i.jokeId))
        .map(i => i.type !== 'joke' ? i : { ...i, versionId: latestVid ? latestVid.get(i.jokeId) : i.versionId }),
    }))

    return { filteredJokes: exportedJokes, filteredSetlists: exportedSetlists }
  }, [jokes, setlists, statuses, versionsMode, setlistIds, setlistJokesOnly])

  function handleExport() {
    const json = exportToJson({ jokes: filteredJokes, setlists: filteredSetlists }, { pretty })
    download(`satyryk-export-${new Date().toISOString().split('T')[0]}.json`, json)
    onClose()
  }

  function toggleStatus(s) {
    setStatuses(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n })
  }
  function toggleSetlist(id) {
    setSetlistIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const versionCount = filteredJokes.reduce((n, j) => n + j.versions.length, 0)
  const empty = filteredJokes.length === 0 && filteredSetlists.length === 0

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900">{t.exportToJson}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-6">

          {/* Jokes section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t.exportJokesHeader}</h3>
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">{t.includeStatuses}</p>
              <div className="flex flex-wrap gap-1.5 items-center">
                {ALL_STATUSES.map(s => (
                  <button key={s} onClick={() => toggleStatus(s)}
                    className={`px-2.5 py-0.5 text-xs rounded-full font-medium border transition-colors ${
                      statuses.has(s)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : `${STATUS_BADGE[s]} border-transparent opacity-40`
                    }`}>
                    {t.status[s]}
                  </button>
                ))}
                {statuses.size < ALL_STATUSES.length && (
                  <button onClick={() => setStatuses(new Set(ALL_STATUSES))}
                    className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors">
                    {t.selectAll}
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">{t.versionsHeader}</p>
              <div className="flex gap-5">
                {[['all', t.allVersions], ['latest', t.latestVersionOnly]].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="ver" checked={versionsMode === val}
                      onChange={() => setVersionsMode(val)} className="accent-gray-900" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Setlists section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.setlistsHeader}</h3>
              {setlists.length > 0 && (
                <button
                  onClick={() => setlistIds.size === setlists.length
                    ? setSetlistIds(new Set())
                    : setSetlistIds(new Set(setlists.map(s => s.id)))}
                  className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors">
                  {setlistIds.size === setlists.length ? t.deselectAll : t.selectAll}
                </button>
              )}
            </div>
            {setlists.length === 0 ? (
              <p className="text-sm text-gray-400 italic">{t.noSetlistsYet}</p>
            ) : (
              <div className="space-y-2">
                {setlists.map(sl => {
                  const jokeCount = sl.items.filter(i => i.type === 'joke').length
                  return (
                    <label key={sl.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={setlistIds.has(sl.id)}
                        onChange={() => toggleSetlist(sl.id)}
                        className="accent-gray-900 w-3.5 h-3.5 shrink-0" />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1 transition-colors">{sl.title}</span>
                      <span className="text-xs text-gray-400 shrink-0">{npl(jokeCount, 'joke')}</span>
                    </label>
                  )
                })}
              </div>
            )}
            {setlists.length > 0 && setlistIds.size > 0 && (
              <label className="flex items-start gap-2.5 cursor-pointer group mt-3 pt-3 border-t border-gray-100">
                <input type="checkbox" checked={setlistJokesOnly}
                  onChange={e => setSetlistJokesOnly(e.target.checked)}
                  className="accent-gray-900 w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                  {t.onlySetlistJokes}
                </span>
              </label>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Format section */}
          <div>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={pretty}
                onChange={e => setPretty(e.target.checked)}
                className="accent-gray-900 w-3.5 h-3.5 shrink-0" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                {t.prettyPrint}
              </span>
            </label>
          </div>

        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <p className={`text-xs mb-3 rounded-lg px-3 py-2 ${empty ? 'bg-red-50 text-red-400' : 'bg-gray-50 text-gray-500'}`}>
            {empty
              ? t.nothingSelected
              : t.exportPreview(npl(filteredJokes.length, 'joke'), npl(versionCount, 'version'), npl(filteredSetlists.length, 'setlist'))
            }
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              {t.cancel}
            </button>
            <button onClick={handleExport} disabled={empty}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              {t.exportJson}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
