import { useEffect, useState } from 'react'
import SearchForm from '../components/SearchForm'
import SearchBar from '../components/SearchBar'
import GenreFilter from '../components/GenreFilter'
import SortSelect from '../components/SortSelect'
import AlbumGrid from '../components/AlbumGrid'
import { isAbortError, searchAlbums } from '../services/api'
import type { Album } from '../types/album'
import type { SortKey } from '../types/sort'

const DEFAULT_TERM = 'daft punk'

// Les trois états de la recherche : un seul à la fois, jamais de page blanche.
type SearchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; albums: Album[] }

// Minuscules + sans accents : « Électro », « électro » et « electro » deviennent « electro ».
function normalizeText(text: string): string {
  return text
    .normalize('NFD') // « é » devient « e » + accent séparé
    .replace(/\p{Diacritic}/gu, '') // on supprime les accents séparés
    .toLowerCase()
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, 'fr', { sensitivity: 'base' })
}

// Renvoie la fonction de comparaison correspondant au critère choisi.
function getComparator(sort: SortKey): (a: Album, b: Album) => number {
  switch (sort) {
    case 'date': // dates ISO : l'ordre alphabétique est l'ordre chronologique
      return (a, b) => b.releaseDate.localeCompare(a.releaseDate)
    case 'title':
      return (a, b) => compareText(a.title, b.title)
    case 'artist':
      return (a, b) => compareText(a.artist, b.artist)
    case 'tracks':
      return (a, b) => b.trackCount - a.trackCount
    default:
      return () => 0 // 0 = égalité : le tri est stable, l'ordre d'origine est conservé
  }
}

function Home() {
  // term = la recherche VALIDÉE (celle qui part vers l'API).
  const [term, setTerm] = useState(DEFAULT_TERM)
  // attempt = numéro de la recherche : il change à chaque lancement, même avec
  // le même terme, ce qui permet de relancer (bouton « Réessayer », Entrée).
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState<SearchState>({ status: 'loading' })

  // Les trois filtres locaux, qui travaillent sur les résultats déjà reçus.
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [sort, setSort] = useState<SortKey>('default')

  // Synchronisation avec l'API : on relance à chaque changement de term.
  useEffect(() => {
    const controller = new AbortController()

    searchAlbums(term, controller.signal)
      .then((albums) => setSearch({ status: 'success', albums }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return // annulée par le nettoyage : on ignore
        setSearch({
          status: 'error',
          message: error instanceof Error ? error.message : 'Erreur inattendue.',
        })
      })

    // Nettoyage : avant la prochaine recherche (ou au démontage), on annule
    // la requête en cours pour qu'une réponse tardive n'écrase pas la nouvelle.
    return () => controller.abort()
  }, [term, attempt])

  const apiAlbums = search.status === 'success' ? search.albums : []

  const trimmedQuery = query.trim()
  const normalizedQuery = normalizeText(trimmedQuery)

  // Les genres présents dans la liste : Set = pas de doublon.
  const genres = [...new Set(apiAlbums.map((album) => album.genre))]
    .filter((name) => name !== '')
    .sort(compareText)

  // Une seule chaîne de calcul : filtrer, puis trier. Aucun état en plus.
  // toSorted() renvoie une copie : la liste reçue n'est jamais modifiée.
  const visibleAlbums = apiAlbums
    .filter(
      (album) =>
        normalizeText(album.title).includes(normalizedQuery) ||
        normalizeText(album.artist).includes(normalizedQuery),
    )
    .filter((album) => genre === '' || album.genre === genre)
    .toSorted(getComparator(sort))

  function resetFilters() {
    setQuery('')
    setGenre('')
    setSort('default')
  }

  // Lancer une recherche = passer en « chargement » (dans l'événement, pas dans
  // l'effet) puis changer term/attempt : l'effet se charge d'appeler l'API.
  function startSearch(nextTerm: string) {
    setSearch({ status: 'loading' })
    setTerm(nextTerm)
    setAttempt((current) => current + 1)
  }

  function handleSearch(newTerm: string) {
    resetFilters() // un genre d'avant n'existe peut-être plus dans les nouveaux résultats
    startSearch(newTerm)
  }

  function handleRetry() {
    startSearch(term)
  }

  // \u00a0 = espace insécable : les guillemets restent collés au mot.
  let emptyMessage: string | undefined
  if (apiAlbums.length === 0) {
    // Zéro résultat côté API : ce n'est pas une erreur.
    emptyMessage = `Aucun résultat sur iTunes pour «\u00a0${term}\u00a0». Essaie un autre artiste ou un autre titre.`
  } else if (trimmedQuery) {
    emptyMessage = `Aucun album pour «\u00a0${trimmedQuery}\u00a0»${genre ? ` dans le genre ${genre}` : ''}`
  }

  const count = visibleAlbums.length

  return (
    <>
        <div className="page-intro">
          <h1>Sélections pour vous</h1>
        </div>

        <div className="catalog">
          <SearchForm term={term} onSearch={handleSearch} />

          <div className="search-form" role="group" aria-label="Filtrer et trier les résultats">
            <SearchBar query={query} onQueryChange={setQuery} />
            <GenreFilter genres={genres} genre={genre} onGenreChange={setGenre} />
            <SortSelect sort={sort} onSortChange={setSort} />
            <div className="field field--actions">
              <button type="button" className="btn btn-ghost" onClick={resetFilters}>
                Réinitialiser
              </button>
            </div>
          </div>

          {search.status === 'loading' && (
            <p className="status-message" role="status">
              <span className="spinner" aria-hidden="true" />
              Chargement des albums…
            </p>
          )}

          {search.status === 'error' && (
            <div className="status-message status-message--error" role="alert">
              <p>
                <strong>La recherche a échoué.</strong> {search.message}
              </p>
              <button type="button" className="btn btn-ghost" onClick={handleRetry}>
                Réessayer
              </button>
            </div>
          )}

          {search.status === 'success' && (
            <>
              <p className="results-count" role="status">
                {count} album{count > 1 ? 's' : ''} sur {apiAlbums.length}
              </p>
              <AlbumGrid albums={visibleAlbums} emptyMessage={emptyMessage} />
            </>
          )}
        </div>
    </>
  )
}

export default Home