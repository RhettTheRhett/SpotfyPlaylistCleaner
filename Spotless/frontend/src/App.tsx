import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Playlists from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/playlists" element={<Playlists />} />
      <Route path="/playlists/:id" element={<PlaylistDetail />} />
    </Routes>
  )
}