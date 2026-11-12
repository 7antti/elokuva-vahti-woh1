import { useEffect, useState } from 'react'
import { getGenres } from './Services/tmdb'
import UpcomingPage from './pages/UpcomingPage'
import SearchPage from './pages/SearchPage'
import NavBar from './components/NavBar'
import { Route, Navigate, Routes } from 'react-router-dom'

export default function App() {
  const [genres, setGenres] = useState([])

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

  return (
    <>
      <NavBar />
    <main className="container my-4">
      <Routes>
        <Route path="/" element={<UpcomingPage genres={genres} />} />
        <Route path="/search" element={<SearchPage genres={genres} />} />
        <Route
            path="/watchlist"
            element={<p className="text-center text-muted my-5">TODO: Watchlist</p>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    </>
  )
}