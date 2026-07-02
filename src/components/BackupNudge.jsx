import { useEffect, useState } from 'react'
import { useLang } from '../LanguageContext'

export default function BackupNudge({ onExport, onDismiss }) {
  const { t } = useLang()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true))
    const hide = setTimeout(close, 8000)
    return () => { cancelAnimationFrame(show); clearTimeout(hide) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function close() {
    setVisible(false)
    setTimeout(onDismiss, 200)
  }

  function handleExport() {
    onExport()
    close()
  }

  return (
    <div
      className={`fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto sm:w-80 z-40 transition-all duration-200 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <div className="bg-gray-900 text-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
        <span className="text-lg leading-none">💾</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug">{t.backupNudge}</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleExport}
              className="text-xs font-medium text-white underline underline-offset-2 hover:text-gray-200 transition-colors"
            >
              {t.backupNudgeAction}
            </button>
            <button onClick={close} className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
              {t.backupNudgeDismiss}
            </button>
          </div>
        </div>
        <button onClick={close} className="text-gray-400 hover:text-gray-200 transition-colors text-sm leading-none shrink-0">
          ✕
        </button>
      </div>
    </div>
  )
}
