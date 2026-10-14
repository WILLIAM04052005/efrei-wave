import { useRef } from 'react'

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
}

function SearchBar({ query, onQueryChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function clearQuery() {
    onQueryChange('')
    // Le bouton ✕ disparaît avec le texte : on rend le focus au champ.
    inputRef.current?.focus()
  }

  return (
    <div className="field">
      <label htmlFor="album-search">Rechercher un album ou un artiste</label>
      <div className="field-control">
        <input
          ref={inputRef}
          id="album-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ex. daft"
          autoComplete="off"
        />
        {query !== '' && (
          <button
            type="button"
            className="search-clear"
            aria-label="Effacer la recherche"
            onClick={clearQuery}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar