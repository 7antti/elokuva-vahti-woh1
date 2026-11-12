const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

async function fetchFromApi(endpoint, queryParams = '') {
  if (!API_KEY) {
    throw new Error('TMDB API -avain puuttuu (.env -> VITE_TMDB_API_KEY)')
  }

  const separator = queryParams ? '&' : ''
  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=fi-FI${separator}${queryParams}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return await response.json()
}

export async function getUpcomingMovies(page = 1) {
  return await fetchFromApi('/movie/upcoming', `page=${page}`)
}

export async function searchMovies(query) {
  return await fetchFromApi(
    '/search/movie',
    `query=${encodeURIComponent(query)}&include_adult=false`
  )
}

export async function getMoviesByGenre(genreId) {
  return await fetchFromApi(
    '/discover/movie',
    `with_genres=${genreId}&sort_by=popularity.desc&include_adult=false`
  )
}

export async function getGenres() {
  const data = await fetchFromApi('/genre/movie/list')
  return data.genres || []
}

export function formatDate(dateString) {
  if (!dateString) return 'Ei julkaisupäivää'
  const [year, month, day] = dateString.split('-')
  if (!year || !month || !day) return dateString
  return `${Number(day)}.${Number(month)}.${year}`
}