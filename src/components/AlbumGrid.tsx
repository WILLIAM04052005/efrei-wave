import type { Album } from '../types/album'
import AlbumCard from './AlbumCard'

interface AlbumGridProps {
  albums: Album[]
  emptyMessage?: string
}

function AlbumGrid({ albums, emptyMessage = 'Aucun album' }: AlbumGridProps) {
  if (albums.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <ul className="album-grid">
      {albums.map((album) => (
        <li key={album.id}>
          <AlbumCard album={album} />
        </li>
      ))}
    </ul>
  )
}

export default AlbumGrid