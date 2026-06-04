import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {  Music2, Shuffle, Sparkles } from 'lucide-react'
import type { Playlist } from '../types'

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        // Fetch user info and playlists in parallel
        const [meRes, playlistsRes] = await Promise.all([
          fetch('/spotify/me'),
          fetch('/spotify/playlists'),
        ])

        if (meRes.status === 401 || playlistsRes.status === 401) {
          navigate('/')
          return
        }

        const me = await meRes.json()
        const data = await playlistsRes.json()

        setUserName(me.display_name)
        setPlaylists(data.items ?? [])
      } catch {
        setError('Failed to load playlists. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const handleLogout = async () => {
    await fetch('/auth/logout')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1DB954] opacity-[0.06] blur-[150px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center">
            <Music2 size={14} className="text-black" />
          </div>
          <span className="font-bold tracking-tight">Cleanify</span>
        </div>
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm text-white/40">
              Hey, <span className="text-white/70">{userName}</span>
            </span>
          )}
          <a
            href="https://github.com/RhettTheRhett/SpotfyPlaylistCleaner"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-black tracking-tight">Your Playlists</h1>
          <p className="text-white/40 mt-1">Select a playlist to clean it up</p>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-white/[0.06] rounded-xl mb-3" />
                <div className="h-3 bg-white/[0.06] rounded w-3/4 mb-2" />
                <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-white/40">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((playlist, i) => (
              <motion.button
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/playlists/${playlist.id}`, { state: { playlist } })}
                className="group text-left"
              >
                {/* Cover art */}
                <div className="aspect-square rounded-xl overflow-hidden bg-white/[0.06] mb-3 relative">
                  {playlist.images?.[0]?.url ? (
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 size={32} className="text-white/20" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#1DB954]/0 group-hover:bg-[#1DB954]/10 transition-colors duration-200 rounded-xl" />
                </div>

                <p className="font-semibold text-sm leading-tight truncate group-hover:text-[#1DB954] transition-colors">
                  {playlist.name}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {playlist.tracks.total} tracks
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}