import { Link, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import StatusMessage from '../components/StatusMessage'
import TrackList from '../components/TrackList'
import { useAsyncData } from '../hooks/useAsyncData'
import { getAlbumDetails } from '../services/api'

function AlbumPage() {
  // useParams lit « :id » dans l'adresse /album/:id (toujours une chaîne).
  const { id = '' } = useParams()
  const { state, retry } = useAsyncData(getAlbumDetails, id)

  return (
    <div className="detail">
      <BackButton />

      {state.status === 'loading' && <StatusMessage status="loading" />}

      {state.status === 'error' && (
        <StatusMessage status="error" message={state.message} onRetry={retry} />
      )}

      {/* Succès, mais zéro résultat : l'id n'existe pas (ce n'est pas une erreur). */}
      {state.status === 'success' && state.data === null && (
        <div className="page-intro">
          <h1>Album introuvable</h1>
          <p>Aucun album ne correspond à l’identifiant «&nbsp;{id}&nbsp;».</p>
          <Link to="/" className="btn btn-primary">
            Retour à l’accueil
          </Link>
        </div>
      )}

      {state.status === 'success' && state.data !== null && (
        <>
          <header className="album-header">
            {state.data.album.cover && (
              <img
                className="card-cover"
                src={state.data.album.cover}
                alt={`Pochette de l'album ${state.data.album.title}`}
                width={600}
                height={600}
              />
            )}
            <div>
              <p className="album-header__kind">Album</p>
              <h1>{state.data.album.title}</h1>
              <p className="album-header__meta">
                <Link to={`/artist/${state.data.album.artistId}`}>
                  {state.data.album.artist}
                </Link>
                {' · '}
                {state.data.album.releaseDate.slice(0, 4)}
                {' · '}
                {state.data.album.genre}
                {' · '}
                {state.data.tracks.length} titre{state.data.tracks.length > 1 ? 's' : ''}
              </p>
            </div>
          </header>

          <section aria-labelledby="titres-titre">
            <h2 id="titres-titre" className="visually-hidden">
              Titres
            </h2>
            {state.data.tracks.length > 0 ? (
              <TrackList tracks={state.data.tracks} />
            ) : (
              <p className="empty-state">Aucun titre disponible pour cet album.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default AlbumPage