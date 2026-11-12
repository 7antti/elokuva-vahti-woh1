import { useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Moon, Search, Sun } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { InView } from 'react-intersection-observer'
import { NavLink, Route, Routes } from 'react-router-dom'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

function getStoredValue(key, fallbackValue) {
  const value = localStorage.getItem(key)
  if (value === null) {
    return fallbackValue
  }

  try {
    return JSON.parse(value)
  } catch {
    return fallbackValue
  }
}

function buildApiUrl(path, params = {}) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY
  if (!apiKey) {
    throw new Error('Missing TMDB API key. Add VITE_TMDB_API_KEY to your .env file.')
  }

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...params,
  })

  return `${API_BASE_URL}${path}?${searchParams.toString()}`
}

async function fetchFromTmdb(path, params = {}) {
  const response = await fetch(buildApiUrl(path, params))

  if (!response.ok) {
    throw new Error('TMDB request failed. Please try again later.')
  }

  return response.json()
}

async function fetchUpcoming(page = 1) {
  return fetchFromTmdb('/movie/upcoming', { page: String(page) })
}

async function fetchGenres() {
  return fetchFromTmdb('/genre/movie/list')
}

function getReleaseWindowDays(movieReleaseDate) {
  const today = new Date()
  const releaseDate = new Date(movieReleaseDate)
  today.setHours(0, 0, 0, 0)
  releaseDate.setHours(0, 0, 0, 0)

  return Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24))
}

function MovieCard({ movie, isFavorite, onToggleFavorite }) {
  const posterUrl = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null

  return (
    <article className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-800">
        {posterUrl ? (
          <img
            className="h-full w-full object-cover"
            src={posterUrl}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-sm text-slate-600 dark:text-slate-300">
            No poster available
          </div>
        )}

        <button
          type="button"
          onClick={() => onToggleFavorite(movie)}
          className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-400' : ''}`} />
        </button>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">{movie.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Release date: {movie.release_date || 'Unknown'}</p>
      </div>
    </article>
  )
}

function MovieGrid({ movies, favoriteIds, onToggleFavorite }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={favoriteIds.has(movie.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </section>
  )
}

function UpcomingPage({ favoriteIds, onToggleFavorite }) {
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const loadPage = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await fetchUpcoming(page)
        if (ignore) {
          return
        }

        setMovies((current) => {
          const nextById = new Map(current.map((movie) => [movie.id, movie]))
          data.results.forEach((movie) => nextById.set(movie.id, movie))
          return [...nextById.values()]
        })
        setTotalPages(data.total_pages)
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError.message)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      ignore = true
    }
  }, [page])

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming releases</h2>
        <p className="text-slate-600 dark:text-slate-300">Scroll to load more upcoming movies.</p>
      </header>

      {error ? <p className="rounded-md bg-red-100 p-3 text-red-700 dark:bg-red-900/40 dark:text-red-200">{error}</p> : null}

      <MovieGrid movies={movies} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} />

      <InView
        as="div"
        rootMargin="300px"
        onChange={(inView) => {
          if (inView && !loading && page < totalPages) {
            setPage((currentPage) => currentPage + 1)
          }
        }}
        className="py-6 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        {loading ? 'Loading more movies...' : page >= totalPages ? 'No more results' : 'Scroll for more'}
      </InView>
    </div>
  )
}

function FiltersPage({ genres, favoriteIds, onToggleFavorite }) {
  const [nameInput, setNameInput] = useState('')
  const [genreInput, setGenreInput] = useState('')
  const [appliedFilters, setAppliedFilters] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!appliedFilters) {
      return
    }

    let ignore = false

    const loadResults = async () => {
      setLoading(true)
      setError('')

      try {
        const pages = [1, 2, 3, 4, 5]
        const responses = await Promise.all(pages.map((page) => fetchUpcoming(page)))
        if (ignore) {
          return
        }

        const upcomingMovies = responses.flatMap((response) => response.results)
        const lowerName = appliedFilters.name.toLowerCase().trim()

        const filtered = upcomingMovies.filter((movie) => {
          const matchesName = !lowerName || movie.title.toLowerCase().includes(lowerName)
          const matchesGenre =
            !appliedFilters.genreId || movie.genre_ids.includes(Number(appliedFilters.genreId))

          return matchesName && matchesGenre
        })

        setResults(filtered)
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError.message)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadResults()

    return () => {
      ignore = true
    }
  }, [appliedFilters])

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Filter upcoming movies</h2>
        <p className="text-slate-600 dark:text-slate-300">Movies appear only after clicking Apply filters.</p>
      </header>

      <form
        className="grid gap-3 rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-[1fr_220px_auto]"
        onSubmit={(event) => {
          event.preventDefault()
          setAppliedFilters({ name: nameInput, genreId: genreInput })
        }}
      >
        <label className="space-y-1">
          <span className="text-sm text-slate-600 dark:text-slate-300">Movie name</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            placeholder="Search by movie title"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-slate-600 dark:text-slate-300">Genre</span>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            value={genreInput}
            onChange={(event) => setGenreInput(event.target.value)}
          >
            <option value="">All genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <Search className="h-4 w-4" />
          Apply filters
        </button>
      </form>

      {error ? <p className="rounded-md bg-red-100 p-3 text-red-700 dark:bg-red-900/40 dark:text-red-200">{error}</p> : null}
      {loading ? <p className="text-slate-600 dark:text-slate-300">Loading filtered movies...</p> : null}
      {!loading && appliedFilters && !results.length ? (
        <p className="text-slate-600 dark:text-slate-300">No upcoming movies matched your filters.</p>
      ) : null}

      {appliedFilters ? (
        <MovieGrid movies={results} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} />
      ) : (
        <p className="text-slate-600 dark:text-slate-300">Set filters and click Apply filters to view results.</p>
      )}
    </div>
  )
}

