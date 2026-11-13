import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { IMAGE_BASE_URL, formatDate } from '../Services/tmdb'

export default function MovieCard({ movie, genres, isSaved, onToggleWatchlist }) {
  const [imageError, setImageError] = useState(false)

  const movieGenres = (movie.genre_ids || [])
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div className="card h-100">
      {movie.poster_path && !imageError ? (
        <img
          src={`${IMAGE_BASE_URL}${movie.poster_path}`}
          alt={movie.title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="card-img-top poster"
        />
      ) : (
        <div className="card-img-top poster bg-light d-flex align-items-center justify-content-center text-muted">
          No poster available
        </div>
      )}

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{movie.title}</h5>
        <p className="card-text text-muted small mb-1">
          Release: {formatDate(movie.release_date)}
        </p>

        {movieGenres.length > 0 && (
          <p className="card-text text-muted small">{movieGenres.join(', ')}</p>
        )}

      <button
          type="button"
          onClick={() => onToggleWatchlist(movie)}
          className={isSaved ? 'btn btn-primary mt-auto' : 'btn btn-outline-secondary mt-auto'}
        >
          {isSaved ? <BookmarkCheck size={16} className="me-1" /> : <Bookmark size={16} className="me-1" />}
          {isSaved ? 'Following' : 'Add to watchlist'}
        </button>
      </div>
    </div>
  )
}