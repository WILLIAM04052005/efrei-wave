import type { Album } from '../types/album'
import type { Artist } from '../types/artist'
import type { Track } from '../types/track'
import { API_BASE_URL } from './config'

const RESULT_LIMIT = 20
const TRACK_LIMIT = 200 // un album peut avoir beaucoup de titres
const ARTIST_ALBUM_LIMIT = 50

// ─── Le format de l'API iTunes : décrit ICI, et nulle part ailleurs ───────────
// Une même réponse peut mélanger trois sortes d'objets, reconnaissables
// à leur champ wrapperType.
interface ItunesCollection {
  wrapperType: 'collection'
  collectionId: number
  collectionName: string
  artistId: number
  artistName: string
  artworkUrl100?: string
  releaseDate: string
  primaryGenreName: string
  trackCount: number
  collectionExplicitness?: string
}

interface ItunesTrack {
  wrapperType: 'track'
  trackId: number
  trackName: string
  trackNumber: number
  trackTimeMillis?: number
  previewUrl?: string
  trackExplicitness?: string
}

interface ItunesArtist {
  wrapperType: 'artist'
  artistId: number
  artistName: string
  primaryGenreName?: string
}

type ItunesResult = ItunesCollection | ItunesTrack | ItunesArtist

interface ItunesResponse {
  resultCount: number
  results: ItunesResult[]
}

const isCollection = (result: ItunesResult): result is ItunesCollection =>
  result.wrapperType === 'collection'
const isTrack = (result: ItunesResult): result is ItunesTrack =>
  result.wrapperType === 'track'
const isArtist = (result: ItunesResult): result is ItunesArtist =>
  result.wrapperType === 'artist'

// ─── iTunes → nos types : les seules fonctions qui connaissent les champs ─────
function toAlbum(result: ItunesCollection): Album {
  return {
    id: result.collectionId,
    title: result.collectionName,
    artist: result.artistName,
    artistId: result.artistId,
    // L'API donne une vignette 100x100 : on demande la même image en 600x600.
    cover: result.artworkUrl100?.replace('100x100', '600x600') ?? '',
    releaseDate: result.releaseDate,
    genre: result.primaryGenreName,
    trackCount: result.trackCount,
    explicit: result.collectionExplicitness === 'explicit',
  }
}

function toTrack(result: ItunesTrack): Track {
  return {
    id: result.trackId,
    number: result.trackNumber,
    name: result.trackName,
    durationMs: result.trackTimeMillis ?? 0,
    previewUrl: result.previewUrl ?? null,
    explicit: result.trackExplicitness === 'explicit',
  }
}

function toArtist(result: ItunesArtist): Artist {
  return {
    id: result.artistId,
    name: result.artistName,
    genre: result.primaryGenreName ?? '',
  }
}

// Dédoublonnage par collectionId : iTunes renvoie parfois deux fois le même album.
function collectAlbums(results: ItunesResult[]): Album[] {
  const albumsById = new Map<number, Album>()
  for (const result of results) {
    if (isCollection(result) && !albumsById.has(result.collectionId)) {
      albumsById.set(result.collectionId, toAlbum(result))
    }
  }
  return [...albumsById.values()]
}

// Une annulation volontaire (AbortController) n'est pas une vraie erreur.
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

// Un identifiant iTunes est un nombre entier : inutile d'interroger l'API sinon.
const isValidId = (id: string): boolean => /^\d+$/.test(id)

// ─── L'unique endroit qui appelle fetch ───────────────────────────────────────
async function fetchResults(path: string, signal?: AbortSignal): Promise<ItunesResult[]> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { signal })
  } catch (error) {
    // fetch ne REJETTE que si le réseau est coupé (ou si on annule).
    if (isAbortError(error)) throw error
    throw new Error('Impossible de joindre iTunes. Vérifie ta connexion.', {
      cause: error,
    })
  }

  // fetch ne rejette PAS sur un 404 ou un 503 : c'est à nous de tester ok.
  if (!response.ok) {
    throw new Error(`iTunes a répondu avec une erreur (${response.status}).`)
  }

  // Cast : TypeScript ne vérifie pas le JSON reçu, on fait confiance au format.
  const data = (await response.json()) as ItunesResponse
  return data.results
}

// ─── Ce que les pages utilisent ───────────────────────────────────────────────
export async function searchAlbums(term: string, signal?: AbortSignal): Promise<Album[]> {
  const results = await fetchResults(
    `/search?term=${encodeURIComponent(term)}&entity=album&limit=${RESULT_LIMIT}`,
    signal,
  )
  return collectAlbums(results) // zéro résultat : [] (ce n'est pas une erreur)
}

export interface AlbumDetails {
  album: Album
  tracks: Track[]
}

// null = « cet album n'existe pas » : iTunes répond 200 avec zéro résultat.
export async function getAlbumDetails(
  id: string,
  signal?: AbortSignal,
): Promise<AlbumDetails | null> {
  if (!isValidId(id)) return null

  const results = await fetchResults(
    `/lookup?id=${encodeURIComponent(id)}&entity=song&limit=${TRACK_LIMIT}`,
    signal,
  )

  // Le premier résultat est l'album (collection), les suivants sont ses titres.
  const collection = results.find(isCollection)
  if (!collection) return null

  return {
    album: toAlbum(collection),
    tracks: results.filter(isTrack).map(toTrack),
  }
}

export interface ArtistDetails {
  artist: Artist
  albums: Album[]
}

// Pour un artiste : le premier résultat est l'artiste, les suivants ses albums.
export async function getArtistDetails(
  id: string,
  signal?: AbortSignal,
): Promise<ArtistDetails | null> {
  if (!isValidId(id)) return null

  const results = await fetchResults(
    `/lookup?id=${encodeURIComponent(id)}&entity=album&limit=${ARTIST_ALBUM_LIMIT}`,
    signal,
  )

  const artist = results.find(isArtist)
  if (!artist) return null

  return { artist: toArtist(artist), albums: collectAlbums(results) }
}