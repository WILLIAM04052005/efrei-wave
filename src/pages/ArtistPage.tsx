import { Link, useParams } from 'react-router-dom'
import AlbumGrid from '../components/AlbumGrid'
import BackButton from '../components/BackButton'
import StatusMessage from '../components/StatusMessage'
import { useAsyncData } from '../hooks/useAsyncData'
import { getArtistDetails } from '../services/api'

function ArtistPage() {
  const { id = '' } = useParams()
  const { state, retry } = useAsyncData(getArtistDetails, id)

  return (
    <div className="detail">
      <BackButton />

      {state.status === 'loading' && <StatusMessage status="loading" />}

      {state.status === 'error' && (
        <StatusMessage status="error" message={state.message} onRetry={retry} />
      )}

      {state.status === 'success' && state.data === null && (
        <div className="page-intro">
          <h1>Artiste introuvable</h1>
          <p>Aucun artiste ne correspond à l’identifiant «&nbsp;{id}&nbsp;».</p>
          <Link to="/" className="btn btn-primary">
            Retour à l’accueil
          </Link>
        </div>
      )}

      {state.status === 'success' && state.data !== null && (
        <>
          <div className="page-intro">
            <p className="album-header__kind">Artiste</p>
            <h1>{state.data.artist.name}</h1>
            <p>
              {state.data.artist.genre && `${state.data.artist.genre} · `}
              {state.data.albums.length} album{state.data.albums.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* La même grille que sur l'accueil : AlbumGrid ne sait pas d'où viennent les albums. */}
          <AlbumGrid albums={state.data.albums} emptyMessage="Aucun album pour cet artiste." />
        </>
      )}
    </div>
  )
}

export default ArtistPage