import axios from "axios";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  explicit: boolean;
  uri: string;
}

export interface CleanifyReport {
  originalPlaylist: string;
  newPlaylistId: string;
  newPlaylistUrl: string;
  totalTracksProcessed: number;
  keptClean: Track[];
  substituted: { original: Track; replacement: Track }[];
  unresolved: Track[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function spotifyHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// Normalize a track title for comparison — strips features, punctuation,
// and common suffixes so "Song Name (feat. X) - Radio Edit" matches "Song Name"
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(feat\..*?\)/gi, "")
    .replace(/\(ft\..*?\)/gi, "")
    .replace(/- radio edit/gi, "")
    .replace(/- clean( version)?/gi, "")
    .replace(/- clean edit/gi, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Score how good a candidate clean track is vs the original.
// Higher is better. Returns -1 if the candidate is explicit (disqualified).
function scoreCandidate(original: Track, candidate: any): number {
  if (candidate.explicit) return -1;

  const originalTitle = normalizeTitle(original.name);
  const candidateTitle = normalizeTitle(candidate.name);
  const originalArtist = original.artists[0]?.toLowerCase() ?? "";
  const candidateArtists: string[] = candidate.artists.map((a: any) =>
    a.name.toLowerCase()
  );

  let score = 0;

  // Must have at least one matching artist
  if (!candidateArtists.some((a) => a.includes(originalArtist) || originalArtist.includes(a))) {
    return -1;
  }

  // Title similarity
  if (candidateTitle === originalTitle) {
    score += 10; // exact match after normalization
  } else if (candidateTitle.includes(originalTitle) || originalTitle.includes(candidateTitle)) {
    score += 5; // partial match
  } else {
    return -1; // title too different — not the same song
  }

  // Prefer versions explicitly labeled as clean/radio edit
  const rawTitle = candidate.name.toLowerCase();
  if (rawTitle.includes("clean")) score += 3;
  if (rawTitle.includes("radio edit")) score += 2;

  // Prefer higher popularity (more likely to be the canonical version)
  score += (candidate.popularity ?? 0) / 20;

  return score;
}

// ── Core Functions ───────────────────────────────────────────────────────────

// Fetch all tracks from a playlist, handling Spotify's 100-item page limit
async function fetchAllTracks(token: string, playlistId: string): Promise<Track[]> {
  const tracks: Track[] = [];
  let nextUrl: string | null =
    `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=100`;

  while (nextUrl !== null) {
    const currentUrl: string = nextUrl;
    const response = await axios.get(currentUrl, {
      headers: spotifyHeaders(token),
    });

    const items: any[] = response.data.items ?? [];

    for (const item of items) {
      const t = item.item ?? item.track;
      if (!t || t.type !== "track") continue;

      tracks.push({
        id: t.id,
        name: t.name,
        artists: t.artists.map((a: any) => a.name),
        album: t.album.name,
        explicit: t.explicit,
        uri: t.uri,
      });
    }

    nextUrl = response.data.next ?? null;
  }

  return tracks;
}


// Pause execution for ms milliseconds
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry a Spotify search request up to maxRetries times on 429.
// Respects the Retry-After header if Spotify sends one.
async function spotifySearchWithRetry(
  token: string,
  params: Record<string, any>,
  maxRetries = 3
): Promise<any> {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: spotifyHeaders(token),
        params,
      });
      return response;
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 429) {
        const retryAfter = parseInt(error.response?.headers?.["retry-after"] ?? "1", 10);
        const waitMs = Math.max(retryAfter * 1000, delay);
        console.warn(`Rate limited. Waiting ${waitMs}ms before retry ${attempt + 1}/${maxRetries}`);
        if (attempt === maxRetries) throw error;
        await sleep(waitMs);
        delay *= 2; // exponential backoff
      } else {
        throw error; // non-429 errors bubble up immediately
      }
    }
  }
}

async function findCleanVersion(token: string, track: Track): Promise<Track | null> {
  const artistQuery = track.artists[0] ?? "";
  const queries = [
    `${track.name} ${artistQuery} clean`,
    `${track.name} ${artistQuery} radio edit`,
  ];

  let bestCandidate: any = null;
  let bestScore = -1;

  for (const query of queries) {
    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: spotifyHeaders(token),
        params: { q: query, type: "track", limit: 10 },
      });

      const candidates = response.data.tracks?.items ?? [];
      for (const candidate of candidates) {
        const score = scoreCandidate(track, candidate);
        if (score > bestScore) {
          bestScore = score;
          bestCandidate = candidate;
        }
      }
    } catch (error: any) {
      console.error(
        `Search failed for "${track.name}":`,
        error.response?.status,
        error.response?.data?.error?.message ?? error.message
      );
    }
  }

  if (!bestCandidate) return null;
  return {
    id: bestCandidate.id,
    name: bestCandidate.name,
    artists: bestCandidate.artists.map((a: any) => a.name),
    album: bestCandidate.album.name,
    explicit: bestCandidate.explicit,
    uri: bestCandidate.uri,
  };
}

