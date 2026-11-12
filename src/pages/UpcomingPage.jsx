import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { getUpcomingMovies } from '../Services/tmdb'
import MovieCard from '../components/MovieCard'

export default function UpcomingPage({ genres }) {
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const { ref, inView } = useInView()

  useEffect(() => {
    async function loadMovies() {
      setLoading(true)
      setError(null)

      try {
        const data = await getUpcomingMovies(page)
        const results = data.results || []

        setMovies((prev) => {
          if (page === 1) return results
          const existingIds = new Set(prev.map((m) => m.id))
          const uniqueNew = results.filter((m) => !existingIds.has(m.id))
          return [...prev, ...uniqueNew]
        })

        setTotalPages(data.total_pages || 1)
      } catch (err) {
        setError(err.message || 'Loading movies failed')
      } finally {
        setLoading(false)
      }
    }

    loadMovies()
  }, [page, retryCount])

  useEffect(() => {
    if (inView && !loading && !error && page < totalPages) {
      setPage((prev) => prev + 1)
    }
  }, [inView, loading, error, page, totalPages])

  return (
    <div>
      <h2 className="mb-4">Upcoming Movies</h2>

      {error && (
        <div className="alert alert-danger">
          {error}{' '}
          <button
            type="button"
            onClick={() => setRetryCount((prev) => prev + 1)}
            className="btn btn-danger btn-sm ms-2"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="row g-3">
        {movies.map((movie) => (
          <div className="col-6 col-md-3" key={movie.id}>
            <MovieCard movie={movie} genres={genres} />
          </div>
        ))}
      </div>

      <div ref={ref} className="text-center my-4 text-muted">
        {loading && <div className="spinner-border text-primary" role="status" />}
        {!loading && movies.length > 0 && page >= totalPages && <p>Kaikki elokuvat ladattu.</p>}
      </div>
    </div>
  )
}