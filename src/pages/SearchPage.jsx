import { useState } from 'react'
import { getMoviesByGenre, searchMovies } from '../Services/tmdb'
import MovieCard from '../components/MovieCard'

export default function SearchPage({ genres, isInWatchlist, onToggleWatchlist }) {
  const [query, setQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery && !selectedGenre) return

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      let data
      if (trimmedQuery) {
        data = await searchMovies(trimmedQuery)
      } else {
        data = await getMoviesByGenre(selectedGenre)
      }

      let results = data.results || []

      if (trimmedQuery && selectedGenre) {
        results = results.filter((m) =>
          (m.genre_ids || []).includes(Number(selectedGenre))
        )
      }

      setMovies(results)
    } catch (err) {
      setError(err.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setQuery('')
    setSelectedGenre('')
    setMovies([])
    setError(null)
    setSearched(false)
  }

  return (
    <div>
      <h2 className="mb-4">Search movies</h2>

      <form onSubmit={handleSearch} className="row g-2 mb-4">
        <div className="col-12 col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Movie title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-4">
          <select
            className="form-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary w-100">
            Search
          </button>
          {searched && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-outline-secondary"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && searched && movies.length === 0 && !error && (
        <p className="text-muted">No movies for the given criteria</p>
      )}

      <div className="row g-3">
        {movies.map((movie) => (
          <div className="col-6 col-md-3" key={movie.id}>
            <MovieCard 
              movie={movie} 
              genres={genres} 
              isSaved={isInWatchlist(movie.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          </div>
        ))}
      </div>
    </div>
  )
}