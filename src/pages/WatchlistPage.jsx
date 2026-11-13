import MovieCard from '../components/MovieCard'

export default function WatchlistPage({ watchlist, genres, isInWatchlist, onToggleWatchlist }) {
  const sortedMovies = [...watchlist].sort((a, b) =>
    (a.release_date || '9999-12-31').localeCompare(b.release_date || '9999-12-31')
  )

  return (
    <div>
      <h2 className="mb-4">My watchlist</h2>

      {sortedMovies.length === 0 ? (
        <div className="text-center my-5">
          <p className="text-muted">Watchlist is currently empty.</p>
        </div>
      ) : (
        <div className="row g-3">
          {sortedMovies.map((movie) => (
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
      )}
    </div>
  )
}