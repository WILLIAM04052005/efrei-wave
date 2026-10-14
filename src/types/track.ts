export interface Track {
  id: number
  number: number
  name: string
  durationMs: number
  previewUrl: string | null // certains titres n'ont pas d'extrait
  explicit: boolean
}