import { useEffect, useState } from 'react'
import { getGenres } from './Services/tmdb'
import UpcomingPage from './pages/UpcomingPage'
import SearchPage from './pages/SearchPage'
import NavBar from './components/NavBar'
import WatchlistPage from './pages/WatchlistPage'
import { Route, Navigate, Routes } from 'react-router-dom'

export default function App() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('elokuva_vahti_watchlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [genres, setGenres] = useState([])

  useEffect(() => {
    localStorage.setItem('elokuva_vahti_watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  useEffect(() => {
    async function loadGenres() {
      try {
        const data = await getGenres()
        setGenres(data)
      } catch (error) {
        console.error('Genre fetch failed:', error)
      }
    }
    loadGenres()
  }, [])

  const toggleWatchlist = (movie) => {
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.id === movie.id)
      if (exists) {
        return prev.filter((item) => item.id !== movie.id)
      }
      return [...prev, movie]
    })
  }

  const isInWatchlist = (movieId) => {
    return watchlist.some((item) => item.id === movieId)
  }

  return (
    <>
    <NavBar watchlistCount={watchlist.length} />

      <main className="container my-4">
        <Routes>
          <Route
            path="/"
            element={
              <UpcomingPage
                genres={genres}
                isInWatchlist={isInWatchlist}
                onToggleWatchlist={toggleWatchlist}
              />
            }
          />
          <Route
            path="/search"
            element={
              <SearchPage
                genres={genres}
                isInWatchlist={isInWatchlist}
                onToggleWatchlist={toggleWatchlist}
              />
            }
          />
          <Route
            path="/watchlist"
            element={
              <WatchlistPage
                watchlist={watchlist}
                genres={genres}
                isInWatchlist={isInWatchlist}
                onToggleWatchlist={toggleWatchlist}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    </>
  )
}