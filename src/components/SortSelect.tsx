import type { SortKey } from '../types/sort'

interface SortSelectProps {
  sort: SortKey
  onSortChange: (sort: SortKey) => void
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Par défaut' },
  { value: 'date', label: 'Date de sortie (récents d’abord)' },
  { value: 'title', label: 'Titre (A → Z)' },
  { value: 'artist', label: 'Artiste (A → Z)' },
  { value: 'tracks', label: 'Nombre de titres (plus d’abord)' },
]

function SortSelect({ sort, onSortChange }: SortSelectProps) {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // On retrouve l'option plutôt que de forcer le type avec « as SortKey ».
    const option = SORT_OPTIONS.find((item) => item.value === event.target.value)
    if (option) onSortChange(option.value)
  }

  return (
    <div className="field">
      <label htmlFor="sort-select">Trier par</label>
      <select id="sort-select" value={sort} onChange={handleChange}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SortSelect