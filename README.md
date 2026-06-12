# Spotless

A Spotify playlist cleaner. Give it a playlist (or your entire Liked Songs library), and it finds clean / radio edit versions of every explicit track and creates a brand new playlist on your account.

Built with Node.js, Express, TypeScript, React, and Vite.

---

## What it does

1. Authenticates with your Spotify account via OAuth (PKCE — no client secret exposed to the browser)
2. Shows all your playlists, plus a Liked Songs card at the top
3. On any playlist, displays your tracks and flags explicit ones
4. Hit **Clean It Up** and Spotless:
   - Keeps tracks that are already clean
   - Searches for clean / radio edit versions of every explicit track
   - Scores candidates by title match, artist match, and popularity
   - Creates a new `[Playlist Name] - Clean` playlist on your account with the results
5. Shows you exactly what was swapped, what was kept, and what couldn't be replaced

---

## Tech stack

**Backend** — Node.js, Express, TypeScript, Axios, express-session  
**Frontend** — React, TypeScript, Vite, Tailwind CSS, Framer Motion

---

## Running locally

### Prerequisites

- Node.js 18+
- A Spotify app — create one at [developer.spotify.com](https://developer.spotify.com/dashboard)
  - Set the redirect URI to `http://127.0.0.1:3000/auth/callback`
  - Required scopes: `playlist-read-private`, `playlist-read-collaborative`, `playlist-modify-private`, `playlist-modify-public`, `user-read-private`

### Setup

```bash
git clone https://github.com/RhettTheRhett/SpotfyPlaylistCleaner
cd SpotfyPlaylistCleaner/Spotless
```

Create `backend/.env`:

```
PORT=3000
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/auth/callback
SESSION_SECRET=a_long_random_string_at_least_32_chars
DATABASE_URL="file:./dev.db"
```

Install and run:

```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

Visit [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## Notes

- **Redirect URI must use `127.0.0.1`**, not `localhost` — Spotify treats them differently
- **Tokens expire after 1 hour** — just log out and back in (refresh token support is on the roadmap)
- **Playlists you follow but don't own** will show a Spotify restriction error on track fetch — this is expected behaviour since Feb 2026
- The repo name has a typo (`SpotfyPlaylistCleaner`). It's staying.

---

## Known limitations / roadmap

- [ ] Refresh token support (schema already has the field ready)
- [ ] Better clean version matching — currently can pick a compilation over the original album version
- [ ] Progress updates streamed to the frontend instead of a fake progress bar
- [ ] Multi-user support via Prisma (DB is set up, not yet wired in)

---

## License

MIT