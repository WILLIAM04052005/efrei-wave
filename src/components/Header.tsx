import { Link, NavLink } from 'react-router-dom'

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          Efrei Wave <span className="brand-namesub">Music</span>
        </Link>
        <nav className="site-nav" aria-label="Navigation principale">
          <ul>
            <li>
              {/* « end » : sans lui, « / » serait actif sur toutes les pages. */}
              <NavLink to="/" end>
                Accueil
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile">Profil</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header