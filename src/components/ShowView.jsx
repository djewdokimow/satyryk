import { STATUS_BADGE } from '../constants'
import { useLang } from '../LanguageContext'

export default function ShowView({ setlist, jokes, onClose }) {
  const { t, npl } = useLang()
  const jokeCount = setlist.items.filter(i => i.type === 'joke').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          {t.backToBuilder}
        </button>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {t.printPdf}
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 print:text-2xl">{setlist.title}</h1>
        <p className="text-sm text-gray-400 mb-8 print:mb-6">
          {npl(jokeCount, 'joke')} · {new Date(setlist.updatedAt).toLocaleDateString()}
        </p>

        <div className="flex flex-col gap-8">
          {setlist.items.map((item, i) => {
            if (item.type === 'segue') {
              return (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                  <span className="text-sm text-gray-400 italic shrink-0">
                    {item.segueText || t.segueEmpty}
                  </span>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>
              )
            }

            const joke    = jokes.find(j => j.id === item.jokeId)
            const version = joke?.versions.find(v => v.id === item.versionId) ?? joke?.versions[0]

            if (!joke || !version) {
              return (
                <div key={item.id} className="text-red-400 text-sm italic">
                  [{i + 1}] {t.deletedJoke}
                </div>
              )
            }

            return (
              <div key={item.id} className="border-l-4 border-gray-200 pl-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-gray-400 font-mono">{i + 1}</span>
                  <h2 className="font-bold text-gray-900 text-lg">{joke.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[joke.status]}`}>
                    {t.status[joke.status]}
                  </span>
                  <span className="text-xs text-gray-400">({version.label})</span>
                </div>
                <p className="joke-text text-gray-800 text-sm leading-relaxed">{version.text}</p>
                {version.notes && (
                  <p className="mt-3 text-xs text-gray-400 italic border-l-2 border-gray-200 pl-3">
                    {version.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {setlist.items.length === 0 && (
          <p className="text-gray-400 text-center py-16">{t.emptySetlist}</p>
        )}
      </div>
    </div>
  )
}
