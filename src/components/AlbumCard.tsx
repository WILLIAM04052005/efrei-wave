import type { Album } from '../types/album'
import Badge from './Badge'
import { Link } from 'react-router-dom'

type CardSize = 'small' | 'medium' | 'large'

interface AlbumCardProps {
  album: Album
  size?: CardSize
}

const FALLBACK_COVER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">' +
      '<rect width="300" height="300" fill="#2a2338"/>' +
      '<text x="150" y="170" font-size="72" text-anchor="middle" fill="#a89fc2">♪</text>' +
      '</svg>',
  )

const NEW_RELEASE_DAYS = 30
const DAY_IN_MS = 24 * 60 * 60 * 1000

function isNewRelease(releaseDate: string): boolean {
  const ageInDays = (Date.now() - new Date(releaseDate).getTime()) / DAY_IN_MS
  return ageInDays >= 0 && ageInDays <= NEW_RELEASE_DAYS
}

function AlbumCard({ album, size = 'medium' }: AlbumCardProps) {
  const coverSrc = album.cover || FALLBACK_COVER
  const isNew = isNewRelease(album.releaseDate)

  return (
    <article className={`card card-${size}`}>
     <Link className="card-link" to={`/album/${album.id}`}>
      <img
        className="card-cover"
        src={coverSrc}
        alt={`Pochette de l'album ${album.title}`}
        width={300}
        height={300}
        loading="lazy"
      />
      <p className="card-title">{album.title}</p>
      <p className="card-meta">
        {album.artist} · {album.genre}
      </p>
      {(album.explicit || isNew) && (
        <div className="card-badges">
          {album.explicit && <Badge label="E" description="Contenu explicite" />}
          {isNew && <Badge label="Nouveau" />}
        </div>
      )}
      {album.trackCount > 0 && (
        <p className="card-meta">
          {album.trackCount} titre{album.trackCount > 1 ? 's' : ''}
        </p>
      )}
        </Link>
    </article>
  )
}

export default AlbumCard