import "express-session";

declare module "express-session" {
  interface SessionData {
    accessToken: string;
    codeVerifier: string;
  }
}

import express from "express";
import axios from "axios";
import { cleanifyPlaylist } from "./cleanify.service";

const router = express.Router();

function spotifyHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function handleSpotifyError(
  error: any,
  res: express.Response,
  fallbackMessage: string
) {
  console.error(error.response?.data || error.message);
  const status = error.response?.status || 500;
  const data = error.response?.data || { error: fallbackMessage };
  res.status(status).json(data);
}

// GET /spotify/me
router.get("/me", async (req, res) => {
  const token = (req as any).spotifyToken;
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: spotifyHeaders(token),
    });
    res.json(response.data);
  } catch (error: any) {
    handleSpotifyError(error, res, "Failed to fetch profile");
  }
});

// GET /spotify/playlists
// Returns full playlist objects including images, owner, track count
router.get("/playlists", async (req, res) => {
  const token = (req as any).spotifyToken;
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/playlists?limit=50",
      { headers: spotifyHeaders(token) }
    );
    // Pass the full Spotify response through — frontend needs images, owner, etc.
    res.json(response.data);
  } catch (error: any) {
    handleSpotifyError(error, res, "Failed to fetch playlists");
  }
});

// GET /spotify/playlists/:playlistId/tracks
router.get("/playlists/:playlistId/tracks", async (req, res) => {
  const token = (req as any).spotifyToken;
  const { playlistId } = req.params;
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/items`,
      { headers: spotifyHeaders(token) }
    );

    const tracks = response.data.items
      .filter((item: any) => item.item)
      .map((item: any) => ({
        id: item.item.id,
        name: item.item.name,
        artists: item.item.artists.map((artist: any) => artist.name),
        album: item.item.album.name,
        explicit: item.item.explicit,
        uri: item.item.uri,
      }));

    res.json(tracks);
  } catch (error: any) {
    handleSpotifyError(error, res, "Failed to fetch playlist tracks");
  }
});

// POST /spotify/playlists/:playlistId/cleanify
router.post("/playlists/:playlistId/cleanify", async (req, res) => {
  const token = (req as any).spotifyToken;
  const { playlistId } = req.params;

  try {
    const meResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: spotifyHeaders(token),
    });
    const userId: string = meResponse.data.id;

    const playlistResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: spotifyHeaders(token),
        params: { fields: "name" },
      }
    );
    const playlistName: string = playlistResponse.data.name;

    const report = await cleanifyPlaylist(token, userId, playlistId, playlistName);

    res.json(report);
  } catch (error: any) {
    handleSpotifyError(error, res, "Failed to cleanify playlist");
  }
});

export default router;