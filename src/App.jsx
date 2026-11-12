import { useEffect, useState } from 'react'
import { getGenres } from './Services/tmdb'
import UpcomingPage from './pages/UpcomingPage'

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
    <main className="container my-4">
      <UpcomingPage genres={genres} />
    </main>
  )
}