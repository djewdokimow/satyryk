import { RATINGS } from '../constants'

// Single-select rating picker (💣 👎 👍 ⭐). Click the active one to clear it.
export default function RatingPicker({ value, onChange, size = 'md' }) {
  const btn = size === 'sm' ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-lg'
  return (
    <div className="flex items-center gap-1">
      {RATINGS.map(r => {
        const active = value === r
        return (
          <button
            key={r}
            onClick={() => onChange(active ? undefined : r)}
            className={`${btn} rounded-lg flex items-center justify-center leading-none transition-all ${
              active ? 'bg-amber-100 shadow-sm scale-110' : 'opacity-30 hover:opacity-70 hover:bg-gray-100'
            }`}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}
