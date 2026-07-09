import { useState, useRef } from 'react'
import { parseJsonFile } from '../markdown'
import { useLang } from '../LanguageContext'

// Global data menu, shown in the header so these actions are reachable from
// every page (jokes, setlists, editors).
export default function AppMenu({ jokes, setlists, dispatch, onGuide, onDemo, onExportAll, onExportCustom, onDeleteAll }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const importRef = useRef(null)
  const noData = jokes.length === 0 && setlists.length === 0

  async function handleImport(e) {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text()
      const { jokes: nj, setlists: ns } = parseJsonFile(text)
      nj.forEach(joke => dispatch({ type: 'SAVE_JOKE', joke }))
      ns.forEach(setlist => dispatch({ type: 'SAVE_SETLIST', setlist }))
    }
    e.target.value = ''
  }

  function run(fn) { fn(); setOpen(false) }

  return (
    <div className="relative">
      <input ref={importRef} type="file" accept=".json" multiple className="hidden" onChange={handleImport} />
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={t.menu}
        className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors leading-none"
      >
        ☰
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-48 overflow-hidden">
            <Item onClick={() => run(onGuide)}>📖 {t.guide}</Item>
            <div className="h-px bg-gray-100 my-1" />
            <Item onClick={() => run(onDemo)} className="text-violet-600 hover:bg-violet-50">{t.demo}</Item>
            <Item onClick={() => run(() => importRef.current.click())}>{t.importJson}</Item>
            <div className="h-px bg-gray-100 my-1" />
            <Item onClick={() => run(onExportAll)} disabled={noData}>{t.exportAll}</Item>
            <Item onClick={() => run(onExportCustom)} disabled={noData}>{t.exportCustom}</Item>
            <div className="h-px bg-gray-100 my-1" />
            <Item onClick={() => run(onDeleteAll)} disabled={noData} className="text-red-400 hover:bg-red-50">{t.deleteAll}</Item>
          </div>
        </>
      )}
    </div>
  )
}

function Item({ children, onClick, disabled, className = 'text-gray-700 hover:bg-gray-50' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-2.5 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}
