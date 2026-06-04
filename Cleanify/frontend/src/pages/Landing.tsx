import { motion } from 'framer-motion'

import { Music2, Shuffle, Sparkles } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#1DB954 1px, transparent 1px), linear-gradient(90deg, #1DB954 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Green glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#1DB954] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center">
            <Music2 size={16} className="text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">Cleanify</span>
        </motion.div>
        <motion.a
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          href="https://github.com/RhettTheRhett/SpotfyPlaylistCleaner"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          
          <span>Open Source</span>
        </motion.a>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 max-w-4xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full px-4 py-1.5 text-[#1DB954] text-sm font-medium mb-8"
        >
          <Sparkles size={14} />
          Free & Open Source
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6"
          style={{ fontFamily: "'Circular', 'DM Sans', sans-serif" }}
        >
          Clean up
          <br />
          <span className="text-[#1DB954]">your playlists.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-lg md:text-xl max-w-xl leading-relaxed mb-12"
        >
          Cleanify scans your Spotify playlists, swaps explicit tracks for
          clean versions automatically, and creates a brand new playlist —
          ready to share with anyone.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { icon: <Shuffle size={14} />, label: 'Auto-replaces explicit tracks' },
            { icon: <Music2 size={14} />, label: 'Finds radio & clean edits' },
            { icon: <Sparkles size={14} />, label: 'Creates a new clean playlist' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white/70"
            >
              {f.icon}
              {f.label}
            </div>
          ))}
        </motion.div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        >
          <a
            href="/auth/login"
            className="group inline-flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-lg px-10 py-5 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(29,185,84,0.4)] active:scale-95"
          >
            {/* Spotify icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-black">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Login with Spotify
          </a>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 my-10 w-full max-w-sm"
        >
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-sm">or run it locally</span>
          <div className="flex-1 h-px bg-white/10" />
        </motion.div>

        {/* Local instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="w-full max-w-lg text-left bg-white/[0.03] border border-white/10 rounded-2xl p-6"
        >
          <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">Run locally</p>
          <ol className="space-y-3 text-sm text-white/60">
            <li className="flex gap-3">
              <span className="text-[#1DB954] font-mono font-bold shrink-0">01</span>
              <span>Clone the repo from <a href="https://github.com/RhettTheRhett/SpotfyPlaylistCleaner" className="text-[#1DB954] hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a> and follow the README setup</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#1DB954] font-mono font-bold shrink-0">02</span>
              <span>Add your Spotify app credentials to <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">.env</code></span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#1DB954] font-mono font-bold shrink-0">03</span>
              <span>Run <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">npm run dev</code> in both <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">backend/</code> and <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">frontend/</code></span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#1DB954] font-mono font-bold shrink-0">04</span>
              <span>Visit <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">localhost:5173</code> and log in</span>
            </li>
          </ol>
        </motion.div>
      </main>
    </div>
  )
}