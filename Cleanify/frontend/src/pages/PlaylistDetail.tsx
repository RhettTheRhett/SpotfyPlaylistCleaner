import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Music2, AlertTriangle, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'
import type { Playlist, Track, CleanifyReport } from '../types'

// Simple confetti component
function Confetti() {
  const pieces = Array.from({ length: 80 })
  const colors = ['#1DB954', '#ffffff', '#1ed760', '#a3ffb0', '#000000']
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const color = colors[i % colors.length]
        const left = Math.random() * 100
        const delay = Math.random() * 1.5
        const duration = 2.5 + Math.random() * 2
        const size = 6 + Math.random() * 8
        return (
          <motion.div
            key={i}
            className="absolute top-0 rounded-sm"
            style={{ left: `${left}%`, width: size, height: size, backgroundColor: color }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: '110vh', opacity: [1, 1, 0], rotate: 720 * (Math.random() > 0.5 ? 1 : -1) }}
            transition={{ duration, delay, ease: 'easeIn' }}
          />
        )
      })}
    </div>
  )
}

type Stage = 'detail' | 'loading' | 'done'

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [playlist, setPlaylist] = useState<Playlist | null>(location.state?.playlist ?? null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [tracksLoading, setTracksLoading] = useState(true)
  const [stage, setStage] = useState<Stage>('detail')
  const [progress, setProgress] = useState(0)
  const [report, setReport] = useState<CleanifyReport | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const explicitCount = tracks.filter(t => t.explicit).length

  useEffect(() => {
    async function loadTracks() {
      try {
        const res = await fetch(`/spotify/playlists/${id}/tracks`)
        if (res.status === 401) { navigate('/'); return }
        const data = await res.json()
        setTracks(Array.isArray(data) ? data : [])
      } finally {
        setTracksLoading(false)
      }
    }

    // If we don't have playlist info from navigation state, fetch it
    async function loadPlaylist() {
      const res = await fetch(`/spotify/playlists`)
      if (res.ok) {
        const data = await res.json()
        const found = data.items?.find((p: Playlist) => p.id === id)
        if (found) setPlaylist(found)
      }
    }

    if (!playlist) loadPlaylist()
    loadTracks()
  }, [id, navigate, playlist])

  const handleCleanify = async () => {
    setStage('loading')
    setProgress(0)

    // Fake progress bar — the real request is slow so we animate optimistically
    progressInterval.current = setInterval(() => {
      setProgress(p => {
        if (p >= 85) { clearInterval(progressInterval.current!); return 85 }
        return p + (Math.random() * 3)
      })
    }, 400)

    try {
      const res = await fetch(`/spotify/playlists/${id}/cleanify`, { method: 'POST' })
      const data: CleanifyReport = await res.json()

      clearInterval(progressInterval.current!)
      setProgress(100)

      setTimeout(() => {
        setReport(data)
        setStage('done')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      }, 600)
    } catch {
      clearInterval(progressInterval.current!)
      setStage('detail')
    }
  }

  const coverUrl = playlist?.images?.[0]?.url

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {showConfetti && <Confetti />}

      {/* Background glow from cover art color */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#1DB954] opacity-[0.05] blur-[180px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center gap-4 px-8 py-4 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <button
          onClick={() => navigate('/playlists')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </nav>

      <AnimatePresence mode="wait">

        {/* ── DETAIL VIEW ── */}
        {stage === 'detail' && (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto px-8 py-10 flex flex-col lg:flex-row gap-10"
          >
            {/* Left — playlist info */}
            <div className="lg:w-72 shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-24"
              >
                {/* Cover */}
                <div className="aspect-square rounded-2xl overflow-hidden bg-white/[0.06] mb-6 shadow-2xl">
                  {coverUrl ? (
                    <img src={coverUrl} alt={playlist?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 size={48} className="text-white/20" />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-black tracking-tight leading-tight mb-1">
                  {playlist?.name ?? 'Loading...'}
                </h1>
                {playlist?.description && (
                  <p className="text-white/40 text-sm mb-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: playlist.description }}
                  />
                )}
                <p className="text-white/30 text-sm mb-1">
                  by <span className="text-white/50">{playlist?.owner?.display_name}</span>
                </p>
                <p className="text-white/30 text-sm mb-6">
                  {playlist?.tracks?.total} tracks
                </p>

                {/* Explicit counter */}
                {!tracksLoading && (
                  <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-6 ${explicitCount > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-[#1DB954]/10 border border-[#1DB954]/20'}`}>
                    <AlertTriangle size={16} className={explicitCount > 0 ? 'text-red-400' : 'text-[#1DB954]'} />
                    <span className={`text-sm font-semibold ${explicitCount > 0 ? 'text-red-400' : 'text-[#1DB954]'}`}>
                      {explicitCount === 0
                        ? 'No explicit tracks!'
                        : `${explicitCount} explicit track${explicitCount !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                )}

                {/* Cleanify button */}
                <button
                  onClick={handleCleanify}
                  disabled={tracksLoading || explicitCount === 0}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-full transition-all duration-200 hover:shadow-[0_0_30px_rgba(29,185,84,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  {explicitCount === 0 ? 'Already clean!' : 'Clean It Up ✨'}
                </button>
              </motion.div>
            </div>

            {/* Right — track list */}
            <div className="flex-1 min-w-0">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-semibold text-white/30 uppercase tracking-widest mb-4"
              >
                Tracks
              </motion.h2>

              {tracksLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 py-3">
                      <div className="w-8 h-3 bg-white/[0.06] rounded" />
                      <div className="flex-1 h-3 bg-white/[0.06] rounded" />
                      <div className="w-16 h-3 bg-white/[0.04] rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin">
                  {tracks.map((track, i) => (
                    <motion.div
                      key={track.id + i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.5) }}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.04] group"
                    >
                      <span className="text-white/20 text-xs w-6 text-right shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${track.explicit ? 'text-white/80' : 'text-white/80'}`}>
                          {track.name}
                        </p>
                        <p className="text-white/30 text-xs truncate">{track.artists.join(', ')}</p>
                      </div>
                      {track.explicit && (
                        <span className="shrink-0 text-[10px] font-bold bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                          E
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── LOADING VIEW ── */}
        {stage === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[80vh] px-8"
          >
            {coverUrl && (
              <motion.img
                src={coverUrl}
                alt=""
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 rounded-xl object-cover mb-8 shadow-2xl"
              />
            )}
            <h2 className="text-2xl font-black mb-2">Cleaning your playlist</h2>
            <p className="text-white/40 text-sm mb-10">Finding clean versions of explicit tracks...</p>

            {/* Progress bar */}
            <div className="w-full max-w-md">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#1DB954] rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/20 text-xs">Working...</span>
                <span className="text-white/20 text-xs">{Math.round(progress)}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── DONE VIEW ── */}
        {stage === 'done' && report && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-8 py-16 text-center"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 size={36} className="text-[#1DB954]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black tracking-tight mb-3"
            >
              You've cleaned
              <br />
              <span className="text-[#1DB954]">{report.originalPlaylist}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/40 mb-10"
            >
              {report.keptClean.length} tracks kept · {report.substituted.length} swapped for clean versions
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-3 gap-4 mb-10"
            >
              {[
                { label: 'Total tracks', value: report.totalTracksProcessed },
                { label: 'Clean versions found', value: report.substituted.length },
                { label: 'Could not convert', value: report.unresolved.length },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl py-4 px-3">
                  <p className="text-2xl font-black text-[#1DB954]">{s.value}</p>
                  <p className="text-white/40 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Unresolved tracks */}
            {report.unresolved.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-8 text-left"
              >
                <div className="flex items-center gap-2 mb-3">
                  <XCircle size={14} className="text-white/30" />
                  <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">
                    No clean version found
                  </p>
                </div>
                <div className="space-y-2">
                  {report.unresolved.map(t => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-white/10 text-white/40 px-1.5 py-0.5 rounded uppercase">E</span>
                      <p className="text-sm text-white/50">
                        {t.name} — <span className="text-white/30">{t.artists.join(', ')}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA button */}
            <motion.a
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: 'spring' }}
              href={report.newPlaylistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-lg px-10 py-5 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(29,185,84,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Take me to the playlist
              <ExternalLink size={16} />
            </motion.a>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate('/playlists')}
              className="block mx-auto mt-4 text-sm text-white/30 hover:text-white/50 transition-colors"
            >
              Clean another playlist
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}