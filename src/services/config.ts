const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error(
    'VITE_API_BASE_URL est manquante : crée un fichier .env à la racine du projet.'
  )
}

export const API_BASE_URL: string = apiBaseUrl