function FavoritesPage({ favorites, favoriteIds, onToggleFavorite }) {
  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Favorite upcoming movies</h2>
        <p className="text-slate-600 dark:text-slate-300">Your favorite list is saved in your browser.</p>
      </header>

      {favorites.length ? (
        <MovieGrid movies={favorites} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} />
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">
          You have no favorite movies yet.
        </p>
      )}
    </div>
  )
}

function App() {
  const [favorites, setFavorites] = useState(() => getStoredValue('favorites', []))
  const [theme, setTheme] = useState(() => getStoredValue('theme', 'light'))
  const [reminderDays, setReminderDays] = useState(() => getStoredValue('reminderDays', 7))
  const [genres, setGenres] = useState([])
  const [genreError, setGenreError] = useState('')
  const shownReminderIds = useRef(new Set())

  const favoriteIds = useMemo(() => new Set(favorites.map((movie) => movie.id)), [favorites])

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme))
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    localStorage.setItem('reminderDays', JSON.stringify(reminderDays))
    shownReminderIds.current.clear()
  }, [reminderDays])

  useEffect(() => {
    let ignore = false

    const loadGenres = async () => {
      try {
        const data = await fetchGenres()
        if (!ignore) {
          setGenres(data.genres ?? [])
        }
      } catch (error) {
        if (!ignore) {
          setGenreError(error.message)
        }
      }
    }

    loadGenres()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    favorites.forEach((movie) => {
      if (!movie.release_date) {
        return
      }

      const daysUntilRelease = getReleaseWindowDays(movie.release_date)
      const reminderKey = `${movie.id}-${reminderDays}`

      if (
        daysUntilRelease >= 0 &&
        daysUntilRelease <= reminderDays &&
        !shownReminderIds.current.has(reminderKey)
      ) {
        toast(`${movie.title} releases in ${daysUntilRelease} day(s)!`)
        shownReminderIds.current.add(reminderKey)
      }
    })
  }, [favorites, reminderDays])

  const toggleFavorite = (movie) => {
    setFavorites((currentFavorites) => {
      const existing = currentFavorites.some((favoriteMovie) => favoriteMovie.id === movie.id)

      if (existing) {
        return currentFavorites.filter((favoriteMovie) => favoriteMovie.id !== movie.id)
      }

      return [
        {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          genre_ids: movie.genre_ids ?? [],
        },
        ...currentFavorites,
      ]
    })
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Toaster position="bottom-right" />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-4 rounded-xl border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Elokuva Vahti</h1>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 dark:text-slate-300" htmlFor="reminder-days">
                Reminder window (days)
              </label>
              <select
                id="reminder-days"
                className="rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-950"
                value={reminderDays}
                onChange={(event) => setReminderDays(Number(event.target.value))}
              >
                {[1, 3, 7, 14, 30].map((dayValue) => (
                  <option key={dayValue} value={dayValue}>
                    {dayValue}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
                className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {[
              { to: '/', label: 'Upcoming' },
              { to: '/filters', label: 'Filters' },
              { to: '/favorites', label: 'Favorites' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        {genreError ? (
          <p className="rounded-md bg-red-100 p-3 text-red-700 dark:bg-red-900/40 dark:text-red-200">{genreError}</p>
        ) : null}

        <Routes>
          <Route path="/" element={<UpcomingPage favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />} />
          <Route
            path="/filters"
            element={<FiltersPage genres={genres} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />}
          />
          <Route
            path="/favorites"
            element={<FavoritesPage favorites={favorites} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />}
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