// Create a new empty playlist on the user's account
async function createPlaylist(
  token: string,
  userId: string,
  name: string,
  description: string
): Promise<{ id: string; url: string }> {
  const response = await axios.post(
    `https://api.spotify.com/v1/me/playlists`,
    { name, description, public: false },
    { headers: { ...spotifyHeaders(token), "Content-Type": "application/json" } }
  );

  return {
    id: response.data.id,
    url: response.data.external_urls.spotify,
  };
}

// Add tracks to a playlist in batches of 100 (Spotify's limit per request)
async function addTracksToPlaylist(
  token: string,
  playlistId: string,
  uris: string[]
): Promise<void> {
  const BATCH_SIZE = 100;

  for (let i = 0; i < uris.length; i += BATCH_SIZE) {
    const batch = uris.slice(i, i + BATCH_SIZE);
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/items`,
      { uris: batch },
      { headers: { ...spotifyHeaders(token), "Content-Type": "application/json" } }
    );
  }
}


async function cleanifyTracksInternal(
  token: string,
  userId: string,
  allTracks: Track[],
  playlistName: string
): Promise<CleanifyReport> {
  console.log(`Starting cleanify for playlist: ${playlistName}`);

  const seen = new Set<string>();
  const cleanTracks: Track[] = [];
  const explicitTracks: Track[] = [];

  for (const track of allTracks) {
    if (seen.has(track.id)) continue;

    seen.add(track.id);

    if (track.explicit) {
      explicitTracks.push(track);
    } else {
      cleanTracks.push(track);
    }
  }

  console.log(
    `Clean: ${cleanTracks.length}, Explicit: ${explicitTracks.length}`
  );

  const substituted: CleanifyReport["substituted"] = [];
  const unresolved: Track[] = [];

  const BATCH_SIZE = 3;      // 3 tracks × 2 queries = 6 requests per batch
  const BATCH_DELAY_MS = 500; // 500ms between batches → ~12 req/s, well under Spotify's 30/s burst

  for (let i = 0; i < explicitTracks.length; i += BATCH_SIZE) {
    const batch = explicitTracks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(track => findCleanVersion(token, track))
    );
    for (let j = 0; j < batch.length; j++) {
      const cleanVersion = results[j];
      if (cleanVersion) {
        substituted.push({ original: batch[j], replacement: cleanVersion });
      } else {
        unresolved.push(batch[j]);
      }
    }
    // Don't delay after the last batch
    if (i + BATCH_SIZE < explicitTracks.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(
    `Substituted: ${substituted.length}, Unresolved: ${unresolved.length}`
  );

  const newPlaylist = await createPlaylist(
    token,
    userId,
    `${playlistName} - Clean`,
    `Clean version of ${playlistName}, generated by Cleanify`
  );

  console.log(`Created playlist: ${newPlaylist.id}`);

  const urisToAdd = [
    ...cleanTracks.map((t) => t.uri),
    ...substituted.map((s) => s.replacement.uri),
  ];

  if (urisToAdd.length > 0) {
    await addTracksToPlaylist(
      token,
      newPlaylist.id,
      urisToAdd
    );
  }

  console.log(
    `Added ${urisToAdd.length} tracks to new playlist`
  );

  return {
  originalPlaylist: playlistName,
  newPlaylistId: newPlaylist.id,
  newPlaylistUrl: newPlaylist.url,
  totalTracksProcessed: allTracks.length,
  keptClean: cleanTracks ?? [],
  substituted: substituted ?? [],
  unresolved: unresolved ?? [],
};
}

// ── Main Export ──────────────────────────────────────────────────────────────

export async function cleanifyPlaylist(
  token: string,
  userId: string,
  playlistId: string,
  playlistName: string
): Promise<CleanifyReport> {
  const tracks = await fetchAllTracks(
    token,
    playlistId
  );

  return cleanifyTracksInternal(
    token,
    userId,
    tracks,
    playlistName
  );
}

export async function cleanifyTracks(
  token: string,
  userId: string,
  tracks: Track[],
  playlistName: string
): Promise<CleanifyReport> {
  return cleanifyTracksInternal(
    token,
    userId,
    tracks,
    playlistName
  );
}
