import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/wave.css'
import Layout from './components/Layout'
import ProfileLayout from './components/ProfileLayout'
import Home from './pages/Home'
import MyTracks from './pages/MyTracks'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import AlbumPage from './pages/AlbumPage'
import ArtistPage from './pages/ArtistPage'

// Routes imbriquées : chaque niveau affiche ses enfants dans son <Outlet />.
//   Layout          (Header + Footer)
//    ├─ Home        index          →  /
//    ├─ ProfileLayout  profile     →  titre + onglets
//    │   ├─ MyTracks   index       →  /profile
//    │   └─ Settings   settings    →  /profile/settings
//    └─ NotFound    *              →  toute autre adresse, DANS le Layout
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'album/:id', element: <AlbumPage /> },
      { path: 'artist/:id', element: <ArtistPage /> },
      {
        path: 'profile',
        element: <ProfileLayout />,
        children: [
          { index: true, element: <MyTracks /> },
          { path: 'settings', element: <Settings /> },
          
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)