import { useRef, useState } from 'react'
import { isAbortError } from '../services/api'
import type { Track } from '../types/track'
import Badge from './Badge'

// 225000 ms → « 3:45 ». On arrondit au total de secondes AVANT de découper,
// pour ne jamais afficher « 0:60 ».
function formatDuration(ms: number): string {
  if (ms <= 0) return '—'
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Icônes dessinées en SVG : les caractères ▶ et ⏸ changent d'aspect selon la police
// du système (parfois en emoji coloré, parfois absents). Le SVG est identique partout.
function PlayPauseIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
    </svg>
  )
}

interface TrackListProps {
  tracks: Track[]
}

function TrackList({ tracks }: TrackListProps) {
  // UN seul <audio> pour toute la liste : il ne peut donc jouer qu'un titre à la fois.
  const audioRef = useRef<HTMLAudioElement>(null)
  // Quel titre joue : la seule information dont l'affichage a besoin.
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [hasError, setHasError] = useState(false)

  function togglePlay(track: Track) {
    const audio = audioRef.current
    if (!audio || !track.previewUrl) return

    if (playingId === track.id) {
      audio.pause() // l'événement « pause » remet playingId à null
      return
    }

    setHasError(false)
    setPlayingId(track.id)
    audio.src = track.previewUrl // changer de src coupe le titre précédent
    audio.play().catch((error: unknown) => {
      // Si on a cliqué sur un autre titre entre-temps, la lecture est annulée
      // volontairement (AbortError) : ce n'est pas une panne.
      if (isAbortError(error)) return
      setPlayingId(null)
      setHasError(true)
    })
  }

  return (
    <>
      <ol className="track-list">
        {tracks.map((track) => {
          const isPlaying = track.id === playingId
          const label = !track.previewUrl
            ? `Aucun extrait disponible pour ${track.name}`
            : isPlaying
              ? `Mettre en pause ${track.name}`
              : `Écouter un extrait de ${track.name}`

          return (
            <li key={track.id} className={isPlaying ? 'is-playing' : undefined}>
              <span className="track__index">{track.number}</span>
              <span className="track__title">
                {track.name}
                {track.explicit && <Badge label="E" description="Contenu explicite" />}
              </span>
              <span className="track__duration">{formatDuration(track.durationMs)}</span>
              <button
                type="button"
                className={`btn btn-icon track__play${isPlaying ? ' btn-primary' : ''}`}
                aria-label={label}
                disabled={!track.previewUrl}
                onClick={() => togglePlay(track)}
              >
                <PlayPauseIcon playing={isPlaying} />
              </button>
            </li>
          )
        })}
      </ol>

      {hasError && (
        <p className="status-message status-message--error" role="alert">
          Impossible de lire cet extrait.
        </p>
      )}

      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        onPause={(event) => {
          // Pause réelle seulement : lors d'un changement de titre, l'élément rejoue aussitôt.
          if (event.currentTarget.paused) setPlayingId(null)
        }}
        onError={() => {
          setPlayingId(null)
          setHasError(true)
        }}
      />
    </>
  )
}

export default TrackList