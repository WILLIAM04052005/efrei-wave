import { NavLink, Outlet } from 'react-router-dom'

// Second niveau de layout : le titre et les onglets restent, seul l'onglet change.
function ProfileLayout() {
  return (
    <div className="profile">
      <div className="page-intro">
        <h1>Profil</h1>
      </div>

      <nav className="profile-tabs" aria-label="Sections du profil">
        <ul>
          <li>
            {/* « end » : sans lui, /profile resterait actif sur /profile/settings. */}
            <NavLink to="/profile" end>
              Mes titres
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile/settings">Réglages</NavLink>
          </li>
        </ul>
      </nav>

      <Outlet />
    </div>
  )
}

export default ProfileLayout