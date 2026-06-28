import { createContext, useContext, useState } from 'react'
import { TRANSLATIONS } from './translations'

const LANG_KEY = 'satyryk_lang'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(LANG_KEY)
    return stored === 'en' ? 'en' : 'pl'
  })

  function setLang(l) {
    setLangState(l)
    localStorage.setItem(LANG_KEY, l)
  }

  const t = TRANSLATIONS[lang]

  // Pluralise a count using a key from t.plurals.
  // npl(3, 'joke') → '3 żarty' or '3 jokes'
  function npl(n, key) {
    const forms = t.plurals[key]
    if (lang === 'en') {
      return `${n} ${n === 1 ? forms.one : forms.other}`
    }
    // Polish: 1 → one, 2-4 / 22-24 … → few, rest → many
    if (n === 1) return `${n} ${forms.one}`
    const m100 = n % 100
    const m10  = n % 10
    if (m100 >= 12 && m100 <= 14) return `${n} ${forms.many}`
    if (m10  >= 2  && m10  <= 4)  return `${n} ${forms.few}`
    return `${n} ${forms.many}`
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, npl }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
