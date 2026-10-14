interface GenreFilterProps {
  genres: string[]
  genre: string
  onGenreChange: (genre: string) => void
}

function GenreFilter({ genres, genre, onGenreChange }: GenreFilterProps) {
  return (
    <div className="field">
      <label htmlFor="genre-filter">Genre</label>
      <select
        id="genre-filter"
        value={genre}
        onChange={(event) => onGenreChange(event.target.value)}
      >
        <option value="">Tous les genres</option>
        {genres.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default GenreFilter