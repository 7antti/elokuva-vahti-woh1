import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { getMoviesByGenre, searchMovies } from '../Services/tmdb'
import MovieCard from '../components/MovieCard'

export default function SearchPage({ genres, isInWatchlist, onToggleWatchlist }) {
  const [query, setQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [activeSearch, setActiveSearch] = useState(null)
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { ref, inView } = useInView()

  useEffect(() => {
    if (!activeSearch) return

    async function loadResults() {
      setLoading(true)
      setError(null)

      try {
        let data
        if (activeSearch.query) {
          data = await searchMovies(activeSearch.query, page)
        } else {
          data = await getMoviesByGenre(activeSearch.genre, page)
        }

        let results = data.results || []

        if (activeSearch.query && activeSearch.genre) {
          results = results.filter((m) =>
            (m.genre_ids || []).includes(Number(activeSearch.genre))
          )
        }

        setMovies((prev) => {
          if (page === 1) return results
          const existingIds = new Set(prev.map((m) => m.id))
          const uniqueNew = results.filter((m) => !existingIds.has(m.id))
          return [...prev, ...uniqueNew]
        })

        setTotalPages(data.total_pages || 1)
      } catch (err) {
        setError(err.message || 'Search failed')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [activeSearch, page])

  useEffect(() => {
    if (inView && !loading && !error && activeSearch && page < totalPages) {
      setPage((prev) => prev + 1)
    }
  }, [inView, loading, error, activeSearch, page, totalPages])

  function handleSearch(e) {
    e.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery && !selectedGenre) return

    setMovies([])
    setPage(1)
    setTotalPages(1)
    setActiveSearch({ query: trimmedQuery, genre: selectedGenre })
  }

  function handleClear() {
    setQuery('')
    setSelectedGenre('')
    setActiveSearch(null)
    setMovies([])
    setPage(1)
    setTotalPages(1)
    setError(null)
  }

  return (
    <div>
      <h2 className="mb-4">Search movies</h2>
      <p className="text-muted mb-4">
        This site uses themoviedb.org API to fetch movie data. You can search for movies by title and/or filter by genre. The results are sorted by release date.
      </p>

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
          {activeSearch && (
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

      {!loading && activeSearch && movies.length === 0 && !error && (
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
        <div ref={ref} className="text-center my-4 text-muted">
        {loading && <div className="spinner-border text-primary" role="status" />}
        {!loading && movies.length > 0 && page >= totalPages && <p>Everything loaded.</p>}
      </div>
    </div>
  )
}