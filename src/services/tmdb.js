const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function fetchFromApi(endpoint, queryParams = '') {
  if (!API_KEY) {
    throw new Error('API key missing (.env -> VITE_TMDB_API_KEY)')
  }

  const separator = queryParams ? '&' : ''
  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US${separator}${queryParams}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return await response.json()
}

export async function getUpcomingMovies(page = 1) {
    const today = getToday()
  return await fetchFromApi(
    '/discover/movie',
    `primary_release_date.gte=${today}&sort_by=primary_release_date.asc&include_adult=false&page=${page}`
  )
}

export async function searchMovies(query) {
  const today = getToday()
  const data = await fetchFromApi(
    '/search/movie',
    `query=${encodeURIComponent(query)}&include_adult=false`
  )


  const futureResults = (data.results || [])
    .filter((movie) => movie.release_date && movie.release_date >= today)
    .sort((a, b) => a.release_date.localeCompare(b.release_date))

  return { ...data, results: futureResults }
  // const futureResults = (data.results || []).filter(
  //   (movie) => movie.release_date && movie.release_date >= today
  // )

  // return { ...data, results: futureResults }
}

export async function getMoviesByGenre(genreId) {
  const today = getToday()
  return await fetchFromApi(
    '/discover/movie',
    `with_genres=${genreId}&primary_release_date.gte=${today}&sort_by=primary_release_date.asc&include_adult=false`
  )
}

export async function getGenres() {
  const data = await fetchFromApi('/genre/movie/list')
  return data.genres || []
}

export function formatDate(dateString) {
  if (!dateString) return 'No release date'
  const [year, month, day] = dateString.split('-')
  if (!year || !month || !day) return dateString
  return `${Number(day)}.${Number(month)}.${year}`
}