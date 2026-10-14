import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

// Le cadre commun à toutes les pages : il reste monté quand on change de page.
// <Outlet /> est le trou où le routeur affiche la page de la route enfant.
function Layout() {
  return (
    <>
      <Header />
      <main id="contenu-principal">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}

export default Layout