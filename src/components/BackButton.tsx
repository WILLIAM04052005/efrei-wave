import { useLocation, useNavigate } from 'react-router-dom'

function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  // key === 'default' : c'est la toute première page de la session (adresse
  // tapée ou lien externe). navigate(-1) ne mènerait nulle part sur notre site.
  const hasHistory = location.key !== 'default'

  function goBack() {
    if (hasHistory) {
      navigate(-1) // un pas en arrière dans l'historique, comme le bouton du navigateur
    } else {
      navigate('/')
    }
  }

  return (
    <button type="button" className="btn btn-ghost back-button" onClick={goBack}>
      <span aria-hidden="true">←</span> Retour
    </button>
  )
}

export default BackButton