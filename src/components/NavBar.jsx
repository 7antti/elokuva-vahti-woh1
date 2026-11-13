import { NavLink } from 'react-router-dom'
import { Bookmark, Calendar, Film, Search } from 'lucide-react'

export default function Navbar({ watchlistCount }) {
  return (
    <nav className="navbar bg-white border-bottom">
      <div className="container">
        <NavLink to="/" className="navbar-brand fw-bold">
          <Film size={20} className="text-primary me-2" />
          Elokuvavahti
        </NavLink>

        <div className="nav nav-pills">
          <NavLink to="/" end className="nav-link">
            <Calendar size={16} className="me-1" />
            Upcoming
          </NavLink>

          <NavLink to="/search" className="nav-link">
            <Search size={16} className="me-1" />
            Search
          </NavLink>

          <NavLink to="/watchlist" className="nav-link">
            <Bookmark size={16} className="me-1" />
            Watchlist ({watchlistCount})
          </NavLink>
        </div>
      </div>
    </nav>
  )
}