import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function NotFound() {
  // useLocation donne l'adresse actuelle : on la rappelle à la personne.
  const { pathname } = useLocation()

  return (
    <>
      <Header />
      <main id="contenu-principal">
        <div className="page-intro">
      <h1>Page introuvable</h1>
      <p>
        L’adresse «&nbsp;{pathname}&nbsp;» n’existe pas sur Efrei Wave Music.
      </p>
      <Link to="/" className="btn btn-primary">
        Retour à l’accueil
      </Link>
    </div>
      </main>
      <Footer />
    </>
  )
}

export default NotFound