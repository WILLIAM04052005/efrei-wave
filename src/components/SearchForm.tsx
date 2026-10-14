import { useState } from 'react'

interface SearchFormProps {
  term: string
  onSearch: (term: string) => void
}

function SearchForm({ term, onSearch }: SearchFormProps) {
  // Ce que l'utilisateur tape : un brouillon, tant qu'il n'a pas validé.
  // Seul « term » (dans Home) déclenche l'appel à l'API.
  const [draft, setDraft] = useState(term)

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault() // sans ça, le navigateur recharge la page
    const trimmed = draft.trim()
    if (trimmed === '') return // « required » laisse passer les espaces seuls
    setDraft(trimmed)
    onSearch(trimmed)
  }

  return (
    <form
      className="search-form"
      role="search"
      aria-label="Recherche iTunes"
      onSubmit={handleSubmit}
    >
      <div className="field">
        <label htmlFor="itunes-search">Rechercher un artiste ou un album sur iTunes</label>
        <input
          id="itunes-search"
          type="search"
          required
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ex. daft punk"
          autoComplete="off"
        />
      </div>
      <div className="field field--actions">
        <button type="submit" className="btn btn-primary">
          Rechercher
        </button>
      </div>
    </form>
  )
}

export default SearchForm